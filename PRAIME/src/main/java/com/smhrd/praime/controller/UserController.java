package com.smhrd.praime.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.smhrd.praime.entiry.Role;
import com.smhrd.praime.entiry.UserEntity;
import com.smhrd.praime.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Controller
public class UserController {


    @Autowired
    private UserService userService;


    // 로그인 기능
    @PostMapping(value = "/login.do")
    public ResponseEntity<?> login(
            @RequestParam("id") String uid,
            @RequestParam String pw,
            HttpSession session) {
        
        // 1. 아이디 존재 여부 확인
        Optional<UserEntity> userOpt = userService.findByUid(uid);
        if (!userOpt.isPresent()) {
            return errorResponse("id", "존재하지 않는 아이디입니다");
        }

        UserEntity user = userOpt.get();
        
        // 2. 비밀번호 일치 여부 확인
        if (!userService.checkPassword(user, pw)) {
            return errorResponse("pw", "비밀번호가 일치하지 않습니다");
        }

        // 로그인 성공 처리
        session.setAttribute("user", user);
        
        // 역할에 따른 리다이렉트 URL 설정
        String redirectUrl = determineRedirectUrl(user.getRole());
        return ResponseEntity.ok(redirectUrl);
    }
    // 회원유형별 페이지 전환
    private String determineRedirectUrl(Role role) {
        if (Role.FARMER.equals(role)) {
        	System.out.println("농부");
            return "/farmerMainPage";
        } else if (Role.CONSUMER.equals(role)) {
        	System.out.println("소비자");
            return "/consumerMainPage";
        } else if (Role.ADMIN.equals(role)) {
        	System.out.println("관리자");
            return "/adminMainPage";
        }
        return "/";
    }    
    
//    @PostMapping("/joinFarmer.do")
//    @ResponseBody
//    public Map<String, Object> joinFarmer(@RequestParam Map<String, String> allParams) {
//        allParams.forEach((k, v) -> System.out.println(k + " = " + v));
//        // 로직 처리 후 응답
//        return Map.of("success", true);
//    }
//    
    
    @PostMapping({"/joinConsumer.do", "/joinFarmer.do"})
    @ResponseBody // 비동기 요청 처리 시 @ResponseBody 필요 (redirect 시에는 불필요할 수 있으나, Axios 요청이므로 유지)
    public String joinUser(
            @RequestParam("id") String uid,
            @RequestParam("pw") String pw,
            @RequestParam("name") String name,
            @RequestParam("tel-0") String telecom,
            @RequestParam("tel-1") String tel1,
            @RequestParam("tel-2") String tel2,
            @RequestParam("tel-3") String tel3,
            @RequestParam("email") String emailId,
            @RequestParam("email-domain") String emailDomain,
            @RequestParam("address") String address,
            @RequestParam(value = "address-detail", required = false) String addressDetail, // consumer도 있을 수 있으므로 required=false 유지

            // 농민 관련 필드들은 모두 required=false로 설정
            @RequestParam(value = "farm-name", required = false) String farmName,
            @RequestParam(value = "farm-area", required = false) String farmArea,
            @RequestParam(value = "area-unit", required = false) String areaUnit, // 면적 단위
            @RequestParam(value = "farm-address", required = false) String farmAddress,
            @RequestParam(value = "farm-address-detail", required = false) String farmAddressDetail,
            @RequestParam(value = "crops", required = false) String crops, // 쉼표로 구분된 문자열

            Model model,
            HttpServletRequest request) {

        // URI로 역할 판별
        String requestURI = request.getRequestURI();
        boolean isConsumer = requestURI.endsWith("joinConsumer.do");
        Role role = isConsumer ? Role.CONSUMER : Role.FARMER;

        // UserEntity에 모든 정보 설정
        UserEntity user = new UserEntity();
        user.setUid(uid);
        user.setPw(pw);
        user.setName(name);
        user.setTelecom(telecom);
        user.setTel1(tel1);
        user.setTel2(tel2);
        user.setTel3(tel3);
        user.setEmailId(emailId);
        user.setEmailDomain(emailDomain);
        user.setAddress(address);
        user.setAddressDetail(addressDetail);
        user.setRole(role);

        // 농민 추가 정보 처리 (role이 FARMER일 때만 해당 필드 설정)
        if (role == Role.FARMER) {
            user.setFarmName(farmName);
            // farmArea와 areaUnit을 합쳐서 farmArea 필드에 저장
            user.setFarmArea(farmArea != null && areaUnit != null ? farmArea + " " + areaUnit : null);
            user.setFarmAddress(farmAddress);
            user.setFarmAddressDetail(farmAddressDetail);

            // 농작물 처리 (쉼표로 구분된 문자열을 List<String>으로 변환)
            if (crops != null && !crops.isEmpty()) {
                user.setCrops(Arrays.asList(crops.split(",")));
            } else {
                user.setCrops(Collections.emptyList()); // 선택된 작물이 없으면 빈 리스트로 설정
            }
        } else {
            // 소비자인 경우 농민 관련 필드를 null 또는 기본값으로 설정
            user.setFarmName(null);
            user.setFarmArea(null);
            user.setFarmAddress(null);
            user.setFarmAddressDetail(null);
            user.setCrops(Collections.emptyList()); // 소비자는 작물 목록이 비어있음
        }

        try {
            userService.registerUser(user);
            // Axios 요청 성공 시 JSON 응답을 보내는 것이 일반적입니다.
            // "redirect:/" 대신 성공 메시지를 담은 JSON을 반환하고,
            // 클라이언트(Axios then 블록)에서 페이지를 리다이렉트하는 것이 좋습니다.
            // return "redirect:/login"; // 이 부분은 클라이언트에서 처리

            // 성공 응답 (Axios 요청을 고려)
            return "{\"success\": true, \"message\": \"회원가입이 완료되었습니다.\"}";

        } catch (Exception e) {
            // 에러 발생 시 로그 출력
            System.err.println("회원가입 처리 중 예외 발생: " + e.getMessage());
            e.printStackTrace(); // 스택 트레이스 출력하여 자세한 에러 확인

            // 에러 응답 (Axios 요청을 고려)
            // model.addAttribute("error", e.getMessage()); // @ResponseBody 사용 시 Model은 HTTP 응답 본문에 직접 영향을 주지 않음
            // 클라이언트에 JSON 형식의 에러 메시지 반환
            return "{\"success\": false, \"message\": \"" + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8).replace("+", "%20") + "\"}";
            
            // 만약 redirect를 강제로 해야 한다면 @ResponseBody를 제거하고 아래를 사용
            // if (role == Role.FARMER) {
            //     return "redirect:/farmers/join_step1?error=" + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            // } else {
            //     return "redirect:/consumers/join?error=" + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            // }
        }
    }
    
    
