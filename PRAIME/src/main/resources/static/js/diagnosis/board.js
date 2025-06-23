// diagnosis/board.js
document.addEventListener('DOMContentLoaded', () => {
    // 버튼 클릭 이벤트 리스너
    const startDiagnosisBtn = document.getElementById('start-diagnosis');
    if (startDiagnosisBtn) {
        startDiagnosisBtn.onclick = () => location.href = '/diagnosisUploadPage'; // /diagnosis/uploadPage
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
    const modalLabel = document.getElementById("modalLabel");
    const modalConfidence = document.getElementById("modalConfidence");
    const closeBtn = document.querySelector(".modal-close");

    // card-list 내 이미지 클릭 시 이벤트 위임
    // 이 리스너는 한 번만 등록되며, 동적으로 추가되는 .card-thumb img 요소에도 적용됩니다.
    document.getElementById('card-list').addEventListener('click', function(event) {
        const clickedImg = event.target.closest('.card-thumb img');
        if (clickedImg) {
            modal.classList.add('show'); // 'show' 클래스를 추가하여 모달 표시
            modalImage.src = clickedImg.src; // 이미지 소스 설정
            modalLabel.textContent = clickedImg.dataset.label; // data 속성에서 라벨 설정
            modalConfidence.textContent = '신뢰도: ' + clickedImg.dataset.confidence; // data 속성에서 신뢰도 설정

            // 모달 이미지 로드 실패 시 대체 이미지 표시
            modalImage.onerror = function() {
                this.onerror = null; // 중복 호출 방지
                this.src = '/images/placeholder.png'; // 대체 이미지 경로
            };
        }
    });

    // 닫기 버튼 클릭 시 모달 닫기
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show'); // 'show' 클래스를 제거하여 모달 숨김
        });
    }

    // 모달 배경 클릭 시 모달 닫기
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.classList.remove('show'); // 'show' 클래스를 제거하여 모달 숨김
            }
        });
    }

    // ESC 키 눌렀을 때 모달 닫기
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && modal && modal.classList.contains('show')) {
            modal.classList.remove('show'); // 'show' 클래스를 제거하여 모달 숨김
        }
    });

    // 정렬 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.sort-buttons button').forEach(button => {
        button.addEventListener('click', function() {
            // 모든 버튼에서 'active' 클래스 제거
            document.querySelectorAll('.sort-buttons button').forEach(btn => btn.classList.remove('active'));
            // 클릭된 버튼에 'active' 클래스 추가
            this.classList.add('active');

            const order = this.dataset.sortOrder; // data-sort-order 속성에서 값 가져오기
            resetInfiniteScroll(); // 무한 스크롤 상태 재설정 (데이터 초기화)
            loadMoreDiagnosis(true, order); // 초기 로드로 간주하고, 정렬 순서 전달
        });
    });
});

// 무한스크롤 관련 변수
let currentPage = 0; // 현재 페이지 번호 (0부터 시작)
let isLoading = false; // 데이터 로딩 중인지 여부
let hasMoreData = true; // 서버에 더 이상 데이터가 없는지 여부
const pageSize = 10; // 한 번에 가져올 아이템 수 (백엔드 페이지 크기와 일치해야 함)
let currentSortOrder = 'desc'; // 현재 정렬 순서 (초기값 'desc')

/**
 * 무한 스크롤 시스템을 초기화합니다.
 * 스크롤 이벤트 리스너를 등록하고 첫 페이지 데이터를 로드합니다.
 */
function initInfiniteScroll() {
    window.addEventListener('scroll', handleScroll); // 스크롤 이벤트 리스너 등록

    // URL 파라미터에서 초기 정렬 순서를 가져와 currentSortOrder에 설정
    const urlParams = new URLSearchParams(window.location.search);
    currentSortOrder = urlParams.get('sortOrder') || 'desc';

    // 초기 로드 시 'currentSortOrder'에 해당하는 버튼을 활성화 상태로 설정
    const initialSortButton = document.querySelector(`.sort-buttons button[data-sort-order="${currentSortOrder}"]`);
    if (initialSortButton) {
        initialSortButton.classList.add('active');
    }

    // 첫 페이지 데이터 로드를 시작합니다.
    // isInitialLoad = true 로 전달하여 Thymeleaf로 렌더링된 초기 콘텐츠를 비우도록 합니다.
    loadMoreDiagnosis(true, currentSortOrder);
}

