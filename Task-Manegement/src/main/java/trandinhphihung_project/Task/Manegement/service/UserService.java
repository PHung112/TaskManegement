package trandinhphihung_project.Task.Manegement.service;

import org.springframework.stereotype.Service;
import trandinhphihung_project.Task.Manegement.entity.User;
import trandinhphihung_project.Task.Manegement.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Tạo user mới
    public User createUser(String username, String email, String password) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        return userRepository.save(user);
    }

    // Lấy user theo ID
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Lấy tất cả user
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Cập nhật user
    public User updateUser(Long id, String username, String email, String password) {
        User user = getUserById(id);
        if (username != null) user.setUsername(username);
        if (email != null) user.setEmail(email);
        if (password != null) user.setPassword(password);
        return userRepository.save(user);
    }

    // Xóa user
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

