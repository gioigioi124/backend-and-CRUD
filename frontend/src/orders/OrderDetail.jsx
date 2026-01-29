import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Truck,
  Package,
  Calendar,
  Printer,
  FileDown,
  Eye,
  Box,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx";
import { orderService } from "@/services/orderService";

const OrderDetail = ({ order, onEdit, onDelete, vehicle, onPrint }) => {
  const [viewMode, setViewMode] = useState(1); // 1: Đơn hàng hiện tại, 2: Cả xe
  const [vehicleOrders, setVehicleOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    // Luôn về view đơn hàng khi đổi order
    setViewMode(1);
    setVehicleOrders([]);
  }, [order?._id]);

  useEffect(() => {
    const fetchVehicleOrders = async () => {
      if (!order) return;

      // Xác định vehicleId từ object hoặc string
      const vehicleId =
        order?.vehicle?._id ||
        (typeof order?.vehicle === "string" ? order?.vehicle : null);

      if (viewMode === 2 && vehicleId) {
        try {
          setLoadingOrders(true);
          const response = await orderService.getOrdersByVehicle(vehicleId);

          // Xử lý các dạng cấu trúc trả về khác nhau của API
          let data = [];
          if (Array.isArray(response)) {
            data = response;
          } else if (response.orders && Array.isArray(response.orders)) {
            data = response.orders;
          } else if (response.data && Array.isArray(response.data)) {
            data = response.data;
          } else if (response.docs && Array.isArray(response.docs)) {
            data = response.docs;
          }

          setVehicleOrders(data);
        } catch (error) {
          console.error("Error fetching vehicle orders:", error);
        } finally {
          setLoadingOrders(false);
        }
      }
    };

    fetchVehicleOrders();
  }, [viewMode, order?.vehicle, order?._id]);

  if (!order) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chọn đơn hàng để xem chi tiết
      </div>
    );
  }

  // Format ngày tháng
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

  // Hàm sắp xếp items theo kho (K02→K03→K04→K01) và tên+kích thước
  const sortItems = (items, groupByCustomer = false) => {
    const warehouseOrder = { K02: 1, K03: 2, K04: 3, K01: 4 };

    return [...items].sort((a, b) => {
      if (groupByCustomer) {
        // Ưu tiên 1: Tên khách hàng
        const custA = (a.customerName || "").toLowerCase();
        const custB = (b.customerName || "").toLowerCase();
        if (custA !== custB) return custA.localeCompare(custB, "vi");

        // Ưu tiên 2: Order ID
        if (a.orderId !== b.orderId)
          return (a.orderId || "").localeCompare(b.orderId || "");
      }

      // Ưu tiên tiếp theo (hoặc duy nhất nếu không group): Sắp xếp theo kho
      const warehouseA = warehouseOrder[a.warehouse] || 999;
      const warehouseB = warehouseOrder[b.warehouse] || 999;

      if (warehouseA !== warehouseB) {
        return warehouseA - warehouseB;
      }

      // Cuối cùng: Sắp xếp theo tên + kích thước
      const nameA = `${a.productName || ""} ${a.size || ""}`
        .trim()
        .toLowerCase();
      const nameB = `${b.productName || ""} ${b.size || ""}`
        .trim()
        .toLowerCase();

      return nameA.localeCompare(nameB, "vi");
    });
  };

  // Lấy danh sách items cho toàn xe
  const getVehicleItems = () => {
    const allItems = [];
    vehicleOrders.forEach((o) => {
      if (o.items) {
        o.items.forEach((item) => {
          allItems.push({
            ...item,
            customerName: o.customer?.name || "N/A",
            orderId: o._id,
          });
        });
      }
    });
    return sortItems(allItems, true);
  };

  const currentVehicleItems = viewMode === 2 ? getVehicleItems() : [];

  // Kiểm tra trạng thái gán xe
  const isAssigned = order.vehicle !== null && order.vehicle !== undefined;

  // Sắp xếp items trước khi tính toán
  const sortedItems = order.items ? sortItems(order.items) : [];

  // Tính tổng số lượng và cm
  const totalQuantity =
    sortedItems.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const totalCmQty =
    sortedItems.reduce((sum, item) => sum + (item.cmQty || 0), 0) || 0;

  // Xử lý export Excel
  const handleExportExcel = () => {
    try {
      // Chuẩn bị dữ liệu cho Excel
      const excelData = [];

      // Header đơn hàng
      excelData.push({
        STT: "THÔNG TIN ĐƠN HÀNG",
        "Tên hàng hóa": "",
        "Kích thước": "",
        ĐVT: "",
        "Số lượng": "",
        Kho: "",
        "Số cm": "",
        "Ghi chú": "",
        "Kho xác nhận": "",
        "Điều vận xác nhận": "",
      });

      // Thông tin khách hàng
      excelData.push({
        STT: "Khách hàng:",
        "Tên hàng hóa": order.customer?.name || "N/A",
        "Kích thước": "",
        ĐVT: "",
        "Số lượng": "",
        Kho: "",
        "Số cm": "",
        "Ghi chú": "",
        "Kho xác nhận": "",
        "Điều vận xác nhận": "",
      });

      if (order.customer?.customerCode) {
        excelData.push({
          STT: "Mã KH:",
          "Tên hàng hóa": order.customer.customerCode,
          "Kích thước": "",
          ĐVT: "",
          "Số lượng": "",
          Kho: "",
          "Số cm": "",
          "Ghi chú": "",
          "Kho xác nhận": "",
          "Điều vận xác nhận": "",
        });
      }

      if (order.customer?.address) {
        excelData.push({
          STT: "Địa chỉ:",
          "Tên hàng hóa": order.customer.address,
          "Kích thước": "",
          ĐVT: "",
          "Số lượng": "",
          Kho: "",
          "Số cm": "",
          "Ghi chú": "",
          "Kho xác nhận": "",
          "Điều vận xác nhận": "",
        });
      }

      if (order.customer?.note) {
        excelData.push({
          STT: "Ghi chú KH:",
          "Tên hàng hóa": order.customer.note,
          "Kích thước": "",
          ĐVT: "",
          "Số lượng": "",
          Kho: "",
          "Số cm": "",
          "Ghi chú": "",
          "Kho xác nhận": "",
          "Điều vận xác nhận": "",
        });
      }

      // Thông tin xe nếu có
      if (isAssigned && order.vehicle) {
        excelData.push({
          STT: "Xe:",
          "Tên hàng hóa": `${order.vehicle.weight} - ${order.vehicle.destination}`,
          "Kích thước": "",
          ĐVT: "",
          "Số lượng": "",
          Kho: "",
          "Số cm": "",
          "Ghi chú": "",
          "Kho xác nhận": "",
          "Điều vận xác nhận": "",
        });
      }

      // Dòng trống
      excelData.push({
        STT: "",
        "Tên hàng hóa": "",
        "Kích thước": "",
        ĐVT: "",
        "Số lượng": "",
        Kho: "",
        "Số cm": "",
        "Ghi chú": "",
        "Kho xác nhận": "",
        "Điều vận xác nhận": "",
      });

      // Header cho bảng chi tiết hàng hóa
      excelData.push({
        STT: "STT",
        "Tên hàng hóa": "Tên hàng hóa",
        "Kích thước": "Kích thước",
        ĐVT: "ĐVT",
        "Số lượng": "Số lượng",
        Kho: "Kho",
        "Số cm": "Số cm",
        "Ghi chú": "Ghi chú",
        "Kho xác nhận": "Kho xác nhận",
        "Điều vận xác nhận": "Điều vận xác nhận",
      });

      // Thêm các items
      sortedItems.forEach((item, itemIndex) => {
        excelData.push({
          STT: itemIndex + 1,
          "Tên hàng hóa": item.productName || "",
          "Kích thước": item.size || "",
          ĐVT: item.unit || "",
          "Số lượng": item.quantity || 0,
          Kho: item.warehouse || "",
          "Số cm": item.cmQty || 0,
          "Ghi chú": item.note || "",
          "Kho xác nhận": item.warehouseConfirm?.value || "",
          "Điều vận xác nhận": item.leaderConfirm?.value || "",
        });
      });

      // Dòng tổng kết
      excelData.push({
        STT: "",
        "Tên hàng hóa": "",
        "Kích thước": "",
        ĐVT: "",
        "Số lượng": "",
        Kho: "",
        "Số cm": "",
        "Ghi chú": "",
        "Kho xác nhận": "",
        "Điều vận xác nhận": "",
      });

      excelData.push({
        STT: "TỔNG:",
        "Tên hàng hóa": `${sortedItems.length} mặt hàng`,
        "Kích thước": "",
        ĐVT: "",
        "Số lượng": totalQuantity,
        Kho: "",
        "Số cm": totalCmQty,
        "Ghi chú": "",
        "Kho xác nhận": "",
        "Điều vận xác nhận": "",
      });

      // Tạo worksheet và workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Don hang");

      // Tạo tên file
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      const customerName = order.customer?.name
        ? order.customer.name.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30)
        : "KH";
      const fileName = `Don_hang_${customerName}_${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* View Mode Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={viewMode === 1 ? "white" : "ghost"}
          size="sm"
          onClick={() => setViewMode(1)}
          className={`gap-2 ${viewMode === 1 ? "shadow-sm" : ""}`}
        >
          <Eye className="w-4 h-4" /> Đơn hàng
        </Button>
        <Button
          variant={viewMode === 2 ? "white" : "ghost"}
          size="sm"
          onClick={() => setViewMode(2)}
          disabled={!order.vehicle}
          className={`gap-2 ${viewMode === 2 ? "shadow-sm" : ""}`}
          title={!order.vehicle ? "Đơn hàng chưa được gán xe" : ""}
        >
          <Truck className="w-4 h-4" /> Xem cả xe
        </Button>
      </div>

      {/* Header với nút Edit, Print và Delete */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <h2 className="text-base md:text-lg font-semibold">
          {viewMode === 1 ? "Chi tiết đơn hàng" : "Tổng hợp đơn hàng trên xe"}
        </h2>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {viewMode === 1 && (
            <>
              {/* nút in đơn hàng */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPrint?.(order)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200 h-7 md:h-8 px-2 md:px-3 text-xs md:text-sm"
              >
                <Printer className="w-3.5 h-3.5 md:w-4 md:h-4 mr-0.5 md:mr-1" />
                <span className="hidden xs:inline">In đơn</span>
              </Button>
              {/* nút export Excel */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200 h-7 md:h-8 px-2 md:px-3 text-xs md:text-sm"
              >
                <FileDown className="w-3.5 h-3.5 md:w-4 md:h-4 mr-0.5 md:mr-1" />
                <span className="hidden xs:inline">Excel</span>
              </Button>
              {/* nút sửa đơn hàng */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(order)}
                className="h-7 md:h-8 px-2 md:px-3 text-xs md:text-sm"
              >
                <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4 mr-0.5 md:mr-1" />
                <span className="hidden xs:inline">Sửa</span>
              </Button>

              {/* nút xóa đơn hàng */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(order)}
                className="h-7 md:h-8 px-2 md:px-3 text-xs md:text-sm"
              >
                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-0.5 md:mr-1" />
                <span className="hidden xs:inline">Xóa</span>
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 w-full">
        {/* Thông tin khách hàng - Chỉ hiện ở view đơn lẻ */}
        {viewMode === 1 && (
          <Card className="w-full">
            <CardContent className="p-3 md:p-4">
              <div>
                <span className="text-base md:text-xl uppercase font-bold">
                  {order.customer?.name || "N/A"}
                </span>
              </div>
              {/* Mã KH và Địa chỉ */}
              <div className="mt-1 text-sm text-gray-600 space-y-0.5">
                {order.customer?.customerCode && (
                  <div>
                    <span className="font-medium">Mã KH:</span>{" "}
                    {order.customer.customerCode}
                    {order.customer.phone && ` - (${order.customer.phone})`}
                  </div>
                )}
                {order.customer?.address && (
                  <div>
                    <span className="font-medium">Địa chỉ:</span>{" "}
                    {order.customer.address}
                  </div>
                )}
              </div>
              {order.customer?.note && (
                <div className="mt-2">
                  <span className="text-sm italic">{order.customer.note}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Trạng thái đơn hàng / Thông tin xe */}
        <Card className="w-full">
          <CardContent className="space-y-1 p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isAssigned ? (
                  <>
                    <Truck className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      {viewMode === 1 ? "Đã gán xe" : "Thông tin xe"}
                    </span>
                    {order.vehicle && (
                      <span className="text-sm text-gray-600">
                        - {order.vehicle.weight} - {order.vehicle.time} -{" "}
                        {order.vehicle.destination}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-600 font-medium">
                      Chưa gán xe
                    </span>
                  </>
                )}
              </div>
            </div>
            {viewMode === 1 ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Ngày tạo: {formatDate(order.createdAt)}</span>
                </div>
                {order.updatedAt && order.updatedAt !== order.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Cập nhật lần cuối: {formatDate(order.updatedAt)}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-600">
                Tổng cộng:{" "}
                <span className="font-bold">{vehicleOrders.length}</span> đơn
                hàng trên xe
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Danh sách hàng hóa */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between gap-2 p-3 md:p-4">
          <CardTitle className="text-sm md:text-base">
            {viewMode === 1
              ? "Danh sách hàng hóa"
              : "Tổng hợp hàng hóa toàn xe"}
          </CardTitle>
          {/* Tổng kết */}
          <div className="flex flex-wrap text-xs md:text-sm text-gray-600 gap-2 md:gap-4">
            <div>
              Mặt hàng:{" "}
              <span className="font-semibold">
                {viewMode === 1
                  ? sortedItems.length
                  : currentVehicleItems.length}
              </span>
            </div>
            <div>
              Số lượng:{" "}
              <span className="font-semibold">
                {viewMode === 1
                  ? totalQuantity
                  : currentVehicleItems.reduce(
                      (sum, item) => sum + (item.quantity || 0),
                      0,
                    )}
              </span>
            </div>
            <div>
              Số cm:{" "}
              <span className="font-semibold text-red-600">
                {viewMode === 1
                  ? totalCmQty
                  : currentVehicleItems.reduce(
                      (sum, item) => sum + (item.cmQty || 0),
                      0,
                    )}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : viewMode === 1 ? (
            /* VIEW 1: ĐƠN HÀNG ĐANG CHỌN */
            !order.items || order.items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa có hàng hóa</p>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">STT</TableHead>
                        <TableHead className="min-w-[150px] max-w-[250px]">
                          Tên hàng hóa
                        </TableHead>
                        <TableHead className="w-[100px]">Kích thước</TableHead>
                        <TableHead className="w-[80px]">ĐVT</TableHead>
                        <TableHead className="w-[100px]">Số lượng</TableHead>
                        <TableHead className="w-[80px]">Kho</TableHead>
                        <TableHead className="w-[80px]">Số cm</TableHead>
                        <TableHead className="min-w-[120px] max-w-[200px]">
                          Ghi chú
                        </TableHead>
                        <TableHead className="w-[120px]">Kho</TableHead>
                        <TableHead className="w-[120px]">Điều vận</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-center">
                            {index + 1}
                          </TableCell>
                          <TableCell className="break-words whitespace-normal font-medium">
                            {item.productName || "-"}
                          </TableCell>
                          <TableCell>{item.size || "-"}</TableCell>
                          <TableCell>{item.unit || "-"}</TableCell>
                          <TableCell className="text-right font-bold">
                            {item.quantity || 0}
                          </TableCell>
                          <TableCell>{item.warehouse || "-"}</TableCell>
                          <TableCell className="text-right text-red-600 font-medium">
                            {item.cmQty || 0}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 break-words whitespace-normal">
                            {item.note || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.warehouseConfirm?.value || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.leaderConfirm?.value || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          ) : vehicleOrders.length === 0 ? (
            /* VIEW 2: CẢ XE - KHI KHÔNG CÓ ĐƠN */
            <p className="text-gray-500 text-center py-4">
              Chưa có hàng hóa nào trên xe
            </p>
          ) : (
            /* VIEW 2: CẢ XE - CÁC ĐƠN HÀNG NỐI TIẾP NHAU */
            <div className="space-y-8 mt-4">
              {vehicleOrders.map((vOrder, vIndex) => {
                const vItems = sortItems(vOrder.items || []);
                const isCurrentOrder = vOrder._id === order._id;

                return (
                  <div
                    key={vOrder._id || vIndex}
                    className={`space-y-4 pb-6 border-b last:border-0 ${isCurrentOrder ? "bg-blue-50/50 -mx-4 px-4 py-4 rounded-lg border border-blue-100" : ""}`}
                  >
                    {/* Header đơn hàng nối tiếp */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-100 text-gray-600 font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full">
                            {vIndex + 1}
                          </div>
                          <span className="text-base md:text-xl uppercase font-bold text-primary">
                            {vOrder.customer?.name || "N/A"}
                          </span>
                          {isCurrentOrder && (
                            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase font-bold shadow-sm">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 pl-8">
                          {vOrder.customer?.customerCode && (
                            <span className="font-medium mr-2">
                              {vOrder.customer.customerCode}
                            </span>
                          )}
                          <span>{vOrder.customer?.address}</span>
                        </div>
                        {vOrder.customer?.note && (
                          <div className="text-sm italic text-gray-500 pl-8">
                            "{vOrder.customer.note}"
                          </div>
                        )}
                      </div>

                      {/* Tổng kết nhỏ cho đơn hàng này */}
                      <div className="flex flex-wrap gap-4 text-sm bg-white p-2 rounded-lg border shadow-sm">
                        <div>
                          <span className="text-gray-500">SL:</span>{" "}
                          <span className="font-bold">
                            {vItems.reduce((s, i) => s + (i.quantity || 0), 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">CM:</span>{" "}
                          <span className="font-bold text-red-600">
                            {vItems.reduce((s, i) => s + (i.cmQty || 0), 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Table chi tiết giống hệt view đơn lẻ */}
                    <div className="border rounded-lg overflow-x-auto bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px]">STT</TableHead>
                            <TableHead className="min-w-[150px] max-w-[250px]">
                              Tên hàng hóa
                            </TableHead>
                            <TableHead className="w-[100px]">
                              Kích thước
                            </TableHead>
                            <TableHead className="w-[80px]">ĐVT</TableHead>
                            <TableHead className="w-[100px]">
                              Số lượng
                            </TableHead>
                            <TableHead className="w-[80px]">Kho</TableHead>
                            <TableHead className="w-[80px]">Số cm</TableHead>
                            <TableHead className="min-w-[120px] max-w-[200px]">
                              Ghi chú
                            </TableHead>
                            <TableHead className="w-[120px]">Kho</TableHead>
                            <TableHead className="w-[120px]">
                              Điều vận
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vItems.map((item, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-center">
                                {i + 1}
                              </TableCell>
                              <TableCell className="break-words whitespace-normal font-medium">
                                {item.productName || "-"}
                              </TableCell>
                              <TableCell>{item.size || "-"}</TableCell>
                              <TableCell>{item.unit || "-"}</TableCell>
                              <TableCell className="text-right font-bold">
                                {item.quantity || 0}
                              </TableCell>
                              <TableCell>{item.warehouse || "-"}</TableCell>
                              <TableCell className="text-right text-red-600 font-medium">
                                {item.cmQty || 0}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600 break-words whitespace-normal">
                                {item.note || "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.warehouseConfirm?.value || "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.leaderConfirm?.value || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;
