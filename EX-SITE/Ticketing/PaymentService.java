package com.teamx.exsite.service.ticketing;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.teamx.exsite.model.dto.user.UserDTO;
import com.teamx.exsite.model.mapper.ticketing.TicketingMapper;
import com.teamx.exsite.model.vo.ticketing.PaymentDTO;

import jakarta.servlet.http.HttpSession;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Data
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
	
	private Map<String, PaymentDTO> tempPayment = new HashMap<>();	// 결제 정보 임시 저장 Map
	private final TicketingMapper ticketingMapper;
	
	/**
	 * 전시 가격에서 문자 제거해 주는 service
	 * @param useFee 이용 요금
	 * @param session
	 * @return 문자 제거 후 숫자로 표시된 가격
	 */
	public int removePriceStr(String useFee, HttpSession session) {
		
		String numberOnly = useFee.replaceAll("[^0-9]", "");
		
		return Integer.valueOf(numberOnly);
		
	}

	/**
	 * 결제 응답 정보와 임시 저장 정보를 비교하는 서비스
	 * @param verifyPayment 결제 응답 정보
	 * @param cacheData ImpUid로 조회한 임시 저장 정보
	 */
	public boolean comparePayments(PaymentDTO verifyPayment, PaymentDTO cacheData) {
		
		boolean name = verifyPayment.getName().equals(cacheData.getName());
		boolean payAmount = verifyPayment.getPaidAmount() == cacheData.getAmount();
		boolean merchantUid = verifyPayment.getMerchantUid().equals(cacheData.getMerchantUid());
		
		log.info("{}", verifyPayment);
		log.info("{}", cacheData);
		
		if ( name && payAmount && merchantUid) {
			return true;
		} else {
			return false;
		}
		
	}

	/**
	 * 결제 응답 정보를 DB에 저장하기 위한 서비스
	 * @param cacheData ImpUid로 조회한 임시 저장 정보
	 * @param session 예매 유저 정보를 가져오기 위한 session 객체
	 * @param ticketCount 예매할 티켓 수량
	 * @param visitDate 관람일
	 * @param exhibitionNo 전시 번호
	 */
	public int insertTicketPaymentInfo(PaymentDTO verifyPayment, String exhibitionNo, String visitDate, int ticketCount, HttpSession session) {
	
		int ticketingResult = ticketingMapper.insertTicketingInfo(verifyPayment.getMerchantUid(),
				visitDate,
				ticketCount,
				exhibitionNo,
				((UserDTO)session.getAttribute("loginUser")).getUserNo(),
				verifyPayment.getName(),
				verifyPayment.getBuyerName(),
				verifyPayment.getBuyerTel(),
				verifyPayment.getBuyerEmail()
				);
				
		int paymentResult = ticketingMapper.insertPaymentInfo(verifyPayment);
		
		if (ticketingResult == 1 && paymentResult == 1) {
			return 1;
		} else {
			return 0;
		}
		
	}

	/**
	 * 예매 완료 페이지에 예매 정보 전달을 위한 서비스
	 * @param merchantUid 예매 번호
	 * @return 예매 번호로 조회한 예매 정보
	 */
	public PaymentDTO ticketingSuccessInfo(String merchantUid) {
		
		return ticketingMapper.ticketingSuccessInfo(merchantUid);
	}

	public PaymentDTO findPaymentInfo(int userNo) {
		return ticketingMapper.findPaymentInfo(userNo);
	}

	public List<PaymentDTO> findPaymentInfo(int userNo, int exhibitionNo) {
		return ticketingMapper.findPaymentInfoList(userNo, exhibitionNo);
	}
	
	/**
	 * 무료 전시 예매 정보 저장을 위한 서비스
	 * @param freeTicketingInfo 무료 전시 예매 정보
	 * @return 무료 전시 예매 정보 저장 결과
	 */
	public int insertFreeTicketingInfo(PaymentDTO freeTicketingInfo) {
		
		return ticketingMapper.insertFreeTicketingInfo(freeTicketingInfo);
	}
	
	
	/**
	 * 무료 전시 예매 완료 페이지에 예매 정보 전달을 위한 서비스
	 * @param merchantUid 예매 번호
	 * @return 예매 번호로 조회한 예매 정보
	 */
	public PaymentDTO freeTicketingSuccessInfo(String merchantUid) {
		
		return ticketingMapper.freeTicketingSuccessInfo(merchantUid);
	}
	

}
