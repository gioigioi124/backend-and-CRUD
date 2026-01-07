// product/productParser.js

import { PRODUCT_RULES } from "./productRules";

/**
 * Parse chuỗi input theo các PRODUCT_RULES
 * @param {string} input - Chuỗi cần parse (vd: "g3a05", "g3b07160x200")
 * @returns {object|null} - Object chứa thông tin sản phẩm hoặc null nếu không match
 */
export function parseProductKey(input) {
  if (!input || typeof input !== "string") return null;

  // Thử từng rule cho đến khi match
  for (const rule of PRODUCT_RULES) {
    const match = input.match(rule.pattern);
    if (match) {
      const result = rule.build(match);
      if (result) {
        return result;
      }
    }
  }

  return null;
}
