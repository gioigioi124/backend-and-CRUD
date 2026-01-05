import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PRODUCT_SHORTCUTS } from "@/config/productShortcuts";

const ShortcutManagerDialog = ({ open, onOpenChange }) => {
  const [shortcuts, setShortcuts] = useState([]);

  // Load shortcuts from config on mount
  useEffect(() => {
    if (open) {
      const shortcutArray = Object.entries(PRODUCT_SHORTCUTS).map(
        ([key, value]) => ({
          id: key,
          key: key,
          productName: value.productName,
          warehouse: value.warehouse,
          unit: value.unit,
          size: value.size || "",
          usePattern: value.usePattern || false,
        })
      );
      setShortcuts(shortcutArray);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Danh sách phím tắt gõ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Shortcuts Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-[120px]">Mã tắt</TableHead>
                  <TableHead className="w-[300px]">Tên sản phẩm</TableHead>
                  <TableHead className="w-[100px]">Kho</TableHead>
                  <TableHead className="w-[120px]">Đơn vị</TableHead>
                  <TableHead className="w-[150px]">Kích thước</TableHead>
                  <TableHead className="w-[120px]">Pattern</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shortcuts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-500 py-8"
                    >
                      Chưa có phím tắt nào
                    </TableCell>
                  </TableRow>
                ) : (
                  shortcuts.map((shortcut) => (
                    <TableRow key={shortcut.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono font-semibold text-blue-600">
                        {shortcut.key}
                      </TableCell>
                      <TableCell>{shortcut.productName}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {shortcut.warehouse}
                        </span>
                      </TableCell>
                      <TableCell>{shortcut.unit}</TableCell>
                      <TableCell className="text-gray-600">
                        {shortcut.size || "-"}
                      </TableCell>
                      <TableCell>
                        {shortcut.usePattern ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Có
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            Không
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <h4 className="font-semibold text-blue-900 mb-2">📝 Hướng dẫn:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>
                <strong>Mã tắt:</strong> Chuỗi ngắn gọn để gõ nhanh (vd: gcc,
                vg, gcc+)
              </li>
              <li>
                <strong>Pattern:</strong> Phím tắt có hỗ trợ pattern matching
                (tự động parse kích thước và mã ghi chú)
              </li>
              <li>
                Để thêm/sửa/xóa phím tắt, vui lòng chỉnh sửa file{" "}
                <code className="bg-white px-1 py-0.5 rounded">
                  src/config/productShortcuts.js
                </code>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShortcutManagerDialog;
