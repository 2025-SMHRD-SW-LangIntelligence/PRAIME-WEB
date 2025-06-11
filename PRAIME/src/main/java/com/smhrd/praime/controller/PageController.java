package com.smhrd.praime.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {
	
	// 메인페이지 이동
	@GetMapping(value = "/")
	public String mainPage() {
		return "main";
	}
	
	// 회원가입 페이지 이동
	@GetMapping(value = "/join")
	public String joinPage() {
		return "join";
	}	
	
}
