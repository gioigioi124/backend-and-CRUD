import Vehicle from "../models/Vehicle.js";

//thêm dữ liệu
export const createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    console.log("Lỗi khi thêm xe - ", error.message);
    res.status(500).json({ message: "Lỗi khi thêm xe" });
  }
};

//lấy tất cả dữ liệu
export const getAllVehicles = async (req, res) => {
  try {
    const result = await Vehicle.find({});
    res.status(200).json(result);
  } catch (error) {
    console.log("Lỗi khi lấy thông tin xe - ", error.message);
    res.status(500).json({ message: "Lỗi khi lấy thông tin toàn bộ xe" });
  }
};

//lấy dữ liệu một xe
export const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    res.status(200).json(vehicle);
  } catch (error) {
    console.log("Lỗi khi lấy thông tin xe - ", error.message);
    res.status(500).json({ message: "Lỗi khi lấy thông tin  xe" });
  }
};

//update dữ liệu
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Không có xe này" });
    vehicle.carName = req.body.carName;
    vehicle.time = req.body.time;
    vehicle.destination = req.body.destination;
    vehicle.note = req.body.note;
    res.status(200).json(vehicle);
  } catch (error) {
    console.log("Lỗi khi cập nhật thông tin xe - ", error.message);
    console.log("Lỗi khi cập nhật thông tin xe");
  }
};

//xóa dữ liệu
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Không có xe này" });
    }
    res.status(200).json({ message: "Xóa xe thành công" });
  } catch (error) {
    console.log("Lỗi khi xóa xe - ", error.message);
    console.log("Lỗi khi xóa xe");
  }
};
