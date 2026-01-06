/**
 * Cấu hình các phím tắt cho sản phẩm
 * Khi nhập mã tắt vào trường "Tên hàng hóa", hệ thống sẽ tự động điền các trường tương ứng
 *
 * Cấu trúc cơ bản:
 * - key: Mã tắt (viết thường, không dấu)
 * - value: Object chứa thông tin sản phẩm
 *   - productName: Tên đầy đủ của sản phẩm
 *   - warehouse: Mã kho (K01, K02, K03, K04)
 *   - unit: Đơn vị tính
 *   - size: Kích thước (tùy chọn)
 *   - cmQty: Số cm mặc định (tùy chọn)
 *
 * Cấu trúc nâng cao (hỗ trợ pattern):
 * - usePattern: true - Bật chế độ pattern matching
 * - pattern: Regex pattern để match và extract thông tin
 * - Các group trong regex sẽ được map vào các trường tương ứng
 *   - Group 1: Kích thước (ví dụ: 160x200)
 *   - Group 2: Mã ghi chú (ví dụ: tm571)
 */
export const PRODUCT_SHORTCUTS = {
  "gcc+": {
    productName: "ga chun chần + 2 vỏ gối",
    warehouse: "K01",
    unit: "bộ",
    usePattern: true,
    // Pattern: gcc+ + kích thước (optional) + mã ghi chú (optional)
    // Ví dụ: gcc+160x200tm571 hoặc gcc+test hoặc gcc+160x200
    pattern: /^gcc\+(?:(\d+x\d+))?(.+)?$/i,
  },
  gcc: {
    productName: "ga chun chần",
    warehouse: "K01",
    unit: "cái",
    usePattern: true,
    // Pattern: gcc + kích thước (optional) + mã ghi chú (optional)
    pattern: /^gcc(?:(\d+x\d+))?(.+)?$/i,
  },
  vg: {
    productName: "vỏ gối",
    warehouse: "K01",
    unit: "cái",
    usePattern: true,
    // Pattern: vg + kích thước (optional) + mã ghi chú (optional)
    pattern: /^vg(?:(\d+x\d+))?(.+)?$/i,
  },

  g3a05: {
    productName: "gấp 3 Alias 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    // Pattern: g3a05 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3a05(?:(\d+x\d+))?(.+)?$/i,
  },
  g3a07: {
    productName: "gấp 3 Alias 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    // Pattern: g3a07 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3a07(?:(\d+x\d+))?(.+)?$/i,
  },
  g3a09: {
    productName: "gấp 3 Alias 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    // Pattern: g3a09 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3a09(?:(\d+x\d+))?(.+)?$/i,
  },
  g3a14: {
    productName: "gấp 3 Alias 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    // Pattern: g3a14 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3a14(?:(\d+x\d+))?(.+)?$/i,
  },
  g3a18: {
    productName: "gấp 3 Alias 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    // Pattern: g3a18 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3a18(?:(\d+x\d+))?(.+)?$/i,
  },
  g3b05: {
    productName: "gấp 3 B Vimatt 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    // Pattern: g3b05 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3b05(?:(\d+x\d+))?(.+)?$/i,
  },
  g3b07: {
    productName: "gấp 3 B Vimatt 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    // Pattern: g3b07 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3b07(?:(\d+x\d+))?(.+)?$/i,
  },
  g3b09: {
    productName: "gấp 3 B Vimatt 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    // Pattern: g3b09 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3b09(?:(\d+x\d+))?(.+)?$/i,
  },
  g3b14: {
    productName: "gấp 3 B Vimatt 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    // Pattern: g3b14 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3b14(?:(\d+x\d+))?(.+)?$/i,
  },
  g3b18: {
    productName: "gấp 3 B Vimatt 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    // Pattern: g3b18 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3b18(?:(\d+x\d+))?(.+)?$/i,
  },
  g3c05: {
    productName: "gấp 3 See 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    // Pattern: g3c05 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3c05(?:(\d+x\d+))?(.+)?$/i,
  },
  g3c07: {
    productName: "gấp 3 See 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    // Pattern: g3c07 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3c07(?:(\d+x\d+))?(.+)?$/i,
  },
  g3c09: {
    productName: "gấp 3 See 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    // Pattern: g3c09 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3c09(?:(\d+x\d+))?(.+)?$/i,
  },
  g3c14: {
    productName: "gấp 3 See 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    // Pattern: g3c14 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3c14(?:(\d+x\d+))?(.+)?$/i,
  },
  g3c18: {
    productName: "gấp 3 See 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    // Pattern: g3c18 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3c18(?:(\d+x\d+))?(.+)?$/i,
  },
  g3f05: {
    productName: "gấp 3 Fly 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    // Pattern: g3f05 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3f05(?:(\d+x\d+))?(.+)?$/i,
  },
  g3f07: {
    productName: "gấp 3 Fly 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    // Pattern: g3f07 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3f07(?:(\d+x\d+))?(.+)?$/i,
  },
  g3f09: {
    productName: "gấp 3 Fly 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    // Pattern: g3f09 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3f09(?:(\d+x\d+))?(.+)?$/i,
  },
  g3f14: {
    productName: "gấp 3 Fly 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    // Pattern: g3f14 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3f14(?:(\d+x\d+))?(.+)?$/i,
  },
  g3f18: {
    productName: "gấp 3 Fly 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    // Pattern: g3f18 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3f18(?:(\d+x\d+))?(.+)?$/i,
  },
  g3r05: {
    productName: "gấp 3 Rex 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    // Pattern: g3r05 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3r05(?:(\d+x\d+))?(.+)?$/i,
  },
  g3r07: {
    productName: "gấp 3 Rex 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    // Pattern: g3r07 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3r07(?:(\d+x\d+))?(.+)?$/i,
  },
  g3r09: {
    productName: "gấp 3 Rex 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    // Pattern: g3r09 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3r09(?:(\d+x\d+))?(.+)?$/i,
  },
  g3r14: {
    productName: "gấp 3 Rex 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    // Pattern: g3r14 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3r14(?:(\d+x\d+))?(.+)?$/i,
  },
  g3r18: {
    productName: "gấp 3 Rex 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    // Pattern: g3r18 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3r18(?:(\d+x\d+))?(.+)?$/i,
  },
  g2akc05: {
    productName: "gấp 2 Alias không chần 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    pattern: /^g2akc05(?:(\d+x\d+))?(.+)?$/i,
  },
  g2akc07: {
    productName: "gấp 2 Alias không chần 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    pattern: /^g2akc07(?:(\d+x\d+))?(.+)?$/i,
  },
  g2akc09: {
    productName: "gấp 2 Alias không chần 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    pattern: /^g2akc09(?:(\d+x\d+))?(.+)?$/i,
  },
  g2akc14: {
    productName: "gấp 2 Alias không chần 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    pattern: /^g2akc14(?:(\d+x\d+))?(.+)?$/i,
  },
  g2akc18: {
    productName: "gấp 2 Alias không chần 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    pattern: /^g2akc18(?:(\d+x\d+))?(.+)?$/i,
  },
  g2bkc05: {
    productName: "gấp 2 B Vimatt không chần 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    pattern: /^g2bkc05(?:(\d+x\d+))?(.+)?$/i,
  },
  g2bkc07: {
    productName: "gấp 2 B Vimatt không chần 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    pattern: /^g2bkc07(?:(\d+x\d+))?(.+)?$/i,
  },
  g2bkc09: {
    productName: "gấp 2 B Vimatt không chần 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    pattern: /^g2bkc09(?:(\d+x\d+))?(.+)?$/i,
  },
  g2bkc14: {
    productName: "gấp 2 B Vimatt không chần 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    pattern: /^g2bkc14(?:(\d+x\d+))?(.+)?$/i,
  },
  g2bkc18: {
    productName: "gấp 2 B Vimatt không chần 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    pattern: /^g2bkc18(?:(\d+x\d+))?(.+)?$/i,
  },
  g2ckc05: {
    productName: "gấp 2 See không chần 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    pattern: /^g2ckc05(?:(\d+x\d+))?(.+)?$/i,
  },
  g2ckc07: {
    productName: "gấp 2 See không chần 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    pattern: /^g2ckc07(?:(\d+x\d+))?(.+)?$/i,
  },
  g2ckc09: {
    productName: "gấp 2 See không chần 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    pattern: /^g2ckc09(?:(\d+x\d+))?(.+)?$/i,
  },
  g2ckc14: {
    productName: "gấp 2 See không chần 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    pattern: /^g2ckc14(?:(\d+x\d+))?(.+)?$/i,
  },
  g2ckc18: {
    productName: "gấp 2 See không chần 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    pattern: /^g2ckc18(?:(\d+x\d+))?(.+)?$/i,
  },
  g2fkc05: {
    productName: "gấp 2 Fly không chần 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    pattern: /^g2fkc05(?:(\d+x\d+))?(.+)?$/i,
  },
  g2fkc07: {
    productName: "gấp 2 Fly không chần 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    pattern: /^g2fkc07(?:(\d+x\d+))?(.+)?$/i,
  },
  g2fkc09: {
    productName: "gấp 2 Fly không chần 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    pattern: /^g2fkc09(?:(\d+x\d+))?(.+)?$/i,
  },
  g2fkc14: {
    productName: "gấp 2 Fly không chần 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    pattern: /^g2fkc14(?:(\d+x\d+))?(.+)?$/i,
  },
  g2fkc18: {
    productName: "gấp 2 Fly không chần 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    pattern: /^g2fkc18(?:(\d+x\d+))?(.+)?$/i,
  },
  g2rkc05: {
    productName: "gấp 2 Rex không chần 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    pattern: /^g2rkc05(?:(\d+x\d+))?(.+)?$/i,
  },
  g2rkc07: {
    productName: "gấp 2 Rex không chần 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    pattern: /^g2rkc07(?:(\d+x\d+))?(.+)?$/i,
  },
  g2rkc09: {
    productName: "gấp 2 Rex không chần 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    pattern: /^g2rkc09(?:(\d+x\d+))?(.+)?$/i,
  },
  g2rkc14: {
    productName: "gấp 2 Rex không chần 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    pattern: /^g2rkc14(?:(\d+x\d+))?(.+)?$/i,
  },
  g2rkc18: {
    productName: "gấp 2 Rex không chần 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    pattern: /^g2rkc18(?:(\d+x\d+))?(.+)?$/i,
  },
  takc05: {
    productName: "Đệm thẳng Alias không chần 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    pattern: /^takc05(?:(\d+x\d+))?(.+)?$/i,
  },
  takc07: {
    productName: "Đệm thẳng Alias không chần 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    pattern: /^takc07(?:(\d+x\d+))?(.+)?$/i,
  },
  takc09: {
    productName: "Đệm thẳng Alias không chần 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    pattern: /^takc09(?:(\d+x\d+))?(.+)?$/i,
  },
  takc14: {
    productName: "Đệm thẳng Alias không chần 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    pattern: /^takc14(?:(\d+x\d+))?(.+)?$/i,
  },
  takc18: {
    productName: "Đệm thẳng Alias không chần 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    pattern: /^takc18(?:(\d+x\d+))?(.+)?$/i,
  },
  tbkc05: {
    productName: "Đệm thẳng B Vimatt không chần 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    pattern: /^tbkc05(?:(\d+x\d+))?(.+)?$/i,
  },
  tbkc07: {
    productName: "Đệm thẳng B Vimatt không chần 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    pattern: /^tbkc07(?:(\d+x\d+))?(.+)?$/i,
  },
  tbkc09: {
    productName: "Đệm thẳng B Vimatt không chần 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    pattern: /^tbkc09(?:(\d+x\d+))?(.+)?$/i,
  },
  tbkc14: {
    productName: "Đệm thẳng B Vimatt không chần 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    pattern: /^tbkc14(?:(\d+x\d+))?(.+)?$/i,
  },
  tbkc18: {
    productName: "Đệm thẳng B Vimatt không chần 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    pattern: /^tbkc18(?:(\d+x\d+))?(.+)?$/i,
  },
  tckc05: {
    productName: "Đệm thẳng See không chần 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    pattern: /^tckc05(?:(\d+x\d+))?(.+)?$/i,
  },
  tckc07: {
    productName: "Đệm thẳng See không chần 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    pattern: /^tckc07(?:(\d+x\d+))?(.+)?$/i,
  },
  tckc09: {
    productName: "Đệm thẳng See không chần 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    pattern: /^tckc09(?:(\d+x\d+))?(.+)?$/i,
  },
  tckc14: {
    productName: "Đệm thẳng See không chần 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    pattern: /^tckc14(?:(\d+x\d+))?(.+)?$/i,
  },
  tckc18: {
    productName: "Đệm thẳng See không chần 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    pattern: /^tckc18(?:(\d+x\d+))?(.+)?$/i,
  },
  tfkc05: {
    productName: "Đệm thẳng Fly không chần 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    pattern: /^tfkc05(?:(\d+x\d+))?(.+)?$/i,
  },
  tfkc07: {
    productName: "Đệm thẳng Fly không chần 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    pattern: /^tfkc07(?:(\d+x\d+))?(.+)?$/i,
  },
  tfkc09: {
    productName: "Đệm thẳng Fly không chần 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    pattern: /^tfkc09(?:(\d+x\d+))?(.+)?$/i,
  },
  tfkc14: {
    productName: "Đệm thẳng Fly không chần 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    pattern: /^tfkc14(?:(\d+x\d+))?(.+)?$/i,
  },
  tfkc18: {
    productName: "Đệm thẳng Fly không chần 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    pattern: /^tfkc18(?:(\d+x\d+))?(.+)?$/i,
  },
  trkc05: {
    productName: "Đệm thẳng Rex không chần 5F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    pattern: /^trkc05(?:(\d+x\d+))?(.+)?$/i,
  },
  trkc07: {
    productName: "Đệm thẳng Rex không chần 7F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    pattern: /^trkc07(?:(\d+x\d+))?(.+)?$/i,
  },
  trkc09: {
    productName: "Đệm thẳng Rex không chần 9F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    pattern: /^trkc09(?:(\d+x\d+))?(.+)?$/i,
  },
  trkc14: {
    productName: "Đệm thẳng Rex không chần 14F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    pattern: /^trkc14(?:(\d+x\d+))?(.+)?$/i,
  },
  trkc18: {
    productName: "Đệm thẳng Rex không chần 18F",
    warehouse: "K04",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    pattern: /^trkc18(?:(\d+x\d+))?(.+)?$/i,
  },
  // Thêm các mã tắt khác tại đây
};