/**
 * 무한 스크롤 관련 변수 및 UI를 초기 상태로 재설정합니다.
 * 주로 정렬 기준 변경 시 호출됩니다.
 */
function resetInfiniteScroll() {
    currentPage = 0; // 페이지 번호 초기화
    isLoading = false; // 로딩 상태 해제
    hasMoreData = true; // 데이터가 다시 있다고 가정
    const cardList = document.getElementById('card-list');
    cardList.innerHTML = ''; // 모든 기존 카드 요소 제거
    // "진단 기록 없음" 메시지가 있다면 제거
    const noRecordsMessage = cardList.querySelector('.no-records');
    if (noRecordsMessage) {
        noRecordsMessage.remove();
    }
    // 혹시 모를 오류 메시지도 제거
    const errorMessage = cardList.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

/**
 * 스크롤 이벤트를 처리하여 페이지 하단에 도달했을 때 다음 데이터를 로드합니다.
 */
function handleScroll() {
    // 이미 로딩 중이거나 더 이상 데이터가 없으면 함수를 실행하지 않습니다.
    if (isLoading || !hasMoreData) return;

    // 현재 스크롤 위치, 뷰포트 높이, 문서 전체 높이를 계산합니다.
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 문서 하단에서 100px 이내로 스크롤하면 다음 페이지 데이터를 로드합니다.
    if (scrollTop + windowHeight >= documentHeight - 100) {
        loadMoreDiagnosis(); // 다음 페이지 로드
    }
}

/**
 * 진단 데이터를 서버에서 비동기적으로 로드하여 페이지에 추가합니다.
 * @param {boolean} [isInitialLoad=false] - 현재 호출이 무한 스크롤의 초기 로드(또는 재정렬 후 첫 로드)인지 여부.
 * true이면 card-list를 비웁니다.
 * @param {string} [sortOrder=currentSortOrder] - 사용할 정렬 순서 ('asc' 또는 'desc'). 기본값은 현재 설정된 정렬 순서.
 */
function loadMoreDiagnosis(isInitialLoad = false, sortOrder = currentSortOrder) {
    // 이미 로딩 중이거나 더 이상 데이터가 없으면 함수를 실행하지 않습니다.
    if (isLoading || !hasMoreData) return;

    isLoading = true; // 로딩 시작 상태로 설정
    showLoadingIndicator(); // 로딩 인디케이터 표시

    // 현재 정렬 순서를 업데이트 (정렬 버튼 클릭으로 변경될 수 있음)
    currentSortOrder = sortOrder;

    // 서버에서 데이터를 가져올 API 엔드포인트 URL을 구성합니다.
    // 백엔드의 @GetMapping(value = "/api/diagnosis")와 일치해야 합니다.
    const url = `/api/diagnosis?page=${currentPage}&size=${pageSize}&sortOrder=${currentSortOrder}`;

    fetch(url)
        .then(response => {
            // HTTP 응답이 성공적인지 확인합니다.
            if (!response.ok) {
                // 에러 발생 시 콘솔에 상태 코드와 메시지를 출력
                console.error(`Error loading data: ${response.status} ${response.statusText}`);
                throw new Error(`HTTP 오류 발생! 상태: ${response.status}`);
            }
            return response.text(); // 응답 본문을 텍스트 (HTML 스니펫)로 파싱합니다.
        })
        .then(html => {
            const parser = new DOMParser();
            // 받아온 HTML 문자열을 DOM 객체로 파싱합니다.
            // HTML 스니펫 전체를 파싱합니다.
            const doc = parser.parseFromString(html, 'text/html');
            // 파싱된 문서에서 '.card-item' 클래스를 가진 모든 요소를 선택합니다.
            const newCards = doc.querySelectorAll('.card-item'); // 이제 doc.body.children[0].children 등으로 접근하는 대신, 바로 querySelectorAll 사용
            const cardList = document.getElementById('card-list');

            // 초기 로드(isInitialLoad가 true)일 경우 기존 콘텐츠를 모두 제거합니다.
            // 이 부분은 resetInfiniteScroll()에서 이미 처리되므로, 중복될 필요는 없지만,
            // 방어적으로 유지하거나 resetInfiniteScroll()이 항상 호출되도록 보장하는 것이 좋습니다.
            if (isInitialLoad) {
                cardList.innerHTML = '';
            }

            // "현재 진단 기록이 없습니다." 메시지 요소가 있는지 확인합니다.
            const noRecordsMessage = cardList.querySelector('.no-records');

            if (newCards.length > 0) {
                // 새로운 카드가 로드되었으므로 "진단 기록 없음" 메시지가 있다면 제거합니다.
                if (noRecordsMessage) {
                    noRecordsMessage.remove();
                }
                // 새로 로드된 카드 요소들을 'card-list'에 추가합니다.
                newCards.forEach(card => {
                    cardList.appendChild(card.cloneNode(true)); // 깊은 복사로 요소 추가
                });
                currentPage++; // 다음 페이지 번호로 증가
                // 새로 로드된 아이템의 수가 pageSize와 같으면 더 많은 데이터가 있을 수 있다고 판단합니다.
                // 즉, pageSize보다 적게 로드되면 마지막 페이지일 가능성이 높습니다.
                hasMoreData = newCards.length === pageSize;
            } else {
                // 새로 로드된 아이템이 없으면 더 이상 로드할 데이터가 없습니다.
                hasMoreData = false;
                // 'card-list'에 아무런 아이템도 없고 "기록 없음" 메시지도 없을 경우에만 메시지를 추가합니다.
                // 이는 모든 데이터가 로드된 후 더 이상 표시할 내용이 없을 때 유용합니다.
                if (cardList.children.length === 0 && !noRecordsMessage) {
                    const noRecordsDiv = document.createElement('div');
                    noRecordsDiv.className = 'no-records';
                    noRecordsDiv.textContent = '현재 진단 기록이 없습니다.';
                    cardList.appendChild(noRecordsDiv);
                }
            }
        })
        .catch(error => {
            console.error('데이터 로드 중 오류 발생:', error);
            // 오류 발생 시 더 이상 데이터를 로드하지 않도록 설정
            hasMoreData = false;
            // 사용자에게 오류 메시지를 표시할 수 있습니다. (중복 방지)
            const cardList = document.getElementById('card-list');
            if (cardList.querySelector('.error-message') === null) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.style.textAlign = 'center';
                errorDiv.style.color = 'red';
                errorDiv.style.padding = '20px';
                errorDiv.textContent = '데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.';
                cardList.appendChild(errorDiv);
            }
        })
        .finally(() => {
            isLoading = false; // 로딩 상태 해제
            hideLoadingIndicator(); // 로딩 인디케이터 숨김
        });
}

/**
 * 로딩 인디케이터를 페이지에 표시합니다.
 */
function showLoadingIndicator() {
    const cardList = document.getElementById('card-list');
    let existingIndicator = cardList.querySelector('#loading-indicator');
    if (!existingIndicator) { // 기존 인디케이터가 없으면 새로 생성하여 추가
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.className = 'loading-indicator'; // CSS 스타일을 위한 클래스
        loadingDiv.innerHTML = '<div class="loading-spinner"></div><p>로딩 중...</p>';
        cardList.appendChild(loadingDiv);
    }
}

/**
 * 로딩 인디케이터를 페이지에서 숨깁니다.
 */
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove(); // 인디케이터 요소 제거
    }
}