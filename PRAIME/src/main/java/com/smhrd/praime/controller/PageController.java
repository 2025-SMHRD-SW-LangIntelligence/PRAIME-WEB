package com.smhrd.praime.controller;

import java.io.File;
import java.util.ArrayList;
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
import com.smhrd.praime.entity.DailyLogEntity;
import com.smhrd.praime.repository.DiagnosisRepository;
import com.smhrd.praime.repository.UserRepository;
import com.smhrd.praime.service.CommonService;
import com.smhrd.praime.service.DiagnosisService;
import com.smhrd.praime.service.UserService;
import com.smhrd.praime.service.DailyLogService;

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
    private final DailyLogService dailyLogService;
    


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
            return "redirect:/loginPage";
        }
        // 오늘 날짜를 모델에 추가
        commonService.addCurrentDateToModel(model);
        
        // ✅ 최신 5개 영농일지 데이터 가져오기 (해당 사용자만)
        Page<DailyLogEntity> recentLogsPage = dailyLogService.readAllWithPagingByUid(user.getUid(), 0, 5);
        List<DailyLogEntity> recentLogs = recentLogsPage.getContent();

        model.addAttribute("user", user);
        model.addAttribute("recentLogs", recentLogs);

        // --- 최근 진단 이력 5개만 가져오는 로직 수정: 본인 글만 ---
        Pageable pageable = PageRequest.of(0, 5, Sort.by("createdAt").descending());
        List<DiagnosisEntity> recentDiagnoses = diagnosisService.findRecentDiagnosesByUid(user.getUid(), pageable);
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
	// 영농일지 상세 페이지 이동
	@GetMapping(value = "/farmlogPage")
	public String farmlogPage() {
		return "farmlog/view";
	}
	
	// 영농일지 게시판 페이지 이동
	@GetMapping(value = "/farmlogBoardPage")
	public String farmlogBoardPage(
			@RequestParam(required = false) String keyword,
			@RequestParam(required = false, defaultValue = "title") String searchOption,
			@RequestParam(defaultValue = "desc") String sortOrder,
			Model model,
			jakarta.servlet.http.HttpSession session) {
		
		// ✅ 세션에서 사용자 정보 가져오기
		Object userObj = session.getAttribute("user");
		if (userObj == null) {
			return "redirect:/loginPage";
		}
		UserEntity user = (UserEntity) userObj;
		String uid = user.getUid();
		
		ArrayList<DailyLogEntity> boardList;
		
		// 검색어가 있으면 검색, 없으면 전체 목록 (해당 사용자만)
		if (keyword != null && !keyword.trim().isEmpty()) {
			boardList = dailyLogService.searchLogsByUid(uid, keyword.trim(), searchOption);
		} else {
			boardList = dailyLogService.readAllByUid(uid);
		}
		
		model.addAttribute("boardList", boardList);
		model.addAttribute("keyword", keyword);
		model.addAttribute("searchOption", searchOption);
		model.addAttribute("sortOrder", sortOrder); // 정렬 순서 추가
		return "farmlog/board";
	}
	
	// 무한스크롤을 위한 REST API
	@GetMapping(value = "/api/farmlog")
	public String getFarmlogData(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) String keyword,
			@RequestParam(required = false, defaultValue = "title") String searchOption,
			@RequestParam(defaultValue = "desc") String sortOrder,
			Model model,
			jakarta.servlet.http.HttpSession session) {
		
		// ✅ 세션에서 사용자 정보 가져오기
		Object userObj = session.getAttribute("user");
		if (userObj == null) {
			model.addAttribute("farmlogList", new ArrayList<>());
			model.addAttribute("hasNext", false);
			model.addAttribute("currentPage", page);
			return "farmlog/board :: board-list";
		}
		com.smhrd.praime.entity.UserEntity user = (com.smhrd.praime.entity.UserEntity) userObj;
		String uid = user.getUid();
		
		List<DailyLogEntity> farmlogList;
		boolean hasNext = false;
		
		// 검색어가 있으면 검색 결과 전체 반환, 없으면 페이징 처리
		if (keyword != null && !keyword.trim().isEmpty()) {
			// ✅ 검색 결과 전체를 반환 (JavaScript에서 페이징 처리)
			ArrayList<DailyLogEntity> searchResults = dailyLogService.searchLogsByUid(uid, keyword.trim(), searchOption);
			farmlogList = searchResults;
			hasNext = false; // 검색 결과는 전체 반환하므로 hasNext는 false
		} else {
			// 일반 목록은 페이징 처리 (정렬 적용)
			Page<DailyLogEntity> farmlogPage = dailyLogService.readAllWithPagingByUid(uid, page, size, sortOrder);
			farmlogList = farmlogPage.getContent();
			hasNext = farmlogPage.hasNext();
		}
		
		model.addAttribute("farmlogList", farmlogList);
		model.addAttribute("hasNext", hasNext);
		model.addAttribute("currentPage", page);
		
		return "farmlog/board :: board-list";
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
            return "/images/placeholder.png"; // 대체 이미지 경로
        }
        // File 객체를 사용하여 파일명만 추출
        File file = new File(fullLocalPath);
        String filename = file.getName(); 

        // WebConfig에 설정된 핸들러 경로와 파일명을 결합하여 반환
        return "/uploads/diagnosis/" + filename; 
    }
    
    // farmlog 이미지 경로를 웹 접근 가능한 형태로 변환하는 헬퍼 메서드
    private String convertFarmlogImagePath(String dlipath) {
        if (dlipath == null || dlipath.isEmpty()) {
            return "/img/log.png"; // 기본 이미지 경로
        }
        // WebConfig에 설정된 핸들러 경로와 파일명을 결합하여 반환
        return "/uploads/farmlog/" + dlipath; 
    }

    // 병해충진단 목록 페이지 이동 (초기 페이지 렌더링용)
    @GetMapping("/diagnosisBoardPage") // 실제 웹 페이지 URL
    public String diagnosisBoardPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "desc") String sortOrder,
            Model model,
            jakarta.servlet.http.HttpSession session) {

        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            return "redirect:/loginPage";
        }
        com.smhrd.praime.entity.UserEntity user = (com.smhrd.praime.entity.UserEntity) userObj;
        String uid = user.getUid();

        Page<DiagnosisEntity> diagnosisPage = diagnosisService.getDiagnosisHistory(page, size, sortOrder, uid);
        List<DiagnosisEntity> diagnosisList = diagnosisPage.getContent();

        diagnosisList.forEach(item -> {
            item.setImagePath(convertToWebPath(item.getImagePath()));
        });

        model.addAttribute("diagnosisList", diagnosisList);
        model.addAttribute("currentPage", diagnosisPage.getNumber());
        model.addAttribute("totalPages", diagnosisPage.getTotalPages());
        model.addAttribute("totalElements", diagnosisPage.getTotalElements());
        model.addAttribute("pageSize", size);
        model.addAttribute("sortOrder", sortOrder); // JS 초기화 시 사용

        return "diagnosis/board"; 
    }
    
    // 무한스크롤을 위한 REST API (HTML 프래그먼트 반환)
    // JavaScript에서 '/api/diagnosis'로 호출
    @GetMapping(value = "/api/diagnosis")
    public String getDiagnosisData(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "desc") String sortOrder,
            Model model,
            jakarta.servlet.http.HttpSession session) {
        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            model.addAttribute("diagnosisList", List.of());
            model.addAttribute("hasNext", false);
            model.addAttribute("currentPage", page);
            return "diagnosis/board :: diagnosis-list";
        }
        com.smhrd.praime.entity.UserEntity user = (com.smhrd.praime.entity.UserEntity) userObj;
        String uid = user.getUid();
        Page<DiagnosisEntity> diagnosisPage = diagnosisService.getDiagnosisHistory(page, size, sortOrder, uid);
        List<DiagnosisEntity> diagnosisList = diagnosisPage.getContent();
        diagnosisList.forEach(item -> {
            item.setImagePath(convertToWebPath(item.getImagePath()));
        });
        model.addAttribute("diagnosisList", diagnosisList);
        model.addAttribute("hasNext", diagnosisPage.hasNext());
        model.addAttribute("currentPage", page);
        return "diagnosis/board :: diagnosis-list";
    }

}
