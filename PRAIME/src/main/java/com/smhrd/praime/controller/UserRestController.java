package com.smhrd.praime.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.praime.service.UserService;

@RestController
public class UserRestController {

	@Autowired
	UserService userService;
	
    // 아이디 중복 확인 (AJAX 요청 처리)
    @PostMapping("/checkId")
    @ResponseBody
    public String checkIdDuplicate(@RequestParam("id") String uid) {
        boolean isDuplicate = userService.isIdDuplicate(uid);
        return isDuplicate ? "duplicate" : "available";
    }	
}
