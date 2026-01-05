import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Package, X, FileDown } from "lucide-react";
import { orderService } from "@/services/orderService";
import * as XLSX from "xlsx";

const VehicleOrderList = ({
  vehicle,
  selectedOrder,
  onSelectOrder,
  onUnassign,
  onAssignClick,
  refreshTrigger,
  onOrdersLoaded,
  selectedOrderIds = [],
  onToggleSelect,
  onSelectAll,
  onPrint,
  onPrintConfirmed,
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format ngày tạo
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

  // Fetch đơn hàng của xe
  const fetchOrders = useCallback(async () => {
    if (!vehicle?._id) {
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const params = { vehicle: vehicle._id };

      // Không filter theo ngày - hiển thị tất cả đơn hàng trong xe
      // Date range chỉ áp dụng cho danh sách xe, không áp dụng cho đơn hàng trong xe

      const data = await orderService.getAllOrders(params);

      // API trả về object { orders: [...], currentPage, ... }, không phải array trực tiếp
      const ordersArray = data.orders || data;

      // Sắp xếp đơn hàng theo tên khách hàng
      ordersArray.sort((a, b) => {
        const nameA = a.customer?.name || "";
        const nameB = b.customer?.name || "";
        return nameA.localeCompare(nameB, "vi");
      });

      setOrders(ordersArray);
      if (onOrdersLoaded) onOrdersLoaded(ordersArray);
    } catch (err) {
      setError("Không thể tải danh sách đơn hàng");
      console.error("Không thể tải đơn hàng", err.message);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [vehicle?._id]);

  // Fetch khi vehicle thay đổi hoặc refreshTrigger thay đổi
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshTrigger]);

  // Xử lý bỏ gán
  const handleUnassign = async (order, e) => {
    e.stopPropagation();
    try {
      await orderService.unassignOrder(order._id);
      toast.success("Bỏ gán đơn hàng thành công!");

      // Nếu đơn đang được chọn thì bỏ chọn
      if (selectedOrder?._id === order._id) {
        onSelectOrder(null);
      }

      // Refresh danh sách
      fetchOrders();

      // Gọi callback từ parent nếu có
      onUnassign?.(order);
    } catch (error) {
      toast.error(
        "Bỏ gán đơn hàng thất bại: " +
          (error.response?.data?.message || error.message)
      );
      console.error(error);
    }
  };

  // Xử lý export Excel
  const handleExportExcel = () => {
    try {
      const selectedOrders = orders.filter((o) =>
        selectedOrderIds.includes(o._id)
      );

      if (selectedOrders.length === 0) {
        toast.error("Vui lòng chọn ít nhất một đơn hàng");
        return;
      }

      // Chuẩn bị dữ liệu cho Excel
      const excelData = [];

      selectedOrders.forEach((order, orderIndex) => {
        // Thêm header cho mỗi đơn hàng
        excelData.push({
          STT: `ĐƠN HÀNG ${orderIndex + 1}`,
          "Tên hàng hóa": "",
          "Kích thước": "",
          ĐVT: "",
          "Số lượng": "",
          Kho: "",
          "Số cm": "",
          "Ghi chú": "",
          "Kho xác nhận": "",
        });

        // Thông tin khách hàng
        excelData.push({
          STT: "Khách hàng:",
          "Tên hàng hóa": order.customer?.name || "N/A",
          "Kích thước": "",
          ĐVT: "",
          "Số lượng": "",
          Kho: "",
          "Số cm": "",
          "Ghi chú": "",
          "Kho xác nhận": "",
        });

        if (order.customer?.customerCode) {
          excelData.push({
            STT: "Mã KH:",
            "Tên hàng hóa": order.customer.customerCode,
            "Kích thước": "",
            ĐVT: "",
            "Số lượng": "",
            Kho: "",
            "Số cm": "",
            "Ghi chú": "",
            "Kho xác nhận": "",
          });
        }

        if (order.customer?.address) {
          excelData.push({
            STT: "Địa chỉ:",
            "Tên hàng hóa": order.customer.address,
            "Kích thước": "",
            ĐVT: "",
            "Số lượng": "",
            Kho: "",
            "Số cm": "",
            "Ghi chú": "",
            "Kho xác nhận": "",
          });
        }

        if (order.customer?.note) {
          excelData.push({
            STT: "Ghi chú KH:",
            "Tên hàng hóa": order.customer.note,
            "Kích thước": "",
            ĐVT: "",
            "Số lượng": "",
            Kho: "",
            "Số cm": "",
            "Ghi chú": "",
            "Kho xác nhận": "",
          });
        }

        // Thêm dòng trống
        excelData.push({
          STT: "",
          "Tên hàng hóa": "",
          "Kích thước": "",
          ĐVT: "",
          "Số lượng": "",
          Kho: "",
          "Số cm": "",
          "Ghi chú": "",
          "Kho xác nhận": "",
        });

        // Header cho bảng chi tiết hàng hóa
        excelData.push({
          STT: "STT",
          "Tên hàng hóa": "Tên hàng hóa",
          "Kích thước": "Kích thước",
          ĐVT: "ĐVT",
          "Số lượng": "Số lượng",
          Kho: "Kho",
          "Số cm": "Số cm",
          "Ghi chú": "Ghi chú",
          "Kho xác nhận": "Kho xác nhận",
        });

        // Thêm các items
        order.items?.forEach((item, itemIndex) => {
          excelData.push({
            STT: itemIndex + 1,
            "Tên hàng hóa": item.productName || "",
            "Kích thước": item.size || "",
            ĐVT: item.unit || "",
            "Số lượng": item.quantity || 0,
            Kho: item.warehouse || "",
            "Số cm": item.cmQty || 0,
            "Ghi chú": item.note || "",
            "Kho xác nhận": item.warehouseConfirm?.value || "",
          });
        });

        // Thêm dòng trống giữa các đơn hàng
        excelData.push({
          STT: "",
          "Tên hàng hóa": "",
          "Kích thước": "",
          ĐVT: "",
          "Số lượng": "",
          Kho: "",
          "Số cm": "",
          "Ghi chú": "",
          "Kho xác nhận": "",
        });
      });

      // Tạo worksheet và workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Don hang");

      // Tạo tên file đơn giản, tránh ký tự đặc biệt
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      // Tên file chỉ dùng chữ không dấu, số và gạch dưới
      const vehicleInfo = vehicle?.weight
        ? `${vehicle.weight.replace(/\s+/g, "_")}`
        : "Xe";
      const fileName = `Don_hang_${vehicleInfo}_${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, fileName);

      toast.success(`Đã export ${selectedOrders.length} đơn hàng ra Excel`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Lỗi khi export Excel: " + error.message);
    }
  };

  const isAllSelected =
    orders.length > 0 && selectedOrderIds.length === orders.length;

  if (!vehicle) {
    return (
      <div className="text-gray-500 text-center py-4">
        Chọn xe để xem đơn hàng
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Đơn hàng trong xe</h2>
        <div className="flex gap-2">
          {orders.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectAll(orders.map((o) => o._id))}
              className={
                isAllSelected ? "bg-blue-50 text-blue-600 border-blue-200" : ""
              }
            >
              {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </Button>
          )}
          <Button size="sm" onClick={onAssignClick}>
            <Package className="w-4 h-4 mr-1" />
            Gán đơn
          </Button>
        </div>
      </div>

      {orders.length > 0 && selectedOrderIds.length > 0 && (
        <div className="mb-4 flex gap-2">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() =>
              onPrint(orders.filter((o) => selectedOrderIds.includes(o._id)))
            }
          >
            In {selectedOrderIds.length} đơn
          </Button>
          <Button
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            onClick={handleExportExcel}
          >
            <FileDown className="w-4 h-4 mr-1" />
            Excel
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={() =>
              onPrintConfirmed(
                orders.filter((o) => selectedOrderIds.includes(o._id))
              )
            }
          >
            In đơn chốt
          </Button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Chưa có đơn hàng nào</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={onAssignClick}
          >
            Gán đơn vào xe
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const totalItems = order.items?.length || 0;
            const isSelected = selectedOrderIds.includes(order._id);
            // Đếm số items chưa được thủ kho xác nhận
            const unconfirmedCount =
              order.items?.filter((item) => !item.warehouseConfirm?.value)
                .length || 0;

            return (
              <div
                key={order._id}
                onClick={() => onSelectOrder(order)}
                className={`relative p-3 border rounded transition-colors group cursor-pointer flex gap-3 ${
                  selectedOrder?._id === order._id
                    ? "bg-blue-50 border-blue-500 ring-3 ring-blue-600/30"
                    : "hover:bg-gray-50"
                } ${isSelected ? "ring-2 ring-blue-400 ring-inset" : ""}`}
              >
                {/* Badge số lượng chưa xác nhận */}
                {totalItems > 0 && (
                  <div className="absolute top-2 right-2">
                    <div
                      className={`px-2 py-0.5 rounded-full text-[14px] font-semibold ${
                        unconfirmedCount > 0
                          ? "bg-red-100 text-red-700 border border-red-300"
                          : "bg-green-100 text-green-700 border border-green-300"
                      }`}
                      title={
                        unconfirmedCount > 0
                          ? `${unconfirmedCount} mặt hàng chưa xác nhận`
                          : "Đã xác nhận tất cả"
                      }
                    >
                      {unconfirmedCount > 0
                        ? `${unconfirmedCount}/${totalItems}`
                        : "✓"}
                    </div>
                  </div>
                )}

                {/* Checkbox */}
                <div
                  className="flex items-start pt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(order._id);
                  }}
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* Thông tin đơn hàng */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer?.name || "Không có tên"}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {totalItems} {totalItems === 1 ? "mặt hàng" : "mặt hàng"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(order.createdAt)}
                  </div>
                  {order.customer?.note && (
                    <div className="text-xs text-gray-400 mt-1 italic">
                      {order.customer.note}
                    </div>
                  )}
                </div>
                {/* Nút bỏ gán */}
                <div className="absolute bottom-2 right-2 hidden group-hover:flex">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                    onClick={(e) => handleUnassign(order, e)}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Bỏ gán
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VehicleOrderList;
