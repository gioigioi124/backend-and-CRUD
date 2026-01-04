import XLSX from "xlsx";

// Sample customer data
const sampleData = [
  {
    "Mã KH": "KH001",
    "Tên KH": "Công ty TNHH ABC",
    "Địa chỉ": "123 Nguyễn Văn Linh, Q7, TP.HCM",
    "Số điện thoại": "0901234567",
  },
  {
    "Mã KH": "KH002",
    "Tên KH": "Cửa hàng Điện Máy XYZ",
    "Địa chỉ": "456 Lê Văn Việt, Q9, TP.HCM",
    "Số điện thoại": "0912345678",
  },
  {
    "Mã KH": "KH003",
    "Tên KH": "Siêu thị Mini Mart",
    "Địa chỉ": "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
    "Số điện thoại": "0923456789",
  },
  {
    "Mã KH": "KH004",
    "Tên KH": "Nhà hàng Hương Việt",
    "Địa chỉ": "321 Trần Hưng Đạo, Q1, TP.HCM",
    "Số điện thoại": "0934567890",
  },
  {
    "Mã KH": "KH005",
    "Tên KH": "Cửa hàng Thời Trang DEF",
    "Địa chỉ": "654 Nguyễn Thị Minh Khai, Q3, TP.HCM",
    "Số điện thoại": "0945678901",
  },
];

// Create worksheet
const ws = XLSX.utils.json_to_sheet(sampleData);

// Set column widths
ws["!cols"] = [
  { wch: 15 }, // Mã KH
  { wch: 30 }, // Tên KH
  { wch: 40 }, // Địa chỉ
  { wch: 15 }, // Số điện thoại
];

// Create workbook
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Khách hàng");

// Write file
XLSX.writeFile(wb, "Du_Lieu_Khach_Hang_Mau.xlsx");

console.log("File Excel mẫu đã được tạo: Du_Lieu_Khach_Hang_Mau.xlsx");
