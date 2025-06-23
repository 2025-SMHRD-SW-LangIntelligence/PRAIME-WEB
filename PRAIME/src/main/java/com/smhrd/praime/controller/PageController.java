package com.smhrd.praime.controller;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.smhrd.praime.entity.DiagnosisEntity;
import com.smhrd.praime.entity.UserEntity;
import com.smhrd.praime.repository.DiagnosisRepository;
import com.smhrd.praime.repository.UserRepository;
import com.smhrd.praime.service.CommonService;
import com.smhrd.praime.service.DiagnosisService;
import com.smhrd.praime.service.UserService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class PageController {
	


	@Autowired
    CommonService commonService;
	UserService userService;
	private final DiagnosisService diagnosisService;
    UserRepository userRepository;
    DiagnosisRepository diagnosisRepository;
    


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
    @GetMapping("/farmerMainPage")
    public String farmerMainPage(HttpSession session, Model model) {

        // 세션에서 유저 정보 가져오기 (예외처리 포함)
        UserEntity user = (UserEntity) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        // 오늘 날짜를 모델에 추가
        commonService.addCurrentDateToModel(model);

        model.addAttribute("user", user);

        // --- 최근 진단 이력 5개만 가져오는 로직 추가 ---
        // Pageable 객체를 사용하여 첫 번째 페이지(0), 5개의 결과, 최신순(createdAt 기준 내림차순)으로 정렬
        Pageable pageable = PageRequest.of(0, 5, Sort.by("createdAt").descending());
        List<DiagnosisEntity> recentDiagnoses = diagnosisService.findRecentDiagnoses(pageable); // Service 메서드 호출

        // 중요: 불러온 진단 이력 목록의 각 엔티티에 대해 이미지 경로 변환
        recentDiagnoses.forEach(item -> {
            item.setImagePath(convertToWebPath(item.getImagePath()));
        });

        model.addAttribute("diagnosisList", recentDiagnoses);

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
    @GetMapping("/farmlogWritePage")
    public String farmlogWritePage(HttpSession session, Model model) {
        return "farmlog/write";
    }

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
	



    // 이미지 경로를 웹 접근 가능한 형태로 변환하는 헬퍼 메서드
    private String convertToWebPath(String fullLocalPath) {
        if (fullLocalPath == null || fullLocalPath.isEmpty()) {
            return "/images/placeholder.png"; // 대체 이미지 경로 (필요시 조정)
        }
        // File 객체를 사용하여 파일명만 추출
        File file = new File(fullLocalPath);
        String filename = file.getName(); // 예: "diagnosis_20250620_174212_131b2efa.jpg"

        // WebConfig에 설정된 핸들러 경로와 파일명을 결합하여 반환
        return "/uploads/diagnosis/" + filename; // 예: "/uploads/diagnosis/diagnosis_20250620_174212_131b2efa.jpg"
    }

    // 병해충진단 목록 페이지 이동
    @GetMapping("/diagnosisBoardPage")
    public String diagnosisBoardPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "desc") String sortOrder,
            Model model) {

        // 1. 페이징 처리된 진단 이력 가져오기
        Page<DiagnosisEntity> diagnosisPage = diagnosisService.getDiagnosisHistory(page, size, sortOrder);
        List<DiagnosisEntity> diagnosisList = diagnosisPage.getContent();

        // 중요: 페이징된 목록의 각 엔티티에 대해 이미지 경로 변환
        diagnosisList.forEach(item -> {
            item.setImagePath(convertToWebPath(item.getImagePath()));
        });

        model.addAttribute("diagnosisList", diagnosisList);
        model.addAttribute("currentPage", diagnosisPage.getNumber());
        model.addAttribute("totalPages", diagnosisPage.getTotalPages());
        model.addAttribute("totalElements", diagnosisPage.getTotalElements());
        model.addAttribute("pageSize", size);

        return "diagnosis/board";
    }


	
}
