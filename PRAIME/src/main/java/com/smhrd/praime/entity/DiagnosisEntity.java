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

    @Column(nullable = false, length = 100)
    private String label;

    @Column(nullable = false)
    private Double confidence;

    @Column(nullable = false, length = 500)
    private String imagePath;

    @Column(columnDefinition = "TEXT") // TEXT 타입으로 설정하여 긴 설명 저장 가능
    private String description;

    @Column(columnDefinition = "TEXT") // 해결 방법 필드 추가, 긴 텍스트 저장을 위해 TEXT 타입 사용
    private String solution;
    // ---------------------------------

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