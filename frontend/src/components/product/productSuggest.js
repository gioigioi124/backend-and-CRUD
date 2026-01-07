// product/productSuggest.js

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const PRODUCT_SUGGESTIONS = [
  { key: "g3a05", label: "gấp 3 Alias 5F" },
  { key: "g3a07", label: "gấp 3 Alias 7F" },
  { key: "g3b05", label: "gấp 3 Vimatt 5F" },
];

export function filterProductSuggestions(input) {
  if (!input) return PRODUCT_SUGGESTIONS;

  const q = normalize(input);

  return PRODUCT_SUGGESTIONS.filter(
    (item) =>
      normalize(item.key).includes(q) || normalize(item.label).includes(q)
  );
}
