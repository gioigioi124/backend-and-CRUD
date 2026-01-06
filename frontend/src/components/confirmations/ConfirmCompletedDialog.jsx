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

const ConfirmCompletedDialog = ({ open, onOpenChange, vehicle, onConfirm }) => {
  const isCompleted = vehicle?.isCompleted;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isCompleted ? "Bỏ đánh dấu hoàn thành?" : "Đánh dấu hoàn thành?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isCompleted ? (
              <>
                Bạn có chắc muốn bỏ đánh dấu <strong>hoàn thành</strong> cho xe{" "}
                <strong>
                  {vehicle?.weight} - {vehicle?.time} - {vehicle?.destination}
                </strong>
                ?
              </>
            ) : (
              <>
                Bạn có chắc muốn đánh dấu <strong>hoàn thành</strong> cho xe{" "}
                <strong>
                  {vehicle?.weight} - {vehicle?.time} - {vehicle?.destination}
                </strong>
                ?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Xác nhận</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmCompletedDialog;
