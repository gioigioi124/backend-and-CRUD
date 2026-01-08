import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import customerService from "@/services/customerService";
import { cn } from "@/lib/utils";

/**
 * CustomerAutocomplete Component
 *
 * Provides an autocomplete input for customer selection with dropdown.
 * Searches across customerCode, name, and address fields.
 * User must select a customer from the dropdown.
 *
 * @param {Object} props
 * @param {Object} props.value - Selected customer object { name, customerCode, address }
 * @param {Function} props.onChange - Callback when customer is selected
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.placeholder - Placeholder text
 */
const CustomerAutocomplete = ({
  value,
  onChange,
  required = false,
  placeholder = "Nhập mã KH, tên KH hoặc địa chỉ để tìm kiếm...",
  autoFocus = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-focus input when component mounts (if autoFocus is true)
  useEffect(() => {
    if (autoFocus && inputRef.current && !value?.name) {
      inputRef.current.focus();
    }
  }, [autoFocus, value?.name]);

  // Search customers when query changes
  useEffect(() => {
    const searchCustomers = async () => {
      if (searchQuery.trim().length < 1) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const results = await customerService.searchCustomers(searchQuery);
        setSuggestions(results);
        setIsOpen(true);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCustomers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle customer selection
  const handleSelectCustomer = (customer) => {
    onChange({
      name: customer.name,
      customerCode: customer.customerCode,
      address: customer.address || "",
      phone: customer.phone || "",
    });
    setSearchQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  // Handle clear selection
  const handleClear = () => {
    onChange({ name: "", customerCode: "", address: "", phone: "" });
    setSearchQuery("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectCustomer(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!text || !query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <Label htmlFor="customer-autocomplete">
        Khách hàng {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Selected Customer Display */}
      {value?.name ? (
        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
          <div className="flex-1">
            <div className="font-semibold">{value.name}</div>
            <div className="text-sm text-muted-foreground">
              {value.customerCode && (
                <span className="mr-3">Mã: {value.customerCode}</span>
              )}
              {value.address && <span>{value.address}</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-muted rounded-sm transition-colors"
            aria-label="Xóa khách hàng đã chọn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Search Input */
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              id="customer-autocomplete"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setIsOpen(true);
              }}
              placeholder={placeholder}
              className="pl-9"
              autoComplete="off"
            />
          </div>

          {/* Dropdown Suggestions */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Đang tìm kiếm...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Không tìm thấy khách hàng
                </div>
              ) : (
                <ul className="py-1">
                  {suggestions.map((customer, index) => (
                    <li
                      key={customer._id}
                      onClick={() => handleSelectCustomer(customer)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        "px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0",
                        highlightedIndex === index
                          ? "bg-accent"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <div className="font-medium">
                        {highlightMatch(customer.name, searchQuery)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="mr-3">
                          Mã:{" "}
                          {highlightMatch(customer.customerCode, searchQuery)}
                        </span>
                        {customer.address && (
                          <span>
                            {highlightMatch(customer.address, searchQuery)}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        {value?.name
          ? "Nhấn nút X để chọn khách hàng khác"
          : "Ví dụ: gõ 'Phương 273' "}
      </p>
    </div>
  );
};

export default CustomerAutocomplete;
