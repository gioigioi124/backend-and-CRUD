import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Minimize2,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import api from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("chatExpanded");
    return saved === "true";
  });
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Xin chào! Giá bông, công nợ, khách hàng... tôi sẽ giúp bạn?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Format numbers in text with commas, excluding phone numbers and customer codes
  const formatNumbersInText = (text) => {
    if (!text) return text;

    // Pattern to match standalone numbers (not part of phone/code patterns)
    // This will match numbers that are:
    // - At least 4 digits (to avoid formatting small numbers like years)
    // - Not preceded by common code prefixes or patterns
    // - Not in the middle of alphanumeric strings
    return text.replace(/(?<![\w-])(\d{4,})(?![\w-])/g, (match) => {
      // Skip if it starts with 0 (likely phone number, ID, or code)
      if (match.startsWith("0")) {
        return match;
      }

      // Skip if it looks like a phone number (10-11 digits)
      if (match.length >= 10 && match.length <= 11) {
        return match;
      }

      // Skip if it looks like a customer code pattern (contains specific prefixes)
      // Adjust this pattern based on your customer code format
      if (/^[A-Z]{2,}\d+$/i.test(match)) {
        return match;
      }

      // Format the number with commas
      return parseInt(match, 10).toLocaleString("en-US");
    });
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
        // Update the container to match visual viewport
        const vvHeight = window.visualViewport.height;
        const vvOffsetTop = window.visualViewport.offsetTop;

        chatContainerRef.current.style.height = `${vvHeight}px`;
        chatContainerRef.current.style.top = `${vvOffsetTop}px`;

        // Scroll messages to bottom when keyboard opens
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    // Initial set
    handleViewportResize();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
      window.visualViewport.addEventListener("scroll", handleViewportResize);
    }

    // Prevent body scroll when chat is open on mobile
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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Keep focus on input after sending
    inputRef.current?.focus();

    try {
      const response = await api.post("/api/chatbot/message", {
        message: input,
        history: messages,
      });

      const assistantMessage = {
        role: "assistant",
        content: response.data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      let errorMessage = "Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại sau.";

      // Check if it's a rate limit error
      if (error.response?.status === 429 || error.response?.data?.isRateLimit) {
        errorMessage =
          "⏱️ Đã vượt quá giới hạn request của Gemini API. Vui lòng đợi 10-15 giây rồi thử lại.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (
      window.confirm("Bạn có chắc chắn muốn bắt đầu cuộc trò chuyện mới không?")
    ) {
      setMessages([
        {
          role: "assistant",
          content:
            "Xin chào! Giá bông, công nợ, khách hàng... tôi sẽ giúp bạn?",
        },
      ]);
      setInput("");
    }
  };

  // Handle input focus to prevent zoom on iOS
  const handleInputFocus = () => {
    // Scroll to bottom when input is focused
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
              <div className="flex-shrink-0 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center safe-area-top">
                <div className="flex items-center gap-2">
                  <Bot size={24} className="text-blue-100" />
                  <div>
                    <h3 className="font-semibold text-sm">Gemini AI</h3>
                    <p className="text-[10px] text-blue-100 opacity-80">
                      Trực tuyến
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleNewChat}
                    className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-white/20 rounded-lg transition-colors text-[11px] font-medium"
                    title="Trò chuyện mới"
                  >
                    <RotateCcw size={16} />
                    <span>Tạo mới</span>
                  </button>
                  {!isMobile && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-white/20 rounded-lg transition-colors text-[11px] font-medium"
                      title={isExpanded ? "Thu nhỏ" : "Mở rộng"}
                    >
                      {isExpanded ? (
                        <Minimize2 size={16} />
                      ) : (
                        <Maximize2 size={16} />
                      )}
                      <span>{isExpanded ? "Thu nhỏ" : "Mở rộng"}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-red-500/20 rounded-full transition-colors group"
                    title="Thu nhỏ"
                  >
                    {isMobile ? (
                      <X
                        size={22}
                        className="text-red-200 group-hover:text-red-400"
                      />
                    ) : (
                      <Minimize2
                        size={18}
                        className="text-red-200 group-hover:text-red-400"
                      />
                    )}
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
                      className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none"
                      }`}
                    >
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
                                className="border border-gray-300 bg-blue-50 px-2 py-1.5 text-left font-semibold text-gray-700"
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
                                className="font-semibold text-blue-700"
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
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
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
                  className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  style={{ fontSize: "16px" }} // Prevent iOS zoom
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-200"
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
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 bg-gradient-to-tr from-blue-600 to-indigo-600"
          >
            <MessageCircle size={28} />
          </button>
        )}
      </div>
    </>
  );
};

export default ChatWidget;
