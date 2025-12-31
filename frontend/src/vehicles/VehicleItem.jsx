import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check } from "lucide-react";

const VehicleItem = ({
  vehicle,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  hasOrders,
  onTogglePrinted,
  onToggleCompleted,
}) => {
  return (
    <div onClick={() => onSelect(vehicle)}>
      <div
        className={`relative p-3 border rounded transition-colors group ${
          // Màu viền: Ưu tiên blue khi select, sau đó là green khi hoàn thành, cuối cùng là mặc định
          isSelected
            ? "border-blue-600 ring-3 ring-blue-600/30"
            : vehicle.isCompleted
            ? "border-green-500"
            : "border-gray-200"
        } ${
          // Màu nền: Success khi hoàn thành, Blue nhạt khi select (nếu chưa hoàn thành), mặc định là hover
          vehicle.isCompleted
            ? "bg-green-100"
            : isSelected
            ? "bg-blue-50"
            : "hover:bg-gray-50"
        }`}
      >
        {/* Thông tin xe */}
        <div className="flex gap-3">
          {/* Nút đánh dấu đã in - chỉ hiển thị khi xe chưa hoàn thành */}
          {!vehicle.isCompleted && (
            <div className="flex items-start pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePrinted?.(vehicle);
                }}
                className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                  vehicle.isPrinted
                    ? "bg-yellow-400 border-yellow-500 hover:bg-yellow-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
                title={vehicle.isPrinted ? "Đã in đơn" : "Chưa in đơn"}
              >
                {vehicle.isPrinted && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          )}

          {/* Thông tin xe */}
          <div className="cursor-pointer flex-1">
            <div className="flex">
              <div className="text-sm text-gray-600">
                {vehicle.weight} - {vehicle.destination} -{" "}
                {new Date(vehicle.vehicleDate).toLocaleDateString("vi-VN")}
              </div>
            </div>
            <div className="text-xs text-gray-500">{vehicle.time}</div>
            {vehicle.note && (
              <div className="text-xs text-gray-400 mt-1 italic">
                {vehicle.note}
              </div>
            )}
          </div>
        </div>
        {/* Nút sửa, xóa, hoàn thành */}
        <div className="absolute bottom-2 right-2 hidden group-hover:flex space-x-1 bg-white/90 p-1 rounded-md shadow-sm">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompleted?.(vehicle);
            }}
            title={vehicle.isCompleted ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
          >
            <Check className={`w-4 h-4 mr-1 ${vehicle.isCompleted ? "text-green-600" : ""}`} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(vehicle);
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
              onDelete(vehicle);
            }}
            disabled={hasOrders}
            title={hasOrders ? "Không thể xóa xe khi còn đơn hàng" : ""}
          >
            <Trash2 className="w-4 h-4 mr-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VehicleItem;
