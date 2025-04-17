package com.example.moodmunch.service;

import com.example.moodmunch.model.User;
import com.example.moodmunch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String register(User user) {
        if (userRepository.existsById(user.getUsername())) {
            return "Username exists";
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        userRepository.save(user);
        return "Registered successfully";
    }

    public String login(String username, String password) {
        User user = userRepository.findById(username).orElse(null);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return "Login successful";
        }
        return "Invalid credentials";
    }

    public User getProfile(String username) {
        return userRepository.findById(username).orElse(null);
    }
}