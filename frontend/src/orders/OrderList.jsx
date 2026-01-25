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
import { ChevronLeft, ChevronRight, Search, Download } from "lucide-react";
import * as XLSX from "xlsx";

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
    user && user.role === "staff" ? user._id : "all",
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

  // Xử lý khi click nút tìm kiếm
  const handleSearchClick = () => {
    setActiveSearchQuery(searchQuery);
  };

  // Xử lý tìm kiếm theo ngày
  const handleDateSearch = (fromDate, toDate) => {
    setDateRange({ fromDate, toDate });
  };

  // Xử lý export đơn hàng của trang hiện tại
  const handleExportOrders = () => {
    try {
      if (orders.length === 0) {
        toast.error("Không có đơn hàng để xuất");
        return;
      }

      // Tạo dữ liệu Excel
      const excelData = [];

      // Tạo rows - mỗi item của đơn hàng là một dòng
      orders.forEach((order) => {
        const baseInfo = {
          "Mã đơn": order.orderCode || "",
          "Mã KH": order.customer?.customerCode || "",
          "Khách hàng": order.customer?.name || "",
          "Địa chỉ": order.customer?.address || "",
          "SĐT KH": order.customer?.phone || "",
          "Ghi chú KH": order.customer?.note || "",
        };

        const orderInfo = {
          "Người tạo": order.createdBy?.name || "",
          "Ngày tạo": order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("vi-VN")
            : "",
          "Trạng thái": order.vehicle ? "Đã gán xe" : "Chưa gán xe",
          "Biển số xe": order.vehicle?.licensePlate || "",
        };

        // Nếu đơn hàng có items, tạo một dòng cho mỗi item
        if (order.items && order.items.length > 0) {
          // Sắp xếp items theo kho (K02→K03→K04→K01)
          const warehouseOrder = { K02: 1, K03: 2, K04: 3, K01: 4 };
          const sortedItems = [...order.items].sort((a, b) => {
            const warehouseA = warehouseOrder[a.warehouse] || 999;
            const warehouseB = warehouseOrder[b.warehouse] || 999;
            if (warehouseA !== warehouseB) {
              return warehouseA - warehouseB;
            }
            const nameA = `${a.productName || ""} ${a.size || ""}`
              .trim()
              .toLowerCase();
            const nameB = `${b.productName || ""} ${b.size || ""}`
              .trim()
              .toLowerCase();
            return nameA.localeCompare(nameB, "vi");
          });

          sortedItems.forEach((item) => {
            excelData.push({
              ...baseInfo,
              "Tên hàng hóa": item.productName || "",
              "Kích thước": item.size || "",
              ĐVT: item.unit || "",
              "Số lượng": item.quantity || "",
              Kho: item.warehouse || "",
              "Số cm": item.cmQty || "",
              "Ghi chú hàng": item.note || "",
              "Kho xác nhận": item.warehouseConfirm?.value || "",
              "Điều vận xác nhận": item.leaderConfirm?.value || "",
              ...orderInfo,
            });
          });
        } else {
          // Nếu không có items, tạo một dòng với thông tin đơn hàng
          excelData.push({
            ...baseInfo,
            "Tên hàng hóa": "",
            "Kích thước": "",
            ĐVT: "",
            "Số lượng": "",
            Kho: "",
            "Số cm": "",
            "Ghi chú hàng": "",
            "Kho xác nhận": "",
            "Điều vận xác nhận": "",
            ...orderInfo,
          });
        }
      });

      // Tạo worksheet và workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sach don hang");

      // Tạo tên file với ngày giờ hiện tại
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      const fileName = `DonHang_ChiTiet_Trang${currentPage}_${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, fileName);

      const totalItems = orders.reduce(
        (sum, order) => sum + (order.items?.length || 0),
        0,
      );
      toast.success(
        `Đã xuất ${orders.length} đơn hàng với ${totalItems} mặt hàng`,
      );
    } catch (error) {
      console.error("Lỗi khi xuất đơn hàng:", error);
      toast.error("Không thể xuất đơn hàng");
    }
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
    <div className="flex flex-col h-full">
      <div className="flex-none">
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
          {/* Date range search */}
          <DateRangeSearch onSearch={handleDateSearch} defaultToToday={true} />
          {/* Search input với nút tìm kiếm */}
          <div className="flex gap-2 items-center justify-between">
            <Input
              type="text"
              placeholder="Tìm kiếm tên KH..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Button onClick={handleSearchClick} variant="gradient" size="sm">
              <Search className="w-4 h-4" />
              Tìm
            </Button>
          </div>

          {/* Filter người tạo */}
          <div className="w-full flex items-center justify-between space-x-2">
            <div className="w-full">
              <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                <SelectTrigger className="w-full bg-gray-50">
                  <SelectValue placeholder="Lọc theo người tạo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Người tạo</SelectItem>
                  {staffList.map((staff) => (
                    <SelectItem key={staff._id} value={staff._id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Filter dropdown */}
            <div className="w-full">
              <Select value={statusFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full bg-gray-50 ">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Gán xe</SelectItem>
                  <SelectItem value="unassigned">Chưa gán xe</SelectItem>
                  <SelectItem value="assigned">Đã gán xe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Export button */}
            <Button
              onClick={handleExportOrders}
              variant="gradient"
              size="sm"
              className="whitespace-nowrap gap-1"
              disabled={loading || orders.length === 0}
            >
              <Download className="w-4 h-4" />
              Xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Danh sách đơn hàng */}
      <div className="flex-1 overflow-y-auto min-h-0 px-1 pt-1 scrollbar-thin pb-2">
        {renderContent()}
      </div>
    </div>
  );
};

export default OrderList;
