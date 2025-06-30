package com.smhrd.praime.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile; // Add this import

import com.smhrd.praime.DiagnosisDTO;
import com.smhrd.praime.entity.DiagnosisEntity;
import com.smhrd.praime.entity.UserEntity;
import com.smhrd.praime.service.DiagnosisService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/diagnosis") // Changed from /api/integrated-diagnosis
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(
    origins = "http://localhost:3000", // 프론트엔드 주소를 명시적으로 설정
    allowCredentials = "true"
)
public class DiagnosisController {

    private final DiagnosisService diagnosisService; // 서비스 주입

    /**
     * 진단 결과 저장 API (기존 /save)
     * 프론트엔드에서 Flask 서버로부터 받은 진단 결과를 데이터베이스에 저장
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveDiagnosis(@RequestBody DiagnosisDTO dto, HttpSession session) {
    	log.info("Received DTO for save: {}", dto); // <-- 이 로그 추가
        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인이 필요합니다."));
        }
        UserEntity user = (UserEntity) userObj;
        dto.setUid(user.getUid()); // Set UID from session

        try {
            Long savedId = diagnosisService.saveDiagnosis(dto);
            return ResponseEntity.ok(Map.of("success", true, "savedId", savedId));
        } catch (Exception e) {
            log.error("진단 결과 저장 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "진단 결과 저장 중 오류 발생: " + e.getMessage()));
        }
    }

    /**
     * 이미지 업로드 -> Flask AI 진단 -> 결과 저장까지 통합 처리 (기존 /predict-and-save)
     * 이 엔드포인트는 FlaskIntegrationService와 연동됩니다.
     * 자동 저장은 세션에서 사용자 UID를 가져와 수행합니다.
     */
    @PostMapping("/predict-and-save")
    public ResponseEntity<Map<String, Object>> predictAndSave(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "conf_threshold", defaultValue = "0.5") Double confThreshold,
            @RequestParam(value = "auto_save", defaultValue = "false") Boolean autoSave,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("통합 진단 요청 - 파일: {}, 신뢰도: {}, 자동저장: {}", file.getOriginalFilename(), confThreshold, autoSave);

            Map<String, Object> flaskResponse = diagnosisService.predictDiseaseFromFlask(file, confThreshold);
            response.put("flaskResult", flaskResponse);

            if (autoSave && flaskResponse != null) {
                Map<String, Object> predictionDetails = (Map<String, Object>) flaskResponse.get("prediction_details");
                Map<String, Object> outputImage = (Map<String, Object>) flaskResponse.get("output_image");

                if (predictionDetails != null && outputImage != null) {
                    DiagnosisDTO dto = new DiagnosisDTO();
                    dto.setLabel((String) predictionDetails.get("class_name"));
                    Double confidence = (Double) predictionDetails.get("confidence");
                    dto.setConfidence(confidence != null ? confidence * 100 : 0.0); // Convert to 0-100 range
                    String base64Img = (String) outputImage.get("base64_encoded_image");
                    dto.setResultImageBase64(base64Img);

                    // Get user from session for auto-save
                    Object userObj = session.getAttribute("user");
                    if (userObj == null) {
                        response.put("autoSaved", false);
                        response.put("autoSaveMessage", "로그인이 필요하여 자동 저장되지 않았습니다.");
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                    }
                    UserEntity user = (UserEntity) userObj;
                    dto.setUid(user.getUid());

                    Long savedId = diagnosisService.saveDiagnosis(dto);
                    response.put("savedDiagnosisId", savedId);
                    response.put("autoSaved", true);
                } else {
                    response.put("autoSaved", false);
                    response.put("autoSaveMessage", "Flask 응답에서 진단 상세 정보나 이미지 정보를 찾을 수 없어 자동 저장되지 않았습니다.");
                }
            } else if (autoSave) {
                 response.put("autoSaved", false);
                 response.put("autoSaveMessage", "Flask 서버 응답이 유효하지 않아 자동 저장되지 않았습니다.");
            }

            response.put("success", true);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("통합 진단 처리 중 오류 발생: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "진단 처리 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    /**
     * 통합 진단 이력 검색 API (페이징, 정렬, 필터링)
     * 기존 /history, /search/label, /search/confidence, /search/date-range를 대체
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchDiagnosisHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) String uid, // 특정 사용자 UID, 없으면 로그인된 UID
            @RequestParam(required = false) String label,
            @RequestParam(required = false) Double minConfidence,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        // 만약 uid 파라미터가 명시적으로 넘어오지 않으면 세션에서 로그인된 사용자 ID를 가져옴
        String actualUid = uid;
        if (actualUid == null || actualUid.trim().isEmpty()) {
            Object userObj = session.getAttribute("user");
            if (userObj != null) {
                UserEntity sessionUser = (UserEntity) userObj;
                actualUid = sessionUser.getUid();
            } else {
                // 로그인되지 않은 상태에서 특정 UID 검색 요청도 없으면 에러 또는 전체 조회 (정책에 따라)
                // 여기서는 로그인 필요 메시지를 반환합니다.
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인이 필요하거나 특정 사용자 ID가 제공되어야 합니다."));
            }
        }

        try {
            Page<DiagnosisEntity> diagnosisPage = diagnosisService.searchDiagnosis(
                    page, size, sortOrder, actualUid, label, minConfidence, startDate, endDate);

            response.put("success", true);
            response.put("data", diagnosisPage.getContent());
            response.put("totalElements", diagnosisPage.getTotalElements());
            response.put("totalPages", diagnosisPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("진단 이력 검색 중 오류 발생: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "진단 이력 검색 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 진단 이력 삭제 API
     */
    @DeleteMapping("/{did}") // PathVariable로 삭제할 진단 이력 ID를 받음
    public ResponseEntity<Map<String, Object>> deleteDiagnosis(@PathVariable Long did, HttpSession session) {
        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인이 필요합니다."));
        }
        UserEntity user = (UserEntity) userObj;
        String uid = user.getUid();

        try {
            boolean deleted = diagnosisService.deleteDiagnosis(did, uid); // Service 계층에 삭제 로직 위임
            if (deleted) {
                return ResponseEntity.ok(Map.of("success", true, "message", "진단 이력이 성공적으로 삭제되었습니다."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "해당 진단 이력을 찾을 수 없거나 삭제 권한이 없습니다."));
            }
        } catch (Exception e) {
            log.error("진단 이력 삭제 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "진단 이력 삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * API 상태 확인 (Controller Health Check)
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "진단 API가 정상적으로 실행 중입니다.");
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /**
     * Flask 서버 상태 확인 (기존 /flask-health)
     */
    @GetMapping("/flask-health")
    public ResponseEntity<Map<String, Object>> checkFlaskHealth() {
        Map<String, Object> response = new HashMap<>();
        boolean isHealthy = diagnosisService.checkFlaskServerHealth(); // Delegate to service
        response.put("flaskServerHealthy", isHealthy);
        response.put("message", isHealthy ? "Flask 서버가 정상적으로 실행 중입니다." : "Flask 서버에 연결할 수 없습니다.");
        return ResponseEntity.ok(response);
    }
}