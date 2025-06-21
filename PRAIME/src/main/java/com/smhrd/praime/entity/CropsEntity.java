package com.smhrd.praime.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "crops")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CropsEntity {

    @Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pid;
    
    @Column(nullable = false)
    private String cropName; // 등록할 작물 이름
    
    @Column(nullable = false)
    private String cropImg; // 등록할 작물의 이미지 경로

}
