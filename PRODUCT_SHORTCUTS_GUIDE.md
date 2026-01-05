# Hướng dẫn sử dụng tính năng Phím tắt Sản phẩm (Product Shortcuts)

## Tổng quan

Tính năng này cho phép bạn nhập mã tắt vào trường "Tên hàng hóa" và tự động điền các thông tin sản phẩm như:

- Tên đầy đủ của sản phẩm
- Kho
- Đơn vị tính (ĐVT)
- Kích thước (tùy chọn)
- Số cm (tùy chọn)
- Ghi chú (tùy chọn)

## Cách sử dụng

### 1. Mã tắt đơn giản

Nhập mã tắt cơ bản và nhấn **Enter**, **Tab**, hoặc click ra ngoài:

**Ví dụ:**

- Nhập: `gcc+`
- Kết quả:
  - Tên hàng hóa: `ga chun chần + 2 vỏ gối`
  - Kho: `K01`
  - ĐVT: `bộ`

### 2. Mã tắt nâng cao với kích thước và ghi chú

Bạn có thể nhập mã tắt kèm theo kích thước và mã ghi chú trong một lần:

**Cú pháp:** `[mã tắt][kích thước][mã ghi chú]`

**Ví dụ:**

- Nhập: `gcc+160x200tm571`
- Kết quả:
  - Tên hàng hóa: `ga chun chần + 2 vỏ gối`
  - Kích thước: `160x200`
  - Kho: `K01`
  - ĐVT: `bộ`
  - Ghi chú: `tm571`

**Các biến thể:**

- `gcc+160x200` → Chỉ điền kích thước, không có ghi chú
- `gcc+tm571` → Chỉ điền ghi chú, không có kích thước
- `gcc+100x190td5634` → Kích thước 100x190, ghi chú td5634
- `vg50x70abc123` → Vỏ gối, kích thước 50x70, ghi chú abc123

## Quy tắc Pattern Matching

### Format kích thước:

- Phải theo dạng: `[số]x[số]`
- Ví dụ hợp lệ: `160x200`, `100x190`, `50x70`
- Không phân biệt hoa/thường

### Format mã ghi chú:

- Phải bắt đầu bằng chữ cái, theo sau là số
- Ví dụ hợp lệ: `tm571`, `td5634`, `abc123`, `TM571`
- Không phân biệt hoa/thường

### Thứ tự:

- Kích thước luôn đứng trước mã ghi chú
- Cả hai đều là tùy chọn (optional)

## Cách thêm mã tắt mới

Mở file `frontend/src/config/productShortcuts.js` và thêm mã tắt mới:

### Mã tắt đơn giản (không pattern):

```javascript
export const PRODUCT_SHORTCUTS = {
  dem: {
    productName: "đệm bông ép",
    warehouse: "K02",
    unit: "cái",
  },
};
```

### Mã tắt nâng cao (có pattern):

```javascript
export const PRODUCT_SHORTCUTS = {
  "gcc+": {
    productName: "ga chun chần + 2 vỏ gối",
    warehouse: "K01",
    unit: "bộ",
    usePattern: true,
    // Pattern: gcc+ + kích thước (optional) + mã ghi chú (optional)
    pattern: /^gcc\+(?:(\d+x\d+))?([a-z]+\d+)?$/i,
  },
};
```

### Giải thích Pattern:

```javascript
/^gcc\+(?:(\d+x\d+))?([a-z]+\d+)?$/i;
```

- `^gcc\+` - Bắt đầu bằng "gcc+"
- `(?:(\d+x\d+))?` - Group 1: Kích thước (optional), format: số x số
- `([a-z]+\d+)?` - Group 2: Mã ghi chú (optional), format: chữ + số
- `$` - Kết thúc chuỗi
- `i` - Không phân biệt hoa/thường

## Các trường có thể cấu hình

| Trường        | Bắt buộc | Mô tả                                              |
| ------------- | -------- | -------------------------------------------------- |
| `productName` | ✅       | Tên đầy đủ của sản phẩm                            |
| `warehouse`   | ❌       | Mã kho (K01, K02, K03, K04)                        |
| `unit`        | ❌       | Đơn vị tính (ví dụ: cái, bộ, kg)                   |
| `size`        | ❌       | Kích thước mặc định (nếu không nhập trong pattern) |
| `cmQty`       | ❌       | Số cm mặc định                                     |
| `usePattern`  | ❌       | `true` để bật pattern matching                     |
| `pattern`     | ❌       | Regex pattern để extract kích thước và ghi chú     |

