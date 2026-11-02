package com.smhrd.praime.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import com.smhrd.praime.entiry.UserEntity;
import com.smhrd.praime.service.UserService;
import java.time.LocalDate;

@Controller
public class UserController {

    @Autowired
    private UserService userService;


    // 아이디 중복 확인 (AJAX 요청 처리)
    @PostMapping("/checkId")
    @ResponseBody
    public String checkIdDuplicate(@RequestParam("id") String id) {
        boolean isDuplicate = userService.isIdDuplicate(id);
        return isDuplicate ? "duplicate" : "available";
    }

    // 회원가입 처리
    @PostMapping("/join")
    public String registerUser(
            @RequestParam("id") String id,
            @RequestParam("pw") String pw,
            @RequestParam("name") String name,
            @RequestParam("tel-0") String telecom,
            @RequestParam("tel-1") String tel1,
            @RequestParam("tel-2") String tel2,
            @RequestParam("tel-3") String tel3,
            @RequestParam("email-id") String emailId,
            @RequestParam("email-domain") String emailDomain,
            @RequestParam("birth-year") String birthYear,
            @RequestParam("birth-month") String birthMonth,
            @RequestParam("birth-day") String birthDay,
            Model model) {

        try {
            // UserEntity 객체 생성 및 값 설정
            UserEntity user = new UserEntity();
            user.setId(id);
            user.setPw(pw); // 실제 프로젝트에서는 암호화 필요
            user.setName(name);
            user.setTelecom(telecom);
            user.setTel1(tel1);
            user.setTel2(tel2);
            user.setTel3(tel3);
            user.setEmailId(emailId);
            user.setEmailDomain(emailDomain);

            // 생년월일 LocalDate로 변환
            LocalDate birthDate = LocalDate.of(
                Integer.parseInt(birthYear),
                Integer.parseInt(birthMonth),
                Integer.parseInt(birthDay)
            );
            user.setBirthDate(birthDate);

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