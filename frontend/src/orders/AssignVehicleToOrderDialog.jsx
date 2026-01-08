import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { vehicleService } from "@/services/vehicleService";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import { Truck, Calendar } from "lucide-react";

const AssignVehicleToOrderDialog = ({
  open,
  onOpenChange,
  order,
  onSuccess,
}) => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [orderCounts, setOrderCounts] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("all");

  // Fetch danh sách nhân viên
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const data = await userService.getStaffList();
        setStaffList(data);
      } catch (error) {
        console.error("Không thể tải danh sách nhân viên", error);
      }
    };
    fetchStaffList();
  }, []);

  useEffect(() => {
    if (open) {
      let dateToUse = new Date().toISOString().split("T")[0];
      if (order?.orderDate) {
        dateToUse = new Date(order.orderDate).toISOString().split("T")[0];
      }
      setSelectedDate(dateToUse);
      setSelectedVehicle(null); // Reset selection khi mở dialog
      setSelectedStaff("all"); // Reset staff filter
      fetchVehicles(dateToUse);
    }
  }, [open, order]);

  // Lọc xe theo nhân viên tạo
  useEffect(() => {
    if (selectedStaff === "all") {
      setFilteredVehicles(vehicles);
    } else {
      setFilteredVehicles(
        vehicles.filter((vehicle) => vehicle.createdBy?._id === selectedStaff)
      );
    }
  }, [selectedStaff, vehicles]);

  const fetchVehicles = async (date) => {
    try {
      setLoading(true);
      // Fetch vehicles for the selected date
      const data = await vehicleService.getAllVehicles({
        fromDate: date,
        toDate: date,
      });
      // Backend trả về object với property 'vehicles', không phải array trực tiếp
      const vehicleList = data.vehicles || [];
      setVehicles(vehicleList);

      // Fetch order counts for each vehicle song song (tối ưu tốc độ)
      const countPromises = vehicleList.map(async (vehicle) => {
        try {
          const response = await orderService.getAllOrders({
            vehicle: vehicle._id,
            fromDate: date,
            toDate: date,
          });
          return {
            vehicleId: vehicle._id,
            count: response.orders?.length || 0,
          };
        } catch (err) {
          return { vehicleId: vehicle._id, count: 0 };
        }
      });

      const countResults = await Promise.all(countPromises);
      const counts = {};
      countResults.forEach(({ vehicleId, count }) => {
        counts[vehicleId] = count;
      });
      setOrderCounts(counts);
    } catch (error) {
      console.error("Lỗi khi tải danh sách xe:", error);
      toast.error("Không thể tải danh sách xe");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!order || !selectedVehicle) return;

    try {
      setAssigning(true);
      await orderService.assignOrder(order._id, selectedVehicle._id);
      toast.success(
        `Đã gán đơn hàng vào xe ${selectedVehicle.weight} - ${selectedVehicle.destination} - ${selectedVehicle.time}`
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        "Gán xe thất bại: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    if (!order) return;

    try {
      setAssigning(true);
      await orderService.unassignOrder(order._id);
      toast.success("Đã bỏ gán xe cho đơn hàng");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        "Bỏ gán xe thất bại: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn xe cho đơn hàng</DialogTitle>
          <div className="text-sm text-gray-500 mt-1">
            Khách hàng:{" "}
            <span className="font-medium text-black">
              {order?.customer?.name}
            </span>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2 border-b">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Ngày xe:</span>
          <Input
            type="date"
            value={selectedDate}
            readOnly
            disabled
            className="w-auto h-8 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
          <span className="text-xs text-orange-500 italic ml-auto">
            *Chỉ gán được xe cùng ngày đơn
          </span>
        </div>

        {/* Bộ lọc nhân viên */}
        <div className="flex items-center gap-2 py-2 border-b">
          <label className="text-sm font-medium text-gray-700">
            Người tạo xe:
          </label>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            {staffList.map((staff) => (
              <option key={staff._id} value={staff._id}>
                {staff.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px] py-2 space-y-2 px-1">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Đang tải xe...</div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Truck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>
                {vehicles.length === 0
                  ? "Không có xe nào trong ngày này"
                  : "Không có xe nào của nhân viên này"}
              </p>
            </div>
          ) : (
            filteredVehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`relative p-3 border rounded-lg cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-300 ${
                  selectedVehicle?._id === vehicle._id
                    ? "bg-blue-50 border-blue-300 border-l-4 border-l-blue-600"
                    : order?.vehicle === vehicle._id
                    ? "bg-green-50 border-green-300 border-l-4 border-l-green-600"
                    : "bg-white border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {vehicle.weight} - {vehicle.destination} - {vehicle.time}
                    </div>
                    {vehicle.note && (
                      <div className="text-xs text-gray-400 italic mt-1">
                        {vehicle.note}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {orderCounts[vehicle._id] || 0} đơn
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between gap-2 pt-3 border-t">
          <div>
            {order?.vehicle && (
              <Button
                variant="destructive"
                onClick={handleUnassign}
                disabled={assigning}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Bỏ gán xe
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={assigning}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedVehicle || assigning}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {assigning ? "Đang gán..." : "Xác nhận gán xe"}
            </Button>
          </div>
        </div>

        {assigning && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
            <div className="text-sm font-medium">Đang xử lý...</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignVehicleToOrderDialog;
