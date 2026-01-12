import { useState } from "react";
import OrderList from "@/orders/OrderList";
import OrderDetail from "@/orders/OrderDetail";
import OrderEditDialog from "@/orders/OrderEditDialog";
import DeleteOrderDialog from "@/components/confirmations/DeleteOrderDialog";
import VehicleFormDialog from "@/vehicles/VehicleFormDialog";
import OrderPrintPreview from "@/orders/OrderPrintPreview";
import AssignVehicleToOrderDialog from "@/orders/AssignVehicleToOrderDialog";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { orderService } from "@/services/orderService";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useVehicleContext } from "@/vehicles/VehicleContext";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

const OrderListPage = () => {
  const { user } = useAuth();
  const { triggerRefresh } = useVehicleContext();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [vehicleAssignDialogOpen, setVehicleAssignDialogOpen] = useState(false); // State cho dialog gán xe
  const [orderToAssignVehicle, setOrderToAssignVehicle] = useState(null); // Đơn hàng đang gán xe
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState(null);

  // Xử lý tạo đơn hàng mới
  const handleCreateOrder = () => {
    setEditingOrder(null); // null = chế độ tạo mới
    setEditDialogOpen(true);
  };

  // Keyboard shortcut: Ctrl+M to create new order
  useKeyboardShortcut("m", handleCreateOrder, { ctrl: true });

  // Xử lý sửa đơn hàng
  const handleEdit = (order) => {
    setEditingOrder(order);
    setEditDialogOpen(true);
  };

  // Xử lý gán xe cho đơn hàng
  const handleAssignVehicle = (order) => {
    setOrderToAssignVehicle(order);
    setVehicleAssignDialogOpen(true);
  };

  // Xử lý khi gán xe thành công
  const handleAssignVehicleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    // Nếu đang select đơn hàng vừa gán, reload lại thông tin đơn hàng đó
    if (
      selectedOrder &&
      orderToAssignVehicle &&
      selectedOrder._id === orderToAssignVehicle._id
    ) {
      orderService.getOrder(selectedOrder._id).then((updatedOrder) => {
        setSelectedOrder(updatedOrder);
      });
    }
  };

  // Xử lý xóa đơn hàng
  const handleDelete = (order) => {
    setDeletingOrder(order);
    setDeleteDialogOpen(true);
  };

  // Xác nhận xóa đơn hàng
  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await orderService.deleteOrder(deletingOrder._id);
      toast.success("Xóa đơn hàng thành công!");
      setDeleteDialogOpen(false);

      if (selectedOrder?._id === deletingOrder._id) {
        setSelectedOrder(null);
      }

      setRefreshTrigger((prev) => prev + 1);
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

  const handleEditSuccess = () => {
    if (
      selectedOrder &&
      editingOrder &&
      selectedOrder._id === editingOrder._id
    ) {
      orderService.getOrder(selectedOrder._id).then((updatedOrder) => {
        setSelectedOrder(updatedOrder);
      });
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  const handlePrint = (order) => {
    setOrderToPrint(order);
    setPrintPreviewOpen(true);
  };

  return (
    <div className="container mx-auto p-4 max-w-none">
      <PageHeader
        title="Quản lý Đơn hàng & Xe"
        subtitle="Quản lý quy trình gán đơn và vận chuyển"
        currentPage="orders"
        onCreateOrder={handleCreateOrder}
        onCreateVehicle={() => setOpenVehicleDialog(true)}
        user={user}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Cột trái: Danh sách đơn hàng */}
        <Card className="lg:col-span-3 border-none shadow-md overflow-hidden bg-gray-50/50">
          <CardContent className="p-4">
            <OrderList
              key={user?._id}
              selectedOrder={selectedOrder}
              onSelectOrder={setSelectedOrder}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAssign={handleAssignVehicle}
              refreshTrigger={refreshTrigger}
            />
          </CardContent>
        </Card>

        {/* Cột phải: Chi tiết đơn hàng */}
        <Card className="col-span-9 border-none shadow-md">
          <CardContent className="p-4">
            <OrderDetail
              order={selectedOrder}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPrint={handlePrint}
            />
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <OrderEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        order={editingOrder}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Dialog */}
      <DeleteOrderDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        order={deletingOrder}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />

      {/* Vehicle Creation Dialog */}
      <VehicleFormDialog
        open={openVehicleDialog}
        onOpenChange={setOpenVehicleDialog}
        onSuccess={triggerRefresh}
      />

      {/* Assign Vehicle Dialog */}
      <AssignVehicleToOrderDialog
        open={vehicleAssignDialogOpen}
        onOpenChange={setVehicleAssignDialogOpen}
        order={orderToAssignVehicle}
        onSuccess={handleAssignVehicleSuccess}
      />

      {/* Print Preview Dialog */}
      <OrderPrintPreview
        open={printPreviewOpen}
        onOpenChange={setPrintPreviewOpen}
        selectedOrders={orderToPrint ? [orderToPrint] : []}
      />
    </div>
  );
};

export default OrderListPage;
