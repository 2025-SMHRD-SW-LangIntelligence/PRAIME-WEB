document.addEventListener('DOMContentLoaded', function() {
    console.log('my_info_edit.js script started.');

	// 본인인증, 주소찾기, 취소 관련 함수
	window.identityVerification = function(event) { 
	    if (event) {
	        event.preventDefault(); 
	    }
	    alert("본인인증 기능은 현재 개발 중입니다.");
	};


    window.goToRoleChoice = function() {
        if (confirm('수정을 취소하시겠습니까?\n변경 내용이 저장되지 않습니다.')) {
            window.location.href = '/myInfoFarmerPage';
        }
    };

    // 비밀번호 표시/숨기기
    document.querySelectorAll('.password-toggle-icon').forEach(function(icon) {
        icon.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const iconElement = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                iconElement.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                iconElement.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // 에러 메시지 생성 및 제거 함수
    function createErrorMessage(inputOrFormElement, message) {
        const formGroup = inputOrFormElement.closest('.form-group');
        const targetElement = formGroup || inputOrFormElement;
        const existingError = targetElement.querySelector('.error-message');
        if (existingError) existingError.remove();

        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.textContent = message;
        errorSpan.style.color = '#dc3545';
        errorSpan.style.fontSize = '0.85rem';
        errorSpan.style.display = 'block';
        errorSpan.style.marginTop = '5px';
        errorSpan.style.fontWeight = '500';

        targetElement.appendChild(errorSpan);
    }

    function clearErrorMessage(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        const targetElement = formGroup || inputElement;
        const errorSpan = targetElement.querySelector('.error-message');
        if (errorSpan) errorSpan.remove();
    }

    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() !== '') {
                clearErrorMessage(this);
            }
        });
    });

    // 폼 유효성 검사
    function validateForm() {
        let isValid = true;
        document.querySelectorAll('.error-message').forEach(msg => msg.remove());
        console.log('=== 폼 유효성 검사 시작 ===');

        // 1. 비밀번호 (입력된 경우만 유효성 체크)
        const pwInput = document.getElementById('pw');
        const pw = pwInput.value.trim();
        if (pw !== '') {
            const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,20}$/;
            if (!passwordRegex.test(pw)) {
                createErrorMessage(pwInput, '비밀번호는 8~20자의 영문, 숫자 조합이어야 합니다.');
                console.log('비밀번호 유효성 검사 실패');
                isValid = false;
            }
        }

        // 2. 이름
        const nameInput = document.getElementById('name');
        const name = nameInput.value.trim();
        if (!name) {
            createErrorMessage(nameInput, '이름을 입력해주세요.');
            console.log('이름 입력 누락');
            isValid = false;
        } else if (!/^[가-힣A-Za-z]{2,10}$/.test(name)) {
            createErrorMessage(nameInput, '이름은 한글 또는 영문 2~10자여야 합니다.');
            console.log('이름 형식 오류');
            isValid = false;
        }

        // 3. 통신사
        const telecomSelect = document.getElementById('tel-0');
        if (!telecomSelect.value || telecomSelect.value === '통신사선택') {
            createErrorMessage(telecomSelect, '통신사를 선택해주세요.');
            console.log('통신사 선택 누락');
            isValid = false;
        }

        // 4. 휴대폰 번호
        const tel1 = document.getElementById('tel-1').value.trim();
        const tel2 = document.getElementById('tel-2').value.trim();
        const tel3 = document.getElementById('tel-3').value.trim();

        if (!tel1 || !tel2 || !tel3) {
            createErrorMessage(document.getElementById('tel-1'), '휴대폰 번호를 모두 입력해주세요.');
            console.log('휴대폰 번호 입력 누락');
            isValid = false;
        } else if (!/^\d{3}$/.test(tel1) || !/^\d{3,4}$/.test(tel2) || !/^\d{4}$/.test(tel3)) {
            createErrorMessage(document.getElementById('tel-1'), '휴대폰 번호 형식이 올바르지 않습니다.');
            console.log('휴대폰 번호 형식 오류');
            isValid = false;
        }

        // 5. 이메일
        const emailId = document.getElementById('email').value.trim();
        const emailDomain = document.getElementById('email-domain').value.trim();
        if (!emailId) {
            createErrorMessage(document.getElementById('email'), '이메일 주소를 입력해주세요.');
            console.log('이메일 입력 누락');
            isValid = false;
        } else if (!/^[a-zA-Z0-9._-]+$/.test(emailId)) {
            createErrorMessage(document.getElementById('email'), '이메일 형식이 올바르지 않습니다.');
            console.log('이메일 형식 오류');
            isValid = false;
        }

        if (!emailDomain || emailDomain === '' || emailDomain === '선택') {
            createErrorMessage(document.getElementById('email-domain'), '이메일 도메인을 선택해주세요.');
            console.log('이메일 도메인 선택 누락');
            isValid = false;
        }

        // 6. 주소 
        const addressInput = document.getElementById('address');
        const detailInput = document.getElementById('address-detail');

        const address = addressInput?.value?.trim() || '';
        const detail = detailInput?.value?.trim() || '';

        console.log('[주소 검사] address:', address, 'detail:', detail);

        if (!address) {
            createErrorMessage(addressInput, '도로명 주소를 입력해주세요.');
            console.log('도로명 주소 입력 누락');
            isValid = false;
        }

        if (!detail) {
            createErrorMessage(detailInput, '상세주소를 입력해주세요.');
            console.log('상세주소 입력 누락');
            isValid = false;
        }

        console.log(`=== 폼 유효성 검사 결과: ${isValid ? '통과' : '실패'} ===`);
        return isValid;
    }

    // 제출 처리
    const editForm = document.getElementById('editForm');
    const submitButton = document.getElementById('submitBtn');

    if (editForm && submitButton) {
        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('폼 제출 버튼 클릭됨');

            if (validateForm()) {
                console.log("폼 유효성 검사 통과. 서버로 전송 시작");

                const formData = new FormData(editForm);
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}: ${value}`);
                }

                submitButton.disabled = true;
                submitButton.textContent = '저장 중...';

                axios.post(editForm.action, formData)
                    .then(response => {
                        if (response.data?.success) {
                            alert('회원 정보가 성공적으로 수정되었습니다!');
                            window.location.href = '/myInfoFarmerPage';
                        } else {
                            createErrorMessage(editForm, response.data?.message || '회원 정보 수정 실패');
                            console.error('응답 실패', response.data);
                        }
                    })
                    .catch(error => {
                        let msg = '회원 정보 수정 중 오류 발생';
                        if (error.response) {
                            msg = `서버 오류: ${error.response.status} ${error.response.statusText}`;
                        } else if (error.request) {
                            msg = '응답 없음: 네트워크 연결을 확인해주세요.';
                        }
                        createErrorMessage(editForm, msg);
                        console.error(error);
                    })
                    .finally(() => {
                        submitButton.disabled = false;
                        submitButton.textContent = '저장';
                    });
            } else {
                const firstError = document.querySelector('.error-message');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    } else {
        console.error("editForm 또는 submitBtn을 찾을 수 없습니다.");
    }
});
