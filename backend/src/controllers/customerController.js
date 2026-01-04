import Customer from "../models/Customer.js";
import xlsx from "xlsx";

// Upload Excel file and bulk insert customers
export const uploadCustomers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn file Excel" });
    }

    // Read Excel file from buffer
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ message: "File Excel không có dữ liệu" });
    }

    // Validate headers
    const firstRow = data[0];
    const requiredHeaders = ["Mã KH", "Tên KH"];
    const missingHeaders = requiredHeaders.filter(
      (header) => !(header in firstRow)
    );

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        message: `File Excel thiếu các cột: ${missingHeaders.join(", ")}`,
      });
    }

    // Prepare bulk operations
    const bulkOps = [];
    const errors = [];
    let duplicateCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Validate required fields
      if (!row["Mã KH"] || !row["Tên KH"]) {
        errors.push({
          row: i + 2, // +2 because Excel is 1-indexed and has header row
          message: "Thiếu Mã KH hoặc Tên KH",
        });
        continue;
      }

      // Prepare customer data
      const customerData = {
        customerCode: String(row["Mã KH"]).trim(),
        name: String(row["Tên KH"]).trim(),
        address: row["Địa chỉ"] ? String(row["Địa chỉ"]).trim() : "",
        phone: row["Số điện thoại"] ? String(row["Số điện thoại"]).trim() : "",
        createdBy: req.user.id,
      };

      // Use updateOne with upsert to handle duplicates
      bulkOps.push({
        updateOne: {
          filter: { customerCode: customerData.customerCode },
          update: { $set: customerData },
          upsert: true,
        },
      });
    }

    if (bulkOps.length === 0) {
      return res.status(400).json({
        message: "Không có dữ liệu hợp lệ để upload",
        errors,
      });
    }

    // Execute bulk write
    const result = await Customer.bulkWrite(bulkOps, { ordered: false });

    // Count duplicates (matched but not modified means it was a duplicate)
    duplicateCount = result.matchedCount - result.modifiedCount;

    res.status(200).json({
      message: "Upload thành công",
      summary: {
        total: data.length,
        inserted: result.upsertedCount,
        updated: result.modifiedCount,
        duplicates: duplicateCount,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Lỗi khi upload file",
      error: error.message,
    });
  }
};

// Search customers by name
export const searchCustomers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
    }

    // Case-insensitive partial match
    const customers = await Customer.find({
      name: { $regex: q, $options: "i" },
    })
      .select("customerCode name address phone")
      .limit(20)
      .sort({ name: 1 });

    res.status(200).json(customers);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      message: "Lỗi khi tìm kiếm khách hàng",
      error: error.message,
    });
  }
};

// Get all customers with pagination
export const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find()
        .select("customerCode name address phone createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Customer.countDocuments(),
    ]);

    res.status(200).json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách khách hàng",
      error: error.message,
    });
  }
};

// Delete a customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    res.status(200).json({ message: "Xóa khách hàng thành công" });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({
      message: "Lỗi khi xóa khách hàng",
      error: error.message,
    });
  }
};
