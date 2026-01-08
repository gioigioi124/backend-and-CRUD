# Test Case: Bù Hàng Với Số Lượng Thay Đổi

## Tình Huống

Khách hàng "Chính Lan Thái Bình" có đơn thiếu 4 cái, nhưng khi tạo đơn bù:

- Thêm 4 cái vào đơn
- Sửa thành 3 cái (vì chỉ có 3 cái trong kho)
- Leader confirm chỉ giao được 2 cái

## Kết Quả Mong Đợi

1. **Đơn gốc**:

   - Thiếu ban đầu: 4 cái
   - Đã bù: 3 cái (số lượng trong đơn bù)
   - Còn thiếu: 1 cái (4 - 3)
   - Status: OPEN

2. **Đơn bù**:

   - Đặt: 3 cái
   - Giao: 2 cái
   - Thiếu: 1 cái (3 - 2)
   - Status: OPEN (đây là thiếu MỚI)

3. **Khi tạo đơn mới tiếp theo**:
   - Hiển thị 2 dòng thiếu:
     - Đơn gốc: còn thiếu 1 cái (đã bù 3/4)
     - Đơn bù: còn thiếu 1 cái (đã bù 0/1)

## Quy Trình Test

### Bước 1: Tạo đơn gốc

```
Khách hàng: Chính Lan Thái Bình
Item: gấp 3 Alias 5F (160x200)
Quantity: 4 cái
```

### Bước 2: Leader confirm đơn gốc

```
Leader confirm: 0 cái (không giao được)
→ shortageQty = 4
→ compensatedQty = 0
→ shortageStatus = OPEN
```

### Bước 3: Tạo đơn bù lần 1

1. Mở dialog tạo đơn mới
2. Nhập khách hàng "Chính Lan Thái Bình"
3. Thấy hiển thị:

   ```
   Hàng còn thiếu từ đơn cũ [1]

   gấp 3 Alias 5F (160x200)
   Kho: K04 • Đã bù: 0/4 • Còn thiếu: 4 cái
   [Thêm] [Bỏ qua]
   ```

4. Click "Thêm" → Item tự động thêm vào bảng với quantity = 4
5. **Sửa quantity từ 4 thành 3** (vì chỉ có 3 trong kho)
6. Submit đơn

**Kết quả:**

- Tạo đơn bù với `isCompensationOrder = true`
- Đơn gốc: `compensatedQty = 3`, `shortageStatus = OPEN` (vì 3 < 4)
- Toast: "Tạo đơn bù thành công!"

### Bước 4: Leader confirm đơn bù

```
Leader confirm: 2 cái (chỉ giao được 2)
→ shortageQty = 1 (3 - 2)
→ compensatedQty = 0
→ shortageStatus = OPEN
```

### Bước 5: Kiểm tra danh sách thiếu

1. Mở dialog tạo đơn mới
2. Nhập khách hàng "Chính Lan Thái Bình"
3. Thấy hiển thị:

   ```
   Hàng còn thiếu từ đơn cũ [2]

   gấp 3 Alias 5F (160x200)
   Kho: K04 • Đã bù: 3/4 • Còn thiếu: 1 cái
   [Thêm] [Bỏ qua]

   gấp 3 Alias 5F (160x200)  ← Từ đơn bù
   Kho: K04 • Đã bù: 0/1 • Còn thiếu: 1 cái
   [Thêm] [Bỏ qua]
   ```

## Validation Test

### Test 1: Bù vượt quá số thiếu

1. Thêm item thiếu 4 cái vào đơn
2. Sửa quantity thành 5 cái
3. Submit
4. **Kết quả**: Toast error "Số lượng bù (5) vượt quá số thiếu còn lại (4)"

### Test 2: Bù đúng số lượng

1. Thêm item thiếu 4 cái vào đơn
2. Sửa quantity thành 3 cái
3. Submit
4. **Kết quả**: Thành công, đơn gốc `compensatedQty = 3`

### Test 3: Bù đủ

1. Đơn gốc còn thiếu 1 cái
2. Tạo đơn bù 1 cái
3. Submit
4. **Kết quả**: Đơn gốc `compensatedQty = 4`, `shortageStatus = CLOSED`

## API Calls

### Tạo đơn bù

```javascript
POST /api/shortages/compensate
{
  "customer": {
    "name": "Chính Lan Thái Bình",
    ...
  },
  "orderDate": "2026-01-08",
  "items": [
    {
      "sourceOrderId": "695f248f22327d5708508d76",
      "sourceItemId": "695f248f22327d5708508d77",
      "productName": "gấp 3 Alias 5F",
      "size": "160x200",
      "unit": "cái",
      "quantity": 3,  ← Đã sửa từ 4 thành 3
      "warehouse": "K04",
      "cmQty": 0,
      "note": ""
    }
  ]
}
```

### Response

```javascript
{
  "success": true,
  "message": "Tạo đơn bù thành công",
  "data": {
    "_id": "...",
    "isCompensationOrder": true,
    "items": [
      {
        "quantity": 3,
        "sourceOrderId": "695f248f22327d5708508d76",
        "sourceItemId": "695f248f22327d5708508d77",
        ...
      }
    ]
  }
}
```

## Database Changes

### Đơn gốc (sau khi bù 3 cái)

```javascript
{
  "_id": "695f248f22327d5708508d76",
  "items": [
    {
      "_id": "695f248f22327d5708508d77",
      "quantity": 4,
      "leaderConfirm": { "value": 0 },
      "shortageQty": 4,
      "compensatedQty": 3,  ← Cập nhật
      "shortageStatus": "OPEN"  ← Vẫn OPEN vì 3 < 4
    }
  ]
}
```

### Đơn bù (sau khi leader confirm 2)

```javascript
{
  "_id": "...",
  "isCompensationOrder": true,
  "items": [
    {
      "quantity": 3,
      "leaderConfirm": { "value": 2 },
      "shortageQty": 1,  ← Tự động tính
      "compensatedQty": 0,
      "shortageStatus": "OPEN",
      "sourceOrderId": "695f248f22327d5708508d76",
      "sourceItemId": "695f248f22327d5708508d77"
    }
  ]
}
```

## Notes

1. **Số lượng bù = quantity trong đơn bù**, không phải remainingShortage
2. **Validation frontend** ngăn user bù vượt quá
3. **Validation backend** double-check để đảm bảo an toàn
4. **Đơn bù cũng có thể bị thiếu**, tạo ra thiếu mới
5. **Cascade shortage**: Thiếu → Bù → Thiếu mới → Bù tiếp...
