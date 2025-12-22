import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import VehicleList from "./vehicles/VehicleList.jsx";

function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VehicleList />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
