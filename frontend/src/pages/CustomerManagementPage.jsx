import { useState } from "react";
import { Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerUpload from "../components/CustomerUpload";
import CustomerList from "../components/CustomerList";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from "xlsx";

const CustomerManagementPage = () => {
  const { user } = useAuth();
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
    <div className="container mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title="Quản Lý Khách Hàng"
        subtitle="Upload và quản lý thông tin khách hàng"
        currentPage="home"
        user={user}
      />

      <div className="flex justify-end">
        <Button
          onClick={handleDownloadTemplate}
          variant="outline"
          size="sm"
          className="gap-1 md:gap-2 h-8 md:h-10 text-xs md:text-sm"
        >
          <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Tải file mẫu</span>
          <span className="sm:hidden">Tải mẫu</span>
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
