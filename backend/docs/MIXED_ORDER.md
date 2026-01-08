# Đơn Hỗn Hợp (Mixed Order)

## 🎯 Khái Niệm

**Đơn hỗn hợp** = Đơn hàng chứa cả **items bù** (có `sourceOrderId`) và **items thường** (không có `sourceOrderId`) trong cùng 1 đơn.

## ✨ Tính Năng

### **1. Tạo Đơn Linh Hoạt**

User có thể:

- ✅ Thêm items thiếu từ đơn cũ (items bù)
- ✅ Thêm items mới (items thường)
- ✅ Submit 1 lần → Tạo 1 đơn duy nhất

### **2. Backend Tự Động Xử Lý**

- Items có `sourceOrderId` → Cập nhật `compensatedQty` của đơn gốc
- Items không có `sourceOrderId` → Thêm vào đơn như bình thường
- Sử dụng **transaction** để đảm bảo tính toàn vẹn

### **3. Validation Chặt Chẽ**

- Kiểm tra số lượng bù không vượt quá `remainingShortage`
- Tự động cập nhật `shortageStatus` của đơn gốc
- Rollback nếu có lỗi

## 📊 Ví Dụ

### **Tình Huống**

Khách hàng "Cửa hàng A" cần:

- Bù 5 cái "gấp 3 Alias 5F" từ đơn cũ (thiếu)
- Thêm 10 cái "gấp 3 Vimatt 9F" mới

### **Cách Cũ (Phải Tạo 2 Đơn)**

```
Đơn 1 (Đơn bù):
- gấp 3 Alias 5F: 5 cái (bù)

Đơn 2 (Đơn thường):
- gấp 3 Vimatt 9F: 10 cái (mới)
```

### **Cách Mới (Đơn Hỗn Hợp)**

```
Đơn duy nhất:
- gấp 3 Alias 5F: 5 cái (bù) ← có sourceOrderId
- gấp 3 Vimatt 9F: 10 cái (mới) ← không có sourceOrderId
```

## 🔧 Implementation

### **Backend Logic**

```javascript
// createOrder hỗ trợ đơn hỗn hợp
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, ...orderData } = req.body;

    // Phân loại items
    const compensationItems = items.filter(
      (item) => item.sourceOrderId && item.sourceItemId
    );

    // Xử lý items bù
    for (const item of compensationItems) {
      // Validate và cập nhật compensatedQty
      const sourceOrder = await Order.findById(item.sourceOrderId).session(
        session
      );
      const sourceItem = sourceOrder.items.id(item.sourceItemId);

      sourceItem.compensatedQty += item.quantity;

      if (sourceItem.compensatedQty >= sourceItem.shortageQty) {
        sourceItem.shortageStatus = "CLOSED";
      }

      await sourceOrder.save({ session });
    }

    // Tạo đơn (chứa cả items bù và items thường)
    const order = await Order.create(
      [
        {
          ...orderData,
          items, // TẤT CẢ items
          createdBy: req.user._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(order[0]);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
```

### **Frontend Logic**

```javascript
// Đơn giản - luôn gọi createOrder
const orderData = {
  customer,
  items, // Có thể chứa cả items bù và items thường
  orderDate,
  vehicle: null,
};

await orderService.createOrder(orderData);

// Toast message thông minh
const hasCompensationItems = items.some((item) => item.sourceOrderId);
const normalItems = items.filter((item) => !item.sourceOrderId);

if (hasCompensationItems && normalItems.length > 0) {
  toast.success("Tạo đơn hỗn hợp thành công!");
} else if (hasCompensationItems) {
  toast.success("Tạo đơn bù thành công!");
} else {
  toast.success("Tạo đơn hàng thành công!");
}
```

## 📋 Database Structure

### **Đơn Hỗn Hợp**

```javascript
{
  "_id": "...",
  "customer": { "name": "Cửa hàng A" },
  "isCompensationOrder": false, // Vẫn là đơn thường
  "items": [
    {
      // Item bù
      "productName": "gấp 3 Alias 5F",
      "quantity": 5,
      "sourceOrderId": "695f...", // ← Có sourceOrderId
      "sourceItemId": "695f...",
      "shortageQty": 0,
      "compensatedQty": 0
    },
    {
      // Item thường
      "productName": "gấp 3 Vimatt 9F",
      "quantity": 10,
      "sourceOrderId": null, // ← Không có sourceOrderId
      "sourceItemId": null,
      "shortageQty": 0,
      "compensatedQty": 0
    }
  ]
}
```

