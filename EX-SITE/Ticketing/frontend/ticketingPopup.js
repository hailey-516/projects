/**
 * 
 */

function generateCalendar(year, month, exhibitionStart, exhibitionEnd) {
    const calendarElement = document.querySelector('.select-date');
    const monthYearElement = document.getElementById('month-year');
    const dayContainer = document.querySelector('.day-container');

    // 오늘 날짜 또는 전시 시작일 중 더 나중 날짜를 기준으로 설정
    const today = new Date();
    const startDate = exhibitionStart > today ? exhibitionStart : today; // 선택 가능 시작 날짜
    const endDate = new Date(exhibitionEnd); // 전시 종료일

    // 해당 년월을 표시
    const displayMonth = String(month + 1).padStart(2, '0');
    monthYearElement.textContent = `${year}.${displayMonth}`;

    // 이전 달력 내용 초기화
    calendarElement.innerHTML = '';
    dayContainer.innerHTML = '';

    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
    daysOfWeek.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.textContent = day;
        dayContainer.appendChild(dayElement);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // 이전 달 날짜 채우기
    const prevLastDate = new Date(year, month, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
        const dateElement = document.createElement('div');
        dateElement.classList.add('date', 'prev-month');
        dateElement.textContent = prevLastDate - firstDay + 1 + i;
        calendarElement.appendChild(dateElement);
    }

    // 현재 달 날짜 채우기
    for (let date = 1; date <= lastDate; date++) {
        const dateElement = document.createElement('div');
        dateElement.classList.add('date', 'current-month');
        const cellDate = new Date(year, month, date); // 셀 날짜 생성

        // 현재 날짜가 선택 가능 날짜 이전 또는 종료일 이후인 경우 비활성화
        if (cellDate < startDate || cellDate > endDate) {
            dateElement.classList.add('disabled'); // .disabled 클래스 추가
        } else {
            const dayOfWeek = cellDate.getDay();
            if (dayOfWeek === 0) dateElement.classList.add('sunday');
            else if (dayOfWeek === 6) dateElement.classList.add('saturday');

            dateElement.addEventListener('click', function () {
                document.querySelectorAll('.date').forEach(el => el.classList.remove('selected-date'));
                dateElement.classList.add('selected-date');
                $('#selected-date').text(dateElement.dataset.date);
            });
        }

        dateElement.textContent = date;
        dateElement.dataset.date = `${year}.${displayMonth}.${String(date).padStart(2, '0')}`;
        calendarElement.appendChild(dateElement);
    }

    // 다음 달 날짜 채우기 (빈 칸 맞추기 위해)
    const totalCells = 42; // 6주로 달력을 표시 (7일 * 6주 = 42칸)
    const currentCells = firstDay + lastDate;
    const nextDays = totalCells - currentCells;
    for (let i = 1; i <= nextDays; i++) {
        const dateElement = document.createElement('div');
        dateElement.classList.add('date', 'next-month');
        dateElement.textContent = i;
        calendarElement.appendChild(dateElement);
    }
}

// 오늘 날짜 기준으로 달력 생성
const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();
const exhibitionStartTimestamp = document.getElementById("strtDate").value; // 전시 시작일 설정
const exhibitionStart = new Date(parseInt(exhibitionStartTimestamp));
const exhibitionEndTimestamp = document.getElementById("endDate").value;    // 전시 종료일 설정
const exhibitionEnd = new Date(parseInt(exhibitionEndTimestamp));
generateCalendar(currentYear, currentMonth, exhibitionStart, exhibitionEnd);

document.getElementById('prev-month').addEventListener('click', function () {
    // 현재 년도와 월이 전시 시작일의 년도와 월보다 이전으로 넘어가지 않음
    if (
        currentYear > exhibitionStart.getFullYear() ||
        (currentYear === exhibitionStart.getFullYear() && currentMonth > exhibitionStart.getMonth())
    ) {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentYear, currentMonth, exhibitionStart, exhibitionEnd);
    }
});

