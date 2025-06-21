package com.smhrd.praime.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.praime.entity.DailyLogEntity;
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

	public DailyLogEntity writeLog(String dltitle, String dlcontent, String dlcrop, String dlweather, List<MultipartFile> dlimages) {
		
		DailyLogEntity lEntity = new DailyLogEntity();
				
		lEntity.setDlcrop(dlcrop);
		lEntity.setDltitle(dltitle);
		lEntity.setDlcontent(dlcontent);
		System.out.println("파일 저장 완료. DB 저장 시작");
		
		
		
		return dailyLogRepository.save(lEntity);

	}
}
