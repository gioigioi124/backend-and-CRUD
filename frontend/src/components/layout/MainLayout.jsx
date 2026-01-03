import { Outlet } from "react-router";
import Header from "./Header";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const MainLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
