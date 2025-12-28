import { Link, useNavigate } from "react-router";
import { useState } from "react";
import VehicleFormDialog from "@/vehicles/VehicleFormDialog";
import { Button } from "../ui/button";
import { useVehicleContext } from "@/vehicles/VehicleContext";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const { triggerRefresh } = useVehicleContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Quản lý đơn hàng
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {user?.role !== "warehouse" && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => setOpenVehicleDialog(true)}
                      size="sm"
                    >
                      Create Tranpo
                    </Button>
                    <Link to="/orders">
                      <Button variant="outline" size="sm">
                        OrderList
                      </Button>
                    </Link>
                  </>
                )}
                {user?.role === "warehouse" && (
                  <Link to="/warehouse">
                    <Button variant="default" size="sm">
                      Kho Dashboard
                    </Button>
                  </Link>
                )}
              </div>

              {/* User Menu */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.role}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === "admin" && (
                      <DropdownMenuItem onClick={() => navigate("/users")}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Quản lý nhân viên</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
