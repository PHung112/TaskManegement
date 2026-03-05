package trandinhphihung_project.Task.Manegement.controller;

import org.springframework.web.bind.annotation.*;
import trandinhphihung_project.Task.Manegement.dto.TaskDTO;
import trandinhphihung_project.Task.Manegement.service.TaskService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // Tạo task mới - nhận JSON (response DTO)
    @PostMapping
    public TaskDTO createTask(@RequestBody CreateTaskRequest request) {
        return taskService.createTaskDTO(request.projectId, request.assignedToId, request.title, request.description, request.deadline);
    }

    // Lấy task theo ID (response DTO)
    @GetMapping("/{id}")
    public TaskDTO getTaskById(@PathVariable Long id) {
        return taskService.getTaskByIdDTO(id);
    }

    // Lấy tất cả tasks (response DTO)
    @GetMapping
    public List<TaskDTO> getAllTasks() {
        return taskService.getAllTasksDTO();
    }

    // Lấy tasks theo project (response DTO)
    @GetMapping("/project/{projectId}")
    public List<TaskDTO> getTasksByProject(@PathVariable Long projectId) {
        return taskService.getTasksByProjectDTO(projectId);
    }

    // Lấy tasks theo user (response DTO)
    @GetMapping("/user/{userId}")
    public List<TaskDTO> getTasksByUser(@PathVariable Long userId) {
        return taskService.getTasksByUserDTO(userId);
    }

    // Cập nhật task (response DTO)
    @PutMapping("/{id}")
    public TaskDTO updateTask(@PathVariable Long id, @RequestBody UpdateTaskRequest request) {
        return taskService.updateTaskDTO(id, request.title, request.description, request.deadline);
    }

    // Xóa task
    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    // Member nhận task (response DTO)
    @PostMapping("/{taskId}/accept")
    public TaskDTO acceptTask(
            @PathVariable Long taskId,
            @RequestParam Long memberId
    ) {
        return taskService.acceptTaskDTO(taskId, memberId);
    }

    // Member nộp task (response DTO)
    @PostMapping("/{taskId}/submit")
    public TaskDTO submitTask(
            @PathVariable Long taskId,
            @RequestParam Long memberId
    ) {
        return taskService.submitTaskDTO(taskId, memberId);
    }

    // DTO classes
    public static class CreateTaskRequest {
        public Long projectId;
        public Long assignedToId;
        public String title;
        public String description;
        public LocalDate deadline;
    }

    public static class UpdateTaskRequest {
        public String title;
        public String description;
        public LocalDate deadline;
    }
}
