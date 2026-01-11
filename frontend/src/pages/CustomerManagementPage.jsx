import { useState } from "react";
import { Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerUpload from "../components/CustomerUpload";
import CustomerList from "../components/CustomerList";
import * as XLSX from "xlsx";

const CustomerManagementPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUploadSuccess = () => {
    // Trigger refresh of customer list
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDownloadTemplate = () => {
    // Create template data with new debt columns
    const templateData = [
      {
        "Mã KH": "KH001",
        "Tên KH": "Công ty ABC",
        "Địa chỉ": "123 Đường XYZ, Quận 1, TP.HCM",
        "Số điện thoại": "0123456789",
        "Giới hạn nợ": 10000000,
        "Công nợ": 0,
        "Bỏ qua công nợ": false,
      },
      {
        "Mã KH": "KH002",
        "Tên KH": "Công ty DEF",
        "Địa chỉ": "456 Đường ABC, Quận 2, TP.HCM",
        "Số điện thoại": "0987654321",
        "Giới hạn nợ": 20000000,
        "Công nợ": 5000000,
        "Bỏ qua công nợ": true,
      },
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Khách hàng");

    // Generate and download file
    XLSX.writeFile(wb, "Mau_Danh_Sach_Khach_Hang.xlsx");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Quản Lý Khách Hàng</h1>
            <p className="text-muted-foreground">
              Upload và quản lý thông tin khách hàng
            </p>
          </div>
        </div>
        <Button
          onClick={handleDownloadTemplate}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Tải file mẫu
        </Button>
      </div>

      {/* Upload Section */}
      <CustomerUpload onUploadSuccess={handleUploadSuccess} />

      {/* Customer List */}
      <CustomerList
        refreshTrigger={refreshTrigger}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
};

export default CustomerManagementPage;
