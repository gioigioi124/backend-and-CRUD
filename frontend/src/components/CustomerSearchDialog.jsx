import { useState, useEffect } from "react";
import { Search, Edit, Check, X } from "lucide-react";
import { toast } from "sonner";
import customerService from "../services/customerService";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useAuth } from "@/context/AuthContext";

const CustomerSearchDialog = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const isAdminOrLeader = user?.role === "admin" || user?.role === "leader";
  const isStaffOrWarehouse =
    user?.role === "staff" || user?.role === "warehouse";

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch customers when search query changes
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!debouncedSearchQuery.trim()) {
        setCustomers([]);
        return;
      }

      setLoading(true);
      try {
        const data = await customerService.searchCustomers(
          debouncedSearchQuery.trim(),
        );
        setCustomers(data);
      } catch (error) {
        console.error("Search customers error:", error);
        toast.error("Lỗi khi tìm kiếm khách hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [debouncedSearchQuery]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setCustomers([]);
      setEditingCustomerId(null);
      setEditValues({});
    }
  }, [open]);

  const handleStartEdit = (customer) => {
    setEditingCustomerId(customer._id);
    setEditValues({
      debtLimit: customer.debtLimit || 0,
      currentDebt: customer.currentDebt || 0,
    });
  };

  const handleCancelEdit = () => {
    setEditingCustomerId(null);
    setEditValues({});
  };

  const handleSaveEdit = async (customerId) => {
    try {
      await customerService.updateCustomerDebt(customerId, editValues);
      toast.success("Cập nhật công nợ thành công");
      setEditingCustomerId(null);
      setEditValues({});

      // Refresh search results
      if (debouncedSearchQuery.trim()) {
        const data = await customerService.searchCustomers(
          debouncedSearchQuery.trim(),
        );
        setCustomers(data);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật công nợ");
    }
  };

  const handleToggleBypass = async (customerId, currentValue) => {
    try {
      await customerService.updateCustomerDebt(customerId, {
        bypassDebtCheck: !currentValue,
      });
      toast.success(
        !currentValue ? "Đã bật bỏ qua công nợ" : "Đã tắt bỏ qua công nợ",
      );

      // Refresh search results
      if (debouncedSearchQuery.trim()) {
        const data = await customerService.searchCustomers(
          debouncedSearchQuery.trim(),
        );
        setCustomers(data);
      }
    } catch (error) {
      console.error("Toggle bypass error:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật bỏ qua công nợ",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[95vw] lg:max-w-7xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Search className="w-6 h-6 text-primary" />
                Tìm kiếm khách hàng nhanh
              </DialogTitle>
              <DialogDescription className="text-base">
                Sử dụng phím tắt{" "}
                <kbd className="px-2 py-0.5 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm mx-1">
                  Ctrl+K
                </kbd>{" "}
                để truy cập nhanh từ bất kỳ đâu.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-background">
          {/* Search Bar Container */}
          <div className="p-6 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="relative max-w-3xl mx-auto group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Tìm kiếm theo mã, tên, địa chỉ, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg shadow-sm border-gray-200 focus:border-primary focus:ring-primary rounded-xl transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-auto p-6 pt-2 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground animate-pulse">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-lg font-medium">
                  Đang tìm kiếm dữ liệu...
                </span>
              </div>
            ) : !searchQuery.trim() ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 opacity-20" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">Sẵn sàng để tìm kiếm</p>
                  <p className="text-sm">
                    Nhập thông tin khách hàng ở ô tìm kiếm phía trên
                  </p>
                </div>
              </div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-red-300" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-red-900/60">
                    Không tìm thấy kết quả
                  </p>
                  <p className="text-sm">
                    Vui lòng kiểm tra lại từ khóa hoặc thử tìm kiếm khác
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Tìm thấy{" "}
                    <span className="text-primary font-bold">
                      {customers.length}
                    </span>{" "}
                    kết quả phù hợp
                  </span>
                </div>

                <div className="border rounded-xl shadow-sm overflow-hidden bg-card">
                  <div className="overflow-x-auto min-w-full">
                    <Table>
                      <TableHeader className="bg-muted/50 sticky top-0 z-20 shadow-sm">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[120px] font-bold">
                            Mã KH
                          </TableHead>
                          <TableHead className="min-w-[200px] font-bold">
                            Tên Khách Hàng
                          </TableHead>
                          <TableHead className="min-w-[250px] font-bold">
                            Địa Chỉ
                          </TableHead>
                          <TableHead className="w-[140px] font-bold">
                            Số Điện Thoại
                          </TableHead>
                          <TableHead className="w-[150px] text-right font-bold">
                            Giới hạn nợ
                          </TableHead>
                          <TableHead className="w-[150px] text-right font-bold">
                            Công nợ
                          </TableHead>
                          <TableHead className="w-[100px] text-center font-bold">
                            Bỏ qua CN
                          </TableHead>
                          <TableHead className="w-[100px] text-center font-bold">
                            Thao tác
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers.map((customer) => {
                          const isOverLimit =
                            customer.currentDebt > customer.debtLimit;
                          const isEditing = editingCustomerId === customer._id;

                          return (
                            <TableRow
                              key={customer._id}
                              className="hover:bg-muted/30 transition-colors group"
                            >
                              <TableCell className="font-semibold text-primary">
                                {customer.customerCode}
                              </TableCell>
                              <TableCell className="font-medium">
                                {customer.name}
                              </TableCell>
                              <TableCell
                                className="text-muted-foreground text-sm max-w-[300px] truncate"
                                title={customer.address}
                              >
                                {customer.address || "-"}
                              </TableCell>
                              <TableCell>{customer.phone || "-"}</TableCell>

                              {/* Giới hạn nợ */}
                              <TableCell className="text-right">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={editValues.debtLimit}
                                    onChange={(e) =>
                                      setEditValues({
                                        ...editValues,
                                        debtLimit: Number(e.target.value),
                                      })
                                    }
                                    className="w-full text-right h-9 focus:ring-primary shadow-sm"
                                  />
                                ) : (
                                  <span className="font-medium whitespace-nowrap">
                                    {customer.debtLimit?.toLocaleString(
                                      "vi-VN",
                                    )}{" "}
                                    đ
                                  </span>
                                )}
                              </TableCell>

                              {/* Công nợ */}
                              <TableCell className="text-right">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={editValues.currentDebt}
                                    onChange={(e) =>
                                      setEditValues({
                                        ...editValues,
                                        currentDebt: Number(e.target.value),
                                      })
                                    }
                                    className="w-full text-right h-9 focus:ring-primary shadow-sm"
                                  />
                                ) : (
                                  <span
                                    className={`font-bold whitespace-nowrap ${isOverLimit ? "text-red-600 bg-red-50 px-2 py-1 rounded" : "text-green-600 bg-green-50 px-2 py-1 rounded"}`}
                                  >
                                    {isStaffOrWarehouse ? (
                                      isOverLimit ? (
                                        "Quá hạn nợ"
                                      ) : (
                                        "Trong hạn"
                                      )
                                    ) : (
                                      <>
                                        {customer.currentDebt?.toLocaleString(
                                          "vi-VN",
                                        )}{" "}
                                        đ
                                      </>
                                    )}
                                  </span>
                                )}
                              </TableCell>

                              {/* Bỏ qua công nợ */}
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={customer.bypassDebtCheck || false}
                                    onCheckedChange={() =>
                                      handleToggleBypass(
                                        customer._id,
                                        customer.bypassDebtCheck,
                                      )
                                    }
                                    disabled={!isAdminOrLeader || isEditing}
                                    className="data-[state=checked]:bg-primary h-5 w-5 border-2"
                                  />
                                </div>
                              </TableCell>

                              <TableCell>
                                {isEditing ? (
                                  <div className="flex gap-2 justify-center">
                                    <Button
                                      variant="default"
                                      size="icon"
                                      onClick={() =>
                                        handleSaveEdit(customer._id)
                                      }
                                      className="h-8 w-8 bg-green-600 hover:bg-green-700 shadow-sm"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={handleCancelEdit}
                                      className="h-8 w-8 text-gray-600 hover:bg-gray-100 shadow-sm"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isAdminOrLeader ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleStartEdit(customer)
                                        }
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium gap-1"
                                      >
                                        <Edit className="h-4 w-4" />
                                        Sửa
                                      </Button>
                                    ) : (
                                      !isStaffOrWarehouse && (
                                        <span className="text-xs text-muted-foreground italic">
                                          Chỉ xem
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Area - for extra context if needed */}
        <div className="p-4 bg-muted/20 border-t flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Trong hạn
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Vượt hạn nợ
            </div>
          </div>
          <p>Dữ liệu được cập nhật theo thời gian thực</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerSearchDialog;
