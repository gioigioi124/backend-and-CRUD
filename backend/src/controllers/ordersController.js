import Order from "../models/Order.js";

// CREATE - Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({
      message: "Tạo đơn hàng thất bại",
      error: error.message,
    });
  }
};

// GET ALL - Lấy tất cả đơn hàng
export const getAllOrders = async (req, res) => {
  try {
    const { vehicle } = req.query; // Lọc theo xe nếu có

    const filter = {};
    if (vehicle) {
      filter.vehicle = vehicle;
    }

    const orders = await Order.find(filter)
      .populate("vehicle") // Lấy thông tin xe
      .sort({ createdAt: -1 }); // Mới nhất trước

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Lấy danh sách đơn hàng thất bại",
      error: error.message,
    });
  }
};

// GET ONE - Lấy 1 đơn hàng theo ID
export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("vehicle");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Lấy đơn hàng thất bại",
      error: error.message,
    });
  }
};

// UPDATE - Cập nhật đơn hàng
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true } // Trả về document mới và chạy validation
    ).populate("vehicle");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({
      message: "Cập nhật đơn hàng thất bại",
      error: error.message,
    });
  }
};

// DELETE - Xóa đơn hàng
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json({
      message: "Xóa đơn hàng thành công",
      deletedOrder: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Xóa đơn hàng thất bại",
      error: error.message,
    });
  }
};

// ASSIGN TO VEHICLE - Gán đơn hàng vào xe (sẽ dùng sau)
export const assignToVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicleId } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { vehicle: vehicleId },
      { new: true, runValidators: true }
    ).populate("vehicle");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({
      message: "Gán xe thất bại",
      error: error.message,
    });
  }
};

// CONFIRM WAREHOUSE - Thủ kho xác nhận (sẽ dùng sau)
export const confirmWarehouse = async (req, res) => {
  try {
    const { orderId, itemIndex } = req.params;
    const { value } = req.body; // Giá trị xác nhận (số lượng hoặc giờ hẹn)

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (!order.items[itemIndex]) {
      return res.status(404).json({ message: "Không tìm thấy item" });
    }

    // Cập nhật xác nhận của thủ kho
    order.items[itemIndex].warehouseConfirm = {
      value: value,
      confirmedAt: new Date(),
    };

    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({
      message: "Xác nhận thủ kho thất bại",
      error: error.message,
    });
  }
};

// CONFIRM LEADER - Tổ trưởng xác nhận (sẽ dùng sau)
export const confirmLeader = async (req, res) => {
  try {
    const { orderId, itemIndex } = req.params;
    const { value } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (!order.items[itemIndex]) {
      return res.status(404).json({ message: "Không tìm thấy item" });
    }

    // Cập nhật xác nhận của tổ trưởng
    order.items[itemIndex].leaderConfirm = {
      value: value,
      confirmedAt: new Date(),
    };

    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({
      message: "Xác nhận tổ trưởng thất bại",
      error: error.message,
    });
  }
};
