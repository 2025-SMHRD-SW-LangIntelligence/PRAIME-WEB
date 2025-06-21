package com.smhrd.praime.entity;

import java.time.LocalDate;


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
@Table(name = "dailyLog")
@AllArgsConstructor
@NoArgsConstructor
public class DailyLogEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long dlid;
	
	@Column(nullable = false)
	private String dlcrop;
	@Column(nullable = false)
	private String dlweather;
	@Column(nullable = false)
	private String dltitle;
	@Column(nullable = false, columnDefinition = "TEXT")
	private String dlcontent;
	@Column(nullable = false, updatable = false)
	private LocalDate dldate;
	
	private String writeDay;
	
	@PrePersist
	protected void writeDay() {
		
		this.dldate = LocalDate.now();
		
	}
	
}
