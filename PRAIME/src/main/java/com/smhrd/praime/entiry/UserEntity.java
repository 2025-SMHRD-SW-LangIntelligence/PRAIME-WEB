package com.smhrd.praime.entiry; // 패키지명은 실제 프로젝트에 맞게 확인해주세요

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn; // @CollectionTable의 joinColumns에 사용
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "user") // 테이블 이름을 user로 유지
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
    private Role role; // enum Role 정의 필요

    // --- FarmerInfoEntity에서 통합된 필드들 ---
    // 농민이 아닌 경우 이 필드들은 null로 저장됩니다.
    private String farmName;
    private String farmArea; // 면적 단위 포함 (예: "1000 ha")
    private String farmAddress;
    private String farmAddressDetail;

    // List<String> crops를 별도 테이블로 관리
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_crops", joinColumns = @JoinColumn(name = "user_uid"))
    @Column(name = "crop")
    private List<String> crops;


    // --- 편의 메서드 (기존과 동일) ---
    public String getFullTel() {
        return tel1 + "-" + tel2 + "-" + tel3;
    }
    public String getTel() {
        return tel1 + tel2 + tel3;
    }
    public String getFullEmail() {
        return emailId + "@" + emailDomain;
    }

    public void setFullTel(String fullTel) {
        if (fullTel == null || !fullTel.matches("\\d{3}-\\d{4}-\\d{4}")) {
            // throw new IllegalArgumentException("전화번호 형식이 올바르지 않습니다. 예) 010-1234-5678");
            // Validation은 서비스 레이어에서 하는 것이 더 좋습니다.
            // 여기서는 넘어온 값 그대로 분리하거나, 유효성 검사 실패 시 null로 처리할 수 있습니다.
        }
        if (fullTel != null) {
            String[] parts = fullTel.split("-");
            if (parts.length == 3) {
                this.tel1 = parts[0];
                this.tel2 = parts[1];
                this.tel3 = parts[2];
            } else {
                // 형식에 맞지 않으면 기본값 또는 null 처리
                this.tel1 = null;
                this.tel2 = null;
                this.tel3 = null;
            }
        }
    }

    public void setFullEmail(String fullEmail) {
        if (fullEmail == null || !fullEmail.matches("[^@]+@[^@]+\\.[^@]+")) {
            // throw new IllegalArgumentException("이메일 형식이 올바르지 않습니다. 예) user@example.com");
        }
        if (fullEmail != null) {
            String[] parts = fullEmail.split("@", 2);
            if (parts.length == 2) {
                this.emailId = parts[0];
                this.emailDomain = parts[1];
            } else {
                this.emailId = null;
                this.emailDomain = null;
            }
        }
    }
}