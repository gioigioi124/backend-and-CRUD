// product/productRules.js

export const PRODUCT_RULES = [
  {
    id: "GAP_3",

    // g3a05 | g3a05160x200 | g3a05tm571
    pattern: /^g3([a-z])(\d{2})(?:(\d+x\d+))?(.+)?$/i,

    warehouse: "K04",
    unit: "cái",

    materialMap: {
      a: "Alias",
      b: "Vimatt",
      c: "See",
      f: "Fly",
      r: "Rex",
    },

    thicknessMap: {
      "05": 5,
      "07": 7,
      "09": 9,
      14: 14,
      18: 18,
    },

    build(match) {
      const material = this.materialMap[match[1]];
      const thickness = this.thicknessMap[match[2]];
      if (!material || !thickness) return null;

      return {
        productName: `gấp 3 ${material} ${thickness}F`,
        warehouse: this.warehouse,
        unit: this.unit,
        cmQty: thickness,
        size: match[3] || "",
        note: match[4]?.toUpperCase() || "",
      };
    },
  },

  // 👉 thêm rule khác tại đây
];
