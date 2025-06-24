package com.smhrd.praime.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.smhrd.praime.repository.DailyLogRepository;
import com.smhrd.praime.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smhrd.praime.entity.DailyLogEntity;
import com.smhrd.praime.entity.UserEntity;
import com.smhrd.praime.service.DailyLogService;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/farmlog")
public class DailyLogController {

    @Autowired
    DailyLogRepository dailyLogRepository;

    @Autowired
    DailyLogService dailyLogService;
    private UserRepository userRepository;


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

    // ✅ 수정 페이지 (예: /farmlog/edit/8)
    @GetMapping("/edit/{dlid}")
    public String editPage(@PathVariable Long dlid, HttpSession session, Model model)
            throws JsonProcessingException {
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");

        if (sessionUser == null) {
            return "redirect:/";
        }

        UserEntity user = userRepository.findById(sessionUser.getUid())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        DailyLogEntity log = dailyLogRepository.findWithImagesByDlid(dlid)
                .orElseThrow(() -> new IllegalArgumentException("해당 일지를 찾을 수 없습니다: " + dlid));

        // 본인 작성글만 수정 가능
        if (!log.getUser().getUid().equals(user.getUid())) {
            return "redirect:/farmlog/board";
        }

        List<String> crops = user.getCrops();
        crops.size(); // Lazy loading

        ObjectMapper mapper = new ObjectMapper();
        String cropsJson = mapper.writeValueAsString(crops);

        model.addAttribute("log", log);
        model.addAttribute("cropList", cropsJson);
        model.addAttribute("selectedCrop", log.getDlcrop());

        return "farmlog/edit";
    }

}
