package com.example.flowLedger_backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class Controller {

    @GetMapping("/public/hello")
    public String publicHello() {
        return "Hello from the public endpoint!";
    }

    @GetMapping("/private/secret")
    public String privateHello() {
        return "Hello Private";
    }
}
