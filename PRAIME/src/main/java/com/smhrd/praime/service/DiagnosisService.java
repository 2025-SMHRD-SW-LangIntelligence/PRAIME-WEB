package com.smhrd.praime.service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.praime.DiagnosisDTO;
import com.smhrd.praime.entity.DiagnosisEntity;
import com.smhrd.praime.repository.DiagnosisRepository;

import jakarta.persistence.criteria.Predicate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional 
public class DiagnosisService {

    private final DiagnosisRepository diagnosisRepository;
    private final FlaskIntegrationService flaskIntegrationService;

    @Value("${app.upload.diagnosis-images:uploads/diagnosis}")
    private String uploadPath;

    /**
     * 통합 진단 기록 검색 및 페이징 메서드.
     * 다양한 필터링 (UID, 라벨, 신뢰도, 기간) 및 정렬을 지원합니다.
     *
     * @param page 현재 페이지 번호 (0부터 시작)
     * @param size 페이지당 아이템 수
     * @param sortOrder 정렬 순서 ("asc" 또는 "desc")
     * @param uid 사용자 ID (선택 사항)
     * @param label 검색할 라벨 (선택 사항)
     * @param minConfidence 최소 신뢰도 (선택 사항)
     * @param startDate 시작 날짜 (선택 사항)
     * @param endDate 종료 날짜 (선택 사항)
     * @return 페이징된 DiagnosisEntity 목록
     */
    @Transactional(readOnly = true)
    public Page<DiagnosisEntity> searchDiagnosis(
            int page, int size, String sortOrder,
            String uid, String label, Double minConfidence,
            LocalDateTime startDate, LocalDateTime endDate) {
        try {
            Sort sort = Sort.by(sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, "createdAt");
            Pageable pageable = PageRequest.of(page, size, sort);

            Specification<DiagnosisEntity> spec = (root, query, cb) -> {
                Predicate predicate = cb.conjunction(); // Start with a true predicate

                if (StringUtils.hasText(uid)) {
                    predicate = cb.and(predicate, cb.equal(root.get("uid"), uid));
                }
                if (StringUtils.hasText(label)) {
                    predicate = cb.and(predicate, cb.like(cb.lower(root.get("label")), "%" + label.toLowerCase() + "%"));
                }
                if (minConfidence != null) {
                    predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("confidence"), minConfidence));
                }
                if (startDate != null && endDate != null) {
                    predicate = cb.and(predicate, cb.between(root.get("createdAt"), startDate, endDate));
                } else if (startDate != null) {
                    predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
                } else if (endDate != null) {
                    predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
                }
                return predicate;
            };
            return diagnosisRepository.findAll(spec, pageable);

        } catch (Exception e) {
            log.error("진단 기록 검색 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("진단 기록 검색에 실패했습니다.", e);
        }
    }

    /**
     * 진단 결과 저장 (Base64 이미지 → 파일 저장 + DB 저장)
     * @param dto 진단 결과를 담은 DTO
     * @return 저장된 진단 결과의 ID
     * @throws IOException 이미지 파일 저장 중 오류 발생 시
     */
    public Long saveDiagnosis(DiagnosisDTO dto) throws IOException {
        log.info("Saving Diagnosis - DTO details: label={}, confidence={}, description={}, solution={}, uid={}",
                dto.getLabel(), dto.getConfidence(), dto.getDescription(), dto.getSolution(), dto.getUid());

        validateDiagnosisDTO(dto); // Use the unified validation

        // Base64 이미지를 파일로 저장하고 경로를 가져옵니다.
        String imagePath = saveBase64Image(dto.getResultImageBase64());
        log.debug("Image saved at: {}", imagePath);

        // DiagnosisEntity를 빌드하여 DB에 저장합니다.
        DiagnosisEntity entity = DiagnosisEntity.builder()
                .label(dto.getLabel())
                .confidence(dto.getConfidence())
                .imagePath(imagePath)
                .description(dto.getDescription())
                .solution(dto.getSolution()) // DiagnosisDTO에서 solution 필드를 여기에 추가!
                .uid(dto.getUid())
                .createdAt(LocalDateTime.now()) // @PrePersist를 사용하지 않는 경우 여기에 설정
                .build();

        diagnosisRepository.save(entity);
        log.info("Diagnosis saved successfully with ID: {}", entity.getId());
        return entity.getId();
    }

    /**
     * 진단 이력 삭제 API
     * @param did 삭제할 진단 이력 ID
     * @param uid 요청하는 사용자 ID
     * @return 삭제 성공 여부
     */
    @Transactional
    public boolean deleteDiagnosis(Long did, String uid) {
        Optional<DiagnosisEntity> diagnosisOptional = diagnosisRepository.findById(did);
        if (diagnosisOptional.isPresent()) {
            DiagnosisEntity diagnosis = diagnosisOptional.get();
            if (diagnosis.getUid().equals(uid)) { // 사용자 ID로 권한 확인
                try {
                    Path filePath = Paths.get(diagnosis.getImagePath());
                    if (Files.exists(filePath)) {
                        Files.delete(filePath);
                        log.info("Successfully deleted image file: {}", filePath);
                    } else {
                        log.warn("Image file not found, skipping deletion: {}", filePath);
                    }
                } catch (IOException e) {
                    log.error("Failed to delete image file: {} for DID={}. Error: {}", diagnosis.getImagePath(), did, e.getMessage(), e);
                    // 이미지 파일 삭제 실패 시에도 DB 레코드는 삭제할지 여부는 비즈니스 로직에 따라 결정
                    // 현재는 로그를 남기고 DB 레코드 삭제를 진행합니다.
                }
                diagnosisRepository.deleteById(did);
                log.info("Successfully deleted diagnosis record for DID={}", did);
                return true;
            } else {
                log.warn("Unauthorized deletion attempt for DID={}. User UID: {}, Owner UID: {}", did, uid, diagnosis.getUid());
                return false; // 권한 없음
            }
        }
        log.warn("Diagnosis record not found for DID={}", did);
        return false; // 찾을 수 없음
    }

    /**
     * 이미지 파일을 Flask 서버로 전송하고 진단 결과를 받습니다.
     * 이 메서드는 FlaskIntegrationService의 책임을 명확히 합니다.
     * @param file 진단할 이미지 파일
     * @param confThreshold 신뢰도 임계값
     * @return Flask 서버로부터 받은 진단 결과 Map
     */
    public Map<String, Object> predictDiseaseFromFlask(MultipartFile file, Double confThreshold) {
        return flaskIntegrationService.predictDisease(file, confThreshold);
    }

    /**
     * Flask 서버의 헬스 체크를 수행합니다.
     * @return Flask 서버의 건강 상태 (true = UP, false = DOWN)
     */
    public boolean checkFlaskServerHealth() {
        return flaskIntegrationService.checkFlaskServerHealth();
    }


    /**
     * Base64 인코딩된 이미지를 파일로 저장합니다.
     * @param base64Image Base64 인코딩된 이미지 문자열
     * @return 저장된 파일의 전체 경로
     * @throws IOException 파일 저장 중 오류 발생 시
     */
    private String saveBase64Image(String base64Image) throws IOException {
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
            log.info("Created upload directory: {}", uploadDir);
        }

        // Base64 문자열이 'data:image/jpeg;base64,'와 같은 접두사를 포함할 수 있으므로 이를 제거합니다.
        String cleanedBase64Image = base64Image;
        if (base64Image.contains(",")) {
            cleanedBase64Image = base64Image.substring(base64Image.indexOf(",") + 1);
        }

        byte[] imageBytes = Base64.getDecoder().decode(cleanedBase64Image);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String fileName = String.format("diagnosis_%s_%s.jpg", timestamp, UUID.randomUUID().toString().substring(0, 8));
        Path filePath = uploadDir.resolve(fileName);

        try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
            fos.write(imageBytes);
        }
        log.info("Image file saved to: {}", filePath);
        return filePath.toString();
    }

    /**
     * 진단 DTO 입력값 검증
     * @param dto 검증할 DiagnosisDTO 객체
     * @throws IllegalArgumentException 유효성 검증 실패 시
     */
    private void validateDiagnosisDTO(DiagnosisDTO dto) {
        if (dto.getLabel() == null || dto.getLabel().trim().isEmpty()) {
            throw new IllegalArgumentException("진단 라벨은 필수입니다.");
        }
        // Assuming confidence is a percentage (0-100)
        if (dto.getConfidence() == null || dto.getConfidence() < 0 || dto.getConfidence() > 100) {
            throw new IllegalArgumentException("신뢰도는 0-100 사이여야 합니다.");
        }
        if (dto.getResultImageBase64() == null || dto.getResultImageBase64().trim().isEmpty()) {
            throw new IllegalArgumentException("결과 이미지가 필요합니다.");
        }
        try {
            // 접두사가 있는 Base64도 처리할 수 있도록 saveBase64Image와 동일하게 처리
            String base64Content = dto.getResultImageBase64();
            if (base64Content.contains(",")) {
                base64Content = base64Content.substring(base64Content.indexOf(",") + 1);
            }
            Base64.getDecoder().decode(base64Content);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("올바르지 않은 Base64 이미지입니다.");
        }
        // solution 필드가 DTO에 추가되었으므로, 필요에 따라 null 또는 빈 문자열 체크를 추가할 수 있습니다.
        // if (dto.getSolution() == null || dto.getSolution().trim().isEmpty()) {
        //     throw new IllegalArgumentException("해결 방법은 필수입니다.");
        // }
    }
}