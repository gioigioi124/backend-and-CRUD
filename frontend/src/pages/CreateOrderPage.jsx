import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { orderService } from "../services/orderService";
import ItemsTable from "@/orders/ItemsTable";

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State cho thông tin khách hàng
  const [customer, setCustomer] = useState({
    name: "",
    note: "",
  });

  // State cho danh sách hàng hóa
  const [items, setItems] = useState([]);

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
        vehicle: null, // Chưa gán xe
      };

      await orderService.createOrder(orderData);
      toast.success("Tạo đơn hàng thành công!");

      // Chuyển về trang danh sách đơn hàng
      navigate("/orders");
    } catch (error) {
      toast.error(
        "Tạo đơn hàng thất bại: " +
          (error.response?.data?.message || error.message)
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tạo đơn hàng mới</h1>
        <p className="text-gray-600 mt-1">
          Điền thông tin khách hàng và danh sách hàng hóa
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin khách hàng */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">
                Tên khách hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerName"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                placeholder="Nhập tên khách hàng"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerNote">Ghi chú</Label>
              <Textarea
                id="customerNote"
                value={customer.note}
                onChange={(e) =>
                  setCustomer({ ...customer, note: e.target.value })
                }
                placeholder="Ghi chú về khách hàng (tùy chọn)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danh sách hàng hóa */}
        <Card>
          <CardContent className="pt-6">
            <ItemsTable items={items} setItems={setItems} />
          </CardContent>
        </Card>

        {/* Nút action */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo đơn hàng"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;
