import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router";
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
import {
  Calendar,
  Search,
  List,
  Warehouse,
  Home,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { orderService } from "@/services/orderService";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from "xlsx";

const WarehouseDashboard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const initialLoadRef = useRef(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Date filter
  // Date filter - mặc định là ngày hôm nay
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());
  const [status, setStatus] = useState("all");

  const fetchItems = useCallback(
    async (page = currentPage) => {
      // Check if there are dirty items before navigating
      const hasDirtyItems = items.some((item) => item.isDirty);
      if (hasDirtyItems && page !== currentPage) {
        const confirmNavigation = window.confirm(
          "Bạn có thay đổi chưa được xác nhận. Nếu chuyển trang, các thay đổi sẽ bị mất. Bạn có chắc chắn muốn tiếp tục?"
        );
        if (!confirmNavigation) {
          return;
        }
      }

      try {
        setLoading(true);
        const response = await orderService.getWarehouseItems(
          fromDate,
          toDate,
          status,
          page,
          itemsPerPage
        );

        // Handle paginated response
        setItems(response.items || []);
        setCurrentPage(response.currentPage || 1);
        setTotalPages(response.totalPages || 0);
        setTotalItems(response.totalItems || 0);

        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách hàng hóa");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, items, fromDate, toDate, status, itemsPerPage]
  );

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      fetchItems(1);
    }
  }, [fetchItems]); // Only fetch on initial load

  // Reset to page 1 when filters or items per page change
  const handleSearch = () => {
    setCurrentPage(1);
    fetchItems(1);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(parseInt(newLimit));
    setCurrentPage(1);
    // Fetch will be triggered by useEffect
  };

  // Fetch when itemsPerPage changes
  useEffect(() => {
    if (itemsPerPage) {
      fetchItems(1);
    }
  }, [itemsPerPage]);

  const handleConfirmChange = (index, value) => {
    const newItems = [...items];
    newItems[index].warehouseConfirm = value;
    newItems[index].isDirty = true; // Đánh dấu đã thay đổi
    setItems(newItems);
  };

  const handleBatchConfirm = async () => {
    try {
      const updates = items
        .filter((item) => item.isDirty)
        .map((item) => ({
          orderId: item.orderId,
          itemIndex: item.itemIndex,
          value: item.warehouseConfirm,
        }));

      if (updates.length === 0) {
        toast.info("Không có thay đổi nào để xác nhận");
        return;
      }

      setLoading(true);
      await orderService.confirmWarehouseBatch(updates);
      toast.success(`Đã xác nhận ${updates.length} hàng hóa`);

      // Reset dirty flag
      setItems(items.map((item) => ({ ...item, isDirty: false })));
      fetchItems(); // Refresh data
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xác nhận hàng loạt");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Excel export function
  const handleExportExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = items.map((item, index) => ({
        STT: index + 1,
        Ngày: formatDate(item.orderDate),
        "Khách hàng": item.customerName || "",
        "Ghi chú KH": item.customerNote || "",
        "Tên hàng hóa": item.productName,
        "Kích thước": item.size || "",
        ĐVT: item.unit,
        "Số lượng": item.quantity,
        "Xác nhận": item.warehouseConfirm || "",
        Kho: user?.warehouseCode || "",
        "Số cm": item.cmQty || "",
        "Ghi chú": item.note || "",
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Dashboard Kho");

      // Set column widths
      const colWidths = [
        { wch: 5 }, // STT
        { wch: 12 }, // Ngày
        { wch: 30 }, // Khách hàng
        { wch: 25 }, // Ghi chú KH
        { wch: 40 }, // Tên hàng hóa
        { wch: 12 }, // Kích thước
        { wch: 8 }, // ĐVT
        { wch: 10 }, // Số lượng
        { wch: 10 }, // Xác nhận
        { wch: 8 }, // Kho
        { wch: 10 }, // Số cm
        { wch: 30 }, // Ghi chú
      ];
      ws["!cols"] = colWidths;

      // Generate filename with current date and warehouse code
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "");
      const fileName = `Dashboard_Kho_${
        user?.warehouseCode || ""
      }_${dateStr}_${timeStr}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);
      toast.success("Xuất file Excel thành công!");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Lỗi khi xuất file Excel");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Dashboard Kho {user?.warehouseCode}
          </h1>
          <p className="text-gray-500">Xác nhận hàng hóa ra/vào kho</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Nút Trang chủ */}
          <Link to="/">
            <Button variant="outline" className="gap-2 shadow-sm font-medium">
              <Home className="w-4 h-4" />
              Trang chủ
            </Button>
          </Link>

          {/* Nút Danh sách đơn hàng */}
          <Link to="/orders">
            <Button variant="outline" className="gap-2 shadow-sm font-medium">
              <List className="w-4 h-4" />
              Đơn hàng
            </Button>
          </Link>

          <div className="h-9 w-px bg-primary" />

          {/* Nút Dashboard Kho (Đang ở trang này) */}
          <Button
            variant="outline"
            className="gap-2 shadow-sm font-medium text-purple-600 border-purple-200 bg-purple-50 cursor-default"
          >
            <Warehouse className="w-4 h-4" />
            Dashboard Kho
          </Button>
        </div>
      </div>

      <Card className="gap-0  max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Search className="w-4 h-4" />
            Bộ lọc tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <span className="text-sm font-medium">Từ ngày:</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Đến ngày:</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-[180px]"
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Trạng thái:</span>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="unconfirmed">Chưa xác nhận</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading}
              variant="gradient"
              className="gap-2"
            >
              <Search className="w-4 h-4" />
              Tìm kiếm
            </Button>
            <Button
              onClick={handleBatchConfirm}
              disabled={loading || !items.some((it) => it.isDirty)}
              variant="gradient"
            >
              Xác nhận
            </Button>
            <Button
              onClick={handleExportExcel}
              disabled={loading || items.length === 0}
              variant="gradient"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-7xl mx-auto">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-primary">Ngày</TableHead>
                <TableHead className=" text-primary">Khách hàng</TableHead>
                <TableHead className="text-primary">Tên hàng hóa</TableHead>
                <TableHead className="w-[80px] text-primary">KT</TableHead>
                <TableHead className="w-[80px] text-primary">ĐVT</TableHead>
                <TableHead className="w-[80px] text-primary">SL</TableHead>
                <TableHead className="w-[80px] text-primary">
                  Xác nhận
                </TableHead>
                <TableHead className="w-[80px] text-primary">Kho</TableHead>
                <TableHead className="text-primary">Số cm</TableHead>
                <TableHead className="w-[150px] text-primary">
                  Ghi chú
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-gray-500"
                  >
                    Không có hàng hóa nào trong khoảng thời gian này
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow
                    key={item.itemId || index}
                    className={
                      item.isDirty
                        ? "bg-orange-50"
                        : item.warehouseConfirm
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200"
                    }
                  >
                    {/* ngày tháng */}
                    <TableCell className="font-medium">
                      {formatDate(item.orderDate)}
                    </TableCell>
                    {/* khách hàng */}
                    <TableCell className="min-w-[250px] break-words whitespace-normal">
                      <div className="font-medium break-words whitespace-normal uppercase">
                        {item.customerName}
                      </div>
                      {item.customerNote && (
                        <div
                          className="text-xs text-gray-500 break-words whitespace-normal"
                          title={item.customerNote}
                        >
                          {item.customerNote}
                        </div>
                      )}
                    </TableCell>
                    {/* tên hàng hóa */}
                    <TableCell className="font-medium min-w-[350px] break-words whitespace-normal">
                      {item.productName}
                    </TableCell>
                    {/* kích thước */}
                    <TableCell className="w-[80px]">{item.size}</TableCell>
                    {/* đơn vị tính */}
                    <TableCell>{item.unit}</TableCell>
                    {/* số lượng */}
                    <TableCell className=" font-bold">
                      {item.quantity}
                    </TableCell>
                    {/* xác nhận */}
                    <TableCell
                      className={` ${
                        item.warehouseConfirm
                          ? "border-green-300"
                          : "border-gray-200"
                      }`}
                    >
                      <Input
                        value={item.warehouseConfirm}
                        onChange={(e) =>
                          handleConfirmChange(index, e.target.value)
                        }
                        placeholder="..."
                        className={`h-8 bg-white ${
                          item.isDirty
                            ? "border-orange-400 bg-orange-50"
                            : item.warehouseConfirm
                            ? "border-green-400 bg-green-50"
                            : "border-gray-200"
                        }`}
                      />
                    </TableCell>
                    {/* kho */}
                    <TableCell>{user?.warehouseCode}</TableCell>
                    <TableCell className="text-right">{item.cmQty}</TableCell>
                    <TableCell
                      className="text-xs text-gray-500 min-w-[250px] break-words whitespace-normal"
                      title={item.note}
                    >
                      {item.note}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <CardContent className="pt-4 border-t">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Items info */}
              <div className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                -{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{" "}
                trong tổng số <span className="font-medium">{totalItems}</span>{" "}
                hàng hóa
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchItems(currentPage - 1)}
                  disabled={!totalPages || currentPage === 1 || loading}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trước
                </Button>

                <div className="flex items-center gap-1">
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant={1 === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => fetchItems(1)}
                        disabled={loading}
                        className="w-9 h-9 p-0"
                      >
                        1
                      </Button>
                      {currentPage > 4 && (
                        <span className="text-gray-400 px-1">...</span>
                      )}
                    </>
                  )}

                  {/* Pages around current */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === currentPage ||
                        page === currentPage - 1 ||
                        page === currentPage + 1 ||
                        page === currentPage - 2 ||
                        page === currentPage + 2
                    )
                    .filter((page) => page > 0 && page <= totalPages)
                    .map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => fetchItems(page)}
                        disabled={loading}
                        className="w-9 h-9 p-0"
                      >
                        {page}
                      </Button>
                    ))}

                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="text-gray-400 px-1">...</span>
                      )}
                      <Button
                        variant={
                          totalPages === currentPage ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => fetchItems(totalPages)}
                        disabled={loading}
                        className="w-9 h-9 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchItems(currentPage + 1)}
                  disabled={
                    !totalPages || currentPage === totalPages || loading
                  }
                  className="gap-1"
                >
                  Sau
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Items per page selector */}
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
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default WarehouseDashboard;
