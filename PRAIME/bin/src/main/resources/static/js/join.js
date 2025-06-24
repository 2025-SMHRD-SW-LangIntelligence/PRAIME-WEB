/* 아이디 중복 확인 함수 */
function checkIdDuplicate() {
    const id = document.getElementById('id').value;
    if (!id) {
        alert('아이디를 입력해주세요.');
        return;
    }

    fetch('/checkId', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${encodeURIComponent(id)}`
    })
    .then(response => response.text())
    .then(result => {
        const resultElement = document.getElementById('idCheckResult');
        if (result === 'duplicate') {
            resultElement.textContent = '이미 사용중인 아이디입니다.';
            resultElement.style.color = 'red';
        } else {
            resultElement.textContent = '사용 가능한 아이디입니다.';
            resultElement.style.color = 'green';
        }
    });
}

/* 메인 페이지 이동 함수 */
function goToMain() {
    window.location.href = '/';
}