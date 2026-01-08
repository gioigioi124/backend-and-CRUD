import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Package, Truck } from "lucide-react";

const OrderItem = ({
  order,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onAssign,
}) => {
  // Format ngày tạo
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Tính tổng số lượng items
  const totalItems = order.items?.length || 0;

  // Kiểm tra trạng thái gán xe
  const isAssigned = order.vehicle !== null && order.vehicle !== undefined;

  return (
    <div onClick={() => onSelect(order)}>
      <div
        className={`relative p-3 border rounded transition-colors group ${
          isSelected
            ? "bg-blue-50 border-blue-500 ring-3 ring-blue-600/30"
            : "hover:bg-gray-50"
        }`}
      >
        {/* Thông tin đơn hàng */}
        <div className="cursor-pointer">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-medium text-gray-900">
              {order.customer?.name || "Không có tên"}
            </div>
            <div className="flex items-center gap-2">
              {order.isOverDebtLimit && (
                <div className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md font-semibold">
                  Quá hạn nợ
                </div>
              )}
              {isAssigned && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Truck className="w-3 h-3" />
                  <span>Đã gán</span>
                </div>
              )}
              {!isAssigned && (
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <Package className="w-3 h-3" />
                  <span>Chưa gán</span>
                </div>
              )}
            </div>
          </div>
          {/* số lượng mặt hàng */}
          <div className="text-xs text-gray-500 mb-1">
            {totalItems} {totalItems === 1 ? "mặt hàng" : "mặt hàng"}
          </div>
          {/* ngày tạo */}
          <div className="text-xs text-gray-400">
            {formatDate(order.orderDate)}
            {order.createdBy?.name && (
              <span className="ml-2 text-green-600 font-medium">
                • {order.createdBy.name}
              </span>
            )}
          </div>
          {order.customer?.note && (
            <div className="text-xs text-gray-400 mt-1 italic">
              {order.customer.note}
            </div>
          )}
        </div>
        {/* Nút sửa, xóa */}
        <div className="absolute bottom-2 right-2 hidden group-hover:flex space-x-1 bg-white/90 p-1 rounded-md shadow-sm">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            onClick={(e) => {
              e.stopPropagation();
              onAssign?.(order);
            }}
            title="Gán xe"
          >
            <Truck className="w-4 h-4 mr-1" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(order);
            }}
          >
            <Pencil className="w-4 h-4 mr-1" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(order);
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
