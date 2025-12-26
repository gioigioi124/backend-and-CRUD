import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Truck, Package, Calendar, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OrderDetail = ({ order, onEdit, onDelete, vehicle, onUnassign }) => {
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

  // Kiểm tra trạng thái gán xe
  const isAssigned = order.vehicle !== null && order.vehicle !== undefined;
  
  // Kiểm tra xem order có thuộc xe đang chọn không
  const belongsToSelectedVehicle = vehicle && order.vehicle && 
    (order.vehicle._id === vehicle._id || order.vehicle === vehicle._id);

  // Tính tổng số lượng và cm
  const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const totalCmQty = order.items?.reduce((sum, item) => sum + (item.cmQty || 0), 0) || 0;

  return (
    <div className="space-y-4">
      {/* Header với nút Edit và Delete */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chi tiết đơn hàng</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(order)}
          >
            <Pencil className="w-4 h-4 mr-1" />
            Sửa
          </Button>
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

      {/* Thông tin khách hàng */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-600">Tên khách hàng: </span>
            <span className="text-sm">{order.customer?.name || "N/A"}</span>
          </div>
          {order.customer?.note && (
            <div>
              <span className="text-sm font-medium text-gray-600">Ghi chú: </span>
              <span className="text-sm">{order.customer.note}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trạng thái đơn hàng */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAssigned ? (
                <>
                  <Truck className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Đã gán xe</span>
                  {order.vehicle && (
                    <span className="text-sm text-gray-600">
                      - {order.vehicle.weight} - {order.vehicle.destination}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">Chưa gán xe</span>
                </>
              )}
            </div>
            {/* Nút bỏ gán khi order thuộc xe đang chọn */}
            {belongsToSelectedVehicle && onUnassign && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUnassign(order)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Bỏ gán khỏi xe
              </Button>
            )}
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

      {/* Danh sách hàng hóa */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hàng hóa</CardTitle>
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
                      <TableHead>Tên hàng hóa</TableHead>
                      <TableHead className="w-[100px]">Kích thước</TableHead>
                      <TableHead className="w-[80px]">ĐVT</TableHead>
                      <TableHead className="w-[100px]">Số lượng</TableHead>
                      <TableHead className="w-[80px]">Kho</TableHead>
                      <TableHead className="w-[80px]">Số cm</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center">{item.stt || index + 1}</TableCell>
                        <TableCell>{item.productName || "-"}</TableCell>
                        <TableCell>{item.size || "-"}</TableCell>
                        <TableCell>{item.unit || "-"}</TableCell>
                        <TableCell className="text-right">{item.quantity || 0}</TableCell>
                        <TableCell>{item.warehouse || "-"}</TableCell>
                        <TableCell className="text-right">{item.cmQty || 0}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {item.note || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Tổng kết */}
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  Tổng số mặt hàng: <span className="font-semibold">{order.items.length}</span>
                </div>
                <div>
                  Tổng số lượng: <span className="font-semibold">{totalQuantity}</span>
                </div>
                <div>
                  Tổng số cm: <span className="font-semibold">{totalCmQty}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;

