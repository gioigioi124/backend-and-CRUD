import React, { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Brain,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const AiKnowledgeUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls")
      ) {
        setFile(selectedFile);
      } else {
        toast.error("Vui lòng chọn file Excel (.xlsx, .xls)");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL || ""}/api/chatbot/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success("Đã cập nhật dữ liệu kiến thức AI thành công!");
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi upload dữ liệu");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
          <Brain size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Cơ sở kiến thức AI
          </h2>
          <p className="text-sm text-gray-500">
            Upload file Excel để huấn luyện Chatbot
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <div
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
            file
              ? "border-indigo-400 bg-indigo-50/50"
              : "border-gray-200 hover:border-indigo-300"
          }`}
        >
          <input
            type="file"
            id="ai-excel-upload"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
          />
          <label
            htmlFor="ai-excel-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {file ? (
              <>
                <FileText size={48} className="text-indigo-500" />
                <span className="text-sm font-medium text-gray-700">
                  {file.name}
                </span>
                <span className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </>
            ) : (
              <>
                <div className="p-4 bg-gray-50 rounded-full text-gray-400 mb-2">
                  <Upload size={32} />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Click để chọn file hoặc kéo thả
                </span>
                <span className="text-xs text-gray-400">
                  Hỗ trợ .xlsx, .xls
                </span>
              </>
            )}
          </label>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Đang xử lý dữ liệu...
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              Cập nhật kiến thức AI
            </>
          )}
        </button>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex gap-2 text-amber-800">
            <AlertCircle size={18} className="shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-bold uppercase tracking-wider">Lưu ý:</p>
              <p>
                Hệ thống sẽ tự động đọc tất cả các ô trong file Excel của bạn.
              </p>
              <p>Môi hàng sẽ được coi là một mẩu thông tin kiến thức.</p>
              <p>
                Dữ liệu cũ trên Pinecone sẽ không bị xóa, kiến thức mới sẽ được
                bổ sung vào.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiKnowledgeUpload;
