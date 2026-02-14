import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Minimize2,
  Maximize2,
  RotateCcw,
  Download,
  Expand,
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as XLSX from "xlsx";
import { useChatLogic } from "@/hooks/useChatLogic";

const ChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("chatExpanded");
    return saved === "true";
  });
  const [isMobile, setIsMobile] = useState(false);
  const chatContainerRef = useRef(null);

  // Use shared chat logic hook
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
    scrollToBottom,
  } = useChatLogic();

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

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem("chatExpanded", isExpanded.toString());
  }, [isExpanded]);

  // Handle visual viewport changes (keyboard open/close)
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const handleViewportResize = () => {
      if (window.visualViewport && chatContainerRef.current) {
        const vvHeight = window.visualViewport.height;
        const vvOffsetTop = window.visualViewport.offsetTop;

        chatContainerRef.current.style.height = `${vvHeight}px`;
        chatContainerRef.current.style.top = `${vvOffsetTop}px`;

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    handleViewportResize();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
      window.visualViewport.addEventListener("scroll", handleViewportResize);
    }

    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportResize,
        );
        window.visualViewport.removeEventListener(
          "scroll",
          handleViewportResize,
        );
      }
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
    };
  }, [isOpen, isMobile]);

  // Handle input focus to prevent zoom on iOS
  const handleInputFocus = () => {
    setTimeout(() => {
      scrollToBottom();
    }, 300);
  };

  return (
    <>
      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed z-50 ${isMobile && isOpen ? "inset-0" : "bottom-6 right-6"} flex flex-col ${isMobile && isOpen ? "" : "items-end"}`}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={chatContainerRef}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`
                flex flex-col bg-white/95 backdrop-blur-xl overflow-hidden
                ${
                  isMobile
                    ? "w-full h-full rounded-none fixed inset-0"
                    : isExpanded
                      ? "mb-4 w-[700px] h-[600px] border border-white/20 rounded-2xl shadow-2xl"
                      : "mb-4 w-80 sm:w-96 h-[500px] border border-white/20 rounded-2xl shadow-2xl"
                }
              `}
            >
              {/* Header */}
              <div className="flex-shrink-0 px-3 py-2.5 bg-gradient-primary text-white flex justify-between items-center safe-area-top">
                <div className="flex items-center gap-2">
                  <Bot size={20} className="text-white/80" />
                  <div>
                    <h3 className="font-semibold text-sm">ElanX AI</h3>
                    <p className="text-[10px] text-white/70 opacity-80">
                      Trực tuyến
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={handleNewChat}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Trò chuyện mới"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={() => navigate("/chat")}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Mở trang chat đầy đủ"
                  >
                    <Expand size={18} />
                  </button>
                  {!isMobile && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title={isExpanded ? "Thu nhỏ widget" : "Mở rộng widget"}
                    >
                      {isExpanded ? (
                        <Minimize2 size={18} />
                      ) : (
                        <Maximize2 size={18} />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                    title="Đóng chat"
                  >
                    <X
                      size={18}
                      className="text-white/80 group-hover:text-red-300"
                    />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 overscroll-contain">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl text-sm relative ${
                        msg.role === "user"
                          ? "bg-gradient-primary text-white rounded-tr-none p-3"
                          : hasTable(msg.content)
                            ? "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none p-3 pt-10"
                            : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none p-3"
                      }`}
                    >
                      {msg.role === "assistant" && hasTable(msg.content) && (
                        <button
                          onClick={() =>
                            downloadTableAsExcel(msg.content, index)
                          }
                          className="absolute top-1 right-1 p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-md flex items-center gap-1 text-xs font-medium z-10"
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
                              <div className="overflow-x-auto my-2">
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
                                className="border border-gray-300 bg-primary/10 px-2 py-1.5 text-left font-semibold text-gray-700"
                                {...props}
                              />
                            ),
                            td: ({ ...props }) => (
                              <td
                                className="border border-gray-300 px-2 py-1.5"
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
                                className="font-semibold text-primary"
                                {...props}
                              />
                            ),
                            code: ({ inline, ...props }) =>
                              inline ? (
                                <code
                                  className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono"
                                  {...props}
                                />
                              ) : (
                                <code
                                  className="block bg-gray-100 p-2 rounded my-2 text-xs font-mono"
                                  {...props}
                                />
                              ),
                          }}
                        >
                          {formatNumbersInText(msg.content)}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-tl-none p-3 text-sm flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="flex-shrink-0 p-4 bg-white border-t border-gray-100 flex gap-2 safe-area-bottom"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={handleInputFocus}
                  placeholder="Nhập câu hỏi..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                  style={{ fontSize: "16px" }} // Prevent iOS zoom
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-gradient-primary text-white rounded-xl hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  <Send size={20} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button - hide when chat is open */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 bg-gradient-primary"
          >
            <MessageCircle size={28} />
          </button>
        )}
      </div>
    </>
  );
};

export default ChatWidget;
