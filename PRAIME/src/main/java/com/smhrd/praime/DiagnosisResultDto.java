package com.smhrd.praime;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosisResultDto {
    
    @NotBlank(message = "진단 라벨은 필수입니다.")
    private String label;
    
    @NotNull(message = "신뢰도는 필수입니다.")
    @DecimalMin(value = "0.0", message = "신뢰도는 0 이상이어야 합니다.")
    @DecimalMax(value = "100.0", message = "신뢰도는 100 이하여야 합니다.")
    private Double confidence;
    
    @NotBlank(message = "결과 이미지는 필수입니다.")
    private String resultImageBase64;
}