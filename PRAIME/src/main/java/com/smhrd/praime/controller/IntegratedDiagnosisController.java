package com.smhrd.praime.controller;

import com.smhrd.praime.DiagnosisDTO;
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
            log.info("통합 진단 요청 - 파일: {}, 신뢰도: {}, 자동저장: {}", file.getOriginalFilename(), confThreshold, autoSave);

            Map<String, Object> flaskResponse = flaskIntegrationService.predictDisease(file, confThreshold);
            response.put("flaskResult", flaskResponse);

            if (autoSave && flaskResponse != null) {
                Map<String, Object> predictionDetails = (Map<String, Object>) flaskResponse.get("prediction_details");
                Map<String, Object> outputImage = (Map<String, Object>) flaskResponse.get("output_image");

                if (predictionDetails != null && outputImage != null) {
                    DiagnosisDTO dto = new DiagnosisDTO();
                    dto.setLabel((String) predictionDetails.get("class_name"));
                    Double confidence = (Double) predictionDetails.get("confidence");
                    dto.setConfidence(confidence != null ? confidence * 100 : 0.0);

                    String base64Img = (String) outputImage.get("base64_encoded_image");
                    dto.setResultImageBase64(base64Img);

                    Long savedId = diagnosisService.saveDiagnosis(dto);
                    response.put("savedDiagnosisId", savedId);
                    response.put("autoSaved", true);
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
