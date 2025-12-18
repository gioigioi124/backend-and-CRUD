import express from "express";
import router from "./src/routers/productsRouters.js";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";

//gọi dotenv
dotenv.config();
const PORT = process.env.PORT || 3000;

//tạo app sử dụng express
const app = express();

//middleware đọc Json từ request body
app.use(express.json());

//rút gọn URL nhờ router
app.use("/products", router);

// connect DB
connectDB().then(() => {
  //  tạo lắng nghe trên cổng 3000
  app.listen(PORT, () => {
    console.log(`server bắt đầu trên cổng ${PORT}`);
  });
});
