package com.smhrd.praime.repository;

import com.smhrd.praime.entity.DailyLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface DailyLogRepository extends JpaRepository<DailyLogEntity, Long> {

    // 기존 상세 조회 (이미지 함께 로드) - 유지
    @Query("SELECT dl FROM DailyLogEntity dl LEFT JOIN FETCH dl.dlimage WHERE dl.dlid = :dlid")
    Optional<DailyLogEntity> findWithImagesByDlid(@Param("dlid") Long dlid);

    // --- 전체 영농일지용 (검색 + 페이징/정렬) ---
    // Pageable 객체가 정렬 정보를 포함하므로, 메서드 이름에 OrderBy...Desc 같은 건 붙일 필요 없습니다.
    Page<DailyLogEntity> findByDltitleContaining(String keyword, Pageable pageable);
    Page<DailyLogEntity> findByDlcontentContaining(String keyword, Pageable pageable);
    Page<DailyLogEntity> findByDlcropContaining(String keyword, Pageable pageable);
    Page<DailyLogEntity> findByDlweatherContaining(String keyword, Pageable pageable);
    

    // --- 특정 사용자 영농일지용 (사용자 ID + 검색 + 페이징/정렬) ---
    Page<DailyLogEntity> findByUserUid(String uid, Pageable pageable); // 특정 유저의 전체/페이징 목록

    Page<DailyLogEntity> findByUserUidAndDltitleContaining(String uid, String keyword, Pageable pageable);
    Page<DailyLogEntity> findByUserUidAndDlcontentContaining(String uid, String keyword, Pageable pageable);
    Page<DailyLogEntity> findByUserUidAndDlcropContaining(String uid, String keyword, Pageable pageable);
    Page<DailyLogEntity> findByUserUidAndDlweatherContaining(String uid, String keyword, Pageable pageable);
    
    
}