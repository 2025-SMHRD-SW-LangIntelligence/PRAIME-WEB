$(document).ready(function() {
    // 비밀번호 보기/숨기기 기능
    $('.password-toggle-icon').click(function() {
        const passwordInput = $(this).siblings('input');
        const icon = $(this).find('i');
        
        if (passwordInput.attr('type') === 'password') {
            passwordInput.attr('type', 'text');
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            passwordInput.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });

    // 로그인 버튼 클릭 이벤트
    $("#loginBtn").click(function(e) {
        e.preventDefault();
        
        // 기존 오류 메시지 제거
        $(".error-msg").remove();
        
        // 입력값 가져오기
        const id = $("#id").val().trim();
        const pw = $("#pw").val().trim();
        let isValid = true;

        // 1. 아이디 공백 검사
        if (!id) {
            $("#id").closest('.form-group').append(
                '<p class="error-msg" style="color:red;margin-top:5px;">아이디를 입력해주세요</p>'
            );
            isValid = false;
        }

        // 2. 비밀번호 공백 검사
        if (!pw) {
            $("#pw").closest('.form-group').append(
                '<p class="error-msg" style="color:red;margin-top:5px;">비밀번호를 입력해주세요</p>'
            );
            isValid = false;
        }
        // 3. 비밀번호 형식 검사 (영문+숫자 8~20자)
        else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(pw)) {
            $("#pw").closest('.form-group').append(
                '<p class="error-msg" style="color:red;margin-top:5px;">영문+숫자 조합 8~20자로 입력해주세요</p>'
            );
            isValid = false;
        }

        // 유효성 검사 통과 시 서버 요청
        if (isValid) {
            $.ajax({
                type: "POST",
                url: "/login.do",
                data: {
                    id: id,
                    pw: pw
                },
                success: function(response) {
                    // 성공 시 리다이렉트
                    if (response.startsWith("http") || response.startsWith("/")) {
                        window.location.href = response;
                    }
                },
                error: function(xhr) {
                    if (xhr.status === 400) {
                        const errorMsg = xhr.responseJSON.message || "아이디와 비밀번호를 확인해주세요";
                        
                        // alert 표시
                        alert(errorMsg);
                        
                        // 필드에 에러 메시지도 함께 표시 (선택사항)
                        const errorField = xhr.responseJSON.field;
                        if (errorField === 'id') {
                            $("#id").closest('.form-group').append(
                                `<p class="error-msg" style="color:red;margin-top:5px;">${errorMsg}</p>`
                            );
                        } else if (errorField === 'pw') {
                            $("#pw").closest('.form-group').append(
                                `<p class="error-msg" style="color:red;margin-top:5px;">${errorMsg}</p>`
                            );
                        }
                    } else {
                        alert("서버 통신 실패: " + xhr.status);
                    }
                }
            });
        }
    });
});