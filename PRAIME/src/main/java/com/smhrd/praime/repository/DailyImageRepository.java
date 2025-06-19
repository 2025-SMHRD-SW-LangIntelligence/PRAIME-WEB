package com.smhrd.praime.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.praime.entiry.DailyImageEntity;


@Repository
public interface DailyImageRepository extends JpaRepository<DailyImageEntity, Long>{

}
