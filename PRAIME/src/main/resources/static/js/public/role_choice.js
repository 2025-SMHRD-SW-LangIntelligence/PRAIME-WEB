document.addEventListener('DOMContentLoaded', function() {
    const roleCards = document.querySelectorAll('.role-card');
    const nextButton = document.getElementById('nextButton');
    let selectedRole = null;

    // 역할 카드 선택 이벤트 처리
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            // 모든 카드에서 선택 상태 제거
            roleCards.forEach(c => c.classList.remove('selected'));
            
            // 현재 카드에 선택 상태 추가
            this.classList.add('selected');
            selectedRole = this.getAttribute('data-role');
            
            // 다음 버튼 활성화
            nextButton.disabled = false;
        });
    });

    // 다음 버튼 클릭 이벤트 처리
    nextButton.addEventListener('click', function() {
        if (!selectedRole) return;
        
        // 선택된 역할에 따라 다른 페이지로 이동
        if (selectedRole === 'farmer') {
            window.location.href = 'joinFarmerPage';
        } else if (selectedRole === 'consumer') {
            window.location.href = 'joinConsumerPage';
        }
    });

});
