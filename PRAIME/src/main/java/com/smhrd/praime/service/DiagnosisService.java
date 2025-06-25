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
import org.springframework.data.jpa.domain.Specification; // Add this import
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils; // Add this import
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.praime.DiagnosisDTO;
import com.smhrd.praime.entity.DiagnosisEntity;
import com.smhrd.praime.repository.DiagnosisRepository;

import jakarta.persistence.criteria.Predicate; // Add this import

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
        validateDiagnosisDTO(dto); // Use the unified validation

        String imagePath = saveBase64Image(dto.getResultImageBase64());
        log.debug("Image saved at: {}", imagePath); // Use debug for more detailed logs

        DiagnosisEntity entity = DiagnosisEntity.builder()
                .label(dto.getLabel())
                .confidence(dto.getConfidence())
                .imagePath(imagePath)
                .description(dto.getDescription())
                .uid(dto.getUid())
                .createdAt(LocalDateTime.now()) // Set createdAt here or use @PrePersist in entity
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
            if (diagnosis.getUid().equals(uid)) { // Check user ID for authorization
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
                    // Decide whether to throw an exception and rollback or just log and continue
                    // For now, we'll log and continue to delete DB record
                }
                diagnosisRepository.deleteById(did);
                log.info("Successfully deleted diagnosis record for DID={}", did);
                return true;
            } else {
                log.warn("Unauthorized deletion attempt for DID={}. User UID: {}, Owner UID: {}", did, uid, diagnosis.getUid());
                return false; // Unauthorized
            }
        }
        log.warn("Diagnosis record not found for DID={}", did);
        return false; // Not found
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

        byte[] imageBytes = Base64.getDecoder().decode(base64Image);
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
            Base64.getDecoder().decode(dto.getResultImageBase64());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("올바르지 않은 Base64 이미지입니다.");
        }
    }
}