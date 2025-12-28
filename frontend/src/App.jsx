import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import OrderListPage from "./pages/OrderListPage";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import WarehouseDashboard from "./pages/WarehouseDashboard";
import DispatcherDashboard from "./pages/DispatcherDashboard";
import PrivateRoute from "./components/PrivateRoute";
import { VehicleProvider } from "./vehicles/VehicleContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <>
      <Toaster richColors position="top-center" />
      <BrowserRouter>
        <AuthProvider>
          <VehicleProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="orders" element={<OrderListPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route
                    element={<PrivateRoute allowedRoles={["warehouse"]} />}
                  >
                    <Route path="warehouse" element={<WarehouseDashboard />} />
                  </Route>
                  <Route
                    element={
                      <PrivateRoute
                        allowedRoles={["admin", "staff", "leader"]}
                      />
                    }
                  >
                    <Route
                      path="dispatcher"
                      element={<DispatcherDashboard />}
                    />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </VehicleProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
