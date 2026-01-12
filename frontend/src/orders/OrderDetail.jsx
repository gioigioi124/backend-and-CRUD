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

const OrderDetail = ({ order, onEdit, onDelete, vehicle, onPrint }) => {
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
  const sortItems = (items) => {
    const warehouseOrder = { K02: 1, K03: 2, K04: 3, K01: 4 };

    return [...items].sort((a, b) => {
      // Ưu tiên 1: Sắp xếp theo kho
      const warehouseA = warehouseOrder[a.warehouse] || 999;
      const warehouseB = warehouseOrder[b.warehouse] || 999;

      if (warehouseA !== warehouseB) {
        return warehouseA - warehouseB;
      }

      // Ưu tiên 2: Sắp xếp theo tên + kích thước
      const nameA = `${a.productName || ""} ${a.size || ""}`
        .trim()
        .toLowerCase();
      const nameB = `${b.productName || ""} ${b.size || ""}`
        .trim()
        .toLowerCase();

      return nameA.localeCompare(nameB, "vi");
    });
  };

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
      {/* Header với nút Edit, Print và Delete */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <h2 className="text-base md:text-lg font-semibold">
          Chi tiết đơn hàng
        </h2>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
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
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 w-full">
        {/* Thông tin khách hàng */}
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

        {/* Trạng thái đơn hàng */}
        <Card className="w-full">
          <CardContent className="space-y-1 p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isAssigned ? (
                  <>
                    <Truck className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      Đã gán xe
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
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Ngày tạo: {formatDate(order.createdAt)}</span>
            </div>
            {order.updatedAt && order.updatedAt !== order.createdAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Cập nhật lần cuối: {formatDate(order.updatedAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Danh sách hàng hóa */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between gap-2 p-3 md:p-4">
          <CardTitle className="text-sm md:text-base">
            Danh sách hàng hóa
          </CardTitle>
          {/* Tổng kết */}
          <div className="flex flex-wrap text-xs md:text-sm text-gray-600 gap-2 md:gap-4">
            <div>
              Mặt hàng:{" "}
              <span className="font-semibold">{sortedItems.length}</span>
            </div>
            <div>
              Số lượng: <span className="font-semibold">{totalQuantity}</span>
            </div>
            <div>
              Số cm:{" "}
              <span className="font-semibold text-red-600">{totalCmQty}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {!order.items || order.items.length === 0 ? (
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
                        <TableCell className="break-words whitespace-normal">
                          {item.productName || "-"}
                        </TableCell>
                        <TableCell>{item.size || "-"}</TableCell>
                        <TableCell>{item.unit || "-"}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity || 0}
                        </TableCell>
                        <TableCell>{item.warehouse || "-"}</TableCell>
                        <TableCell className="text-right">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;
