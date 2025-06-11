package com.smhrd.praime.entiry;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "user_test")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;
    
    @Column(nullable = false, unique = true)
    private String id;
    
    @Column(nullable = false)
    private String pw;
    
    @Column(nullable = false)
    private String name;
    
    // 전화번호 관련 필드 (통신사 + 번호 조합)
    private String telecom; // 통신사 (KT, SKT, LG U+ 등)
    private String tel1;    // 010
    private String tel2;    // 1234
    private String tel3;    // 5678
    
    // 이메일 관련 필드
    private String emailId;     // 이메일 아이디 부분
    private String emailDomain;  // 이메일 도메인 부분 (gmail.com 등)
    
    // 생년월일 (LocalDate로 관리하는 것이 좋음)
    private LocalDate birthDate;
    
    // 전체 전화번호를 반환하는 편의 메서드
    public String getFullTel() {
        return tel1 + "-" + tel2 + "-" + tel3;
    }
    
    // 전체 이메일을 반환하는 편의 메서드
    public String getFullEmail() {
        return emailId + "@" + emailDomain;
    }
    
    // 생년월일을 문자열로 반환 (yyyy-MM-dd 형식)
    public String getBirthDateString() {
        return birthDate != null ? birthDate.toString() : "";
    }
}