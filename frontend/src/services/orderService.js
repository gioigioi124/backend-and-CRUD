import api from "./api";

export const orderService = {
  // Lấy tất cả đơn hàng (hỗ trợ filter và search)
  getAllOrders: async (params = {}) => {
    // Tạo query string từ params object
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {})
    ).toString();

    const url = queryString ? `/orders?${queryString}` : "/orders";
    const response = await api.get(url);
    return response.data;
  },

  // Lấy 1 đơn hàng theo ID
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  // Cập nhật đơn hàng
  updateOrder: async (id, orderData) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },

  // Xóa đơn hàng
  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  // Lấy đơn hàng theo xe
  getOrdersByVehicle: async (vehicleId) => {
    const response = await api.get(`/orders?vehicle=${vehicleId}`);
    return response.data;
  },

  // Gán đơn hàng vào xe
  assignOrder: async (orderId, vehicleId) => {
    const response = await api.put(`/orders/${orderId}/assign`, {
      vehicleId: vehicleId,
    });
    return response.data;
  },

  // Bỏ gán đơn hàng khỏi xe
  unassignOrder: async (orderId) => {
    const response = await api.put(`/orders/${orderId}/assign`, {
      vehicleId: null,
    });
    return response.data;
  },
};
