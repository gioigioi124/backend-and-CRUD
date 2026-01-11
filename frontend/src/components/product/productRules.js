// product/productRules.js

export const PRODUCT_RULES = [
  {
    id: "GAP_3",

    // g3a05
    pattern: /^g3([a-z])(\d{2})$/i,

    warehouse: "K04",
    unit: "cái",
    note: "",

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
        cmQtyPerUnit: thickness, // Số cm cho 1 đơn vị
        size: "",
        note: this.note || "",
      };
    },
  },
  {
    id: "GAP_2_ABC",

    // g2a09
    pattern: /^g2([a-z])(\d{2})$/i,

    warehouse: "K02",
    unit: "cái",
    note: "",

    materialMap: {
      a: "Alias",
      b: "Vimatt",
      c: "See",
    },

    thicknessMap: {
      "09": 14,
      14: 18,
      18: 22,
    },

    build(match) {
      const material = this.materialMap[match[1]];
      const thicknessKey = match[2]; // Key từ input (vd: "09", "14", "18")
      const thicknessValue = this.thicknessMap[thicknessKey]; // Value từ map (vd: 14, 18, 22)
      if (!material || !thicknessValue) return null;

      return {
        productName: `gấp 2 ${material} ${thicknessKey}F`,
        warehouse: this.warehouse,
        unit: this.unit,
        cmQty: thicknessValue,
        cmQtyPerUnit: thicknessValue, // Số cm cho 1 đơn vị
        size: "",
        note: `TP-${thicknessValue}cm`,
      };
    },
  },
  {
    id: "GAP_2_REX",

    // g2r07, g2r09, g2r12
    pattern: /^g2r(\d{1,2})$/i,

    warehouse: "K02",
    unit: "cái",
    note: "",

    thicknessMap: {
      "07": 10,
      "09": 12,
      12: 15,
    },

    build(match) {
      const material = "Rex";
      const thicknessKey = match[1]; // Key từ input (vd: "07", "09", "12")
      const thicknessValue = this.thicknessMap[thicknessKey]; // Value từ map (vd: 10, 12, 15)
      if (!thicknessValue) return null;

      return {
        productName: `gấp 2 ${material} ${thicknessKey}F`,
        warehouse: this.warehouse,
        unit: this.unit,
        cmQty: thicknessValue,
        cmQtyPerUnit: thicknessValue, // Số cm cho 1 đơn vị
        size: "",
        note: `TP-${thicknessValue}cm`,
      };
    },
  },
  {
    id: "GAP_2_MIX",

    // g2m07, g2m09, g2m14, g2m18
    pattern: /^g2m(\d{1,2})$/i,

    warehouse: "K02",
    unit: "cái",
    note: "",

    thicknessMap: {
      "07": 10,
      "09": 14,
      14: 18,
      18: 22,
    },

    build(match) {
      const material = "MIX";
      const thicknessKey = match[1]; // Key từ input (vd: "07", "09", "14", "18")
      const thicknessValue = this.thicknessMap[thicknessKey]; // Value từ map (vd: 10, 14, 18, 22)
      if (!thicknessValue) return null;

      return {
        productName: `gấp 2 ${material} ${parseInt(thicknessKey)}F`,
        warehouse: this.warehouse,
        unit: this.unit,
        cmQty: thicknessValue,
        cmQtyPerUnit: thicknessValue, // Số cm cho 1 đơn vị
        size: "",
        note: `TP-${thicknessValue}cm`,
      };
    },
  },
  // 👉 thêm rule khác tại đây
];
