import { useEffect, useState } from "react";
import { toast } from "sonner";
import VehicleItem from "./VehicleItem";
import VehicleFormDialog from "./VehicleFormDialog";
import DeleteVehicleDialog from "./DeleteVehicleDialog";
import { vehicleService } from "@/services/vehicleService";
import { useVehicleContext } from "./VehicleContext";

const VehicleList = ({ selectedVehicle, onSelectVehicle }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshTrigger } = useVehicleContext();

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  //chạy lại data khi sửa, xóa, thêm xe
  useEffect(() => {
    fetchVehicles();
  }, [refreshTrigger]);

  //tải danh sách xe
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAllVehicles();
      //Mảng giá trị của các xe
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách xe");
      console.log("Không thể tải xe", err.message);
    } finally {
      setLoading(false);
    }
  };

  //edit xe
  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setEditDialogOpen(true);
  };

  //delete xe
  const handleDelete = (vehicle) => {
    setDeletingVehicle(vehicle);
    setDeleteDialogOpen(true);
  };

  //xác nhận delete xe
  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await vehicleService.deleteVehicle(deletingVehicle._id);
      toast.success("Xóa xe thành công!");
      setDeleteDialogOpen(false);
      fetchVehicles();

      // Nếu xe đang được chọn thì bỏ chọn
      if (selectedVehicle?._id === deletingVehicle._id) {
        onSelectVehicle(null);
      }
    } catch (error) {
      toast.error(
        "Xóa xe thất bại: " + (error.response?.data?.message || error.message)
      );
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  //loading và error
  if (loading) return <div className="text-center py-4">Đang tải...</div>;
  if (error)
    return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <>
      {/* map để tạo hàng loạt xe ra frontend */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Danh sách xe</h2>
        {vehicles.length === 0 ? (
          <p className="text-gray-500 text-center">Chưa có xe nào</p>
        ) : (
          <div className="space-y-2 ">
            {vehicles.map((vehicle) => (
              <VehicleItem
                key={vehicle._id}
                vehicle={vehicle}
                // props onSelect trong VehicleItem, sẽ lấy hết dữ liệu của Vehicle
                //lúc này onSelectVehicle sẽ có giá trị của Vehicle
                //truyền onSelectVehicle ra ngoài để gọi hàm setSelectVehicle(vehicle) để setSelectVehicle có thuộc tính _id
                onSelect={onSelectVehicle}
                // lúc này có thể lấy selectedVehicle?._id đem ra so sánh rồi
                isSelected={selectedVehicle?._id === vehicle._id}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
      {/* Edit Dialog */}
      <VehicleFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchVehicles}
        editData={editingVehicle}
      />
      {/* Delete Dialog */}
      <DeleteVehicleDialog
        //trả về true false để mở dialog
        open={deleteDialogOpen}
        //trả về true false vì trong dialog có sẵn hàm onOpenChange
        onOpenChange={setDeleteDialogOpen}
        //deletingVehicle chính là giá trị vehicle
        vehicle={deletingVehicle}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </>
  );
};

export default VehicleList;
