import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // URL backend của bạn
  headers: {
    "Content-Type": "application/json", //axios tự xử lý gửi dữ liệu dạng JSON, có thể bỏ nhưng dòng này giúp rõ ràng hơn
  },
});

export default api;
