// DiagnosisDTO.java (새로 생성하거나 기존 DTO에 필드 추가)
package com.smhrd.praime; // 패키지명은 프로젝트에 맞게 조정

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosisDTO {
    private String label;
    private Double confidence;
    private String resultImageBase64;
    private String uid;
    private String description; // 질병 설명 필드 추가
}