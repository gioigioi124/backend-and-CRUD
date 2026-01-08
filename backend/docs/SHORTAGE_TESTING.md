# Test Shortage Management System

## Test Scenario: Tạo đơn thiếu và bù hàng

### 1. Tạo đơn gốc

```bash
POST http://localhost:3000/orders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "customer": {
    "name": "Khách hàng Test",
    "customerCode": "KH001",
    "address": "123 Test Street",
    "phone": "0123456789"
  },
  "orderDate": "2026-01-08",
  "items": [
    {
      "stt": 1,
      "productName": "Gấp 3 A Vimatt",
      "size": "160x200",
      "unit": "tấm",
      "quantity": 10,
      "warehouse": "K01",
      "cmQty": 0
    }
  ]
}
```

### 2. Tổ trưởng xác nhận (giao 7, thiếu 3)

```bash
PUT http://localhost:3000/orders/{orderId}/items/0/confirm-leader
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "value": 7
}

# Kết quả tự động:
# - shortageQty = 3
# - compensatedQty = 0
# - shortageStatus = "OPEN"
```

### 3. Lấy danh sách thiếu hàng

```bash
GET http://localhost:3000/api/shortages/remaining?customerName=Khách hàng Test
Authorization: Bearer YOUR_TOKEN

# Response:
{
  "success": true,
  "count": 1,
  "data": [
    {
      "orderId": "...",
      "orderDate": "2026-01-08",
      "customer": {
        "name": "Khách hàng Test",
        ...
      },
      "shortageItems": [
        {
          "itemId": "...",
          "productName": "Gấp 3 A Vimatt",
          "size": "160x200",
          "unit": "tấm",
          "quantity": 10,
          "leaderConfirm": 7,
          "shortageQty": 3,
          "compensatedQty": 0,
          "remainingShortage": 3,
          "warehouse": "K01"
        }
      ]
    }
  ]
}
```

### 4. Tạo đơn bù (bù 2 tấm)

```bash
POST http://localhost:3000/api/shortages/compensate
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "customer": {
    "name": "Khách hàng Test",
    "customerCode": "KH001",
    "address": "123 Test Street",
    "phone": "0123456789"
  },
  "orderDate": "2026-01-08",
  "items": [
    {
      "sourceOrderId": "{orderId từ bước 1}",
      "sourceItemId": "{itemId từ bước 3}",
      "productName": "Gấp 3 A Vimatt",
      "size": "160x200",
      "unit": "tấm",
      "quantity": 2,
      "warehouse": "K01",
      "cmQty": 0,
      "note": "Bù thiếu đợt 1"
    }
  ]
}

# Kết quả:
# - Tạo đơn bù mới với isCompensationOrder = true
# - Item gốc: compensatedQty = 2, shortageStatus = "OPEN" (vì 2 < 3)
```

### 5. Kiểm tra lại danh sách thiếu

```bash
GET http://localhost:3000/api/shortages/remaining?customerName=Khách hàng Test
Authorization: Bearer YOUR_TOKEN

# Response:
{
  "data": [
    {
      "shortageItems": [
        {
          "shortageQty": 3,
          "compensatedQty": 2,
          "remainingShortage": 1,  ← Còn thiếu 1
          ...
        }
      ]
    }
  ]
}
```

### 6. Bù đủ phần còn lại (1 tấm)

```bash
POST http://localhost:3000/api/shortages/compensate
...
{
  "items": [
    {
      "sourceOrderId": "...",
      "sourceItemId": "...",
      "quantity": 1,  ← Bù 1 tấm còn lại
      ...
    }
  ]
}

# Kết quả:
# - compensatedQty = 3
# - shortageStatus = "CLOSED" (vì 3 >= 3)
```

### 7. Kiểm tra lại - không còn thiếu

```bash
GET http://localhost:3000/api/shortages/remaining?customerName=Khách hàng Test

# Response:
{
  "count": 0,
  "data": []  ← Không còn thiếu
}
```

---

## Test Case: Bỏ qua thiếu hàng

### 1. Tạo đơn thiếu (tương tự bước 1-2 ở trên)

### 2. Bỏ qua thiếu

```bash
PUT http://localhost:3000/api/shortages/ignore
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "orderId": "{orderId}",
  "itemId": "{itemId}"
}

# Kết quả:
# - shortageStatus = "IGNORED"
```

### 3. Kiểm tra - không còn trong danh sách

```bash
GET http://localhost:3000/api/shortages/remaining

# Response: Không có item này (vì status = IGNORED)
```

---

## Test Case: Validation - Bù vượt quá

```bash
POST http://localhost:3000/api/shortages/compensate
...
{
  "items": [
    {
      "quantity": 10,  ← Vượt quá số thiếu (3)
      ...
    }
  ]
}

# Response: Error 400
{
  "success": false,
  "message": "Item \"Gấp 3 A Vimatt\": Số lượng bù (10) vượt quá số thiếu còn lại (3)"
}
```

---

## Frontend Test: OrderEditDialog

### 1. Mở dialog tạo đơn mới

- Nhập tên khách hàng "Khách hàng Test"
- Danh sách thiếu hàng tự động hiển thị

### 2. Kiểm tra hiển thị

```
Hàng còn thiếu từ đơn cũ [1]

Gấp 3 A Vimatt (160x200)
Kho: K01 • Đã bù: 0/3 • Còn thiếu: 3 tấm
[Thêm] [Bỏ qua]
```

### 3. Click "Thêm"

- Item tự động thêm vào bảng với quantity = 3
- Item biến mất khỏi danh sách thiếu (vì đã thêm vào đơn)
- Toast: "Đã thêm 'Gấp 3 A Vimatt' vào đơn hàng"

### 4. Submit đơn

- Đơn được tạo với sourceOrderId và sourceItemId
- Backend tự động cập nhật compensatedQty

### 5. Mở lại dialog

- Danh sách thiếu cập nhật: "Đã bù: 3/3" hoặc không hiển thị nữa

### 6. Test "Bỏ qua"

- Click "Bỏ qua"
- Item biến mất khỏi danh sách
- Toast: "Đã bỏ qua thiếu hàng 'Gấp 3 A Vimatt'"

---

## Notes

1. **Auto-hide**: Item đã thêm vào đơn sẽ tạm thời ẩn khỏi danh sách (dùng `addedShortageIds`)
2. **Real-time update**: Mỗi lần mở dialog sẽ fetch lại danh sách thiếu mới nhất
3. **Validation**: Backend validate chặt chẽ, không cho bù vượt quá
4. **Transaction**: Tạo đơn bù dùng transaction để đảm bảo tính toàn vẹn
