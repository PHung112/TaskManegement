package trandinhphihung_project.Task.Manegement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import trandinhphihung_project.Task.Manegement.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
