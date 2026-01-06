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

const DeleteVehicleDialog = ({
  open,
  onOpenChange,
  vehicle,
  onConfirm,
  loading,
}) => {
  const orderCount = vehicle?.orderCount || 0;
  const canDelete = orderCount === 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa xe</AlertDialogTitle>
          <AlertDialogDescription>
            {canDelete ? (
              <>
                Bạn có chắc chắn muốn xóa xe <strong>{vehicle?.carName}</strong>
                ?
                <br />
                Hành động này không thể hoàn tác.
              </>
            ) : (
              <>
                <div className="text-red-600 font-semibold mb-2">
                  Không thể xóa xe!
                </div>
                Xe <strong>{vehicle?.carName}</strong> đang có{" "}
                <strong>{orderCount}</strong> đơn hàng được gán vào.
                <br />
                Vui lòng bỏ gán tất cả đơn hàng trước khi xóa xe.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          {canDelete ? (
            <AlertDialogAction
              onClick={onConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              onClick={() => onOpenChange(false)}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Đóng
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteVehicleDialog;
