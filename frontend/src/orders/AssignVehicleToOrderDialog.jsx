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
import { toast } from "sonner";
import { Truck, Calendar } from "lucide-react";

const AssignVehicleToOrderDialog = ({
  open,
  onOpenChange,
  order,
  onSuccess,
}) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [orderCounts, setOrderCounts] = useState({});

  useEffect(() => {
    if (open) {
      let dateToUse = new Date().toISOString().split("T")[0];
      if (order?.createdAt) {
        dateToUse = new Date(order.createdAt).toISOString().split("T")[0];
      }
      setSelectedDate(dateToUse);
      fetchVehicles(dateToUse);
    }
  }, [open, order]);

  const fetchVehicles = async (date) => {
    try {
      setLoading(true);
      // Fetch vehicles for the selected date
      const data = await vehicleService.getAllVehicles({
        fromDate: date,
        toDate: date,
      });
      setVehicles(data);

      // Fetch order counts for each vehicle
      const counts = {};
      for (const vehicle of data) {
        try {
          const orders = await orderService.getOrdersByVehicle(vehicle._id);
          counts[vehicle._id] = orders.length;
        } catch (err) {
          counts[vehicle._id] = 0;
        }
      }
      setOrderCounts(counts);
    } catch (error) {
      console.error("Lỗi khi tải danh sách xe:", error);
      toast.error("Không thể tải danh sách xe");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (vehicle) => {
    if (!order) return;

    try {
      setAssigning(true);
      await orderService.assignOrder(order._id, vehicle._id);
      toast.success(`Đã gán đơn hàng vào xe ${vehicle.carName || "này"}`);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn xe cho đơn hàng</DialogTitle>
          <div className="text-sm text-gray-500 mt-1">
             Khách hàng: <span className="font-medium text-black">{order?.customer?.name}</span>
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

        <div className="flex-1 overflow-y-auto min-h-[300px] py-2 space-y-2">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Đang tải xe...</div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Truck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>Không có xe nào trong ngày này</p>
            </div>
          ) : (
            vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                onClick={() => handleAssign(vehicle)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-blue-50 hover:border-blue-300 ${
                  order?.vehicle === vehicle._id // Highlight xe hiện tại (nếu có)
                    ? "bg-green-50 border-green-500 ring-1 ring-green-500"
                    : "bg-white"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {vehicle.carName || "Xe không tên"}
                      <span className="text-xs text-gray-500 font-normal border px-1 rounded bg-gray-50">
                        {vehicle.weight}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {vehicle.destination} - {vehicle.time}
                    </div>
                    {vehicle.note && (
                        <div className="text-xs text-gray-400 italic mt-1">{vehicle.note}</div>
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
