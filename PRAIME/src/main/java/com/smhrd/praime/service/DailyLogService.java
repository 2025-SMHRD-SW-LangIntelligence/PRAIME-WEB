package com.smhrd.praime.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
		return (ArrayList<DailyLogEntity>) dailyLogRepository.findAllByOrderByDldateDesc();
	}
	
	// 페이징을 위한 메서드 (무한스크롤용)
	public Page<DailyLogEntity> readAllWithPaging(int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dldate"));
		return dailyLogRepository.findAll(pageable);
	}

	// 영농일지 상세페이지 확인
	public Optional<DailyLogEntity> viewPage(Long dlid) {
		return dailyLogRepository.findById(dlid);
	}

	// 영농일지 작성
	public DailyLogEntity writeLog(String dltitle, String dlcontent, String dlcrop, String dlweather, Double dltemp, List<MultipartFile> dlimages) {
		DailyLogEntity lEntity = new DailyLogEntity();
		
		lEntity.setDltitle(dltitle);
		lEntity.setDlcontent(dlcontent);
		lEntity.setDlcrop(dlcrop);
		lEntity.setDlweather(dlweather);
		lEntity.setDltemp(dltemp);
		
		System.out.println("영농일지 저장 완료. DB 저장 시작");
		
		return dailyLogRepository.save(lEntity);
	}
	
	// 검색 기능
	public ArrayList<DailyLogEntity> searchLogs(String keyword, String searchOption) {
		switch (searchOption) {
			case "title":
				return dailyLogRepository.findByDltitleContainingOrderByDldateDesc(keyword);
			case "content":
				return dailyLogRepository.findByDlcontentContainingOrderByDldateDesc(keyword);
			case "crop":
				return dailyLogRepository.findByDlcropContainingOrderByDldateDesc(keyword);
			case "weather":
				return dailyLogRepository.findByDlweatherContainingOrderByDldateDesc(keyword);
			default:
				return dailyLogRepository.findAllByOrderByDldateDesc();
		}
	}
}
