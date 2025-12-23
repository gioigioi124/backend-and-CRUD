import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from "./components/layout/MainLayout";
import Header from "./components/layout/Header";
import HomePage from "./pages/HomePage";
import OrderListPage from "./pages/OrderListPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import { VehicleProvider } from "./vehicles/VehicleContext";

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <VehicleProvider>
          <Header />
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="orders" element={<OrderListPage />} />
              <Route path="create-order" element={<CreateOrderPage />} />
            </Route>
          </Routes>
        </VehicleProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
