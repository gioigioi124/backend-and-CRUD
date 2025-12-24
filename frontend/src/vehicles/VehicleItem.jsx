import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const VehicleItem = ({ vehicle, isSelected, onSelect, onEdit, onDelete }) => {
  return (
    <div
      className={`relative p-3 border rounded transition-colors group ${
        //hiệu ứng khi select
        isSelected ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
      }`}
    >
      {/* Thông tin xe */}
      <div className="cursor-pointer" onClick={() => onSelect(vehicle)}>
        <div className="flex">
          <div className="text-sm text-gray-600">
            {vehicle.weight} - {vehicle.destination}
          </div>
        </div>
        <div className="text-xs text-gray-500">{vehicle.time}</div>
        {vehicle.note && (
          <div className="text-xs text-gray-400 mt-1 italic">
            {vehicle.note}
          </div>
        )}
      </div>
      {/* Nút sửa, xóa */}
      <div className="absolute bottom-2 right-2 hidden group-hover:flex space-x-1 bg-white/90 p-1 rounded-md shadow-sm">
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
        >
          <Trash2 className="w-4 h-4 mr-1" />
        </Button>
      </div>
    </div>
  );
};

export default VehicleItem;
