package com.smhrd.praime.entiry;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "user")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserEntity {
    
    @Id
    private String uid;
    
    @Column(nullable = false)
    private String pw;
    
    @Column(nullable = false)
    private String name;
    
    // 전화번호 관련 필드 (통신사 + 번호 조합)
    @Column(nullable = false)
    private String telecom; // 통신사 (KT, SKT, LG U+ 등)
    private String tel1;    // 010
    private String tel2;    // 1234
    private String tel3;    // 5678
    
    // 이메일 관련 필드
    private String emailId;     // 이메일 아이디 부분
    private String emailDomain;  // 이메일 도메인 부분 (gmail.com 등)
    
    // 주소 
    private String address;      // 우편번호 또는 주소
    private String addressDetail; // 상세주소    
    
    // 역할
	@Enumerated(EnumType.STRING)
	private Role role;
    
    
    // 전체 전화번호를 반환(-포함)
    public String getFullTel() {
        return tel1 + "-" + tel2 + "-" + tel3;
    }
    // 전체 전화번호를 반환(-포함)
    public String getTel() {
    	return tel1 +  tel2 +  tel3;
    }
    
    // 전체 이메일을 반환
    public String getFullEmail() {
        return emailId + "@" + emailDomain;
    }

 // 전체 전화번호를 tel1, tel2, tel3로 분리하여 저장하는 세터
    public void setFullTel(String fullTel) {
        if (fullTel == null || !fullTel.matches("\\d{3}-\\d{4}-\\d{4}")) {
            throw new IllegalArgumentException("전화번호 형식이 올바르지 않습니다. 예) 010-1234-5678");
        }
        String[] parts = fullTel.split("-");
        this.tel1 = parts[0];
        this.tel2 = parts[1];
        this.tel3 = parts[2];
    }

    // 전체 이메일을 emailId와 emailDomain으로 분리하여 저장하는 세터
    public void setFullEmail(String fullEmail) {
        if (fullEmail == null || !fullEmail.matches("[^@]+@[^@]+\\.[^@]+")) {
            throw new IllegalArgumentException("이메일 형식이 올바르지 않습니다. 예) user@example.com");
        }
        String[] parts = fullEmail.split("@", 2);
        this.emailId = parts[0];
        this.emailDomain = parts[1];
    }    
    

}