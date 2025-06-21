package com.smhrd.praime.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.praime.config.FileUploadConfig2;
import com.smhrd.praime.entity.CropsEntity;
import com.smhrd.praime.entity.DailyImageEntity;
import com.smhrd.praime.entity.DailyLogEntity;
import com.smhrd.praime.service.DailyImageService;
import com.smhrd.praime.service.DailyLogService;


@Controller
@RequestMapping("/farmlog")
public class DailyLogController {

    private final DailyImageService dailyImageService;

	@Autowired
	DailyLogService dailyLogService;
	
	@Autowired
	FileUploadConfig2 fileUploadConfig;
	
    DailyLogController(DailyImageService dailyImageService) {
        this.dailyImageService = dailyImageService;
    }

	// 상세 페이지 이동
	@GetMapping("/view/{dlid}")
	public String logView(@PathVariable Long dlid, Model model) {

		Optional<DailyLogEntity> view = dailyLogService.viewPage(dlid);
		model.addAttribute("view", view.get());

		return "view";

	}

	// 새 일지 작성
	@GetMapping("/write")
	public ResponseEntity<String> logWrite(@RequestParam String dltitle,
		    @RequestParam String dlcontent,
		    @RequestParam String dlcrop,
		    @RequestParam String dlweather,
		    @RequestParam List<MultipartFile> dlimages) {
			
		
		
		dailyLogService.writeLog(dltitle, dlcontent, dlcrop, dlweather, dlimages);
		
		try {
		
		return ResponseEntity.ok("게시글과 이미지가 등록되었습니다.");
		
		} catch (Exception e) {
			
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("등록 실패");
	    }

	}

}
