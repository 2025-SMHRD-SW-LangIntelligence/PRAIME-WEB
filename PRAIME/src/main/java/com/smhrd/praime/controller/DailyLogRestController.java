package com.smhrd.praime.controller;


import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.praime.entity.DailyLogEntity;
import com.smhrd.praime.entity.UserEntity;
import com.smhrd.praime.repository.UserRepository;
import com.smhrd.praime.service.DailyLogService;

import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequiredArgsConstructor
@RequestMapping("/farmlog")
public class DailyLogRestController {

    @Autowired
    private final DailyLogService dailyLogService;
    
    @Autowired
    private UserRepository userRepository; // UserEntity용 리포지토리 추가

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
            @RequestParam("dldate") LocalDateTime dldate,
            @RequestParam("dlcrop") String dlcrop,
            @RequestParam("dlwork") String dlwork,
            @RequestParam(value = "dlpesticide", required = false) String dlpesticide,
            @RequestPart(value = "dlimages", required = false) MultipartFile[] dlimages,
            @SessionAttribute("user") UserEntity sessionUser
    ) {
    	try {
            // ✅ 세션 유저 → DB에서 다시 조회해서 영속화
            UserEntity user = userRepository.findByUid(sessionUser.getUid())
                                 .orElseThrow(() -> new RuntimeException("사용자 정보 없음"));
            dailyLogService.saveLog(dltitle, dlcontent, dlweather, dltemp, dldate, dlcrop, dlwork, dlpesticide, dlimages, user);
            return ResponseEntity.ok("작성 완료");
        } catch (Exception e) {
            e.printStackTrace(); // 콘솔에 스택 트레이스 전체 출력
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("작성 실패: " + e.getMessage());
        }
    }

    // ✅ 상세 조회 (화면용)
    @GetMapping("/{dlid}")
    public ResponseEntity<?> getLogDetail(@PathVariable Long dlid) {
        return dailyLogService.getLogDetail(dlid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ 수정 처리
    @PostMapping("/update/{dlid}")
    public ResponseEntity<String> updateLog(
            @PathVariable Long dlid,
            @RequestParam Map<String, String> params,
            @RequestParam(value = "deletedImageIds", required = false) List<Long> deletedImageIds,
            @RequestParam(value = "newImages", required = false) List<MultipartFile> newImages,
            @SessionAttribute("user") UserEntity user) {

        System.out.println("====== [🛠️ UPDATE 요청 도착] ======");
        System.out.println("▶️ 수정 대상 ID: " + dlid);
        System.out.println("▶️ 사용자: " + (user != null ? user.getUid() : "비로그인"));

        // 1. 전체 폼 데이터 출력
        System.out.println("▶️ 전달된 파라미터:");
        for (Map.Entry<String, String> entry : params.entrySet()) {
            System.out.println("- " + entry.getKey() + ": " + entry.getValue());
        }

        // 2. 삭제된 이미지 ID 확인
        System.out.println("▶️ 삭제할 이미지 IDs: " + (deletedImageIds != null ? deletedImageIds : "없음"));

        // 3. 새 이미지 확인
        if (newImages != null && !newImages.isEmpty()) {
            System.out.println("▶️ 새로 추가된 이미지:");
            for (MultipartFile file : newImages) {
                System.out.println("   - " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)");
            }
        } else {
            System.out.println("▶️ 추가된 새 이미지 없음");
        }
        System.out.println("================================");

        // 로그인 확인
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        // 작성자 확인
        if (!dailyLogService.isLogOwner(dlid, user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("해당 일지에 대한 수정 권한이 없습니다.");
        }

        // 실제 업데이트 처리
        boolean success = dailyLogService.updateLog(dlid, params, deletedImageIds, newImages, user);
        if (success) {
            return ResponseEntity.ok("수정 성공");
        } else {
            return ResponseEntity.badRequest().body("수정 실패: 로그를 찾을 수 없음");
        }
    }


    // ✅ 삭제 처리
    @DeleteMapping("/{dlid}")
    public ResponseEntity<?> deleteDailyLog(@PathVariable Long dlid) {
        try {
            dailyLogService.deleteLog(dlid);
            return ResponseEntity.ok("삭제 완료");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("존재하지 않는 게시글입니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 중 오류 발생");
        }
    }

    // ✅ JSON 상세 조회 (프론트에서 동적 처리용)
    @GetMapping("/json/{dlid}")
    public ResponseEntity<?> getLogDetailJson(@PathVariable Long dlid) {
        Optional<DailyLogEntity> log = dailyLogService.getLogDetail(dlid);

        if (log.isPresent()) {
            return ResponseEntity.ok(log.get());
        } else {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "해당 일지를 찾을 수 없습니다"));
        }
    }

    // ✅ ✨ 수정용 데이터 조회 API: log + user.crops
    @PostMapping("/editData/{dlid}")
    public ResponseEntity<?> getEditData(@PathVariable Long dlid) {
        Optional<DailyLogEntity> logOpt = dailyLogService.getLogDetail(dlid);

        if (logOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "일지를 찾을 수 없습니다."));
        }

        DailyLogEntity log = logOpt.get();
        UserEntity user = log.getUser();
        List<String> crops = user.getCrops();

        Map<String, Object> response = new HashMap<>();
        response.put("log", log);
        response.put("crops", crops);

        return ResponseEntity.ok(response);
    }
}
