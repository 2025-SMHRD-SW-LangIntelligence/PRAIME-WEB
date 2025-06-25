package com.smhrd.praime.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // 이 부분을 추가
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smhrd.praime.entity.DiagnosisEntity;

@Repository
public interface DiagnosisRepository extends JpaRepository<DiagnosisEntity, Long>, JpaSpecificationExecutor<DiagnosisEntity> {

    void deleteByUid(String uid);

    /**
     * 사용자 ID로 진단 기록을 조회하고, Pageable에 따라 페이징 및 정렬을 적용
     * 통합된 검색 메서드에서 UID 필터링에 사용됩니다.
     */
    Page<DiagnosisEntity> findByUid(String uid, Pageable pageable);

    /**
     * 특정 라벨을 포함하는 진단 결과 조회 (대소문자 구분 없이)
     * findByLabelContainingIgnoreCase는 이미 적절하므로 유지.
     */
    List<DiagnosisEntity> findByLabelContainingIgnoreCase(String label);

    /**
     * 특정 기간 내 진단 결과 조회
     * 통합된 검색 메서드에서 날짜 범위 필터링에 사용됩니다.
     */
    @Query("SELECT d FROM DiagnosisEntity d WHERE d.createdAt BETWEEN :startDate AND :endDate ORDER BY d.createdAt DESC")
    List<DiagnosisEntity> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);

    /**
     * 최소 신뢰도 이상의 진단 결과 조회 (높은 신뢰도 순)
     * findByConfidenceGreaterThanEqualOrderByConfidenceDesc는 이미 적절하므로 유지.
     */
    List<DiagnosisEntity> findByConfidenceGreaterThanEqualOrderByConfidenceDesc(Double minConfidence);
}