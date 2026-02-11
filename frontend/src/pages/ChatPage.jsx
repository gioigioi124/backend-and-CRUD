import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Send,
  Bot,
  RotateCcw,
  Download,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useChatLogic } from "@/hooks/useChatLogic";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as XLSX from "xlsx";

const ChatPage = () => {
  const navigate = useNavigate();
  const {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    inputRef,
    hasTable,
    formatNumbersInText,
    handleSend,
    handleNewChat,
  } = useChatLogic();

  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Convert markdown table to Excel and download
  const downloadTableAsExcel = (content, messageIndex) => {
    if (!content) return;

    const lines = content.split("\n");
    const tableLines = [];
    let inTable = false;

    for (const line of lines) {
      if (line.trim().startsWith("|")) {
        inTable = true;
        if (!line.includes("---")) {
          tableLines.push(line);
        }
      } else if (inTable) {
        break;
      }
    }

    if (tableLines.length === 0) return;

    const tableData = tableLines.map((line) => {
      return line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim());
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(tableData);

    const colWidths = [];
    tableData.forEach((row) => {
      row.forEach((cell, colIndex) => {
        const cellLength = cell.length;
        if (!colWidths[colIndex] || colWidths[colIndex] < cellLength) {
          colWidths[colIndex] = cellLength;
        }
      });
    });
    ws["!cols"] = colWidths.map((width) => ({ wch: Math.min(width + 2, 50) }));

    XLSX.utils.book_append_sheet(wb, ws, "Bảng dữ liệu");
    XLSX.writeFile(wb, `table_${messageIndex}_${new Date().getTime()}.xlsx`);
  };

  // Suggestion chips for welcome screen
  const suggestions = [
    "Giá bông hiện tại là bao nhiêu?",
    "Khách hàng nào có giới hạn nợ trên 300 triệu?",
    "Bảng giá vận chuyển bông?",
    "Khách hàng còn nợ ở Thái Nguyên?",
  ];

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const isWelcomeScreen =
    messages.length === 1 && messages[0].role === "assistant";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Quay lại trang chủ"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-800">Gemini AI</h1>
                <p className="text-xs text-gray-500">Trợ lý thông minh</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium text-sm"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Cuộc trò chuyện mới</span>
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-4xl mx-auto">
            {isWelcomeScreen ? (
              /* Welcome Screen */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl">
                  <Bot size={40} className="text-white" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Xin chào!
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    Tôi có thể giúp bạn về giá bông, công nợ, khách hàng, tính
                    giá vận chuyển và nhiều thông tin khác. Hãy thử một trong
                    những câu hỏi dưới đây:
                  </p>
                </div>

                {/* Suggestion Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl mt-8">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="group p-4 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-2 border-gray-200 hover:border-blue-400 rounded-2xl text-left transition-all shadow-sm hover:shadow-md"
                    >
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                        {suggestion}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Messages */
              <div className="space-y-6 pb-4">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl text-sm relative ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none p-4 shadow-lg"
                          : hasTable(msg.content)
                            ? "bg-white text-gray-800 shadow-md border border-gray-200 rounded-tl-none p-4 pt-12"
                            : "bg-white text-gray-800 shadow-md border border-gray-200 rounded-tl-none p-4"
                      }`}
                    >
                      {msg.role === "assistant" && hasTable(msg.content) && (
                        <button
                          onClick={() =>
                            downloadTableAsExcel(msg.content, index)
                          }
                          className="absolute top-2 right-2 p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-md flex items-center gap-1.5 text-xs font-medium z-10"
                          title="Tải bảng xuống Excel"
                        >
                          <Download size={14} />
                          <span>Excel</span>
                        </button>
                      )}
                      {msg.role === "user" ? (
                        msg.content
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({ ...props }) => (
                              <div className="overflow-x-auto my-3">
                                <table
                                  className="min-w-full border-collapse border border-gray-300 text-xs"
                                  {...props}
                                />
                              </div>
                            ),
                            thead: ({ ...props }) => (
                              <thead className="bg-gray-50" {...props} />
                            ),
                            th: ({ ...props }) => (
                              <th
                                className="border border-gray-300 bg-blue-50 px-3 py-2 text-left font-semibold text-gray-700"
                                {...props}
                              />
                            ),
                            td: ({ ...props }) => (
                              <td
                                className="border border-gray-300 px-3 py-2"
                                {...props}
                              />
                            ),
                            tr: ({ ...props }) => (
                              <tr className="hover:bg-gray-50" {...props} />
                            ),
                            p: ({ ...props }) => (
                              <p className="mb-2 last:mb-0" {...props} />
                            ),
                            strong: ({ ...props }) => (
                              <strong
                                className="font-semibold text-blue-700"
                                {...props}
                              />
                            ),
                            code: ({ inline, ...props }) =>
                              inline ? (
                                <code
                                  className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono"
                                  {...props}
                                />
                              ) : (
                                <code
                                  className="block bg-gray-100 p-3 rounded my-2 text-xs font-mono"
                                  {...props}
                                />
                              ),
                          }}
                        >
                          {formatNumbersInText(msg.content)}
                        </ReactMarkdown>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 shadow-md border border-gray-200 rounded-2xl rounded-tl-none p-4 text-sm flex gap-1.5">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 px-4 sm:px-6 py-4">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              className="flex-1 bg-white border-2 border-gray-200 focus:border-blue-500 rounded-2xl px-5 py-3.5 text-base focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
              style={{ fontSize: "16px" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2 font-medium"
            >
              <Send size={20} />
              {!isMobile && <span>Gửi</span>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
