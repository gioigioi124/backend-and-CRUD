import express from "express";

//tạo app sử dụng express
const app = express();
const port = 3000;

//hàm lấy dữ liệu từ server
app.get("/", (req, res) => {
  res.send("Xin chào");
});

//tạo lắng nghe trên cổng port = 3000
app.listen(port, () => {
  console.log(`Server đang chạy trên cổng ${port}`);
});
