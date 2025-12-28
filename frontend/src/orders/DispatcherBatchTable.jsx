import { useState, useEffect } from "react";
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
import { Search, Zap, CheckSquare, Truck, User } from "lucide-react";
import { orderService } from "@/services/orderService";

const DispatcherBatchTable = ({
  fromDate,
  toDate,
  creator,
  refreshTrigger,
  onRefresh,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("all");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await orderService.getDispatcherItems(
        fromDate,
        toDate,
        creator,
        status
      );
      setItems(data.map((item) => ({ ...item, isDirty: false })));
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách hàng hóa điều vận");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fromDate, toDate, creator, status, refreshTrigger]);

  const handleConfirmChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    newItems[index].isDirty = true;
    setItems(newItems);
  };

  const handleBatchConfirm = async () => {
    try {
      const updates = items
        .filter((item) => item.isDirty)
        .map((item) => ({
          orderId: item.orderId,
          itemIndex: item.itemIndex,
          leaderValue: item.leaderConfirm,
          warehouseValue: item.warehouseConfirm,
        }));

      if (updates.length === 0) {
        toast.info("Không có thay đổi nào để xác nhận");
        return;
      }

      setLoading(true);
      await orderService.confirmDispatcherBatch(updates);
      toast.success(`Đã xác nhận ${updates.length} hàng hóa`);

      if (onRefresh) onRefresh();
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xác nhận hàng loạt");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    const newItems = items.map((item) => {
      if (!item.leaderConfirm) {
        return {
          ...item,
          leaderConfirm: item.warehouseConfirm || item.quantity.toString(),
          isDirty: true,
        };
      }
      return item;
    });
    setItems(newItems);
    toast.success("Đã điền nhanh số lượng thực tế dựa trên kho xác nhận");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="unconfirmed">Chưa xác nhận</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleQuickFill}
            className="gap-1 h-9"
          >
            <Zap className="w-3.5 h-3.5" /> Điền nhanh
          </Button>
        </div>

        <Button
          onClick={handleBatchConfirm}
          disabled={loading || !items.some((it) => it.isDirty)}
          className="gap-2 bg-green-600 hover:bg-green-700 h-9"
        >
          <CheckSquare className="w-4 h-4" />
          Xác nhận hàng loạt ({items.filter((it) => it.isDirty).length})
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[80px]">Ngày</TableHead>
              <TableHead>Khách hàng / Hàng hóa</TableHead>
              <TableHead className="w-[70px] text-right">SL Đơn</TableHead>
              <TableHead className="w-[100px]">Xe</TableHead>
              <TableHead className="w-[100px]">Kho XN</TableHead>
              <TableHead className="w-[120px]">Leader XN</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500 italic"
                >
                  Không có hàng hóa nào được tìm thấy
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow
                  key={item.itemId || index}
                  className={item.isDirty ? "bg-orange-50/50" : ""}
                >
                  <TableCell className="text-xs">
                    {formatDate(item.orderDate)}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-sm">
                      {item.customerName}
                    </div>
                    <div className="text-xs text-primary font-medium">
                      {item.productName}
                    </div>
                    {item.size && (
                      <div className="text-[10px] text-gray-500">
                        KT: {item.size}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                        <User className="w-2.5 h-2.5" /> {item.creatorName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.quantity}{" "}
                    <span className="text-[10px] text-gray-400">
                      {item.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                      <Truck className="w-3 h-3 text-blue-500" />
                      {item.vehiclePlate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.warehouseConfirm}
                      onChange={(e) =>
                        handleConfirmChange(
                          index,
                          "warehouseConfirm",
                          e.target.value
                        )
                      }
                      className="h-7 text-xs bg-white"
                      placeholder="Kho xác nhận..."
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.leaderConfirm}
                      onChange={(e) =>
                        handleConfirmChange(
                          index,
                          "leaderConfirm",
                          e.target.value
                        )
                      }
                      className={`h-8 text-sm font-bold text-blue-600 bg-white ${
                        item.isDirty
                          ? "border-orange-400 focus-visible:ring-orange-400"
                          : ""
                      }`}
                      placeholder="SL thực tế..."
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DispatcherBatchTable;
