import { Outlet } from "react-router";
import Header from "./Header";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import ChatWidget from "../chat/ChatWidget";

const MainLayout = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </SidebarInset>
      <ChatWidget />
    </SidebarProvider>
  );
};

export default MainLayout;
