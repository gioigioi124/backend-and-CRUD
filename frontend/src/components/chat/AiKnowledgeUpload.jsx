import React, { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Brain,
  Trash2,
  Calendar,
  Database,
} from "lucide-react";
import api from "../../services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const AiKnowledgeUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sources, setSources] = useState([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch source list
  const fetchSources = async () => {
    setIsLoadingSources(true);
    try {
      const response = await api.get("/api/chatbot/files");
      setSources(response.data);
    } catch (error) {
      console.error("Error fetching sources:", error);
    } finally {
      setIsLoadingSources(false);
    }
  };

  React.useEffect(() => {
    fetchSources();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls") ||
        selectedFile.name.endsWith(".xlsm")
      ) {
        setFile(selectedFile);
      } else {
        toast.error("Vui lòng chọn file Excel (.xlsx, .xls, .xlsm)");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/api/chatbot/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Đã cập nhật dữ liệu kiến thức AI thành công!");
      setFile(null);
      fetchSources(); // Refresh list
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi upload dữ liệu");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSource = async (filename) => {
    if (
      !window.confirm(`Bạn có chắc muốn xóa kiến thức từ file "${filename}"?`)
    )
      return;

    setIsDeleting(true);
    try {
      await api.post("/api/chatbot/delete-file", { filename });
      toast.success(`Đã xóa sạch kiến thức từ file ${filename}`);
      fetchSources(); // Refresh list
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Lỗi khi xóa dữ liệu");
    } finally {
      setIsDeleting(false);
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
            accept=".xlsx, .xls, .xlsm"
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
                  Hỗ trợ .xlsx, .xls, .xlsm
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
              <p className="font-bold uppercase tracking-wider text-amber-900">
                Mẹo:
              </p>
              <p>
                • Hệ thống sẽ tự động cấu trúc dữ liệu theo tên cột để AI dễ
                hiểu hơn.
              </p>
              <p>
                • Để cập nhật một file đã có, chỉ cần upload lại file cùng tên.
              </p>
              <p>• Bạn có thể upload nhiều file để AI có kiến thức tổng hợp.</p>
            </div>
          </div>
        </div>

        {/* Source List Section */}
        <div className="mt-4 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Database size={16} />
              Các file đã nạp ({sources.length})
            </h3>
          </div>

          {isLoadingSources ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-indigo-500" />
            </div>
          ) : sources.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {sources.map((src) => (
                <div
                  key={src._id}
                  className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500">
                      <FileText size={18} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-gray-700 truncate">
                        {src.originalName}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {format(new Date(src.createdAt), "HH:mm dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </span>
                        <span>•</span>
                        <span>{src.rowCount} dòng</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSource(src.filename)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Xóa kiến thức từ file này"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50/30 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-400">
                Chưa có dữ liệu nào được nạp
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiKnowledgeUpload;
