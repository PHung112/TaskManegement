package trandinhphihung_project.Task.Manegement.service;

import org.springframework.stereotype.Service;
import trandinhphihung_project.Task.Manegement.dto.ProjectMemberDTO;
import trandinhphihung_project.Task.Manegement.entity.Project;
import trandinhphihung_project.Task.Manegement.entity.ProjectMember;
import trandinhphihung_project.Task.Manegement.entity.Role;
import trandinhphihung_project.Task.Manegement.entity.User;
import trandinhphihung_project.Task.Manegement.repository.ProjectMemberRepository;
import trandinhphihung_project.Task.Manegement.repository.ProjectRepository;
import trandinhphihung_project.Task.Manegement.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, ProjectMemberRepository projectMemberRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
    }

    // Tạo project mới
    public Project createProject(String name, String description, Long creatorId) {
        User creator = userRepository.findById(creatorId).orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setCreatedBy(creator);
        Project saved = projectRepository.save(project);

        // Creator là ADMIN
        ProjectMember pm = new ProjectMember();
        pm.setProject(saved);
        pm.setUser(creator);
        pm.setRole(Role.ADMIN);

        projectMemberRepository.save(pm);

        return saved;
    }

    // Lấy tất cả projects
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    // Lấy projects mà user đang là thành viên
    public List<Project> getProjectsByUserId(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return projectMemberRepository.findByUser(user)
                .stream()
                .map(ProjectMember::getProject)
                .collect(Collectors.toList());
    }

    // Kiểm tra user có là thành viên của project không
    public boolean isMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        if (project == null || user == null) return false;
        return projectMemberRepository.findByProjectAndUser(project, user).isPresent();
    }

    // Lấy project theo ID
    public Project getProjectById(Long id) {
        return projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
    }

    // Cập nhật project
    public Project updateProject(Long id, String name, String description) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));

        if (name != null) {
            project.setName(name);
        }
        if (description != null) {
            project.setDescription(description);
        }

        return projectRepository.save(project);
    }

    // Xóa project
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        projectRepository.delete(project);
    }

    // Lấy danh sách members của project
    public List<ProjectMember> getProjectMembers(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        return projectMemberRepository.findByProject(project);
    }

    // Lấy danh sách members của project (DTO gọn gàng)
    public List<ProjectMemberDTO> getProjectMembersDTO(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        List<ProjectMember> members = projectMemberRepository.findByProject(project);

        return members.stream()
                .map(pm -> new ProjectMemberDTO(
                        pm.getId(),
                        pm.getUser().getId(),
                        pm.getUser().getUsername(),
                        pm.getUser().getEmail(),
                        pm.getRole().name()
                ))
                .collect(Collectors.toList());
    }

    // Mời thành viên vào project
    public ProjectMember inviteMember(Long projectId, Long userId, String roleStr) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Kiểm tra member đã tồn tại chưa
        if (projectMemberRepository.findByProjectAndUser(project, user).isPresent()) {
            throw new RuntimeException("User is already a member of this project");
        }

        Role role = Role.valueOf(roleStr.toUpperCase());

        ProjectMember pm = new ProjectMember();
        pm.setProject(project);
        pm.setUser(user);
        pm.setRole(role);

        return projectMemberRepository.save(pm);
    }

    // Xóa member khỏi project
    public void removeMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        ProjectMember pm = projectMemberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new RuntimeException("Member not found in this project"));

        projectMemberRepository.delete(pm);
    }

    // Thay đổi role của member
    public ProjectMember updateMemberRole(Long projectId, Long userId, String roleStr) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        ProjectMember pm = projectMemberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new RuntimeException("Member not found in this project"));

        Role role = Role.valueOf(roleStr.toUpperCase());
        pm.setRole(role);

        return projectMemberRepository.save(pm);
    }
}
