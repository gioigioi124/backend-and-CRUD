# API Quản lý Thiếu Hàng và Đơn Bù

## Tổng quan

Hệ thống quản lý thiếu hàng cho phép:

- Tự động tính toán số lượng thiếu khi tổ trưởng xác nhận
- Tạo đơn bù với validation chặt chẽ
- Bỏ qua thiếu hàng
- Truy vấn danh sách thiếu còn lại

## Schema

### Order Item Fields

```javascript
{
  // Các trường cơ bản
  quantity: Number,              // Số lượng đặt
  leaderConfirm: {
    value: Number,               // Số lượng thực tế giao
    confirmedAt: Date
  },

  // Quản lý thiếu hàng
  shortageQty: Number,           // = max(quantity - leaderConfirm.value, 0)
  compensatedQty: Number,        // Tổng số đã bù
  shortageStatus: String,        // "OPEN" | "CLOSED" | "IGNORED"

  // Cho đơn bù
  sourceItemId: ObjectId,        // Trỏ về item gốc (chỉ dùng cho đơn bù)
  sourceOrderId: ObjectId        // Trỏ về order gốc (chỉ dùng cho đơn bù)
}
```

### Order Fields

```javascript
{
  isCompensationOrder: Boolean; // true nếu là đơn bù
}
```

## API Endpoints

### 1. Tạo Đơn Bù

**POST** `/api/shortages/compensate`

Tạo đơn bù hàng với validation:

- Không cho bù vượt quá số thiếu còn lại
- Tự động cập nhật `compensatedQty` của item gốc
- Tự động đóng (CLOSED) khi bù đủ

**Request Body:**

```json
{
  "customer": {
    "name": "Khách hàng A",
    "customerCode": "KH001",
    "address": "123 ABC",
    "phone": "0123456789",
    "note": ""
  },
  "orderDate": "2026-01-08T00:00:00.000Z",
  "items": [
    {
      "sourceOrderId": "677d1234567890abcdef1234",
      "sourceItemId": "677d1234567890abcdef5678",
      "productName": "Gấp 3 A Vimatt",
      "size": "160x200",
      "unit": "tấm",
      "quantity": 5,
      "warehouse": "K01",
      "cmQty": 0,
      "note": "Bù thiếu đợt 1"
    }
  ]
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Tạo đơn bù thành công",
  "data": {
    "_id": "677d9876543210fedcba9876",
    "customer": {...},
    "items": [...],
    "isCompensationOrder": true,
    "orderDate": "2026-01-08T00:00:00.000Z",
    "createdAt": "2026-01-08T09:55:19.000Z"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Item \"Gấp 3 A Vimatt\": Số lượng bù (10) vượt quá số thiếu còn lại (5)"
}
```

**Validation Rules:**

1. Mỗi item bù phải có `sourceOrderId` và `sourceItemId`
2. Item gốc phải tồn tại
3. Item gốc không được có status `IGNORED` hoặc `CLOSED`
4. `quantity` bù không được vượt quá `shortageQty - compensatedQty`
5. Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu

---

### 2. Bỏ Qua Thiếu Hàng

**PUT** `/api/shortages/ignore`

Đánh dấu một item thiếu là IGNORED (không cần bù nữa).

**Request Body:**

```json
{
  "orderId": "677d1234567890abcdef1234",
  "itemId": "677d1234567890abcdef5678"
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Đã bỏ qua thiếu hàng",
  "data": {
    "_id": "677d1234567890abcdef1234",
    "items": [
      {
        "_id": "677d1234567890abcdef5678",
        "shortageStatus": "IGNORED",
        ...
      }
    ]
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Item đã đóng, không thể bỏ qua"
}
```

---

### 3. Lấy Danh Sách Thiếu Còn Lại

**GET** `/api/shortages/remaining`

Lấy danh sách các item còn thiếu (status = OPEN và shortageQty > compensatedQty).

**Query Parameters:**

- `customerId` (optional): Lọc theo khách hàng
- `warehouse` (optional): Lọc theo kho (K01, K02, K03, K04)
- `fromDate` (optional): Lọc từ ngày
- `toDate` (optional): Lọc đến ngày

**Example:**

```
GET /api/shortages/remaining?warehouse=K01&fromDate=2026-01-01
```

