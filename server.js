import express from "express";
import router from "./src/routers/productsRouters.js";

//tạo app sử dụng express
const app = express();
const port = 3000;

//middleware đọc Json từ request body
app.use(express.json());

//rút gọn URL nhờ router
app.use("/products", router);

//tạo lắng nghe trên cổng port = 3000
app.listen(port, () => {
  console.log(`Server đang chạy trên cổng ${port}`);
});
