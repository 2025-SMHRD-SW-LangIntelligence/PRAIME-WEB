package com.smhrd.praime.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.smhrd.praime.entiry.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
	
    // 아이디 중복 확인을 위한 메서드
    boolean existsById(String id);
}