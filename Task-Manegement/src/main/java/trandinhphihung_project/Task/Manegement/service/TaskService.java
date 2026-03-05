package trandinhphihung_project.Task.Manegement.service;

import org.springframework.stereotype.Service;
import trandinhphihung_project.Task.Manegement.dto.TaskDTO;
import trandinhphihung_project.Task.Manegement.entity.*;
import trandinhphihung_project.Task.Manegement.repository.TaskRepository;
import trandinhphihung_project.Task.Manegement.repository.ProjectRepository;
import trandinhphihung_project.Task.Manegement.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    // Tạo task mới
    public Task createTask(Long projectId, Long assignedToId, String title, String description, LocalDate deadline) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        User assignedTo = userRepository.findById(assignedToId).orElseThrow(() -> new RuntimeException("User not found"));

        Task task = new Task();
        task.setProject(project);
        task.setAssignedTo(assignedTo);
        task.setTitle(title);
        task.setDescription(description);
        task.setDeadline(deadline);
        task.setStatus(TaskStatus.ASSIGNED);

        return taskRepository.save(task);
    }

    // Lấy task theo ID
    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
    }

    // Lấy tất cả task
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Lấy tasks theo project
    public List<Task> getTasksByProject(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        return taskRepository.findByProject(project);
    }

    // Lấy tasks theo user
    public List<Task> getTasksByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return taskRepository.findByAssignedTo(user);
    }

    // Cập nhật task
    public Task updateTask(Long id, String title, String description, LocalDate deadline) {
        Task task = getTaskById(id);
        if (title != null) task.setTitle(title);
        if (description != null) task.setDescription(description);
        if (deadline != null) task.setDeadline(deadline);
        return taskRepository.save(task);
    }

    // Xóa task
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    // Member nhận task (chuyển sang IN_PROGRESS)
    public Task acceptTask(Long taskId, Long memberId) {
        Task task = getTaskById(taskId);

        if (!task.getAssignedTo().getId().equals(memberId)) {
            throw new RuntimeException("Member is not assigned to this task");
        }

        task.setStatus(TaskStatus.IN_PROGRESS);
        return taskRepository.save(task);
    }

    // Member nộp task (chuyển sang SUBMITTED)
    public Task submitTask(Long taskId, Long memberId) {
        Task task = getTaskById(taskId);

        if (!task.getAssignedTo().getId().equals(memberId)) {
            throw new RuntimeException("Member is not assigned to this task");
        }

        task.setStatus(TaskStatus.SUBMITTED);
        return taskRepository.save(task);
    }

    // Helper method: Convert Task sang TaskDTO
    private TaskDTO convertToDTO(Task task) {
        return new TaskDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDeadline() != null ? task.getDeadline().toString() : null,
                task.getStatus().name(),
                task.getProject().getId(),
                task.getProject().getName(),
                task.getAssignedTo().getId(),
                task.getAssignedTo().getUsername(),
                task.getAssignedTo().getEmail()
        );
    }

    // Tạo task mới - trả về DTO
    public TaskDTO createTaskDTO(Long projectId, Long assignedToId, String title, String description, LocalDate deadline) {
        Task task = createTask(projectId, assignedToId, title, description, deadline);
        return convertToDTO(task);
    }

    // Lấy task theo ID - trả về DTO
    public TaskDTO getTaskByIdDTO(Long id) {
        Task task = getTaskById(id);
        return convertToDTO(task);
    }

    // Lấy tất cả tasks - trả về DTO
    public List<TaskDTO> getAllTasksDTO() {
        return taskRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy tasks theo project - trả về DTO
    public List<TaskDTO> getTasksByProjectDTO(Long projectId) {
        return getTasksByProject(projectId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy tasks theo user - trả về DTO
    public List<TaskDTO> getTasksByUserDTO(Long userId) {
        return getTasksByUser(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Cập nhật task - trả về DTO
    public TaskDTO updateTaskDTO(Long id, String title, String description, LocalDate deadline) {
        Task task = updateTask(id, title, description, deadline);
        return convertToDTO(task);
    }

    // Member nhận task - trả về DTO
    public TaskDTO acceptTaskDTO(Long taskId, Long memberId) {
        Task task = acceptTask(taskId, memberId);
        return convertToDTO(task);
    }

    // Member nộp task - trả về DTO
    public TaskDTO submitTaskDTO(Long taskId, Long memberId) {
        Task task = submitTask(taskId, memberId);
        return convertToDTO(task);
    }
}

