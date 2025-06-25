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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.praime.entity.DailyImageEntity;
import com.smhrd.praime.entity.DailyLogEntity;
import com.smhrd.praime.entity.UserEntity;
import com.smhrd.praime.repository.DailyImageRepository;
import com.smhrd.praime.repository.DailyLogRepository;
import com.smhrd.praime.repository.UserRepository;

import jakarta.transaction.Transactional; // 정확한 import 확인

import lombok.RequiredArgsConstructor; // lombok 어노테이션 유지

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
    
    // --- 기존 메서드 (삭제 또는 주석 처리 고려) ---
    // public ArrayList<DailyLogEntity> readAll(Model model) { ... }
    // public Page<DailyLogEntity> readAllWithPaging(int page, int size) { ... }
    // public ArrayList<DailyLogEntity> searchLogs(String keyword, String searchOption) { ... }
    // public ArrayList<DailyLogEntity> readAllByUid(String uid) { ... }
    // public ArrayList<DailyLogEntity> searchLogsByUid(String uid, String keyword, String searchOption) { ... }
    // public Page<DailyLogEntity> readAllWithPagingByUid(String uid, int page, int size) { ... }
    // public Page<DailyLogEntity> readAllWithPagingByUid(String uid, int page, int size, String sortOrder) { ... }


    // ✅ 영농일지 작성 - 유지
    @Transactional
    public void saveLog(String dltitle, String dlcontent, String dlweather, Float dltemp,
                            LocalDateTime dldate, String dlcrop,
                            String dlwork, String dlpesticide, MultipartFile[] dlimages, UserEntity user) {
        // ... (기존 saveLog 로직 유지)
        DailyLogEntity log = new DailyLogEntity();
        log.setUser(user);
        log.setDltitle(dltitle);
        log.setDlcontent(dlcontent);
        log.setDlweather(dlweather);
        log.setDltemp(dltemp);
        log.setDldate(dldate);
        log.setDlcrop(dlcrop);
        log.setDlwork(dlwork);
        log.setDlpesticide(dlpesticide);
        log.setDlimage(new ArrayList<>()); 

        if (dlimages != null) {
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                uploadDirFile.mkdirs();
            }
            for (MultipartFile file : dlimages) {
                if (!file.isEmpty()) {
                    try {
                        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                        String filePath = uploadDir + File.separator + fileName;
                        file.transferTo(new File(filePath));
                        DailyImageEntity image = new DailyImageEntity();
                        image.setDlipath(fileName);
                        image.setDailyLog(log); 
                        log.getDlimage().add(image);
                    } catch (IOException e) {
                        System.err.println("이미지 저장 실패: " + e.getMessage());
                    }
                }
            }
        }
        dailyLogRepository.save(log);
    }	
	
	// ✅ 상세 조회 - 유지
	public Optional<DailyLogEntity> getLogDetail(Long dlid) {
		return dailyLogRepository.findWithImagesByDlid(dlid);
	}

	// ✅ 수정 처리 - 유지
	@Transactional
	public boolean updateLog(Long dlid, Map<String, String> params, List<Long> deletedImageIds,
			List<MultipartFile> newImages, UserEntity user) {
        // ... (기존 updateLog 로직 유지)
        System.out.println("====== 🌾 DailyLogService.updateLog() 호출 ======");
		System.out.println("▶️ 수정할 일지 ID: " + dlid);
		System.out.println("▶️ 수정 요청자: " + (user != null ? user.getUid() : "비로그인"));

		Optional<DailyLogEntity> optionalLog = dailyLogRepository.findById(dlid);
		if (optionalLog.isEmpty()) {
			System.out.println("⛔ 수정 대상 일지 찾을 수 없음");
			return false;
		}

		DailyLogEntity log = optionalLog.get();
		if (!log.getUser().getUid().equals(user.getUid())) {
			System.out.println("⛔ 사용자 권한 불일치 (작성자 ID: " + log.getUser().getUid() + ")");
			return false;
		}

		System.out.println("▶️ 전달된 수정 데이터:");
		for (Map.Entry<String, String> entry : params.entrySet()) {
			System.out.println("    - " + entry.getKey() + " = " + entry.getValue());
		}

		log.setDltitle(params.get("dltitle"));
		log.setDlcontent(params.get("dlcontent"));
		log.setDlcrop(params.get("dlcrop"));
		log.setDlweather(params.get("dlweather"));

		String tempStr = params.get("dltemp");
		if (tempStr != null && !tempStr.isEmpty()) {
			try {
				log.setDltemp(Float.valueOf(tempStr));
			} catch (NumberFormatException e) {
				System.err.println("⚠️ 온도 파싱 실패: " + tempStr);
			}
		}

		if (deletedImageIds != null && !deletedImageIds.isEmpty()) {
			System.out.println("🗑️ 삭제할 이미지 IDs: " + deletedImageIds);
			Iterator<DailyImageEntity> iterator = log.getDlimage().iterator();
			while (iterator.hasNext()) {
				DailyImageEntity image = iterator.next();
				if (deletedImageIds.contains(image.getDliid())) {
					String imagePath = uploadDir + File.separator + image.getDlipath();
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

		if (newImages != null && !newImages.isEmpty()) {
			System.out.println("📥 새로 추가된 이미지 수: " + newImages.size());
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
		dailyLogRepository.save(log);
		System.out.println("✅ 일지 수정 저장 완료");
		System.out.println("=========================================");
		return true;
	}

	// ✅ 영농일지 삭제 - 유지
	@Transactional
	public void deleteLog(Long dlid) {
        // ... (기존 deleteLog 로직 유지)
        DailyLogEntity log = dailyLogRepository.findById(dlid)
				.orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
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
		dailyLogRepository.delete(log);
		System.out.println("✅ 일지 및 관련 데이터 삭제 완료: DLID=" + dlid);
	}

	public boolean isLogOwner(Long dlid, UserEntity user) {
		return dailyLogRepository.findById(dlid).map(log -> log.getUser().getUid().equals(user.getUid())).orElse(false);
	}
	
    // ✅ 통합된 일지 목록 조회 메서드 (가장 중요!)
    @Transactional
    public Page<DailyLogEntity> getDailyLogs(
            int page, int size, String keyword, String searchOption, String sortOrder, String userUid) {
        
        // 1. 정렬 방향 설정
        Sort.Direction direction = sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, "dldate"); 

        // 2. Pageable 객체 생성
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<DailyLogEntity> resultPage;

        // 3. 사용자 UID 존재 여부 확인 (내 영농일지 vs 전체 영농일지)
        boolean isSpecificUserSearch = userUid != null && !userUid.trim().isEmpty();
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();

        if (isSpecificUserSearch) {
            // 특정 사용자의 일지를 조회하는 경우
            if (hasKeyword) {
                // 특정 사용자의 검색 결과
                switch (searchOption) {
                    case "title":
                        resultPage = dailyLogRepository.findByUserUidAndDltitleContaining(userUid, keyword, pageable);
                        break;
                    case "content":
                        resultPage = dailyLogRepository.findByUserUidAndDlcontentContaining(userUid, keyword, pageable);
                        break;
                    case "crop":
                        resultPage = dailyLogRepository.findByUserUidAndDlcropContaining(userUid, keyword, pageable);
                        break;
                    case "weather":
                        resultPage = dailyLogRepository.findByUserUidAndDlweatherContaining(userUid, keyword, pageable);
                        break;
                    default: // 기본은 제목으로 검색
                        resultPage = dailyLogRepository.findByUserUidAndDltitleContaining(userUid, keyword, pageable);
                        break;
                }
            } else {
                // 특정 사용자의 전체 목록
                resultPage = dailyLogRepository.findByUserUid(userUid, pageable);
            }
        } else {
            // 전체 영농일지를 조회하는 경우
            if (hasKeyword) {
                // 전체 영농일지 검색 결과
                switch (searchOption) {
                    case "title":
                        resultPage = dailyLogRepository.findByDltitleContaining(keyword, pageable);
                        break;
                    case "content":
                        resultPage = dailyLogRepository.findByDlcontentContaining(keyword, pageable);
                        break;
                    case "crop":
                        resultPage = dailyLogRepository.findByDlcropContaining(keyword, pageable);
                        break;
                    case "weather":
                        resultPage = dailyLogRepository.findByDlweatherContaining(keyword, pageable);
                        break;
                    default: // 기본은 제목으로 검색
                        resultPage = dailyLogRepository.findByDltitleContaining(keyword, pageable);
                        break;
                }
            } else {
                // 전체 영농일지 전체 목록
                resultPage = dailyLogRepository.findAll(pageable);
            }
        }
        return resultPage;
    }
}