## Ví dụ cấu hình đầy đủ

```javascript
export const PRODUCT_SHORTCUTS = {
  // Mã tắt với pattern (nâng cao)
  "gcc+": {
    productName: "ga chun chần + 2 vỏ gối",
    warehouse: "K01",
    unit: "bộ",
    usePattern: true,
    pattern: /^gcc\+(?:(\d+x\d+))?([a-z]+\d+)?$/i,
  },

  // Mã tắt với pattern
  gcc: {
    productName: "ga chun chần",
    warehouse: "K01",
    unit: "cái",
    usePattern: true,
    pattern: /^gcc(?:(\d+x\d+))?([a-z]+\d+)?$/i,
  },

  // Mã tắt với pattern
  vg: {
    productName: "vỏ gối",
    warehouse: "K01",
    unit: "cái",
    usePattern: true,
    pattern: /^vg(?:(\d+x\d+))?([a-z]+\d+)?$/i,
  },

  // Mã tắt đơn giản (không pattern)
  dem: {
    productName: "đệm bông ép",
    warehouse: "K02",
    unit: "cái",
    size: "160x200x10", // Kích thước cố định
    cmQty: 15,
  },
};
```

## Lưu ý quan trọng

### ✅ Ưu tiên Pattern Matching

- Hệ thống sẽ ưu tiên kiểm tra pattern trước
- Nếu có `usePattern: true`, pattern sẽ được áp dụng
- Nếu không match pattern, sẽ fallback về exact match

### ✅ Thứ tự kiểm tra

1. Duyệt qua tất cả shortcuts có `usePattern: true`
2. Thử match với pattern
3. Nếu không có pattern nào match, thử exact match với key

### ✅ Không ghi đè dữ liệu có sẵn

- Nếu trường đã có giá trị, shortcut sẽ **không ghi đè**
- Chỉ điền vào các trường trống

### ✅ Case Insensitive

- Tất cả mã tắt đều không phân biệt hoa/thường
- `GCC+160x200TM571` = `gcc+160x200tm571`

## Ví dụ thực tế

### Kịch bản 1: Nhập đầy đủ

```
Input: gcc+160x200tm571
Output:
  - Tên: ga chun chần + 2 vỏ gối
  - Kích thước: 160x200
  - Kho: K01
  - ĐVT: bộ
  - Ghi chú: tm571
```

### Kịch bản 2: Chỉ nhập kích thước

```
Input: gcc+180x200
Output:
  - Tên: ga chun chần + 2 vỏ gối
  - Kích thước: 180x200
  - Kho: K01
  - ĐVT: bộ
  - Ghi chú: (trống)
```

### Kịch bản 3: Chỉ nhập mã ghi chú

```
Input: gcc+td999
Output:
  - Tên: ga chun chần + 2 vỏ gối
  - Kích thước: (trống)
  - Kho: K01
  - ĐVT: bộ
  - Ghi chú: td999
```

### Kịch bản 4: Chỉ nhập mã tắt

```
Input: gcc+
Output:
  - Tên: ga chun chần + 2 vỏ gối
  - Kích thước: (trống)
  - Kho: K01
  - ĐVT: bộ
  - Ghi chú: (trống)
```

## Cấu trúc file

```
frontend/
├── src/
│   ├── config/
│   │   └── productShortcuts.js  ← File cấu hình mã tắt
│   └── orders/
│       └── ItemsTable.jsx       ← Component sử dụng tính năng
```

## Troubleshooting

### Pattern không hoạt động?

1. Kiểm tra `usePattern: true` đã được set chưa
2. Kiểm tra regex pattern có đúng format không
3. Test pattern tại [regex101.com](https://regex101.com)

### Kích thước/Ghi chú không được extract?

1. Kiểm tra format có đúng không (số x số cho kích thước, chữ + số cho ghi chú)
2. Kiểm tra thứ tự: kích thước trước, ghi chú sau
3. Kiểm tra regex groups có đúng vị trí không

### Muốn thay đổi format?

Sửa regex pattern trong file config. Ví dụ, nếu muốn format kích thước là `số-số` thay vì `số x số`:

```javascript
pattern: /^gcc\+(?:(\d+-\d+))?([a-z]+\d+)?$/i,
```
