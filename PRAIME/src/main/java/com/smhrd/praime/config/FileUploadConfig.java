package com.smhrd.praime.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    @Value("${app.upload.diagnosis-images:uploads/diagnosis}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
				.addResourceLocations("file:" + uploadPath + "/"); 
        		/*.addResourceLocations(uploadPath + "/");*/
    }
    
	// upload 될 경로 설정
	
	@Value("${file.upload-dir}")
	private String uploadDir;
	
	public String getUploadDir() {
		
		return uploadDir;
		
	} 
    
}
