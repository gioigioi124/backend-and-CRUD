import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Truck,
  Package,
  Calendar,
  Printer,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  return (
    <div className="space-y-4">
      {/* Header với nút Edit, Print và Delete */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chi tiết đơn hàng</h2>
        <div className="flex gap-2">
          {/* nút in đơn hàng */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPrint?.(order)}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
          >
            <Printer className="w-4 h-4 mr-1" />
            In đơn
          </Button>
          {/* nút sửa đơn hàng */}
          <Button variant="outline" size="sm" onClick={() => onEdit(order)}>
            <Pencil className="w-4 h-4 mr-1" />
            Sửa
          </Button>

          {/* nút xóa đơn hàng */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(order)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Xóa
          </Button>
        </div>
      </div>
      <div className="flex gap-2 w-full">
        {/* Thông tin khách hàng */}
        <Card className="w-full">
          <CardContent>
            <div>
              <span className="text-xl uppercase font-bold">
                {order.customer?.name || "N/A"}
              </span>
            </div>
            {order.customer?.note && (
              <div>
                <span className="text-sm italic">{order.customer.note}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trạng thái đơn hàng */}
        <Card className="w-full">
          <CardContent className="space-y-1">
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
                        - {order.vehicle.weight} - {order.vehicle.destination}
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
        <CardHeader className="flex justify-between">
          <CardTitle>Danh sách hàng hóa</CardTitle>
          {/* Tổng kết */}
          <div className="flex text-sm text-gray-600 space-x-4">
            <div>
              Tổng số mặt hàng:{" "}
              <span className="font-semibold">{sortedItems.length}</span>
            </div>
            <div>
              Tổng số lượng:{" "}
              <span className="font-semibold">{totalQuantity}</span>
            </div>
            <div>
              Tổng số cm:{" "}
              <span className="font-semibold text-red-600">{totalCmQty}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!order.items || order.items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Chưa có hàng hóa</p>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
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
