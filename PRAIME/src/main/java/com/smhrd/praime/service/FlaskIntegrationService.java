package com.smhrd.praime.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlaskIntegrationService {

    private final RestTemplate restTemplate;

    @Value("${app.flask.base-url:http://localhost:5000}")
    private String flaskBaseUrl;

    /**
     * Flask 서버에 이미지 전송하여 AI 진단 요청
     */
    public Map<String, Object> predictDisease(MultipartFile imageFile, Double confThreshold) {
        try {
            String url = flaskBaseUrl + "/predict";

            // Multipart 요청 구성
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("files", new ByteArrayResource(imageFile.getBytes()) {
                @Override
                public String getFilename() {
                    return imageFile.getOriginalFilename();
                }
            });
            body.add("conf_threshold", confThreshold.toString());

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Flask 서버에 요청 전송
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, requestEntity, Map.class);

            log.info("Flask 서버 응답 상태: {}", response.getStatusCode());
            return response.getBody();

        } catch (IOException e) {
            log.error("파일 처리 중 오류 발생", e);
            throw new RuntimeException("파일 처리 중 오류가 발생했습니다.", e);
        } catch (Exception e) {
            log.error("Flask 서버 통신 중 오류 발생", e);
            throw new RuntimeException("AI 진단 서버와의 통신에 실패했습니다.", e);
        }
    }

    /**
     * Flask 서버 상태 확인
     */
    public boolean checkFlaskServerHealth() {
        try {
            String url = flaskBaseUrl + "/";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.warn("Flask 서버 상태 확인 실패: {}", e.getMessage());
            return false;
        }
    }
}
