import api from "./api";

export const vehicleService = {
  //lấy thông tin tất cả các xe (hỗ trợ filter và search)
  getAllVehicles: async (params = {}) => {
    // Tạo query string từ params object
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {})
    ).toString();

    const url = queryString ? `/vehicles?${queryString}` : "/vehicles";
    const res = await api.get(url);
    return res.data;
  },
  //lấy thông tin 1 xe
  getVehicle: async (id) => {
    const res = await api.get(`/vehicles/${id}`);
    return res.data;
  },
  //tạo xe mới
  createVehicle: async (vehicleData) => {
    const res = await api.post("vehicles", vehicleData);
    return res.data;
  },
  //update xe
  updateVehicle: async (id, vehicleData) => {
    const res = await api.put(`vehicles/${id}`, vehicleData);
    return res.data;
  },
  //xóa xe
  deleteVehicle: async (id) => {
    const res = await api.delete(`/vehicles/${id}`);
    return res.data;
  },
};
