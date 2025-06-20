package com.smhrd.praime.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

@Service 
public class CommonService {
	
	 /**
     * 현재 날짜를 포맷팅하여 문자열로 반환
     * @return "yyyy년 M월 d일" 형식의 현재 날짜 문자열
     */
    public String getFormattedCurrentDate() {
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy년 M월 d일");
        return today.format(formatter);
    }

    /**
     * Model 객체에 현재 날짜를 "todayDate" 이름으로 추가
     * @param model Model 객체
     */
    public void addCurrentDateToModel(Model model) {
        String formattedDate = getFormattedCurrentDate();
        model.addAttribute("todayDate", formattedDate);
    }
}
