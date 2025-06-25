// This is a placeholder for your FlaskIntegrationService.
// Ensure it exists and has the methods `predictDisease` and `checkFlaskServerHealth`.
package com.smhrd.praime.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlaskIntegrationService {

    private final RestTemplate restTemplate = new RestTemplate(); // Consider using WebClient for async operations
    
    @Value("${flask.server.url}") // Configure this in application.properties/yml
    private String flaskServerUrl;

    /**
     * Flask 서버에 이미지를 전송하고 진단 결과를 받아옵니다.
     * @param file 진단할 이미지 파일
     * @param confThreshold 신뢰도 임계값
     * @return Flask 서버의 응답 Map
     */
    public Map<String, Object> predictDisease(MultipartFile file, Double confThreshold) {
        String url = flaskServerUrl + "/predict"; // Adjust Flask endpoint if different

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", file.getResource());
        body.add("conf_threshold", confThreshold);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                Map.class
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("Flask 서버 진단 요청 중 오류 발생: {}", e.getMessage(), e);
            // Handle specific Flask errors or network issues
            throw new RuntimeException("Flask 서버와 통신 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * Flask 서버의 헬스 체크를 수행합니다.
     * @return Flask 서버가 정상적으로 응답하면 true, 아니면 false
     */
    public boolean checkFlaskServerHealth() {
        String healthUrl = flaskServerUrl + "/health"; // Adjust Flask health endpoint if different
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(healthUrl, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("Flask 서버 헬스 체크 실패: {}", e.getMessage());
            return false;
        }
    }
}