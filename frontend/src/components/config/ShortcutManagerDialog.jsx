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
import { PRODUCT_SUGGESTIONS } from "@/components/product/productSuggest";

const ShortcutManagerDialog = ({ open, onOpenChange }) => {
  const [shortcuts, setShortcuts] = useState([]);

  // Load shortcuts from config on mount
  useEffect(() => {
    if (open) {
      const shortcutArray = PRODUCT_SUGGESTIONS.map((item) => ({
        id: item.key,
        key: item.key,
        label: item.label,
      }));
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
                  <TableHead className="w-[150px]">Mã tắt</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shortcuts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
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
                      <TableCell>{shortcut.label}</TableCell>
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
                <strong>Mã tắt:</strong> Chuỗi ngắn gọn để gõ nhanh (vd: g3a05,
                g3b07, g2r09)
              </li>
              <li>
                Để thêm/sửa/xóa phím tắt, vui lòng chỉnh sửa file{" "}
                <code className="bg-white px-1 py-0.5 rounded">
                  src/components/product/productSuggest.js
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
