package com.example.flowLedger_backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/test/api/public/hello")
    public String publicHello() {
        return "Hello, public!";
    }

    @GetMapping("/test/api/private/secret")
    public String privateSecret() {
        return "Secret!";
    }
}