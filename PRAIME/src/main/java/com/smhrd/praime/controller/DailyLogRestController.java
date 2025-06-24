package com.smhrd.praime.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.praime.entity.UserEntity;
import com.smhrd.praime.service.DailyLogService;

import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequiredArgsConstructor
@RequestMapping("/farmlog")
public class DailyLogRestController {

    @Autowired
    private final DailyLogService dailyLogService;

    // ✅ 현재 로그인한 사용자의 작물 목록 조회
    @GetMapping("/write/crops")
    public ResponseEntity<List<String>> getCrops(@SessionAttribute("user") UserEntity user) {
        try {
            List<String> crops = user.getCrops();
            if (crops == null || crops.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }
            return ResponseEntity.ok(crops);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ArrayList<>());
        }
    }

    // ✅ 일지 작성
    @PostMapping("/write")
    public ResponseEntity<?> writeLog(
            @RequestParam("dltitle") String dltitle,
            @RequestParam("dlcontent") String dlcontent,
            @RequestParam("dlweather") String dlweather,
            @RequestParam("dltemp") Float dltemp,
            @RequestParam("dldate") String dldate,
            @RequestParam("dlcrop") String dlcrop,
            @RequestPart(value = "dlimages", required = false) MultipartFile[] dlimages,
            @SessionAttribute("user") UserEntity user
    ) {
        try {
            dailyLogService.saveLog(dltitle, dlcontent, dlweather, dltemp, dldate, dlcrop, dlimages, user);
            return ResponseEntity.ok("작성 완료");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("작성 실패: " + e.getMessage());
        }
    }

}