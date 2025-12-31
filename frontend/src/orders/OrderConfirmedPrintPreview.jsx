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

const OrderConfirmedPrintPreview = ({ open, onOpenChange, selectedOrders }) => {
  const handlePrint = () => {
    // Lấy nội dung HTML cần in
    const printContent = document.getElementById("print-area-confirmed");
    if (!printContent) return;

    // Tạo cửa sổ mới
    const printWindow = window.open("", "", "width=800,height=600");

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>In đơn chốt</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family:lexend, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 20px;
            background: white;
          }
          
          .order-page {
            break-inside: avoid;
            page-break-inside: avoid;

            margin-bottom: 12mm;
            padding-bottom: 6mm;

            border-bottom: 1px dashed #ccc;
          }
          
          .order-page:last-child {
            border-bottom: none;
          }

          /* Nếu đơn quá dài → cho nó sang trang mới */
          .order-page.force-new-page {
            page-break-before: always;
            break-before: page;
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
          
          .gap-8 {
            gap: 2rem;
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

    // Đợi load xong rồi mới in
    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 border-b shrink-0 print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Xem trước bản in - Đơn chốt
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-8 bg-white print:p-0 w-full" id="print-area-confirmed">
          <style>
            {`
              @media print {
                @page {
                  size: A4;
                  margin: 10mm;
                }
                #print-area-confirmed {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 210mm;
                  padding: 0;
                  margin: 0;
                }
                .order-page {
                page-break-inside: avoid;
                  border-bottom: 2px dashed #ccc;
                  padding-bottom: 20px;
                  margin-bottom: 20px;
                  width: 100%;
                }
                .order-page:last-child {
                  border-bottom: none;
                }
              }
              .order-page {
                margin-bottom: 30px;
                background: white;
                width: 100%;
              }
              /* Đảm bảo table không bị tràn */
              #print-area-confirmed table {
                width: 100% !important;
                table-layout: auto;
              }

              
                /* Thêm phần này */
    .max-w-7xl {
      max-width: 70rem !important;
    }
    
    /* Đảm bảo table responsive */
    @media screen {
      #print-area-confirmed {
        min-width: 1000px;
      }
      
      .order-page table {
        table-layout: fixed;
        width: 100%;
      }
      
      .order-page th,
      .order-page td {
        overflow-wrap: break-word;
        word-break: break-word;
      }
    }
            `}
          </style>

          {selectedOrders.map((order, index) => {
            // Lọc chỉ những items có leaderConfirm.value > 0 và không null
            const confirmedItems = order.items?.filter((item) => {
              const val = parseFloat(item.leaderConfirm?.value);
              return !isNaN(val) && val > 0;
            }) || [];

            // Nếu không có item nào được chốt, bỏ qua đơn này
            if (confirmedItems.length === 0) {
              return null;
            }

            const totalConfirmedQuantity = confirmedItems.reduce((sum, item) => {
              const val = parseFloat(item.leaderConfirm?.value);
              return sum + (!isNaN(val) ? val : 0);
            }, 0);
            const totalCmQty = confirmedItems.reduce(
              (sum, item) => sum + (item.cmQty || 0),
              0
            );

            return (
              <div key={order._id} className="order-page">
                {/* Header đơn hàng */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-100">
                  <div>
                    <h2 className="text-2xl font-bold uppercase text-primary">
                      Đơn hàng vận chuyển (Đã chốt)
                    </h2>
                    <p className="text-sm text-gray-500">
                      Ngày: {formatDate(order.orderDate || order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ID: {order._id.slice(-8).toUpperCase()}
                    </p>
                    {order.vehicle && (
                      <p className="text-sm font-medium">
                        Xe: {order.vehicle.licensePlate || order.vehicle.weight}
                      </p>
                    )}
                  </div>
                </div>

                {/* Thông tin khách hàng */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">
                      Thông tin khách hàng
                    </h3>
                    <p className="text-lg font-bold">
                      {order.customer?.name || "N/A"}
                    </p>
                    {order.customer?.note && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border text-sm italic">
                        <span className="font-bold not-italic">Ghi chú:</span>{" "}
                        {order.customer.note}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">
                      Người tạo
                    </h3>
                    <p className="font-medium">
                      {order.createdBy?.name || "Hệ thống"}
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
                          SL chốt
                        </TableHead>
                        <TableHead className="w-[80px] text-right font-bold text-black">
                          Số cm
                        </TableHead>
                        <TableHead className="font-bold text-black">
                          Ghi chú
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {confirmedItems.map((item, idx) => (
                        <TableRow key={idx} className="border-b">
                          <TableCell className="text-center">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.productName}
                          </TableCell>
                          <TableCell>{item.size || "-"}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right font-bold">
                            {item.leaderConfirm?.value || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.cmQty || 0}
                          </TableCell>
                          <TableCell className="text-sm italic text-gray-600">
                            {item.note || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Footer đơn hàng */}
                <div className="flex justify-between items-end">
                  <div className="text-sm text-gray-500">
                    <p>Tổng số mặt hàng: {confirmedItems.length}</p>
                    <p>
                      Tổng số lượng chốt:{" "}
                      <span className="font-bold text-black">
                        {totalConfirmedQuantity}
                      </span>
                    </p>
                    <p>
                      Tổng số cm:{" "}
                      <span className="font-bold text-black">{totalCmQty}</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-12 text-center pb-4">
                    <div className="w-32">
                      <p className="text-sm font-bold mb-12">Người nhận</p>
                      <p className="text-xs text-gray-400">
                        (Ký và ghi rõ họ tên)
                      </p>
                    </div>
                    <div className="w-32">
                      <p className="text-sm font-bold mb-12">Người giao hàng</p>
                      <p className="text-xs text-gray-400">
                        (Ký và ghi rõ họ tên)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Printer className="w-4 h-4" /> Thực hiện in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderConfirmedPrintPreview;
