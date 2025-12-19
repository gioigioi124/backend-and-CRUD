//lấy tất cả dữ liệu
export const getAllOrders = async (req, res) => {
  try {
    res.json(orders);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin toàn bộ sản phẩm", error);
    console.log("Lỗi khi lấy thông tin toàn bộ sản phẩm");
  }
};
//lấy dữ liệu một sản phẩm
export const getOrder = async (req, res) => {
  try {
    const order = orders.find((p) => p.id === parseInt(req.params.id));
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(order);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin sản phẩm", error);
    console.log("Lỗi khi lấy thông tin sản phẩm");
  }
};
//update dữ liệu
export const updateOrder = async (req, res) => {
  try {
    const order = orders.find((p) => p.id === parseInt(req.params.id));
    if (!order)
      return res.status(404).json({ message: "Không có sản phẩm này" });
    order.name = req.body.name;
    order.price = req.body.price;
    res.json(order);
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin sản phẩm", error);
    console.log("Lỗi khi cập nhật thông tin sản phẩm");
  }
};
//thêm dữ liệu
export const createOrder = async (req, res) => {
  try {
    const newOrder = {
      id: orders.length + 1,
      name: req.body.name,
      price: req.body.price,
    };
    if (!newOrder)
      return res.status(404).json({ message: "Lỗi khi thêm sản phẩm" });
    orders.push(newOrder);
    res.status(200).json(newOrder);
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm", error);
    console.log("Lỗi khi thêm sản phẩm");
  }
};
//xóa dữ liệu
export const deleteOrder = async (req, res) => {
  try {
    const index = orders.findIndex((p) => p.id === parseInt(req.params.id));
    if (index === -1)
      return res.status(404).json({ message: "Không có sản phẩm này để xóa" });
    orders = orders.filter((p) => p.id !== parseInt(req.params.id));
    res.status(200).json({ message: "Xóa thành công sản phẩm" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm", error);
    console.log("Lỗi khi xóa sản phẩm");
  }
};
