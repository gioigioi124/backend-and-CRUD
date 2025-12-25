import api from "./api";

export const orderService = {
  // Lấy tất cả đơn hàng
  getAllOrders: async () => {
    const response = await api.get("/orders");
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
};
