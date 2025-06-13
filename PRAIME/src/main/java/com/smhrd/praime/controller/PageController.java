package com.smhrd.praime.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {
	
	// 메인페이지 이동
	@GetMapping(value = "/")
	public String mainPage() {
		return "login";
	}
	
	// 로그인 페이지 이동
	@GetMapping(value = "/loginPage")
	public String loginPage() {
		return "login";
	}	
	
	// 유저 메인페이지 이동
	@GetMapping(value = "/userMainPage")
	public String userMainPage() {
		return "user_main";
	}


	
	// 회원가입 유형선택 페이지 이동
	@GetMapping(value = "/roleChoicePage")
	public String roleChoicePage() {
		return "role_choice";
	}	
	
	// 회원가입 페이지 이동
	@GetMapping(value = "/joinUserPage")
	public String joinPage() {
		return "join_user";
	}	
	
}
