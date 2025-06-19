package com.smhrd.praime.controller;

import com.smhrd.praime.DiagnosisResultDto;
import com.smhrd.praime.service.DiagnosisService;
import com.smhrd.praime.service.FlaskIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/integrated-diagnosis")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class IntegratedDiagnosisController {

    private final FlaskIntegrationService flaskIntegrationService;
    private final DiagnosisService diagnosisService;

    /**
     * 이미지 업로드 -> Flask AI 진단 -> 결과 저장까지 통합 처리
     */
    @PostMapping("/predict-and-save")
    public ResponseEntity<Map<String, Object>> predictAndSave(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "conf_threshold", defaultValue = "0.5") Double confThreshold,
            @RequestParam(value = "auto_save", defaultValue = "false") Boolean autoSave) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("통합 진단 요청 - 파일: {}, 신뢰도: {}, 자동저장: {}", 
                    file.getOriginalFilename(), confThreshold, autoSave);

            // 1. Flask 서버에 AI 진단 요청
            Map<String, Object> flaskResponse = flaskIntegrationService.predictDisease(file, confThreshold);
            
            response.put("flaskResult", flaskResponse);
            
            // 2. 자동 저장이 활성화되고 진단 결과가 있는 경우 DB에 저장
            if (autoSave && flaskResponse != null) {
                try {
                    // Flask 응답에서 필요한 정보 추출 (응답 구조에 맞게 수정 필요)
                    Map<String, Object> predictionDetails = (Map<String, Object>) flaskResponse.get("prediction_details");
                    Map<String, Object> outputImage = (Map<String, Object>) flaskResponse.get("output_image");
                    
                    if (predictionDetails != null && outputImage != null) {
                        // DiagnosisResultDto 생성
                        DiagnosisResultDto dto = new DiagnosisResultDto();
                        // Flask 응답 구조에 따라 적절히 매핑
                        // dto.setLabel(...);
                        // dto.setConfidence(...);
                        // dto.setResultImageBase64(...);
                        
                        Long savedId = diagnosisService.saveDiagnosisResult(dto);
                        response.put("savedDiagnosisId", savedId);
                        response.put("autoSaved", true);
                    }
                } catch (Exception saveException) {
                    log.warn("자동 저장 실패, 진단 결과는 반환: {}", saveException.getMessage());
                    response.put("autoSaved", false);
                    response.put("saveError", saveException.getMessage());
                }
            }
            
            response.put("success", true);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("통합 진단 처리 중 오류 발생", e);
            response.put("success", false);
            response.put("message", "진단 처리 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Flask 서버 상태 확인
     */
    @GetMapping("/flask-health")
    public ResponseEntity<Map<String, Object>> checkFlaskHealth() {
        Map<String, Object> response = new HashMap<>();
        
        boolean isHealthy = flaskIntegrationService.checkFlaskServerHealth();
        
        response.put("flaskServerHealthy", isHealthy);
        response.put("message", isHealthy ? "Flask 서버가 정상적으로 실행 중입니다." : "Flask 서버에 연결할 수 없습니다.");
        
        return ResponseEntity.ok(response);
    }
}
