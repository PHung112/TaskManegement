package trandinhphihung_project.Task.Manegement.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trandinhphihung_project.Task.Manegement.dto.ProjectMemberDTO;
import trandinhphihung_project.Task.Manegement.entity.Project;
import trandinhphihung_project.Task.Manegement.entity.ProjectMember;
import trandinhphihung_project.Task.Manegement.security.JwtUtil;
import trandinhphihung_project.Task.Manegement.service.ProjectService;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final JwtUtil jwtUtil;

    public ProjectController(ProjectService projectService, JwtUtil jwtUtil) {
        this.projectService = projectService;
        this.jwtUtil = jwtUtil;
    }

    // Lấy userId từ JWT trong request header
    private Long getCurrentUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized");
        }
        return jwtUtil.extractUserId(header.substring(7));
    }

    // Tạo project mới — creator lấy từ token, không cần truyền creatorId
    @PostMapping
    public Project createProject(@RequestBody CreateProjectRequest request, HttpServletRequest httpRequest) {
        Long userId = getCurrentUserId(httpRequest);
        return projectService.createProject(request.name, request.description, userId);
    }

    // Lấy projects của user hiện tại (chỉ projects mà user là thành viên)
    @GetMapping("/my")
    public List<Project> getMyProjects(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return projectService.getProjectsByUserId(userId);
    }

    // Lấy project theo ID — chỉ thành viên của project mới xem được
    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        if (!projectService.isMember(id, userId)) {
            return ResponseEntity.status(403).body("Bạn không có quyền truy cập project này");
        }
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    // Cập nhật project — chỉ thành viên của project
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody UpdateProjectRequest request,
                                           HttpServletRequest httpRequest) {
        Long userId = getCurrentUserId(httpRequest);
        if (!projectService.isMember(id, userId)) {
            return ResponseEntity.status(403).body("Bạn không có quyền chỉnh sửa project này");
        }
        return ResponseEntity.ok(projectService.updateProject(id, request.name, request.description));
    }

    // Xóa project — chỉ thành viên của project
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        if (!projectService.isMember(id, userId)) {
            return ResponseEntity.status(403).body("Bạn không có quyền xóa project này");
        }
        projectService.deleteProject(id);
        return ResponseEntity.ok().build();
    }

    // Lấy danh sách members của project — chỉ thành viên mới xem được
    @GetMapping("/{projectId}/members")
    public ResponseEntity<?> getProjectMembers(@PathVariable Long projectId, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        if (!projectService.isMember(projectId, userId)) {
            return ResponseEntity.status(403).body("Bạn không có quyền truy cập project này");
        }
        return ResponseEntity.ok(projectService.getProjectMembersDTO(projectId));
    }

    // Mời thành viên vào project — chỉ thành viên hiện tại
    @PostMapping("/{projectId}/invite")
    public ResponseEntity<?> inviteMember(@PathVariable Long projectId,
                                          @RequestBody InviteMemberRequest request,
                                          HttpServletRequest httpRequest) {
        Long userId = getCurrentUserId(httpRequest);
        if (!projectService.isMember(projectId, userId)) {
            return ResponseEntity.status(403).body("Bạn không có quyền mời thành viên");
        }
        return ResponseEntity.ok(projectService.inviteMember(projectId, request.userId, request.role));
    }

    // Xóa member khỏi project — chỉ thành viên hiện tại
    @DeleteMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<?> removeMember(@PathVariable Long projectId, @PathVariable Long memberId,
                                          HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        if (!projectService.isMember(projectId, userId)) {
            return ResponseEntity.status(403).body("Bạn không có quyền xóa thành viên");
        }
        projectService.removeMember(projectId, memberId);
        return ResponseEntity.ok().build();
    }

    // Thay đổi role của member — chỉ thành viên hiện tại
    @PutMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<?> updateMemberRole(@PathVariable Long projectId, @PathVariable Long memberId,
                                              @RequestBody UpdateMemberRoleRequest request,
                                              HttpServletRequest httpRequest) {
        Long userId = getCurrentUserId(httpRequest);
        if (!projectService.isMember(projectId, userId)) {
            return ResponseEntity.status(403).body("Bạn không có quyền đổi vai trò");
        }
        return ResponseEntity.ok(projectService.updateMemberRole(projectId, memberId, request.role));
    }

    // DTO classes
    public static class CreateProjectRequest {
        public String name;
        public String description;
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