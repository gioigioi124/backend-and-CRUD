import { Outlet, useLocation } from "react-router";
import Header from "./Header";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import ChatWidget from "../chat/ChatWidget";

const MainLayout = () => {
  const location = useLocation();
  const isOnChatPage = location.pathname === "/chat";

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </SidebarInset>
      {/* Hide ChatWidget when on full-page chat */}
      {!isOnChatPage && <ChatWidget />}
    </SidebarProvider>
  );
};

export default MainLayout;
