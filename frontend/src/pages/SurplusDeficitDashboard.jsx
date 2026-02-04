import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download } from "lucide-react";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import CustomerAutocomplete from "@/components/CustomerAutocomplete";
import PageHeader from "@/components/PageHeader";
import * as XLSX from "xlsx";

const SurplusDeficitDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const initialLoadRef = useRef(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Date filter - mặc định là ngày hôm nay
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());
  const [selectedCreator, setSelectedCreator] = useState("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("deficit"); // "deficit" hoặc "all"
  const [selectedCustomer, setSelectedCustomer] = useState({
    name: "",
    customerCode: "",
    address: "",
    phone: "",
  });

  // Fetch staff list
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await userService.getStaffList();
        setStaffList(response || []);
      } catch (error) {
        console.error("Error fetching staff list:", error);
        toast.error("Không thể tải danh sách nhân viên");
      }
    };
    fetchStaff();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderService.getSurplusDeficitData(
        fromDate,
        toDate,
        selectedCreator === "all" ? null : selectedCreator,
        selectedWarehouse === "all" ? null : selectedWarehouse,
        selectedStatus
      );

      setData(response.data || []);
      setCurrentPage(1); // Reset to first page when fetching new data
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu hàng thừa thiếu");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedCreator, selectedWarehouse, selectedStatus]);

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      fetchData();
    }
  }, [fetchData]);

  const handleSearch = () => {
    fetchData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getDeficitColor = (deficit) => {
    if (deficit > 0) return "text-blue-600 font-bold"; // Thừa
    if (deficit < 0) return "text-red-600 font-bold"; // Thiếu
    return "text-gray-600"; // Bằng 0
  };

  const getDeficitText = (deficit) => {
    if (deficit > 0) return `+${deficit}`;
    return deficit;
  };

  // Filter data by customer name (client-side)
  const filteredData = selectedCustomer.name
    ? data.filter((item) =>
        item.customer?.name
          ?.toLowerCase()
          .includes(selectedCustomer.name.toLowerCase())
      )
    : data;

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Excel export function
  const handleExportExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = data.map((item, index) => ({
        STT: index + 1,
        Ngày: formatDate(item.orderDate),
        "Khách hàng": item.customer?.name || "",
        "Địa chỉ": item.customer?.address || "",
        "Tên hàng hóa": item.productName,
        "Kích thước": item.size || "",
        ĐVT: item.unit,
        SL: item.quantity,
        "SL chốt": item.leaderConfirm,
        "Thừa/Thiếu": item.deficit,
        Kho: item.warehouse,
        Xe: item.vehicle?.licensePlate || "Chưa gán",
        "NV bán hàng": item.createdBy?.name || "",
        "Ghi chú": item.note || "",
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Hàng Thừa Thiếu");

      // Set column widths
      const colWidths = [
        { wch: 5 }, // STT
        { wch: 12 }, // Ngày
        { wch: 25 }, // Khách hàng
        { wch: 30 }, // Địa chỉ
        { wch: 35 }, // Tên hàng hóa
        { wch: 12 }, // Kích thước
        { wch: 8 }, // ĐVT
        { wch: 8 }, // SL
        { wch: 10 }, // SL chốt
        { wch: 12 }, // Thừa/Thiếu
        { wch: 8 }, // Kho
        { wch: 12 }, // Xe
        { wch: 20 }, // NV bán hàng
        { wch: 30 }, // Ghi chú
      ];
      ws["!cols"] = colWidths;

      // Generate filename with current date
      const fileName = `Hang_Thua_Thieu_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);
      toast.success("Xuất file Excel thành công!");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Lỗi khi xuất file Excel");
    }
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title="Dashboard Hàng Thừa Thiếu"
        subtitle="Hàng hóa thừa thiếu so với đơn hàng"
        currentPage="home"
        user={user}
      />

      <Card className="gap-0 max-w-7xl mx-auto">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
            <Search className="w-4 h-4" />
            Bộ lọc tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 md:gap-4 items-end">
            <div className="space-y-1 md:space-y-2">
              <span className="text-xs md:text-sm font-medium">Từ ngày:</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full lg:w-[180px] h-8 md:h-10 text-xs md:text-sm"
              />
            </div>
            <div className="space-y-1 md:space-y-2">
              <span className="text-xs md:text-sm font-medium">Đến ngày:</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full lg:w-[180px] h-8 md:h-10 text-xs md:text-sm"
              />
            </div>

            <div className="space-y-1 md:space-y-2">
              <span className="text-xs md:text-sm font-medium">
                NV bán hàng:
              </span>
              <Select
                value={selectedCreator}
                onValueChange={setSelectedCreator}
              >
                <SelectTrigger className="w-full lg:w-[200px] h-8 md:h-10 text-xs md:text-sm">
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {staffList.map((staff) => (
                    <SelectItem key={staff._id} value={staff._id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 md:space-y-2">
              <span className="text-xs md:text-sm font-medium">Kho:</span>
              <Select
                value={selectedWarehouse}
                onValueChange={setSelectedWarehouse}
              >
                <SelectTrigger className="w-full lg:w-[150px] h-8 md:h-10 text-xs md:text-sm">
                  <SelectValue placeholder="Chọn kho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="K01">K01</SelectItem>
                  <SelectItem value="K02">K02</SelectItem>
                  <SelectItem value="K03">K03</SelectItem>
                  <SelectItem value="K04">K04</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 md:space-y-2">
              <span className="text-xs md:text-sm font-medium">
                Trạng thái:
              </span>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full lg:w-[180px] h-8 md:h-10 text-xs md:text-sm">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deficit">Thừa thiếu</SelectItem>
                  <SelectItem value="all">Tất cả</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customer Search - full width on mobile */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-1 md:space-y-2">
              <span className="text-xs md:text-sm font-medium hidden lg:block">
                &nbsp;
              </span>
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <div className="w-full lg:w-[300px]">
                  <CustomerAutocomplete
                    value={selectedCustomer}
                    onChange={(customer) => {
                      setSelectedCustomer(customer);
                      setCurrentPage(1);
                    }}
                    required={false}
                    placeholder="Tìm theo khách hàng..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    size="sm"
                    className="gap-1 md:gap-2 h-8 md:h-10 flex-1 sm:flex-initial text-xs md:text-sm"
                  >
                    <Search className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Tìm kiếm</span>
                  </Button>

                  <Button
                    onClick={handleExportExcel}
                    disabled={loading || data.length === 0}
                    size="sm"
                    className="gap-1 md:gap-2 bg-green-600 hover:bg-green-700 h-8 md:h-10 flex-1 sm:flex-initial text-xs md:text-sm"
                  >
                    <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Xuất Excel</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-7xl mx-auto">
        {/* Pagination Controls - Top */}
        {filteredData.length > 0 && (
          <CardContent className="pt-4 pb-2">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Hiển thị <span className="font-medium">{startIndex + 1}</span> -{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredData.length)}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">{filteredData.length}</span> mục
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Hiển thị:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                  disabled={loading}
                >
                  <SelectTrigger className="w-[80px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Trước
                </Button>
                <span className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages || loading}
                >
                  Sau
                </Button>
              </div>
            </div>
          </CardContent>
        )}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-primary">Ngày</TableHead>
                  <TableHead className="text-primary">Khách hàng</TableHead>
                  <TableHead className="text-primary">Tên hàng hóa</TableHead>
                  <TableHead className="w-[80px] text-primary">KT</TableHead>
                  <TableHead className="w-[80px] text-primary">ĐVT</TableHead>
                  <TableHead className="w-[100px] text-primary">SL</TableHead>
                  <TableHead className="w-[100px] text-primary">
                    SL chốt
                  </TableHead>
                  <TableHead className="w-[100px] text-primary">
                    Thừa/Thiếu
                  </TableHead>
                  <TableHead className="w-[80px] text-primary">Kho</TableHead>
                  <TableHead className="w-[100px] text-primary">Xe</TableHead>
                  <TableHead className="text-primary">NV bán hàng</TableHead>
                  <TableHead className="w-[150px] text-primary">
                    Ghi chú
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="text-center py-8 text-gray-500"
                    >
                      {selectedCustomer.name
                        ? "Không tìm thấy dữ liệu cho khách hàng này"
                        : "Không có dữ liệu trong khoảng thời gian này"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => (
                    <TableRow
                      key={`${item.orderId}-${item.itemId}-${index}`}
                      className={
                        item.deficit > 0
                          ? "bg-blue-50"
                          : item.deficit < 0
                          ? "bg-red-50"
                          : ""
                      }
                    >
                      {/* Ngày */}
                      <TableCell className="font-medium">
                        {formatDate(item.orderDate)}
                      </TableCell>
                      {/* Khách hàng */}
                      <TableCell className="min-w-[200px] wrap-break-word whitespace-normal">
                        <div className="font-medium wrap-break-word whitespace-normal uppercase">
                          {item.customer?.name}
                        </div>
                        {item.customer?.address && (
                          <div className="text-xs text-gray-500 wrap-break-word whitespace-normal">
                            {item.customer.address}
                          </div>
                        )}
                      </TableCell>
                      {/* Tên hàng hóa */}
                      <TableCell className="font-medium min-w-[300px] wrap-break-word whitespace-normal">
                        {item.productName}
                      </TableCell>
                      {/* Kích thước */}
                      <TableCell>{item.size || "-"}</TableCell>
                      {/* Đơn vị tính */}
                      <TableCell>{item.unit}</TableCell>
                      {/* Số lượng đơn hàng */}
                      <TableCell className="font-bold text-center">
                        {item.quantity}
                      </TableCell>
                      {/* Số lượng tổ trưởng xác nhận */}
                      <TableCell className="font-bold text-center">
                        {item.leaderConfirm}
                      </TableCell>
                      {/* Thừa/Thiếu */}
                      <TableCell
                        className={`text-center ${getDeficitColor(
                          item.deficit
                        )}`}
                      >
                        {getDeficitText(item.deficit)}
                      </TableCell>
                      {/* Kho */}
                      <TableCell className="text-center">
                        {item.warehouse}
                      </TableCell>
                      {/* Xe */}
                      <TableCell>
                        {item.vehicle?.licensePlate || "Chưa gán"}
                      </TableCell>
                      {/* Nhân viên bán hàng */}
                      <TableCell>{item.createdBy?.name || "-"}</TableCell>
                      {/* Ghi chú */}
                      <TableCell
                        className="text-xs text-gray-500 min-w-[100px] wrap-break-word whitespace-normal"
                        title={item.note}
                      >
                        {item.note || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Summary */}
        {filteredData.length > 0 && (
          <CardContent className="p-3 md:p-6 pt-4 border-t">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-gray-600">Tổng số mục: </span>
                <span className="font-bold">{filteredData.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Số mục thừa: </span>
                <span className="font-bold text-blue-600">
                  {filteredData.filter((item) => item.deficit > 0).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Số mục thiếu: </span>
                <span className="font-bold text-red-600">
                  {filteredData.filter((item) => item.deficit < 0).length}
                </span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SurplusDeficitDashboard;
