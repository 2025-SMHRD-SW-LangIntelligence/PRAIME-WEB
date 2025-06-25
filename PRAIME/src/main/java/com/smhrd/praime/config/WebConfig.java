package com.smhrd.praime.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {


	
    private String uploadPath = "file:///C:/uploads/diagnosis/"; // 실제 이미지 저장 경로
    private String farmlogUploadPath = "file:///C:/uploads/crops/"; // farmlog 이미지 저장 경로

	
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:3000") // "*" 금지
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowCredentials(true);
    }	
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /uploads/diagnosis/** URL 패턴으로 요청이 오면 C:/uploads/diagnosis/ 디렉토리에서 파일을 찾도록 설정
        registry.addResourceHandler("/uploads/diagnosis/**")
                .addResourceLocations(uploadPath);
        
        // /uploads/farmlog/** URL 패턴으로 요청이 오면 C:/uploads/farmlog/ 디렉토리에서 파일을 찾도록 설정
        // 폴더가 없어도 자동으로 생성되도록 설정
        registry.addResourceHandler("/uploads/crops/**")
                .addResourceLocations(farmlogUploadPath)
                .setCachePeriod(3600)
                .resourceChain(true);
    }
    
}
