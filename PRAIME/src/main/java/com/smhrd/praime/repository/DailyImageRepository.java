package com.smhrd.praime.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.praime.entity.DailyImageEntity;

@Repository
public interface DailyImageRepository extends JpaRepository<DailyImageEntity, Long> {
	
	// 특정 일지의 이미지들 조회
	List<DailyImageEntity> findByDailyLogDlid(Long dlid);
}
