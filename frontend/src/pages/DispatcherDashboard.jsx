import VehicleList from "@/vehicles/VehicleList";
import VehicleOrderList from "@/orders/VehicleOrderList";
import DispatcherOrderDetail from "@/orders/DispatcherOrderDetail";
import DateRangeSearch from "@/components/DateRangeSearch";
import OrderPrintPreview from "@/orders/OrderPrintPreview";
import OrderConfirmedPrintPreview from "@/orders/OrderConfirmedPrintPreview";
import DispatchManifestPreview from "@/orders/DispatchManifestPreview";
import {
  List,
  PlusCircle,
  Truck,
  Printer,
  Warehouse,
  FileText,
  Home,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useVehicleContext } from "@/vehicles/VehicleContext";
import { userService } from "@/services/userService";
import { orderService } from "@/services/orderService";
import { useAuth } from "@/context/AuthContext";
import AssignOrdersToVehicleDialog from "@/vehicles/AssignOrdersToVehicleDialog";
import OrderEditDialog from "@/orders/OrderEditDialog";
import VehicleFormDialog from "@/vehicles/VehicleFormDialog";
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

const DispatcherDashboard = () => {
  const { user } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [vehicleOrders, setVehicleOrders] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("all");

  const [manifestPreviewOpen, setManifestPreviewOpen] = useState(false);
  const [manifestItems, setManifestItems] = useState([]);

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
        // Chỉ staff mới mặc định chọn chính mình, các role khác (leader, admin, warehouse) đều chọn "Tất cả"
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
    setSelectedOrder(null); // Reset đơn hàng đang chọn khi đổi xe
    setVehicleOrders([]); // Reset danh sách đơn hàng khi đổi xe để tránh hiển thị dữ liệu cũ
  }, [selectedVehicle]);

  const handleDateSearch = (fromDate, toDate) => {
    setDateRange({ fromDate, toDate });
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleUnassign = () => {
    setRefreshTrigger((prev) => prev + 1);
    // Chỉ cập nhật số lượng đơn hàng cho xe hiện tại
    if (selectedVehicle?._id && updateOrderCountRef.current) {
      updateOrderCountRef.current(selectedVehicle._id);
    }
    setSelectedOrder(null);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    // Chỉ cập nhật số lượng đơn hàng cho xe hiện tại
    if (selectedVehicle?._id && updateOrderCountRef.current) {
      updateOrderCountRef.current(selectedVehicle._id);
    }
  };

  const handleOrdersLoaded = (orders) => {
    setVehicleOrders(orders);

    // Logic update data mới nhất cho đơn hàng đang chọn (nếu có)
    // KHÔNG tự động chọn đơn hàng mới khi đổi xe
    if (selectedOrder && orders.length > 0) {
      const found = orders.find((o) => o._id === selectedOrder._id);
      if (found) {
        setSelectedOrder(found);
      } else {
        // Nếu đơn hàng đang chọn không còn trong danh sách (do bị xóa hoặc đổi xe) -> Bỏ chọn
        setSelectedOrder(null);
      }
    }
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

  const handlePrintManifest = (items) => {
    setManifestItems(items);
    setManifestPreviewOpen(true);
  };

  const handleCreateOrder = () => {
    setOrderToEdit(null);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = async () => {
    handleRefresh();
    if (selectedOrder && orderToEdit && selectedOrder._id === orderToEdit._id) {
      try {
        const updatedOrder = await orderService.getOrder(orderToEdit._id);
        setSelectedOrder(updatedOrder);
      } catch (error) {
        console.error("Không thể tải lại đơn hàng:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Bảng Điều Vận</h1>
          <DateRangeSearch onSearch={handleDateSearch} defaultToToday={true} />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Nút Trang chủ */}
          <Link to="/">
            <Button
              variant="outline"
              className="gap-2 shadow-sm font-medium text-green-600 border-green-200 hover:bg-green-50"
            >
              <Home className="w-4 h-4" />
              Trang chủ
            </Button>
          </Link>

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

          {/* Nút Điều vận (Đang ở trang này) */}
          <Button
            variant="outline"
            className="gap-2 shadow-sm font-medium text-orange-600 border-orange-200 bg-orange-50 cursor-default"
          >
            <Truck className="w-4 h-4" />
            Điều vận
          </Button>

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
              variant="secondary"
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

      <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-md border border-gray-100 w-fit">
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

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
        {/* Cột 1: Xe */}
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

        {/* Cột 2: Đơn hàng trong xe */}
        <div className="col-span-3 bg-white rounded-lg shadow-md p-4 overflow-y-auto border border-gray-100">
          <VehicleOrderList
            vehicle={selectedVehicle}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            onUnassign={handleUnassign}
            onAssignClick={() => setAssignDialogOpen(true)}
            refreshTrigger={refreshTrigger}
            onOrdersLoaded={handleOrdersLoaded}
            selectedOrderIds={selectedOrderIds}
            onToggleSelect={handleToggleSelectOrder}
            onSelectAll={handleSelectAllOrders}
            onPrint={handlePrint}
            onPrintConfirmed={handlePrintConfirmed}
          />
        </div>

        {/* Cột 3: Xác nhận hàng loạt cho Xe */}
        <div className="col-span-6 bg-white rounded-lg shadow-md p-4 overflow-y-auto border border-gray-100">
          <DispatcherOrderDetail
            orders={vehicleOrders}
            selectedOrder={selectedOrder}
            vehicle={selectedVehicle}
            onRefresh={handleRefresh}
            onPrintManifest={handlePrintManifest}
          />
        </div>
      </div>

      <AssignOrdersToVehicleDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        vehicle={selectedVehicle}
        onSuccess={handleRefresh}
      />

      <OrderEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        order={orderToEdit}
        onSuccess={handleEditSuccess}
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

      <DispatchManifestPreview
        open={manifestPreviewOpen}
        onOpenChange={setManifestPreviewOpen}
        vehicle={selectedVehicle}
        items={manifestItems}
      />
    </div>
  );
};

export default DispatcherDashboard;
