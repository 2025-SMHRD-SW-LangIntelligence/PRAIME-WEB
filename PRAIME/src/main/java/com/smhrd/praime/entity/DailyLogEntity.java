// DailyLogEntity.java

package com.smhrd.praime.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference; // 이 import를 추가!

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DailyLogEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long dlid;
	
	@Column(nullable = false)
	private String dlcrop;
	@Column(nullable = false)
	private String dlweather;
	@Column(nullable = false)
	private Float dltemp;
	@Column(nullable = false)
	private String dltitle;
	@Column(nullable = false, columnDefinition = "TEXT")
	private String dlcontent;
	@Column(nullable = false, updatable = false)
	private LocalDateTime dldate;
	
	// 농작업 필드 추가 (NOT NULL)
	@Column(nullable = false)
	private String dlwork;
	
	// 농약 필드 추가 (NULL 가능)
	@Column(nullable = true)
	private String dlpesticide;
	
	@PrePersist
    protected void onCreate() {
        this.dldate = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "dailyLog", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // DailyImageEntity와의 관계에서 '관리하는' 참조
    private List<DailyImageEntity> dlimage = new ArrayList<>();
	
    @ManyToOne
    @JoinColumn(name = "uid", nullable = false)
    @JsonBackReference // --- 이 부분이 중요! UserEntity와의 순환 참조를 끊는 역할 ---
    private UserEntity user;
    
}