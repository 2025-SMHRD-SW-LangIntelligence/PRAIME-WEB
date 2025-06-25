package com.smhrd.praime.controller;

import java.util.List;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;

import com.smhrd.praime.entity.Role;
import com.smhrd.praime.entity.UserEntity;
import com.smhrd.praime.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
public class UserController {

	@Autowired
	private UserService userService;

	// 로그인 기능
	@PostMapping(value = "/login.do")
	public ResponseEntity<?> login(@RequestParam("id") String uid, @RequestParam String pw, HttpSession session) {

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

	@PostMapping({ "/joinConsumer.do", "/joinFarmer.do" })
	@ResponseBody // 비동기 요청 처리 시 @ResponseBody 필요 (redirect 시에는 불필요할 수 있으나, Axios 요청이므로 유지)
	public String joinUser(@RequestParam("id") String uid, @RequestParam("pw") String pw,
			@RequestParam("name") String name, @RequestParam("tel-0") String telecom,
			@RequestParam("tel-1") String tel1, @RequestParam("tel-2") String tel2, @RequestParam("tel-3") String tel3,
			@RequestParam("email") String emailId, @RequestParam("email-domain") String emailDomain,
			@RequestParam("address") String address,
			@RequestParam(value = "address-detail", required = false) String addressDetail, // consumer도 있을 수 있으므로
																							// required=false 유지

			// 농민 관련 필드들은 모두 required=false로 설정
			@RequestParam(value = "farm-name", required = false) String farmName,
			@RequestParam(value = "farm-area", required = false) String farmArea,
			@RequestParam(value = "area-unit", required = false) String areaUnit, // 면적 단위
			@RequestParam(value = "farm-address", required = false) String farmAddress,
			@RequestParam(value = "farm-address-detail", required = false) String farmAddressDetail,
			@RequestParam(value = "crops", required = false) String crops, // 쉼표로 구분된 문자열

			Model model, HttpServletRequest request) {

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

			// 성공 응답 (Axios 요청을 고려)
			return "{\"success\": true, \"message\": \"회원가입이 완료되었습니다.\"}";

		} catch (Exception e) {
			// 에러 발생 시 로그 출력
			System.err.println("회원가입 처리 중 예외 발생: " + e.getMessage());
			e.printStackTrace(); // 스택 트레이스 출력하여 자세한 에러 확인

			// 에러 응답 (Axios 요청을 고려)
			return "{\"success\": false, \"message\": \""
					+ URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8).replace("+", "%20") + "\"}";

		}
	}

	// 로그아웃 기능
	@GetMapping(value = "/logout.do")
	public String logout(HttpSession session) {
		session.invalidate();
		return "redirect:/";
	}

	// 비밀번호 실패시 에러메세지 출력기능
	private ResponseEntity<Map<String, String>> errorResponse(String field, String message) {
		Map<String, String> response = new HashMap<>();
		response.put("field", field);
		response.put("message", message);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}

	@PostMapping("/farmers/update_info")
	@ResponseBody
	public Map<String, Object> updateUserInfo(
	        @RequestParam("pw") String pw, 
	        @RequestParam("name") String name,
	        @RequestParam("tel-0") String telecom, 
	        @RequestParam("tel-1") String tel1,
	        @RequestParam("tel-2") String tel2, 
	        @RequestParam("tel-3") String tel3, 
	        @RequestParam("email") String email,
	        @RequestParam("email-domain") String emailDomain, 
	        @RequestParam("address") String address,
	        @RequestParam(value = "address-detail", required = false) String addressDetail,
	        HttpSession session) {

	    Map<String, Object> result = new HashMap<>();
	    try {
	        UserEntity user = (UserEntity) session.getAttribute("user");

	        user.setPw(pw);
	        user.setName(name);
	        user.setTelecom(telecom);
	        user.setTel1(tel1);
	        user.setTel2(tel2);
	        user.setTel3(tel3);
	        user.setEmailId(email);
	        user.setEmailDomain(emailDomain);
	        user.setAddress(address);
	        user.setAddressDetail(addressDetail);

	        userService.updateBasicInfo(user);

	        result.put("success", true);
	    } catch (Exception e) {
	        result.put("success", false);
	        result.put("message", "회원 정보 수정 중 오류가 발생했습니다: " + e.getMessage());
	    }
	    return result;
	}

	// 농장정보 수정
	@PostMapping("/farmers/update_farm")
	public String updateFarmInfo(HttpSession session,
	        @RequestParam("farm-name") String farmName,
	        @RequestParam("farm-area") String farmArea,
	        @RequestParam("area-unit") String areaUnit,
	        @RequestParam("farm-address") String farmAddress,
	        @RequestParam("farm-address-detail") String farmAddressDetail,
	        @RequestParam(value = "crops", required = false) List<String> crops) {
	    // (1) 세션에서 uid만 꺼내기
	    String uid = ((UserEntity) session.getAttribute("user")).getUid();
	    // (2) 반드시 DB에서 다시 엔티티 조회 (JPA 영속 상태)
	    UserEntity user = userService.findByUid(uid).orElseThrow();

	    // (3) 정보 갱신
	    user.setFarmName(farmName);
	    user.setFarmArea(farmArea + " " + areaUnit);
	    user.setFarmAddress(farmAddress);
	    user.setFarmAddressDetail(farmAddressDetail);
	    user.setCrops(crops != null ? crops : Collections.emptyList());

	    // (4) 저장
	    userService.updateFarmInfo(user);

	    // (5) 세션에도 동기화
	    session.setAttribute("user", user);

	    return "redirect:/myInfoFarmerPage";
	}


	@PostMapping("/withdraw.do")
	public String withdrawUser(HttpSession session) {
		String uid = ((UserEntity) session.getAttribute("user")).getUid();
	    userService.deleteUserAndRelatedData(uid);
	    session.invalidate();
	    return "redirect:/";
	}

}