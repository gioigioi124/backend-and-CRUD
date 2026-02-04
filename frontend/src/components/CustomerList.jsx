import { useState, useEffect, useRef } from "react";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Edit,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import customerService from "../services/customerService";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useAuth } from "../context/AuthContext";

const CustomerList = ({ refreshTrigger, searchQuery, onSearchChange }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const { user } = useAuth();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const PAGE_LIMIT = 50; // Fixed page limit

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // If search query exists, use search API (no pagination)
      if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
        const data = await customerService.searchCustomers(
          debouncedSearchQuery.trim(),
        );
        setCustomers(data);
        // Don't overwrite limit - use temp pagination for search display
        setPagination((prev) => ({
          ...prev,
          page: 1,
          total: data.length,
          totalPages: 1,
        }));
      } else {
        // Otherwise use paginated getAllCustomers with fixed limit
        const data = await customerService.getAllCustomers(
          pagination.page,
          PAGE_LIMIT,
        );
        setCustomers(data.customers);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Fetch customers error:", error);
      toast.error("Lỗi khi tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers when dependencies change
  const prevSearchQuery = useRef(debouncedSearchQuery);

  useEffect(() => {
    // Check if search query has changed
    const searchQueryChanged = prevSearchQuery.current !== debouncedSearchQuery;

    // If search query changed and we're not on page 1, reset to page 1 first
    if (searchQueryChanged && pagination.page !== 1) {
      prevSearchQuery.current = debouncedSearchQuery;
      setPagination((prev) => ({ ...prev, page: 1 }));
      return; // Don't fetch yet, wait for page to update
    }

    // Update the ref
    prevSearchQuery.current = debouncedSearchQuery;

    // Fetch data
    fetchCustomers();
  }, [pagination.page, refreshTrigger, debouncedSearchQuery]);

  const handleDelete = async () => {
    if (!customerToDelete) return;

    try {
      await customerService.deleteCustomer(customerToDelete._id);
      toast.success("Xóa khách hàng thành công");
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Lỗi khi xóa khách hàng");
    }
  };

  const openDeleteDialog = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

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
      fetchCustomers();
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
      fetchCustomers();
    } catch (error) {
      console.error("Toggle bypass error:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật bỏ qua công nợ",
      );
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <>
      <Card>
        <CardHeader className="p-6">
          <CardTitle>Danh Sách Khách Hàng</CardTitle>
          <CardDescription>
            {searchQuery && searchQuery.trim() ? (
              <>
                {searchQuery !== debouncedSearchQuery ? (
                  <span className="text-blue-600">
                    Đang tìm kiếm "{searchQuery}"...
                  </span>
                ) : (
                  <>
                    Tìm thấy:{" "}
                    <span className="font-semibold">{customers.length}</span>{" "}
                    kết quả
                    {customers.length > 0 && ` cho "${searchQuery}"`}
                  </>
                )}
              </>
            ) : (
              `Tổng số: ${pagination.total} khách hàng`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {/* Search Bar */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã, tên, địa chỉ, số điện thoại..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange("")}
              >
                Xóa
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải...
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có khách hàng nào. Vui lòng upload file Excel.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Mã KH</TableHead>
                      <TableHead>Tên Khách Hàng</TableHead>
                      <TableHead>Địa Chỉ</TableHead>
                      <TableHead className="w-[130px]">Số Điện Thoại</TableHead>
                      <TableHead className="w-[120px] text-right">
                        Giới hạn nợ
                      </TableHead>
                      <TableHead className="w-[120px] text-right">
                        Công nợ
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        Bỏ qua CN
                      </TableHead>
                      {isAdmin && (
                        <>
                          <TableHead className="w-[80px]">Sửa</TableHead>
                          <TableHead className="w-[80px]">Xóa</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => {
                      const isOverLimit =
                        customer.currentDebt > customer.debtLimit;
                      const isEditing = editingCustomerId === customer._id;

                      return (
                        <TableRow key={customer._id}>
                          <TableCell className="font-medium">
                            {customer.customerCode}
                          </TableCell>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.address || "-"}</TableCell>
                          <TableCell>{customer.phone || "-"}</TableCell>

                          {/* Giới hạn nợ - editable */}
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
                                className="w-full text-right"
                              />
                            ) : (
                              <span>
                                {customer.debtLimit?.toLocaleString("vi-VN")} đ
                              </span>
                            )}
                          </TableCell>

                          {/* Công nợ - editable */}
                          <TableCell
                            className={`text-right font-medium ${
                              isOverLimit ? "text-red-600" : ""
                            }`}
                          >
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
                                className="w-full text-right"
                              />
                            ) : (
                              <span>
                                {customer.currentDebt?.toLocaleString("vi-VN")}{" "}
                                đ
                              </span>
                            )}
                          </TableCell>

                          {/* Bỏ qua công nợ - checkbox */}
                          <TableCell className="text-center">
                            {isAdmin ? (
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={customer.bypassDebtCheck || false}
                                  onCheckedChange={() =>
                                    handleToggleBypass(
                                      customer._id,
                                      customer.bypassDebtCheck,
                                    )
                                  }
                                  disabled={isEditing}
                                />
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                {customer.bypassDebtCheck ? "✓" : "-"}
                              </span>
                            )}
                          </TableCell>

                          {isAdmin && (
                            <>
                              <TableCell>
                                {isEditing ? (
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleSaveEdit(customer._id)
                                      }
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleCancelEdit}
                                      className="text-gray-600 hover:text-gray-700"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStartEdit(customer)}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteDialog(customer)}
                                  className="text-destructive hover:text-destructive"
                                  disabled={isEditing}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination - hide when searching */}
              {!searchQuery && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Trang {pagination.page} / {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng{" "}
              <span className="font-semibold">{customerToDelete?.name}</span>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CustomerList;
