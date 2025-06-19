package com.smhrd.praime.repository;

import java.util.ArrayList;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.praime.entiry.DailyLogEntity;


@Repository
public interface DailyLogRepository extends JpaRepository<DailyLogEntity, Long> {
	
	ArrayList<DailyLogEntity> findAllByOrderByWriteDayDesc();

}
