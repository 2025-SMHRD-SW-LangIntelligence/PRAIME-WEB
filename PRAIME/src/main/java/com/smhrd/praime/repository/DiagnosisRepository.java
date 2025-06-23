package com.smhrd.praime.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smhrd.praime.entity.DiagnosisEntity;

@Repository
public interface DiagnosisRepository extends JpaRepository<DiagnosisEntity, Long> {
    
	
	/**
	 * 사용자 ID로 진단 기록을 조회하고, Pageable에 따라 페이징 및 정렬을 적용
	 */
    Page<DiagnosisEntity> findByUid(String uid, Pageable pageable);
	
	
    /**
     * 최근 진단 결과 조회 (생성일 기준 내림차순)
     */
    Page<DiagnosisEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * 모든 진단 결과 조회 (생성일 기준 내림차순) - 페이징 없이 모든 데이터
     */
    List<DiagnosisEntity> findAllByOrderByCreatedAtDesc(); 
        
    
    /**
     * 특정 라벨로 진단 결과 조회 (대소문자 구분 없이)
     */
    List<DiagnosisEntity> findByLabelContainingIgnoreCase(String label);
    
    /**
     * 특정 기간 내 진단 결과 조회
     */
    @Query("SELECT d FROM DiagnosisEntity d WHERE d.createdAt BETWEEN :startDate AND :endDate ORDER BY d.createdAt DESC")
    List<DiagnosisEntity> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                                 @Param("endDate") LocalDateTime endDate);
    
    /**
     * 신뢰도 기준 진단 결과 조회 (높은 신뢰도 순)
     */
    List<DiagnosisEntity> findByConfidenceGreaterThanEqualOrderByConfidenceDesc(Double minConfidence);
    
    /**
     * 특정 라벨과 최소 신뢰도 조건으로 조회
     */
    @Query("SELECT d FROM DiagnosisEntity d WHERE d.label = :label AND d.confidence >= :minConfidence ORDER BY d.createdAt DESC")
    List<DiagnosisEntity> findByLabelAndMinConfidence(@Param("label") String label, 
                                                      @Param("minConfidence") Double minConfidence);

    Page<DiagnosisEntity> findAllByUidOrderByCreatedAtDesc(String uid, Pageable pageable);
}