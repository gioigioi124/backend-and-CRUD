// product/productSuggest.js

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const PRODUCT_SUGGESTIONS = [
  // Alias
  { key: "g3a05", label: "gấp 3 Alias 5F" },
  { key: "g3a07", label: "gấp 3 Alias 7F" },
  { key: "g3a09", label: "gấp 3 Alias 9F" },
  { key: "g3a14", label: "gấp 3 Alias 14F" },
  { key: "g3a18", label: "gấp 3 Alias 18F" },

  // Vimatt
  { key: "g3b05", label: "gấp 3 Vimatt 5F" },
  { key: "g3b07", label: "gấp 3 Vimatt 7F" },
  { key: "g3b09", label: "gấp 3 Vimatt 9F" },
  { key: "g3b14", label: "gấp 3 Vimatt 14F" },
  { key: "g3b18", label: "gấp 3 Vimatt 18F" },

  // See
  { key: "g3s05", label: "gấp 3 See 5F" },
  { key: "g3s07", label: "gấp 3 See 7F" },
  { key: "g3s09", label: "gấp 3 See 9F" },
  { key: "g3s14", label: "gấp 3 See 14F" },
  { key: "g3s18", label: "gấp 3 See 18F" },

  // Fly
  { key: "g3f05", label: "gấp 3 Fly 5F" },
  { key: "g3f07", label: "gấp 3 Fly 7F" },
  { key: "g3f09", label: "gấp 3 Fly 9F" },
  { key: "g3f14", label: "gấp 3 Fly 14F" },
  { key: "g3f18", label: "gấp 3 Fly 18F" },

  // Rex
  { key: "g3r05", label: "gấp 3 Rex 5F" },
  { key: "g3r07", label: "gấp 3 Rex 7F" },
  { key: "g3r09", label: "gấp 3 Rex 9F" },
  { key: "g3r14", label: "gấp 3 Rex 14F" },
  { key: "g3r18", label: "gấp 3 Rex 18F" },
  // Alias chần
  { key: "g2a09", label: "gấp 2 Alias 9F" },
  { key: "g2a14", label: "gấp 2 Alias 14F" },
  { key: "g2a18", label: "gấp 2 Alias 18F" },
  // Vimatt chần
  { key: "g2b09", label: "gấp 2 Vimatt 9F" },
  { key: "g2b14", label: "gấp 2 Vimatt 14F" },
  { key: "g2b18", label: "gấp 2 Vimatt 18F" },
  // See chần
  { key: "g2s09", label: "gấp 2 See 9F" },
  { key: "g2s14", label: "gấp 2 See 14F" },
  { key: "g2s18", label: "gấp 2 See 18F" },
  // Rex chần
  { key: "g2r07", label: "gấp 2 Rex 7F" },
  { key: "g2r09", label: "gấp 2 Rex 9F" },
  { key: "g2r12", label: "gấp 2 Rex 12F" },
  // MIX chần
  { key: "g2m07", label: "gấp 2 MIX 7F" },
  { key: "g2m09", label: "gấp 2 MIX 9F" },
  { key: "g2m14", label: "gấp 2 MIX 14F" },
  { key: "g2m18", label: "gấp 2 MIX 18F" },
];

export function filterProductSuggestions(input) {
  if (!input) return PRODUCT_SUGGESTIONS;

  const q = normalize(input);

  return PRODUCT_SUGGESTIONS.filter(
    (item) =>
      normalize(item.key).includes(q) || normalize(item.label).includes(q)
  );
}
