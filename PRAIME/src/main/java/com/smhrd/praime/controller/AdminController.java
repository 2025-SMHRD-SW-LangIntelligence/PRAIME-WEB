package com.smhrd.praime.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.praime.config.FileUploadConfig;
import com.smhrd.praime.entity.CropsEntity;
import com.smhrd.praime.service.AdminService;


@Controller
public class AdminController {
	
	@Autowired
	AdminService adminService;
	
    @Autowired
	FileUploadConfig fileUploadConfig;

    // 작물 등록 기능
    // 해당 기능 테스트시 본인의 C드라이브에 crops라는 폴더를 생성하고 테스트해주세요!
    @PostMapping("/adminCategoryRegisterPage")
    public String cropsAdd(@RequestParam("crops-name") String cropName, 
    					   @RequestParam("crops-img") MultipartFile image) {
        
        String imgPath = "";
		String uploadDir = fileUploadConfig.getUploadDir(); // 이미지를 저장할 경로 - C:crops/
		System.out.println(uploadDir);
		// 1. 파일의 이름 설정
			
		String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename(); // uuid : 고유 식별자 (중복을 막을려고)
			
		// 2. 파일이 저장될 이름과 경로 설정
			
		String filePath = Paths.get(uploadDir, fileName).toString();
			
		
		// 3. 서버에 저장 및 경로 설정
			
		try {
				
			image.transferTo(new File(filePath));
			System.out.println("업로드 경로: " + filePath);
			System.out.println("파일 존재 여부: " + !image.isEmpty());
			
			
		} catch (IllegalStateException e) {
			
			System.out.println("파일 업로드 실패!!");
			e.printStackTrace();
			
		} catch (IOException e) {
			    
			System.out.println("파일 업로드 실패!!");
			e.printStackTrace();
			
		}
		

			
		// 4. DB에 저장 될 경로 문자열 설정
			
		imgPath = "/crops/"+fileName;
        

		
		CropsEntity crops = new CropsEntity();
		crops.setCropName(cropName);
		crops.setCropImg(imgPath);
		
		System.out.println("파일 저장 완료. DB 저장 시작");
		adminService.categoryRegister(crops);
		
		return "main";

    }

}