document.getElementById('next-month').addEventListener('click', function () {
    // 현재 년도와 월이 전시 종료일의 년도와 월을 넘어가지 않음
    if (
        currentYear < exhibitionEnd.getFullYear() ||
        (currentYear === exhibitionEnd.getFullYear() && currentMonth < exhibitionEnd.getMonth())
    ) {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentYear, currentMonth, exhibitionStart, exhibitionEnd);
    }
});


    /*********************************/
    
    $(function() {
        const useFee = $('#useFee').val() === '무료';

        // 무료 전시일 경우
        if (useFee) {

            // 무료 전시일 경우 결제 없이 예매 확인 페이지로 이동
            $('#btn-payment').on('click', function() {
                // 최종 단계에서 체크박스가 모두 선택되었는지 확인
                let allChecked = true;
                $('#checkbox-area input[type="checkbox"]').each(function() {
                    if (!$(this).prop('checked')) {
                        allChecked = false;
                        return false;   // 체크되지 않은 항목 발견 시 루프 중지
                    }
                });
                if (!allChecked) {
                    alert('모든 약관에 동의해 주세요.');
                    return;
                }

                const ticketCount = $('#ticket-count').val();
                if (!ticketCount || parseInt(ticketCount) === 0) {
                    alert('티켓 매수를 선택해 주세요.');
                    return;
                }
                

                // 무료 전시 예매 번호 생성 ajax
                    $.ajax({
                        url: '/createticketno',
                        type: 'post',
                        data: { exhibitionNo: $('#exhibitionNo').val() },
                        success: (result)=> { // ticketNo값 반환됨
                            console.log(result.ticketNo);
                            freeTicketing(result.ticketNo);
                        },
                        error: (err)=> {
                            console.log(err);
                            console.log("에러남");
                        }
                    });

                // 무료 전시인 경우 예매 확인 페이지로 이동
                function freeTicketing(ticketNo) {

                    $.ajax({
                        type : 'post',
                        url: '/freeticketing',
                        data: {
                            name : $('#exhibitionTitle').val(),
                            merchantUid: ticketNo,
                            exhibitionNo: $('#exhibitionNo').val(),
                            ticketCount: $('#ticket-count').val(),
                            visitDate: $('#selected-date').text(),
        
                            buyerName: $('#input-name').val(),
                            buyerTel: $('#input-phone').val()
                        },
                        success: ()=> {
                            location.href = 'freeticketingsuccess?merchantUid='+ticketNo;
                        },
                        error: (err)=> {
                            alert(err.responseText);
                        }
                    });
                }
    
            });
        } else {

            // 결제 버튼 클릭 이벤트
            document.getElementById('btn-payment').addEventListener('click', function() {
                // 최종 단계에서 체크박스가 모두 선택되었는지 확인
                let allChecked = true;
                $('#checkbox-area input[type="checkbox"]').each(function() {
                    if (!$(this).prop('checked')) {
                        allChecked = false;
                        return false;   // 체크되지 않은 항목 발견 시 루프 중지
                    }
                });
                if (!allChecked) {
                    alert('모든 약관에 동의해 주세요.');
                    return;
                }

                // 모든 조건이 만족되면 createTicketNo() 실행
                createTicketNo();
            });
        }
    });

    let currStep = 1;
    const totalStep = 2;

    // 단계 이동 및 버튼 제어 함수
    function updateStep() {
        $('.step-content').css('display', 'none'); // 모든 단계 숨기기
        $(`#step-${currStep}`).css('display', 'block'); // 현재 단계 표시

        if (currStep === 1) {
            $('#btn-prev').css('display', 'none');
            $('#btn-next').css('display', 'inline-block');
            $('#btn-payment').css('display', 'none');
        } else if (currStep === totalStep) {
            $('#btn-prev').css('display', 'inline-block');
            $('#btn-next').css('display', 'none');
            $('#btn-payment').css('display', 'inline-block');
        }
    }

    // 다음 단계 버튼 이벤트
    document.getElementById('btn-next').addEventListener('click', function() {
        if (currStep === 1 && !document.querySelector('.selected-date')) {
        alert('관람일을 선택해 주세요.');
        return;
        }

        if (currStep === 2) {
            const ticketCount = document.getElementById('ticket-count').value;
            if (!ticketCount || parseInt(ticketCount) === 0) {
                alert('티켓 매수를 선택해 주세요.');
                return;
            }
        }

        if (currStep < totalStep) {
            currStep++;
            updateStep();
        }
    });

    // 이전 단계 버튼 이벤트
    document.getElementById('btn-prev').addEventListener('click', function() {
        if (currStep > 1) {
            currStep--;
            updateStep();
        }
    });


    /**********************************/

    // 전시 제목 표시
    const exhibitionTitle = $('#exhibitionTitle').val();
    document.getElementById('exhibition-title').textContent = exhibitionTitle;

    // 티켓 단가 가져오기
    const ticketPriceText = $('#ticket-useFee').text().trim();
    const isFree = ticketPriceText === "무료";
    // 티켓 단가에서 ','와 '원'을 제거하고 숫자로 변환
    const ticketPrice = isFree ? 0 : parseInt(ticketPriceText.replace(/[,원]/g, ""));

    // 티켓 1장 가격을 'ticket-price'에 표시
    document.getElementById('ticket-price').textContent = isFree ? "무료" : `${ticketPrice.toLocaleString()}원`;

    // 총 결제 금액 계산
    let totalAmount;
    document.getElementById('ticket-count').addEventListener('change', function() {
        const ticketCount = parseInt(this.value);
        totalAmount = ticketCount * ticketPrice;
        document.getElementById('total-amount').textContent = isFree ? "무료" : `${totalAmount.toLocaleString()}원`;
    });

    // 페이지 로드 시 기본 금액 표시
    document.getElementById('ticket-count').value = "1"; // 기본 선택을 1매로 설정
    document.getElementById('ticket-count').dispatchEvent(new Event('change')); // 금액 업데이트 트리거

    // 초기 단계 설정
    updateStep();

    
    /************* 결제창 포트원 ******************/

    var IMP = window.IMP; 
    IMP.init("imp47237427");

    function createTicketNo() {
        $.ajax({
            url: '/createticketno',
            type: 'post',
            data: { exhibitionNo: $('#exhibitionNo').val() },
            success: (result)=> { // ticketNo값 반환됨
                console.log(result.ticketNo);
                tempPaymentInfo(result.ticketNo);
            },
            error: (err)=> {
                console.log(err);
                console.log("에러남");
            }
        });
    }

    // 결제 정보 임시 저장 ajax
    function tempPaymentInfo(ticketNo) {
        $.ajax({
            url: 'temppayment',
            type: 'post',
            data: {
                payMethod : 'card',
                merchantUid: ticketNo,
                name: $('#exhibitionTitle').val(),
                amount : totalAmount,
                buyerEmail : $('#input-email').val(),
                buyerName : $('#input-name').val(),
                buyerTel : $('#input-phone').val(),
                buyerAddr : '${session.loginUser.address}'
            },
            success: (result) => {
                if(result.status === 'success') {
                    requestPay(ticketNo);
                    console.log(result.status);
                } else {
                    alert('결제에 실패했습니다. 다시 시도해 주세요.');
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    }

    function requestPay(ticketNo) {

        IMP.request_pay({
            pg : 'html5_inicis.INIpayTest',
            merchant_uid: ticketNo,
            name: $('#exhibitionTitle').val(),
            amount : totalAmount,
            buyer_email : $('#input-email').val(),
            buyer_name : $('#input-name').val(),
            buyer_tel : $('#input-phone').val(),
        }, function (rsp) { // callback
            //rsp.imp_uid 값으로 결제 단건조회 API를 호출하여 결제결과를 판단합니다.
            console.log(rsp);

            // 결제사 검증 ajax
            $.ajax({
                type : 'post',
                url: 'verifypayment',
                data: {
                    impUid : rsp.imp_uid,
                    payMethod : rsp.pay_method,
                    name : rsp.name,
                    paidAmount : rsp.paid_amount,
                    merchantUid: rsp.merchant_uid,
                    status : rsp.status,
                    exhibitionNo: $('#exhibitionNo').val(),
                    ticketCount: $('#ticket-count').val(),
                    visitDate: $('#selected-date').text(),

                    buyerName: rsp.buyer_name,
                    buyerTel: rsp.buyer_tel,
                    buyerEmail: rsp.buyer_email
                },
                success: (result)=> {
                    location.href = 'ticketingsuccess?merchantUid='+rsp.merchant_uid;
                },
                error: (err)=> {
                    alert(err.responseText);
                }
            });

        });
    }
