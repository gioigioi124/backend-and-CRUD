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
import CustomerAutocomplete from "@/components/CustomerAutocomplete";
import ShortcutManagerDialog from "@/components/config/ShortcutManagerDialog";
import { Keyboard, ChevronDown, ChevronUp, Plus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const OrderEditDialog = ({ open, onOpenChange, order, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showShortcutDialog, setShowShortcutDialog] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    customerCode: "",
    address: "",
    phone: "",
    note: "",
  });
  const [items, setItems] = useState([]);
  const [orderDate, setOrderDate] = useState("");

  // Surplus/Deficit auto-fill state
  const [surplusDeficitItems, setSurplusDeficitItems] = useState([]);
  const [loadingSurplusDeficit, setLoadingSurplusDeficit] = useState(false);
  const [showSurplusDeficit, setShowSurplusDeficit] = useState(true);

  // Kiểm tra chế độ: tạo mới hay sửa
  const isCreateMode = !order;

  // Lấy ngày hôm nay ở định dạng YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
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

  // Load dữ liệu khi mở dialog
  useEffect(() => {
    if (open) {
      if (order) {
        // Edit mode: load dữ liệu từ order
        setCustomer({
          name: order.customer?.name || "",
          customerCode: order.customer?.customerCode || "",
          address: order.customer?.address || "",
          phone: order.customer?.phone || "",
          note: order.customer?.note || "",
        });
        // Copy items và đảm bảo có stt
        const itemsWithStt = (order.items || []).map((item, index) => ({
          ...item,
          stt: item.stt || index + 1,
        }));

        // Sắp xếp items theo kho và tên
        const sortedItems = sortItems(itemsWithStt);

        // Cập nhật lại STT sau khi sắp xếp
        const itemsWithNewStt = sortedItems.map((item, index) => ({
          ...item,
          stt: index + 1,
        }));

        setItems(itemsWithNewStt);

        // Load orderDate
        if (order.orderDate) {
          const date = new Date(order.orderDate);
          setOrderDate(date.toISOString().split("T")[0]);
        } else {
          setOrderDate(getTodayDate());
        }
      } else {
        // Create mode: reset form
        setCustomer({
          name: "",
          customerCode: "",
          address: "",
          phone: "",
          note: "",
        });
        // Mặc định có 1 dòng với số lượng = 1
        setItems([
          {
            stt: 1,
            productName: "",
            size: "",
            unit: "Cái",
            quantity: 1,
            warehouse: "",
            cmQty: 0,
            note: "",
          },
        ]);
        setOrderDate(getTodayDate()); // Mặc định là hôm nay
      }
    }
  }, [open, order]);

  // Fetch surplus/deficit data when customer changes
  useEffect(() => {
    const fetchSurplusDeficit = async () => {
      if (!open || !customer.name || !customer.name.trim()) {
        setSurplusDeficitItems([]);
        return;
      }

      try {
        setLoadingSurplusDeficit(true);
        const response = await orderService.getSurplusDeficitByCustomer(
          customer.name
        );
        // Filter only items with deficit (thiếu - negative values)
        let deficitItems = (response.data || []).filter(
          (item) => item.deficit < 0
        );

        // Sort by order date (most recent first) and limit to 20 items
        deficitItems = deficitItems
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
          .slice(0, 20);

        setSurplusDeficitItems(deficitItems);
      } catch (error) {
        console.error("Error fetching surplus/deficit:", error);
        setSurplusDeficitItems([]);
      } finally {
        setLoadingSurplusDeficit(false);
      }
    };

    fetchSurplusDeficit();
  }, [open, customer.name]);

  // Handler to auto-fill item from surplus/deficit
  const handleFillDeficit = (deficitItem) => {
    // Create new item with deficit quantity (absolute value)
    const newItem = {
      stt: items.length + 1,
      productName: deficitItem.productName,
      size: deficitItem.size || "",
      unit: deficitItem.unit,
      quantity: Math.abs(deficitItem.deficit), // Use absolute value of deficit
      warehouse: deficitItem.warehouse,
      cmQty: 0,
      note: deficitItem.note || "",
    };

    // Add to items and sort
    const updatedItems = [...items, newItem];
    const sortedItems = sortItems(updatedItems);

    // Update STT after sorting
    const itemsWithNewStt = sortedItems.map((item, index) => ({
      ...item,
      stt: index + 1,
    }));

    setItems(itemsWithNewStt);
    toast.success(`Đã thêm "${deficitItem.productName}" vào đơn hàng`);
  };

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

  // Xử lý phím tắt Ctrl+Enter để submit form
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <ShortcutManagerDialog
        open={showShortcutDialog}
        onOpenChange={setShowShortcutDialog}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-6xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{isCreateMode ? "Tạo đơn hàng mới" : "Sửa đơn hàng"}</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => setShowShortcutDialog(true)}
              >
                <Keyboard className="w-4 h-4" />
                Xem phím tắt
              </Button>
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault(); // Ngăn submit mặc định
            }}
            onKeyDown={handleKeyDown}
            className="space-y-6"
          >
            {/* Thông tin khách hàng */}
            <div className="grid grid-cols-8 gap-4">
              {/* Customer Autocomplete - 3 columns */}
              <div className="col-span-3">
                <CustomerAutocomplete
                  value={customer}
                  onChange={setCustomer}
                  required={true}
                />
              </div>

              {/* Ghi chú - 3 columns */}
              <div className="col-span-3 space-y-2">
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

              {/* Ngày đơn hàng - 1 column */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-orderDate">
                  Ngày đơn hàng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-orderDate"
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  min={isCreateMode ? getTodayDate() : undefined}
                  required
                  disabled={!isCreateMode && order?.vehicle}
                />
                <p className="text-xs text-gray-500">
                  {!isCreateMode && order?.vehicle
                    ? "Không thể sửa ngày đơn hàng đã gán xe"
                    : isCreateMode
                    ? "Chỉ được chọn ngày hôm nay hoặc ngày trong tương lai"
                    : "Có thể giữ nguyên ngày cũ hoặc chọn ngày mới"}
                </p>
              </div>
            </div>

            {/* Surplus/Deficit Auto-Fill Section */}
            {customer.name &&
              customer.name.trim() &&
              surplusDeficitItems.length > 0 && (
                <Collapsible
                  open={showSurplusDeficit}
                  onOpenChange={setShowSurplusDeficit}
                  className="border rounded-lg p-4 bg-yellow-50"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-between p-2 hover:bg-yellow-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-yellow-800">
                          Hàng còn thiếu từ đơn cũ
                        </span>
                        <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                          {surplusDeficitItems.length}
                        </span>
                      </div>
                      {showSurplusDeficit ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="text-xs text-gray-600 mb-2">
                      Click vào nút "Thêm" để điền tự động số lượng còn thiếu
                      vào đơn hàng
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {surplusDeficitItems.map((item, index) => (
                        <div
                          key={`${item.orderId}-${item.itemId}-${index}`}
                          className="flex items-center justify-between p-2 bg-white rounded border border-yellow-200 hover:border-yellow-400 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {item.productName}
                              {item.size && (
                                <span className="text-gray-500 ml-1">
                                  ({item.size})
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Kho: {item.warehouse} • Thiếu:{" "}
                              <span className="font-bold text-red-600">
                                {Math.abs(item.deficit)} {item.unit}
                              </span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="ml-2 gap-1 bg-green-50 border-green-300 hover:bg-green-100 text-green-700"
                            onClick={() => handleFillDeficit(item)}
                          >
                            <Plus className="w-3 h-3" />
                            Thêm
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            {loadingSurplusDeficit && (
              <div className="text-sm text-gray-500 text-center py-2">
                Đang tải dữ liệu hàng thiếu...
              </div>
            )}

            {/* Danh sách hàng hóa */}
            <div className="min-h-[250px]">
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
              <Button type="button" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? isCreateMode
                    ? "Đang tạo..."
                    : "Đang cập nhật..."
                  : isCreateMode
                  ? "Tạo đơn hàng (Ctrl+Enter)"
                  : "Cập nhật (Ctrl+Enter)"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderEditDialog;
