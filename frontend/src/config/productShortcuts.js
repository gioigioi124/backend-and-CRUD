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
    warehouse: "K03",
    unit: "cái",
    cmQty: 5,
    usePattern: true,
    // Pattern: g3a05 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3a05(?:(\d+x\d+))?(.+)?$/i,
  },
  g3a07: {
    productName: "gấp 3 Alias 7F",
    warehouse: "K03",
    unit: "cái",
    cmQty: 7,
    usePattern: true,
    // Pattern: g3a07 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3a07(?:(\d+x\d+))?(.+)?$/i,
  },
  g3a09: {
    productName: "gấp 3 Alias 9F",
    warehouse: "K03",
    unit: "cái",
    cmQty: 9,
    usePattern: true,
    // Pattern: g3a09 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3a09(?:(\d+x\d+))?(.+)?$/i,
  },
  g3a14: {
    productName: "gấp 3 Alias 14F",
    warehouse: "K03",
    unit: "cái",
    cmQty: 14,
    usePattern: true,
    // Pattern: g3a14 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3a14(?:(\d+x\d+))?(.+)?$/i,
  },
  g3a18: {
    productName: "gấp 3 Alias 18F",
    warehouse: "K03",
    unit: "cái",
    cmQty: 18,
    usePattern: true,
    // Pattern: g3a18 + kích thước (optional) + mã ghi chú (optional)
    pattern: /^g3a18(?:(\d+x\d+))?(.+)?$/i,
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
