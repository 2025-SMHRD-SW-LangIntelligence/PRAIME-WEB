package com.smhrd.praime.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.ui.Model;
import java.util.Map;

import com.smhrd.praime.entiry.UserEntity;
import com.smhrd.praime.exception.GlobalExceptionHandler;
import jakarta.servlet.http.HttpSession;

@Controller
public class PageController {

    private final GlobalExceptionHandler globalExceptionHandler;


    PageController(GlobalExceptionHandler globalExceptionHandler) {
        this.globalExceptionHandler = globalExceptionHandler;
    }
	

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

	
	// 소비자 내정보 보기 페이지 이동
	@GetMapping(value = "/myInfoConsumerPage")
	public String myInfoConsumerPage() {
		return "farmers/my_info";
	}
	
	// 소비자 내정보 수정 페이지 이동
	@GetMapping(value = "/myInfoConsumerEditPage")
	public String myInfoConsumerEditPage() {
		return "consumer/my_info_edit";
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
	
	// 농부 내정보 보기 페이지 이동
	@GetMapping(value = "/myInfoFarmerPage")
	public String myInfoFarmerPage() {
		return "farmers/my_info";
	}
	
	// 농부 내정보 수정 페이지 이동
	@GetMapping(value = "/myInfoFarmerEditPage")
	public String myInfoFarmerEditPage() {
		return "farmers/my_info_edit";
	}
	
	// 농장 정보 수정 페이지 이동
	@GetMapping(value = "/myFarmEditPage")
	public String myFarmEditPage() {
		return "farmers/my_farm_edit";
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
	public String farmlogBoardPage(Model model) {
		// 더미데이터 추가 (선택사항)
		// 실제로는 DailyLogService에서 데이터를 가져와야 함
		model.addAttribute("boardList", java.util.Arrays.asList(
			Map.of("dltitle", "사과나무 전정 작업 완료", "dlcontent", "오늘 사과나무 전정 작업을 완료했습니다.", "ddate", "2024.01.15"),
			Map.of("dltitle", "배나무 물주기 및 유인작업", "dlcontent", "가지 유인 및 수분 관리 작업을 진행했습니다.", "ddate", "2024.01.14"),
			Map.of("dltitle", "사과나무 병해충 예방 스프레이", "dlcontent", "병해충 예방을 위한 스프레이 작업을 진행했습니다.", "ddate", "2024.01.13")
		));
		return "farmlog/board";
	}
	

	// 영농일지 작성 페이지 이동
	@GetMapping(value = "/farmlogWritePage")
	public String farmlogWritePage(HttpSession session, Model model) {
		return "farmlog/write";
	}
	
//	@GetMapping("/farmlogWritePage")
//	public String farmlogWritePage(HttpSession session, Model model) {
//	    Object rawUser = session.getAttribute("user");
//	    System.out.println(rawUser);
//
//	    if (rawUser == null) {
//	        System.out.println("세션에 사용자 없음");
//	        return "redirect:/";
//	    }
//
//	    if (!(rawUser instanceof UserEntity)) {
//	        System.out.println("세션 user가 UserEntity가 아님. 타입: " + rawUser.getClass());
//	        return "redirect:/";
//	    }
//
//	    UserEntity user = (UserEntity) rawUser;
//
//	    System.out.println("세션에서 가져온 user: " + user);
//
//	    List<String> userCrops = user.getCrops();
//	    model.addAttribute("userCrops", userCrops);
//	    model.addAttribute("user", user);
//
//	    return "farmlog/write";
//	}
	
	
	// 영농일지 수정 페이지 이동
	@GetMapping(value = "/farmlogEditPage")
	public String farmlogEditPage() {
		return "farmlog/edit";
	}
	
	// ---------- 병해충진단 ---------- //
	// 병해충진단 페이지 이동
	@GetMapping(value = "/diagnosisPage")
	public String diagnosisPage() {
		return "diagnosis/view";
	}
	// 병해충진단 업로드 페이지 이동
	@GetMapping(value = "/diagnosisUploadPage")
	public String diagnosisUploadPage() {
		return "diagnosis/upload";
	}
	
	// 병해충진단 목록 페이지 이동
	@GetMapping(value = "/diagnosisBoardPage")
	public String diagnosisBoardPage() {
		return "diagnosis/board";
	}
	
	
}
