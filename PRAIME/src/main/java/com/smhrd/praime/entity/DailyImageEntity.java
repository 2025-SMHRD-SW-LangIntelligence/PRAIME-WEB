package com.smhrd.praime.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
@Table(name = "dailyLogImage")
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DailyImageEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long dliid;
	
	@Column(nullable = false)
	private String dlipath;
	
	@ManyToOne
    @JoinColumn(name = "dlid") // FK로 dlid 저장됨
	@JsonBackReference  // 자식 → 부모 방향
    private DailyLogEntity dailyLog;
	
}
