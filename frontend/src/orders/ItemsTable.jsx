import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProductAutocomplete from "@/components/product/ProductAutocomplete";

const WAREHOUSES = ["K01", "K02", "K03", "K04"];

const ItemsTable = ({ items, setItems }) => {
  // Thêm dòng mới
  const addItem = () => {
    const newItem = {
      stt: items.length + 1,
      productName: "",
      size: "",
      unit: "Cái",
      quantity: 0,
      warehouse: "",
      cmQty: 0,
      note: "",
    };
    setItems([...items, newItem]);
  };

  // Xóa dòng
  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    // Cập nhật lại STT
    const updatedItems = newItems.map((item, i) => ({
      ...item,
      stt: i + 1,
    }));
    setItems(updatedItems);
  };

  // Cập nhật 1 field của 1 item
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Nếu đang cập nhật quantity và item có cmQtyPerUnit, tự động tính lại cmQty
    if (field === "quantity" && newItems[index].cmQtyPerUnit) {
      newItems[index].cmQty = value * newItems[index].cmQtyPerUnit;
    }

    setItems(newItems);
  };

  // Handler khi chọn sản phẩm từ dropdown
  const handleProductSelect = (index, productData) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productName: productData.productName,
      size: productData.size || newItems[index].size,
      unit: productData.unit || newItems[index].unit,
      warehouse: productData.warehouse || newItems[index].warehouse,
      cmQty: productData.cmQty || newItems[index].cmQty,
      note: productData.note || newItems[index].note,
    };
    setItems(newItems);
  };

  return (
    <div className="space-y-4">
      {/* Tiêu đề và nút thêm hàng hóa */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Danh sách hàng hóa</h3>
        <Button type="button" onClick={addItem} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Thêm dòng
        </Button>
      </div>
      {/* Phần Table */}
      <div className="border rounded-lg">
        <Table>
          {/* Table head */}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">STT</TableHead>
              <TableHead className="min-w-[200px]">Tên hàng hóa</TableHead>
              <TableHead className="w-[120px]">Kích thước</TableHead>
              <TableHead className="w-[100px]">ĐVT</TableHead>
              <TableHead className="w-[100px]">Số lượng</TableHead>
              <TableHead className="w-[100px]">Kho</TableHead>
              <TableHead className="w-[100px]">Số cm</TableHead>
              <TableHead className="min-w-[150px]">Ghi chú</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          {/* Table body */}
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-gray-500 py-8"
                >
                  Chưa có hàng hóa. Click "Thêm dòng" để bắt đầu.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={index}>
                  {/* STT */}
                  <TableCell className="text-center font-medium">
                    {item.stt}
                  </TableCell>

                  {/* Tên hàng hóa */}
                  <TableCell>
                    <ProductAutocomplete
                      value={item.productName}
                      onSelect={(productData) =>
                        handleProductSelect(index, productData)
                      }
                      placeholder="Nhập tên hàng hóa"
                    />
                  </TableCell>

                  {/* Kích thước */}
                  <TableCell>
                    <Input
                      value={item.size}
                      onChange={(e) =>
                        updateItem(index, "size", e.target.value)
                      }
                      placeholder="169x236"
                    />
                  </TableCell>

                  {/* ĐVT */}
                  <TableCell>
                    <Input
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(index, "unit", e.target.value)
                      }
                      placeholder="Cái"
                    />
                  </TableCell>

                  {/* Số lượng */}
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                      min="0"
                    />
                  </TableCell>

                  {/* Kho */}
                  <TableCell>
                    <Select
                      value={item.warehouse}
                      disabled={!!item.warehouseConfirm?.value}
                      onValueChange={(value) =>
                        updateItem(index, "warehouse", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WAREHOUSES.map((wh) => (
                          <SelectItem key={wh} value={wh}>
                            {wh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Số cm */}
                  <TableCell>
                    <Input
                      type="number"
                      value={item.cmQty}
                      onChange={(e) =>
                        updateItem(index, "cmQty", Number(e.target.value))
                      }
                      min="0"
                    />
                  </TableCell>

                  {/* Ghi chú */}
                  <TableCell>
                    <Input
                      value={item.note}
                      onChange={(e) =>
                        updateItem(index, "note", e.target.value)
                      }
                      placeholder="Ghi chú"
                    />
                  </TableCell>

                  {/* Nút xóa */}
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={!!item.warehouseConfirm?.value}
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Phần chân trang */}
      {items.length > 0 && (
        <div className="text-sm text-gray-600">
          Tổng: <span className="font-semibold">{items.length}</span> hàng hóa •{" "}
          <span className="font-semibold">
            {items.reduce((sum, item) => sum + item.quantity, 0)}
          </span>{" "}
          sản phẩm •{" "}
          <span className="font-semibold">
            {items.reduce((sum, item) => sum + item.cmQty, 0)}
          </span>{" "}
          cm
        </div>
      )}
    </div>
  );
};

export default ItemsTable;
