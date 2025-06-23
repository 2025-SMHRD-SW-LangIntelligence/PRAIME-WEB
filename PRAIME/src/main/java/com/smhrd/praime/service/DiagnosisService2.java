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

import com.smhrd.praime.DiagnosisResultDto; 
import com.smhrd.praime.entity.DiagnosisEntity;
import com.smhrd.praime.repository.DiagnosisRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DiagnosisService2 {

    private final DiagnosisRepository diagnosisRepository;

    @Value("${app.upload.diagnosis-images:uploads/diagnosis}")
    private String uploadPath;

    /**
     * 페이징 처리된 진단 기록 조회 메서드.
     * sortOrder 파라미터에 따라 createdAt 필드를 기준으로 동적으로 정렬
     * Controller에서 전달하는 sortOrder 값을 기반으로 Pageable 객체에 Sort 정보를 추가
     * @param page 현재 페이지 번호 (0부터 시작)
     * @param size 페이지당 아이템 수
     * @param sortOrder 정렬 순서 ("asc" 또는 "desc")
     * @return 페이징된 DiagnosisEntity 목록
     */
    @Transactional(readOnly = true) // 읽기 전용 트랜잭션으로 성능 최적화
    public Page<DiagnosisEntity> getDiagnosisHistory(int page, int size, String sortOrder) {
        try {
            Sort sort = Sort.by(sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, "createdAt");
            Pageable pageable = PageRequest.of(page, size, sort);
            // Repository의 기본 findAll(Pageable) 메서드를 사용하여 동적 정렬을 적용합니다.
            return diagnosisRepository.findAll(pageable); // findAllByOrderByCreatedAtDesc 대신 findAll 사용
        } catch (Exception e) {
            log.error("진단 이력 조회 중 오류 발생 (페이지: {}, 크기: {}, 정렬: {})", page, size, sortOrder, e);
            throw new RuntimeException("진단 이력 조회에 실패했습니다.", e);
        }
    }

    /**
     * 모든 진단 결과를 생성일 기준 내림차순으로 가져옵니다. (페이징 없음)
     *
     * @return 모든 진단 결과를 담은 리스트
     */
    public List<DiagnosisEntity> getAllDiagnosisResultsOrderedByCreationDateDesc() {
        // 이 메서드는 페이징이 필요 없을 때만 사용
        // 특정 정렬 순서로 모든 데이터를 가져올 때 유용
        return diagnosisRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    /**
     * 진단 결과 저장 (Base64 이미지 → 파일 저장 + DB 저장)
     * DiagnosisDTO 대신 DiagnosisResultDto를 사용하는 것으로 통일
     */
    public Long saveDiagnosis(DiagnosisResultDto dto) throws IOException { // DTO 타입 통일
        validateDiagnosisResult(dto); // 사용하는 DTO에 맞춰 메서드 이름 통일

        String imagePath = saveBase64Image(dto.getResultImageBase64());
        System.out.println("imagePath : "+imagePath);
        DiagnosisEntity entity = DiagnosisEntity.builder()
            .label(dto.getLabel())
            .confidence(dto.getConfidence())
            .imagePath(imagePath)
            .build();

        diagnosisRepository.save(entity);
        return entity.getId();
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
     * 진단 결과 입력값 검증 (DiagnosisResultDto용)
     */
    private void validateDiagnosisResult(DiagnosisResultDto dto) { // DTO 타입 통일
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

    /**
     * 최신순으로 페이지의 데이터 호출
     * getContent()를 호출하여 List<DiagnosisEntity>로 반환
     * 이 메서드도 상단의 getDiagnosisHistory(int, int, String)으로 대체 가능
     */
    public List<DiagnosisEntity> findRecentDiagnoses(Pageable pageable) {
        return diagnosisRepository.findAll(pageable).getContent();
    }
}