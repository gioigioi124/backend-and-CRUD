import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orderService } from "@/services/orderService";
import { toast } from "sonner";
import { Package, Search } from "lucide-react";

const AssignOrdersToVehicleDialog = ({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
}) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open && vehicle) {
      fetchOrders();
      setSelectedOrders([]);
      setSearchQuery("");
    }
  }, [open, vehicle]);

  // Filter orders khi search query thay đổi
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = orders.filter((order) =>
        order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchQuery, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Lấy ngày của xe để filter đơn hàng cùng ngày
      const vehicleDate = new Date(vehicle.vehicleDate)
        .toISOString()
        .split("T")[0];

      // Lấy tất cả đơn hàng chưa gán xe trong cùng ngày
      const data = await orderService.getAllOrders({
        status: "unassigned",
        fromDate: vehicleDate,
        toDate: vehicleDate,
      });
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOrder = (order) => {
    setSelectedOrders((prev) => {
      const isSelected = prev.some((o) => o._id === order._id);
      if (isSelected) {
        return prev.filter((o) => o._id !== order._id);
      } else {
        return [...prev, order];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders([...filteredOrders]);
    }
  };

  const handleAssign = async () => {
    if (selectedOrders.length === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn hàng");
      return;
    }

    try {
      setAssigning(true);

      let successCount = 0;
      let failCount = 0;

      for (const order of selectedOrders) {
        try {
          await orderService.assignOrder(order._id, vehicle._id);
          successCount++;
        } catch (error) {
          console.error(`Lỗi khi gán đơn ${order._id}:`, error);
          failCount++;
        }
      }

      // Hiển thị kết quả
      if (successCount > 0) {
        toast.success(
          `Đã gán ${successCount} đơn hàng vào xe ${vehicle.carName || "này"}${
            failCount > 0 ? `. ${failCount} đơn thất bại.` : ""
          }`
        );
      }

      if (failCount > 0 && successCount === 0) {
        toast.error(`Gán xe thất bại cho tất cả ${failCount} đơn hàng`);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        "Gán xe thất bại: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Gán đơn hàng cho xe {vehicle?.weight} - {vehicle?.destination}
          </DialogTitle>
          <div className="text-sm text-gray-500 mt-1">
            Ngày: {vehicle && new Date(vehicle.vehicleDate).toLocaleDateString("vi-VN")}
          </div>
        </DialogHeader>

        {/* Search bar */}
        <div className="flex items-center gap-2 py-2 border-b">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Select all checkbox */}
        <div className="flex items-center gap-2 py-2 border-b">
          <input
            type="checkbox"
            checked={
              filteredOrders.length > 0 &&
              selectedOrders.length === filteredOrders.length
            }
            onChange={handleSelectAll}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-sm font-medium">
            Chọn tất cả ({selectedOrders.length}/{filteredOrders.length})
          </span>
        </div>

        {/* Order list */}
        <div className="flex-1 overflow-y-auto min-h-[300px] py-2 space-y-2">
          {loading ? (
            <div className="text-center py-4 text-gray-500">
              Đang tải đơn hàng...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>
                {searchQuery
                  ? "Không tìm thấy đơn hàng"
                  : "Không có đơn hàng chưa gán xe trong ngày này"}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => handleToggleOrder(order)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-start gap-3 ${
                  selectedOrders.some((o) => o._id === order._id)
                    ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedOrders.some((o) => o._id === order._id)}
                  onChange={() => handleToggleOrder(order)}
                  className="w-4 h-4 mt-1 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {order.customer?.name || "Không có tên"}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {order.items?.length || 0} mặt hàng
                  </div>
                  {order.customer?.note && (
                    <div className="text-xs text-gray-400 mt-1 italic">
                      {order.customer.note}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assigning}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedOrders.length === 0 || assigning}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {assigning
              ? "Đang gán..."
              : `Gán ${selectedOrders.length} đơn hàng`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignOrdersToVehicleDialog;
