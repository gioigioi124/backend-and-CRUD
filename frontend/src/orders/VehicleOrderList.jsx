import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Package, X } from "lucide-react";
import { orderService } from "@/services/orderService";

const VehicleOrderList = ({
  vehicle,
  selectedOrder,
  onSelectOrder,
  onUnassign,
  onAssignClick,
  refreshTrigger,
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format ngày tạo
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch đơn hàng của xe
  const fetchOrders = useCallback(async () => {
    if (!vehicle?._id) {
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrdersByVehicle(vehicle._id);
      setOrders(data);
    } catch (err) {
      setError("Không thể tải danh sách đơn hàng");
      console.error("Không thể tải đơn hàng", err.message);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [vehicle?._id]);

  // Fetch khi vehicle thay đổi hoặc refreshTrigger thay đổi
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshTrigger]);

  // Xử lý bỏ gán
  const handleUnassign = async (order, e) => {
    e.stopPropagation();
    try {
      await orderService.unassignOrder(order._id);
      toast.success("Bỏ gán đơn hàng thành công!");
      
      // Nếu đơn đang được chọn thì bỏ chọn
      if (selectedOrder?._id === order._id) {
        onSelectOrder(null);
      }
      
      // Refresh danh sách
      fetchOrders();
      
      // Gọi callback từ parent nếu có
      onUnassign?.(order);
    } catch (error) {
      toast.error(
        "Bỏ gán đơn hàng thất bại: " +
          (error.response?.data?.message || error.message)
      );
      console.error(error);
    }
  };

  if (!vehicle) {
    return (
      <div className="text-gray-500 text-center py-4">
        Chọn xe để xem đơn hàng
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Đơn hàng trong xe</h2>
        <Button size="sm" onClick={onAssignClick}>
          <Package className="w-4 h-4 mr-1" />
          Gán đơn vào xe
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Chưa có đơn hàng nào</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={onAssignClick}
          >
            Gán đơn vào xe
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const totalItems = order.items?.length || 0;
            return (
              <div
                key={order._id}
                onClick={() => onSelectOrder(order)}
                className={`relative p-3 border rounded transition-colors group cursor-pointer ${
                  selectedOrder?._id === order._id
                    ? "bg-blue-50 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
              >
                {/* Thông tin đơn hàng */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer?.name || "Không có tên"}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {totalItems} {totalItems === 1 ? "mặt hàng" : "mặt hàng"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(order.createdAt)}
                  </div>
                  {order.customer?.note && (
                    <div className="text-xs text-gray-400 mt-1 italic">
                      {order.customer.note}
                    </div>
                  )}
                </div>
                {/* Nút bỏ gán */}
                <div className="absolute bottom-2 right-2 hidden group-hover:flex">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => handleUnassign(order, e)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Bỏ gán
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VehicleOrderList;

