// /js/diagnosis/board.js

document.addEventListener('DOMContentLoaded', () => {
    // 버튼 클릭 이벤트 리스너 (상단 탭)
    const startDiagnosisBtn = document.getElementById('start-diagnosis');
    if (startDiagnosisBtn) {
        startDiagnosisBtn.onclick = () => location.href = '/diagnosisUploadPage';
    }

    const viewHistoryBtn = document.getElementById('view-history');
    if (viewHistoryBtn) {
        viewHistoryBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        viewHistoryBtn.classList.add('active-tab');
        if (startDiagnosisBtn) {
            startDiagnosisBtn.classList.remove('active-tab');
            startDiagnosisBtn.classList.add('btn-outline');
            startDiagnosisBtn.classList.remove('btn-primary');
        }
        viewHistoryBtn.classList.remove('btn-outline');
        viewHistoryBtn.classList.add('btn-primary');
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
    const modalDescription = document.getElementById("modalDescription");
    const modalSolution = document.getElementById("modalSolution"); // 해결 방법 요소
    const googleSearchBtn = document.getElementById("googleSearchBtn"); 
    const closeBtn = document.querySelector(".modal-close");

    // card-list 내 이미지 클릭 시 이벤트 위임
    document.getElementById('card-list').addEventListener('click', function(event) {
        const clickedImg = event.target.closest('.card-thumb img');
        const deleteIcon = event.target.closest('.delete-icon');

        if (deleteIcon) {
            const cardItem = deleteIcon.closest('.card-item');
            const diagnosisId = cardItem.dataset.diagnosisId;
            if (diagnosisId) {
                deleteDiagnosis(diagnosisId, cardItem);
            }
            return;
        }

        if (clickedImg) {
            modal.classList.add('show');
            // 모달이 열릴 때 body 스크롤 비활성화
            document.body.style.overflow = 'hidden'; 
            
            modalImage.src = clickedImg.src;

            const label = clickedImg.dataset.label || '정보 없음';
            const confidence = clickedImg.dataset.confidence || '0%';
            const description = clickedImg.dataset.description || '설명 없음';
            const solution = clickedImg.dataset.solution || ''; // 해결 방법 데이터 가져오기

            modalLabel.textContent = `진단명: ${label}`;
            modalConfidence.textContent = `신뢰도: ${confidence}`;
            modalDescription.textContent = `간략 설명: ${description}`;

            // 해결 방법 표시 로직
            if (solution) {
                modalSolution.innerHTML = `<b>해결 방법:</b><br>${solution.replace(/\n/g, '<br>')}`;
                modalSolution.style.display = 'block';
            } else {
                modalSolution.style.display = 'none';
            }

            // Google 검색 링크 표시 로직
            if (label && !label.includes('정상') && label !== '정보 없음') {
                const pureDiseaseName = label.replace(/^(진단명:\s*배|진단명:\s*사과)\s*/, '').trim(); 
                const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(pureDiseaseName)} 질병 정보`;
                googleSearchBtn.href = googleSearchUrl;
                googleSearchBtn.style.display = 'flex'; 
            } else {
                googleSearchBtn.style.display = 'none'; 
            }

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
            // 모달이 닫힐 때 body 스크롤 재활성화
            document.body.style.overflow = ''; 
        });
    }

    // 모달 배경 클릭 시 모달 닫기
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.classList.remove('show');
                // 모달이 닫힐 때 body 스크롤 재활성화
                document.body.style.overflow = ''; 
            }
        });
    }

    // ESC 키 눌렀을 때 모달 닫기
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && modal && modal.classList.contains('show')) {
            modal.classList.remove('show');
            // 모달이 닫힐 때 body 스크롤 재활성화
            document.body.style.overflow = ''; 
        }
    });

    // 정렬 버튼 클릭 이벤트
    const sortButton = document.getElementById('sort-toggle-button');
    if (sortButton) {
        updateSortButtonUI(sortButton, currentSortOrder); // 초기 UI 설정
        sortButton.addEventListener('click', function() {
            currentSortOrder = (currentSortOrder === 'desc') ? 'asc' : 'desc';
            updateSortButtonUI(sortButton, currentSortOrder);
            resetInfiniteScroll();
            loadMoreDiagnosis(true, currentSortOrder);
        });
    }
});

// 무한스크롤 관련 변수 (글로벌 스코프)
let currentPage = 0;
let isLoading = false;
let hasMoreData = true;
const pageSize = 10;
let currentSortOrder = 'desc';

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
    cardList.innerHTML = ''; // 기존 카드 모두 제거
    // '기록 없음' 또는 '오류 메시지'가 있다면 제거
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

    if (scrollTop + windowHeight >= documentHeight - 100) { // 하단 100px 남았을 때 로드
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

            // 초기 로드 또는 재정렬 시 기존 콘텐츠 비우기
            if (isInitialLoad) {
                cardList.innerHTML = '';
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

/**
 * 진단 이력을 삭제하는 함수
 * @param {number} diagnosisId - 삭제할 진단 이력의 ID
 * @param {HTMLElement} cardItemElement - 삭제할 카드 아이템 DOM 요소
 */
function deleteDiagnosis(diagnosisId, cardItemElement) {
    if (confirm('이 진단 이력을 정말로 삭제하시겠습니까?')) {
        axios.delete(`/api/diagnosis/${diagnosisId}`)
            .then(response => {
                if (response.data.success) {
                    alert('진단 이력이 성공적으로 삭제되었습니다.');
                    cardItemElement.remove(); // DOM에서 해당 카드 아이템 제거

                    // 모든 아이템이 삭제되었는지 확인하고 '기록 없음' 메시지 표시
                    const cardList = document.getElementById('card-list');
                    if (cardList.children.length === 0) {
                        const noRecordsDiv = document.createElement('div');
                        noRecordsDiv.className = 'no-records';
                        noRecordsDiv.textContent = '현재 진단 기록이 없습니다.';
                        cardList.appendChild(noRecordsDiv);
                    }
                } else {
                    alert('진단 이력 삭제에 실패했습니다: ' + response.data.message);
                }
            })
            .catch(error => {
                console.error('진단 이력 삭제 중 오류 발생:', error);
                alert('진단 이력 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
            });
    }
}