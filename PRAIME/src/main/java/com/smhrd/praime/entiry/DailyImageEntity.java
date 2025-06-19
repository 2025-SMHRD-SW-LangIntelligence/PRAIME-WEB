package com.smhrd.praime.entiry;

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
@Table(name = "dailyLogImage")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DailyImageEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long dliid;
	
	@Column(nullable = false)
	Long dlid;
	
	@Column(nullable = false)
	String dpath;
	
}
