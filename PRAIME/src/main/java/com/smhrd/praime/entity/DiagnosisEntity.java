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

    // @GenericField 어노테이션 제거
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}