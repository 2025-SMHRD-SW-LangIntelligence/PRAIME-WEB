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


    UserService userService;
    UserRepository userRepository;
    DiagnosisRepository diagnosisRepository;
    private final CommonService commonService;
    private final DailyLogService dailyLogService;
    private final DiagnosisService diagnosisService;


    // ---------- 공용 ---------- //
    @GetMapping(value = "/")
    public String mainPage() {
        return "public/login";
    }

    @GetMapping(value = "/loginPage")
    public String loginPage() {
        return "public/login";
    }

    @GetMapping(value = "/roleChoicePage")
    public String roleChoicePage() {
        return "public/role_choice";
    }

    // ---------- 소비자 ---------- //
    @GetMapping(value = "/consumerMainPage")
    public String consumerMainPage() {
        return "consumers/main";
    }

    @GetMapping(value = "/joinConsumerPage")
    public String joinConsumerPage() {
        return "consumers/join";
    }

    @GetMapping(value = "/myInfoConsumerPage")
    public String myInfoConsumerPage() {
        return "farmers/my_info";
    }

    @GetMapping(value = "/myInfoConsumerEditPage")
    public String myInfoConsumerEditPage() {
        return "consumer/my_info_edit";
    }

    // ---------- 농부 ---------- //
    @GetMapping("/farmerMainPage")
    public String farmerMainPage(HttpSession session, Model model) {
        UserEntity user = (UserEntity) session.getAttribute("user");
        if (user == null) {
            // 사용자 세션이 없으면 로그인 페이지로 리다이렉트
            return "redirect:/loginPage";
        }

        // 현재 날짜를 모델에 추가 (CommonService의 역할)
        commonService.addCurrentDateToModel(model);

        // 최근 일지 기록 5개 조회 (페이징 사용)
        Page<DailyLogEntity> recentLogsPage = dailyLogService.getDailyLogs(0, 5, null, "title", "desc", user.getUid());
        List<DailyLogEntity> recentLogs = recentLogsPage.getContent();

        // 모델에 사용자 정보와 최근 일지 기록 추가
        model.addAttribute("user", user);
        model.addAttribute("recentLogs", recentLogs);

        // --- 여기부터 수정된 부분입니다. ---
        // 이전의 findRecentDiagnosesByUid 대신, 통합된 searchDiagnosis 메서드를 사용합니다.
        // 이 메서드는 다음 파라미터를 받습니다:
        // page (페이지 번호, 0부터 시작), size (페이지당 항목 수), sortOrder (정렬 순서 "asc" 또는 "desc"),
        // uid (사용자 ID), label (라벨 필터), minConfidence (최소 신뢰도 필터), startDate (시작 날짜 필터), endDate (종료 날짜 필터)
        Page<DiagnosisEntity> recentDiagnosesPage = diagnosisService.searchDiagnosis(
            0, // page: 첫 번째 페이지 (0)
            5, // size: 페이지당 5개의 항목
            "desc", // sortOrder: 'createdAt' 필드를 기준으로 내림차순 정렬 (가장 최신 기록부터)
            user.getUid(), // uid: 현재 로그인한 사용자의 ID로 필터링
            null, // label: 특정 라벨로 필터링하지 않으므로 null
            null, // minConfidence: 최소 신뢰도로 필터링하지 않으므로 null
            null, // startDate: 기간 시작 날짜로 필터링하지 않으므로 null
            null  // endDate: 기간 종료 날짜로 필터링하지 않으므로 null
        );
        List<DiagnosisEntity> recentDiagnoses = recentDiagnosesPage.getContent();
        // --- 수정된 부분 끝 ---

        // 진단 이미지 경로를 웹에서 접근 가능한 경로로 변환
        recentDiagnoses.forEach(item -> item.setImagePath(convertToWebPath(item.getImagePath())));
        model.addAttribute("diagnosisList", recentDiagnoses);

        // 뷰 템플릿 이름 반환
        return "farmers/main";
    }



    @GetMapping(value = "/joinFarmerPage")
    public String joinFarmerPage() {
        return "farmers/join";
    }

    @PostMapping(value = "/joinFarmerPage2")
    public String joinFarmerPage2() {
        return "farmers/join2";
    }

    @GetMapping(value = "/myInfoFarmerPage")
    public String myInfoFarmerPage() {
        return "farmers/my_info";
    }

    @GetMapping(value = "/myInfoFarmerEditPage")
    public String myInfoFarmerEditPage() {
        return "farmers/my_info_edit";
    }

    @GetMapping(value = "/myFarmEditPage")
    public String myFarmEditPage() {
        return "farmers/my_farm_edit";
    }

    // ---------- 관리자 ---------- //
    @GetMapping(value = "/adminMainPage")
    public String adminMainPage() {
        return "admin/main";
    }

    @GetMapping(value = "/adminCategoryRegisterPage")
    public String adminCategoryRegisterPage() {
        return "admin/category_register";
    }

    // ---------- 영농일지 ---------- //
    @GetMapping(value = "/farmlogPage")
    public String farmlogPage() {
        return "farmlog/view";
    }

    @GetMapping(value = "/farmlogBoardPage")
    public String farmlogBoardPage(Model model, HttpSession session) {
        return "farmlog/board";
    }

    @GetMapping(value = "/api/farmlog")
    public String getFarmlogData(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size,
                                  @RequestParam(required = false) String keyword,
                                  @RequestParam(defaultValue = "title") String searchOption,
                                  @RequestParam(defaultValue = "desc") String sortOrder,
                                  Model model,
                                  HttpSession session) {
        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            model.addAttribute("farmlogList", new ArrayList<>());
            return "farmlog/board :: board-list";
        }
        UserEntity user = (UserEntity) userObj;
        Page<DailyLogEntity> farmlogPage = dailyLogService.getDailyLogs(page, size, keyword, searchOption, sortOrder, user.getUid());

        model.addAttribute("farmlogList", farmlogPage.getContent());
        model.addAttribute("hasNext", farmlogPage.hasNext());
        model.addAttribute("currentPage", page);

        return "farmlog/board :: board-list";
    }

    @GetMapping("/farmlogWritePage")
    public String farmlogWritePage(HttpSession session, Model model) {
        return "farmlog/write";
    }

    @GetMapping(value = "/farmlogEditPage")
    public String farmlogEditPage() {
        return "farmlog/edit";
    }

    // ---------- 병해충진단 ---------- //
    @GetMapping(value = "/diagnosisPage")
    public String diagnosisPage() {
        return "diagnosis/view";
    }

    @GetMapping(value = "/diagnosisUploadPage")
    public String diagnosisUploadPage() {
        return "diagnosis/upload";
    }

    private String convertToWebPath(String fullLocalPath) {
        if (fullLocalPath == null || fullLocalPath.isEmpty()) {
            return "/images/placeholder.png";
        }
        File file = new File(fullLocalPath);
        String filename = file.getName();
        return "/uploads/diagnosis/" + filename;
    }

    private String convertFarmlogImagePath(String dlipath) {
        if (dlipath == null || dlipath.isEmpty()) {
            return "/img/log.png";
        }
        return "/uploads/farmlog/" + dlipath;
    }

    @GetMapping("/diagnosisBoardPage")
    public String diagnosisBoardPage(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "10") int size,
                                     @RequestParam(defaultValue = "desc") String sortOrder,
                                     Model model,
                                     HttpSession session) {
        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            // 사용자 세션이 없으면 로그인 페이지로 리다이렉트
            return "redirect:/loginPage";
        }
        UserEntity user = (UserEntity) userObj;
        String uid = user.getUid(); // 현재 로그인한 사용자의 UID를 가져옵니다.

        // --- 여기부터 수정된 부분입니다. ---
        // 이전의 getDiagnosisHistory 대신, 통합된 searchDiagnosis 메서드를 사용합니다.
        // searchDiagnosis 메서드는 다음 파라미터를 받습니다:
        // page, size, sortOrder, uid, label, minConfidence, startDate, endDate
        Page<DiagnosisEntity> diagnosisPage = diagnosisService.searchDiagnosis(
            page,         // 현재 페이지 번호
            size,         // 페이지당 항목 수
            sortOrder,    // 정렬 순서 ("asc" 또는 "desc")
            uid,          // 현재 로그인한 사용자의 ID로 필터링
            null,         // label: 특정 라벨로 필터링하지 않으므로 null
            null,         // minConfidence: 최소 신뢰도로 필터링하지 않으므로 null
            null,         // startDate: 기간 시작 날짜로 필터링하지 않으므로 null
            null          // endDate: 기간 종료 날짜로 필터링하지 않으므로 null
        );
        // --- 수정된 부분 끝 ---

        List<DiagnosisEntity> diagnosisList = diagnosisPage.getContent();
        // 진단 이미지 경로를 웹에서 접근 가능한 경로로 변환 (convertToWebPath 메서드는 별도로 정의되어 있어야 합니다)
        diagnosisList.forEach(item -> item.setImagePath(convertToWebPath(item.getImagePath())));

        // 모델에 데이터 추가
        model.addAttribute("diagnosisList", diagnosisList);
        model.addAttribute("currentPage", diagnosisPage.getNumber());
        model.addAttribute("totalPages", diagnosisPage.getTotalPages());
        model.addAttribute("totalElements", diagnosisPage.getTotalElements());
        model.addAttribute("pageSize", size);
        model.addAttribute("sortOrder", sortOrder);

        // 뷰 템플릿 이름 반환
        return "diagnosis/board";
    }
    
    @GetMapping(value = "/api/diagnosis") // 이 경로가 REST API의 역할을 하기도 하고, 뷰 조각을 반환하기도 하므로 확인 필요
    public String getDiagnosisData(@RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "10") int size,
                                   @RequestParam(defaultValue = "desc") String sortOrder,
                                   Model model,
                                   HttpSession session) {
        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            // 로그인되지 않은 경우 빈 리스트와 함께 HTML 조각 반환
            model.addAttribute("diagnosisList", List.of());
            model.addAttribute("hasNext", false);
            model.addAttribute("currentPage", page);
            return "diagnosis/board :: diagnosis-list"; // Thymeleaf fragment 반환
        }
        UserEntity user = (UserEntity) userObj;
        String uid = user.getUid();

        // --- 여기부터 수정된 부분입니다. ---
        // 이전의 getDiagnosisHistory 대신, 통합된 searchDiagnosis 메서드를 사용합니다.
        // searchDiagnosis 메서드는 다음 파라미터를 받습니다:
        // page, size, sortOrder, uid, label, minConfidence, startDate, endDate
        Page<DiagnosisEntity> diagnosisPage = diagnosisService.searchDiagnosis(
            page,         // 현재 페이지 번호
            size,         // 페이지당 항목 수
            sortOrder,    // 정렬 순서 ("asc" 또는 "desc")
            uid,          // 현재 로그인한 사용자의 ID로 필터링
            null,         // label: 특정 라벨로 필터링하지 않으므로 null
            null,         // minConfidence: 최소 신뢰도로 필터링하지 않으므로 null
            null,         // startDate: 기간 시작 날짜로 필터링하지 않으므로 null
            null          // endDate: 기간 종료 날짜로 필터링하지 않으므로 null
        );
        // --- 수정된 부분 끝 ---

        List<DiagnosisEntity> diagnosisList = diagnosisPage.getContent();
        // 진단 이미지 경로를 웹에서 접근 가능한 경로로 변환 (convertToWebPath 메서드는 별도로 정의되어 있어야 합니다)
        diagnosisList.forEach(item -> item.setImagePath(convertToWebPath(item.getImagePath())));

        // 모델에 데이터 추가
        model.addAttribute("diagnosisList", diagnosisList);
        model.addAttribute("hasNext", diagnosisPage.hasNext());
        model.addAttribute("currentPage", page);

        // Thymeleaf fragment 반환
        return "diagnosis/board :: diagnosis-list";
    }


}
