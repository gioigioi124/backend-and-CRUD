import express from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrder,
  updateOrder,
  assignToVehicle,
  confirmWarehouse,
  confirmLeader,
} from "../controllers/ordersController.js";

const ordersRouter = express.Router();

// CRUD cơ bản
ordersRouter.post("/", createOrder);
ordersRouter.get("/", getAllOrders);
ordersRouter.get("/:id", getOrder);
ordersRouter.put("/:id", updateOrder);
ordersRouter.delete("/:id", deleteOrder);

// Các chức năng đặc biệt
ordersRouter.put("/:id/assign", assignToVehicle); // Gán hoặc bỏ gán đơn vào xe
ordersRouter.put("/:id/assign-vehicle", assignToVehicle); // Giữ lại để tương thích
ordersRouter.put(
  "/:orderId/items/:itemIndex/warehouse-confirm",
  confirmWarehouse
);
ordersRouter.put("/:orderId/items/:itemIndex/leader-confirm", confirmLeader);

export default ordersRouter;
