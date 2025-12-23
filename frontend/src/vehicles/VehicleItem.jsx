import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const VehicleItem = ({ vehicle, isSelected, onSelect, onEdit, onDelete }) => {
  return (
    <div
      className={`p-3 border rounded transition-colors group ${
        isSelected ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
      }`}
    >
      <div className="cursor-pointer" onClick={() => onSelect(vehicle)}>
        <div className="font-semibold">{vehicle.carName}</div>
        <div className="text-sm text-gray-600">
          {vehicle.weight} - {vehicle.destination}
        </div>
        <div className="text-xs text-gray-500">{vehicle.time}</div>
        {vehicle.note && (
          <div className="text-xs text-gray-400 mt-1 italic">
            {vehicle.note}
          </div>
        )}
      </div>

      <div className="hidden group-hover:inline-block animate-slide-up space-x-1 ">
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
