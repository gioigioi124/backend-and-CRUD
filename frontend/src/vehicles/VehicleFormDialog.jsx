import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { vehicleService } from "@/services/vehicleService";

const WEIGHT_OPTIONS = [
  "5 tạ",
  "1.25T",
  "1.25T Livax",
  "3.5T",
  "5T",
  "7T",
  "Xe SG",
  "10T Hà Nội",
  "HN ngoài",
  "CPN",
  "Xe khách",
  "Cont 20",
  "Cont 40",
];

const VehicleFormDialog = ({
  open,
  onOpenChange,
  onSuccess,
  editData,
  hasOrders = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    carName: "",
    weight: "",
    time: "",
    destination: "",
    note: "",
    vehicleDate: "",
  });

  const isEditMode = !!editData;

  // Lấy ngày hôm nay ở định dạng YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Load data khi edit
  useEffect(() => {
    if (editData) {
      const vehicleDateValue = editData.vehicleDate
        ? new Date(editData.vehicleDate).toISOString().split("T")[0]
        : getTodayDate();
      setFormData({
        carName: editData.carName || "",
        weight: editData.weight || "",
        time: editData.time || "",
        destination: editData.destination || "",
        note: editData.note || "",
        vehicleDate: vehicleDateValue,
      });
    } else {
      setFormData({
        carName: "",
        weight: "",
        time: "",
        destination: "",
        note: "",
        vehicleDate: getTodayDate(), // Mặc định là hôm nay
      });
    }
  }, [editData, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation các trường bắt buộc
    if (
      !formData.weight ||
      !formData.time ||
      !formData.destination ||
      !formData.vehicleDate
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        await vehicleService.updateVehicle(editData._id, formData);
        toast.success("Cập nhật xe thành công!");
      } else {
        await vehicleService.createVehicle(formData);
        toast.success("Tạo xe thành công!");
      }

      // Reset form
      setFormData({
        carName: "",
        weight: "",
        time: "",
        destination: "",
        note: "",
        vehicleDate: getTodayDate(),
      });

      // Đóng dialog và refresh danh sách
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        (isEditMode ? "Cập nhật" : "Tạo") +
          " xe thất bại: " +
          (error.response?.data?.message || error.message)
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Cập nhật xe" : "Tạo xe mới"}</DialogTitle>
          <DialogDescription>
            Điền thông tin xe vào form bên dưới
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trọng tải */}
          <div className="space-y-2">
            <Label htmlFor="weight">
              Trọng tải <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.weight}
              onValueChange={(value) => handleChange("weight", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trọng tải" />
              </SelectTrigger>
              <SelectContent>
                {WEIGHT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Thời gian */}
          <div className="space-y-2">
            <Label htmlFor="time">
              Thời gian <span className="text-red-500">*</span>
            </Label>
            <Input
              id="time"
              placeholder="VD: 8h30, 10h, 15h30"
              value={formData.time}
              onChange={(e) => handleChange("time", e.target.value)}
            />
          </div>

          {/* Nơi đến */}
          <div className="space-y-2">
            <Label htmlFor="destination">
              Nơi đến <span className="text-red-500">*</span>
            </Label>
            <Input
              id="destination"
              placeholder="VD: Hà Nội, Thái Nguyên"
              value={formData.destination}
              onChange={(e) => handleChange("destination", e.target.value)}
            />
          </div>

          {/* Ghi chú */}
          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              placeholder="Ghi chú thêm (tùy chọn)"
              value={formData.note}
              onChange={(e) => handleChange("note", e.target.value)}
              rows={3}
            />
          </div>

          {/* Ngày xe */}
          <div className="space-y-2">
            <Label htmlFor="vehicleDate">
              Ngày xe <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vehicleDate"
              type="date"
              value={formData.vehicleDate}
              onChange={(e) => handleChange("vehicleDate", e.target.value)}
              min={isEditMode ? undefined : getTodayDate()}
              required
              disabled={isEditMode && hasOrders}
            />
            <p className="text-xs text-gray-500">
              {isEditMode && hasOrders
                ? "Không thể thay đổi ngày xe khi đã có đơn hàng. Vui lòng bỏ gán các đơn hàng trước."
                : isEditMode
                ? "Có thể giữ nguyên ngày cũ hoặc chọn ngày mới"
                : "Chỉ được chọn ngày hôm nay hoặc ngày trong tương lai"}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Tạo xe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleFormDialog;
