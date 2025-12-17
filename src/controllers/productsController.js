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
//lấy tất cả dữ liệu
export const getAllProducts = async (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin toàn bộ sản phẩm", error);
    console.log("Lỗi khi lấy thông tin toàn bộ sản phẩm");
  }
};
//lấy dữ liệu một sản phẩm
export const getProduct = async (req, res) => {
  try {
    const product = products.find((p) => p.id === parseInt(req.params.id));
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin sản phẩm", error);
    console.log("Lỗi khi lấy thông tin sản phẩm");
  }
};
//update dữ liệu
export const updateProduct = async (req, res) => {
  try {
    const product = products.find((p) => p.id === parseInt(req.params.id));
    if (!product)
      return res.status(404).json({ message: "Không có sản phẩm này" });
    product.name = req.body.name;
    product.price = req.body.price;
    res.json(product);
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin sản phẩm", error);
    console.log("Lỗi khi cập nhật thông tin sản phẩm");
  }
};
//thêm dữ liệu
export const createProduct = async (req, res) => {
  try {
    const newProduct = {
      id: products.length + 1,
      name: req.body.name,
      price: req.body.price,
    };
    if (!newProduct)
      return res.status(404).json({ message: "Lỗi khi thêm sản phẩm" });
    products.push(newProduct);
    res.status(200).json(newProduct);
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm", error);
    console.log("Lỗi khi thêm sản phẩm");
  }
};
//xóa dữ liệu
export const deleteProduct = async (req, res) => {
  try {
    const index = products.findIndex((p) => p.id === parseInt(req.params.id));
    if (index === -1)
      return res.status(404).json({ message: "Không có sản phẩm này để xóa" });
    products = products.filter((p) => p.id !== parseInt(req.params.id));
    res.status(200).json({ message: "Xóa thành công sản phẩm" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm", error);
    console.log("Lỗi khi xóa sản phẩm");
  }
};
