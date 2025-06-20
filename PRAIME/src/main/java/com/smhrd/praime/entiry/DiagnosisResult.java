package com.smhrd.praime.entiry;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "diagnosis_result")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;

    private double confidence;

    // 실제 이미지는 파일로 저장하고, 이 경로만 DB에 보관
    private String imagePath; 
}
