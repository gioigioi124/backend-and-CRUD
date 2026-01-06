import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const VehicleStatusDialog = ({
  open,
  onOpenChange,
  vehicle,
  onTogglePrinted,
  onToggleCompleted,
}) => {
  const isPrinted = vehicle?.isPrinted;
  const isCompleted = vehicle?.isCompleted;

  const handlePrintedToggle = () => {
    onTogglePrinted?.();
    onOpenChange(false);
  };

  const handleCompletedToggle = () => {
    onToggleCompleted?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cập nhật trạng thái xe</AlertDialogTitle>
          <AlertDialogDescription>
            Xe{" "}
            <strong>
              {vehicle?.weight} - {vehicle?.time} - {vehicle?.destination}
            </strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-4">
          {/* Trạng thái đã in đơn - chỉ hiển thị khi chưa hoàn thành */}
          {!isCompleted && (
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <div className="font-medium">Đã in đơn</div>
                <div className="text-sm text-gray-500">
                  {isPrinted ? "Đã đánh dấu in đơn" : "Chưa in đơn"}
                </div>
              </div>
              <Button
                variant={isPrinted ? "default" : "outline"}
                size="sm"
                onClick={handlePrintedToggle}
                className={isPrinted ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                <Check
                  className={`w-4 h-4 mr-1 ${isPrinted ? "text-white" : ""}`}
                />
                {isPrinted ? "Đã in" : "Chưa in"}
              </Button>
            </div>
          )}

          {/* Trạng thái hoàn thành */}
          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div>
              <div className="font-medium">Hoàn thành</div>
              <div className="text-sm text-gray-500">
                {isCompleted ? "Xe đã hoàn thành" : "Xe chưa hoàn thành"}
              </div>
            </div>
            <Button
              variant={isCompleted ? "default" : "outline"}
              size="sm"
              onClick={handleCompletedToggle}
              className={isCompleted ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Check
                className={`w-4 h-4 mr-1 ${isCompleted ? "text-white" : ""}`}
              />
              {isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"}
            </Button>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default VehicleStatusDialog;
