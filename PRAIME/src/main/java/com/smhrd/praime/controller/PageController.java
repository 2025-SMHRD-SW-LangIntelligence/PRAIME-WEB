package com.smhrd.praime.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
	
	// 메인페이지 이동
	@GetMapping(value = "/")
	public String mainPage() {
		return "main";
	}	
	
}
