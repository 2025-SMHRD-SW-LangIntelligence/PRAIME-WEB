package com.smhrd.praime.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.praime.entiry.UserEntity;
import com.smhrd.praime.repository.UserRepository;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 로그인 처리
    public Optional<UserEntity> login(String uid, String pw) {
        Optional<UserEntity> user = userRepository.findByUid(uid);
        if (user.isPresent() && user.get().getPw().equals(pw)) {
            return user;
        }
        return Optional.empty();
    }

    // 아이디로 사용자 조회
    public Optional<UserEntity> findByUid(String uid) {
        return userRepository.findByUid(uid);
    }

    // 비밀번호 검증
    public boolean checkPassword(UserEntity user, String rawPassword) {
        return user.getPw().equals(rawPassword);
    }

    // 회원가입 처리
    public UserEntity registerUser(UserEntity user) {
        return userRepository.save(user);
    }
    
    // 아이디 중복 확인
    public boolean isIdDuplicate(String uid) {
        return userRepository.existsById(uid);
    }
    
    // 회원정보 수정용 메소드
    public void updateUser(UserEntity user) {
        userRepository.save(user); // JPA에서 save는 PK 있으면 update!
    }
}