## Logic trong VehicleItem với các props

1. Props vehicle

- Là gì: Object chứa toàn bộ thông tin của 1 xe
- Dùng để làm gì: Hiển thị thông tin xe
- Được lấy từ đâu: VehicleList.jsx

```
  vehicles.map((vehicle) => (<VehicleItem vehicle={vehicle} />)) // ← Truyền object xe
```

2. Props isSelected

- Là gì: Boolean (true/false) cho biết xe này có đang được chọn không
- Dùng để làm gì: Đổi màu nền khi được chọn.

```
  className={`... ${
  isSelected
    ? 'bg-blue-50 border-blue-500'  // ← Xe đang chọn: màu xanh
    : 'hover:bg-gray-50'             // ← Xe khác: màu xám khi hover
}`}
```

- Được lấy từ đâu: VehicleList.jsx

```
  <VehicleItem isSelected={selectedVehicle?.\_id === vehicle.\_id}  />
  // ↓
  // So sánh ID xe đang chọn với ID xe hiện tại
  // Nếu trùng → true
  // Nếu khác → false

```

3. Props onSelect

- Là gì: Function để thông báo "Tôi vừa được click!"
- Đến từ đâu: VehicleList.jsx

```
  <VehicleItem onSelect={onSelectVehicle} /> // ← Function từ VehicleList

// VehicleList nhận từ HomePage
const VehicleList = ({ onSelectVehicle }) => { ... }

// HomePage truyền xuống
<VehicleList onSelectVehicle={setSelectedVehicle} /> // ← setState từ HomePage
```

- Để làm gì:

```
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

```
### **Hình ảnh hóa:**

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
```

4. Props onEdit

- Là gì: Function để mở dialog chỉnh sửa xe
- Đến từ đâu: VehicleList.jsx

```
  const handleEdit = (vehicle) => {
  setEditingVehicle(vehicle); // ← Lưu xe đang edit
  setEditDialogOpen(true); // ← Mở dialog
  };
```

```
<VehicleItem onEdit={handleEdit} /> // ← Truyền function này
```

- Để làm gì:

```
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
```

5. Props onDelete

- Là gì: Function để mở dialog xác nhận xóa xe
- Đến từ đâu: VehicleList.jsx

```
  const handleDelete = (vehicle) => {
  setDeletingVehicle(vehicle); // ← Lưu xe đang xóa
  setDeleteDialogOpen(true); // ← Mở dialog confirm
  };

<VehicleItem onDelete={handleDelete}/>  // ← Truyền function này
```

- Để làm gì:

```
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

```
┌─────────────────────────────────────────────────────────┐
│                      HomePage                           │
│  - selectedVehicle (state)                              │
│  - setSelectedVehicle (function)                        │
└─────────────────┬───────────────────────────────────────┘
                  │ Props truyền xuống
                  ↓
┌─────────────────────────────────────────────────────────┐
│                    VehicleList                          │
│  - Nhận: selectedVehicle, onSelectVehicle               │
│  - Map: vehicles.map(vehicle => ...)                    │
│  - Tạo: handleEdit, handleDelete                        │
└─────────────────┬───────────────────────────────────────┘
                  │ Props truyền xuống cho mỗi item
                  ↓
┌─────────────────────────────────────────────────────────┐
│                   VehicleItem (1 xe)                    │
│                                                         │
│  Props nhận được:                                       │
│  • vehicle → Dữ liệu xe (object)                        │
│  • isSelected → Có đang chọn? (boolean)                 │
│  • onSelect → Khi click vào xe (function)               │
│  • onEdit → Khi click nút Sửa (function)                │
│  • onDelete → Khi click nút Xóa (function)              │
│                                                         │
│  Hành động:                                             │
│  [Click vào xe] → onSelect(vehicle)                     │
│  [Click Sửa]    → onEdit(vehicle)                       │
│  [Click Xóa]    → onDelete(vehicle)                     │
└─────────────────────────────────────────────────────────┘
```

## Logic và workflow trong VehicleList

# STATE (Dữ liệu local)

