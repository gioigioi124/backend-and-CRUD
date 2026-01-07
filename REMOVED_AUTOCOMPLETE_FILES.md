# Files liên quan đến chức năng gõ nhanh (Autocomplete)

## Tổng quan

Dưới đây là danh sách các file liên quan đến chức năng gõ nhanh/autocomplete cho input "Tên hàng hóa" trong `ItemsTable.jsx`. Các file này đã được BỎ KHỎI code để bạn có thể làm lại từ đầu.

## Các file chính

### 1. `frontend/src/config/productShortcuts.js`

- **Mô tả**: File cấu hình chứa tất cả các mã tắt sản phẩm
- **Chức năng**:
  - Định nghĩa object `PRODUCT_SHORTCUTS` với các mã tắt như "gcc+", "gcc", "vg", "g3a05", etc.
  - Hàm `getProductShortcut(input)` để tìm kiếm và áp dụng shortcut
  - Hàm `parsePattern()` để parse pattern với regex
- **Trạng thái**: File vẫn còn nhưng không được sử dụng
- **Kích thước**: 738 dòng, 20KB

### 2. `frontend/src/components/config/ShortcutManagerDialog.jsx`

- **Mô tả**: Dialog component để quản lý shortcuts
- **Chức năng**: UI để xem, thêm, sửa, xóa các shortcuts
- **Trạng thái**: File vẫn còn nhưng không được sử dụng trong ItemsTable
- **Lưu ý**: File này có thể được mở từ OrderEditDialog (có button để mở dialog này)

### 3. `frontend/src/orders/ItemsTable.jsx`

- **Đã xóa**:
  - Import: `import { getProductShortcut } from "@/config/productShortcuts";`
  - Function: `handleProductNameChange(index, value)` - Xử lý khi người dùng nhập
  - Function: `handleProductNameBlur(index, value)` - Xử lý khi blur hoặc Enter (áp dụng shortcut)
  - Function: `handleProductNameKeyDown(e, index, value)` - Xử lý phím Enter/Tab
  - Event handlers: `onBlur`, `onKeyDown` trên Input component
- **Còn lại**:
  - Input component chỉ có `onChange` đơn giản gọi `updateItem(index, "productName", e.target.value)`
  - Placeholder đã đổi từ "Nhập tên hàng hóa hoặc mã tắt" thành "Nhập tên hàng hóa"

## Logic cũ đã hoạt động như thế nào

1. **Khi người dùng gõ**: `handleProductNameChange` được gọi, cập nhật state
2. **Khi người dùng blur hoặc Enter**: `handleProductNameBlur` được gọi
   - Gọi `getProductShortcut(value)` để tìm shortcut
   - Nếu tìm thấy, tự động điền các field: productName, warehouse, unit, size, note, cmQty
   - Tự động tính `cmQty = quantity * cmQtyPerUnit`
3. **Pattern matching**: Hỗ trợ regex để parse input phức tạp (ví dụ: "gcc+160x200tm571")

## Component có thể tham khảo

### `frontend/src/components/CustomerAutocomplete.jsx`

- Component autocomplete cho khách hàng
- Có thể tham khảo để làm autocomplete cho product
- Tính năng: dropdown suggestions, keyboard navigation, search multi-field

## Các file có thể giữ lại

Bạn có thể QUỶT ĐỊNH:

- **GIỮ**: `productShortcuts.js` - Nếu bạn vẫn muốn sử dụng data shortcuts này
- **GIỮ**: `ShortcutManagerDialog.jsx` - Nếu bạn vẫn muốn có UI quản lý shortcuts
- **XÓA**: Nếu bạn muốn thiết kế lại hoàn toàn từ đầu

## Ghi chú

- Tất cả code autocomplete đã được BỎ KHỎI `ItemsTable.jsx`
- Input hiện tại chỉ là input text đơn giản
- Không còn lint error
- Code đã clean và ready để implement lại chức năng mới
