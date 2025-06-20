// my_info_edit.html 전용 JS 파일

document.addEventListener('DOMContentLoaded', function() {
	// --- 본인인증, 주소찾기, 취소 함수 (미구현: API연동필요) ---
	window.identityVerification = function() {
	    alert("본인인증 기능은 현재 개발 중입니다.");
	};

	window.addressFind = function() {
	    alert("주소찾기 기능은 현재 개발 중입니다.");
	};

	window.goToRoleChoice = function() {
	    window.location.href = '/roleChoicePage';
	};	
	
  // 비밀번호 토글 기능
  document.querySelectorAll('.password-toggle-icon').forEach(function(icon) {
    icon.addEventListener('click', function() {
      const input = this.parentElement.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        this.querySelector('i').classList.remove('fa-eye');
        this.querySelector('i').classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        this.querySelector('i').classList.remove('fa-eye-slash');
        this.querySelector('i').classList.add('fa-eye');
      }
    });
  });

  // 오류 메시지 제거 함수
  function clearAllErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
  }

  // 특정 필드에 오류 메시지 표시 함수
  function showError(fieldName, message) {
    const existingError = document.querySelector(`.error-message[data-field="${fieldName}"]`);
    if (existingError) existingError.remove();

    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.setAttribute('data-field', fieldName);

    let fieldGroup;
    if (fieldName === 'general') {
      fieldGroup = document.querySelector('.join-form');
    } else if (fieldName === 'pw-confirm') {
      fieldGroup = document.querySelector('input[name="pw-confirm"]').closest('.form-group');
    } else {
      fieldGroup = document.getElementById(fieldName).closest('.form-group');
    }
    fieldGroup.appendChild(errorElement);
  }

  // 폼 유효성 검사 함수
  function validateForm() {
      let isValid = true;
      clearAllErrorMessages();

      // 비밀번호 검사 (8~20자, 영문+숫자+특수문자 조합)
      const pw = document.getElementById('pw').value;
      if (!pw) {
          showError('pw', '비밀번호를 입력해주세요.');
          isValid = false;
      } else if (!/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,20}$/.test(pw)) {
          showError('pw', '비밀번호는 8~20자의 영문, 숫자 조합이어야 합니다.');
          isValid = false;
      }

      // 비밀번호 확인 검사
      const pwConfirm = document.querySelector('input[name="pw-confirm"]').value;
      if (!pwConfirm) {
          showError('pw-confirm', '비밀번호 확인을 입력해주세요.');
          isValid = false;
      } else if (pw !== pwConfirm) {
          showError('pw-confirm', '비밀번호가 일치하지 않습니다.');
          isValid = false;
      }

      // 이름 검사 (한영 2~10자)
      const name = document.getElementById('name').value;
      if (!name) {
          showError('name', '이름을 입력해주세요.');
          isValid = false;
      } else if (!/^[가-힣A-Za-z]{2,10}$/.test(name)) {
          showError('name', '이름은 한글,영문 2~10자로 입력해주세요.');
          isValid = false;
      }

      // 휴대폰 번호 검사
      const tel1 = document.getElementById('tel-1').value;
      const tel2 = document.getElementById('tel-2').value;
      const tel3 = document.getElementById('tel-3').value;
      if (!tel1 || !tel2 || !tel3) {
          showError('tel-1', '휴대폰 번호를 모두 입력해주세요.');
          isValid = false;
      } else if (!/^\d{3}$/.test(tel1) || !/^\d{3,4}$/.test(tel2) || !/^\d{4}$/.test(tel3)) {
          showError('tel-1', '휴대폰 번호 형식이 올바르지 않습니다.');
          isValid = false;
      }

      // 이메일 검사
      const email = document.getElementById('email').value;
      const emailDomain = document.getElementById('email-domain').value;
      if (!email) {
          showError('email', '이메일을 입력해주세요.');
          isValid = false;
      } else if (!/^[a-zA-Z0-9._-]+$/.test(email)) {
          showError('email', '이메일 형식이 올바르지 않습니다.');
          isValid = false;
      }
      if (!emailDomain) {
          showError('email-domain', '이메일 도메인을 선택해주세요.');
          isValid = false;
      }

      // 주소 검사
      const address = document.getElementById('address').value;
      const addressDetail = document.getElementById('address-detail').value;
      if (!address) {
          showError('address', '주소를 입력해주세요.');
          isValid = false;
      }
      if (!addressDetail) {
          showError('address-detail', '상세주소를 입력해주세요.');
          isValid = false;
      }

      return isValid;
	}

  // 향후 추가 기능을 여기에 작성
});