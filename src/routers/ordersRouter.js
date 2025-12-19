import express from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrder,
  updateOrder,
} from "../controllers/ordersController.js";
//tạo router sử dụng express Router
const ordersRouter = express.Router();

//CREATE hàm tạo một product mới
ordersRouter.post("/", createOrder);

//GET hàm lấy tất cả dữ liệu ở server rồi trả về
ordersRouter.get("/", getAllOrders);

//GET hàm lấy 1 sản phẩm theo ID
ordersRouter.get("/:id", getOrder);

//UPDATE hàm cập nhật sản phẩm theo ID
ordersRouter.put("/:id", updateOrder);

//DELETE hàm xóa sản phẩm theo index
ordersRouter.delete("/:id", deleteOrder);

export default ordersRouter;