//    // 회원가입 처리
//    @PostMapping({"/joinConsumer.do", "/joinFarmer.do"})
//    public String joinUser(
//            // Spring Controller의 @RequestParam 목록 (join1에서 넘어온 값들)
//            @RequestParam("id") String uid,
//            @RequestParam("pw") String pw,
//            @RequestParam("name") String name,
//            @RequestParam("tel-0") String telecom,
//            @RequestParam("tel-1") String tel1,
//            @RequestParam("tel-2") String tel2,
//            @RequestParam("tel-3") String tel3,
//            @RequestParam("email") String emailId,
//            @RequestParam("email-domain") String emailDomain,
//            @RequestParam("address") String address,
//            @RequestParam("address-detail") String addressDetail,
//            // 아래는 농민 정보이므로 주석 처리하여 현재는 받지 않습니다.
//            // @RequestParam(value = "farm-name", required = false) String farmName,
//            // @RequestParam(value = "farm-area", required = false) String farmArea,
//            // @RequestParam(value = "area-unit", required = false) String areaUnit,
//            // @RequestParam(value = "farm-address", required = false) String farmAddress,
//            // @RequestParam(value = "farm-address-detail", required = false) String farmAddressDetail,
//            // @RequestParam(value = "crops", required = false) String crops,
//            Model model,
//            HttpServletRequest request) {
//
//        // URI로 역할 판별
//        String requestURI = request.getRequestURI();
//        // 현재는 joinFarmer.do로 호출되더라도 농민 추가 정보를 받지 않으므로,
//        // 테스트를 위해 일시적으로 모든 가입을 CONSUMER로 처리하거나
//        // FARMER로 처리하되 farmerInfo 부분만 주석 처리할 수 있습니다.
//        // 여기서는 기존 로직대로 URI 기반으로 역할을 판별하되, FARMER일지라도 추가 정보는 처리하지 않습니다.
//        boolean isConsumer = requestURI.endsWith("joinConsumer.do"); // .do 확장자 포함
//        Role role = isConsumer ? Role.CONSUMER : Role.FARMER; // FARMER라도 farmerInfo 설정은 안 함
//
//        // 기본 사용자 정보 설정
//        UserEntity user = new UserEntity();
//        user.setUid(uid);
//        user.setPw(pw);
//        user.setName(name);
//        user.setTelecom(telecom);
//        user.setTel1(tel1);
//        user.setTel2(tel2);
//        user.setTel3(tel3);
//        user.setEmailId(emailId);
//        user.setEmailDomain(emailDomain);
//        user.setAddress(address);
//        user.setAddressDetail(addressDetail);
//        user.setRole(role);
//
//        // 농민 추가 정보 처리 (현재는 주석 처리하여 받지 않습니다.)
//        // if (role == Role.FARMER) {
//        //     FarmerInfoEntity farmerInfo = new FarmerInfoEntity();
//        //     farmerInfo.setFarmName(farmName); // farmName은 이제 null일 수 있음
//        //     farmerInfo.setFarmArea(farmArea != null ? farmArea + " " + areaUnit : null);
//        //     farmerInfo.setFarmAddress(farmAddress);
//        //     farmerInfo.setFarmAddressDetail(farmAddressDetail);
//        //
//        //     if (crops != null && !crops.isEmpty()) {
//        //         farmerInfo.setCrops(Arrays.asList(crops.split(",")));
//        //     }
//        //
//        //     user.setFarmerInfo(farmerInfo);
//        // }
//
//        try {
//            userService.registerUser(user);
//            return "redirect:/login";  // 로그인 페이지로 이동
//        } catch (Exception e) {
//            model.addAttribute("error", e.getMessage());
//
//            // 실패 시 해당 역할의 첫 번째 가입 페이지로 리다이렉트
//            // 현재는 joinFarmer.do로 오더라도 농민 정보는 받지 않으므로,
//            // 에러 시 redirection URL은 상황에 맞게 조정해주세요.
//            if (role == Role.FARMER) {
//                return "redirect:/farmers/join_step1?error=" + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
//            } else {
//                return "redirect:/consumers/join?error=" + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
//            }
//        }
//    }
    
    
    
    // 비밀번호 실패시 에러메세지 출력기능
    private ResponseEntity<Map<String, String>> errorResponse(String field, String message) {
        Map<String, String> response = new HashMap<>();
        response.put("field", field);
        response.put("message", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }


}