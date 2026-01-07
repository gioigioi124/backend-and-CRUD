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
  { key: "g3c05", label: "gấp 3 See 5F" },
  { key: "g3c07", label: "gấp 3 See 7F" },
  { key: "g3c09", label: "gấp 3 See 9F" },
  { key: "g3c14", label: "gấp 3 See 14F" },
  { key: "g3c18", label: "gấp 3 See 18F" },

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
];

export function filterProductSuggestions(input) {
  if (!input) return PRODUCT_SUGGESTIONS;

  const q = normalize(input);

  return PRODUCT_SUGGESTIONS.filter(
    (item) =>
      normalize(item.key).includes(q) || normalize(item.label).includes(q)
  );
}
