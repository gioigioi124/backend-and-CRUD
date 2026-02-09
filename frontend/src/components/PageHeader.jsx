import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import DateRangeSearch from "@/components/DateRangeSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PlusCircle,
  Truck,
  List,
  Warehouse,
  FileText,
  Home,
} from "lucide-react";

/**
 * Reusable PageHeader component for consistent header across all pages
 *
 * @param {Object} props
 * @param {string} props.title - Main page title
 * @param {string} [props.subtitle] - Optional subtitle/description
 * @param {boolean} [props.showDateRangeSearch] - Show DateRangeSearch component
 * @param {function} [props.onDateSearch] - Callback for date range changes (fromDate, toDate)
 * @param {boolean} [props.defaultToToday] - DateRangeSearch default to today
 * @param {boolean} [props.showStaffFilter] - Show staff dropdown filter
 * @param {string} [props.selectedStaff] - Current selected staff ID
 * @param {function} [props.onStaffChange] - Callback for staff changes
 * @param {Array} [props.staffList] - List of staff members
 * @param {string} props.currentPage - Current page identifier: 'home' | 'orders' | 'dispatcher' | 'warehouse' | 'vehicle-report'
 * @param {function} [props.onCreateOrder] - Callback to create order (shows button if provided)
 * @param {function} [props.onCreateVehicle] - Callback to create vehicle (shows button if provided)
 * @param {Object} props.user - User object for role-based rendering
 */
const PageHeader = ({
  title,
  subtitle,
  showDateRangeSearch = false,
  onDateSearch,
  defaultToToday = true,
  showStaffFilter = false,
  selectedStaff = "all",
  onStaffChange,
  staffList = [],
  currentPage,
  onCreateOrder,
  onCreateVehicle,
  user,
}) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 md:gap-4 mb-4 md:mb-6">
      {/* Left Section: Title + Filters */}
      <div className="flex flex-wrap items-end gap-2 md:gap-4 w-full lg:w-auto">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-gray-500">{subtitle}</p>
          )}
        </div>

        {/* Date Range Search */}
        {showDateRangeSearch && onDateSearch && (
          <DateRangeSearch
            onSearch={onDateSearch}
            defaultToToday={defaultToToday}
          />
        )}

        {/* Staff Filter */}
        {showStaffFilter && onStaffChange && (
          <div className="flex items-center gap-2 rounded-md w-full sm:w-fit">
            <span className="text-xs md:text-sm font-medium whitespace-nowrap">
              Người tạo:
            </span>
            <Select value={selectedStaff} onValueChange={onStaffChange}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white h-8 md:h-9 text-xs md:text-sm">
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
        )}
      </div>

      {/* Right Section: Navigation + Action Buttons */}
      <div className="flex flex-wrap gap-1.5 md:gap-2 w-full lg:w-auto">
        {/* Trang chủ */}
        {currentPage === "home" ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 md:gap-2 shadow-sm font-medium border-gray-300 bg-gray-50 cursor-default h-8 md:h-9 px-2 md:px-3"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Trang chủ</span>
          </Button>
        ) : (
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 md:gap-2 shadow-sm font-medium h-8 md:h-9 px-2 md:px-3"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Trang chủ</span>
            </Button>
          </Link>
        )}

        {/* Đơn hàng */}
        {currentPage === "orders" ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 md:gap-2 shadow-sm font-medium border-gray-300 bg-gray-50 cursor-default h-8 md:h-9 px-2 md:px-3"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Đơn hàng</span>
          </Button>
        ) : (
          <Link to="/orders">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 md:gap-2 shadow-sm font-medium h-8 md:h-9 px-2 md:px-3"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Đơn hàng</span>
            </Button>
          </Link>
        )}

        <div className="hidden md:block h-9 w-px bg-primary" />

        {/* Dashboard Kho - only for warehouse role */}
        {user?.role === "warehouse" && (
          <>
            {currentPage === "warehouse" ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 md:gap-2 shadow-sm font-medium text-purple-600 border-purple-200 bg-purple-50 cursor-default h-8 md:h-9 px-2 md:px-3"
              >
                <Warehouse className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard Kho</span>
              </Button>
            ) : (
              <Link to="/warehouse">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 md:gap-2 shadow-sm font-medium text-purple-600 border-purple-200 hover:bg-purple-50 h-8 md:h-9 px-2 md:px-3"
                >
                  <Warehouse className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard Kho</span>
                </Button>
              </Link>
            )}
          </>
        )}

        {/* Điều vận - for admin and leader roles */}
        {(user?.role === "admin" || user?.role === "leader") && (
          <>
            {currentPage === "dispatcher" ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 md:gap-2 shadow-sm font-medium text-orange-600 border-orange-200 bg-orange-50 cursor-default h-8 md:h-9 px-2 md:px-3"
              >
                <Truck className="w-4 h-4" />
                <span className="hidden sm:inline">Điều vận</span>
              </Button>
            ) : (
              <Link to="/dispatcher">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 md:gap-2 shadow-sm font-medium text-orange-600 border-orange-200 hover:bg-orange-50 h-8 md:h-9 px-2 md:px-3"
                >
                  <Truck className="w-4 h-4" />
                  <span className="hidden sm:inline">Điều vận</span>
                </Button>
              </Link>
            )}
          </>
        )}

        {/* Báo cáo xe - not for warehouse role */}
        {user?.role !== "warehouse" && (
          <>
            {currentPage === "vehicle-report" ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 md:gap-2 shadow-sm font-medium text-blue-600 border-blue-200 bg-blue-50 cursor-default h-8 md:h-9 px-2 md:px-3"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Báo cáo xe</span>
              </Button>
            ) : (
              <Link to="/vehicle-report">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 md:gap-2 shadow-sm font-medium text-blue-600 border-blue-200 hover:bg-blue-50 h-8 md:h-9 px-2 md:px-3"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Báo cáo xe</span>
                </Button>
              </Link>
            )}
          </>
        )}

        <div className="hidden md:block h-9 w-px bg-primary" />

        {/* Tạo xe - not for warehouse role */}
        {user?.role !== "warehouse" && onCreateVehicle && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 md:gap-2 shadow-sm font-medium h-8 md:h-9 px-2 md:px-3"
            onClick={onCreateVehicle}
          >
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo xe</span>
          </Button>
        )}

        {/* Tạo đơn hàng mới - not for warehouse role */}
        {user?.role !== "warehouse" && onCreateOrder && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onCreateOrder}
                  variant="gradient"
                  size="sm"
                  className="gap-1 md:gap-2 h-8 md:h-9 px-2 md:px-3"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Tạo đơn</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 text-white border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Phím tắt:</span>
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm font-mono font-semibold">
                    Ctrl+M
                  </kbd>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
