import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import OrderItem from "./OrderItem";
import { orderService } from "@/services/orderService";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OrderList = ({
  selectedOrder,
  onSelectOrder,
  onEdit,
  onDelete,
  refreshTrigger,
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter và search states
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "unassigned", "assigned"
  const [searchQuery, setSearchQuery] = useState(""); // Giá trị trong input
  const [activeSearchQuery, setActiveSearchQuery] = useState(""); // Giá trị đang được search

  // Tải danh sách đơn hàng
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};

      // Thêm filter theo trạng thái
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      // Thêm search query
      if (activeSearchQuery.trim()) {
        params.search = activeSearchQuery.trim();
      }

      const data = await orderService.getAllOrders(params);
      setOrders(data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách đơn hàng");
      console.error("Không thể tải đơn hàng", err.message);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, activeSearchQuery]);

  // Fetch orders khi filter hoặc search thay đổi
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refresh khi có trigger từ bên ngoài (sau khi sửa/xóa)
  useEffect(() => {
    if (refreshTrigger) {
      fetchOrders();
    }
  }, [refreshTrigger, fetchOrders]);

  // Xử lý thay đổi filter
  const handleFilterChange = (value) => {
    setStatusFilter(value);
  };

  // Xử lý thay đổi search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Xử lý khi nhấn Enter trong search input
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setActiveSearchQuery(searchQuery);
    }
  };

  // Xử lý edit và delete - gọi callback từ parent
  const handleEdit = (order) => {
    onEdit?.(order);
  };

  const handleDelete = (order) => {
    onDelete?.(order);
  };

  // Loading và error states
  if (loading) return <div className="text-center py-4">Đang tải...</div>;
  if (error)
    return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Danh sách đơn hàng</h2>

      {/* Filter và Search */}
      <div className="mb-4 space-y-2 max-w-75">
        {/* Filter dropdown */}
        <Select value={statusFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="unassigned">Chưa gán xe</SelectItem>
            <SelectItem value="assigned">Đã gán xe</SelectItem>
          </SelectContent>
        </Select>

        {/* Search input */}
        <Input
          type="text"
          placeholder="Tìm kiếm theo tên KH... (Enter để tìm)"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      {/* Danh sách đơn hàng */}
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          {activeSearchQuery || statusFilter !== "all"
            ? "Không tìm thấy đơn hàng"
            : "Chưa có đơn hàng nào"}
        </p>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <OrderItem
              key={order._id}
              order={order}
              isSelected={selectedOrder?._id === order._id}
              onSelect={onSelectOrder}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;
