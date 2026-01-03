import VehicleList from "@/vehicles/VehicleList";
import VehicleOrderList from "@/orders/VehicleOrderList";
import OrderDetail from "@/orders/OrderDetail";
import AssignOrdersToVehicleDialog from "@/vehicles/AssignOrdersToVehicleDialog";
import OrderEditDialog from "@/orders/OrderEditDialog";
import DeleteOrderDialog from "@/orders/DeleteOrderDialog";
import VehicleFormDialog from "@/vehicles/VehicleFormDialog";
import OrderPrintPreview from "@/orders/OrderPrintPreview";
import OrderConfirmedPrintPreview from "@/orders/OrderConfirmedPrintPreview";
import DateRangeSearch from "@/components/DateRangeSearch";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";

import { useState, useEffect, useRef } from "react";
import { useVehicleContext } from "@/vehicles/VehicleContext";
import { toast } from "sonner";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import {
  PlusCircle,
  Truck,
  List,
  Warehouse,
  FileText,
  Home,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const HomePage = () => {
  const { user } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("all");

  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [printConfirmedPreviewOpen, setPrintConfirmedPreviewOpen] =
    useState(false);
  const [ordersToPrint, setOrdersToPrint] = useState([]);
  const [ordersToConfirmedPrint, setOrdersToConfirmedPrint] = useState([]);

  const todayDate = getTodayDate();
  const [dateRange, setDateRange] = useState({
    fromDate: todayDate,
    toDate: todayDate,
  });
  const { triggerRefresh: triggerVehicleRefresh } = useVehicleContext();
  const updateOrderCountRef = useRef(null);

  // Lưu hàm updateOrderCount từ VehicleList
  const handleOrderCountUpdate = (updateFn) => {
    updateOrderCountRef.current = updateFn;
  };

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await userService.getStaffList();
        setStaffList(data);
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

  // Reset selection when vehicle changes
  useEffect(() => {
    setSelectedOrderIds([]);
    setSelectedOrder(null); // Reset đơn hàng đang chọn để tránh hiện thông tin của xe cũ
  }, [selectedVehicle]);

  const handleAssignSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    // Chỉ cập nhật số lượng đơn hàng cho xe hiện tại thay vì fetch lại toàn bộ danh sách xe
    if (selectedVehicle?._id && updateOrderCountRef.current) {
      updateOrderCountRef.current(selectedVehicle._id);
    }
  };

  const handleUnassign = () => {
    setRefreshTrigger((prev) => prev + 1);
    // Chỉ cập nhật số lượng đơn hàng cho xe hiện tại thay vì fetch lại toàn bộ danh sách xe
    if (selectedVehicle?._id && updateOrderCountRef.current) {
      updateOrderCountRef.current(selectedVehicle._id);
    }
    setSelectedOrder(null);
  };

  const handleCreateOrder = () => {
    setOrderToEdit(null);
    setEditDialogOpen(true);
  };

  const handleEdit = (order) => {
    setOrderToEdit(order);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = async () => {
    setRefreshTrigger((prev) => prev + 1);
    triggerVehicleRefresh();
    if (selectedOrder && orderToEdit && selectedOrder._id === orderToEdit._id) {
      try {
        const updatedOrder = await orderService.getOrder(orderToEdit._id);
        setSelectedOrder(updatedOrder);
      } catch (error) {
        console.error("Không thể tải lại đơn hàng:", error);
      }
    }
  };

  const handleDelete = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    try {
      setDeleteLoading(true);
      await orderService.deleteOrder(orderToDelete._id);
      toast.success("Xóa đơn hàng thành công!");
      setDeleteDialogOpen(false);
      setRefreshTrigger((prev) => prev + 1);
      triggerVehicleRefresh();
      if (selectedOrder && selectedOrder._id === orderToDelete._id) {
        setSelectedOrder(null);
      }
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

  const handleDateSearch = (fromDate, toDate) => {
    setDateRange({ fromDate, toDate });
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleToggleSelectOrder = (orderId) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAllOrders = (allOrderIds) => {
    if (selectedOrderIds.length === allOrderIds.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(allOrderIds);
    }
  };

  const handlePrint = (orders) => {
    setOrdersToPrint(orders);
    setPrintPreviewOpen(true);
  };

  const handlePrintConfirmed = (orders) => {
    setOrdersToConfirmedPrint(orders);
    setPrintConfirmedPreviewOpen(true);
  };

  const handlePrintSingleOrder = (order) => {
    setOrdersToPrint([order]);
    setPrintPreviewOpen(true);
  };

  return (
    <div className="container mx-auto p-4 max-w-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Trang chủ </h1>
          <DateRangeSearch onSearch={handleDateSearch} defaultToToday={true} />

          {/* Dropdown người tạo */}
          <div className="flex items-center gap-2 rounded-md w-fit">
            <span className="text-sm font-medium whitespace-nowrap">
              Người tạo:
            </span>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="w-[180px] bg-white h-9">
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
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Nút Trang chủ - Đang ở trang này */}
          <Button
            variant="outline"
            className="gap-2 shadow-sm font-medium border-gray-300 bg-gray-50 cursor-default"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </Button>

          {/* Nút Danh sách đơn hàng (OrderList) */}
          <Link to="/orders">
            <Button variant="outline" className="gap-2 shadow-sm font-medium">
              <List className="w-4 h-4" />
              Đơn hàng
            </Button>
          </Link>

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
              className="gap-2 shadow-sm font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              Tạo đơn hàng mới
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
        <div className="col-span-3 bg-white rounded-lg shadow-md p-4 overflow-y-auto border border-gray-100">
          <VehicleList
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
            fromDate={dateRange.fromDate}
            toDate={dateRange.toDate}
            creator={selectedStaff === "all" ? "" : selectedStaff}
            onOrderCountUpdate={handleOrderCountUpdate}
          />
        </div>

        <div className="col-span-3 bg-white rounded-lg shadow-md p-4 overflow-y-auto border border-gray-100">
          <VehicleOrderList
            vehicle={selectedVehicle}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            onUnassign={handleUnassign}
            onAssignClick={() => setAssignDialogOpen(true)}
            refreshTrigger={refreshTrigger}
            selectedOrderIds={selectedOrderIds}
            onToggleSelect={handleToggleSelectOrder}
            onSelectAll={handleSelectAllOrders}
            onPrint={handlePrint}
            onPrintConfirmed={handlePrintConfirmed}
          />
        </div>

        <div className="col-span-6 bg-white rounded-lg shadow-md p-4 overflow-y-auto border border-gray-100">
          <OrderDetail
            order={selectedOrder}
            onEdit={handleEdit}
            onDelete={handleDelete}
            vehicle={selectedVehicle}
            onUnassign={handleUnassign}
            onPrint={handlePrintSingleOrder}
          />
        </div>
      </div>

      <AssignOrdersToVehicleDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        vehicle={selectedVehicle}
        onSuccess={handleAssignSuccess}
      />

      <OrderEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        order={orderToEdit}
        onSuccess={handleEditSuccess}
      />

      <DeleteOrderDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        order={orderToDelete}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      <VehicleFormDialog
        open={openVehicleDialog}
        onOpenChange={setOpenVehicleDialog}
        onSuccess={triggerVehicleRefresh}
      />

      <OrderPrintPreview
        open={printPreviewOpen}
        onOpenChange={setPrintPreviewOpen}
        selectedOrders={ordersToPrint}
      />

      <OrderConfirmedPrintPreview
        open={printConfirmedPreviewOpen}
        onOpenChange={setPrintConfirmedPreviewOpen}
        selectedOrders={ordersToConfirmedPrint}
      />
    </div>
  );
};

export default HomePage;
