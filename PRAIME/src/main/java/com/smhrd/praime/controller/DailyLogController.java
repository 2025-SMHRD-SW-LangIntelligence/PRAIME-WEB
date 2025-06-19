package com.smhrd.praime.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.praime.config.FileUploadConfig2;
import com.smhrd.praime.entiry.CropsEntity;
import com.smhrd.praime.entiry.DailyImageEntity;
import com.smhrd.praime.entiry.DailyLogEntity;
import com.smhrd.praime.service.DailyImageService;
import com.smhrd.praime.service.DailyLogService;


@Controller
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

		return "farmlog/view";

	}

	// 새 일지 작성
	@PostMapping("/farmlog/write")
	public String logWrite(@RequestParam String dtitle,
		    @RequestParam String dcontent,
		    @RequestParam String pid,
		    @RequestParam String weather,
		    @RequestParam(required = false) MultipartFile[] dimages,
		    @RequestParam String dpath) {
			
		
		DailyLogEntity log = new DailyLogEntity();
		CropsEntity crop = new CropsEntity();
		
		for (int i = 0 ; i < dimages.length ; i++) {
			
			String imgPath = "";
			String uploadDir = fileUploadConfig.getUploadDir(); // 이미지를 저장할 경로 - C:/crops/
			System.out.println(uploadDir);
			// 1. 파일의 이름 설정
					
			String fileName = UUID.randomUUID() + "_" + dimages[i].getOriginalFilename(); // uuid : 고유 식별자 (중복을 막을려고)
				
			// 2. 파일이 저장될 이름과 경로 설정
					
			String filePath = Path.of(uploadDir, fileName).toString();
					
				
			// 3. 서버에 저장 및 경로 설정
					
			try {
						
				dimages[i].transferTo(new File(filePath));
				System.out.println("업로드 경로: " + filePath);
				System.out.println("파일 존재 여부: " + !dimages[i].isEmpty());
					
					
			} catch (IllegalStateException e) {
					
				System.out.println("파일 업로드 실패!!");
				e.printStackTrace();
					
			} catch (IOException e) {
					    
				System.out.println("파일 업로드 실패!!");
				e.printStackTrace();
					
			}
				

					
			// 4. DB에 저장 될 경로 문자열 설정
					
			imgPath = "/img/"+fileName;
				
			DailyImageEntity dimage = new DailyImageEntity();
				
			log.setPid(crop.getPid());
			dimage.setDpath(imgPath);
			dailyImageService.ImageSetSave(dimage);
				
		}
				
				
		log.setPid(crop.getPid());
		log.setDltitle(dtitle);
		log.setDcontent(dcontent);
		System.out.println("파일 저장 완료. DB 저장 시작");
		dailyLogService.writeLog(log);
			
		return "farmlog/board";

	}

}
