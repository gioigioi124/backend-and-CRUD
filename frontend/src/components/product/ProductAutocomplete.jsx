import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { filterProductSuggestions } from "./productSuggest";
import { parseProductKey } from "./productParser";

/**
 * ProductAutocomplete - Dropdown autocomplete cho product name
 *
 * Features:
 * - Gõ → hiện gợi ý
 * - Click chuột → chọn được
 * - Enter → chọn được
 * - Không bị blur khi click vào dropdown
 * - Hiển thị label đầy đủ (gấp 3 Alias 5F)
 * - Logic parse dùng key (g3a05)
 */
const ProductAutocomplete = ({ value, onSelect, placeholder }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter suggestions based on input
  const suggestions = filterProductSuggestions(inputValue);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle suggestion selection
  const handleSelect = (suggestion) => {
    // Parse the key to get full product info
    const parsed = parseProductKey(suggestion.key);

    if (parsed) {
      // Update input to show the full label
      setInputValue(parsed.productName);

      // Pass all parsed data to parent
      if (onSelect) {
        onSelect({
          productName: parsed.productName,
          size: parsed.size || "",
          unit: parsed.unit || "Cái",
          warehouse: parsed.warehouse || "",
          cmQty: parsed.cmQty || 0,
          cmQtyPerUnit: parsed.cmQtyPerUnit || 0, // Số cm cho 1 đơn vị
          note: parsed.note || "",
        });
      }
    }

    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen && suggestions.length > 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        return;
      }
    }

    if (isOpen) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;

        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            handleSelect(suggestions[highlightedIndex]);
          } else if (suggestions.length > 0) {
            // If no item is highlighted, select the first one
            handleSelect(suggestions[0]);
          }
          break;

        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;

        default:
          break;
      }
    }
  };

  // Handle input focus
  const handleFocus = () => {
    // Chỉ mở dropdown khi có text được gõ
    if (inputValue.trim() && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle input blur - but prevent blur when clicking dropdown
  const handleBlur = (e) => {
    // Check if the click is inside the dropdown
    if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget)) {
      return; // Don't close dropdown
    }

    // Close dropdown after a small delay to allow click events to fire
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  // Handle mouse down on dropdown to prevent blur
  const handleDropdownMouseDown = (e) => {
    e.preventDefault(); // Prevent input blur
  };

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || "Nhập tên hàng hóa"}
        className="w-full"
      />

      {/* Dropdown suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          onMouseDown={handleDropdownMouseDown}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.key}
              onClick={() => handleSelect(suggestion)}
              className={`px-3 py-2 cursor-pointer transition-colors ${
                index === highlightedIndex
                  ? "bg-blue-50 text-blue-900"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{suggestion.label}</span>
                <span className="text-xs text-gray-500 font-mono">
                  {suggestion.key}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductAutocomplete;
