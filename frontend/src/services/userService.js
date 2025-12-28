import api from "./api";

export const userService = {
  // Lấy danh sách tất cả người dùng (Admin chỉ định)
  getUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  // Lấy danh sách nhân viên (Id và Tên) cho dropdown
  getStaffList: async () => {
    const response = await api.get("/users/staff-list");
    return response.data;
  },

  // Tạo người dùng mới
  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // Cập nhật người dùng
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Xóa người dùng
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
