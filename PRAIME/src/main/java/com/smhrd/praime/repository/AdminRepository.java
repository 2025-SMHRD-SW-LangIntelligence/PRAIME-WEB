package com.smhrd.praime.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smhrd.praime.entiry.CropsEntity;

public interface AdminRepository extends JpaRepository<CropsEntity, Long> {

}
