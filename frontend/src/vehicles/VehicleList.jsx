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

  useEffect(() => {
    fetchVehicles();
  }, [refreshTrigger]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách xe");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setEditDialogOpen(true);
  };

  const handleDelete = (vehicle) => {
    setDeletingVehicle(vehicle);
    setDeleteDialogOpen(true);
  };

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

  if (loading) return <div className="text-center py-4">Đang tải...</div>;
  if (error)
    return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <>
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
                isSelected={selectedVehicle?._id === vehicle._id}
                onSelect={onSelectVehicle}
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
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        vehicle={deletingVehicle}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </>
  );
};

export default VehicleList;
