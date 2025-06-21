// diagnosis/board.js
document.addEventListener('DOMContentLoaded', () => {
    // 버튼 클릭 이벤트 리스너
    const startDiagnosisBtn = document.getElementById('start-diagnosis');
    if (startDiagnosisBtn) {
        startDiagnosisBtn.onclick = () => location.href = '/diagnosisUploadPage';
    }

    const viewHistoryBtn = document.getElementById('view-history');
    if (viewHistoryBtn) {
        viewHistoryBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 이미지 모달 기능
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".modal-close"); // 클래스로 첫 번째 요소 선택

    if (modal && modalImage && closeBtn) { // 모달 관련 요소들이 모두 존재하는지 확인
        // 이미지 클릭 시 모달 열기
        document.querySelectorAll('.card-thumb img').forEach(img => {
            img.addEventListener('click', function() {
                modal.classList.add('show'); // 'show' 클래스를 추가하여 모달을 보이게 함
                modalImage.src = this.src; // 클릭된 이미지의 src를 모달 이미지에 설정
                // onerror 핸들러는 필요하다면 modalImage에도 추가할 수 있습니다.
                modalImage.onerror = function() {
                    this.onerror = null; // 중복 호출 방지
                    this.src = '/images/placeholder.png'; // 대체 이미지 경로
                };
            });
        });

        // 모달 닫기 버튼 클릭 시
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show'); // 'show' 클래스를 제거하여 모달을 숨김
        });

        // 모달 배경 클릭 시 닫기
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.classList.remove('show'); // 'show' 클래스를 제거하여 모달을 숨김
            }
        });

        // ESC 키 눌렀을 때 모달 닫기
        document.addEventListener('keydown', function(event) {
            if (event.key === "Escape" && modal.classList.contains('show')) { // 'show' 클래스가 있는지 확인
                modal.classList.remove('show'); // 'show' 클래스를 제거하여 모달을 숨김
            }
        });
    }
});