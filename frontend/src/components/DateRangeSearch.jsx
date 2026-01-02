import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { toast } from "sonner";

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
    <div className="flex items-end gap-2">
      <div className="space-y-1">
        <Label htmlFor="fromDate" className="text-xs">
          Từ ngày
        </Label>
        <Input
          id="fromDate"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-36 bg-gray-50"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="toDate" className="text-xs">
          Đến ngày
        </Label>
        <Input
          id="toDate"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-36 bg-gray-50"
        />
      </div>
      <Button onClick={handleSearch} size="sm">
        <Search className="w-4 h-4 mr-1" />
        Tìm kiếm
      </Button>
    </div>
  );
};

export default DateRangeSearch;