### **Đơn Gốc (Sau Khi Bù)**

```javascript
{
  "_id": "695f...",
  "items": [
    {
      "_id": "695f...",
      "productName": "gấp 3 Alias 5F",
      "quantity": 10,
      "leaderConfirm": { "value": 5 },
      "shortageQty": 5,
      "compensatedQty": 5, // ← Đã cập nhật
      "shortageStatus": "CLOSED" // ← Đã đóng
    }
  ]
}
```

## 🎨 UI/UX

### **Khi Tạo Đơn**

```
┌─────────────────────────────────────────┐
│ Hàng còn thiếu từ đơn cũ [2]            │
│                                         │
│ gấp 3 Alias 5F (160x200)                │
│ Kho: K04 • Còn thiếu: 5 cái             │
│ [Thêm] [Bỏ qua]                         │
│                                         │
│ gấp 3 Vimatt 9F (180x200)               │
│ Kho: K04 • Còn thiếu: 3 cái             │
│ [Thêm] [Bỏ qua]                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Danh sách hàng hóa                      │
│                                         │
│ 1. gấp 3 Alias 5F (160x200) - 5 cái    │ ← Từ shortage
│ 2. gấp 3 Vimatt 9F (180x200) - 3 cái   │ ← Từ shortage
│ 3. gấp 3 See 7F (200x220) - 10 cái     │ ← Thêm mới
└─────────────────────────────────────────┘

[Hủy] [Lưu đơn hàng]
```

### **Toast Message**

```
✓ Tạo đơn hỗn hợp thành công (có cả hàng bù và hàng mới)!
```

## ⚡ Lợi Ích

### **1. Giảm Số Lượng Đơn**

- Trước: 2 đơn (1 bù + 1 thường)
- Sau: 1 đơn (hỗn hợp)

### **2. Tiện Lợi Cho User**

- Không cần tạo 2 đơn riêng
- Chỉ cần nhập thông tin khách hàng 1 lần
- Submit 1 lần

### **3. Dễ Quản Lý**

- Tất cả hàng của 1 khách hàng trong 1 đơn
- Dễ tracking và in phiếu
- Giảm confusion

### **4. Vẫn Tracking Được**

- Items có `sourceOrderId` → Biết được là bù
- Backend vẫn cập nhật `compensatedQty` đúng
- Báo cáo vẫn chính xác

## 🔒 Validation

### **1. Số Lượng Bù**

```javascript
if (quantity > remainingShortage) {
  throw new Error("Số lượng bù vượt quá số thiếu còn lại");
}
```

### **2. Transaction**

```javascript
// Rollback nếu có lỗi
try {
  // Cập nhật đơn gốc
  // Tạo đơn mới
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
}
```

### **3. Frontend Validation**

```javascript
if (item.sourceOrderId && item.maxCompensateQty) {
  if (item.quantity > item.maxCompensateQty) {
    toast.error("Số lượng bù vượt quá số thiếu còn lại");
    return;
  }
}
```

## 📊 So Sánh

| Tính Năng                 | Đơn Bù Thuần Túy     | Đơn Hỗn Hợp |
| ------------------------- | -------------------- | ----------- |
| Items bù                  | ✅                   | ✅          |
| Items thường              | ❌                   | ✅          |
| Số đơn tạo                | 2 (nếu có cả 2 loại) | 1           |
| `isCompensationOrder`     | `true`               | `false`     |
| Cập nhật `compensatedQty` | ✅                   | ✅          |
| Validation                | ✅                   | ✅          |
| Transaction               | ✅                   | ✅          |

## 🚀 Migration

Không cần migration! Đơn cũ vẫn hoạt động bình thường:

- Đơn bù cũ: `isCompensationOrder = true`, chỉ có items bù
- Đơn mới: `isCompensationOrder = false`, có thể có cả 2 loại items

## 📝 Notes

1. **Không set `isCompensationOrder = true`** cho đơn hỗn hợp
2. **Backend tự động phân loại** items bù và items thường
3. **Frontend chỉ cần gọi `createOrder`** cho mọi trường hợp
4. **Toast message thông minh** dựa trên loại items trong đơn
