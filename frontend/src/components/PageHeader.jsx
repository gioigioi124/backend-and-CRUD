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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      {/* Left Section: Title + Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
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
          <div className="flex items-center gap-2 rounded-md w-fit">
            <span className="text-sm font-medium whitespace-nowrap">
              Người tạo:
            </span>
            <Select value={selectedStaff} onValueChange={onStaffChange}>
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
        )}
      </div>

      {/* Right Section: Navigation + Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Trang chủ */}
        {currentPage === "home" ? (
          <Button
            variant="outline"
            className="gap-2 shadow-sm font-medium border-gray-300 bg-gray-50 cursor-default"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </Button>
        ) : (
          <Link to="/">
            <Button variant="outline" className="gap-2 shadow-sm font-medium">
              <Home className="w-4 h-4" />
              Trang chủ
            </Button>
          </Link>
        )}

        {/* Đơn hàng */}
        {currentPage === "orders" ? (
          <Button
            variant="outline"
            className="gap-2 shadow-sm font-medium border-gray-300 bg-gray-50 cursor-default"
          >
            <List className="w-4 h-4" />
            Đơn hàng
          </Button>
        ) : (
          <Link to="/orders">
            <Button variant="outline" className="gap-2 shadow-sm font-medium">
              <List className="w-4 h-4" />
              Đơn hàng
            </Button>
          </Link>
        )}

        <div className="h-9 w-px bg-primary" />

        {/* Dashboard Kho - only for warehouse role */}
        {user?.role === "warehouse" && (
          <>
            {currentPage === "warehouse" ? (
              <Button
                variant="outline"
                className="gap-2 shadow-sm font-medium text-purple-600 border-purple-200 bg-purple-50 cursor-default"
              >
                <Warehouse className="w-4 h-4" />
                Dashboard Kho
              </Button>
            ) : (
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
          </>
        )}

        {/* Điều vận - only for leader role */}
        {user?.role === "leader" && (
          <>
            {currentPage === "dispatcher" ? (
              <Button
                variant="outline"
                className="gap-2 shadow-sm font-medium text-orange-600 border-orange-200 bg-orange-50 cursor-default"
              >
                <Truck className="w-4 h-4" />
                Điều vận
              </Button>
            ) : (
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
          </>
        )}

        {/* Báo cáo xe - not for warehouse role */}
        {user?.role !== "warehouse" && (
          <>
            {currentPage === "vehicle-report" ? (
              <Button
                variant="outline"
                className="gap-2 shadow-sm font-medium text-blue-600 border-blue-200 bg-blue-50 cursor-default"
              >
                <FileText className="w-4 h-4" />
                Báo cáo xe
              </Button>
            ) : (
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
          </>
        )}

        <div className="h-9 w-px bg-primary" />

        {/* Tạo xe - not for warehouse role */}
        {user?.role !== "warehouse" && onCreateVehicle && (
          <Button
            variant="outline"
            className="gap-2 shadow-sm font-medium"
            onClick={onCreateVehicle}
          >
            <Truck className="w-4 h-4" />
            Tạo xe
          </Button>
        )}

        {/* Tạo đơn hàng mới - not for warehouse role */}
        {user?.role !== "warehouse" && onCreateOrder && (
          <Button onClick={onCreateOrder} variant="gradient" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Tạo đơn hàng mới
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
