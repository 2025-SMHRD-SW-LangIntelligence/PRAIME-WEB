package com.smhrd.praime.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "diagnosis_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosisEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @FullTextField 어노테이션 제거
    @Column(nullable = false, length = 100)
    private String label;

    // @GenericField 어노테이션 제거
    @Column(nullable = false)
    private Double confidence;

    // @GenericField 어노테이션 제거
    @Column(nullable = false, length = 500)
    private String imagePath;

    // --- 베이스64 로딩오래걸려서제거 ---
    // @Lob
    // @Column(nullable = false, columnDefinition = "LONGTEXT")
    // private String resultImageBase64;
    
    // 질병 설명 필드 추가 (nullable = true로 설정하여 필수가 아니도록 함)
    @Column(columnDefinition = "TEXT") // TEXT 타입으로 설정하여 긴 설명 저장 가능
    private String description;
    

    // @GenericField 어노테이션 제거
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 사용자 ID (외래키)
    @Column(name = "uid", nullable = false)
    private String uid;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}