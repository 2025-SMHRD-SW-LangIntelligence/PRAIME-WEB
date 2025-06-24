package com.smhrd.praime.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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

    // ✅ 일지 작성 및 저장 처리
    @PostMapping("/write")
    public ResponseEntity<?> writeLog(
            @RequestParam("dltitle") String dltitle,
            @RequestParam("dlcontent") String dlcontent,
            @RequestParam("dlweather") String dlweather,
            @RequestParam("dltemp") Float dltemp,
            @RequestParam("dldate") String dldate, // 'YYYY-MM-DDTHH:mm:ss' 형식의 문자열로 받음
            @RequestParam("dlcrop") String dlcrop,
            @RequestParam("dlwork") String dlwork,
            @RequestParam(value = "dlpesticide", required = false) String dlpesticide,
            @RequestPart(value = "dlimages", required = false) MultipartFile[] dlimages,
            @SessionAttribute("user") UserEntity user
    ) {
        try {
            // --- 디버깅용 출력 시작 ---
            System.out.println("디버그: dltitle = " + dltitle);
            System.out.println("디버그: dlcontent = " + dlcontent.substring(0, Math.min(dlcontent.length(), 50)) + "..."); // 내용이 길 수 있으니 일부만 출력
            System.out.println("디버그: dlweather = " + dlweather);
            System.out.println("디버그: dltemp = " + dltemp);
            System.out.println("디버그: dlcrop = " + dlcrop);
            System.out.println("디버그: dlwork = " + dlwork);
            System.out.println("디버그: dlpesticide = " + dlpesticide);
            System.out.println("디버그: dldate (프론트엔드에서 받은 값) = " + dldate); // <-- 이 부분이 핵심!
            System.out.println("디버그: dlimages.length = " + (dlimages != null ? dlimages.length : 0));
            if (user != null) {
                System.out.println("디버그: User ID = " + user.getUid()); // UserEntity에 getUid() 메서드가 있다고 가정
            }
            // --- 디버깅용 출력 끝 ---


            dailyLogService.saveLog(dltitle, dlcontent, dlweather, dltemp, dldate, dlcrop, dlwork, dlpesticide, dlimages, user);
            return ResponseEntity.ok("작성 완료");
        } catch (Exception e) {
            e.printStackTrace(); // 콘솔에 스택 트레이스 전체 출력
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("작성 실패: " + e.getMessage());
        }
    }

}