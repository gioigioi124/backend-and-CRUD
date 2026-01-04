import { useState } from "react";
import { Upload, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import customerService from "../services/customerService";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import * as XLSX from "xlsx";

const CustomerUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Vui lòng chọn file Excel (.xls hoặc .xlsx)");
        return;
      }
      setFile(selectedFile);
      setUploadSummary(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file Excel");
      return;
    }

    setUploading(true);
    try {
      const result = await customerService.uploadCustomers(file);
      toast.success(result.message);
      setUploadSummary(result.summary);
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById("customer-file-input");
      if (fileInput) fileInput.value = "";

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi upload file");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create sample data
    const templateData = [
      {
        "Mã KH": "KH001",
        "Tên KH": "Công ty ABC",
        "Địa chỉ": "123 Đường XYZ, Q1, HCM",
        "Số điện thoại": "0901234567",
      },
      {
        "Mã KH": "KH002",
        "Tên KH": "Cửa hàng DEF",
        "Địa chỉ": "456 Đường ABC, Q2, HCM",
        "Số điện thoại": "0912345678",
      },
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Khách hàng");

    // Set column widths
    ws["!cols"] = [
      { wch: 15 }, // Mã KH
      { wch: 30 }, // Tên KH
      { wch: 40 }, // Địa chỉ
      { wch: 15 }, // Số điện thoại
    ];

    // Download file
    XLSX.writeFile(wb, "Mau_Khach_Hang.xlsx");
    toast.success("Đã tải xuống file mẫu");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Dữ Liệu Khách Hàng
        </CardTitle>
        <CardDescription>
          Upload file Excel chứa thông tin khách hàng (Mã KH, Tên KH, Địa chỉ,
          Số điện thoại)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Template Button */}
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={downloadTemplate}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Tải File Mẫu
          </Button>
        </div>

        {/* File Input */}
        <div className="space-y-2">
          <label
            htmlFor="customer-file-input"
            className="block text-sm font-medium"
          >
            Chọn File Excel
          </label>
          <div className="flex items-center gap-2">
            <input
              id="customer-file-input"
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                {file.name}
              </div>
            )}
          </div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full sm:w-auto"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang upload...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </>
          )}
        </Button>

        {/* Upload Summary */}
        {uploadSummary && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Kết quả upload:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Tổng số dòng:</div>
              <div className="font-medium">{uploadSummary.total}</div>

              <div>Thêm mới:</div>
              <div className="font-medium text-green-600">
                {uploadSummary.inserted}
              </div>

              <div>Cập nhật:</div>
              <div className="font-medium text-blue-600">
                {uploadSummary.updated}
              </div>

              <div>Trùng lặp:</div>
              <div className="font-medium text-yellow-600">
                {uploadSummary.duplicates}
              </div>

              {uploadSummary.errors > 0 && (
                <>
                  <div>Lỗi:</div>
                  <div className="font-medium text-red-600">
                    {uploadSummary.errors}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerUpload;
