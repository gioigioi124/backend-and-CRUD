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
import { Calendar, Search } from "lucide-react";
import { orderService } from "@/services/orderService";
import { useAuth } from "@/context/AuthContext";

const WarehouseDashboard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Date filter
  // Date filter - mặc định là ngày hôm nay
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());
  const [status, setStatus] = useState("all");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await orderService.getWarehouseItems(
        fromDate,
        toDate,
        status
      );
      setItems(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách hàng hóa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []); // Chỉ fetch lần đầu khi load trang

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Dashboard Kho {user?.warehouseCode}
          </h1>
          <p className="text-gray-500">Xác nhận hàng hóa ra/vào kho</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
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

            <Button onClick={fetchItems} disabled={loading} className="gap-2">
              <Search className="w-4 h-4" />
              Tìm kiếm
            </Button>
            <Button
              onClick={handleBatchConfirm}
              disabled={loading || !items.some((it) => it.isDirty)}
              className="bg-green-600 hover:bg-green-700"
            >
              Xác nhận
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Ngày</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Tên hàng hóa</TableHead>
                <TableHead className="w-[80px]">KT</TableHead>
                <TableHead className="w-[80px]">ĐVT</TableHead>
                <TableHead className="w-[80px]">SL</TableHead>
                <TableHead className="w-[80px]">Kho</TableHead>
                <TableHead className="w-[80px]">Số cm</TableHead>
                <TableHead className="min-w-[150px]">Ghi chú</TableHead>
                <TableHead className="w-[150px]">Xác nhận</TableHead>
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
                    className={item.isDirty ? "bg-orange-50" : ""}
                  >
                    <TableCell className="font-medium">
                      {formatDate(item.orderDate)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.customerName}</div>
                      {item.customerNote && (
                        <div
                          className="text-xs text-gray-500 truncate max-w-[150px]"
                          title={item.customerNote}
                        >
                          {item.customerNote}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right font-bold">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-center">
                      {user?.warehouseCode}
                    </TableCell>
                    <TableCell className="text-right">{item.cmQty}</TableCell>
                    <TableCell
                      className="text-sm text-gray-500 max-w-[200px] truncate"
                      title={item.note}
                    >
                      {item.note}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.warehouseConfirm}
                        onChange={(e) =>
                          handleConfirmChange(index, e.target.value)
                        }
                        placeholder="Nhập..."
                        className={`h-8 bg-white ${
                          item.isDirty ? "border-orange-400" : "border-gray-200"
                        }`}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseDashboard;
