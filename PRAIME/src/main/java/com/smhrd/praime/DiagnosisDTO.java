package com.smhrd.praime;

import lombok.Data;

@Data
public class DiagnosisDTO {
    private String label;
    private double confidence;
    private String resultImageBase64;
}
