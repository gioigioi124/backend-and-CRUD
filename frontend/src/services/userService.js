import api from "./api";

export const userService = {
  // Lấy danh sách tất cả người dùng (Admin chỉ định)
  getUsers: async () => {
    const response = await api.get("/api/users");
    return response.data;
  },

  // Lấy danh sách nhân viên (Id và Tên) cho dropdown
  getStaffList: async () => {
    const response = await api.get("/api/users/staff-list");
    return response.data;
  },

  // Tạo người dùng mới
  createUser: async (userData) => {
    const response = await api.post("/api/users", userData);
    return response.data;
  },

  // Cập nhật người dùng
  updateUser: async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },

  // Xóa người dùng
  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
};
