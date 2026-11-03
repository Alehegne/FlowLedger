package com.example.flowLedger_backend.identity;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;

@RestController 
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping ("/api/identity")
public class IdentityController {
    
    @PostMapping("/register")
    public String register() {
        return "Registration successful!";
    }

    @GetMapping("/me")
    public String getCurrentUser() {
        return "Current user information";
    }

}
