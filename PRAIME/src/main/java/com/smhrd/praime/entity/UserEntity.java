package com.smhrd.praime.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList; // ArrayList import 추가
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
// 필요한 경우 import 추가
import jakarta.persistence.CascadeType; // CascadeType import 추가
import jakarta.persistence.OneToMany;   // OneToMany import 추가

@Entity
@Table(name = "user")
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    private String emailId;    // 이메일 아이디 부분
    private String emailDomain; // 이메일 도메인 부분 (gmail.com 등)

    // 주소
    private String address;     // 우편번호 또는 주소
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

    @ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    @CollectionTable(name = "user_crops",
                     joinColumns = @JoinColumn(name = "user_uid"))
    @Column(name = "crop")
    private List<String> crops;

    // Casecade 외래키 포함 제약조건 관련 
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DailyLogEntity> dailyLogs = new ArrayList<>(); // NullPointerException 방지를 위해 초기화

    // *** 새로 추가하거나 수정해야 할 부분 끝 ***

    // --- 편의 메서드 ---
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
        if (fullTel != null) {
            String[] parts = fullTel.split("-");
            if (parts.length == 3) {
                this.tel1 = parts[0];
                this.tel2 = parts[1];
                this.tel3 = parts[2];
            } else {
                this.tel1 = null;
                this.tel2 = null;
                this.tel3 = null;
            }
        }
    }

    public void setFullEmail(String fullEmail) {
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