package trandinhphihung_project.Task.Manegement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import trandinhphihung_project.Task.Manegement.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
