import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { vehicleService } from "@/services/vehicleService";
import { Car } from "lucide-react";
import React, { useEffect, useState } from "react";

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
      <div className="flex items-center gap-2 text-slate-600 text-sm">
        <Spinner className="text-blue-500" />
        <p>Đang tải dữ liệu xe</p>
      </div>
    );
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Tranpo list</h2>
      {vehicles.length === 0 ? (
        <p>No tranpo yet</p>
      ) : (
        <div className="space-y-2 hover:cursor-pointer">
          {vehicles.map((vehicle, index) => (
            <div
              key={vehicle._id}
              className="p-2  border-0 rounded shadow-custom-md hover:shadow-custom-lg hover:bg-primary hover:text-white transition-all duration-200 animate-fade-in group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-sm flex items-center gap-2">
                <Car /> {vehicle.weight} - {vehicle.destination}
              </div>
              <div className="text-xs">
                {vehicle.time} - {vehicle.note}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleList;
