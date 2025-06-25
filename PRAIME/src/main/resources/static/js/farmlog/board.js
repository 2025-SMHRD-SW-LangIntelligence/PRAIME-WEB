// 무한스크롤 관련 변수들
let currentPage = 0;
let isLoading = false;
let hasMoreData = true;
const pageSize = 10;

// ✅ 검색 관련 변수
let currentKeyword = ''; // 현재 검색 키워드 저장
let currentSearchOption = 'title'; // 현재 검색 옵션 저장

// ✅ 정렬 관련 변수
let currentSortOrder = 'desc'; // 기본값: 최신순 ('desc' = 최신순, 'asc' = 오래된순)

// 페이지 로드 시 초기 데이터 로드 및 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);

    // URL에서 초기 정렬 순서 가져오기 및 currentSortOrder 초기화
    currentSortOrder = urlParams.get('sortOrder') || 'desc';

    // URL 파라미터에서 검색 키워드 및 옵션 가져오기 (새로고침 시에도 유지되도록)
    currentKeyword = urlParams.get('keyword') || ''; // 전역 변수 초기화
    currentSearchOption = urlParams.get('searchOption') || 'title'; // 전역 변수 초기화

    const keywordInput = document.getElementById('keyword');
    const searchOptionSelect = document.getElementById('searchOption');

    if (keywordInput) keywordInput.value = currentKeyword;
    if (searchOptionSelect) searchOptionSelect.value = currentSearchOption;

    // 초기 데이터 로드 (첫 페이지 데이터)
    loadInitialData(); 
    setupInfiniteScroll();
    setupSearchForm();
    setupSortButton();
    updateSortButtonUI(document.getElementById('sort-toggle-button'), currentSortOrder); // ✅ 초기 버튼 UI 설정
});

// 초기 데이터 로드
function loadInitialData() {
    resetInfiniteScroll(); // 모든 상태 초기화 및 보드 리스트 비우기
    loadMoreItems(); // 첫 페이지 데이터 로드
}

// 무한 스크롤 설정
function setupInfiniteScroll() {
    window.removeEventListener('scroll', handleScroll); // 중복 방지
    window.addEventListener('scroll', handleScroll);
}

// 스크롤 이벤트 핸들러
function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 50 && hasMoreData && !isLoading) {
        loadMoreItems();
    }
}

// 다음 페이지 데이터 로드 요청
function loadMoreItems() {
    loadFromServer(); // 서버에서 데이터 로드
}


// ✅ 서버에서 데이터 로드
function loadFromServer() {
    if (isLoading || !hasMoreData) return;

    isLoading = true;
    showLoadingIndicator();

    // URL은 이제 /api/farmlog 로 사용합니다 (PageController 기준)
    const url = `/api/farmlog?page=${currentPage}&size=${pageSize}&keyword=${encodeURIComponent(currentKeyword)}&searchOption=${encodeURIComponent(currentSearchOption)}&sortOrder=${encodeURIComponent(currentSortOrder)}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! status: ${response.status}: ${text}`);
                });
            }
            return response.text(); 
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newCards = doc.querySelectorAll('.board-card'); 
            
            const boardList = document.getElementById('board-list');

            const existingNoResult = boardList.querySelector('.no-result');
            if (existingNoResult) {
                existingNoResult.remove();
            }

            if (newCards.length > 0) {
                newCards.forEach(card => {
                    boardList.appendChild(card.cloneNode(true)); 
                });
                
                currentPage++;
                // 서버에서 반환된 HTML 프래그먼트에 실제로 데이터가 pageSize만큼 있었는지 확인
                // 이 방식으로 hasMoreData를 결정하는 것이 가장 정확합니다.
                hasMoreData = newCards.length === pageSize; 
            } else {
                // 더 이상 로드할 데이터가 없거나, 처음부터 데이터가 없는 경우
                hasMoreData = false;
                if (currentPage === 0 && boardList.querySelectorAll('.board-card').length === 0) { 
                    showNoResultsMessage(currentKeyword);
                }
            }
        })
        .catch(error => {
            console.error('데이터 로드 중 오류 발생:', error);
            hasMoreData = false;
            if (currentPage === 0 && boardList.querySelectorAll('.board-card').length === 0) {
                showNoResultsMessage(currentKeyword);
            }
        })
        .finally(() => {
            isLoading = false;
            hideLoadingIndicator();
        });
}

// 카드 리스트 초기화
function clearBoardList() {
    const boardList = document.getElementById('board-list');
    boardList.innerHTML = ''; // 모든 자식 요소 제거
}

// 검색 결과가 없을 때 메시지 표시
function showNoResultsMessage(keyword) {
    const boardList = document.getElementById('board-list');
    
    const existingNoResult = boardList.querySelector('.no-result');
    if (existingNoResult) {
        existingNoResult.remove();
    }
    
    const noResultDiv = document.createElement('div');
    noResultDiv.className = 'no-result';
    
    if (keyword && keyword.trim() !== '') {
        noResultDiv.innerHTML = `'<span>${keyword}</span>'에 대한 검색 결과가 없습니다.`;
    } else {
        noResultDiv.innerHTML = '등록된 영농일지가 없습니다.';
    }
    
    boardList.appendChild(noResultDiv);
}

// 로딩 인디케이터 표시
function showLoadingIndicator() {
    const boardList = document.getElementById('board-list');
    const existingIndicator = boardList.querySelector('#loading-indicator');
    
    if (!existingIndicator) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div><p>로딩 중...</p>';
        boardList.appendChild(loadingDiv);
    }
}

// 로딩 인디케이터 숨기기
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// 검색 폼 설정
function setupSearchForm() {
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }
}

// 검색 실행
function performSearch() {
    // 현재 검색 키워드와 옵션을 전역 변수에 저장
    currentKeyword = document.getElementById('keyword')?.value || '';
    currentSearchOption = document.getElementById('searchOption')?.value || 'title';
    
    // 검색 시 무한 스크롤 상태 재설정 및 데이터 다시 로드
    resetInfiniteScroll();
    loadMoreItems(); 
}

// 정렬 버튼 설정
function setupSortButton() {
    const sortButton = document.getElementById('sort-toggle-button');
    if (sortButton) {
        // 이 함수가 호출될 때마다 초기 UI를 다시 설정합니다. (DOMContentLoaded에서 한 번 호출되므로 여기서는 제거)
        // updateSortButtonUI(sortButton, currentSortOrder); 
        
        sortButton.addEventListener('click', function() {
            currentSortOrder = (currentSortOrder === 'desc') ? 'asc' : 'desc'; // 현재 정렬 순서를 토글
            updateSortButtonUI(sortButton, currentSortOrder); // 버튼 텍스트 및 아이콘 업데이트
            
            // 정렬 시 무한 스크롤 상태 재설정 및 데이터 다시 로드
            resetInfiniteScroll();
            loadMoreItems();
        });
    }
}

// 정렬 버튼 UI 업데이트
function updateSortButtonUI(button, order) {
    if (order === 'desc') {
        button.innerHTML = '<i class="fas fa-sort-amount-down-alt"></i> 최신순';
    } else {
        button.innerHTML = '<i class="fas fa-sort-amount-up-alt"></i> 오래된순';
    }
}

// 무한 스크롤 상태 재설정 (검색/정렬 시작 시 호출)
function resetInfiniteScroll() {
    currentPage = 0;
    isLoading = false;
    hasMoreData = true;
    clearBoardList(); // 화면의 모든 카드 제거
}