import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    //thông tin xe: tên xe, trọng tải, thời gian, nơi đến
    carName: {
      type: String,
      required: true,
      trim: true,
    },
    weight: {
      type: String,
      required: true,
      enum: {
        values: [
          "5 tạ",
          "1.25T",
          "1.25T Livax",
          "3.5T",
          "5T",
          "7T",
          "Xe SG",
          "10T Hà Nội",
          "HN ngoài",
          "CPN",
          "Xe khách",
          "Cont 20",
          "Cont 40",
        ],
        message: "Kho phải là một trong các giá trị có sẵn",
      },
    },
    time: {
      // thời gian vào 8h30, 10h, 15h30...
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      //Hà Nội, Thái Nguyên ...
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    // Ngày xe (cho phép hôm nay hoặc tương lai, không cho phép quá khứ)
    vehicleDate: {
      type: Date,
      required: [true, "Ngày xe là bắt buộc"],
      validate: {
        validator: function (value) {
          // Chỉ cho phép ngày hôm nay hoặc tương lai
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const vehicleDate = new Date(value);
          vehicleDate.setHours(0, 0, 0, 0);
          return vehicleDate >= today;
        },
        message: "Ngày xe không được là ngày trong quá khứ",
      },
      default: Date.now,
    },
    // Trạng thái đã in đơn
    isPrinted: {
      type: Boolean,
      default: false,
    },
    // Trạng thái đã hoàn thành
    isCompleted: {
      type: Boolean,
      default: false,
    },
    // Người tạo xe
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
