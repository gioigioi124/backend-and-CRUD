//lấy tất cả dữ liệu
export const getAllVehicles = async (req, res) => {
  try {
    res.json(vehicles);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin toàn bộ sản phẩm", error);
    console.log("Lỗi khi lấy thông tin toàn bộ sản phẩm");
  }
};
//lấy dữ liệu một sản phẩm
export const getVehicle = async (req, res) => {
  try {
    const vehicle = vehicles.find((p) => p.id === parseInt(req.params.id));
    if (!vehicle)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(vehicle);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin sản phẩm", error);
    console.log("Lỗi khi lấy thông tin sản phẩm");
  }
};
//update dữ liệu
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = vehicles.find((p) => p.id === parseInt(req.params.id));
    if (!vehicle)
      return res.status(404).json({ message: "Không có sản phẩm này" });
    vehicle.name = req.body.name;
    vehicle.price = req.body.price;
    res.json(vehicle);
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin sản phẩm", error);
    console.log("Lỗi khi cập nhật thông tin sản phẩm");
  }
};
//thêm dữ liệu
export const createVehicle = async (req, res) => {
  try {
    const newVehicle = {
      id: vehicles.length + 1,
      name: req.body.name,
      price: req.body.price,
    };
    if (!newVehicle)
      return res.status(404).json({ message: "Lỗi khi thêm sản phẩm" });
    vehicles.push(newVehicle);
    res.status(200).json(newVehicle);
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm", error);
    console.log("Lỗi khi thêm sản phẩm");
  }
};
//xóa dữ liệu
export const deleteVehicle = async (req, res) => {
  try {
    const index = vehicles.findIndex((p) => p.id === parseInt(req.params.id));
    if (index === -1)
      return res.status(404).json({ message: "Không có sản phẩm này để xóa" });
    vehicles = vehicles.filter((p) => p.id !== parseInt(req.params.id));
    res.status(200).json({ message: "Xóa thành công sản phẩm" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm", error);
    console.log("Lỗi khi xóa sản phẩm");
  }
};
