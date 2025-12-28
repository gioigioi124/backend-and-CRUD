import Order from "../models/Order.js";

// CREATE - Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      createdBy: req.user._id, // Gán người tạo từ token
    });
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
    const { vehicle, status, search, creator, fromDate, toDate } = req.query; // Lọc theo xe, trạng thái, và tìm kiếm

    const filter = {};

    // Filter theo người tạo
    if (creator) {
      filter.createdBy = creator;
    }

    // Filter theo vehicle (nếu có)
    if (vehicle) {
      filter.vehicle = vehicle;
    }

    // Filter theo trạng thái gán xe
    if (status === "unassigned") {
      filter.vehicle = null; // Chưa gán xe
    } else if (status === "assigned") {
      filter.vehicle = { $ne: null }; // Đã gán xe
    }

    // Tìm kiếm theo tên khách hàng (case-insensitive)
    if (search && search.trim()) {
      filter["customer.name"] = {
        $regex: search.trim(),
        $options: "i", // Case-insensitive
      };
    }

    // Filter theo khoảng ngày (orderDate)
    if (fromDate || toDate) {
      filter.orderDate = {};
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0); // Start of day
        filter.orderDate.$gte = from;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999); // End of day
        filter.orderDate.$lte = to;
      }
    }

    const orders = await Order.find(filter)
      .populate("vehicle") // Lấy thông tin xe
      .populate("createdBy", "name username") // Lấy thông tin người tạo
      .sort({ orderDate: -1, createdAt: -1 }); // Sắp xếp theo orderDate, sau đó createdAt

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
    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Nếu có cập nhật items, kiểm tra tính hợp lệ
    if (req.body.items) {
      const newItems = req.body.items;

      // 1. Kiểm tra xem có xóa mất item nào đã được xác nhận không
      for (const oldItem of existingOrder.items) {
        if (oldItem.warehouseConfirm?.value) {
          const stillExists = newItems.find(
            (it) => it._id && it._id.toString() === oldItem._id.toString()
          );
          if (!stillExists) {
            return res.status(400).json({
              message: `Không thể xóa hàng hóa "${oldItem.productName}" đã được kho xác nhận`,
            });
          }
        }
      }

      // 2. Kiểm tra xem có đổi kho của item đã xác nhận không
      for (const newItem of newItems) {
        if (newItem._id) {
          const oldItem = existingOrder.items.find(
            (it) => it._id.toString() === newItem._id.toString()
          );
          if (oldItem && oldItem.warehouseConfirm?.value) {
            if (newItem.warehouse !== oldItem.warehouse) {
              return res.status(400).json({
                message: `Không thể đổi kho cho hàng hóa "${oldItem.productName}" đã được xác nhận`,
              });
            }
          }
        }
      }
    }

    const order = await Order.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true } // Trả về document mới và chạy validation
    ).populate("vehicle");

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
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra xem có item nào đã xác nhận chưa
    const hasConfirmedItem = order.items.some(
      (item) => item.warehouseConfirm?.value
    );
    if (hasConfirmedItem) {
      return res.status(400).json({
        message: "Không thể xóa đơn hàng đã có hàng hóa được kho xác nhận",
      });
    }

    await Order.findByIdAndDelete(id);

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

// ASSIGN TO VEHICLE - Gán đơn hàng vào xe hoặc bỏ gán (vehicleId = null)
export const assignToVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicleId } = req.body;

    // Cho phép vehicleId = null để bỏ gán
    const updateData =
      vehicleId === null || vehicleId === undefined
        ? { vehicle: null }
        : { vehicle: vehicleId };

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("vehicle");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({
      message:
        vehicleId === null || vehicleId === undefined
          ? "Bỏ gán xe thất bại"
          : "Gán xe thất bại",
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

    // Check quyền: chỉ user có warehouseCode trùng khớp hoặc admin mới được xác nhận
    if (
      req.user.role === "warehouse" &&
      req.user.warehouseCode !== order.items[itemIndex].warehouse
    ) {
      return res.status(403).json({
        message: "Bạn không có quyền xác nhận hàng của kho này",
      });
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

// CONFIRM ALL DETAILS - Xác nhận tất cả hàng hóa trong 1 đơn (Cho điều vận)
export const confirmOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // Mảng items đã update warehouseConfirm và leaderConfirm

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Cập nhật từng item
    items.forEach((updatedItem) => {
      const itemIndex = order.items.findIndex(
        (it) => it._id.toString() === updatedItem._id.toString()
      );
      if (itemIndex !== -1) {
        // Cập nhật warehouseConfirm nếu có thay đổi
        if (updatedItem.warehouseConfirm !== undefined) {
          order.items[itemIndex].warehouseConfirm = {
            value: updatedItem.warehouseConfirm.value,
            confirmedAt: new Date(),
          };
        }
        // Cập nhật leaderConfirm nếu có thay đổi
        if (updatedItem.leaderConfirm !== undefined) {
          order.items[itemIndex].leaderConfirm = {
            value: updatedItem.leaderConfirm.value,
            confirmedAt: new Date(),
          };
        }
      }
    });

    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({
      message: "Xác nhận chi tiết đơn hàng thất bại",
      error: error.message,
    });
  }
};
