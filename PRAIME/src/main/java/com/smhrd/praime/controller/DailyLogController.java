package com.smhrd.praime.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.SessionAttribute;

import com.smhrd.praime.repository.DailyLogRepository;
import com.smhrd.praime.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smhrd.praime.entity.DailyLogEntity;
import com.smhrd.praime.entity.UserEntity;
import com.smhrd.praime.service.DailyLogService;

import jakarta.servlet.http.HttpSession; // HttpSession 추가
import lombok.RequiredArgsConstructor; // ✅ Lombok RequiredArgsConstructor import 추가

@Controller
@RequestMapping("/farmlog")
@RequiredArgsConstructor // ✅ 이 어노테이션을 추가하여 final 필드를 주입받습니다.
public class DailyLogController {

    // ✅ @Autowired 제거하고, 모든 주입받을 필드를 final로 선언합니다.
    private final DailyLogRepository dailyLogRepository;
    private final DailyLogService dailyLogService;
    private final UserRepository userRepository;

    // ✅ 게시판 목록 페이지 (초기 HTML 템플릿 반환용. 실제 데이터 로드는 JS가 담당)
    @GetMapping("/board")
    public String boardPage(Model model) {
        return "farmlog/board";
    }

    // ✅ 무한 스크롤, 검색, 정렬 요청을 처리하는 API 엔드포인트 (가장 중요!)
    // board.js의 loadFromServer 함수가 호출할 엔드포인트입니다.
    @GetMapping("/data") // board.js에서 이 URL로 요청을 보낼 것입니다.
    public String getPaginatedDailyLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "title") String searchOption,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) String userUid, // ✅ 특정 사용자 일지 조회를 위한 파라미터 추가
            Model model,
            HttpSession session) { // ✅ 세션에서 로그인 사용자 정보를 가져오기 위함

        // 만약 userUid 파라미터가 명시적으로 넘어오지 않으면 세션에서 로그인된 사용자 ID를 가져옴
        // (예: "내 영농일지" 페이지에서 userUid를 특정하지 않고 일반 board.js를 사용하지만, 로그인 유저의 글만 보고 싶을 때)
        String actualUserUid = userUid;
        if (actualUserUid == null || actualUserUid.trim().isEmpty()) {
            UserEntity sessionUser = (UserEntity) session.getAttribute("user");
            if (sessionUser != null) {
                actualUserUid = sessionUser.getUid();
            }
        }

        try {
            // DailyLogService의 통합된 메서드를 호출
            Page<DailyLogEntity> dailyLogPage = dailyLogService.getDailyLogs(
                page, size, keyword, searchOption, sortOrder, actualUserUid);

            // Thymeleaf 템플릿으로 전달할 데이터 설정
            model.addAttribute("farmlogList", dailyLogPage.getContent());

            // "farmlog/board" 템플릿 내의 "board-list" 프래그먼트를 반환
            // 이렇게 하면 HTML 조각만 클라이언트에 전달됩니다.
            return "farmlog/board :: board-list";

        } catch (Exception e) {
            System.err.println("Error fetching daily logs: " + e.getMessage());
            e.printStackTrace();
            // 오류 발생 시 빈 목록을 반환하거나, 적절한 오류 메시지 포함
            model.addAttribute("farmlogList", new ArrayList<DailyLogEntity>());
            return "farmlog/board :: board-list";
        }
    }

    // ✅ 상세 조회 - 유지
    @GetMapping("/view/{dlid}")
    public String viewPage(@PathVariable Long dlid, Model model) {
        // ... (기존 viewPage 로직 유지)
        Optional<DailyLogEntity> logOpt = dailyLogRepository.findWithImagesByDlid(dlid);
        if (logOpt.isPresent()) {
            model.addAttribute("log", logOpt.get());
            return "farmlog/view";
        } else {
            return "redirect:/farmlog/board";
        }
    }

    // ✅ 수정 페이지 - 유지
    @GetMapping("/edit/{dlid}")
    public String editPage(@PathVariable Long dlid, HttpSession session, Model model)
            throws JsonProcessingException {
        // ... (기존 editPage 로직 유지)
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");

        if (sessionUser == null) {
            return "redirect:/"; // 로그인 안 되어 있으면 홈으로 리다이렉트
        }

        // ✅ NullPointerException 발생 지점 (userRepository가 null이었기 때문)
        // 이제 userRepository가 주입될 것이므로 이 에러는 사라질 것입니다.
        UserEntity user = userRepository.findById(sessionUser.getUid())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")); // ⬅️ 이 부분에서 에러가 났습니다.

        DailyLogEntity log = dailyLogRepository.findWithImagesByDlid(dlid)
                .orElseThrow(() -> new IllegalArgumentException("해당 일지를 찾을 수 없습니다: " + dlid));

        if (!log.getUser().getUid().equals(user.getUid())) {
            return "redirect:/farmlog/board"; // 작성자가 아니면 게시판으로 리다이렉트
        }

        List<String> crops = user.getCrops();
        // crops.size(); // Lazy loading - 이 라인 자체는 특별한 의미 없음.
        if (crops == null) { // NullPointerException 방지를 위해 추가
            crops = new ArrayList<>();
        }

        ObjectMapper mapper = new ObjectMapper();
        String cropsJson = mapper.writeValueAsString(crops);

        model.addAttribute("log", log);
        model.addAttribute("cropList", cropsJson);
        model.addAttribute("selectedCrop", log.getDlcrop());

        return "farmlog/edit";
    }

}