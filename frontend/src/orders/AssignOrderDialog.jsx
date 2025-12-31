import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";

const AssignOrderDialog = ({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
  creator,
}) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("all");

  // Fetch danh sách nhân viên
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const data = await userService.getStaffList();
        setStaffList(data);
      } catch (error) {
        console.error("Không thể tải danh sách nhân viên", error);
      }
    };
    fetchStaffList();
  }, []);

  // Fetch danh sách đơn chưa gán
  useEffect(() => {
    if (open) {
      fetchUnassignedOrders();
    }
  }, [open, creator]);

  // Lọc đơn hàng theo nhân viên
  useEffect(() => {
    if (selectedStaff === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter((order) => order.createdBy?._id === selectedStaff)
      );
    }
  }, [selectedStaff, orders]);

  const fetchUnassignedOrders = async () => {
    try {
      setLoading(true);
      const params = { status: "unassigned" };
      if (creator) params.creator = creator;

      const data = await orderService.getAllOrders(params);
      
      // Lọc đơn hàng có orderDate giống vehicleDate
      const filteredByDate = data.filter((order) => {
        if (!vehicle?.vehicleDate || !order.orderDate) return false;
        
        const orderDate = new Date(order.orderDate);
        const vehicleDate = new Date(vehicle.vehicleDate);
        
        // So sánh chỉ ngày, bỏ qua giờ
        orderDate.setHours(0, 0, 0, 0);
        vehicleDate.setHours(0, 0, 0, 0);
        
        return orderDate.getTime() === vehicleDate.getTime();
      });
      
      setOrders(filteredByDate);
      setSelectedOrderId(null);
      setSelectedStaff("all"); // Reset bộ lọc nhân viên
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý gán đơn vào xe
  const handleAssign = async () => {
    if (!selectedOrderId) {
      toast.error("Vui lòng chọn đơn hàng");
      return;
    }

    if (!vehicle?._id) {
      toast.error("Không có xe được chọn");
      return;
    }

    try {
      setAssigning(true);
      await orderService.assignOrder(selectedOrderId, vehicle._id);
      toast.success("Gán đơn hàng vào xe thành công!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        "Gán đơn hàng thất bại: " +
          (error.response?.data?.message || error.message)
      );
      console.error(error);
    } finally {
      setAssigning(false);
    }
  };

  // Format ngày tạo
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gán đơn hàng vào xe</DialogTitle>
          <DialogDescription>
            Chọn đơn hàng chưa gán để gán vào xe{" "}
            {vehicle && (
              <span className="font-semibold">
                {vehicle.weight} - {vehicle.destination} (
                {formatDate(vehicle.vehicleDate)})
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bộ lọc nhân viên */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Lọc theo nhân viên:
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả nhân viên</option>
              {staffList.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {orders.length === 0
                ? `Không có đơn hàng chưa gán nào có ngày ${formatDate(
                    vehicle?.vehicleDate
                  )}`
                : "Không có đơn hàng nào của nhân viên này"}
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-2 border rounded-lg p-2">
              {filteredOrders.map((order) => {
                const totalItems = order.items?.length || 0;
                const isSelected = selectedOrderId === order._id;
                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrderId(order._id)}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer?.name || "Không có tên"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {totalItems}{" "}
                          {totalItems === 1 ? "mặt hàng" : "mặt hàng"} •{" "}
                          {formatDate(order.orderDate)}
                          {order.createdBy?.name && (
                            <span className="ml-2 text-blue-600">
                              • {order.createdBy.name}
                            </span>
                          )}
                        </div>
                        {order.customer?.note && (
                          <div className="text-xs text-gray-400 mt-1 italic">
                            {order.customer.note}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="ml-2 text-blue-600">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assigning}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAssign}
            disabled={assigning || !selectedOrderId}
          >
            {assigning ? "Đang gán..." : "Gán vào xe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignOrderDialog;
