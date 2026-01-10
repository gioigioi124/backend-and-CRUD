import { useState } from "react";
import { Link } from "react-router";
import OrderList from "@/orders/OrderList";
import OrderDetail from "@/orders/OrderDetail";
import OrderEditDialog from "@/orders/OrderEditDialog";
import DeleteOrderDialog from "@/components/confirmations/DeleteOrderDialog";
import VehicleFormDialog from "@/vehicles/VehicleFormDialog";
import OrderPrintPreview from "@/orders/OrderPrintPreview";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/orderService";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  PlusCircle,
  Truck,
  List,
  Warehouse,
  FileText,
  Home,
} from "lucide-react";
import { useVehicleContext } from "@/vehicles/VehicleContext";

import AssignVehicleToOrderDialog from "@/orders/AssignVehicleToOrderDialog"; // Import Dialog

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
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý Đơn hàng & Xe
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý quy trình gán đơn và vận chuyển
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Nút Trang chủ */}
          <Link to="/">
            <Button variant="outline" className="gap-2 shadow-sm font-medium">
              <Home className="w-4 h-4" />
              Trang chủ
            </Button>
          </Link>

          {/* Nút Danh sách đơn hàng (OrderList) - Đang ở trang này */}
          <Button
            variant="outline"
            className="gap-2 shadow-sm font-medium border-gray-300 bg-gray-50 cursor-default"
          >
            <List className="w-4 h-4" />
            Đơn hàng
          </Button>

          <div className="h-9 w-px bg-primary" />

          {/* Nút Dashboard Kho */}
          {user?.role === "warehouse" && (
            <Link to="/warehouse">
              <Button
                variant="outline"
                className="gap-2 shadow-sm font-medium text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Warehouse className="w-4 h-4" />
                Dashboard Kho
              </Button>
            </Link>
          )}

          {/* Nút Điều vận */}
          {user?.role === "leader" && (
            <Link to="/dispatcher">
              <Button
                variant="outline"
                className="gap-2 shadow-sm font-medium text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <Truck className="w-4 h-4" />
                Điều vận
              </Button>
            </Link>
          )}

          {/* Nút Báo cáo xe */}
          {user?.role !== "warehouse" && (
            <Link to="/vehicle-report">
              <Button
                variant="outline"
                className="gap-2 shadow-sm font-medium text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <FileText className="w-4 h-4" />
                Báo cáo xe
              </Button>
            </Link>
          )}

          <div className="h-9 w-px bg-primary" />

          {/* Nút Tạo xe */}
          {user?.role !== "warehouse" && (
            <Button
              variant="outline"
              className="gap-2 shadow-sm font-medium"
              onClick={() => setOpenVehicleDialog(true)}
            >
              <Truck className="w-4 h-4" />
              Tạo xe
            </Button>
          )}

          {/* Nút Tạo đơn hàng */}
          {user?.role !== "warehouse" && (
            <Button
              onClick={handleCreateOrder}
              variant="gradient"
              className="gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Tạo đơn hàng mới
            </Button>
          )}
        </div>
      </div>

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
