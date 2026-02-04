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
import { shortageService } from "@/services/shortageService";
import ItemsTable from "@/orders/ItemsTable";
import CustomerAutocomplete from "@/components/CustomerAutocomplete";
import ShortcutManagerDialog from "@/components/config/ShortcutManagerDialog";
import OrderItemsDialog from "@/orders/OrderItemsDialog";
import { Keyboard, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
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
    debtLimit: 0,
    currentDebt: 0,
  });
  const [items, setItems] = useState([]);
  const [orderDate, setOrderDate] = useState("");

  // Shortage auto-fill state
  const [shortageItems, setShortageItems] = useState([]);
  const [loadingShortages, setLoadingShortages] = useState(false);
  const [showShortages, setShowShortages] = useState(true);
  const [addedShortageIds, setAddedShortageIds] = useState(new Set());

  // Order items dialog state (for viewing old orders)
  const [viewOrderId, setViewOrderId] = useState(null);
  const [highlightItemId, setHighlightItemId] = useState(null);

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
          debtLimit: 0,
          currentDebt: 0,
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

  // Fetch shortage data when customer changes
  useEffect(() => {
    const fetchShortages = async () => {
      if (!open || !customer.name || !customer.name.trim()) {
        setShortageItems([]);
        setAddedShortageIds(new Set());
        return;
      }

      try {
        setLoadingShortages(true);

        const response = await shortageService.getRemainingShortages({
          customerName: customer.name.trim(),
        });

        // Flatten shortage items from all orders
        const allShortages = [];
        (response.data || []).forEach((order) => {
          order.shortageItems.forEach((item) => {
            allShortages.push({
              ...item,
              orderId: order.orderId,
              orderDate: order.orderDate,
              isCompensationOrder: order.isCompensationOrder || false,
              customerNote: order.customer?.note || "",
            });
          });
        });

        // Sort by order date (most recent first) and limit to 20 items
        const sortedShortages = allShortages
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
          .slice(0, 20);

        setShortageItems(sortedShortages);
      } catch (error) {
        console.error("Error fetching shortages:", error);
        console.error("Error details:", error.response?.data);
        setShortageItems([]);
      } finally {
        setLoadingShortages(false);
      }
    };

    fetchShortages();
  }, [open, customer.name]);

  // Handler to auto-fill item from shortage
  const handleFillShortage = (shortageItem, quantityToFill) => {
    // Calculate cmQtyPerUnit from shortage item
    // If shortageItem has cmQtyPerUnit, use it directly
    // Otherwise, calculate it from cmQty and original quantity
    let cmQtyPerUnit = shortageItem.cmQtyPerUnit || 0;

    // If cmQtyPerUnit not available but cmQty is, try to calculate it
    if (!cmQtyPerUnit && shortageItem.cmQty && shortageItem.quantity) {
      cmQtyPerUnit = shortageItem.cmQty / shortageItem.quantity;
    }

    // Calculate cmQty for the new item based on quantityToFill
    const calculatedCmQty = cmQtyPerUnit ? cmQtyPerUnit * quantityToFill : 0;

    // Create new item with shortage quantity
    const newItem = {
      stt: items.length + 1,
      productName: shortageItem.productName,
      size: shortageItem.size || "",
      unit: shortageItem.unit,
      quantity: quantityToFill,
      warehouse: shortageItem.warehouse,
      cmQty: calculatedCmQty,
      cmQtyPerUnit: cmQtyPerUnit, // Copy cmQtyPerUnit for automatic calculation
      note: shortageItem.note || "",
      // Store source info for compensation order
      sourceOrderId: shortageItem.orderId,
      sourceItemId: shortageItem.itemId,
      // Store max quantity that can be compensated (for validation)
      maxCompensateQty: quantityToFill,
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

    // Mark this shortage as added
    setAddedShortageIds((prev) => new Set(prev).add(shortageItem.itemId));

    toast.success(`Đã thêm "${shortageItem.productName}" vào đơn hàng`);
  };

  // Handler to ignore shortage
  const handleIgnoreShortage = async (shortageItem) => {
    try {
      await shortageService.ignoreShortage(
        shortageItem.orderId,
        shortageItem.itemId,
      );

      // Remove from list
      setShortageItems((prev) =>
        prev.filter((item) => item.itemId !== shortageItem.itemId),
      );

      // Nếu thiếu hàng này thuộc chính đơn hàng đang sửa, cập nhật cả state items
      // để tránh việc khi bấm "Cập nhật" đơn hàng sẽ ghi đè lại trạng thái OPEN
      if (order && shortageItem.orderId === order._id) {
        setItems((prevItems) =>
          prevItems.map((it) => {
            // it._id có thể là kiểu string hoặc object tùy theo cách data được trả về
            // nên so sánh dùng toString() cho chắc chắn
            if (it._id && it._id.toString() === shortageItem.itemId.toString()) {
              return { ...it, shortageStatus: "IGNORED" };
            }
            return it;
          }),
        );
      }

      toast.success(`Đã bỏ qua thiếu hàng "${shortageItem.productName}"`);
    } catch (error) {
      toast.error(
        "Lỗi khi bỏ qua thiếu hàng: " +
          (error.response?.data?.message || error.message),
      );
    }
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
      if (!item.size || !item.size.trim()) {
        toast.error(`Dòng ${i + 1}: Thiếu kích thước`);
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

      // Validate item bù
      if (item.sourceOrderId && item.maxCompensateQty) {
        if (item.quantity > item.maxCompensateQty) {
          toast.error(
            `Dòng ${i + 1} ("${item.productName}"): Số lượng bù (${
              item.quantity
            }) vượt quá số thiếu còn lại (${item.maxCompensateQty})`,
          );
          return;
        }
      }
    }

    try {
      setLoading(true);

      // Tạo/cập nhật đơn hàng
      // Backend tự động xử lý items bù (nếu có sourceOrderId)
      const orderData = {
        customer,
        items,
        orderDate,
        vehicle: order?.vehicle || null,
      };

      if (isCreateMode) {
        await orderService.createOrder(orderData);

        // Check xem có items bù không để hiển thị message phù hợp
        const hasCompensationItems = items.some(
          (item) => item.sourceOrderId && item.sourceItemId,
        );

        if (hasCompensationItems) {
          const normalItems = items.filter(
            (item) => !item.sourceOrderId || !item.sourceItemId,
          );

          if (normalItems.length > 0) {
            toast.success(
              "Tạo đơn hỗn hợp thành công (có cả hàng bù và hàng mới)!",
            );
          } else {
            toast.success("Tạo đơn bù thành công!");
          }
        } else {
          toast.success("Tạo đơn hàng thành công!");
        }
      } else {
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
          (error.response?.data?.message || error.message),
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
      <OrderItemsDialog
        open={!!viewOrderId}
        onOpenChange={(open) => {
          if (!open) {
            setViewOrderId(null);
            setHighlightItemId(null);
          }
        }}
        orderId={viewOrderId}
        highlightItemId={highlightItemId}
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
                  autoFocus={isCreateMode}
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

            {/* Debt Warning Banner */}
            {customer.currentDebt > customer.debtLimit && (
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm text-red-700 flex space-x-2">
                      <p>
                        Công nợ hiện tại:{" "}
                        <span className="font-bold">
                          {customer.currentDebt?.toLocaleString("vi-VN")} đ -
                        </span>
                      </p>
                      <p>
                        Giới hạn:{" "}
                        <span className="font-bold">
                          {customer.debtLimit?.toLocaleString("vi-VN")} đ -
                        </span>
                      </p>
                      <p className="font-semibold italic">
                        Đơn hàng này sẽ không thể gán xe hoặc in cho đến khi
                        thanh toán công nợ.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shortage Auto-Fill Section */}
            {customer.name &&
              customer.name.trim() &&
              shortageItems.filter((item) => !addedShortageIds.has(item.itemId))
                .length > 0 && (
                <Collapsible
                  open={showShortages}
                  onOpenChange={setShowShortages}
                  className="border rounded-lg p-2 bg-yellow-50"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full flex items-center justify-between p-1 hover:bg-yellow-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-yellow-800">
                          Hàng còn thiếu từ đơn cũ
                        </span>
                        <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                          {
                            shortageItems.filter(
                              (item) => !addedShortageIds.has(item.itemId),
                            ).length
                          }
                        </span>
                      </div>
                      {showShortages ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="text-xs text-gray-600 mb-2">
                      Click "Thêm" để bù hàng thiếu, hoặc "Bỏ qua" nếu không cần
                      bù
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {shortageItems
                        .filter((item) => !addedShortageIds.has(item.itemId))
                        .map((item, index) => {
                          const remainingShortage = item.remainingShortage || 0;
                          return (
                            <div
                              key={`${item.orderId}-${item.itemId}-${index}`}
                              className="grid grid-cols-12 gap-3 items-center p-2 bg-white rounded border border-yellow-200 hover:border-yellow-400 transition-colors"
                            >
                              {/* Cột 1 (5/12): Thông tin sản phẩm */}
                              <div className="col-span-5 min-w-0">
                                <div className="font-medium text-sm truncate flex items-center gap-1">
                                  {item.productName}
                                  {item.size && (
                                    <span className="text-gray-500 ml-1">
                                      ({item.size})
                                    </span>
                                  )}
                                  {item.isCompensationOrder && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      Đơn bù
                                    </span>
                                  )}
                                </div>
                                {item.note && (
                                  <div className="text-xs text-gray-600 italic mt-0.5 truncate">
                                    Ghi chú HH: {item.note}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 mt-0.5">
                                  Kho: {item.warehouse} • Đã bù:{" "}
                                  {item.compensatedQty}/{item.shortageQty} •
                                  <span className="font-bold text-red-600">
                                    Còn thiếu: {remainingShortage} {item.unit}
                                  </span>
                                </div>
                              </div>

                              {/* Cột 2 (4/12): Thông tin đơn hàng - CLICKABLE */}
                              <div
                                className="col-span-4 min-w-0 cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors"
                                onClick={() => {
                                  setViewOrderId(item.orderId);
                                  setHighlightItemId(item.itemId);
                                }}
                                title="Click để xem chi tiết đơn hàng"
                              >
                                <div className="text-xs">
                                  <div className="font-medium text-gray-700 flex items-center gap-1">
                                    <span>📋</span>
                                    Ngày đơn:{" "}
                                    {new Date(
                                      item.orderDate,
                                    ).toLocaleDateString("vi-VN")}
                                  </div>
                                  {item.customerNote && (
                                    <div className="mt-0.5 italic text-gray-500 truncate">
                                      Ghi chú KH: {item.customerNote}
                                    </div>
                                  )}
                                  <div className="mt-1 text-blue-600 text-xs font-medium">
                                    → Click để xem đơn hàng
                                  </div>
                                </div>
                              </div>

                              {/* Cột 3 (3/12): Nút action */}
                              <div className="col-span-3 flex gap-1 justify-end">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 bg-green-50 border-green-300 hover:bg-green-100 text-green-700"
                                  onClick={() =>
                                    handleFillShortage(item, remainingShortage)
                                  }
                                >
                                  <Plus className="w-3 h-3" />
                                  Thêm
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-700"
                                  onClick={() => handleIgnoreShortage(item)}
                                >
                                  <X className="w-3 h-3" />
                                  Bỏ qua
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

            {/* Loading state */}
            {loadingShortages && (
              <div className="border rounded-lg p-4 bg-blue-50 text-center">
                <div className="text-sm text-blue-600">
                  Đang tải dữ liệu hàng thiếu...
                </div>
              </div>
            )}

            {/* Empty state - đã load xong nhưng không có shortage */}
            {!loadingShortages &&
              customer.name &&
              customer.name.trim() &&
              shortageItems.length === 0 && (
                <div className="border rounded-lg p-4 bg-gray-50 text-center">
                  <div className="text-sm text-gray-600">
                    ✓ Không có hàng thiếu cho khách hàng này
                  </div>
                </div>
              )}

            {/* Danh sách hàng hóa */}
            <div className="min-h-[250px] overflow-visible">
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