```
const [vehicles, setVehicles] = useState([]);
Mục đích: Lưu danh sách tất cả xe từ API

const [loading, setLoading] = useState(true);
Mục đích: Hiển thị "Đang tải..." khi fetch data

const [error, setError] = useState(null);
Mục đích: Lưu lỗi nếu fetch thất bại

const [editDialogOpen, setEditDialogOpen] = useState(false);
Mục đích: Mở/đóng dialog sửa xe

const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
Mục đích: Mở/đóng dialog xác nhận xóa

const [editingVehicle, setEditingVehicle] = useState(null);
Mục đích: Lưu xe đang được sửa (để truyền vào dialog)

const [deletingVehicle, setDeletingVehicle] = useState(null);
Mục đích: Lưu xe đang bị xóa (để hiển thị tên trong confirm)

const [deleteLoading, setDeleteLoading] = useState(false);
Mục đích: Disable nút khi đang xóa

```

# PROPS (Nhận từ component cha)

```
const VehicleList = ({ selectedVehicle, onSelectVehicle }) => {}

selectedVehicle: Xe đang được chọn (từ HomePage)
onSelectVehicle: Function để update xe được chọn (từ HomePage) gọi setSelectVehicle để truyền (vehicle) vào

```

# CONTEXT

```

const { refreshTrigger } = useVehicleContext();
refreshTrigger: Số đếm để trigger refresh danh sách (tăng lên khi tạo xe mới)
```

## Logic phần VehicleFormDialog

PROPS (Nhận từ component cha)

```
const VehicleFormDialog = ({ open, onOpenChange, onSuccess, editData }) => {}

open: Boolean - Dialog có đang mở không? (true/false)
onOpenChange: Function - Đóng/mở dialog từ bên ngoài
onSuccess: Function - Gọi khi tạo/sửa thành công (để refresh danh sách)
editData: Object hoặc null - Dữ liệu xe cần sửa (null = tạo mới)

```

# STATE (Dữ liệu local)

```
const [loading, setLoading] = useState(false);

Mục đích: Disable nút submit khi đang xử lý

const [formData, setFormData] = useState({
  carName: "",
  weight: "",
  time: "",
  destination: "",
  note: "",
});

Mục đích: Lưu dữ liệu form người dùng đang nhập
```

# BIẾN PHỤ

```
const isEditMode = !!editData;

Mục đích: Kiểm tra đang ở chế độ Sửa hay Tạo mới

editData = null → isEditMode = false (Tạo mới)
editData = {...} → isEditMode = true (Sửa)
```

# FUNCTIONS

```
1.
const handleChange = (field, value) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
};

Nhiệm vụ: Cập nhật 1 field trong form
Ví dụ: handleChange("carName", "Tranpo 1") → formData.carName = "Tranpo 1"

2.
const handleSubmit = async (e) => {
  // Validation
  // Gọi API (create hoặc update)
  // Reset form
  // Đóng dialog
  // Trigger refresh
};
Nhiệm vụ: Xử lý khi submit form

3.
editData lấy dữ liệu vehicle từ vehicleList

useEffect(() => {
  if (editData) {
    setFormData({ ...editData }); // Load dữ liệu cũ
  } else {
    setFormData({ carName: "", ... }); // Reset form
  }
}, [editData, open]);

Nhiệm vụ: Load data khi mở dialog sửa / Reset khi mở dialog tạo mới

```

```
const handleChange = (field, value) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
};

Nhiệm vụ: Cập nhật 1 field trong form
Ví dụ: handleChange("carName", "Tranpo 1") → formData.carName = "Tranpo 1"
```

```
const handleSubmit = async (e) => {
  // Validation
  // Gọi API (create hoặc update)
  // Reset form
  // Đóng dialog
  // Trigger refresh
};

Nhiệm vụ: Xử lý khi submit form
```

useEffect

```
useEffect(() => {
  if (editData) {
    setFormData({ ...editData }); // Load dữ liệu cũ
  } else {
    setFormData({ carName: "", ... }); // Reset form
  }
}, [editData, open]);

Nhiệm vụ: Load data khi mở dialog sửa / Reset khi mở dialog tạo mới
```

# LUỒNG DỮ LIỆU CẬP NHẬT XE

- Bước 1: User click "Sửa" ở VehicleItem

```
// VehicleList.jsx
const handleEdit = (vehicle) => {
  setEditingVehicle(vehicle);  // Lưu xe: { _id: "abc", carName: "Tranpo 1", ... }
  setEditDialogOpen(true);     // Mở dialog
};

<VehicleFormDialog
  open={editDialogOpen}         // true → Dialog mở
  editData={editingVehicle}     // Truyền data xe vào
/>
```

