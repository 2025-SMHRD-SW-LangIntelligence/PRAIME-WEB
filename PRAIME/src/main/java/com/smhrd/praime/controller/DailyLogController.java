package com.smhrd.praime.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.smhrd.praime.repository.DailyLogRepository;
import com.smhrd.praime.entity.DailyLogEntity;
import com.smhrd.praime.service.DailyLogService;


@Controller
@RequestMapping("/farmlog")
public class DailyLogController {

    @Autowired
    DailyLogRepository dailyLogRepository;

    @Autowired
    DailyLogService dailyLogService;

    // ✅ 게시판 목록 페이지
    @GetMapping("/board")
    public String boardPage(Model model) {
        model.addAttribute("logList", dailyLogRepository.findAllByOrderByDldateDesc());
        return "farmlog/board";
    }

    // ✅ 상세 조회
    @GetMapping("/view/{dlid}")
    public String viewPage(@PathVariable Long dlid, Model model) {
        Optional<DailyLogEntity> logOpt = dailyLogRepository.findWithImagesByDlid(dlid);
        if (logOpt.isPresent()) {
            model.addAttribute("log", logOpt.get());
            return "farmlog/view";
        } else {
            return "redirect:/farmlog/board";
        }
    }

}
