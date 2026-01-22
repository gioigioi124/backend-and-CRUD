import { Link, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Users } from "lucide-react";
import { Button } from "../ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import CustomerSearchDialog from "../CustomerSearchDialog";
import { Search } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Link
              to="/"
              className="text-xl font-bold text-primary flex items-center gap-2"
            >
              <span className="hidden sm:inline">Quản lý kho vận</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 md:gap-4">
                {/* Nút tìm kiếm nhanh */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden sm:flex items-center gap-2 h-9 px-3 text-gray-500 hover:text-primary border-gray-200 hover:border-primary/50 bg-gray-50/50"
                  title="Tìm kiếm khách hàng (Ctrl+K)"
                >
                  <Search className="w-4 h-4" />
                  <span className="text-sm font-medium">Tìm kiếm...</span>
                  <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">Ctrl</span>K
                  </kbd>
                </Button>

                {/* Mobile Search Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="sm:hidden text-gray-500"
                >
                  <Search className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-3">
                  {/* Nút Đăng xuất đưa ra ngoài */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 h-10 px-2 py-1 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {user.name}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 mt-2"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold leading-none">
                            {user.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground capitalize">
                            {user.role}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {user.role === "admin" && (
                        <DropdownMenuItem
                          onClick={() => navigate("/users")}
                          className="cursor-pointer"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          <span>Quản lý nhân viên</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="md:hidden text-red-600 cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="h-6 w-px bg-gray-200 hidden md:block" />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 font-medium transition-colors hidden md:flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomerSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
      />
    </header>
  );
};
export default Header;
