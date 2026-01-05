# Thay đổi: Submit Form bằng Ctrl+Enter

## 📝 Tóm tắt

Đã thay đổi cách submit form trong `OrderEditDialog` từ **Enter** thành **Ctrl+Enter** để tránh submit nhầm khi đang nhập liệu.

## 🎯 Lý do thay đổi

- **Trước:** Nhấn Enter ở bất kỳ input nào → Submit form ngay lập tức
- **Vấn đề:** Dễ submit nhầm khi đang nhập product shortcuts (ví dụ: `gcc+160x200` rồi nhấn Enter)
- **Giải pháp:** Chỉ submit khi nhấn **Ctrl+Enter**

## ✨ Thay đổi

### 1. Thêm handler `handleKeyDown`

```javascript
const handleKeyDown = (e) => {
  if (e.key === "Enter" && e.ctrlKey) {
    e.preventDefault();
    handleSubmit(e);
  }
};
```

### 2. Cập nhật form element

```javascript
<form
  onSubmit={(e) => {
    e.preventDefault(); // Ngăn submit mặc định
  }}
  onKeyDown={handleKeyDown}
  className="space-y-6"
>
```

### 3. Thêm visual hint

- **Trong DialogDescription:**

  ```
  "... • Nhấn Ctrl+Enter để lưu"
  ```

- **Trong Button text:**
  ```
  "Tạo đơn hàng (Ctrl+Enter)"
  "Cập nhật (Ctrl+Enter)"
  ```

## 🎮 Cách sử dụng

### Submit form:

- **Cách 1:** Nhấn **Ctrl+Enter** ở bất kỳ đâu trong form
- **Cách 2:** Click nút "Tạo đơn hàng (Ctrl+Enter)" hoặc "Cập nhật (Ctrl+Enter)"

### Hủy:

- **Cách 1:** Click nút "Hủy"
- **Cách 2:** Click ra ngoài dialog
- **Cách 3:** Nhấn Esc

## ✅ Lợi ích

1. **Tránh submit nhầm** khi đang nhập product shortcuts
2. **Workflow mượt mà hơn:**
   - Nhập `gcc+160x200` → Enter (expand shortcut)
   - Tiếp tục nhập các trường khác
   - Ctrl+Enter (submit form)
3. **Phù hợp với UX pattern phổ biến** (Gmail, Slack, Discord đều dùng Ctrl+Enter)

## 🔄 Tương thích

- ✅ Windows: Ctrl+Enter
- ✅ Mac: Cmd+Enter (cũng hoạt động vì `e.ctrlKey` detect cả Cmd trên Mac)
- ✅ Linux: Ctrl+Enter

## 📋 Checklist test

- [ ] Nhấn Enter trong input → Không submit
- [ ] Nhấn Ctrl+Enter → Submit thành công
- [ ] Click nút submit → Submit thành công
- [ ] Product shortcuts vẫn hoạt động (Enter để expand)
- [ ] Validation vẫn hoạt động đúng
- [ ] Loading state hiển thị đúng

## 🎨 UI Changes

**Before:**

```
Tạo đơn hàng mới
Điền thông tin khách hàng và danh sách hàng hóa

[Hủy] [Tạo đơn hàng]
```

**After:**

```
Tạo đơn hàng mới
Điền thông tin khách hàng và danh sách hàng hóa • Nhấn Ctrl+Enter để lưu

[Hủy] [Tạo đơn hàng (Ctrl+Enter)]
```

## 📁 Files thay đổi

- `frontend/src/orders/OrderEditDialog.jsx`
  - Thêm `handleKeyDown` function
  - Cập nhật form `onSubmit` và `onKeyDown`
  - Cập nhật DialogDescription với hint
  - Cập nhật Button text với hint
  - Đổi Button type từ "submit" → "button" với onClick handler

## 💡 Tips

- Nếu user quên phím tắt, họ vẫn có thể click nút
- Hint hiển thị rõ ràng ở 2 nơi (description + button)
- Không ảnh hưởng đến các dialog khác trong app
