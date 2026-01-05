# Product Shortcuts - Quick Reference

## 🚀 Tính năng

Tự động điền thông tin sản phẩm khi nhập mã tắt vào trường "Tên hàng hóa".

## 📝 Cú pháp

```
[mã tắt][kích thước][mã ghi chú]
```

**Ví dụ:**

- `gcc+` → ga chun chần + 2 vỏ gối (K01, bộ)
- `gcc+160x200` → + kích thước 160x200
- `gcc+tm571` → + ghi chú tm571
- `gcc+160x200tm571` → + cả kích thước và ghi chú

## ⚡ Quick Start

### 1. Thêm mã tắt mới

Mở `frontend/src/config/productShortcuts.js`:

```javascript
export const PRODUCT_SHORTCUTS = {
  tên_tắt: {
    productName: "Tên đầy đủ",
    warehouse: "K01",
    unit: "đơn vị",
    usePattern: true,
    pattern: /^tên_tắt(?:(\d+x\d+))?([a-z]+\d+)?$/i,
  },
};
```

### 2. Sử dụng

1. Thêm dòng mới trong đơn hàng
2. Nhập mã tắt (ví dụ: `gcc+160x200tm571`)
3. Nhấn **Enter** hoặc **Tab**
4. ✨ Tự động điền!

## 📋 Mã tắt hiện có

| Mã     | Tên sản phẩm            | Kho | ĐVT |
| ------ | ----------------------- | --- | --- |
| `gcc+` | ga chun chần + 2 vỏ gối | K01 | bộ  |
| `gcc`  | ga chun chần            | K01 | cái |
| `vg`   | vỏ gối                  | K01 | cái |

## 🎯 Format

- **Kích thước:** `[số]x[số]` (ví dụ: 160x200, 50x70)
- **Ghi chú:** `[chữ][số]` (ví dụ: tm571, td999, abc123)
- **Không phân biệt hoa/thường**

## 📚 Tài liệu đầy đủ

- **Hướng dẫn chi tiết:** `PRODUCT_SHORTCUTS_GUIDE.md`
- **Ví dụ patterns:** `frontend/src/config/productShortcuts.examples.js`
- **Test cases:** `PRODUCT_SHORTCUTS_TEST_CASES.md`

## 🔧 Files liên quan

```
frontend/src/
├── config/
│   ├── productShortcuts.js          ← Cấu hình mã tắt
│   └── productShortcuts.examples.js ← Ví dụ patterns
└── orders/
    └── ItemsTable.jsx               ← Logic xử lý
```

## 💡 Tips

- Kích thước luôn đứng trước ghi chú
- Cả hai đều optional
- Test regex tại [regex101.com](https://regex101.com)
- Mở Console (F12) để debug
