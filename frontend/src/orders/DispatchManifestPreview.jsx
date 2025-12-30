import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DispatchManifestPreview = ({ open, onOpenChange, vehicle, items }) => {
  const handlePrint = () => {
    const printContent = document.getElementById("manifest-print-area");
    if (!printContent) return;

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Bảng kê điều vận - ${vehicle?.licensePlate || ""}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { font-family: lexend, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .info { display: flex; justify-between: space-between; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .footer { margin-top: 40px; display: flex; justify-content: space-around; }
          .footer-item { text-align: center; width: 200px; }
          .signature-space { height: 80px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
    `);
    printWindow.document.close();
    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const today = new Date().toLocaleDateString("vi-VN");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bảng kê điều vận hàng hóa</DialogTitle>
        </DialogHeader>

        <div id="manifest-print-area" className="p-4 bg-white text-black">
          <div className="text-center mb-6 border-b-2 border-gray-800 pb-2">
            <h1 className="text-2xl font-bold uppercase">
              Bảng kê điều vận hàng hóa
            </h1>
            <p className="text-sm">Ngày in: {today}</p>
          </div>

          <div className="flex justify-between mb-6">
            <div>
              <p>
                <strong>Xe vận tải:</strong> {vehicle?.licensePlate || "N/A"}
              </p>
              <p>
                <strong>Trọng tải/Loại xe:</strong> {vehicle?.weight || "-"}
              </p>
            </div>
            <div className="text-right">
              <p>
                <strong>Số lượng đơn:</strong>{" "}
                {new Set(items.map((i) => i.orderId)).size}
              </p>
              <p>
                <strong>Tổng số mặt hàng:</strong> {items.length}
              </p>
            </div>
          </div>

          <Table className="border-collapse border border-black w-full">
            <TableHeader>
              <TableRow className="bg-gray-100 italic">
                <TableHead className="border border-black w-12 text-center">
                  STT
                </TableHead>
                <TableHead className="border border-black">
                  Khách hàng
                </TableHead>
                <TableHead className="border border-black">
                  Tên hàng hóa
                </TableHead>
                <TableHead className="border border-black w-24 text-center">
                  Kích thước
                </TableHead>
                <TableHead className="border border-black w-20 text-center">
                  ĐVT
                </TableHead>
                <TableHead className="border border-black w-20 text-right font-bold">
                  SL Chốt
                </TableHead>
                <TableHead className="border border-black">Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={idx} className="border border-black">
                  <TableCell className="border border-black text-center">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="border border-black text-xs uppercase font-bold">
                    {item.customerName}
                  </TableCell>
                  <TableCell className="border border-black font-medium">
                    {item.productName}
                  </TableCell>
                  <TableCell className="border border-black text-center">
                    {item.size || "-"}
                  </TableCell>
                  <TableCell className="border border-black text-center">
                    {item.unit}
                  </TableCell>
                  <TableCell className="border border-black text-right font-bold text-lg">
                    {item.leaderConfirmValue || 0}
                  </TableCell>
                  <TableCell className="border border-black text-xs italic">
                    {item.note || item.customerNote || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-12 flex justify-around text-center">
            <div className="w-48">
              <p className="font-bold">Người lập bảng</p>
              <div className="h-24"></div>
              <p>(Ký và ghi rõ họ tên)</p>
            </div>
            <div className="w-48">
              <p className="font-bold">Lái xe xác nhận</p>
              <div className="h-24"></div>
              <p>(Ký và ghi rõ họ tên)</p>
            </div>
            <div className="w-48">
              <p className="font-bold">Xác nhận điều vận</p>
              <div className="h-24"></div>
              <p>(Ký và ghi rõ họ tên)</p>
            </div>
          </div>
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" /> Đóng
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="w-4 h-4 mr-2" /> In bảng kê
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DispatchManifestPreview;
