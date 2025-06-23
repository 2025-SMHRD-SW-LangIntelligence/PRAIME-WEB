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

    // 무한스크롤 초기화
    initInfiniteScroll();

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

// 무한스크롤 관련 변수
let currentPage = 0;
let isLoading = false;
let hasMoreData = true;
const pageSize = 10;

function initInfiniteScroll() {
    window.addEventListener('scroll', handleScroll);
    loadMoreDiagnosis();
}

function handleScroll() {
    if (isLoading || !hasMoreData) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= documentHeight - 100) {
        loadMoreDiagnosis();
    }
}

function loadMoreDiagnosis() {
    if (isLoading || !hasMoreData) return;
    isLoading = true;
    showLoadingIndicator();
    const url = `/api/diagnosis?page=${currentPage}&size=${pageSize}&sortOrder=desc`;
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newCards = doc.querySelectorAll('.card-item');
            if (newCards.length > 0) {
                const cardList = document.getElementById('card-list');
                if (currentPage === 0) {
                    // 첫 페이지면 기존 카드 제거
                    cardList.innerHTML = '';
                }
                newCards.forEach(card => {
                    cardList.appendChild(card.cloneNode(true));
                });
                currentPage++;
                hasMoreData = newCards.length === pageSize;
            } else {
                hasMoreData = false;
            }
        })
        .catch(error => {
            console.error('데이터 로드 중 오류 발생:', error);
        })
        .finally(() => {
            isLoading = false;
            hideLoadingIndicator();
        });
}

function showLoadingIndicator() {
    const cardList = document.getElementById('card-list');
    const existingIndicator = cardList.querySelector('#loading-indicator');
    if (!existingIndicator) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div><p>로딩 중...</p>';
        cardList.appendChild(loadingDiv);
    }
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}