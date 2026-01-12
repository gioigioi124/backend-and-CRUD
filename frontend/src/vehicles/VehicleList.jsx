import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import VehicleItem from "./VehicleItem";
import VehicleFormDialog from "./VehicleFormDialog";
import DeleteVehicleDialog from "@/components/confirmations/DeleteVehicleDialog";
import { vehicleService } from "@/services/vehicleService";
import { orderService } from "@/services/orderService";
import { useVehicleContext } from "./VehicleContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

const VehicleList = ({
  selectedVehicle,
  onSelectVehicle,
  fromDate,
  toDate,
  creator,
  onOrderCountUpdate,
}) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshTrigger } = useVehicleContext();

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [orderCounts, setOrderCounts] = useState({}); // { vehicleId: count }

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const lastFetchIdRef = useRef(0);

  // 🔔 Real-time: Lắng nghe xe mới từ Socket.IO
  const handleNewVehicle = useCallback(
    (newVehicle) => {
      // Chỉ thêm vào nếu đang ở trang 1 (xe mới nhất hiện ở đầu)
      if (currentPage === 1) {
        setVehicles((prev) => {
          // Kiểm tra nếu xe đã tồn tại (tránh duplicate)
          if (prev.some((v) => v._id === newVehicle._id)) return prev;
          // Thêm xe mới vào đầu, giữ tối đa ITEMS_PER_PAGE
          return [newVehicle, ...prev.slice(0, ITEMS_PER_PAGE - 1)];
        });
        setTotalVehicles((prev) => prev + 1);
        setOrderCounts((prev) => ({ ...prev, [newVehicle._id]: 0 }));
        toast.info(`🚚 Xe mới: ${newVehicle.carName}`);
      }
    },
    [currentPage]
  );

  useSocket("new-vehicle", handleNewVehicle);

  // 🗑️ Real-time: Lắng nghe xe bị xóa từ Socket.IO
  const handleDeleteVehicle = useCallback(
    ({ vehicleId }) => {
      setVehicles((prev) => {
        const filtered = prev.filter((v) => v._id !== vehicleId);
        // Nếu có xe bị xóa (filtered khác prev)
        if (filtered.length < prev.length) {
          return filtered;
        }
        return prev;
      });
      setTotalVehicles((prev) => Math.max(0, prev - 1));
      setOrderCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[vehicleId];
        return newCounts;
      });
      // Nếu xe đang được chọn bị xóa, bỏ chọn
      if (selectedVehicle?._id === vehicleId) {
        onSelectVehicle(null);
      }
    },
    [selectedVehicle, onSelectVehicle]
  );

  useSocket("delete-vehicle", handleDeleteVehicle);

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, fromDate, toDate, creator, currentPage]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate, creator]);

  //tải danh sách xe
  const fetchVehicles = async () => {
    const fetchId = ++lastFetchIdRef.current;
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      // Thêm date range nếu có
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (creator) params.creator = creator;

      const data = await vehicleService.getAllVehicles(params);

      // Nếu đã có request mới hơn thì bỏ qua kết quả này
      if (fetchId !== lastFetchIdRef.current) return;

      // Xử lý response với pagination metadata
      const {
        vehicles: vehicleData,
        currentPage: page,
        totalPages: pages,
        totalVehicles: total,
        hasNextPage: hasNext,
        hasPrevPage: hasPrev,
      } = data;

      //Mảng giá trị của các xe
      setVehicles(vehicleData);
      setCurrentPage(page);
      setTotalPages(pages);
      setTotalVehicles(total);
      setHasNextPage(hasNext);
      setHasPrevPage(hasPrev);
      setError(null);

      // Lấy số lượng đơn hàng từ backend (đã được tính sẵn trong orderCount)
      const counts = {};
      for (const vehicle of vehicleData) {
        counts[vehicle._id] = vehicle.orderCount || 0;
      }

      if (fetchId !== lastFetchIdRef.current) return;
      setOrderCounts(counts);
    } catch (err) {
      if (fetchId !== lastFetchIdRef.current) return;
      setError("Không thể tải danh sách xe");
      console.log("Không thể tải xe", err.message);
    } finally {
      if (fetchId === lastFetchIdRef.current) {
        setLoading(false);
      }
    }
  };

  // Cập nhật số lượng đơn hàng cho 1 xe cụ thể (không cần fetch lại toàn bộ)
  const updateOrderCount = async (vehicleId) => {
    try {
      const orders = await orderService.getOrdersByVehicle(vehicleId);
      setOrderCounts((prev) => ({ ...prev, [vehicleId]: orders.length }));
    } catch (err) {
      console.error("Không thể cập nhật số lượng đơn hàng:", err);
    }
  };

  // Expose updateOrderCount function to parent
  useEffect(() => {
    if (onOrderCountUpdate) {
      onOrderCountUpdate(updateOrderCount);
    }
  }, [onOrderCountUpdate]);

  //edit xe
  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setEditDialogOpen(true);
  };

  //delete xe
  const handleDelete = async (vehicle) => {
    // Kiểm tra số lượng đơn hàng
    let orderCount = orderCounts[vehicle._id];
    if (orderCount === undefined) {
      // Nếu chưa có trong cache, fetch ngay
      try {
        const orders = await orderService.getOrdersByVehicle(vehicle._id);
        orderCount = orders.length;
        setOrderCounts((prev) => ({ ...prev, [vehicle._id]: orderCount }));
      } catch {
        orderCount = 0;
      }
    }

    setDeletingVehicle({ ...vehicle, orderCount });
    setDeleteDialogOpen(true);
  };

  //xác nhận delete xe
  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await vehicleService.deleteVehicle(deletingVehicle._id);
      toast.success("Xóa xe thành công!");
      setDeleteDialogOpen(false);
      fetchVehicles();

      // Nếu xe đang được chọn thì bỏ chọn
      if (selectedVehicle?._id === deletingVehicle._id) {
        onSelectVehicle(null);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Xóa xe thất bại: " + errorMessage);
      console.error(error);
      // Nếu lỗi do có đơn hàng, refresh lại số lượng đơn
      if (errorMessage.includes("đơn hàng")) {
        fetchVehicles();
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Xử lý toggle trạng thái đã in (optimistic update)
  const handleTogglePrinted = async (vehicle) => {
    const newPrintedStatus = !vehicle.isPrinted;

    // Cập nhật UI ngay lập tức (optimistic update)
    setVehicles((prevVehicles) =>
      prevVehicles.map((v) =>
        v._id === vehicle._id ? { ...v, isPrinted: newPrintedStatus } : v
      )
    );

    try {
      // Gọi API ở background
      await vehicleService.updateVehicle(vehicle._id, {
        isPrinted: newPrintedStatus,
      });
      toast.info(
        newPrintedStatus ? "Đã đánh dấu đã in" : "Đã bỏ đánh dấu đã in"
      );
    } catch (error) {
      // Nếu lỗi, rollback lại state cũ
      setVehicles((prevVehicles) =>
        prevVehicles.map((v) =>
          v._id === vehicle._id ? { ...v, isPrinted: !newPrintedStatus } : v
        )
      );
      toast.error(
        "Cập nhật trạng thái thất bại: " +
          (error.response?.data?.message || error.message)
      );
      console.error(error);
    }
  };

  // Xử lý toggle trạng thái hoàn thành (optimistic update)
  const handleToggleCompleted = async (vehicle) => {
    const newCompletedStatus = !vehicle.isCompleted;

    // Cập nhật UI ngay lập tức (optimistic update)
    setVehicles((prevVehicles) =>
      prevVehicles.map((v) =>
        v._id === vehicle._id ? { ...v, isCompleted: newCompletedStatus } : v
      )
    );

    try {
      // Gọi API ở background
      await vehicleService.updateVehicle(vehicle._id, {
        isCompleted: newCompletedStatus,
      });
      toast.success(
        newCompletedStatus
          ? "Đã đánh dấu hoàn thành"
          : "Đã bỏ đánh dấu hoàn thành"
      );
    } catch (error) {
      // Nếu lỗi, rollback lại state cũ
      setVehicles((prevVehicles) =>
        prevVehicles.map((v) =>
          v._id === vehicle._id ? { ...v, isCompleted: !newCompletedStatus } : v
        )
      );
      toast.error(
        "Cập nhật trạng thái thất bại: " +
          (error.response?.data?.message || error.message)
      );
      console.error(error);
    }
  };

  //loading và error
  if (loading) return <div className="text-center py-4">Đang tải...</div>;
  if (error)
    return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <>
      {/* map để tạo hàng loạt xe ra frontend */}
      <div>
        {/* Pagination Controls - moved to top */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={!hasPrevPage}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Trước
          </Button>

          <div className="text-sm text-gray-600">
            <span className="font-semibold text-base">
              Trang {currentPage} / {totalPages}
            </span>
            <span className="text-gray-400 ml-2">({totalVehicles} xe)</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!hasNextPage}
            className="gap-1"
          >
            Sau
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {vehicles.length === 0 ? (
          <p className="text-gray-500 text-center">Chưa có xe nào</p>
        ) : (
          <div className="space-y-2 ">
            {vehicles.map((vehicle) => {
              const hasOrders = (orderCounts[vehicle._id] || 0) > 0;
              return (
                <VehicleItem
                  key={vehicle._id}
                  vehicle={vehicle}
                  // props onSelect trong VehicleItem, sẽ lấy hết dữ liệu của Vehicle
                  //lúc này onSelectVehicle sẽ có giá trị của Vehicle
                  //truyền onSelectVehicle ra ngoài để gọi hàm setSelectVehicle(vehicle) để setSelectVehicle có thuộc tính _id
                  onSelect={onSelectVehicle}
                  // lúc này có thể lấy selectedVehicle?._id đem ra so sánh rồi
                  isSelected={selectedVehicle?._id === vehicle._id}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  hasOrders={hasOrders}
                  onTogglePrinted={handleTogglePrinted}
                  onToggleCompleted={handleToggleCompleted}
                />
              );
            })}
          </div>
        )}
      </div>
      {/* Edit Dialog */}
      <VehicleFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchVehicles}
        editData={editingVehicle}
        hasOrders={
          editingVehicle ? (orderCounts[editingVehicle._id] || 0) > 0 : false
        }
      />
      {/* Delete Dialog */}
      <DeleteVehicleDialog
        //trả về true false để mở dialog
        open={deleteDialogOpen}
        //trả về true false vì trong dialog có sẵn hàm onOpenChange
        onOpenChange={setDeleteDialogOpen}
        //deletingVehicle chính là giá trị vehicle
        vehicle={deletingVehicle}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </>
  );
};

export default VehicleList;
