import { useState, useEffect } from "react";
import { vehicleService } from "@/services/vehicleService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useVehicleContext } from "@/vehicles/VehicleContext";
import VehicleFormDialog from "@/vehicles/VehicleFormDialog";
import OrderEditDialog from "@/orders/OrderEditDialog";
import PageHeader from "@/components/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const VehicleReportPage = () => {
  const { user } = useAuth();
  const { triggerRefresh: triggerVehicleRefresh } = useVehicleContext();
  const todayDate = getTodayDate();
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = {
        fromDate: selectedDate,
        toDate: selectedDate,
      };

      const data = await vehicleService.getAllVehicles(params);
      const vehicleData = data.vehicles || [];

      calculateReport(vehicleData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách xe:", error);
      setReportData([]);
      setVehicleTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Tự động tải dữ liệu khi vào trang (ngày hôm nay)
  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateReport = (vehicleData) => {
    // Lọc xe theo vehicleDate
    const filteredVehicles = vehicleData.filter((vehicle) => {
      if (!vehicle.vehicleDate) return false;
      const vDate = new Date(vehicle.vehicleDate).toISOString().split("T")[0];
      return vDate === selectedDate;
    });

    // Lấy danh sách các loại xe duy nhất
    const types = [...new Set(filteredVehicles.map((v) => v.weight))].sort();
    setVehicleTypes(types);

    // Nhóm theo người tạo
    const byCreator = {};

    filteredVehicles.forEach((vehicle) => {
      const creatorId = vehicle.createdBy?._id || vehicle.createdBy;
      const creatorName = vehicle.createdBy?.name || "Không xác định";

      if (!byCreator[creatorId]) {
        byCreator[creatorId] = {
          creatorId,
          creatorName,
          byType: {},
          total: 0,
        };
      }

      const weight = vehicle.weight || "Không xác định";
      if (!byCreator[creatorId].byType[weight]) {
        byCreator[creatorId].byType[weight] = 0;
      }
      byCreator[creatorId].byType[weight]++;
      byCreator[creatorId].total++;
    });

    // Chuyển thành mảng và sắp xếp theo tên
    const reportArray = Object.values(byCreator).sort((a, b) =>
      a.creatorName.localeCompare(b.creatorName)
    );

    setReportData(reportArray);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Tính tổng cộng cho mỗi loại xe
  const getTotalByType = (type) => {
    return reportData.reduce((sum, row) => sum + (row.byType[type] || 0), 0);
  };

  // Tính tổng cộng tất cả
  const getGrandTotal = () => {
    return reportData.reduce((sum, row) => sum + row.total, 0);
  };

  const handleCreateOrder = () => {
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    // Refresh nếu cần
  };

  return (
    <div className="container mx-auto p-4 max-w-full items-center ">
      <PageHeader
        title="Báo Cáo Số Lượng Xe"
        currentPage="vehicle-report"
        onCreateOrder={handleCreateOrder}
        onCreateVehicle={() => setOpenVehicleDialog(true)}
        user={user}
      />

      {/* Chọn ngày */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Label htmlFor="selectedDate">Chọn ngày báo cáo</Label>
            <Input
              id="selectedDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[200px]"
            />
          </div>
          <div className="mt-6">
            <Button
              onClick={fetchVehicles}
              disabled={loading}
              variant="gradient"
            >
              {loading ? "Đang tải..." : "Xem báo cáo"}
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Ngày đã chọn:{" "}
          <span className="font-semibold">{formatDate(selectedDate)}</span>
        </p>
      </div>

      {/* Tổng quan */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100 max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Tổng Quan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium mb-1">Tổng số xe</p>
            <p className="text-3xl font-bold text-blue-700">
              {getGrandTotal()}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium mb-1">
              Số người tạo
            </p>
            <p className="text-3xl font-bold text-green-700">
              {reportData.length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-medium mb-1">
              Số loại xe
            </p>
            <p className="text-3xl font-bold text-purple-700">
              {vehicleTypes.length}
            </p>
          </div>
        </div>
      </div>

      {/* Bảng báo cáo */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Báo Cáo Chi Tiết - {formatDate(selectedDate)}
        </h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : reportData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không có dữ liệu cho ngày này
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead className="min-w-[150px]">Người tạo</TableHead>
                  {vehicleTypes.map((type) => (
                    <TableHead key={type} className="text-center min-w-[100px]">
                      {type}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold bg-gray-50">
                    Tổng cộng
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={row.creatorId}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {row.creatorName}
                    </TableCell>
                    {vehicleTypes.map((type) => (
                      <TableCell key={type} className="text-center">
                        {row.byType[type] || 0}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-bold bg-blue-50">
                      {row.total}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Dòng tổng cộng */}
                <TableRow className="bg-gray-100 font-bold">
                  <TableCell colSpan={2} className="text-right">
                    Tổng cộng
                  </TableCell>
                  {vehicleTypes.map((type) => (
                    <TableCell key={type} className="text-center">
                      {getTotalByType(type)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center bg-blue-100">
                    {getGrandTotal()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <VehicleFormDialog
        open={openVehicleDialog}
        onOpenChange={setOpenVehicleDialog}
        onSuccess={triggerVehicleRefresh}
      />

      <OrderEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        order={null}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default VehicleReportPage;
