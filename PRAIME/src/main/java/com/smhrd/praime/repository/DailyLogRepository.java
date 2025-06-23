package com.smhrd.praime.repository;

import java.util.ArrayList;
import java.util.Optional;

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
}
