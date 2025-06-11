package com.example.praime.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {
	
	// 메인페이지
	@GetMapping(value = "/")
	public String home() {
		return "main";
	}
	
}
