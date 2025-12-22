import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { vehicleService } from "@/services/vehicleService";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]); //quản lý xe
  const [loading, setLoading] = useState(true); //quản lý loading
  const [error, setError] = useState(null); //quản lý lỗi

  //chạy lần đầu khi vào trang
  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAllVehicles(); //lấy data xe
      setVehicles(data); //gom vào để quản lý thay đổi
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách xe");
      console.log("Không thể tải danh sách xe", err.message);
    } finally {
      setLoading(false); //trường hợp nào xảy ra thì cũng bỏ loading
    }
  };
  if (loading)
    return (
      <>
        <Spinner />
        <p>Đang tải dữ liệu xe</p>
      </>
    );
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card className="p-4 max-w-fit">
      <h2 className="text-xl font-bold mb-4">Tranpo list</h2>
      {vehicles.length === 0 ? (
        <p>No tranpo yet</p>
      ) : (
        <div className="space-y-2">
          {vehicles.map((vehicle, index) => (
            <div
              key={vehicle._id}
              className="p-2 rounded border-0 shadow-custom-md hover:shadow-custom-lg hover:bg-slate-200 transition-all duration-200 animate-fade-in group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-sm text-gray-600">
                {vehicle.weight} - {vehicle.destination}
              </div>
              <div className="text-xs text-gray-400">
                {vehicle.time} - {vehicle.note}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default VehicleList;