- Bước 2: Dialog nhận editData → Load vào form

```
// VehicleFormDialog.jsx
useEffect(() => {
 if (editData) {  // editData = { _id: "abc", carName: "Tranpo 1", ... }
   setFormData({
     carName: editData.carName,      // "Tranpo 1"
     weight: editData.weight,        // "5T"
     time: editData.time,            // "8h30"
     destination: editData.destination,
     note: editData.note
   });
 }
}, [editData, open]);

Kết quả: Form được điền sẵn dữ liệu cũ ✅
```

- Bước 3: User chỉnh sửa input

```
<Input
 value={formData.carName}  // "Tranpo 1"
 onChange={(e) => handleChange("carName", e.target.value)}
/>

// User đổi thành "Tranpo 1 Updated"
handleChange("carName", "Tranpo 1 Updated")
↓
setFormData({ ...formData, carName: "Tranpo 1 Updated" })

Kết quả: formData.carName = "Tranpo 1 Updated" ✅
```

- Bước 4: User click "Cập nhật"

```
const handleSubmit = async (e) => {
 e.preventDefault();

 // 1. Validation
 if (!formData.carName || !formData.weight || ...) {
   toast.error("Thiếu thông tin");
   return;
 }

 // 2. Gọi API
 setLoading(true);

 if (isEditMode) {  // editData có giá trị → Chế độ sửa
   await vehicleService.updateVehicle(
     editData._id,    // "abc" - ID xe cần update
     formData         // { carName: "Tranpo 1 Updated", ... }
   );
   toast.success("Cập nhật thành công!");
 } else {
   await vehicleService.createVehicle(formData);
   toast.success("Tạo mới thành công!");
 }

 // 3. Reset form
 setFormData({ carName: "", weight: "", ... });

 // 4. Đóng dialog
 onOpenChange(false);

 // 5. Trigger refresh danh sách
 onSuccess?.();  // Gọi fetchVehicles() trong VehicleList

 setLoading(false);
};
```

- Bước 5: API gửi request lên Backend

```
// vehicleService.js
updateVehicle: async (id, vehicleData) => {
  const response = await api.put(`/vehicles/${id}`, vehicleData);
  //                           ↓
  // PUT http://localhost:3000/vehicles/abc
  // Body: { carName: "Tranpo 1 Updated", weight: "5T", ... }

  return response.data;
}

```

- Bước 6: Backend xử lý

```
// Backend: vehiclesController.js
export const updateVehicle = async (req, res) => {
  const { id } = req.params;           // "abc"
  const updatedData = req.body;        // { carName: "Tranpo 1 Updated", ... }

  const vehicle = await Vehicle.findByIdAndUpdate(id, updatedData, { new: true });
  //                                     ↓
  // MongoDB: Tìm document có _id = "abc" → Cập nhật → Trả về document mới

  res.status(200).json(vehicle);
};
```

- Bước 7: Frontend nhận response → Refresh

```
// VehicleFormDialog
await vehicleService.updateVehicle(...);  // ✅ Thành công
onSuccess?.();  // Gọi fetchVehicles()

// VehicleList
const fetchVehicles = async () => {
  const data = await vehicleService.getAllVehicles();  // GET /vehicles
  setVehicles(data);  // Cập nhật danh sách với data mới từ DB
};

**Kết quả:** Danh sách xe hiển thị "Tranpo 1 Updated" ✅
```

## **FLOW DIAGRAM**

```
User click "Sửa"
    ↓
VehicleList: handleEdit(vehicle)
    ↓
setEditingVehicle(vehicle) + setEditDialogOpen(true)
    ↓
Dialog mở với editData = vehicle
    ↓
useEffect: Load editData vào formData
    ↓
User chỉnh sửa input
    ↓
handleChange → Update formData
    ↓
User click "Cập nhật"
    ↓
handleSubmit:
  - Validation ✅
  - API: PUT /vehicles/abc với formData
  - Backend: findByIdAndUpdate
  - Response: Document đã cập nhật
  - onSuccess() → fetchVehicles()
  - GET /vehicles → Lấy danh sách mới
  - setVehicles(data)
    ↓
UI hiển thị data mới ✅
```
