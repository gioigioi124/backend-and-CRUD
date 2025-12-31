import VehicleList from "@/vehicles/VehicleList";
import VehicleOrderList from "@/orders/VehicleOrderList";
import OrderDetail from "@/orders/OrderDetail";
import AssignOrderDialog from "@/orders/AssignOrderDialog";
import OrderEditDialog from "@/orders/OrderEditDialog";
import DeleteOrderDialog from "@/orders/DeleteOrderDialog";
import VehicleFormDialog from "@/vehicles/VehicleFormDialog";
import OrderPrintPreview from "@/orders/OrderPrintPreview";
import OrderConfirmedPrintPreview from "@/orders/OrderConfirmedPrintPreview";
import DateRangeSearch from "@/components/DateRangeSearch";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";

import { useState, useEffect } from "react";
import { useVehicleContext } from "@/vehicles/VehicleContext";
import { toast } from "sonner";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import { PlusCircle, Truck, List, Warehouse } from "lucide-react";
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
  const [printConfirmedPreviewOpen, setPrintConfirmedPreviewOpen] = useState(false);
  const [ordersToPrint, setOrdersToPrint] = useState([]);
  const [ordersToConfirmedPrint, setOrdersToConfirmedPrint] = useState([]);

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
        if (user && (user.role === "staff" || user.role === "leader")) {
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
  }, [selectedVehicle]);

  const handleAssignSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    triggerVehicleRefresh();
  };

  const handleUnassign = () => {
    setRefreshTrigger((prev) => prev + 1);
    triggerVehicleRefresh();
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

  return (
    <div className="container mx-auto p-4 max-w-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Điều phối Xe & Đơn hàng
          </h1>
          <DateRangeSearch onSearch={handleDateSearch} defaultToToday={true} />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Nút Danh sách đơn hàng (OrderList) */}
          <Link to="/orders">
            <Button variant="outline" className="gap-2 shadow-sm font-medium">
              <List className="w-4 h-4" />
              Đơn hàng
            </Button>
          </Link>

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
        <div className="col-span-3 bg-white rounded-lg shadow-md p-4 overflow-y-auto border border-gray-100">
          <VehicleList
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
            fromDate={dateRange.fromDate}
            toDate={dateRange.toDate}
            creator={selectedStaff === "all" ? "" : selectedStaff}
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
            fromDate={dateRange.fromDate}
            toDate={dateRange.toDate}
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
          />
        </div>
      </div>

      <AssignOrderDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        vehicle={selectedVehicle}
        onSuccess={handleAssignSuccess}
        creator={selectedStaff === "all" ? "" : selectedStaff}
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
