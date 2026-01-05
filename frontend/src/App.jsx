import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import OrderListPage from "./pages/OrderListPage";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import CustomerManagementPage from "./pages/CustomerManagementPage";
import WarehouseDashboard from "./pages/WarehouseDashboard";
import DispatcherDashboard from "./pages/DispatcherDashboard";
import VehicleReportPage from "./pages/VehicleReportPage";
import SurplusDeficitDashboard from "./pages/SurplusDeficitDashboard";
import PrivateRoute from "./components/PrivateRoute";
import { VehicleProvider } from "./vehicles/VehicleContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <div className="min-h-screen w-full relative">
      {/* Ocean Breeze Fade Gradient */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `linear-gradient(225deg, #B3E5FC 0%, #E0F2F1 25%, #F0F4C3 50%, #FFF8E1 75%, #FFECB3 100%)`,
        }}
      />
      <div className="relative z-10 flex flex-col min-h-screen">
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
                    <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                      <Route
                        path="customers"
                        element={<CustomerManagementPage />}
                      />
                    </Route>
                    <Route
                      element={<PrivateRoute allowedRoles={["warehouse"]} />}
                    >
                      <Route
                        path="warehouse"
                        element={<WarehouseDashboard />}
                      />
                    </Route>
                    <Route
                      element={
                        <PrivateRoute allowedRoles={["admin", "leader"]} />
                      }
                    >
                      <Route
                        path="dispatcher"
                        element={<DispatcherDashboard />}
                      />
                    </Route>
                    <Route
                      element={
                        <PrivateRoute
                          allowedRoles={["admin", "staff", "leader"]}
                        />
                      }
                    >
                      <Route
                        path="vehicle-report"
                        element={<VehicleReportPage />}
                      />
                      <Route
                        path="surplus-deficit"
                        element={<SurplusDeficitDashboard />}
                      />
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </VehicleProvider>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
