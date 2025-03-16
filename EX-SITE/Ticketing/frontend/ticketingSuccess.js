/**
 * 
 */

    // 예매 확인 버튼 클릭 시 마이페이지의 예매 확인 페이지로 포워딩
    $(function() {
      $('#view-ticketing-infopage').on('click', function() {
         if($('#payment-info').val() === 0) {
            window.close();
            window.opener.location.href = "/mypage/view?view=ticketDetail&merchantUid=" + $('#merchant-uid').text() + "$ticketingPrice=none";
         } else {
            window.close();
         window.opener.location.href = "/mypage/view?view=ticketDetail&merchantUid=" + $('#merchant-uid').text();
         }
         
     });
    });