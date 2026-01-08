# Test Case: Cascade Shortage (Thiếu Dây Chuyền)

## Tình Huống

Đơn bù cũng có thể bị thiếu, tạo ra "thiếu mới" cần được bù tiếp.

## Quy Trình

### Bước 1: Đơn gốc thiếu 6 cái

```
Khách hàng: Cửa hàng Nam Thúy
Item: gấp 3 Alias 5F (160x200)
Quantity: 6 cái
Leader confirm: 0 cái

→ shortageQty = 6
→ compensatedQty = 0
→ shortageStatus = OPEN
```

### Bước 2: Tạo đơn bù lần 1 (bù 6 cái)

```
Tạo đơn bù:
- Thêm 6 cái vào đơn
- Submit

→ Đơn gốc: compensatedQty = 6, shortageStatus = CLOSED ✓
→ Đơn bù: isCompensationOrder = true
```

### Bước 3: Leader confirm đơn bù (chỉ giao được 3)

```
Leader confirm đơn bù: 3 cái

→ Đơn bù:
  - quantity = 6
  - leaderConfirm = 3
  - shortageQty = 3 (6 - 3)
  - compensatedQty = 0
  - shortageStatus = OPEN ← Thiếu MỚI!
```

### Bước 4: Kiểm tra danh sách thiếu

```
Mở dialog tạo đơn mới → Nhập "Cửa hàng Nam Thúy"

Hiển thị:
┌─────────────────────────────────────────────┐
│ Hàng còn thiếu từ đơn cũ [1]                │
│                                             │
│ gấp 3 Alias 5F (160x200) [Đơn bù]          │
│ Kho: K04 • Đã bù: 0/3 • Còn thiếu: 3 cái   │
│ [Thêm] [Bỏ qua]                             │
└─────────────────────────────────────────────┘
```

**Lưu ý:**

- Badge "Đơn bù" màu xanh để phân biệt
- Đây là thiếu từ đơn bù, không phải đơn gốc
- Đơn gốc đã CLOSED (đã bù đủ 6/6)

### Bước 5: Tạo đơn bù lần 2 (bù cho đơn bù)

```
Click "Thêm" → Thêm 3 cái vào đơn
Submit

→ Đơn bù lần 1: compensatedQty = 3, shortageStatus = CLOSED ✓
→ Đơn bù lần 2: isCompensationOrder = true
```

### Bước 6: Nếu đơn bù lần 2 cũng thiếu...

```
Leader confirm đơn bù lần 2: 2 cái

→ Đơn bù lần 2:
  - shortageQty = 1 (3 - 2)
  - shortageStatus = OPEN ← Thiếu MỚI lần nữa!

→ Có thể tạo đơn bù lần 3...
```

## Cascade Chain (Dây Chuyền Thiếu)

```
Đơn gốc (thiếu 6)
    ↓ bù 6
Đơn bù #1 (thiếu 3)
    ↓ bù 3
Đơn bù #2 (thiếu 1)
    ↓ bù 1
Đơn bù #3 (giao đủ)
    ✓ Kết thúc
```

## API Response

### GET /api/shortages/remaining?customerName=Cửa hàng Nam Thúy

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "orderId": "695f28ffd34c0c360ddddfbc",
      "orderDate": "2026-01-08",
      "customer": {
        "name": "Cửa hàng Nam Thúy - 0913.017.727"
      },
      "isCompensationOrder": true,  ← Đánh dấu đơn bù
      "shortageItems": [
        {
          "itemId": "695f28ffd34c0c360ddddfbd",
          "productName": "gấp 3 Alias 5F",
          "size": "160x200",
          "unit": "cái",
          "quantity": 6,
          "leaderConfirm": 3,
          "shortageQty": 3,
          "compensatedQty": 0,
          "remainingShortage": 3,
          "warehouse": "K04"
        }
      ]
    }
  ]
}
```

## Database State

### Đơn gốc (đã đóng)

```javascript
{
  "_id": "...",
  "isCompensationOrder": false,
  "items": [
    {
      "quantity": 6,
      "leaderConfirm": { "value": 0 },
      "shortageQty": 6,
      "compensatedQty": 6,  ← Đã bù đủ
      "shortageStatus": "CLOSED"  ← Đã đóng
    }
  ]
}
```

### Đơn bù #1 (đang thiếu)

```javascript
{
  "_id": "...",
  "isCompensationOrder": true,  ← Đơn bù
  "items": [
    {
      "quantity": 6,
      "leaderConfirm": { "value": 3 },
      "shortageQty": 3,  ← Thiếu mới
      "compensatedQty": 0,
      "shortageStatus": "OPEN",  ← Đang mở
      "sourceOrderId": "...",  ← Trỏ về đơn gốc
      "sourceItemId": "..."
    }
  ]
}
```

## Logic Quan Trọng

### 1. Lấy TẤT CẢ đơn có shortage

```javascript
const query = {
  // KHÔNG filter isCompensationOrder
  "items.shortageStatus": "OPEN",
};
```

### 2. Phân biệt đơn gốc và đơn bù

```javascript
{
  isCompensationOrder: order.isCompensationOrder || false;
}
```

### 3. Hiển thị badge

```jsx
{
  item.isCompensationOrder && (
    <span className="bg-blue-100 text-blue-800">Đơn bù</span>
  );
}
```

## Lợi Ích

1. **Tracking đầy đủ**: Biết được thiếu từ đâu (gốc hay bù)
2. **Cascade support**: Bù được nhiều lần cho đến khi đủ
3. **Transparent**: User thấy rõ nguồn gốc của shortage
4. **Flexible**: Có thể bỏ qua bất kỳ shortage nào

## Notes

- Đơn bù có thể tạo ra thiếu mới → cần bù tiếp
- Không giới hạn số lần bù (cascade vô hạn)
- Mỗi đơn bù đều có `sourceOrderId` và `sourceItemId`
- Badge "Đơn bù" giúp phân biệt nhanh
