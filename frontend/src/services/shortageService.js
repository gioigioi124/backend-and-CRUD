import api from "./api";

export const shortageService = {
  // Lấy danh sách thiếu hàng còn lại
  getRemainingShortages: async (params = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {})
    ).toString();

    const url = queryString
      ? `/api/shortages/remaining?${queryString}`
      : "/api/shortages/remaining";
    const response = await api.get(url);
    return response.data;
  },

  // Tạo đơn bù hàng
  createCompensationOrder: async (orderData) => {
    const response = await api.post("/api/shortages/compensate", orderData);
    return response.data;
  },

  // Bỏ qua thiếu hàng
  ignoreShortage: async (orderId, itemId) => {
    const response = await api.put("/api/shortages/ignore", {
      orderId,
      itemId,
    });
    return response.data;
  },
};
