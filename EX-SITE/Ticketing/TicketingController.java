package com.teamx.exsite.controller.ticketing;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.teamx.exsite.model.dto.user.UserDTO;
import com.teamx.exsite.model.vo.ticketing.PaymentDTO;
import com.teamx.exsite.service.ticketing.PaymentService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class TicketingController {
	
	private final PaymentService paymentService;
	
	@ResponseBody
	@GetMapping(value="/ticketing/info")
	public ResponseEntity<String> checkTicketingUserInfo(HttpSession session) {
		UserDTO loginUser = (UserDTO)session.getAttribute("loginUser");
		if(loginUser == null) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("로그인");
		} else if(loginUser.getPhone() == null || loginUser.getEmail() == null || loginUser.getAddress() == null) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("개인정보");
		}
		
		return ResponseEntity.ok("정보 확인");
	}

	/**
	 * 예매 상세 페이지(팝업)을 여는 메소드
	 */
	@GetMapping("/ticketingpopup")
	public String openTicketingPopup(@RequestParam(value = "exhibitionNo", required = false) String exhibitionNo,
            @RequestParam(value = "exhibitionTitle",required = false) String exhibitionTitle,
            @RequestParam(value = "useFee",required = false) String useFee,
            @RequestParam(value = "mainImg",required = false) String mainImg,
            @RequestParam(value = "endDate",required = false) String endDate,
            @RequestParam(value = "strtDate",required = false) String strtDate,
            Model model) {
		
		model.addAttribute("exhibitionNo", exhibitionNo.trim());
		model.addAttribute("exhibitionTitle", exhibitionTitle.trim());
		model.addAttribute("useFee", useFee);
		model.addAttribute("mainImg", mainImg);
		model.addAttribute("endDate", endDate);
		model.addAttribute("strtDate", strtDate);
		
		log.info("exhibitionNo --> {}", exhibitionNo);
		log.info("exhibitionNo --> {}", exhibitionTitle);
		
		return "ticketing/ticketingPopup";
	}
	
	/**
	 * 예매 번호 생성 메소드
	 * @param session
	 * @param User
	 */
	@ResponseBody
	@PostMapping(value="createticketno", produces="application/json;charset=UTF-8")
	public Map<String, String> createTicketNo(String exhibitionNo, HttpSession session, UserDTO User) {
		// 현재 연도 추출
		Date date = new Date();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy");
		String year = sdf.format(date);
		System.out.println(year);
		
		// 랜덤값 SUFFIX 추출
		String suffix = "";
			suffix += (int)(Math.random() * 900000) + 100000 + "";
		
		UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
		
		String ticketNo = "T" + year 
						+ loginUser.getUserNo()
						+ exhibitionNo + suffix;
		Map<String, String> result = new HashMap<>();
		
		result.put("ticketNo", ticketNo);
		return result; 
	}
	
	/**
	 * 결제 정보를 임시 저장하는 메소드
	 * @param tempPayment 결제 정보를 임시 저장할 PaymentDTO 객체
	 * @return paymentService를 통해 Map에 저장 성공하면 success 반환
	 */
	@ResponseBody
	@PostMapping(value="/temppayment", produces="application/json;charset=UTF-8")
	public Map<String, String> tempPayment(PaymentDTO tempPayment) {
		String merchantUid = tempPayment.getMerchantUid();
		paymentService.getTempPayment().put(merchantUid, tempPayment);
		
		log.info("{}", paymentService.getTempPayment().get(merchantUid));
		
		Map<String, String> result = new HashMap<>();
		result.put("status", "success");
		
		return result;
	}
	
	/**
	 * 결제 후 임시 저장 정보와 결제사에서 반환한 정보를 대조하여 검증, DB에 저장하는 메소드
	 * @param verifyPayment
	 * @return
	 */
	@ResponseBody
	@PostMapping(value="/verifypayment")
	public ResponseEntity<String> verifyPayment (PaymentDTO verifyPayment, HttpSession session, String exhibitionNo,
												String visitDate, int ticketCount) {
		String indentifiedKey = verifyPayment.getMerchantUid();	// 포트원 고유 결제번호
		
		PaymentDTO cacheData = paymentService.getTempPayment().get(indentifiedKey);
		
		if (verifyPayment.getStatus().equals("failed")) {
			// 결제 요청 실패 시
			paymentService.getTempPayment().remove(indentifiedKey);
			return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body("결제에 실패했습니다. 다시 시도해 주세요.");
		} else {
			// 결제 요청 성공 시 
			if (cacheData != null) {
				boolean compareResult = paymentService.comparePayments(verifyPayment, cacheData);
				
				if (compareResult) {
					// 임시 저장 정보와 결제 응답 정보 비교 성공했을 시
					verifyPayment.setAmount(cacheData.getAmount());
					int result = paymentService.insertTicketPaymentInfo(verifyPayment, exhibitionNo, visitDate, ticketCount, session); // DB에 전달
					
					paymentService.getTempPayment().remove(indentifiedKey);	// 임시 저장 Map에서 정보 제거
					
					if (result == 1) {
						return ResponseEntity.ok("결제에 성공했습니다.");	
					} else {
						return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body("결제에 실패했습니다. 다시 시도해 주세요.");
					}
				} else {
					paymentService.getTempPayment().remove(indentifiedKey);
					return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body("임시 저장 정보와 결제 응답 정보 비교 실패");
				}
			} else {
				return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body("임시 데이터 조회 실패 오류");
			}
		
		}
		
	}
	
	/**
	 * 예매 완료 페이지에 예매 정보를 포워딩하기 위한 메소드
	 * @param merchantUid 예매 번호
	 * @param model
	 * @return 예매 완료 페이지
	 */
	@GetMapping("/ticketingsuccess")
	public String ticketingSuccess(String merchantUid, Model model) {
		
		PaymentDTO ticketingInfo = paymentService.ticketingSuccessInfo(merchantUid);
		ticketingInfo.setVisitDate(ticketingInfo.getVisitDate().substring(0, 10));
		
		model.addAttribute("ticketingInfo", ticketingInfo);
		log.info("{}" ,ticketingInfo);
		
		return "ticketing/ticketingSuccess";
	}
	
	/**
	 * 무료 전시 예매 정보 저장을 위한 메소드
	 * @param freeTicketingInfo 무료 전시 예매 정보
	 * @return 무료 전시 예매 정보 저장 성공 여부
	 */
	@PostMapping("/freeticketing")
	@ResponseBody
	public ResponseEntity<String> freeTicketing(PaymentDTO freeTicketingInfo, HttpSession session) {
		
		UserDTO loginUser = (UserDTO)session.getAttribute("loginUser");
		freeTicketingInfo.setUserNo(loginUser.getUserNo());
		
		int result = paymentService.insertFreeTicketingInfo(freeTicketingInfo);
		
		if (result == 1) { return ResponseEntity.ok("무료 티켓 정보 저장 성공"); }
		else { return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("무료 티켓 정보 저장 실패"); }
		
	}
	
	/**
	 * 무료 전시 예매 완료 페이지에 예매 정보를 포워딩하기 위한 메소드
	 * @param merchantUid 예매 번호
	 * @param model
	 * @return 예매 완료 페이지
	 */
	@GetMapping("/freeticketingsuccess")
	public String freeTicketingSuccess(String merchantUid, Model model) {
		log.info("{}" ,merchantUid);
		PaymentDTO freeTicketingInfo = paymentService.freeTicketingSuccessInfo(merchantUid);
		 freeTicketingInfo.setVisitDate(freeTicketingInfo.getVisitDate().substring(0, 10));
		
		model.addAttribute("ticketingInfo", freeTicketingInfo);
		log.info("{}" ,freeTicketingInfo);
		
		return "ticketing/ticketingSuccess";
	}
	
}
