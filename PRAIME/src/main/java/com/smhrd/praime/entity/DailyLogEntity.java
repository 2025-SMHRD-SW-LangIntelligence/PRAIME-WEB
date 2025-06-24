package com.smhrd.praime.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

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
	
	@PrePersist
    protected void onCreate() {
        this.dldate = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "dailyLog", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference  // 부모 → 자식 방향
    private List<DailyImageEntity> dlimage = new ArrayList<>();
	
    @ManyToOne
    @JoinColumn(name = "uid", nullable = false)
    private UserEntity user;
    
}
