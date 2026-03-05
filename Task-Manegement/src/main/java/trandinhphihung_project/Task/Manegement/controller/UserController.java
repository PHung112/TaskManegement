package trandinhphihung_project.Task.Manegement.controller;

import org.springframework.web.bind.annotation.*;
import trandinhphihung_project.Task.Manegement.entity.User;
import trandinhphihung_project.Task.Manegement.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Tạo user mới - nhận JSON từ body
    @PostMapping
    public User createUser(@RequestBody CreateUserRequest request) {
        return userService.createUser(request.username, request.email, request.password);
    }

    // Lấy user theo ID
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // Lấy tất cả user
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Cập nhật user - nhận JSON từ body
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return userService.updateUser(id, request.username, request.email, request.password);
    }

    // Xóa user
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    // DTO classes
    public static class CreateUserRequest {
        public String username;
        public String email;
        public String password;
    }

    public static class UpdateUserRequest {
        public String username;
        public String email;
        public String password;
    }
}

