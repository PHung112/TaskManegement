package trandinhphihung_project.Task.Manegement.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import trandinhphihung_project.Task.Manegement.entity.User;
import trandinhphihung_project.Task.Manegement.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Tạo user mới
    public User createUser(String username, String email, String password) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
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
        if (password != null) user.setPassword(passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    // Tìm kiếm user theo username
    public List<User> searchByUsername(String keyword) {
        return userRepository.findByUsernameContainingIgnoreCase(keyword);
    }

    // Xóa user
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public User login(String username, String password){
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Tên đăng nhập hoặc Mật khẩu không chính xác!"));
        if(!passwordEncoder.matches(password, user.getPassword())){
            throw new RuntimeException("Tên đăng nhập hoặc Mật khẩu không chính xác!");
        }
        return user;
    }
}

