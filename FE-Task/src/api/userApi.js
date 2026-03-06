import axios from "axios";

// 1. Tạo "trạm trung chuyển" axios
// Nhờ cấu hình ở vite.config.js, m chỉ cần viết '/api' là nó tự hiểu tới localhost:8080
const api = axios.create({
  baseURL: "/api/users", // Địa chỉ này phải khớp với @RequestMapping("/api/users") bên Java
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Định nghĩa các "đầu mối" liên lạc với Backend
const userApi = {
  // Lấy danh sách tất cả user
  getAllUsers: () => {
    return api.get("");
  },

  // Tìm 1 user theo ID (Ví dụ: /api/users/1)
  getUserById: (id) => {
    return api.get(`/${id}`);
  },

  // Gửi dữ liệu user mới lên để BE lưu vào Database
  createUser: (userData) => {
    return api.post("/", userData); // userData là object {username, email, password}
  },

  // Cập nhật thông tin user
  updateUser: (id, userData) => {
    return api.put(`/${id}`, userData);
  },

  // Xóa user khỏi hệ thống
  deleteUser: (id) => {
    return api.delete(`/${id}`);
  },
};

export default userApi;
