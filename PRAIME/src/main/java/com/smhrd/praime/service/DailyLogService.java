package com.smhrd.praime.service;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import com.smhrd.praime.entiry.DailyLogEntity;
import com.smhrd.praime.repository.DailyLogRepository;

@Service
public class DailyLogService {

	
	@Autowired
	DailyLogRepository dailyLogRepository;

	
	// 영농일지 모든 일지 불러오기(최신순)

	public ArrayList<DailyLogEntity> readAll(Model model) {
		
		return (ArrayList<DailyLogEntity>)dailyLogRepository.findAllByOrderByWriteDayDesc();	
		
	}
	
	// 영농일지 상세페이지 확인

	public Optional<DailyLogEntity> viewPage(Long dlid) {
		
		return dailyLogRepository.findById(dlid);
		
	}

	// 영농일지 작성

	public DailyLogEntity writeLog(DailyLogEntity entity) {

		return dailyLogRepository.save(entity);

	}
}
