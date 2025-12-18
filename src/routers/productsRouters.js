import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../controllers/productsController.js";
//tạo router sử dụng express Router
const router = express.Router();

//CREATE hàm tạo một product mới
router.post("/", createProduct);

//GET hàm lấy tất cả dữ liệu ở server rồi trả về
router.get("/", getAllProducts);

//GET hàm lấy 1 sản phẩm theo ID
router.get("/:id", getProduct);

//UPDATE hàm cập nhật sản phẩm theo ID
router.put("/:id", updateProduct);

//DELETE hàm xóa sản phẩm theo index
router.delete("/:id", deleteProduct);

export default router;
