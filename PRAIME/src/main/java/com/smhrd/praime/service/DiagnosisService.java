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
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.praime.DiagnosisDTO;
import com.smhrd.praime.DiagnosisResultDto;
import com.smhrd.praime.entity.DiagnosisEntity;
import com.smhrd.praime.repository.DiagnosisRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DiagnosisService {

    private final DiagnosisRepository diagnosisRepository;

    @Value("${app.upload.diagnosis-images:uploads/diagnosis}")
    private String uploadPath;

    

    // --- 기존의 페이징 처리된 진단 기록 조회 메서드 (수정 가능성 있음) ---
    // PageController에서 PageRequest.of(page, size, sort)로 Pageable 객체를 직접 생성하고 있으므로,
    // 이 메서드는 단순히 Repository의 Pageable 버전을 호출하도록 합니다.
    public Page<DiagnosisEntity> getDiagnosisHistory(int page, int size, String sortOrder) {
        Sort sort = Sort.by(sortOrder.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);
        return diagnosisRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
    /**
     * 모든 진단 결과를 생성일 기준 내림차순으로 가져옵니다. (페이징 없음)
     *
     * @return 모든 진단 결과를 담은 리스트
     */
    public List<DiagnosisEntity> getAllDiagnosisResultsOrderedByCreationDateDesc() {
        return diagnosisRepository.findAllByOrderByCreatedAtDesc();
    }    

    /**
     * 진단 결과 저장 (Base64 이미지 → 파일 저장 + DB 저장)
     */
    public Long saveDiagnosis(DiagnosisDTO dto) throws IOException {
        validateDiagnosisResult(dto);

        String imagePath = saveBase64Image(dto.getResultImageBase64());
        System.out.println("imagePath : "+imagePath);
        DiagnosisEntity entity = DiagnosisEntity.builder()
            .label(dto.getLabel())
            .confidence(dto.getConfidence())
            .imagePath(imagePath)
            .resultImageBase64(dto.getResultImageBase64())
            .build();

        diagnosisRepository.save(entity);
        return entity.getId();
    }

    private void validateDiagnosisResult(DiagnosisDTO dto) {
        if (dto.getLabel() == null || dto.getLabel().trim().isEmpty()) {
            throw new IllegalArgumentException("진단 라벨은 필수입니다.");
        }
        if (dto.getConfidence() < 0 || dto.getConfidence() > 100) {
            throw new IllegalArgumentException("신뢰도는 0~100 사이여야 합니다.");
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

    
    /**
     * 진단 이력 조회 (페이징)
     */
    @Transactional(readOnly = true)
    public Page<DiagnosisEntity> getDiagnosisHistory(int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            return diagnosisRepository.findAllByOrderByCreatedAtDesc(pageable);
        } catch (Exception e) {
            log.error("진단 이력 조회 중 오류 발생", e);
            throw new RuntimeException("진단 이력 조회에 실패했습니다.", e);
        }
    }

    /**
     * 특정 라벨로 진단 결과 조회
     */
    @Transactional(readOnly = true)
    public List<DiagnosisEntity> getDiagnosisByLabel(String label) {
        try {
            return diagnosisRepository.findByLabelContainingIgnoreCase(label);
        } catch (Exception e) {
            log.error("라벨별 진단 결과 조회 중 오류 발생", e);
            throw new RuntimeException("라벨별 진단 결과 조회에 실패했습니다.", e);
        }
    }

    /**
     * 최소 신뢰도 이상의 진단 결과 조회
     */
    @Transactional(readOnly = true)
    public List<DiagnosisEntity> getDiagnosisByMinConfidence(Double minConfidence) {
        try {
            return diagnosisRepository.findByConfidenceGreaterThanEqualOrderByConfidenceDesc(minConfidence);
        } catch (Exception e) {
            log.error("신뢰도별 진단 결과 조회 중 오류 발생", e);
            throw new RuntimeException("신뢰도별 진단 결과 조회에 실패했습니다.", e);
        }
    }

    /**
     * 특정 기간 내 진단 결과 조회
     */
    @Transactional(readOnly = true)
    public List<DiagnosisEntity> getDiagnosisByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        try {
            return diagnosisRepository.findByCreatedAtBetween(startDate, endDate);
        } catch (Exception e) {
            log.error("기간별 진단 결과 조회 중 오류 발생", e);
            throw new RuntimeException("기간별 진단 결과 조회에 실패했습니다.", e);
        }
    }

    /**
     * 진단 결과 입력값 검증
     */
    private void validateDiagnosisResult(DiagnosisResultDto dto) {
        if (dto.getLabel() == null || dto.getLabel().trim().isEmpty()) {
            throw new IllegalArgumentException("진단 라벨은 필수입니다.");
        }
        
        if (dto.getConfidence() == null || dto.getConfidence() < 0 || dto.getConfidence() > 100) {
            throw new IllegalArgumentException("신뢰도는 0-100 사이의 값이어야 합니다.");
        }
        
        if (dto.getResultImageBase64() == null || dto.getResultImageBase64().trim().isEmpty()) {
            throw new IllegalArgumentException("결과 이미지는 필수입니다.");
        }
        
        // Base64 형식 검증
        try {
            Base64.getDecoder().decode(dto.getResultImageBase64());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("올바르지 않은 Base64 이미지 형식입니다.");
        }
    }

    /**
     * Base64 인코딩된 이미지를 파일로 저장
     */
    private String saveBase64Image(String base64Image) throws IOException {
        // 업로드 디렉토리 생성
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
            log.info("업로드 디렉토리 생성: {}", uploadDir.toString());
        }
        
        // Base64 디코딩
        byte[] imageBytes = Base64.getDecoder().decode(base64Image);
        
        // 파일명 생성 (UUID + 타임스탬프)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String fileName = String.format("diagnosis_%s_%s.jpg", timestamp, UUID.randomUUID().toString().substring(0, 8));
        
        // 파일 저장
        Path filePath = uploadDir.resolve(fileName);
        try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
            fos.write(imageBytes);
        }
        
        log.info("이미지 파일 저장 완료: {}", filePath.toString());
        
        return filePath.toString();
    }
}