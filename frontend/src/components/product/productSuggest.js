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

  // Đệm thẳng không chần - Alias
  { key: "tkca05", label: "Đệm thẳng không chần Alias 5F" },
  { key: "tkca07", label: "Đệm thẳng không chần Alias 7F" },
  { key: "tkca09", label: "Đệm thẳng không chần Alias 9F" },
  { key: "tkca14", label: "Đệm thẳng không chần Alias 14F" },
  { key: "tkca18", label: "Đệm thẳng không chần Alias 18F" },

  // Đệm thẳng không chần - Vimatt
  { key: "tkcb05", label: "Đệm thẳng không chần Vimatt 5F" },
  { key: "tkcb07", label: "Đệm thẳng không chần Vimatt 7F" },
  { key: "tkcb09", label: "Đệm thẳng không chần Vimatt 9F" },
  { key: "tkcb14", label: "Đệm thẳng không chần Vimatt 14F" },
  { key: "tkcb18", label: "Đệm thẳng không chần Vimatt 18F" },

  // Đệm thẳng không chần - See
  { key: "tkcs05", label: "Đệm thẳng không chần See 5F" },
  { key: "tkcs07", label: "Đệm thẳng không chần See 7F" },
  { key: "tkcs09", label: "Đệm thẳng không chần See 9F" },
  { key: "tkcs14", label: "Đệm thẳng không chần See 14F" },
  { key: "tkcs18", label: "Đệm thẳng không chần See 18F" },

  // Đệm thẳng không chần - Fly
  { key: "tkcf05", label: "Đệm thẳng không chần Fly 5F" },
  { key: "tkcf07", label: "Đệm thẳng không chần Fly 7F" },
  { key: "tkcf09", label: "Đệm thẳng không chần Fly 9F" },
  { key: "tkcf14", label: "Đệm thẳng không chần Fly 14F" },
  { key: "tkcf18", label: "Đệm thẳng không chần Fly 18F" },

  // Đệm thẳng không chần - Rex
  { key: "tkcr05", label: "Đệm thẳng không chần Rex 5F" },
  { key: "tkcr07", label: "Đệm thẳng không chần Rex 7F" },
  { key: "tkcr09", label: "Đệm thẳng không chần Rex 9F" },
  { key: "tkcr14", label: "Đệm thẳng không chần Rex 14F" },
  { key: "tkcr18", label: "Đệm thẳng không chần Rex 18F" },

  // Đệm gấp 2 không chần - Alias
  { key: "g2kca05", label: "Đệm gấp 2 không chần Alias 5F" },
  { key: "g2kca07", label: "Đệm gấp 2 không chần Alias 7F" },
  { key: "g2kca09", label: "Đệm gấp 2 không chần Alias 9F" },
  { key: "g2kca14", label: "Đệm gấp 2 không chần Alias 14F" },
  { key: "g2kca18", label: "Đệm gấp 2 không chần Alias 18F" },

  // Đệm gấp 2 không chần - Vimatt
  { key: "g2kcb05", label: "Đệm gấp 2 không chần Vimatt 5F" },
  { key: "g2kcb07", label: "Đệm gấp 2 không chần Vimatt 7F" },
  { key: "g2kcb09", label: "Đệm gấp 2 không chần Vimatt 9F" },
  { key: "g2kcb14", label: "Đệm gấp 2 không chần Vimatt 14F" },
  { key: "g2kcb18", label: "Đệm gấp 2 không chần Vimatt 18F" },

  // Đệm gấp 2 không chần - See
  { key: "g2kcs05", label: "Đệm gấp 2 không chần See 5F" },
  { key: "g2kcs07", label: "Đệm gấp 2 không chần See 7F" },
  { key: "g2kcs09", label: "Đệm gấp 2 không chần See 9F" },
  { key: "g2kcs14", label: "Đệm gấp 2 không chần See 14F" },
  { key: "g2kcs18", label: "Đệm gấp 2 không chần See 18F" },

  // Đệm gấp 2 không chần - Fly
  { key: "g2kcf05", label: "Đệm gấp 2 không chần Fly 5F" },
  { key: "g2kcf07", label: "Đệm gấp 2 không chần Fly 7F" },
  { key: "g2kcf09", label: "Đệm gấp 2 không chần Fly 9F" },
  { key: "g2kcf14", label: "Đệm gấp 2 không chần Fly 14F" },
  { key: "g2kcf18", label: "Đệm gấp 2 không chần Fly 18F" },

  // Đệm gấp 2 không chần - Rex
  { key: "g2kcr05", label: "Đệm gấp 2 không chần Rex 5F" },
  { key: "g2kcr07", label: "Đệm gấp 2 không chần Rex 7F" },
  { key: "g2kcr09", label: "Đệm gấp 2 không chần Rex 9F" },
  { key: "g2kcr14", label: "Đệm gấp 2 không chần Rex 14F" },
  { key: "g2kcr18", label: "Đệm gấp 2 không chần Rex 18F" },

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
