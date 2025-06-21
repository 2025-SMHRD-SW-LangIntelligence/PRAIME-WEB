package com.smhrd.praime.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Hibernate Search 6 어노테이션 
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.GenericField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;

@Entity
@Table(name = "diagnosis_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Indexed // ✅ 이 엔티티는 검색 인덱싱 대상입니다
public class DiagnosisEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @FullTextField // ✅ 검색 가능한 텍스트 필드 (예: 병 이름 검색 등)
    @Column(nullable = false, length = 100)
    private String label;

    @GenericField // ✅ 숫자 값도 인덱싱 가능
    @Column(nullable = false)
    private Double confidence;

    @GenericField // ✅ 검색이 필요할 경우를 위해 인덱싱
    @Column(nullable = false, length = 500)
    private String imagePath;

    // --- 베이스64 로딩오래걸려서제거 ---
    // @Lob
    // @Column(nullable = false, columnDefinition = "LONGTEXT")
    // private String resultImageBase64;

    @GenericField // ✅ 날짜 정렬이나 필터링용
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}