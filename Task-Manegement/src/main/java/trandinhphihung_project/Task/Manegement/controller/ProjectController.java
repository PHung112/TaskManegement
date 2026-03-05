package trandinhphihung_project.Task.Manegement.controller;

import org.springframework.web.bind.annotation.*;
import trandinhphihung_project.Task.Manegement.dto.ProjectMemberDTO;
import trandinhphihung_project.Task.Manegement.entity.Project;
import trandinhphihung_project.Task.Manegement.entity.ProjectMember;
import trandinhphihung_project.Task.Manegement.service.ProjectService;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // Tạo project mới - nhận JSON
    @PostMapping
    public Project createProject(@RequestBody CreateProjectRequest request) {
        return projectService.createProject(request.name, request.description, request.creatorId);
    }

    // Lấy tất cả projects
    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    // Lấy project theo ID
    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }

    // Cập nhật project - nhận JSON
    @PutMapping("/{id}")
    public Project updateProject(@PathVariable Long id, @RequestBody UpdateProjectRequest request) {
        return projectService.updateProject(id, request.name, request.description);
    }

    // Xóa project
    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
    }

    // Lấy danh sách members của project (response gọn gàng)
    @GetMapping("/{projectId}/members")
    public List<ProjectMemberDTO> getProjectMembers(@PathVariable Long projectId) {
        return projectService.getProjectMembersDTO(projectId);
    }

    // Mời thành viên vào project - nhận JSON
    @PostMapping("/{projectId}/invite")
    public ProjectMember inviteMember(
            @PathVariable Long projectId,
            @RequestBody InviteMemberRequest request
    ) {
        return projectService.inviteMember(projectId, request.userId, request.role);
    }

    // Xóa member khỏi project
    @DeleteMapping("/{projectId}/members/{userId}")
    public void removeMember(@PathVariable Long projectId, @PathVariable Long userId) {
        projectService.removeMember(projectId, userId);
    }

    // Thay đổi role của member - nhận JSON
    @PutMapping("/{projectId}/members/{userId}")
    public ProjectMember updateMemberRole(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @RequestBody UpdateMemberRoleRequest request
    ) {
        return projectService.updateMemberRole(projectId, userId, request.role);
    }

    // DTO classes
    public static class CreateProjectRequest {
        public String name;
        public String description;
        public Long creatorId;
    }

    public static class UpdateProjectRequest {
        public String name;
        public String description;
    }

    public static class InviteMemberRequest {
        public Long userId;
        public String role;
    }

    public static class UpdateMemberRoleRequest {
        public String role;
    }
}