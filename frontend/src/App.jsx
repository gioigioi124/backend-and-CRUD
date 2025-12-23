import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from "./components/layout/MainLayout";
import Header from "./components/layout/Header";
import HomePage from "./pages/HomePage";
import OrderListPage from "./pages/OrderListPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import CreateVehiclePage from "./pages/CreateVehiclePage";

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="create-order" element={<CreateOrderPage />} />
            <Route path="create-vehicle" element={<CreateVehiclePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
