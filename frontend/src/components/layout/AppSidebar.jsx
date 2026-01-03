import { Link, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Package,
  Truck,
  BarChart3,
  ClipboardList,
  Users,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const AppSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Define navigation items with role-based access
  const navigationItems = [
    {
      title: "Trang chủ",
      icon: Home,
      path: "/",
      roles: ["admin", "staff", "warehouse", "leader"],
    },
    {
      title: "Danh sách đơn hàng",
      icon: Package,
      path: "/orders",
      roles: ["admin", "staff", "warehouse", "leader"],
    },
    {
      title: "Báo cáo xe",
      icon: Truck,
      path: "/vehicle-report",
      roles: ["admin", "staff", "leader"],
    },
    {
      title: "Dashboard Kho",
      icon: BarChart3,
      path: "/warehouse",
      roles: ["warehouse"],
    },
    {
      title: "Dashboard Điều vận",
      icon: ClipboardList,
      path: "/dispatcher",
      roles: ["admin", "leader"],
    },
    {
      title: "Quản lý nhân viên",
      icon: Users,
      path: "/users",
      roles: ["admin"],
    },
  ];

  // Filter navigation items based on user role
  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">Quản lý kho vận</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <Link to={item.path}>
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">
          {user?.name} • {user?.role}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