/**
 * Hàm parse input để trích xuất thông tin từ pattern
 * @param {string} input - Chuỗi nhập vào
 * @param {RegExp} pattern - Pattern để match
 * @returns {object|null} - Object chứa size và note nếu match, null nếu không
 */
const parsePattern = (input, pattern) => {
  const match = input.match(pattern);
  if (!match) return null;

  return {
    size: match[1] || "", // Group 1: kích thước (ví dụ: 160x200)
    note: match[2]?.toUpperCase() || "", // Group 2: mã ghi chú (ví dụ: tm571)
  };
};

/**
 * Hàm kiểm tra và áp dụng shortcut
 * @param {string} input - Giá trị người dùng nhập vào
 * @returns {object|null} - Trả về thông tin sản phẩm nếu tìm thấy shortcut, null nếu không
 */
export const getProductShortcut = (input) => {
  if (!input) return null;

  const normalizedInput = input.toLowerCase().trim();

  // Sắp xếp shortcuts theo độ dài key (dài nhất trước) để match chính xác hơn
  // Ví dụ: g3a09 sẽ được kiểm tra trước g3a
  const sortedShortcuts = Object.entries(PRODUCT_SHORTCUTS).sort(
    ([keyA], [keyB]) => keyB.length - keyA.length
  );

  // Duyệt qua tất cả shortcuts để tìm match
  for (const [key, config] of sortedShortcuts) {
    if (config.usePattern && config.pattern) {
      // Sử dụng pattern matching
      const parsed = parsePattern(normalizedInput, config.pattern);
      if (parsed) {
        return {
          productName: config.productName,
          warehouse: config.warehouse,
          unit: config.unit,
          size: parsed.size || config.size || "",
          cmQty: config.cmQty,
          note: parsed.note || "",
        };
      }
    } else if (normalizedInput === key) {
      // Match đơn giản (không dùng pattern)
      return {
        productName: config.productName,
        warehouse: config.warehouse,
        unit: config.unit,
        size: config.size || "",
        cmQty: config.cmQty,
        note: "",
      };
    }
  }

  return null;
};
