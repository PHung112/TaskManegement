package trandinhphihung_project.Task.Manegement.service;

import org.springframework.stereotype.Service;
import trandinhphihung_project.Task.Manegement.dto.NotificationDTO;
import trandinhphihung_project.Task.Manegement.entity.*;
import trandinhphihung_project.Task.Manegement.repository.*;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public NotificationService(NotificationRepository notificationRepository,
                                UserRepository userRepository,
                                ProjectRepository projectRepository,
                                ProjectMemberRepository projectMemberRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
    }

    // ── Gửi lời mời ──────────────────────────────────────────────────────────
    public void createInviteNotification(Long projectId, Long senderId, Long recipientId, String roleStr) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        if (projectMemberRepository.findByProjectAndUser(project, recipient).isPresent()) {
            throw new RuntimeException("Người dùng đã là thành viên của project này");
        }

        if (notificationRepository.findByRecipientAndProjectIdAndTypeAndStatus(
                recipient, projectId, NotificationType.INVITE, NotificationStatus.PENDING).isPresent()) {
            throw new RuntimeException("Đã có lời mời đang chờ xử lý cho người dùng này");
        }

        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setSender(sender);
        n.setMessage("Bạn được mời vào project \"" + project.getName() + "\" bởi " + sender.getUsername());
        n.setType(NotificationType.INVITE);
        n.setProjectId(projectId);
        n.setProjectName(project.getName());
        n.setInviteRole(roleStr.toUpperCase());
        n.setStatus(NotificationStatus.PENDING);
        n.setRead(false);
        notificationRepository.save(n);
    }

    // ── Chấp nhận lời mời ────────────────────────────────────────────────────
    public void acceptInvite(Long notificationId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Thông báo không tồn tại"));

        if (!n.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền xử lý thông báo này");
        }
        if (n.getType() != NotificationType.INVITE) {
            throw new RuntimeException("Đây không phải lời mời");
        }
        if (n.getStatus() != NotificationStatus.PENDING) {
            throw new RuntimeException("Lời mời này đã được xử lý");
        }

        Project project = projectRepository.findById(n.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project không còn tồn tại"));

        // Thêm user vào project (kiểm tra race condition)
        if (projectMemberRepository.findByProjectAndUser(project, user).isEmpty()) {
            ProjectMember pm = new ProjectMember();
            pm.setProject(project);
            pm.setUser(user);
            pm.setRole(Role.valueOf(n.getInviteRole()));
            projectMemberRepository.save(pm);
        }

        // Đánh dấu lời mời đã được chấp nhận
        n.setStatus(NotificationStatus.ACCEPTED);
        n.setRead(true);
        notificationRepository.save(n);

        // Gửi thông báo cho người mời
        if (n.getSender() != null) {
            Notification joinNotif = new Notification();
            joinNotif.setRecipient(n.getSender());
            joinNotif.setSender(user);
            joinNotif.setMessage(user.getUsername() + " đã tham gia vào project \"" + project.getName() + "\"");
            joinNotif.setType(NotificationType.JOIN);
            joinNotif.setProjectId(project.getId());
            joinNotif.setProjectName(project.getName());
            joinNotif.setRead(false);
            notificationRepository.save(joinNotif);
        }
    }

    // ── Từ chối lời mời ──────────────────────────────────────────────────────
    public void declineInvite(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Thông báo không tồn tại"));

        if (!n.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền xử lý thông báo này");
        }
        if (n.getType() != NotificationType.INVITE || n.getStatus() != NotificationStatus.PENDING) {
            throw new RuntimeException("Không thể từ chối thông báo này");
        }

        n.setStatus(NotificationStatus.DECLINED);
        n.setRead(true);
        notificationRepository.save(n);
    }

    // ── Lấy thông báo của tôi ────────────────────────────────────────────────
    public List<NotificationDTO> getMyNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // ── Đánh dấu đã đọc ──────────────────────────────────────────────────────
    public void markAsRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Thông báo không tồn tại"));
        if (!n.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền thao tác");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    // ── Đếm chưa đọc ─────────────────────────────────────────────────────────
    public long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByRecipientAndReadFalse(user);
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private NotificationDTO convertToDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setSenderUsername(n.getSender() != null ? n.getSender().getUsername() : null);
        dto.setMessage(n.getMessage());
        dto.setType(n.getType().name());
        dto.setProjectId(n.getProjectId());
        dto.setProjectName(n.getProjectName());
        dto.setInviteRole(n.getInviteRole());
        dto.setStatus(n.getStatus() != null ? n.getStatus().name() : null);
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null);
        return dto;
    }
}
