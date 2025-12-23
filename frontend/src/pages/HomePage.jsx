import VehicleList from "@/vehicles/VehicleList";
import { useState } from "react";

const HomePage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div className="container mx-auto p-4 max-w-none">
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
        {/* Cột 1: Danh sách xe */}
        <div className="col-span-2 bg-white rounded-lg shadow p-4 overflow-y-auto">
          <VehicleList
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
          />
        </div>

        {/* Cột 2: Danh sách đơn hàng trong xe */}
        <div className="col-span-2 bg-white rounded-lg shadow p-4 overflow-y-auto">
          {selectedVehicle ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">Đơn hàng trong xe</h2>
              {/* OrderList component sẽ thêm sau */}
              <p className="text-gray-500">Chọn xe để xem đơn hàng</p>
            </div>
          ) : (
            <p className="text-gray-500">Chọn xe để xem đơn hàng</p>
          )}
        </div>

        {/* Cột 3: Chi tiết đơn hàng */}
        <div className="col-span-8 bg-white rounded-lg shadow p-4 overflow-y-auto">
          {selectedOrder ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">Chi tiết đơn hàng</h2>
              {/* OrderDetail component sẽ thêm sau */}
            </div>
          ) : (
            <p className="text-gray-500">Chọn đơn hàng để xem chi tiết</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
