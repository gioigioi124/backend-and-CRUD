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
  X,
  Eye,
  CheckCircle2,
  CheckSquare,
  Zap,
} from "lucide-react";
import { orderService } from "@/services/orderService";
import { toast } from "sonner";

const DispatcherOrderDetail = ({ order, vehicle, onUnassign, onRefresh }) => {
  const [viewMode, setViewMode] = useState(1); // 1: Staff, 2: Confirm, 3: Final
  const [localItems, setLocalItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order && order.items) {
      setLocalItems(
        order.items.map((item) => ({
          ...item,
          warehouseConfirmValue: item.warehouseConfirm?.value || "",
          leaderConfirmValue: item.leaderConfirm?.value || "",
        }))
      );
    } else {
      setLocalItems([]);
    }
  }, [order]);

  if (!order) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chọn đơn hàng để xem chi tiết
      </div>
    );
  }

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

  const isAssigned = order.vehicle !== null && order.vehicle !== undefined;
  const belongsToSelectedVehicle =
    vehicle &&
    order.vehicle &&
    (order.vehicle._id === vehicle._id || order.vehicle === vehicle._id);

  const handleInputChange = (index, field, value) => {
    const newItems = [...localItems];
    newItems[index][field] = value;
    setLocalItems(newItems);
  };

  const handleQuickFill = () => {
    const newItems = localItems.map((item) => ({
      ...item,
      warehouseConfirmValue: item.quantity.toString(),
      leaderConfirmValue: item.quantity.toString(),
    }));
    setLocalItems(newItems);
    toast.success("Đã điền nhanh số lượng thực tế");
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const updates = localItems.map((item) => ({
        _id: item._id,
        warehouseConfirm: { value: item.warehouseConfirmValue },
        leaderConfirm: { value: item.leaderConfirmValue },
      }));

      await orderService.confirmOrderDetails(order._id, updates);
      toast.success("Xác nhận thông tin đơn hàng thành công!");
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

  // View 3 logic: Filter leaderConfirm.value > 0
  const finalItems = order.items.filter((item) => {
    const val = parseFloat(item.leaderConfirm?.value);
    return !isNaN(val) && val > 0;
  });

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

      {/* Basic Info */}
      <Card>
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Khách hàng</p>
              <p className="text-lg font-bold">
                {order.customer?.name || "N/A"}
              </p>
              {order.customer?.note && (
                <p className="text-sm text-gray-600">{order.customer.note}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">
                Trạng thái gán xe
              </p>
              <div className="flex items-center gap-1 justify-end">
                {isAssigned ? (
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    <Truck className="w-4 h-4" /> Đã gán
                  </span>
                ) : (
                  <span className="text-orange-600 font-bold flex items-center gap-1">
                    <Package className="w-4 h-4" /> Chưa gán
                  </span>
                )}
              </div>
              {belongsToSelectedVehicle && onUnassign && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-red-500 h-auto p-0 mt-1"
                  onClick={() => onUnassign(order)}
                >
                  Bỏ gán khỏi xe
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Ngày tạo:{" "}
              {formatDate(order.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md">
            {viewMode === 1 && "Danh sách hàng hóa"}
            {viewMode === 2 && "Xác nhận hàng hóa thực tế"}
            {viewMode === 3 && "Hàng hóa thực tế trên xe"}
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
                <CheckSquare className="w-3 h-3" /> Xác nhận
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[50px] text-center">STT</TableHead>
                  <TableHead>Tên hàng hóa</TableHead>
                  <TableHead className="w-[80px]">ĐVT</TableHead>
                  <TableHead className="w-[80px] text-right">
                    {viewMode === 3 ? "SL Chốt" : "SL Đơn"}
                  </TableHead>
                  {viewMode === 2 && (
                    <>
                      <TableHead className="w-[120px]">Kho XN</TableHead>
                      <TableHead className="w-[120px]">Leader XN</TableHead>
                    </>
                  )}
                  {viewMode === 1 && (
                    <>
                      <TableHead className="w-[100px] text-center">
                        Kho XN
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
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
                      <TableRow key={index}>
                        <TableCell className="text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.productName}
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right font-bold text-blue-600 text-lg">
                          {item.leaderConfirm?.value || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-4 text-gray-500 italic"
                      >
                        Chưa có hàng hóa nào được chốt (hoặc tất cả SL = 0)
                      </TableCell>
                    </TableRow>
                  )
                ) : (
                  localItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">
                        {item.stt || index + 1}
                      </TableCell>
                      <TableCell>
                        <div>{item.productName}</div>
                        {item.size && (
                          <div className="text-xs text-gray-500">
                            {item.size}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right font-medium">
                        {item.quantity}
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
                              className="h-8 text-sm"
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
                              className="h-8 text-sm font-bold text-blue-600"
                              type="text"
                              placeholder="Số lượng..."
                            />
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-center">
                            {item.warehouseConfirm?.value || "-"}
                          </TableCell>
                          <TableCell className="text-center font-medium text-blue-600">
                            {item.leaderConfirm?.value || "-"}
                          </TableCell>
                        </>
                      )}

                      <TableCell
                        className="text-sm text-gray-500 max-w-[150px] truncate"
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
      </Card>
    </div>
  );
};

export default DispatcherOrderDetail;
