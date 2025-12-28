import Vehicle from "../models/Vehicle.js";
import Order from "../models/Order.js";

//thêm dữ liệu
export const createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create({
      ...req.body,
      createdBy: req.user._id, // Gán người tạo từ token
    });
    res.status(201).json(vehicle);
  } catch (error) {
    console.log("Lỗi khi thêm xe - ", error.message);
    res.status(500).json({ message: "Lỗi khi thêm xe" });
  }
};

//lấy tất cả dữ liệu
export const getAllVehicles = async (req, res) => {
  try {
    const { fromDate, toDate, creator } = req.query;
    const filter = {};

    // Filter theo người tạo
    if (creator) {
      filter.createdBy = creator;
    }

    // Filter theo khoảng ngày (vehicleDate)
    if (fromDate || toDate) {
      filter.vehicleDate = {};
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0); // Start of day
        filter.vehicleDate.$gte = from;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999); // End of day
        filter.vehicleDate.$lte = to;
      }
    }

    const result = await Vehicle.find(filter)
      .populate("createdBy", "name username")
      .sort({
        vehicleDate: -1,
        createdAt: -1,
      }); // Sắp xếp theo vehicleDate, sau đó createdAt
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
    vehicle.weight = req.body.weight;
    vehicle.destination = req.body.destination;
    vehicle.note = req.body.note;
    if (req.body.vehicleDate) {
      vehicle.vehicleDate = req.body.vehicleDate;
    }
    await vehicle.save();
    res.status(200).json(vehicle);
  } catch (error) {
    console.log("Lỗi khi cập nhật thông tin xe - ", error.message);
    console.log("Lỗi khi cập nhật thông tin xe");
    res.status(500).json({ message: "Lỗi khi cập nhật thông tin xe" });
  }
};

//xóa dữ liệu
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem có đơn hàng nào đang gán vào xe không
    const ordersWithVehicle = await Order.countDocuments({ vehicle: id });

    if (ordersWithVehicle > 0) {
      return res.status(400).json({
        message: `Không thể xóa xe. Có ${ordersWithVehicle} đơn hàng đang được gán vào xe này. Vui lòng bỏ gán các đơn hàng trước khi xóa xe.`,
      });
    }

    const vehicle = await Vehicle.findByIdAndDelete(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Không có xe này" });
    }
    res.status(200).json({ message: "Xóa xe thành công" });
  } catch (error) {
    console.log("Lỗi khi xóa xe - ", error.message);
    res.status(500).json({ message: "Lỗi khi xóa xe" });
  }
};
