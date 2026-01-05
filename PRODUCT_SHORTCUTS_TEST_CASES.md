# Test Cases cho Product Shortcuts Pattern Matching

## Test Suite 1: Mã tắt "gcc+" (ga chun chần + 2 vỏ gối)

| Input               | Expected Output                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `gcc+`              | ✅ Tên: "ga chun chần + 2 vỏ gối"<br>Kho: K01<br>ĐVT: bộ<br>Kích thước: (trống)<br>Ghi chú: (trống)                     |
| `gcc+160x200`       | ✅ Tên: "ga chun chần + 2 vỏ gối"<br>Kho: K01<br>ĐVT: bộ<br>Kích thước: 160x200<br>Ghi chú: (trống)                     |
| `gcc+tm571`         | ✅ Tên: "ga chun chần + 2 vỏ gối"<br>Kho: K01<br>ĐVT: bộ<br>Kích thước: (trống)<br>Ghi chú: tm571                       |
| `gcc+160x200tm571`  | ✅ Tên: "ga chun chần + 2 vỏ gối"<br>Kho: K01<br>ĐVT: bộ<br>Kích thước: 160x200<br>Ghi chú: tm571                       |
| `GCC+160X200TM571`  | ✅ Tên: "ga chun chần + 2 vỏ gối"<br>Kho: K01<br>ĐVT: bộ<br>Kích thước: 160x200<br>Ghi chú: tm571<br>(Case insensitive) |
| `gcc+100x190td5634` | ✅ Tên: "ga chun chần + 2 vỏ gối"<br>Kho: K01<br>ĐVT: bộ<br>Kích thước: 100x190<br>Ghi chú: td5634                      |
| `gcc+180x200abc123` | ✅ Tên: "ga chun chần + 2 vỏ gối"<br>Kho: K01<br>ĐVT: bộ<br>Kích thước: 180x200<br>Ghi chú: abc123                      |

## Test Suite 2: Mã tắt "gcc" (ga chun chần)

| Input             | Expected Output                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `gcc`             | ✅ Tên: "ga chun chần"<br>Kho: K01<br>ĐVT: cái<br>Kích thước: (trống)<br>Ghi chú: (trống) |
| `gcc160x200`      | ✅ Tên: "ga chun chần"<br>Kho: K01<br>ĐVT: cái<br>Kích thước: 160x200<br>Ghi chú: (trống) |
| `gcctm999`        | ✅ Tên: "ga chun chần"<br>Kho: K01<br>ĐVT: cái<br>Kích thước: (trống)<br>Ghi chú: tm999   |
| `gcc180x200tm888` | ✅ Tên: "ga chun chần"<br>Kho: K01<br>ĐVT: cái<br>Kích thước: 180x200<br>Ghi chú: tm888   |

## Test Suite 3: Mã tắt "vg" (vỏ gối)

| Input           | Expected Output                                                                     |
| --------------- | ----------------------------------------------------------------------------------- |
| `vg`            | ✅ Tên: "vỏ gối"<br>Kho: K01<br>ĐVT: cái<br>Kích thước: (trống)<br>Ghi chú: (trống) |
| `vg50x70`       | ✅ Tên: "vỏ gối"<br>Kho: K01<br>ĐVT: cái<br>Kích thước: 50x70<br>Ghi chú: (trống)   |
| `vgabc456`      | ✅ Tên: "vỏ gối"<br>Kho: K01<br>ĐVT: cái<br>Kích thước: (trống)<br>Ghi chú: abc456  |
| `vg50x70abc456` | ✅ Tên: "vỏ gối"<br>Kho: K01<br>ĐVT: cái<br>Kích thước: 50x70<br>Ghi chú: abc456    |

## Test Suite 4: Edge Cases

