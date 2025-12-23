import { Link } from "react-router";
import { useState } from "react";
import VehicleFormDialog from "@/vehicles/VehicleFormDialog";
import { Button } from "../ui/button";
import { useVehicleContext } from "@/vehicles/VehicleContext";

const Header = ({ onVehicleCreated }) => {
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const { triggerRefresh } = useVehicleContext();

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Quản lý đơn hàng
            </Link>

            <div className="flex gap-2">
              <Link to="/create-order">
                <Button variant="default">Create Order</Button>
              </Link>
              <Button
                variant="default"
                onClick={() => setOpenVehicleDialog(true)}
              >
                Create Tranpo
              </Button>
              <Link to="/orders">
                <Button variant="outline">OrderList</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <VehicleFormDialog
        open={openVehicleDialog}
        onOpenChange={setOpenVehicleDialog}
        onSuccess={triggerRefresh}
      />
    </>
  );
};

export default Header;
