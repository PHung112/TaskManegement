package trandinhphihung_project.Task.Manegement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import trandinhphihung_project.Task.Manegement.entity.Notification;
import trandinhphihung_project.Task.Manegement.entity.NotificationStatus;
import trandinhphihung_project.Task.Manegement.entity.NotificationType;
import trandinhphihung_project.Task.Manegement.entity.User;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    long countByRecipientAndReadFalse(User recipient);
    Optional<Notification> findByRecipientAndProjectIdAndTypeAndStatus(
            User recipient, Long projectId, NotificationType type, NotificationStatus status);
}
