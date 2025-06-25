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
            return "redirect:/loginPage";
        }

        commonService.addCurrentDateToModel(model);

        Page<DailyLogEntity> recentLogsPage = dailyLogService.getDailyLogs(0, 5, null, "title", "desc", user.getUid());
        List<DailyLogEntity> recentLogs = recentLogsPage.getContent();

        model.addAttribute("user", user);
        model.addAttribute("recentLogs", recentLogs);

        Pageable pageable = PageRequest.of(0, 5, Sort.by("createdAt").descending());
        List<DiagnosisEntity> recentDiagnoses = diagnosisService.findRecentDiagnosesByUid(user.getUid(), pageable);
        recentDiagnoses.forEach(item -> item.setImagePath(convertToWebPath(item.getImagePath())));
        model.addAttribute("diagnosisList", recentDiagnoses);

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
            return "redirect:/loginPage";
        }
        UserEntity user = (UserEntity) userObj;
        String uid = user.getUid();

        Page<DiagnosisEntity> diagnosisPage = diagnosisService.getDiagnosisHistory(page, size, sortOrder, uid);
        List<DiagnosisEntity> diagnosisList = diagnosisPage.getContent();
        diagnosisList.forEach(item -> item.setImagePath(convertToWebPath(item.getImagePath())));

        model.addAttribute("diagnosisList", diagnosisList);
        model.addAttribute("currentPage", diagnosisPage.getNumber());
        model.addAttribute("totalPages", diagnosisPage.getTotalPages());
        model.addAttribute("totalElements", diagnosisPage.getTotalElements());
        model.addAttribute("pageSize", size);
        model.addAttribute("sortOrder", sortOrder);

        return "diagnosis/board";
    }

    @GetMapping(value = "/api/diagnosis")
    public String getDiagnosisData(@RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "10") int size,
                                   @RequestParam(defaultValue = "desc") String sortOrder,
                                   Model model,
                                   HttpSession session) {
        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            model.addAttribute("diagnosisList", List.of());
            model.addAttribute("hasNext", false);
            model.addAttribute("currentPage", page);
            return "diagnosis/board :: diagnosis-list";
        }
        UserEntity user = (UserEntity) userObj;
        String uid = user.getUid();
        Page<DiagnosisEntity> diagnosisPage = diagnosisService.getDiagnosisHistory(page, size, sortOrder, uid);
        List<DiagnosisEntity> diagnosisList = diagnosisPage.getContent();
        diagnosisList.forEach(item -> item.setImagePath(convertToWebPath(item.getImagePath())));

        model.addAttribute("diagnosisList", diagnosisList);
        model.addAttribute("hasNext", diagnosisPage.hasNext());
        model.addAttribute("currentPage", page);

        return "diagnosis/board :: diagnosis-list";
    }
}
