package com.smhrd.praime.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.smhrd.praime.entiry.Role;
import com.smhrd.praime.entiry.UserEntity;
import com.smhrd.praime.service.UserService;

import jakarta.servlet.http.HttpSession;

import java.time.LocalDate;

@Controller
public class UserController {

    @Autowired
    private UserService userService;


    // 로그인 기능
    @PostMapping(value = "/login.do")
    public String login(@RequestParam("id") String uid, @RequestParam String pw, HttpSession session) {
        UserEntity user = userService.login(uid, pw);
        System.out.println(user);
        System.out.println("로그인기능들어옴!!!!!!!!!!!");

        if (user != null) {  // Login 성공
            session.setAttribute("user", user);
            System.out.println("로그인성공!!!!!!!!!!!");

            if (Role.FARMER.equals(user.getRole())) {   //Role 농부
            	System.out.println("농부!!!!!!!!!!!");
                return "redirect:/farmer_main";
                
            } else if (Role.USER.equals(user.getRole())) {  //Role 소비자
            	System.out.println("소비자!!!!!!!!!!!");
                return "user_main";
                
            } else if (Role.ADMIN.equals(user.getRole())) {  //Role 관리자
            	System.out.println("관리자!!!!!!!!!!!");
                return "admin_main";
                
            }
            
            else {
                return "redirect:/"; 
            }

        } else {
            return "redirect:/login"; // Login 실패
        }
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
            // UserEntity 객체 생성 및 값 설정
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

            // 회원가입 처리
            userService.registerUser(user);

            // 회원가입 성공 시 리다이렉트
            return "redirect:/";
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            return "join"; // 에러 발생 시 회원가입 페이지로 다시 이동
        }
    }
}