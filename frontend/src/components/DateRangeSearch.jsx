import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

const DateRangeSearch = ({ onSearch, defaultToToday = false }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Lấy ngày hôm nay ở định dạng YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Set default dates khi component mount
  useEffect(() => {
    if (defaultToToday) {
      const today = getTodayDate();
      setFromDate(today);
      setToDate(today);
      // Tự động trigger search với ngày hôm nay
      onSearch?.(today, today);
    }
  }, [defaultToToday]);

  const handleSearch = () => {
    // Validation: fromDate phải <= toDate
    if (fromDate && toDate && fromDate > toDate) {
      setToDate(fromDate);
      onSearch?.(fromDate, fromDate);
      return;
    }
    onSearch?.(fromDate, toDate);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-1.5 md:gap-2 w-full sm:w-auto">
      <div className="space-y-1 flex-1 sm:flex-initial">
        <Label htmlFor="fromDate" className="text-[10px] md:text-xs">
          Từ ngày
        </Label>
        <Input
          id="fromDate"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full sm:w-32 md:w-36 bg-gray-50 h-8 md:h-9 text-xs md:text-sm"
        />
      </div>
      <div className="space-y-1 flex-1 sm:flex-initial">
        <Label htmlFor="toDate" className="text-[10px] md:text-xs">
          Đến ngày
        </Label>
        <Input
          id="toDate"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full sm:w-32 md:w-36 bg-gray-50 h-8 md:h-9 text-xs md:text-sm"
        />
      </div>
      <Button
        onClick={handleSearch}
        size="sm"
        variant="gradient"
        className="h-8 md:h-9 px-2 md:px-3"
      >
        <Search className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span className="hidden sm:inline ml-1 text-xs md:text-sm">Tìm</span>
      </Button>
    </div>
  );
};

export default DateRangeSearch;
