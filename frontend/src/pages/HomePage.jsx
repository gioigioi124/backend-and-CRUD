import VehicleList from "@/vehicles/VehicleList";
import VehicleOrderList from "@/orders/VehicleOrderList";
import OrderDetail from "@/orders/OrderDetail";
import AssignOrderDialog from "@/orders/AssignOrderDialog";
import OrderEditDialog from "@/orders/OrderEditDialog";
import DeleteOrderDialog from "@/orders/DeleteOrderDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useVehicleContext } from "@/vehicles/VehicleContext";
import { toast } from "sonner";
import { orderService } from "@/services/orderService";

const HomePage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { triggerRefresh: triggerVehicleRefresh } = useVehicleContext();

  // Xử lý khi gán đơn thành công
  const handleAssignSuccess = () => {
    // Trigger refresh danh sách đơn của xe
    setRefreshTrigger((prev) => prev + 1);
    // Trigger refresh danh sách xe để cập nhật số lượng đơn hàng
    triggerVehicleRefresh();
    // Refresh selectedOrder nếu cần
    if (selectedOrder) {
      // Có thể fetch lại order nếu cần
    }
  };

  // Xử lý khi bỏ gán đơn
  const handleUnassign = () => {
    // Trigger refresh danh sách đơn của xe
    setRefreshTrigger((prev) => prev + 1);
    // Trigger refresh danh sách xe để cập nhật số lượng đơn hàng
    triggerVehicleRefresh();
    // Nếu đơn đang được chọn thì bỏ chọn
    setSelectedOrder(null);
  };

  // Xử lý khi mở dialog tạo đơn mới
  const handleCreateOrder = () => {
    setOrderToEdit(null); // null = chế độ tạo mới
    setEditDialogOpen(true);
  };

  // Xử lý khi mở dialog sửa đơn
  const handleEdit = (order) => {
    setOrderToEdit(order);
    setEditDialogOpen(true);
  };

  // Xử lý khi sửa đơn thành công
  const handleEditSuccess = async () => {
    // Trigger refresh danh sách đơn của xe
    setRefreshTrigger((prev) => prev + 1);
    // Trigger refresh danh sách xe
    triggerVehicleRefresh();
    // Cập nhật selectedOrder nếu đang chọn đơn vừa sửa
    if (selectedOrder && orderToEdit && selectedOrder._id === orderToEdit._id) {
      try {
        const updatedOrder = await orderService.getOrder(orderToEdit._id);
        setSelectedOrder(updatedOrder);
      } catch (error) {
        console.error("Không thể tải lại đơn hàng:", error);
      }
    }
  };

  // Xử lý khi mở dialog xóa đơn
  const handleDelete = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  // Xử lý xác nhận xóa đơn
  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    try {
      setDeleteLoading(true);
      await orderService.deleteOrder(orderToDelete._id);
      toast.success("Xóa đơn hàng thành công!");

      // Đóng dialog
      setDeleteDialogOpen(false);

      // Trigger refresh danh sách đơn của xe
      setRefreshTrigger((prev) => prev + 1);
      // Trigger refresh danh sách xe
      triggerVehicleRefresh();

      // Bỏ chọn đơn nếu đang chọn đơn vừa xóa
      if (selectedOrder && selectedOrder._id === orderToDelete._id) {
        setSelectedOrder(null);
      }

      // Reset orderToDelete
      setOrderToDelete(null);
    } catch (error) {
      toast.error(
        "Xóa đơn hàng thất bại: " +
          (error.response?.data?.message || error.message)
      );
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-none">
      {/* Header với nút Tạo đơn hàng */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng và xe</h1>
        <Button onClick={handleCreateOrder}>Tạo đơn hàng mới</Button>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
        {/* Cột 1: Danh sách xe */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4 overflow-y-auto">
          <VehicleList
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
          />
        </div>

        {/* Cột 2: Danh sách đơn hàng trong xe */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4 overflow-y-auto">
          <VehicleOrderList
            vehicle={selectedVehicle}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            onUnassign={handleUnassign}
            onAssignClick={() => setAssignDialogOpen(true)}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Cột 3: Chi tiết đơn hàng */}
        <div className="col-span-6 bg-white rounded-lg shadow p-4 overflow-y-auto">
          <OrderDetail
            order={selectedOrder}
            onEdit={handleEdit}
            onDelete={handleDelete}
            vehicle={selectedVehicle}
            onUnassign={handleUnassign}
          />
        </div>
      </div>

      {/* Dialog gán đơn vào xe */}
      <AssignOrderDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        vehicle={selectedVehicle}
        onSuccess={handleAssignSuccess}
      />

      {/* Dialog sửa đơn hàng */}
      <OrderEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        order={orderToEdit}
        onSuccess={handleEditSuccess}
      />

      {/* Dialog xóa đơn hàng */}
      <DeleteOrderDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        order={orderToDelete}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
};

export default HomePage;
