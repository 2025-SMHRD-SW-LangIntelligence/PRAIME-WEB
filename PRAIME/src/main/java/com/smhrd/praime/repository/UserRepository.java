package com.smhrd.praime.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.smhrd.praime.entiry.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
	
    
	// 아이디가 DB에 있는지 체크하는 기능
	boolean existsById(String uid);
	
	// 로그인용 조회기능
	UserEntity findByUidAndPw(String uid,String pw);    
}