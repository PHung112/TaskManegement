package trandinhphihung_project.Task.Manegement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trandinhphihung_project.Task.Manegement.entity.User;
import trandinhphihung_project.Task.Manegement.security.JwtUtil;
import trandinhphihung_project.Task.Manegement.service.UserService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.createUser(request.username, request.email, request.password);
            String token = jwtUtil.generateToken(user.getId(), user.getUsername());
            return ResponseEntity.ok(Map.of(
                "token",    token,
                "id",       user.getId(),
                "username", user.getUsername(),
                "email",    user.getEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username hoặc email đã tồn tại"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.login(request.username, request.password);
            String token = jwtUtil.generateToken(user.getId(), user.getUsername());
            return ResponseEntity.ok(Map.of(
                "token",    token,
                "id",       user.getId(),
                "username", user.getUsername(),
                "email",    user.getEmail()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    public static class LoginRequest {
        public String username;
        public String password;
    }

    public static class RegisterRequest {
        public String username;
        public String email;
        public String password;
    }
}
