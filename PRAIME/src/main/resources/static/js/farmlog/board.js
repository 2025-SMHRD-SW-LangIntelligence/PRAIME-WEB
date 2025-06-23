// 무한스크롤 관련 변수들
let currentPage = 0;
let isLoading = false;
let hasMoreData = true;
const pageSize = 10;

// 페이지 로드 시 초기 데이터 로드
document.addEventListener('DOMContentLoaded', function() {
    loadInitialData();
    setupInfiniteScroll();
    setupSearchForm();
});

// 초기 데이터 로드
function loadInitialData() {
    currentPage = 0;
    hasMoreData = true;
    loadMoreItems();
}

// 무한스크롤 설정
function setupInfiniteScroll() {
    window.addEventListener('scroll', handleScroll);
}

// 스크롤 이벤트 핸들러
function handleScroll() {
    if (isLoading || !hasMoreData) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // 스크롤이 하단에 가까워지면 더 많은 데이터 로드
    if (scrollTop + windowHeight >= documentHeight - 100) {
        loadMoreItems();
    }
}

// 더 많은 아이템 로드
function loadMoreItems() {
    if (isLoading || !hasMoreData) return;
    
    isLoading = true;
    showLoadingIndicator();
    
    const keyword = document.getElementById('keyword')?.value || '';
    const searchOption = document.getElementById('searchOption')?.value || 'title';
    
    // API 호출
    const url = `/api/farmlog?page=${currentPage}&size=${pageSize}&keyword=${encodeURIComponent(keyword)}&searchOption=${encodeURIComponent(searchOption)}`;
    
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newCards = doc.querySelectorAll('.board-card');
            
            if (newCards.length > 0) {
                const boardList = document.getElementById('board-list');
                
                // 첫 페이지가 아니면 기존 카드들 제거하지 않음 (append 모드)
                if (currentPage === 0) {
                    // 기존 더미데이터 제거
                    const existingCards = boardList.querySelectorAll('.board-card');
                    existingCards.forEach(card => card.remove());
                    
                    // no-result 메시지 제거
                    const noResult = boardList.querySelector('.no-result');
                    if (noResult) noResult.remove();
                }
                
                // 새로운 카드들 추가
                newCards.forEach(card => {
                    boardList.appendChild(card.cloneNode(true));
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
    currentPage = 0;
    hasMoreData = true;
    loadMoreItems();
}

// 날짜별 정렬 (필요시 구현)
function sortByDate(ascending = false) {
    // 서버에서 정렬된 데이터를 받아오도록 구현 가능
    console.log('정렬 기능:', ascending ? '오래된순' : '최신순');
}

// 최신순 정렬
function sortByLatest() {
    sortByDate(false);
}

// 오래된순 정렬
function sortByOldest() {
    sortByDate(true);
} 