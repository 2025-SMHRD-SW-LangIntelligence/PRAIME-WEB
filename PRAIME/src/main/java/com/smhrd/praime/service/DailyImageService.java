package com.smhrd.praime.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.praime.entity.DailyImageEntity;
import com.smhrd.praime.repository.DailyImageRepository;


@Service
public class DailyImageService {
	
	@Autowired
	DailyImageRepository dailyImageRepository;
	
	public DailyImageEntity ImageSetSave(DailyImageEntity entity) {
		
		return dailyImageRepository.save(entity);
		
	}
	
}
