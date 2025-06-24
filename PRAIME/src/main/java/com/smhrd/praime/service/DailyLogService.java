package com.smhrd.praime.service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.praime.entity.DailyImageEntity;
import com.smhrd.praime.entity.DailyLogEntity;
import com.smhrd.praime.entity.UserEntity;
import com.smhrd.praime.repository.DailyImageRepository;
import com.smhrd.praime.repository.DailyLogRepository;
import com.smhrd.praime.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class DailyLogService {
	
	@Autowired
    private DailyLogRepository dailyLogRepository;
    
	@Autowired
	private DailyImageRepository dailyImageRepository;
	
	@Autowired
	private UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;
	
	// 영농일지 모든 일지 불러오기(최신순)
	public ArrayList<DailyLogEntity> readAll(Model model) {
		return (ArrayList<DailyLogEntity>) dailyLogRepository.findAllByOrderByDldateDesc();
	}
	
	// ✅ 특정 사용자의 모든 일지 불러오기(최신순)
	public ArrayList<DailyLogEntity> readAllByUid(String uid) {
		return dailyLogRepository.findByUserUidOrderByDldateDesc(uid);
	}
	
	// 페이징을 위한 메서드 (무한스크롤용)
	public Page<DailyLogEntity> readAllWithPaging(int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dldate"));
		return dailyLogRepository.findAll(pageable);
	}
	
	// ✅ 특정 사용자의 페이징 조회 (무한스크롤용)
	public Page<DailyLogEntity> readAllWithPagingByUid(String uid, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dldate"));
		return dailyLogRepository.findByUserUid(uid, pageable);
	}
	
	// ✅ 특정 사용자의 페이징 조회 (정렬 기능 포함)
	public Page<DailyLogEntity> readAllWithPagingByUid(String uid, int page, int size, String sortOrder) {
		Sort.Direction direction = "desc".equals(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
		Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "dldate"));
		return dailyLogRepository.findByUserUid(uid, pageable);
	}
	
	// 영농일지 상세페이지 확인
	public Optional<DailyLogEntity> viewPage(Long dlid) {
		return dailyLogRepository.findById(dlid);
	}

	// 영농일지 작성
	@Transactional
    public void saveLog(String dltitle, String dlcontent, String dlweather, Float dltemp,
                        String dldate, String dlcrop, MultipartFile[] dlimages, UserEntity user) {

        // 1. 로그 엔티티 생성 및 필드 설정
        DailyLogEntity log = new DailyLogEntity();
        log.setUser(user);
        log.setDltitle(dltitle);
        log.setDlcontent(dlcontent);
        log.setDlweather(dlweather);
        log.setDltemp(dltemp);
        log.setDldate(java.time.LocalDate.parse(dldate)); // 날짜 문자열을 LocalDate로 변환
        log.setDlcrop(dlcrop);
        log.setDlimage(new ArrayList<>()); // 이미지 리스트 초기화
        log.setUser(user); // ✅ 반드시 설정해야 함

        // 2. 이미지 처리
        if (dlimages != null) {
            // ✅ 업로드 폴더가 없으면 자동 생성
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                uploadDirFile.mkdirs();
                System.out.println("업로드 폴더 생성: " + uploadDir);
            }
            
            for (MultipartFile file : dlimages) {
                if (!file.isEmpty()) {
                    try {
                        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                        String filePath = uploadDir + File.separator + fileName;
                        file.transferTo(new File(filePath));

                        DailyImageEntity image = new DailyImageEntity();
                        image.setDlipath(fileName);
                        image.setDailyLog(log); // 양방향 연관관계 설정

                        log.getDlimage().add(image); // 이미지 리스트에 추가
                    } catch (IOException e) {
                        System.err.println("이미지 저장 실패: " + e.getMessage());
                    }
                }
            }
        }

        // 3. DB 저장
        dailyLogRepository.save(log); // 연관 이미지도 cascade로 같이 저장됨
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
	
	// ✅ 특정 사용자의 검색 기능
	public ArrayList<DailyLogEntity> searchLogsByUid(String uid, String keyword, String searchOption) {
		switch (searchOption) {
			case "title":
				return dailyLogRepository.findByUserUidAndDltitleContainingOrderByDldateDesc(uid, keyword);
			case "content":
				return dailyLogRepository.findByUserUidAndDlcontentContainingOrderByDldateDesc(uid, keyword);
			case "crop":
				return dailyLogRepository.findByUserUidAndDlcropContainingOrderByDldateDesc(uid, keyword);
			case "weather":
				return dailyLogRepository.findByUserUidAndDlweatherContainingOrderByDldateDesc(uid, keyword);
			default:
				return dailyLogRepository.findByUserUidOrderByDldateDesc(uid);
		}
	}
}
