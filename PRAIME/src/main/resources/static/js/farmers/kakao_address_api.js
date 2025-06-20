document.addEventListener('DOMContentLoaded', function () {
    // 주소찾기 버튼 클릭 이벤트 리스너 등록
    const addressBtn = document.querySelector('.find-address-btn');
    if (addressBtn) {
        addressBtn.addEventListener('click', function (e) {
            e.preventDefault();
            openDaumPostcode();
        });
    }
});

function openDaumPostcode() {
    new daum.Postcode({
        oncomplete: function (data) {
            let roadAddr = data.roadAddress; // 도로명 주소
            let extraRoadAddr = '';

            // 참고항목 조합
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                extraRoadAddr += data.bname;
            }
            if (data.buildingName !== '' && data.apartment === 'Y') {
                extraRoadAddr += (extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            if (extraRoadAddr !== '') {
                roadAddr += ' (' + extraRoadAddr + ')';
            }

            // 주소 필드에 값 넣기
            const addressInput = document.getElementById('address');
            const detailInput = document.getElementById('address-detail');

            if (addressInput) {
                addressInput.value = `(${data.zonecode}) ${roadAddr}`;
            }
            if (detailInput) {
                detailInput.focus();
            }
        }
    }).open();
}
