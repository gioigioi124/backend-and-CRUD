import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header sẽ thêm sau */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
