package com.smhrd.praime.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class PageController {
	

	// ---------- 공용 ---------- //
	// 메인페이지 이동
	@GetMapping(value = "/")
	public String mainPage() {
		return "public/login";
	}
	
	// 로그인 페이지 이동
	@GetMapping(value = "/loginPage")
	public String loginPage() {
		return "public/login";
	}	
	
	// 회원가입 유형선택 페이지 이동
	@GetMapping(value = "/roleChoicePage")
	public String roleChoicePage() {
		return "public/role_choice";
	}	
	
	
	// ---------- 소비자 ---------- //
	
	// 소비자 메인페이지 이동
	@GetMapping(value = "/consumerMainPage")
	public String consumerMainPage() {
		return "consumers/main";
	}
	
	
	// 소비자 회원가입 페이지 이동
	@GetMapping(value = "/joinConsumerPage")
	public String joinConsumerPage() {
		return "consumers/join";
	}	

	
	// 내정보 보기 페이지 이동
	@GetMapping(value = "/myInfoConsumerPage")
	public String myInfoConsumerPage() {
		return "farmers/my_info";
	}
	
	// 내정보 수정 페이지 이동
	@GetMapping(value = "/myInfoFarmerPage")
	public String myInfoFarmerPage() {
		return "farmers/my_info_update";
	}

	// ---------- 농부 ---------- //
	// 농부 메인페이지 이동
	@GetMapping(value = "/farmerMainPage")
	public String farmerMainPage() {
		return "farmers/main";
	}
	
	// 농부 회원가입 페이지 이동
	@GetMapping(value = "/joinFarmerPage")
	public String joinFarmerPage() {
		return "farmers/join";
	}		
	
	// 농부 회원가입 페이지 이동2
	@PostMapping(value = "/joinFarmerPage2")
	public String joinFarmerPage2() {
		return "farmers/join2";
	}		
	
	// 내정보 보기 페이지 이동
	@GetMapping(value = "/myInfoPage")
	public String myInfoPage() {
		return "farmers/my_info";
	}
	
	// 내정보 수정 페이지 이동
	@GetMapping(value = "/myInfoEditPage")
	public String myInfoUpdatePage() {
		return "farmers/my_info_edit";
	}
	

	
	// ---------- 관리자 ---------- //
	// 관리자 메인페이지 이동
	@GetMapping(value = "/adminMainPage")
	public String adminMainPage() {
		return "admin/main";
	}
	
	// 관리자 카테고리 등록 페이지 이동
	@GetMapping(value = "/adminCategoryRegisterPage")
	public String adminCategoryRegisterPage() {
		return "admin/category_register";
	}
	

	// ---------- 영농일지 ---------- //
	// 영농일지 페이지 이동
	@GetMapping(value = "/farmlogPage")
	public String farmlogPage() {
		return "farmlog/view";
	}
	
	// 영농일지 게시판 페이지 이동
	@GetMapping(value = "/farmlogBoardPage")
	public String farmlogBoardPage() {
		return "farmlog/board";
	}
	

	// 영농일지 작성 페이지 이동
	@GetMapping(value = "/farmlogWritePage")
	public String farmlogWritePage() {
		return "farmlog/write";
	}

	// 영농일지 수정 페이지 이동
	@GetMapping(value = "/farmlogEditPage")
	public String farmlogEditPage() {
		return "farmlog/edit";
	}
	
}
