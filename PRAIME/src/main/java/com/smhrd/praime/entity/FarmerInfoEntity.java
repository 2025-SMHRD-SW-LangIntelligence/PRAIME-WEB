package com.smhrd.praime.entity;


import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "farmer_info")
public class FarmerInfoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String farmName;
    private String farmArea;
    private String farmAddress;
    private String farmAddressDetail;
    
    @ElementCollection
    @CollectionTable(name = "farmer_crops", joinColumns = @JoinColumn(name = "farmer_info_id"))
    @Column(name = "crop")
    private List<String> crops;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;
    
    // getters and setters
}