**Response Success (200):**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "orderId": "677d1234567890abcdef1234",
      "orderDate": "2026-01-08T00:00:00.000Z",
      "customer": {
        "name": "Khách hàng A",
        "customerCode": "KH001",
        "address": "123 ABC",
        "phone": "0123456789"
      },
      "vehicle": {
        "_id": "677d...",
        "licensePlate": "51A-12345",
        "driver": "Nguyễn Văn A"
      },
      "createdBy": {
        "_id": "677d...",
        "name": "Admin",
        "email": "admin@example.com"
      },
      "shortageItems": [
        {
          "itemId": "677d1234567890abcdef5678",
          "stt": 1,
          "productName": "Gấp 3 A Vimatt",
          "size": "160x200",
          "unit": "tấm",
          "quantity": 10,
          "leaderConfirm": 5,
          "shortageQty": 5,
          "compensatedQty": 0,
          "remainingShortage": 5,
          "warehouse": "K01",
          "note": ""
        }
      ]
    }
  ]
}
```

---

## Quy Trình Sử Dụng

### 1. Tạo Đơn Gốc và Xác Nhận

```javascript
// 1. Tạo đơn hàng bình thường
POST /orders
{
  customer: {...},
  items: [
    { productName: "Gấp 3 A", quantity: 10, ... }
  ]
}

// 2. Tổ trưởng xác nhận số lượng thực tế
PUT /orders/:orderId/items/:itemIndex/confirm-leader
{
  value: 7  // Chỉ giao được 7, thiếu 3
}

// => Hệ thống tự động tính:
// shortageQty = max(10 - 7, 0) = 3
// shortageStatus = "OPEN"
```

### 2. Tạo Đơn Bù

```javascript
// Lấy danh sách thiếu
GET /api/shortages/remaining?warehouse=K01

// Tạo đơn bù cho item thiếu
POST /api/shortages/compensate
{
  customer: {...},
  items: [
    {
      sourceOrderId: "...",
      sourceItemId: "...",
      quantity: 2  // Bù 2 trong số 3 thiếu
    }
  ]
}

// => Hệ thống tự động:
// - compensatedQty của item gốc += 2 (0 -> 2)
// - shortageStatus vẫn là "OPEN" (vì 2 < 3)
```

### 3. Bù Đủ hoặc Bỏ Qua

```javascript
// Bù đủ phần còn lại
POST /api/shortages/compensate
{
  items: [
    { sourceOrderId: "...", sourceItemId: "...", quantity: 1 }
  ]
}
// => compensatedQty = 3, shortageStatus = "CLOSED"

// HOẶC bỏ qua
PUT /api/shortages/ignore
{
  orderId: "...",
  itemId: "..."
}
// => shortageStatus = "IGNORED"
```

---

## Logic Tự Động

### Khi Tổ Trưởng Xác Nhận

```javascript
// Trong confirmLeader()
const shortage = Math.max(item.quantity - leaderConfirmValue, 0);
item.shortageQty = shortage;

if (shortage === 0) {
  item.shortageStatus = "CLOSED";
} else if (item.compensatedQty >= shortage) {
  item.shortageStatus = "CLOSED";
} else if (item.shortageStatus !== "IGNORED") {
  item.shortageStatus = "OPEN";
}
```

### Khi Tạo Đơn Bù

```javascript
// Validate
const remainingShortage = sourceItem.shortageQty - sourceItem.compensatedQty;
if (compensateQty > remainingShortage) {
  throw Error("Vượt quá số thiếu");
}

// Update
sourceItem.compensatedQty += compensateQty;
if (sourceItem.compensatedQty >= sourceItem.shortageQty) {
  sourceItem.shortageStatus = "CLOSED";
}
```

---

## Testing

### Test Case 1: Tạo đơn bù thành công

```bash
# 1. Tạo order gốc
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer": {"name": "Test Customer"},
    "items": [{"productName": "Test", "quantity": 10, "unit": "tấm", "warehouse": "K01"}]
  }'

# 2. Confirm leader (giao 7, thiếu 3)
curl -X PUT http://localhost:3000/orders/{orderId}/items/0/confirm-leader \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"value": 7}'

# 3. Tạo đơn bù 2 tấm
curl -X POST http://localhost:3000/api/shortages/compensate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer": {"name": "Test Customer"},
    "items": [{
      "sourceOrderId": "{orderId}",
      "sourceItemId": "{itemId}",
      "quantity": 2,
      "productName": "Test",
      "unit": "tấm",
      "warehouse": "K01"
    }]
  }'

# Expected: Success, compensatedQty = 2, status = OPEN
```

### Test Case 2: Bù vượt quá (phải fail)

```bash
curl -X POST http://localhost:3000/api/shortages/compensate \
  -d '{"items": [{"sourceOrderId": "...", "sourceItemId": "...", "quantity": 10}]}'

# Expected: Error 400 "vượt quá số thiếu còn lại"
```

### Test Case 3: Query remaining shortages

```bash
curl -X GET "http://localhost:3000/api/shortages/remaining?warehouse=K01" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: Danh sách các item có shortageQty > compensatedQty
```

---

## Notes

1. **Transaction Safety**: Tạo đơn bù sử dụng MongoDB transaction để đảm bảo tính toàn vẹn
2. **Idempotency**: Nếu cần, có thể thêm trường `compensationOrderId` vào item gốc để track
3. **Audit Trail**: Có thể thêm array `compensationHistory` để lưu lịch sử bù
4. **Permissions**: Cần thêm role-based access control cho các API này
