package com.smhrd.praime.repository;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.praime.entity.DailyLogEntity;

@Repository
public interface DailyLogRepository extends JpaRepository<DailyLogEntity, Long> {
	
	// 최신순으로 모든 일지 조회
	ArrayList<DailyLogEntity> findAllByOrderByDldateDesc();

	// 검색 메서드들 (최신순 정렬)
	ArrayList<DailyLogEntity> findByDltitleContainingOrderByDldateDesc(String keyword);
	ArrayList<DailyLogEntity> findByDlcontentContainingOrderByDldateDesc(String keyword);
	ArrayList<DailyLogEntity> findByDlcropContainingOrderByDldateDesc(String keyword);
	ArrayList<DailyLogEntity> findByDlweatherContainingOrderByDldateDesc(String keyword);
	
	// 상세 조회 (이미지 포함 fetch)
    @EntityGraph(attributePaths = {"dlimage"})
    Optional<DailyLogEntity> findWithImagesByDlid(Long dlid);
    
    // ✅ uid 기반 조회 메서드들 추가
    // 특정 사용자의 모든 일지 조회 (최신순)
    ArrayList<DailyLogEntity> findByUserUidOrderByDldateDesc(String uid);
    
    // 특정 사용자의 페이징 조회
    Page<DailyLogEntity> findByUserUid(String uid, Pageable pageable);
    
    // 특정 사용자의 검색 메서드들
    ArrayList<DailyLogEntity> findByUserUidAndDltitleContainingOrderByDldateDesc(String uid, String keyword);
    ArrayList<DailyLogEntity> findByUserUidAndDlcontentContainingOrderByDldateDesc(String uid, String keyword);
    ArrayList<DailyLogEntity> findByUserUidAndDlcropContainingOrderByDldateDesc(String uid, String keyword);
    ArrayList<DailyLogEntity> findByUserUidAndDlweatherContainingOrderByDldateDesc(String uid, String keyword);
}