| Input               | Expected Output | Note                    |
| ------------------- | --------------- | ----------------------- |
| `gcc+160`           | ❌ Không match  | Thiếu phần "x200"       |
| `gcc+x200`          | ❌ Không match  | Thiếu số trước "x"      |
| `gcc+160x`          | ❌ Không match  | Thiếu số sau "x"        |
| `gcc+123`           | ❌ Không match  | Chỉ có số, không có "x" |
| `gcc+tm`            | ❌ Không match  | Thiếu số sau chữ        |
| `gcc+571`           | ❌ Không match  | Chỉ có số, không có chữ |
| `gcc+ 160x200`      | ❌ Không match  | Có khoảng trắng         |
| `gcc+160x200 tm571` | ❌ Không match  | Có khoảng trắng         |

## Test Suite 5: Các format kích thước khác nhau

| Input           | Pattern   | Match? | Extracted Size |
| --------------- | --------- | ------ | -------------- |
| `gcc+160x200`   | `\d+x\d+` | ✅     | 160x200        |
| `gcc+1600x2000` | `\d+x\d+` | ✅     | 1600x2000      |
| `gcc+16x20`     | `\d+x\d+` | ✅     | 16x20          |
| `gcc+1x2`       | `\d+x\d+` | ✅     | 1x2            |

## Test Suite 6: Các format ghi chú khác nhau

| Input           | Pattern                  | Match? | Extracted Note |
| --------------- | ------------------------ | ------ | -------------- |
| `gcc+tm571`     | `[a-z]+\d+`              | ✅     | tm571          |
| `gcc+t1`        | `[a-z]+\d+`              | ✅     | t1             |
| `gcc+abc123456` | `[a-z]+\d+`              | ✅     | abc123456      |
| `gcc+abcdef999` | `[a-z]+\d+`              | ✅     | abcdef999      |
| `gcc+TM571`     | `[a-z]+\d+` (với flag i) | ✅     | tm571          |

## Hướng dẫn test thủ công

### Bước 1: Mở trang tạo đơn hàng

1. Đăng nhập vào hệ thống
2. Vào trang Orders
3. Click "Tạo đơn hàng mới"

### Bước 2: Thêm dòng hàng hóa

1. Click "Thêm dòng"
2. Nhập test case vào trường "Tên hàng hóa"
3. Nhấn Enter hoặc Tab hoặc click ra ngoài

### Bước 3: Kiểm tra kết quả

- ✅ Tên hàng hóa đã được điền đúng
- ✅ Kích thước đã được điền (nếu có)
- ✅ Kho đã được chọn
- ✅ ĐVT đã được điền
- ✅ Ghi chú đã được điền (nếu có)

## Checklist kiểm tra

- [ ] Test với mã tắt đơn giản (chỉ mã)
- [ ] Test với mã tắt + kích thước
- [ ] Test với mã tắt + ghi chú
- [ ] Test với mã tắt + kích thước + ghi chú
- [ ] Test với chữ HOA
- [ ] Test với chữ thường
- [ ] Test với chữ Mixed Case
- [ ] Test các edge cases (format sai)
- [ ] Test nhiều kích thước khác nhau
- [ ] Test nhiều mã ghi chú khác nhau

## Kết quả mong đợi

### ✅ Thành công khi:

- Tất cả các trường được điền đúng
- Không có lỗi console
- UI phản hồi ngay lập tức
- Dữ liệu được lưu đúng khi submit

### ❌ Thất bại khi:

- Các trường không được điền
- Có lỗi console
- UI không phản hồi
- Dữ liệu bị sai khi submit

## Debug Tips

### Nếu pattern không hoạt động:

1. Mở Console (F12)
2. Kiểm tra có lỗi JavaScript không
3. Thêm `console.log()` trong `getProductShortcut()`:
   ```javascript
   export const getProductShortcut = (input) => {
     console.log("Input:", input);
     // ... rest of code
     console.log("Result:", result);
     return result;
   };
   ```

### Nếu regex không match:

1. Copy regex vào [regex101.com](https://regex101.com)
2. Chọn flavor: JavaScript
3. Paste test string
4. Kiểm tra groups có đúng không

### Nếu dữ liệu không được điền:

1. Kiểm tra `handleProductNameBlur()` có được gọi không
2. Kiểm tra `shortcut` object có đúng structure không
3. Kiểm tra `setItems()` có được gọi không
