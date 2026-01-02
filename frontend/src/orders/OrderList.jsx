import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import OrderItem from "./OrderItem";
import { orderService } from "@/services/orderService";
import { Input } from "@/components/ui/input";
import DateRangeSearch from "@/components/DateRangeSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Helper function để lấy ngày hôm nay
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const OrderList = ({
  selectedOrder,
  onSelectOrder,
  onEdit,
  onDelete,
  onAssign,
  refreshTrigger,
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter và search states
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "unassigned", "assigned"
  const [searchQuery, setSearchQuery] = useState(""); // Giá trị trong input
  const [activeSearchQuery, setActiveSearchQuery] = useState(""); // Giá trị đang được search
  const [staffList, setStaffList] = useState([]);
  const [creatorFilter, setCreatorFilter] = useState(
    user && user.role === "staff" ? user._id : "all"
  );

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const ITEMS_PER_PAGE = 10;

  // Khởi tạo dateRange với ngày hôm nay
  const todayDate = getTodayDate();
  const [dateRange, setDateRange] = useState({
    fromDate: todayDate,
    toDate: todayDate,
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await userService.getStaffList();
        setStaffList(data);

        // Mặc định: Chỉ staff mới chọn chính mình, các role khác (warehouse, leader, admin) đều chọn "Tất cả"
        if (user && user.role === "staff") {
          setCreatorFilter(user._id);
        } else {
          setCreatorFilter("all");
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhân viên:", error);
      }
    };
    if (user) {
      fetchStaff();
    }
  }, [user]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, activeSearchQuery, dateRange, creatorFilter]);

  // Tải danh sách đơn hàng
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      // Thêm filter theo người tạo
      if (creatorFilter !== "all") {
        params.creator = creatorFilter;
      }

      // Thêm filter theo trạng thái
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      // Thêm search query
      if (activeSearchQuery.trim()) {
        params.search = activeSearchQuery.trim();
      }

      // Thêm date range
      if (dateRange.fromDate) {
        params.fromDate = dateRange.fromDate;
      }
      if (dateRange.toDate) {
        params.toDate = dateRange.toDate;
      }

      const data = await orderService.getAllOrders(params);

      // Xử lý response với pagination metadata
      const {
        orders: orderData,
        currentPage: page,
        totalPages: pages,
        totalOrders: total,
        hasNextPage: hasNext,
        hasPrevPage: hasPrev,
      } = data;

      setOrders(orderData);
      setCurrentPage(page);
      setTotalPages(pages);
      setTotalOrders(total);
      setHasNextPage(hasNext);
      setHasPrevPage(hasPrev);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách đơn hàng");
      console.error("Không thể tải đơn hàng", err.message);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, activeSearchQuery, dateRange, creatorFilter, currentPage]);

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

  // Xử lý tìm kiếm theo ngày
  const handleDateSearch = (fromDate, toDate) => {
    setDateRange({ fromDate, toDate });
  };

  // Xử lý edit và delete - gọi callback từ parent
  const handleEdit = (order) => {
    onEdit?.(order);
  };

  const handleDelete = (order) => {
    onDelete?.(order);
  };

  // Loading và error states (chỉ hiển thị loading/error cho phần list, giữ nguyên header filter)
  const renderContent = () => {
    if (loading) return <div className="text-center py-4">Đang tải...</div>;
    if (error)
      return <div className="text-red-500 text-center py-4">{error}</div>;

    if (orders.length === 0) {
      return (
        <p className="text-gray-500 text-center py-4">
          {activeSearchQuery || statusFilter !== "all"
            ? "Không tìm thấy đơn hàng"
            : "Chưa có đơn hàng nào"}
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {orders.map((order) => (
          <OrderItem
            key={order._id}
            order={order}
            isSelected={selectedOrder?._id === order._id}
            onSelect={onSelectOrder}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAssign={onAssign}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Pagination Controls - moved to top */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={!hasPrevPage}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Trước
        </Button>

        <div className="text-sm text-gray-600">
          <span className="font-semibold text-base">
            Trang {currentPage} / {totalPages}
          </span>
          <span className="text-gray-400 ml-2">({totalOrders} đơn)</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={!hasNextPage}
          className="gap-1"
        >
          Sau
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter và Search */}
      <div className="mb-4 space-y-2 max-w-75">
        {/* Search input */}
        <Input
          type="text"
          placeholder="Tìm kiếm theo tên KH... (Enter để tìm)"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />

        {/* Filter dropdown */}
        <Select value={statusFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="unassigned">Chưa gán xe</SelectItem>
            <SelectItem value="assigned">Đã gán xe</SelectItem>
          </SelectContent>
        </Select>

        {/* Date range search */}
        <DateRangeSearch onSearch={handleDateSearch} defaultToToday={true} />

        {/* Filter người tạo - đưa xuống dưới cùng */}
        <div className="pt-2 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-500 mb-1 block">
            Người tạo đơn:
          </span>
          <Select value={creatorFilter} onValueChange={setCreatorFilter}>
            <SelectTrigger className="w-full bg-gray-50">
              <SelectValue placeholder="Lọc theo người tạo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả các nhân viên</SelectItem>
              {staffList.map((staff) => (
                <SelectItem key={staff._id} value={staff._id}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Danh sách đơn hàng */}
      {renderContent()}
    </div>
  );
};

export default OrderList;
