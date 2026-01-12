import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * AutoResizeTextarea - Textarea tự động điều chỉnh chiều cao theo nội dung
 *
 * Props:
 * - value: giá trị của textarea
 * - onChange: callback khi giá trị thay đổi
 * - minHeight: chiều cao tối thiểu (px), mặc định 40
 * - maxHeight: chiều cao tối đa (px), mặc định 120
 * - className: các class CSS bổ sung
 * - ...props: các props khác của textarea
 */
const AutoResizeTextarea = ({
  value,
  onChange,
  minHeight = 40,
  maxHeight = 120,
  className,
  ...props
}) => {
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";
      // Set height based on scrollHeight, with min and max constraints
      const newHeight = Math.min(
        Math.max(textareaRef.current.scrollHeight, minHeight),
        maxHeight
      );
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value, minHeight, maxHeight]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={cn("resize-none overflow-hidden", className)}
      style={{
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`,
      }}
      rows={1}
      {...props}
    />
  );
};

export default AutoResizeTextarea;
