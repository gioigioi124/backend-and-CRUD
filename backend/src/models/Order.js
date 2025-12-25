import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Thông tin khách hàng
    customer: {
      name: {
        type: String,
        required: [true, "Tên khách hàng là bắt buộc"],
        trim: true,
      },
      note: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // Danh sách hàng hóa trong đơn
    items: [
      {
        stt: {
          type: Number,
          required: true,
        },
        productName: {
          type: String,
          required: [true, "Tên hàng hóa là bắt buộc"],
          trim: true,
        },
        size: {
          type: String,
          trim: true,
        },
        unit: {
          type: String,
          required: [true, "Đơn vị tính là bắt buộc"],
          trim: true,
        },
        quantity: {
          type: Number,
          required: [true, "Số lượng là bắt buộc"],
          min: [0, "Số lượng không thể âm"],
        },
        warehouse: {
          type: String,
          required: [true, "Kho là bắt buộc"],
          enum: {
            values: ["K01", "K02", "K03", "K04"],
            message: "Kho phải là một trong: K01, K02, K03, K04",
          },
        },
        cmQty: {
          type: Number,
          min: [0, "Số cm hàng không thể âm"],
          default: 0,
        },
        note: {
          type: String,
          trim: true,
          default: "",
        },
        // Xác nhận của thủ kho (linh hoạt: có thể là số lượng hoặc giờ hẹn)
        warehouseConfirm: {
          value: {
            type: String, // Linh hoạt: "10", "16h", "15:30", v.v.
            trim: true,
          },
          confirmedAt: {
            type: Date,
          },
        },
        // Xác nhận của tổ trưởng
        leaderConfirm: {
          value: {
            type: String, // Số lượng thực tế lên xe
            trim: true,
          },
          confirmedAt: {
            type: Date,
          },
        },
      },
    ],

    // Thông tin xe (ban đầu chưa có)
    vehicle: {
      type: mongoose.Schema.Types.ObjectId, //tham chiếu đến schema của vehicle
      ref: "Vehicle",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// sau khi có schema thì sẽ tạo model từ nó
// mongo sẽ tự hiểu, model Order thì colection sẽ là Orders
const Order = mongoose.model("Order", orderSchema);

export default Order;
