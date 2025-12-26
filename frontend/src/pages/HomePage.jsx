import VehicleList from "@/vehicles/VehicleList";
import VehicleOrderList from "@/orders/VehicleOrderList";
import OrderDetail from "@/orders/OrderDetail";
import AssignOrderDialog from "@/orders/AssignOrderDialog";
import { useState } from "react";
import { useVehicleContext } from "@/vehicles/VehicleContext";

const HomePage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
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

  return (
    <div className="container mx-auto p-4 max-w-none">
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
            onEdit={() => {
              // Có thể mở edit dialog sau
              console.log("Edit order:", selectedOrder);
            }}
            onDelete={() => {
              // Có thể mở delete dialog sau
              console.log("Delete order:", selectedOrder);
            }}
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
    </div>
  );
};

export default HomePage;
