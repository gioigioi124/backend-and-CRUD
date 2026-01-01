import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Truck,
  Package,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Zap,
  Printer,
  Eye,
} from "lucide-react";
import { orderService } from "@/services/orderService";
import { toast } from "sonner";

const DispatcherOrderDetail = ({
  orders = [],
  selectedOrder,
  vehicle,
  onRefresh,
  onPrintManifest,
}) => {
  const [viewMode, setViewMode] = useState(1); // 1: Staff, 2: Confirm, 3: Final
  const [localItems, setLocalItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hàm sắp xếp items theo đơn hàng (khách hàng) → kho (K02→K03→K04→K01) → tên+kích thước
  const sortItems = (items) => {
    const warehouseOrder = { K02: 1, K03: 2, K04: 3, K01: 4 };

    return [...items].sort((a, b) => {
      // Ưu tiên 1: Sắp xếp theo đơn hàng (tên khách hàng)
      const customerA = (a.customerName || "").toLowerCase();
      const customerB = (b.customerName || "").toLowerCase();

      if (customerA !== customerB) {
        return customerA.localeCompare(customerB, "vi");
      }

      // Ưu tiên 2: Sắp xếp theo kho
      const warehouseA = warehouseOrder[a.warehouse] || 999;
      const warehouseB = warehouseOrder[b.warehouse] || 999;

      if (warehouseA !== warehouseB) {
        return warehouseA - warehouseB;
      }

      // Ưu tiên 3: Sắp xếp theo tên + kích thước
      const nameA = `${a.productName || ""} ${a.size || ""}`
        .trim()
        .toLowerCase();
      const nameB = `${b.productName || ""} ${b.size || ""}`
        .trim()
        .toLowerCase();

      return nameA.localeCompare(nameB, "vi");
    });
  };

  useEffect(() => {
    if (orders && orders.length > 0) {
      // Biến đổi toàn bộ items từ tất cả đơn hàng thành mặt bằng phẳng để xử lý một lần
      const allItems = [];
      orders.forEach((order) => {
        if (order.items) {
          order.items.forEach((item, index) => {
            allItems.push({
              ...item,
              orderId: order._id,
              orderDate: order.orderDate,
              customerName: order.customer?.name || "N/A",
              customerNote: order.customer?.note || "",
              itemIndex: index, // Lưu lại index nguyên bản trong đơn hàng
              warehouseConfirmValue: item.warehouseConfirm?.value || "",
              leaderConfirmValue: item.leaderConfirm?.value || "",
            });
          });
        }
      });

      // Sắp xếp items theo kho và tên
      const sortedItems = sortItems(allItems);

      // Cập nhật lại STT sau khi sắp xếp
      const itemsWithNewStt = sortedItems.map((item, index) => ({
        ...item,
        stt: index + 1,
      }));

      setLocalItems(itemsWithNewStt);
    } else {
      setLocalItems([]);
    }
  }, [orders]);

  if (!vehicle) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chọn xe để xem chi tiết các đơn hàng cần xác nhận
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Xe này chưa được gán đơn hàng nào
      </div>
    );
  }

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (!includeTime) return date.toLocaleDateString("vi-VN");
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleInputChange = (index, field, value) => {
    const newItems = [...localItems];
    newItems[index][field] = value;
    setLocalItems(newItems);
  };

  const handleQuickFill = () => {
    const newItems = localItems.map((item) => ({
      ...item,
      // Ưu tiên lấy từ kho xác nhận, nếu ko có thì lấy từ SL đơn
      leaderConfirmValue:
        item.warehouseConfirmValue || item.quantity.toString(),
      warehouseConfirmValue:
        item.warehouseConfirmValue || item.quantity.toString(),
    }));
    setLocalItems(newItems);
    toast.success("Đã điền nhanh số lượng thực tế");
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      // Chuẩn bị dữ liệu cho batch update
      const updates = localItems.map((item) => ({
        orderId: item.orderId,
        itemIndex: item.itemIndex,
        leaderValue: item.leaderConfirmValue,
        warehouseValue: item.warehouseConfirmValue,
      }));

      await orderService.confirmDispatcherBatch(updates);
      toast.success("Xác nhận thông tin toàn bộ xe thành công!");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      toast.error(
        "Xác nhận thất bại: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // View 3 logic: Filter leaderConfirmValue > 0 or item.leaderConfirm.value > 0
  const finalItems = localItems.filter((item) => {
    const val = parseFloat(item.leaderConfirmValue);
    return !isNaN(val) && val > 0;
  });

  // Highlight logic for selected order
  const isItemSelected = (orderId) =>
    selectedOrder && selectedOrder._id === orderId;

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
          <Eye className="w-4 h-4" /> Chi tiết
        </Button>
        <Button
          variant={viewMode === 2 ? "white" : "ghost"}
          size="sm"
          onClick={() => setViewMode(2)}
          className={`gap-2 ${viewMode === 2 ? "shadow-sm" : ""}`}
        >
          <CheckSquare className="w-4 h-4" /> Xác nhận
        </Button>
        <Button
          variant={viewMode === 3 ? "white" : "ghost"}
          size="sm"
          onClick={() => setViewMode(3)}
          className={`gap-2 ${viewMode === 3 ? "shadow-sm" : ""}`}
        >
          <CheckCircle2 className="w-4 h-4" /> Chốt đơn
        </Button>
      </div>

      {/* Basic Info: Show Vehicle instead of single Order */}
      <Card>
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Đang điều phối xe
              </p>
              <p className="text-xl font-bold text-primary">
                {vehicle?.licensePlate || "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                {orders.length} đơn hàng - {localItems.length} mặt hàng
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Ngày vận hành</p>
              <div className="flex items-center gap-1 justify-end font-bold text-gray-700">
                <Calendar className="w-4 h-4" />{" "}
                {formatDate(orders[0]?.orderDate)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md">
            {viewMode === 1 && "Chi tiết hàng hóa toàn xe"}
            {viewMode === 2 && "Xác nhận hàng hóa thực tế (Cả xe)"}
            {viewMode === 3 && "Hàng hóa thực tế chốt trên xe"}
          </CardTitle>
          {viewMode === 2 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleQuickFill}
                className="gap-1 h-8"
              >
                <Zap className="w-3 h-3" /> Điền nhanh
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={loading}
                className="gap-1 h-8 bg-green-600 hover:bg-green-700"
              >
                <CheckSquare className="w-3 h-3" /> Xác nhận xe
              </Button>
            </div>
          )}
          {viewMode === 3 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPrintManifest(finalItems)}
              className="gap-1 h-8 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Printer className="w-3.5 h-3.5" /> In Bảng kê
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[40px] text-center">STT</TableHead>
                  <TableHead className="min-w-[150px]">
                    Khách hàng / Hàng hóa
                  </TableHead>
                  <TableHead className="w-[60px] text-right">
                    {viewMode === 3 ? "SL Chốt" : "SL Đơn"}
                  </TableHead>
                  {viewMode === 2 && (
                    <>
                      <TableHead className="w-[100px]">Kho XN</TableHead>
                      <TableHead className="w-[100px]">Leader XN</TableHead>
                    </>
                  )}
                  {viewMode === 1 && (
                    <>
                      <TableHead className="w-[80px] text-center">
                        Kho XN
                      </TableHead>
                      <TableHead className="w-[80px] text-center">
                        Leader XN
                      </TableHead>
                    </>
                  )}
                  {viewMode !== 3 && <TableHead>Ghi chú</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewMode === 3 ? (
                  finalItems.length > 0 ? (
                    finalItems.map((item, index) => (
                      <TableRow
                        key={index}
                        className={
                          isItemSelected(item.orderId) ? "bg-blue-50" : ""
                        }
                      >
                        <TableCell
                          className={`text-center ${
                            isItemSelected(item.orderId)
                              ? "border-l-4 border-l-blue-500"
                              : ""
                          }`}
                        >
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="text-[10px] text-gray-400 uppercase font-bold">
                            {item.customerName}
                          </div>
                          <div className="font-medium">{item.productName}</div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-600 text-lg">
                          {item.leaderConfirmValue || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-4 text-gray-500 italic"
                      >
                        Chưa có hàng hóa nào được chốt (hoặc tất cả SL = 0)
                      </TableCell>
                    </TableRow>
                  )
                ) : (
                  localItems.map((item, index) => (
                    <TableRow
                      key={index}
                      className={
                        isItemSelected(item.orderId) ? "bg-blue-50" : ""
                      }
                    >
                      <TableCell
                        className={`text-center ${
                          isItemSelected(item.orderId)
                            ? "border-l-4 border-l-blue-500"
                            : ""
                        }`}
                      >
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="text-[10px] text-gray-400 uppercase font-bold">
                          {item.customerName}
                        </div>
                        <div className="text-sm">{item.productName}</div>
                        {item.size && (
                          <div className="text-[10px] text-gray-500">
                            KT: {item.size}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.quantity}{" "}
                        <span className="text-[10px] text-gray-400">
                          {item.unit}
                        </span>
                      </TableCell>

                      {viewMode === 2 ? (
                        <>
                          <TableCell>
                            <Input
                              value={item.warehouseConfirmValue}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "warehouseConfirmValue",
                                  e.target.value
                                )
                              }
                              className="h-7 text-xs"
                              placeholder="K01..."
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.leaderConfirmValue}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "leaderConfirmValue",
                                  e.target.value
                                )
                              }
                              className="h-7 text-xs font-bold text-blue-600"
                              type="text"
                              placeholder="SL..."
                            />
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-center text-xs">
                            {item.warehouseConfirmValue || "-"}
                          </TableCell>
                          <TableCell className="text-center text-xs font-medium text-blue-600">
                            {item.leaderConfirmValue || "-"}
                          </TableCell>
                        </>
                      )}

                      <TableCell
                        className="text-[10px] text-gray-500 max-w-[100px] truncate"
                        title={item.customerNote + " | " + item.note}
                      >
                        {item.note || item.customerNote || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatcherOrderDetail;
