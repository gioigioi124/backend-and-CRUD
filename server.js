import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "./src/controllers/productsController.js";

//tạo app sử dụng express
const app = express();
const port = 3000;

//middleware đọc Json từ request body
app.use(express.json());

//CREATE hàm tạo một product mới
app.post("/products", createProduct);

//GET hàm lấy tất cả dữ liệu ở server rồi trả về
app.get("/products", getAllProducts);

//GET hàm lấy 1 sản phẩm theo ID
app.get("/products/:id", getProduct);

//UPDATE hàm cập nhật sản phẩm theo ID
app.put("/products/:id", updateProduct);

//DELETE hàm xóa sản phẩm theo index
app.delete("/products/:id", deleteProduct);

//tạo lắng nghe trên cổng port = 3000
app.listen(port, () => {
  console.log(`Server đang chạy trên cổng ${port}`);
});
