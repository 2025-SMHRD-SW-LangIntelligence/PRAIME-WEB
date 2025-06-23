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
import java.util.Optional;
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

    /**
     * 페이징 처리된 진단 기록 조회 메서드 (전체 사용자).
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
     * 특정 사용자의 페이징 처리된 진단 기록 조회 메서드.
     * sortOrder 파라미터에 따라 createdAt 필드를 기준으로 동적으로 정렬
     * @param page 현재 페이지 번호 (0부터 시작)
     * @param size 페이지당 아이템 수
     * @param sortOrder 정렬 순서 ("asc" 또는 "desc")
     * @param uid 사용자 ID
     * @return 페이징된 DiagnosisEntity 목록
     */
    @Transactional(readOnly = true)
    public Page<DiagnosisEntity> getDiagnosisHistory(int page, int size, String sortOrder, String uid) {
        Sort sort = Sort.by(sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);
        // 수정된 Repository 메서드 호출
        return diagnosisRepository.findByUid(uid, pageable);
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
            .description(dto.getDescription())
            .uid(dto.getUid())
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
    
    @Transactional // 트랜잭션 처리
    public boolean deleteDiagnosis(Long did, String uid) {
        // 해당 ID의 진단 이력이 존재하고, 현재 로그인한 사용자의 것인지 확인
        Optional<DiagnosisEntity> diagnosisOptional = diagnosisRepository.findById(did);
        if (diagnosisOptional.isPresent()) {
            DiagnosisEntity diagnosis = diagnosisOptional.get();
            if (diagnosis.getUid().equals(uid)) { // 사용자 ID 일치 여부 확인
                
                // 1. 파일 시스템에서 이미지 삭제
                try {
                    Path filePath = Paths.get(diagnosis.getImagePath());
                    
                    // 파일이 실제로 존재하는지 확인 후 삭제
                    if (Files.exists(filePath)) {
                        Files.delete(filePath);
                        log.info("이미지 파일 삭제 성공: {}", filePath.toString());
                    } else {
                        log.warn("이미지 파일이 존재하지 않아 삭제를 건너뜝니다: {}", filePath.toString());
                    }
                } catch (IOException e) {
                    log.error("이미지 파일 삭제 실패: {} 오류: {}", diagnosis.getImagePath(), e.getMessage());
                    // 파일 삭제 실패 시에도 DB 삭제는 진행할지, 롤백할지 정책 결정 필요
                    // 여기서는 일단 로그만 남기고 DB 삭제는 진행하도록 합니다.
                    // 만약 파일 삭제 실패 시 DB 롤백이 필요하면 RuntimeException을 throw 합니다.
                    // throw new RuntimeException("이미지 파일 삭제 중 오류 발생", e);
                }

                // 2. 데이터베이스에서 레코드 삭제
                diagnosisRepository.deleteById(did);
                log.info("진단 이력 DB 레코드 삭제 성공: DID={}, UID={}", did, uid);
                return true;
            } else {
                log.warn("진단 이력 삭제 실패: 권한 없음. DID={}, 요청 UID={}, 소유 UID={}", did, uid, diagnosis.getUid());
                return false; // 권한 없음
            }
        }
        log.warn("진단 이력 삭제 실패: 해당 DID({})를 찾을 수 없음", did);
        return false; // 진단 이력을 찾을 수 없음
    }




    

    // 이 메서드는 이제 getDiagnosisHistory(int, int, String, String) 또는 getDiagnosisHistory(int, int, String)으로 대체 가능
    /**
     * 진단 이력 조회 (페이징) - uid별 조회 없이 모든 진단 기록을 페이징
     */
    @Transactional(readOnly = true)
    public Page<DiagnosisEntity> getDiagnosisHistory(int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending()); // 기본 정렬 추가
            return diagnosisRepository.findAll(pageable);
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
     * 최신순으로 페이지의 데이터 호출 (특정 사용자)
     * 이 메서드도 상단의 getDiagnosisHistory(int, int, String, String)으로 대체 가능
     */
    public List<DiagnosisEntity> findRecentDiagnosesByUid(String uid, Pageable pageable) {
        // findByUid를 사용하고 Pageable에 정렬 정보가 포함되도록 합니다.
        return diagnosisRepository.findByUid(uid, pageable).getContent();
    }
}