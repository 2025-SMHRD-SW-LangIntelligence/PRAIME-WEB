package com.example.praime.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
	
	// 인덱스 페이지 이동	
    @GetMapping("/")
    public String home() {
        return "home";
    }
}