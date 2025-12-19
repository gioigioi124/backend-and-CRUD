import express from "express";
import {
  createVehicle,
  deleteVehicle,
  getAllVehicles,
  getVehicle,
  updateVehicle,
} from "../controllers/vehiclesController.js";
//tạo router sử dụng express Router
const vehiclesRouter = express.Router();

//CREATE hàm tạo một product mới
vehiclesRouter.post("/", createVehicle);

//GET hàm lấy tất cả dữ liệu ở server rồi trả về
vehiclesRouter.get("/", getAllVehicles);

//GET hàm lấy 1 sản phẩm theo ID
vehiclesRouter.get("/:id", getVehicle);

//UPDATE hàm cập nhật sản phẩm theo ID
vehiclesRouter.put("/:id", updateVehicle);

//DELETE hàm xóa sản phẩm theo index
vehiclesRouter.delete("/:id", deleteVehicle);

export default vehiclesRouter;
