import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import ordersRouter from "./src/routers/ordersRouter.js";
import vehiclesRouter from "./src/routers/vehiclesRouter.js";
import authRouter from "./src/routers/authRouter.js";
import userRouter from "./src/routers/userRouter.js";
import customerRouter from "./src/routers/customerRouter.js";
import cors from "cors";

//gọi dotenv
dotenv.config();
const PORT = process.env.PORT || 3000;

//tạo app sử dụng express
const app = express();

//middleware đọc Json từ request body
app.use(express.json());

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

//rút gọn URL nhờ router
app.use("/orders", ordersRouter);
app.use("/vehicles", vehiclesRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/customers", customerRouter);

// connect DB
connectDB().then(() => {
  //  tạo lắng nghe trên cổng 3000
  app.listen(PORT, () => {
    console.log(`server bắt đầu trên cổng ${PORT}`);
  });
});
