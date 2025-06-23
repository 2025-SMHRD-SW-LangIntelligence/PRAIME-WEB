// diagnosis/board.js
document.addEventListener('DOMContentLoaded', () => {
    // 버튼 클릭 이벤트 리스너
    const startDiagnosisBtn = document.getElementById('start-diagnosis');
    if (startDiagnosisBtn) {
        startDiagnosisBtn.onclick = () => location.href = '/diagnosisUploadPage'; // /diagnosis/uploadPage
    }

    const viewHistoryBtn = document.getElementById('view-history');
    if (viewHistoryBtn) {
        // view-history 버튼 클릭 시 진단 이력 섹션으로 스크롤 (기존 로직 유지)
        viewHistoryBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        // view-history 버튼 클릭 시 '활성화된 탭'으로 표시 (CSS .active-tab 적용)
        viewHistoryBtn.classList.add('active-tab');
        const startDiagnosisBtn = document.getElementById('start-diagnosis');
        if (startDiagnosisBtn) {
            startDiagnosisBtn.classList.remove('active-tab');
            startDiagnosisBtn.classList.add('btn-outline'); // 비활성화 스타일 적용
            startDiagnosisBtn.classList.remove('btn-primary'); // 활성화 스타일 제거
        }
        viewHistoryBtn.classList.remove('btn-outline'); // 비활성화 스타일 제거
        viewHistoryBtn.classList.add('btn-primary'); // 활성화 스타일 적용

    }
    // 페이지 로드 시 URL에서 sortOrder를 가져와 초기 currentSortOrder 설정
    const urlParams = new URLSearchParams(window.location.search);
    currentSortOrder = urlParams.get('sortOrder') || 'desc';

    // 무한스크롤 초기화 (sortOrder 전달)
    initInfiniteScroll();

    // 이미지 모달 기능
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const modalLabel = document.getElementById("modalLabel");
    const modalConfidence = document.getElementById("modalConfidence");
    const closeBtn = document.querySelector(".modal-close");

    // card-list 내 이미지 클릭 시 이벤트 위임
    document.getElementById('card-list').addEventListener('click', function(event) {
        const clickedImg = event.target.closest('.card-thumb img');
        if (clickedImg) {
            modal.classList.add('show');
            modalImage.src = clickedImg.src;
            modalLabel.textContent = clickedImg.dataset.label;
            modalConfidence.textContent = '신뢰도: ' + clickedImg.dataset.confidence;

            modalImage.onerror = function() {
                this.onerror = null;
                this.src = '/images/placeholder.png';
            };
        }
    });

    // 닫기 버튼 클릭 시 모달 닫기
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show');
        });
    }

    // 모달 배경 클릭 시 모달 닫기
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.classList.remove('show');
            }
        });
    }

    // ESC 키 눌렀을 때 모달 닫기
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && modal && modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    });

    // 정렬 버튼 클릭 이벤트 (하나의 버튼으로 토글)
    const sortButton = document.getElementById('sort-toggle-button');
    if (sortButton) {
        sortButton.addEventListener('click', function() {
            // 현재 정렬 순서를 토글
            currentSortOrder = (currentSortOrder === 'desc') ? 'asc' : 'desc';

            // 버튼 텍스트 및 아이콘 업데이트
            updateSortButtonUI(sortButton, currentSortOrder);

            // 무한 스크롤 상태 재설정 및 데이터 다시 로드
            resetInfiniteScroll();
            loadMoreDiagnosis(true, currentSortOrder);
        });
    }
});

// 무한스크롤 관련 변수
let currentPage = 0;
let isLoading = false;
let hasMoreData = true;
const pageSize = 10;
let currentSortOrder = 'desc'; // 초기 정렬 순서: 최신순 (백엔드 기본값과 일치)

/**
 * 정렬 버튼의 UI를 업데이트합니다. (텍스트, 아이콘)
 * @param {HTMLElement} button - 정렬 버튼 요소.
 * @param {string} order - 현재 정렬 순서 ('desc' 또는 'asc').
 */
