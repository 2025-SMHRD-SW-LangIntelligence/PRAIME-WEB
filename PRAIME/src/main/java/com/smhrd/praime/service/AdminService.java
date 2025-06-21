package com.smhrd.praime.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.praime.entity.CropsEntity;
import com.smhrd.praime.repository.AdminRepository;


@Service
public class AdminService {

    @Autowired
    AdminRepository adminRepository;

    public CropsEntity categoryRegister(CropsEntity crops) {
    	
        return adminRepository.save(crops);

    }


}
