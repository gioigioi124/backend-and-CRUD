import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { orderService } from "@/services/orderService";
import ItemsTable from "@/orders/ItemsTable";

const OrderEditDialog = ({ open, onOpenChange, order, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({ name: "", note: "" });
  const [items, setItems] = useState([]);
  const [orderDate, setOrderDate] = useState("");

  // Kiểm tra chế độ: tạo mới hay sửa
  const isCreateMode = !order;

  // Lấy ngày hôm nay ở định dạng YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Load dữ liệu khi mở dialog
  useEffect(() => {
    if (open) {
      if (order) {
        // Edit mode: load dữ liệu từ order
        setCustomer({
          name: order.customer?.name || "",
          note: order.customer?.note || "",
        });
        // Copy items và đảm bảo có stt
        const itemsWithStt = (order.items || []).map((item, index) => ({
          ...item,
          stt: item.stt || index + 1,
        }));
        setItems(itemsWithStt);
        // Load orderDate
        if (order.orderDate) {
          const date = new Date(order.orderDate);
          setOrderDate(date.toISOString().split("T")[0]);
        } else {
          setOrderDate(getTodayDate());
        }
      } else {
        // Create mode: reset form
        setCustomer({ name: "", note: "" });
        setItems([]);
        setOrderDate(getTodayDate()); // Mặc định là hôm nay
      }
    }
  }, [open, order]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!customer.name.trim()) {
      toast.error("Vui lòng nhập tên khách hàng");
      return;
    }

    if (items.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 hàng hóa");
      return;
    }

    // Kiểm tra từng item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productName.trim()) {
        toast.error(`Dòng ${i + 1}: Thiếu tên hàng hóa`);
        return;
      }
      if (!item.unit.trim()) {
        toast.error(`Dòng ${i + 1}: Thiếu đơn vị tính`);
        return;
      }
      if (item.quantity <= 0) {
        toast.error(`Dòng ${i + 1}: Số lượng phải lớn hơn 0`);
        return;
      }
    }

    try {
      setLoading(true);

      const orderData = {
        customer,
        items,
        orderDate,
        vehicle: order?.vehicle || null,
      };

      if (isCreateMode) {
        // Tạo mới đơn hàng
        await orderService.createOrder(orderData);
        toast.success("Tạo đơn hàng thành công!");
      } else {
        // Cập nhật đơn hàng
        await orderService.updateOrder(order._id, orderData);
        toast.success("Cập nhật đơn hàng thành công!");
      }

      // Đóng dialog và refresh
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const action = isCreateMode ? "Tạo" : "Cập nhật";
      toast.error(
        `${action} đơn hàng thất bại: ` +
          (error.response?.data?.message || error.message)
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreateMode ? "Tạo đơn hàng mới" : "Sửa đơn hàng"}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode
              ? "Điền thông tin khách hàng và danh sách hàng hóa"
              : "Cập nhật thông tin khách hàng và danh sách hàng hóa"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin khách hàng */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-customerName">
                Tên khách hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-customerName"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                placeholder="Nhập tên khách hàng"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-customerNote">Ghi chú</Label>
              <Textarea
                id="edit-customerNote"
                value={customer.note}
                onChange={(e) =>
                  setCustomer({ ...customer, note: e.target.value })
                }
                placeholder="Ghi chú về khách hàng (tùy chọn)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-orderDate">
                Ngày đơn hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-orderDate"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                min={getTodayDate()}
                required
              />
              <p className="text-xs text-gray-500">
                Chỉ được chọn ngày hôm nay hoặc ngày trong tương lai
              </p>
            </div>
          </div>

          {/* Danh sách hàng hóa */}
          <div>
            <ItemsTable items={items} setItems={setItems} />
          </div>

          {/* Nút action */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isCreateMode
                  ? "Đang tạo..."
                  : "Đang cập nhật..."
                : isCreateMode
                ? "Tạo đơn hàng"
                : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditDialog;
