package com.smhrd.praime.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.praime.entity.DailyImageEntity;

@Repository
public interface DailyImageRepository extends JpaRepository<DailyImageEntity, Long> {
	// 이미지 엔티티 관련 기본 CRUD는 JpaRepository가 제공하므로 추가 메서드는 필요없음
}
