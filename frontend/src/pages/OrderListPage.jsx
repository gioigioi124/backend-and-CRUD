import { useState } from "react";
import OrderList from "@/orders/OrderList";
import OrderDetail from "@/orders/OrderDetail";
import OrderEditDialog from "@/orders/OrderEditDialog";
import DeleteOrderDialog from "@/orders/DeleteOrderDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/orderService";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const OrderListPage = () => {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

      // Nếu đơn đang được chọn thì bỏ chọn
      if (selectedOrder?._id === deletingOrder._id) {
        setSelectedOrder(null);
      }

      // Trigger refresh danh sách
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

  // Callback khi sửa thành công
  const handleEditSuccess = () => {
    // Refresh selectedOrder nếu đang được chọn
    if (
      selectedOrder &&
      editingOrder &&
      selectedOrder._id === editingOrder._id
    ) {
      orderService.getOrder(selectedOrder._id).then((updatedOrder) => {
        setSelectedOrder(updatedOrder);
      });
    }
    // Trigger refresh danh sách
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto p-4 max-w-none">
      {/* Header với nút Tạo đơn hàng */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách đơn hàng đã đặt</h1>
        <Button onClick={handleCreateOrder}>Tạo đơn hàng mới</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Cột trái: Danh sách đơn hàng */}
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <OrderList
              key={user?._id}
              selectedOrder={selectedOrder}
              onSelectOrder={setSelectedOrder}
              onEdit={handleEdit}
              onDelete={handleDelete}
              refreshTrigger={refreshTrigger}
            />
          </CardContent>
        </Card>

        {/* Cột phải: Chi tiết đơn hàng */}
        <Card className="col-span-9">
          <CardContent className="p-4">
            <OrderDetail
              order={selectedOrder}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
    </div>
  );
};

export default OrderListPage;
