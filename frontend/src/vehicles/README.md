## Logic trong VehicleItem với các props

1. Props vehicle

- Là gì: Object chứa toàn bộ thông tin của 1 xe
- Dùng để làm gì: Hiển thị thông tin xe
- Được lấy từ đâu: VehicleList.jsx

  vehicles.map((vehicle) => (
  <VehicleItem
  vehicle={vehicle} // ← Truyền object xe
  />
  ))

2. Props isSelected

- Là gì: Boolean (true/false) cho biết xe này có đang được chọn không
- Dùng để làm gì: Đổi màu nền khi được chọn.
  className={`... ${
  isSelected
    ? 'bg-blue-50 border-blue-500'  // ← Xe đang chọn: màu xanh
    : 'hover:bg-gray-50'             // ← Xe khác: màu xám khi hover
}`}

- Được lấy từ đâu: VehicleList.jsx
  <VehicleItem
  isSelected={selectedVehicle?.\_id === vehicle.\_id}
  // ↓
  // So sánh ID xe đang chọn với ID xe hiện tại
  // Nếu trùng → true
  // Nếu khác → false
  />

3. Props onSelect

- Là gì: Function để thông báo "Tôi vừa được click!"
- Đến từ đâu:
  // VehicleList.jsx
  <VehicleItem onSelect={onSelectVehicle} /> // ← Function từ VehicleList

// VehicleList nhận từ HomePage
const VehicleList = ({ onSelectVehicle }) => { ... }

// HomePage truyền xuống
<VehicleList onSelectVehicle={setSelectedVehicle} /> // ← setState từ HomePage

- Để làm gì:

// 1. User click vào xe

<div onClick={() => onSelect(vehicle)}>
  {/* Click vào đây */}
</div>

// 2. onSelect được gọi
onSelect(vehicle)
// ↓
onSelectVehicle(vehicle) // ← Từ VehicleList
// ↓
setSelectedVehicle(vehicle) // ← Từ HomePage
// ↓
selectedVehicle = vehicle // ← State trong HomePage được update
// ↓
Re-render → VehicleList nhận selectedVehicle mới
// ↓
isSelected được tính lại
// ↓
Xe vừa click có màu xanh ✅

```
### **Hình ảnh hóa:**
```

User Click
↓
VehicleItem: onSelect(vehicle)
↓
VehicleList: onSelectVehicle(vehicle)
↓
HomePage: setSelectedVehicle(vehicle)
↓
State thay đổi → Re-render
↓
Xe được highlight

4. Props onEdit

- Là gì: Function để mở dialog chỉnh sửa xe
- Đến từ đâu: VehicleList.jsx
  const handleEdit = (vehicle) => {
  setEditingVehicle(vehicle); // ← Lưu xe đang edit
  setEditDialogOpen(true); // ← Mở dialog
  };

<VehicleItem
onEdit={handleEdit} // ← Truyền function này
/>

- Để làm gì:
  // 1. User click nút "Sửa"
  <Button onClick={(e) => {
  e.stopPropagation(); // ← Ngăn không trigger onSelect ở thẻ cha
  onEdit(vehicle); // ← Gọi onEdit
  }}>
  Sửa
  </Button>

// 2. Chạy qua các bước
onEdit(vehicle)
// ↓
handleEdit(vehicle) // ← Trong VehicleList
// ↓
setEditingVehicle(vehicle) // ← Lưu xe đang edit
setEditDialogOpen(true) // ← Mở dialog
// ↓
<VehicleFormDialog editData={editingVehicle} />
// ↓
Dialog hiển thị với data của xe ✅

5. Props onDelete

- Là gì: Function để mở dialog xác nhận xóa xe
- Đến từ đâu: VehicleList.jsx
  const handleDelete = (vehicle) => {
  setDeletingVehicle(vehicle); // ← Lưu xe đang xóa
  setDeleteDialogOpen(true); // ← Mở dialog confirm
  };

<VehicleItem
onDelete={handleDelete} // ← Truyền function này
/>

- Để làm gì:
  // 1. User click nút "Xóa"
  <Button onClick={(e) => {
  e.stopPropagation(); // ← Ngăn không trigger onSelect
  onDelete(vehicle); // ← Gọi onDelete
  }}>
  Xóa
  </Button>

// 2. Chạy qua các bước
onDelete(vehicle)
// ↓
handleDelete(vehicle) // ← Trong VehicleList
// ↓
setDeletingVehicle(vehicle) // ← Lưu xe đang xóa
setDeleteDialogOpen(true) // ← Mở dialog confirm
// ↓
<DeleteVehicleDialog vehicle={deletingVehicle} />
// ↓
Dialog hiển thị "Bạn có chắc muốn xóa Tranpo 1?"
// ↓
User click "Xóa"
// ↓
confirmDelete() → API call → Xóa thành công ✅

## Tóm tắt toàn bộ workflow:

```
┌─────────────────────────────────────────────────────────┐
│                      HomePage                           │
│  - selectedVehicle (state)                             │
│  - setSelectedVehicle (function)                       │
└─────────────────┬───────────────────────────────────────┘
                  │ Props truyền xuống
                  ↓
┌─────────────────────────────────────────────────────────┐
│                    VehicleList                          │
│  - Nhận: selectedVehicle, onSelectVehicle              │
│  - Map: vehicles.map(vehicle => ...)                   │
│  - Tạo: handleEdit, handleDelete                       │
└─────────────────┬───────────────────────────────────────┘
                  │ Props truyền xuống cho mỗi item
                  ↓
┌─────────────────────────────────────────────────────────┐
│                   VehicleItem (1 xe)                    │
│                                                         │
│  Props nhận được:                                       │
│  • vehicle → Dữ liệu xe (object)                       │
│  • isSelected → Có đang chọn? (boolean)                │
│  • onSelect → Khi click vào xe (function)              │
│  • onEdit → Khi click nút Sửa (function)               │
│  • onDelete → Khi click nút Xóa (function)             │
│                                                         │
│  Hành động:                                             │
│  [Click vào xe] → onSelect(vehicle)                    │
│  [Click Sửa]    → onEdit(vehicle)                      │
│  [Click Xóa]    → onDelete(vehicle)                    │
└─────────────────────────────────────────────────────────┘
```
