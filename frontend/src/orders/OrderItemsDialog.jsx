import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orderService } from "@/services/orderService";
import { Loader2 } from "lucide-react";

/**
 * Dialog hiển thị thông tin items của một đơn hàng
 * Dùng để xem chi tiết đơn hàng cũ khi có hàng thiếu
 */
const OrderItemsDialog = ({ open, onOpenChange, orderId, highlightItemId }) => {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  // Fetch order data when dialog opens
  useEffect(() => {
    const fetchOrder = async () => {
      if (!open || !orderId) {
        setOrder(null);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await orderService.getOrder(orderId);
        setOrder(response);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(
          err.response?.data?.message || err.message || "Lỗi khi tải đơn hàng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [open, orderId]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Sort items like in OrderDetail
  const sortItems = (items) => {
    const warehouseOrder = { K02: 1, K03: 2, K04: 3, K01: 4 };

    return [...items].sort((a, b) => {
      // Priority 1: Sort by warehouse
      const warehouseA = warehouseOrder[a.warehouse] || 999;
      const warehouseB = warehouseOrder[b.warehouse] || 999;

      if (warehouseA !== warehouseB) {
        return warehouseA - warehouseB;
      }

      // Priority 2: Sort by name + size
      const nameA = `${a.productName || ""} ${a.size || ""}`
        .trim()
        .toLowerCase();
      const nameB = `${b.productName || ""} ${b.size || ""}`
        .trim()
        .toLowerCase();

      return nameA.localeCompare(nameB, "vi");
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Chi tiết đơn hàng
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        )}

        {error && (
          <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && order && (
          <div className="space-y-4">
            {/* Thông tin đơn hàng */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Khách hàng</p>
                <p className="font-medium">{order.customer?.name || "N/A"}</p>
                {order.customer?.address && (
                  <p className="text-sm text-gray-600 mt-1">
                    {order.customer.address}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày đơn hàng</p>
                <p className="font-medium">{formatDate(order.orderDate)}</p>
                {order.isCompensationOrder && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                    Đơn bù
                  </span>
                )}
              </div>
              {order.customer?.note && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Ghi chú khách hàng</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {order.customer.note}
                  </p>
                </div>
              )}
            </div>

            {/* Bảng items */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-12 text-center">STT</TableHead>
                    <TableHead className="min-w-[200px]">
                      Tên hàng hóa
                    </TableHead>
                    <TableHead className="w-32">Kích thước</TableHead>
                    <TableHead className="w-24 text-center">ĐVT</TableHead>
                    <TableHead className="w-24 text-center">SL</TableHead>
                    <TableHead className="w-24 text-center">Kho</TableHead>
                    <TableHead className="w-24 text-center">CM</TableHead>
                    <TableHead className="min-w-[150px]">Ghi chú</TableHead>
                    <TableHead className="w-24 text-center">Kho XN</TableHead>
                    <TableHead className="w-24 text-center">ĐV XN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortItems(order.items || []).map((item, index) => {
                    // Determine if this is the highlighted item
                    const isHighlighted =
                      highlightItemId && item._id === highlightItemId;

                    return (
                      <TableRow
                        key={item._id || index}
                        className={
                          isHighlighted
                            ? "bg-yellow-100 border-l-4 border-l-yellow-500"
                            : ""
                        }
                      >
                        <TableCell className="text-center font-medium">
                          {item.stt || index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.productName}
                            {isHighlighted && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-600 text-white">
                                Hàng thiếu
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.size || ""}</TableCell>
                        <TableCell className="text-center">
                          {item.unit}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.warehouse === "K02"
                                ? "bg-blue-100 text-blue-800"
                                : item.warehouse === "K03"
                                ? "bg-green-100 text-green-800"
                                : item.warehouse === "K04"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.warehouse || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.cmQty || 0}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600 max-w-[200px] truncate">
                            {item.note || ""}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.warehouseConfirm?.value || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.leaderConfirm?.value || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Summary info */}
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <p>
                <strong>Tổng số items:</strong> {order.items?.length || 0}
              </p>
              {highlightItemId && (
                <p className="mt-1 text-yellow-700">
                  <strong>💡 Mẹo:</strong> Item được đánh dấu vàng là hàng hóa
                  thiếu mà bạn đang quan tâm
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderItemsDialog;
