package com.smhrd.praime.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

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
@RequiredArgsConstructor
public class DailyLogService {
	
	@Autowired
	private final DailyLogRepository dailyLogRepository;

	@Autowired
	private final DailyImageRepository dailyImageRepository;

	@Autowired
	private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;
    
	
	// 영농일지 모든 일지 불러오기(최신순)
	public ArrayList<DailyLogEntity> readAll(Model model) {
		return (ArrayList<DailyLogEntity>) dailyLogRepository.findAllByOrderByDldateDesc();
	}

	// 페이징을 위한 메서드 (무한스크롤용)
	public Page<DailyLogEntity> readAllWithPaging(int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dldate"));
		return dailyLogRepository.findAll(pageable);
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
    // 영농일지 작성
    @Transactional
    public void saveLog(String dltitle, String dlcontent, String dlweather, Float dltemp,
                        LocalDateTime dldate, String dlcrop,
                        String dlwork, // 농작업 필드 추가
                        String dlpesticide, // 농약 필드 추가
                        MultipartFile[] dlimages, UserEntity user) {

        // 1. 로그 엔티티 생성 및 필드 설정
        DailyLogEntity log = new DailyLogEntity();
        log.setUser(user);
        log.setDltitle(dltitle);
        log.setDlcontent(dlcontent);
        log.setDlweather(dlweather);
        log.setDltemp(dltemp);
        log.setDldate(dldate); // 날짜 문자열을 LocalDateTime로 변환
        log.setDlcrop(dlcrop);
        log.setDlwork(dlwork); // 농작업 필드 설정
        log.setDlpesticide(dlpesticide); // 농약 필드 설정
        log.setDlimage(new ArrayList<>()); // 이미지 리스트 초기화
        // log.setUser(user); // ✅ 이미 위에서 설정했으므로 중복 제거

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
	

	// 영농일지 상세페이지 확인
	public Optional<DailyLogEntity> viewPage(Long dlid) {
		return dailyLogRepository.findById(dlid);
	}

	// ✅ 상세 조회
	public Optional<DailyLogEntity> getLogDetail(Long dlid) {
		return dailyLogRepository.findWithImagesByDlid(dlid);
	}

	// ✅ 수정 처리
	@Transactional
	public boolean updateLog(Long dlid, Map<String, String> params, List<Long> deletedImageIds,
			List<MultipartFile> newImages, UserEntity user) {

		System.out.println("====== 🌾 DailyLogService.updateLog() 호출 ======");
		System.out.println("▶️ 수정할 일지 ID: " + dlid);
		System.out.println("▶️ 수정 요청자: " + (user != null ? user.getUid() : "비로그인"));

		Optional<DailyLogEntity> optionalLog = dailyLogRepository.findById(dlid);
		if (optionalLog.isEmpty()) {
			System.out.println("⛔ 수정 대상 일지 찾을 수 없음");
			return false;
		}

		DailyLogEntity log = optionalLog.get();

		// 권한 확인
		if (!log.getUser().getUid().equals(user.getUid())) {
			System.out.println("⛔ 사용자 권한 불일치 (작성자 ID: " + log.getUser().getUid() + ")");
			return false;
		}

		// 전달된 파라미터 출력
		System.out.println("▶️ 전달된 수정 데이터:");
		for (Map.Entry<String, String> entry : params.entrySet()) {
			System.out.println("   - " + entry.getKey() + " = " + entry.getValue());
		}

		// 🔧 필드 수정
		log.setDltitle(params.get("dltitle"));
		log.setDlcontent(params.get("dlcontent"));
		log.setDlcrop(params.get("dlcrop"));

		// ✅ 추가된 필드
		log.setDlweather(params.get("dlweather"));

		String tempStr = params.get("dltemp");
		if (tempStr != null && !tempStr.isEmpty()) {
			try {
				log.setDltemp(Float.valueOf(tempStr));
			} catch (NumberFormatException e) {
				System.err.println("⚠️ 온도 파싱 실패: " + tempStr);
			}
		}

		// 이미지 삭제 처리
		if (deletedImageIds != null && !deletedImageIds.isEmpty()) {
			System.out.println("🗑️ 삭제할 이미지 IDs: " + deletedImageIds);
			Iterator<DailyImageEntity> iterator = log.getDlimage().iterator();
			while (iterator.hasNext()) {
				DailyImageEntity image = iterator.next();
				if (deletedImageIds.contains(image.getDliid())) {
					String imagePath = uploadDir  + File.separator + image.getDlipath();
					File file = new File(imagePath);
					if (file.exists() && file.delete()) {
						System.out.println("✅ 이미지 파일 삭제 성공: " + imagePath);
					} else {
						System.out.println("⚠️ 이미지 파일 삭제 실패 또는 존재하지 않음: " + imagePath);
					}

					iterator.remove();
					dailyImageRepository.delete(image);
					System.out.println("🗃️ DB 이미지 삭제: DLIID=" + image.getDliid());
				}
			}
		} else {
			System.out.println("🟡 삭제할 이미지 없음");
		}

		// 새 이미지 추가
		if (newImages != null && !newImages.isEmpty()) {
			System.out.println("📥 새로 추가된 이미지 수: " + newImages.size());
			
			// ✅ 업로드 폴더가 없으면 자동 생성
			File uploadDirFile = new File(uploadDir );
			if (!uploadDirFile.exists()) {
				uploadDirFile.mkdirs();
				System.out.println("업로드 폴더 생성: " + uploadDir);
			}
			
			for (MultipartFile file : newImages) {
				if (!file.isEmpty()) {
					try {
						String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
						String filePath = uploadDir + File.separator + fileName;
						File dest = new File(filePath);
						file.transferTo(dest);
						System.out.println("✅ 새 이미지 저장: " + fileName);

						DailyImageEntity image = new DailyImageEntity();
						image.setDlipath(fileName);
						image.setDailyLog(log);
						log.getDlimage().add(image);
					} catch (IOException e) {
						System.err.println("❌ 새 이미지 저장 실패: " + file.getOriginalFilename());
						e.printStackTrace();
					}
				}
			}
		} else {
			System.out.println("🟡 추가할 새 이미지 없음");
		}

		// 저장
		dailyLogRepository.save(log);
		System.out.println("✅ 일지 수정 저장 완료");
		System.out.println("=========================================");

		return true;
	}

	// 영농일지
	@Transactional
	public void deleteLog(Long dlid) {
		DailyLogEntity log = dailyLogRepository.findById(dlid)
				.orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

		// ✅ 실제 파일 시스템의 이미지 파일들 삭제
		if (log.getDlimage() != null && !log.getDlimage().isEmpty()) {
			System.out.println("🗑️ 삭제할 이미지 파일들:");
			for (DailyImageEntity image : log.getDlimage()) {
				String imagePath = uploadDir + File.separator + image.getDlipath();
				File file = new File(imagePath);
				if (file.exists()) {
					if (file.delete()) {
						System.out.println("✅ 이미지 파일 삭제 성공: " + imagePath);
					} else {
						System.err.println("❌ 이미지 파일 삭제 실패: " + imagePath);
					}
				} else {
					System.out.println("⚠️ 이미지 파일이 존재하지 않음: " + imagePath);
				}
			}
		}

		dailyLogRepository.delete(log); // 연관된 이미지도 orphanRemoval = true 로 자동 삭제됨
		System.out.println("✅ 일지 및 관련 데이터 삭제 완료: DLID=" + dlid);
	}

	public boolean isLogOwner(Long dlid, UserEntity user) {
		return dailyLogRepository.findById(dlid).map(log -> log.getUser().getUid().equals(user.getUid())).orElse(false);
	}
	
	
	// ✅ 특정 사용자의 모든 일지 불러오기(최신순)
	public ArrayList<DailyLogEntity> readAllByUid(String uid) {
		return dailyLogRepository.findByUserUidOrderByDldateDesc(uid);
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
		

}
