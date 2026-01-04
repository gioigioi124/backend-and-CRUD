import api from "./api";

const CUSTOMER_API_URL = "/api/customers";

// Upload Excel file with customers
export const uploadCustomers = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`${CUSTOMER_API_URL}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Search customers by name
export const searchCustomers = async (query) => {
  const response = await api.get(`${CUSTOMER_API_URL}/search`, {
    params: { q: query },
  });

  return response.data;
};

// Get all customers with pagination
export const getAllCustomers = async (page = 1, limit = 50) => {
  const response = await api.get(CUSTOMER_API_URL, {
    params: { page, limit },
  });

  return response.data;
};

// Delete customer
export const deleteCustomer = async (id) => {
  const response = await api.delete(`${CUSTOMER_API_URL}/${id}`);

  return response.data;
};

const customerService = {
  uploadCustomers,
  searchCustomers,
  getAllCustomers,
  deleteCustomer,
};

export default customerService;
