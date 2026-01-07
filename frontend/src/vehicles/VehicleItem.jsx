import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check } from "lucide-react";
import { useState } from "react";
import VehicleStatusDialog from "@/components/confirmations/VehicleStatusDialog";

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
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const handleStatusClick = (e) => {
    e.stopPropagation();
    setStatusDialogOpen(true);
  };

  const handleTogglePrinted = () => {
    onTogglePrinted?.(vehicle);
  };

  const handleToggleCompleted = () => {
    onToggleCompleted?.(vehicle);
  };

  return (
    <>
      <div onClick={() => onSelect(vehicle)}>
        <div
          className={`relative p-3 border rounded transition-colors group ${
            // Màu viền: Ưu tiên blue khi select, sau đó là green khi hoàn thành, yellow khi đã in, cuối cùng là mặc định
            isSelected
              ? "border-blue-600 ring-3 ring-blue-600/30"
              : vehicle.isCompleted
              ? "border-green-500"
              : vehicle.isPrinted
              ? "border-yellow-400"
              : "border-gray-200"
          } ${
            // Màu nền: Ưu tiên hoàn thành (xanh lá), sau đó đã in (vàng), cuối cùng mới đến selected (xanh dương)
            vehicle.isCompleted
              ? "bg-green-100"
              : vehicle.isPrinted
              ? "bg-yellow-100"
              : isSelected
              ? "bg-blue-50"
              : "hover:bg-gray-50"
          }`}
        >
          {/* Thông tin xe */}
          <div className="cursor-pointer">
            <div className="flex">
              <div className="text-sm text-gray-600">
                {vehicle.weight} - {vehicle.time} - {vehicle.destination}
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1 italic">
              {new Date(vehicle.vehicleDate).toLocaleDateString("vi-VN")}
              {vehicle.note && " - " + vehicle.note}
              {vehicle.createdBy?.name && (
                <span className="ml-2 text-green-600 font-medium not-italic">
                  • {vehicle.createdBy.name}
                </span>
              )}
            </div>
          </div>

          {/* Nút sửa, xóa, trạng thái */}
          <div className="absolute bottom-2 right-2 hidden group-hover:flex space-x-1 bg-white/90 p-1 rounded-md shadow-sm">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleStatusClick}
              title="Cập nhật trạng thái"
            >
              <Check
                className={`w-4 h-4 mr-1 ${
                  vehicle.isCompleted
                    ? "text-green-600"
                    : vehicle.isPrinted
                    ? "text-yellow-600"
                    : ""
                }`}
              />
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

      {/* Unified Status Dialog */}
      <VehicleStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        vehicle={vehicle}
        onTogglePrinted={handleTogglePrinted}
        onToggleCompleted={handleToggleCompleted}
      />
    </>
  );
};

export default VehicleItem;
