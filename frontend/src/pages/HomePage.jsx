import VehicleList from "@/vehicles/VehicleList";
import VehicleOrderList from "@/orders/VehicleOrderList";
import OrderDetail from "@/orders/OrderDetail";
import AssignOrderDialog from "@/orders/AssignOrderDialog";
import OrderEditDialog from "@/orders/OrderEditDialog";
import DeleteOrderDialog from "@/orders/DeleteOrderDialog";
import DateRangeSearch from "@/components/DateRangeSearch";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

import { useState, useEffect } from "react";
import { useVehicleContext } from "@/vehicles/VehicleContext";
import { toast } from "sonner";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper function để lấy ngày hôm nay
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const HomePage = () => {
  const { user, logout } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Staff filter
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("all"); // Khởi tạo là all, sau đó sẽ set lại theo user

  // Khởi tạo dateRange với ngày hôm nay để mặc định filter theo hôm nay
  const todayDate = getTodayDate();
  const [dateRange, setDateRange] = useState({
    fromDate: todayDate,
    toDate: todayDate,
  });
  const { triggerRefresh: triggerVehicleRefresh } = useVehicleContext();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await userService.getStaffList();
        setStaffList(data);

        // Mặc định: Nếu là staff thì chọn chính mình, nếu là admin/warehouse thì chọn "Tất cả"
        if (user && user.role === "staff") {
          setSelectedStaff(user._id);
        } else {
          setSelectedStaff("all");
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhân viên:", error);
      }
    };
    fetchStaff();
  }, [user]);

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

  // Xử lý tìm kiếm theo ngày
  const handleDateSearch = (fromDate, toDate) => {
    setDateRange({ fromDate, toDate });
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto p-4 max-w-none">
      {/* Header với nút Tạo đơn hàng */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Quản lý đơn hàng và xe</h1>
          <DateRangeSearch onSearch={handleDateSearch} defaultToToday={true} />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateOrder}>Tạo đơn hàng mới</Button>
          <Button variant="outline" onClick={logout}>
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Bộ lọc nhân viên được đưa xuống dưới */}
      <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-md border border-gray-100 w-fit">
        <span className="text-sm font-medium whitespace-nowrap">
          Người tạo:
        </span>
        <Select value={selectedStaff} onValueChange={setSelectedStaff}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Chọn nhân viên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nhân viên</SelectItem>
            {staffList.map((staff) => (
              <SelectItem key={staff._id} value={staff._id}>
                {staff.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
        {/* Cột 1: Danh sách xe */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4 overflow-y-auto">
          <VehicleList
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
            fromDate={dateRange.fromDate}
            toDate={dateRange.toDate}
            creator={selectedStaff === "all" ? "" : selectedStaff}
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
            fromDate={dateRange.fromDate}
            toDate={dateRange.toDate}
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
        creator={selectedStaff === "all" ? "" : selectedStaff}
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
