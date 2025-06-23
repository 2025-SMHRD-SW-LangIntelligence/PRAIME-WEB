package com.smhrd.praime.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.praime.config.FileUploadConfig2;


@Service
public class DailyImageService {

	@Value("${file.upload-dir}")
	private String uploadDir;
	
	@Autowired
	FileUploadConfig2 fileUploadConfig2;
	
	// 이미지 파일 저장
	public String saveFile(MultipartFile file) {
        if (file.isEmpty()) return null;

        String uploadDir = fileUploadConfig2.getUploadDir();
        String originalFilename = file.getOriginalFilename();
        String newFilename = UUID.randomUUID() + "_" + originalFilename;

        try {
            Path savePath = Paths.get(uploadDir, newFilename);
            Files.createDirectories(savePath.getParent()); // 디렉토리 없으면 생성
            file.transferTo(savePath.toFile());
            return newFilename; // 또는 전체 경로로 반환
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패: " + originalFilename, e);
        }
    }

	// 이미지 파일 삭제
	public void deleteFile(String filepath) {
		try {
			Path path = Paths.get(uploadDir, filepath);
			Files.deleteIfExists(path);
		} catch (IOException e) {
			System.err.println("파일 삭제 실패: " + filepath);
		}
	}
}
