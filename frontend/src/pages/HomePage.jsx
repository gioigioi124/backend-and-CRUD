import VehicleList from "@/vehicles/VehicleList";
import VehicleOrderList from "@/orders/VehicleOrderList";
import OrderDetail from "@/orders/OrderDetail";
import AssignOrdersToVehicleDialog from "@/vehicles/AssignOrdersToVehicleDialog";
import AssignVehicleToOrderDialog from "@/orders/AssignVehicleToOrderDialog";
import OrderEditDialog from "@/orders/OrderEditDialog";
import DeleteOrderDialog from "@/components/confirmations/DeleteOrderDialog";
import VehicleFormDialog from "@/vehicles/VehicleFormDialog";
import OrderPrintPreview from "@/orders/OrderPrintPreview";
import OrderConfirmedPrintPreview from "@/orders/OrderConfirmedPrintPreview";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "../context/AuthContext";

import { useState, useEffect, useRef } from "react";
import { useVehicleContext } from "@/vehicles/VehicleContext";
import { toast } from "sonner";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const HomePage = () => {
  const { user } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [vehicleAssignDialogOpen, setVehicleAssignDialogOpen] = useState(false);
  const [orderToAssignVehicle, setOrderToAssignVehicle] = useState(null);
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

  // Reset vehicle and order selection when filter changes (staff or date range)
  useEffect(() => {
    setSelectedVehicle(null);
    setSelectedOrder(null);
    setSelectedOrderIds([]);
  }, [selectedStaff, dateRange.fromDate, dateRange.toDate]);

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

  // Keyboard shortcut: Ctrl+M to create new order
  useKeyboardShortcut("m", handleCreateOrder, { ctrl: true });

  const handleEdit = (order) => {
    setOrderToEdit(order);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = async () => {
    setRefreshTrigger((prev) => prev + 1);

    // Chỉ cập nhật số lượng đơn hàng cho xe liên quan, không fetch lại toàn bộ danh sách xe
    // Điều này tối ưu hơn nhiều so với triggerVehicleRefresh()
    if (orderToEdit?.vehicle && updateOrderCountRef.current) {
      updateOrderCountRef.current(orderToEdit.vehicle);
    }

    if (selectedOrder && orderToEdit && selectedOrder._id === orderToEdit._id) {
      try {
        const updatedOrder = await orderService.getOrder(orderToEdit._id);
        setSelectedOrder(updatedOrder);

        // Nếu xe thay đổi, cập nhật cả xe mới
        if (
          updatedOrder.vehicle &&
          updatedOrder.vehicle !== orderToEdit.vehicle &&
          updateOrderCountRef.current
        ) {
          updateOrderCountRef.current(updatedOrder.vehicle);
        }
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

      // Chỉ cập nhật số lượng đơn hàng cho xe liên quan, không fetch lại toàn bộ danh sách xe
      if (orderToDelete?.vehicle && updateOrderCountRef.current) {
        updateOrderCountRef.current(orderToDelete.vehicle);
      }

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

  const handleAssignVehicle = (order) => {
    setOrderToAssignVehicle(order);
    setVehicleAssignDialogOpen(true);
  };

  const handleAssignVehicleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    if (selectedVehicle?._id && updateOrderCountRef.current) {
      updateOrderCountRef.current(selectedVehicle._id);
    }
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

  return (
    <div className="container mx-auto p-4 max-w-none">
      <PageHeader
        title="Trang chủ"
        showDateRangeSearch={true}
        onDateSearch={handleDateSearch}
        defaultToToday={true}
        showStaffFilter={true}
        selectedStaff={selectedStaff}
        onStaffChange={setSelectedStaff}
        staffList={staffList}
        currentPage="home"
        onCreateOrder={handleCreateOrder}
        onCreateVehicle={() => setOpenVehicleDialog(true)}
        user={user}
      />

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
            onAssign={handleAssignVehicle}
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

      <AssignVehicleToOrderDialog
        open={vehicleAssignDialogOpen}
        onOpenChange={setVehicleAssignDialogOpen}
        order={orderToAssignVehicle}
        onSuccess={handleAssignVehicleSuccess}
      />
    </div>
  );
};

export default HomePage;
