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

    // Tạo cửa sổ mới toàn màn hình
    const printWindow = window.open("", "", "fullscreen=yes,scrollbars=yes");

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Bảng kê điều vận - ${vehicle?.licensePlate || ""}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm 10mm 15mm 10mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: lexend, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 20px;
            background: white;
          }
          
          .manifest-page {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 6mm;
            padding-bottom: 6mm;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
          }

          tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .font-bold {
            font-weight: bold;
          }
          
          .text-2xl {
            font-size: 1.5rem;
          }
          
          .uppercase {
            text-transform: uppercase;
          }
          
          .grid {
            display: grid;
          }
          
          .grid-cols-2 {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .grid-cols-3 {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .gap-8 {
            gap: 2rem;
          }
          
          .gap-12 {
            gap: 3rem;
          }
          
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mb-12 { margin-bottom: 3rem; }
          .mt-2 { margin-top: 0.5rem; }
          .pb-4 { padding-bottom: 1rem; }
          
          .border-b-2 {
            border-bottom: 2px solid #e5e7eb;
          }
          
          .text-gray-400 { color: #9ca3af; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-600 { color: #4b5563; }
          
          .flex {
            display: flex;
          }
          
          .justify-between {
            justify-content: space-between;
          }
          
          .items-start {
            align-items: flex-start;
          }
          
          .items-end {
            align-items: flex-end;
          }
          
          .space-x-4 > * + * {
            margin-left: 1rem;
          }
          
          @media print {
            body {
              padding: 0;
            }
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

  const today = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 border-b shrink-0 print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Xem trước bảng in
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-8 bg-white print:p-0 w-full" id="manifest-print-area">
          <style>
            {`
              @media print {
                @page {
                  size: A4;
                  margin: 10mm 10mm 15mm 10mm;
                }
                #manifest-print-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 210mm;
                  padding: 0;
                  margin: 0;
                }
                .manifest-page {
                  page-break-inside: avoid;
                  padding-bottom: 10px;
                  margin-bottom: 10px;
                  width: 100%;
                }
              }
              
              .manifest-page {
                margin-bottom: 10px;
                background: white;
                width: 100%;
              }
              
              #manifest-print-area table {
                width: 100% !important;
                table-layout: auto;
              }

              .max-w-7xl {
                max-width: 70rem !important;
              }
              
              @media screen {
                #manifest-print-area {
                  min-width: 1000px;
                }
                
                .manifest-page table {
                  table-layout: fixed;
                  width: 100%;
                }
                
                .manifest-page th,
                .manifest-page td {
                  overflow-wrap: break-word;
                  word-break: break-word;
                }
              }
            `}
          </style>

          {/* Header chung - chỉ hiện một lần */}
          {items.length > 0 &&
            (() => {
              // Tính tổng số lượng chốt
              const totalQuantity = items.reduce((sum, item) => {
                const qty = item.leaderConfirmValue || 0;
                return sum + (qty > 0 ? qty : 0);
              }, 0);

              return (
                <>
                  <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-100">
                    <div>
                      <p className="text-lg font-bold">Ngày: {today}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        Xe: {vehicle?.weight || ""} -{" "}
                        {vehicle?.destination || ""} - {vehicle?.time || ""} -{" "}
                        {totalQuantity} SL
                      </p>
                    </div>
                  </div>

                  {/* Danh sách hàng hóa */}
                  <div className="border rounded-lg overflow-hidden mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b-2">
                          <TableHead className="w-[50px] font-bold text-black">
                            STT
                          </TableHead>
                          <TableHead className="w-[120px] font-bold text-black">
                            Khách hàng
                          </TableHead>
                          <TableHead className="font-bold text-black">
                            Tên hàng hóa
                          </TableHead>
                          <TableHead className="w-[120px] font-bold text-black">
                            Kích thước
                          </TableHead>
                          <TableHead className="w-[70px] font-bold text-black">
                            ĐVT
                          </TableHead>
                          <TableHead className="w-[80px] text-right font-bold text-black">
                            SL Chốt
                          </TableHead>
                          <TableHead className="font-bold text-black">
                            Ghi chú
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, idx) => {
                          const qty = item.leaderConfirmValue || 0;
                          return (
                            <TableRow key={idx} className="border-b">
                              <TableCell className="text-center">
                                {idx + 1}
                              </TableCell>
                              <TableCell className="font-bold uppercase text-xs">
                                {item.customerName}
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.productName}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.size || "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.unit}
                              </TableCell>
                              <TableCell className="text-right font-bold text-lg">
                                {qty > 0 ? qty : "-"}
                              </TableCell>
                              <TableCell className="text-sm italic text-gray-600">
                                {item.note || item.customerNote || "-"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-end">
                    <div className="text-sm text-gray-500 flex space-x-4">
                      <p>
                        Tổng số mặt hàng:{" "}
                        <span className="font-bold text-black">
                          {items.length}
                        </span>
                      </p>
                      <p>
                        Tổng số lượng chốt:{" "}
                        <span className="font-bold text-black">
                          {totalQuantity}
                        </span>
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
        </div>

        <DialogFooter className="p-6 border-t bg-gray-50 shrink-0 print:hidden">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <X className="w-4 h-4" /> Đóng
          </Button>
          <Button
            onClick={handlePrint}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" /> Thực hiện in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DispatchManifestPreview;
