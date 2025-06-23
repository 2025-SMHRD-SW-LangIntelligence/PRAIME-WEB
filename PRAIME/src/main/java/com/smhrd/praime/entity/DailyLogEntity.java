package com.smhrd.praime.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "daily_log")
@AllArgsConstructor
@NoArgsConstructor
public class DailyLogEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long dlid;
	
	@Column(nullable = false)
	private String dlcontent;
	
	@Column(nullable = false)
	private String dlcrop;
	
	@Column(nullable = false, updatable = false)
	private LocalDate dldate;
	
	private Double dltemp; // 온도 데이터
	
	@Column(nullable = false)
	private String dltitle;
	
	@Column(nullable = false)
	private String dlweather;
	
	private String writeDay; // 사용하지 않지만 테이블에 존재
	
	private String uid; // 사용하지 않지만 테이블에 존재
	
	@PrePersist
	protected void onCreate() {
		if (this.dldate == null) {
			this.dldate = LocalDate.now();
		}
	}
}
