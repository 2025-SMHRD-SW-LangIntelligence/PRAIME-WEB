package com.smhrd.praime.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.smhrd.praime.entiry.Role;
import com.smhrd.praime.entiry.UserEntity;
import com.smhrd.praime.service.UserService;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Controller
public class UserController {

    private final PageController pageController;

    @Autowired
    private UserService userService;

    UserController(PageController pageController) {
        this.pageController = pageController;
    }

    // 로그인 기능
    @PostMapping(value = "/login.do")
    public ResponseEntity<?> login(
            @RequestParam("id") String uid,
            @RequestParam String pw,
            HttpSession session) {
        
        // 1. 아이디 존재 여부 확인
        Optional<UserEntity> userOpt = userService.findByUid(uid);
        if (!userOpt.isPresent()) {
            return errorResponse("id", "존재하지 않는 아이디입니다");
        }

        UserEntity user = userOpt.get();
        
        // 2. 비밀번호 일치 여부 확인
        if (!userService.checkPassword(user, pw)) {
            return errorResponse("pw", "비밀번호가 일치하지 않습니다");
        }

        // 로그인 성공 처리
        session.setAttribute("user", user);
        
        // 역할에 따른 리다이렉트 URL 설정
        String redirectUrl = determineRedirectUrl(user.getRole());
        return ResponseEntity.ok(redirectUrl);
    }
    // 회원유형별 페이지 전환
    private String determineRedirectUrl(Role role) {
        if (Role.FARMER.equals(role)) {
        	System.out.println("농부");
            return "/farmerMainPage";
        } else if (Role.USER.equals(role)) {
        	System.out.println("소비자");
            return "/userMainPage";
        } else if (Role.ADMIN.equals(role)) {
        	System.out.println("관리자");
            return "/adminMainPage";
        }
        return "/";
    }    
    

    // 회원가입 처리
    @PostMapping("/joinUser.do")
    public String registerUser(
            @RequestParam("id") String uid,
            @RequestParam("pw") String pw,
            @RequestParam("name") String name,
            @RequestParam("tel-0") String telecom,
            @RequestParam("tel-1") String tel1,
            @RequestParam("tel-2") String tel2,
            @RequestParam("tel-3") String tel3,
            @RequestParam("email-id") String emailId,
            @RequestParam("email-domain") String emailDomain,
            @RequestParam("address") String address,
            @RequestParam("address-detail") String addressDetail,
            Model model) {

        try {
            UserEntity user = new UserEntity();
            user.setUid(uid);
            user.setPw(pw); 
            user.setName(name);
            user.setTelecom(telecom);
            user.setTel1(tel1);
            user.setTel2(tel2);
            user.setTel3(tel3);
            user.setEmailId(emailId);
            user.setEmailDomain(emailDomain);
            user.setAddress(address);
            user.setAddressDetail(addressDetail);
            user.setRole(Role.USER);

            userService.registerUser(user);
            return "redirect:/";
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            return "joinUserPage";
        }
    }

    // 비밀번호 실패시 에러메세지 출력기능
    private ResponseEntity<Map<String, String>> errorResponse(String field, String message) {
        Map<String, String> response = new HashMap<>();
        response.put("field", field);
        response.put("message", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }


}