function updateSortButtonUI(button, order) {
    const icon = button.querySelector('i');
    if (order === 'desc') {
        button.innerHTML = '<i class="fas fa-sort-amount-down-alt"></i> 최신순';
    } else {
        button.innerHTML = '<i class="fas fa-sort-amount-up-alt"></i> 오래된순';
    }
}


/**
 * 무한 스크롤 시스템을 초기화합니다.
 * 스크롤 이벤트 리스너를 등록하고 첫 페이지 데이터를 로드합니다.
 */
function initInfiniteScroll() {
    window.addEventListener('scroll', handleScroll);

    // URL 파라미터에서 초기 정렬 순서를 가져와 currentSortOrder에 설정
    const urlParams = new URLSearchParams(window.location.search);
    currentSortOrder = urlParams.get('sortOrder') || 'desc';

    // 초기 로드 시 정렬 버튼 UI 업데이트
    const sortButton = document.getElementById('sort-toggle-button');
    if (sortButton) {
        updateSortButtonUI(sortButton, currentSortOrder);
    }

    // 첫 페이지 데이터 로드를 시작합니다.
    loadMoreDiagnosis(true, currentSortOrder);
}

/**
 * 무한 스크롤 관련 변수 및 UI를 초기 상태로 재설정합니다.
 * 주로 정렬 기준 변경 시 호출됩니다.
 */
function resetInfiniteScroll() {
    currentPage = 0;
    isLoading = false;
    hasMoreData = true;
    const cardList = document.getElementById('card-list');
    cardList.innerHTML = '';
    const noRecordsMessage = cardList.querySelector('.no-records');
    if (noRecordsMessage) {
        noRecordsMessage.remove();
    }
    const errorMessage = cardList.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

/**
 * 스크롤 이벤트를 처리하여 페이지 하단에 도달했을 때 다음 데이터를 로드합니다.
 */
function handleScroll() {
    if (isLoading || !hasMoreData) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100) {
        loadMoreDiagnosis();
    }
}

/**
 * 진단 데이터를 서버에서 비동기적으로 로드하여 페이지에 추가합니다.
 * @param {boolean} [isInitialLoad=false] - 현재 호출이 무한 스크롤의 초기 로드(또는 재정렬 후 첫 로드)인지 여부.
 * @param {string} [sortOrder=currentSortOrder] - 사용할 정렬 순서 ('asc' 또는 'desc').
 */
function loadMoreDiagnosis(isInitialLoad = false, sortOrder = currentSortOrder) {
    if (isLoading || !hasMoreData) return;

    isLoading = true;
    showLoadingIndicator();

    currentSortOrder = sortOrder; // 현재 정렬 순서 업데이트

    const url = `/api/diagnosis?page=${currentPage}&size=${pageSize}&sortOrder=${currentSortOrder}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                console.error(`Error loading data: ${response.status} ${response.statusText}`);
                throw new Error(`HTTP 오류 발생! 상태: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newCards = doc.querySelectorAll('.card-item');
            const cardList = document.getElementById('card-list');

            if (isInitialLoad) {
                cardList.innerHTML = ''; // 초기 로드 시 기존 콘텐츠 비우기
            }

            const noRecordsMessage = cardList.querySelector('.no-records');

            if (newCards.length > 0) {
                if (noRecordsMessage) {
                    noRecordsMessage.remove();
                }
                newCards.forEach(card => {
                    cardList.appendChild(card.cloneNode(true));
                });
                currentPage++;
                hasMoreData = newCards.length === pageSize;
            } else {
                hasMoreData = false;
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
            hasMoreData = false;
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
            isLoading = false;
            hideLoadingIndicator();
        });
}

function showLoadingIndicator() {
    const cardList = document.getElementById('card-list');
    let existingIndicator = cardList.querySelector('#loading-indicator');
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