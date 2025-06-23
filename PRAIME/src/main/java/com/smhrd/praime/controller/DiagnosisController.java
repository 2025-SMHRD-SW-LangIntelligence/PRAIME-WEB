package com.smhrd.praime.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.praime.DiagnosisDTO;
import com.smhrd.praime.entity.DiagnosisEntity;
import com.smhrd.praime.service.DiagnosisService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/diagnosis")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(
	    origins = "http://localhost:3000",  // 프론트엔드 주소를 명시적으로 설정
	    allowCredentials = "true"
	)
public class DiagnosisController {

    private final DiagnosisService diagnosisService; // 서비스 주입



    /**
     * 진단 결과 저장 API
     * 프론트엔드에서 Flask 서버로부터 받은 진단 결과를 데이터베이스에 저장
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveDiagnosis(@RequestBody DiagnosisDTO dto, HttpSession session) {
        // 세션에서 user 꺼내기
        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인이 필요합니다."));
        }
        com.smhrd.praime.entity.UserEntity user = (com.smhrd.praime.entity.UserEntity) userObj;
        dto.setUid(user.getUid());
        try {
            Long savedId = diagnosisService.saveDiagnosis(dto);
            return ResponseEntity.ok(Map.of("success", true, "savedId", savedId));
        } catch (Exception e) {
            log.error("저장 실패", e);
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    
    
    
    

    /**
     * 진단 이력 조회 API (페이징)
     */
    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getDiagnosisHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpSession session) {

        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인이 필요합니다."));
        }
        com.smhrd.praime.entity.UserEntity user = (com.smhrd.praime.entity.UserEntity) userObj;
        String uid = user.getUid();

        Map<String, Object> response = new HashMap<>();
        try {
            Page<DiagnosisEntity> diagnosisPage = diagnosisService.getDiagnosisHistory(page, size, "desc", uid);
            response.put("success", true);
            response.put("data", diagnosisPage.getContent());
            response.put("totalElements", diagnosisPage.getTotalElements());
            response.put("totalPages", diagnosisPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "진단 이력 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 라벨별 진단 결과 조회 API
     */
    @GetMapping("/search/label")
    public ResponseEntity<Map<String, Object>> getDiagnosisByLabel(
            @RequestParam String label) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("라벨별 진단 결과 조회 요청 - 라벨: {}", label);
            
            List<DiagnosisEntity> results = diagnosisService.getDiagnosisByLabel(label);
            
            response.put("success", true);
            response.put("data", results);
            response.put("count", results.size());
            
            log.info("라벨별 진단 결과 조회 성공 - {}개 결과", results.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("라벨별 진단 결과 조회 중 오류 발생", e);
            response.put("success", false);
            response.put("message", "라벨별 진단 결과 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 신뢰도별 진단 결과 조회 API
     */
    @GetMapping("/search/confidence")
    public ResponseEntity<Map<String, Object>> getDiagnosisByConfidence(
            @RequestParam Double minConfidence) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("신뢰도별 진단 결과 조회 요청 - 최소 신뢰도: {}%", minConfidence);
            
            List<DiagnosisEntity> results = diagnosisService.getDiagnosisByMinConfidence(minConfidence);
            
            response.put("success", true);
            response.put("data", results);
            response.put("count", results.size());
            response.put("minConfidence", minConfidence);
            
            log.info("신뢰도별 진단 결과 조회 성공 - {}개 결과", results.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("신뢰도별 진단 결과 조회 중 오류 발생", e);
            response.put("success", false);
            response.put("message", "신뢰도별 진단 결과 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 기간별 진단 결과 조회 API
     */
    @GetMapping("/search/date-range")
    public ResponseEntity<Map<String, Object>> getDiagnosisByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("기간별 진단 결과 조회 요청 - 시작: {}, 종료: {}", startDate, endDate);
            
            List<DiagnosisEntity> results = diagnosisService.getDiagnosisByDateRange(startDate, endDate);
            
            response.put("success", true);
            response.put("data", results);
            response.put("count", results.size());
            response.put("startDate", startDate);
            response.put("endDate", endDate);
            
            log.info("기간별 진단 결과 조회 성공 - {}개 결과", results.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("기간별 진단 결과 조회 중 오류 발생", e);
            response.put("success", false);
            response.put("message", "기간별 진단 결과 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * API 상태 확인
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "진단 API가 정상적으로 실행 중입니다.");
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }
}