import http from "./axiosConfig";

const taskApi = {
  createTask: (data) => http.post("/api/tasks", data),
  getTaskById: (id) => http.get(`/api/tasks/${id}`),
  getAllTasks: () => http.get("/api/tasks"),
  getTasksByProject: (projectId) => http.get(`/api/tasks/project/${projectId}`),
  getTasksByUser: (userId) => http.get(`/api/tasks/user/${userId}`),
  updateTask: (id, data) => http.put(`/api/tasks/${id}`, data),
  deleteTask: (id) => http.delete(`/api/tasks/${id}`),
  acceptTask: (taskId, memberId) => http.post(`/api/tasks/${taskId}/accept`, null, { params: { memberId } }),
  submitTask: (taskId, memberId) => http.post(`/api/tasks/${taskId}/submit`, null, { params: { memberId } }),
};

export default taskApi;
