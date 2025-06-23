package com.smhrd.praime.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "daily_log_image")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DailyImageEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long dliid;
	
	@Column(nullable = false)
	private String dlipath; // 실제 사용할 이미지 경로
	
	@ManyToOne
	@JoinColumn(name = "dlid", nullable = false)
	private DailyLogEntity dailyLog;
	
	private String dpath; // 사용하지 않지만 테이블에 존재
}
