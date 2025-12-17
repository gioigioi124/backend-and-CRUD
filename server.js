import express from "express";

//tạo app sử dụng express
const app = express();
const port = 3000;

//middleware đọc Json từ request body
app.use(express.json());

//data giả cho bộ nhớ
let products = [
  {
    id: 1,
    name: "Product 1",
    price: 100,
  },
  {
    id: 2,
    name: "Product 2",
    price: 200,
  },
];

//CREATE hàm tạo một product mới
app.post("/products", (req, res) => {
  const newProduct = {
    id: products.length + 1,
    name: req.body.name,
    price: req.body.price,
  };
  products.push(newProduct);
  res.send(201).json(newProduct);
});

//GET hàm lấy tất cả dữ liệu ở server rồi trả về
app.get("/products", (req, res) => {
  res.json(products);
});

//GET hàm lấy 1 sản phẩm theo ID
app.get("/products/:id", (req, res) => {
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (!product) {
    res.send(404).json({ message: "không tìm thấy sản phẩm" });
  } else {
    res.json(product);
  }
});

//UPDATE hàm cập nhật sản phẩm theo ID
app.put("/products/:id", (req, res) => {
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (!product) {
    res.send(404).json({ message: "không tìm thấy sản phẩm" });
  } else {
    product.name = req.body.name;
    product.price = req.body.price;
    res.json(product);
  }
});

//DELETE hàm xóa sản phẩm theo index
app.delete("/products/:id", (req, res) => {
  const index = products.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) {
    res.send(404).json({ message: "không tìm thấy sản phẩm để xóa" });
  } else {
    products.splice(index, 1);
    res.json({ message: "Đã xóa thành công" });
  }
});

//tạo lắng nghe trên cổng port = 3000
app.listen(port, () => {
  console.log(`Server đang chạy trên cổng ${port}`);
});
