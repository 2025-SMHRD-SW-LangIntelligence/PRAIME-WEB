package com.smhrd.praime.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.smhrd.praime.entiry.UserEntity;
import com.smhrd.praime.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 회원가입 처리
    public UserEntity registerUser(UserEntity user) {
        // 아이디 중복 확인
        if (userRepository.existsById(user.getUid())) {
            throw new RuntimeException("이미 사용중인 아이디입니다.");
        }
        
        // 비밀번호 암호화는 실제 프로젝트에서는 반드시 추가해야 함
        // 예: user.setPw(passwordEncoder.encode(user.getPw()));
        
        return userRepository.save(user);
    }

    // 아이디 중복 확인
    public boolean isIdDuplicate(String uid) {
        return userRepository.existsById(uid);
    }
    
	// 로그인 기능
	public UserEntity login(String uid,String pw) {
		UserEntity user = userRepository.findByUidAndPw(uid,pw);
		return user;
	}
}