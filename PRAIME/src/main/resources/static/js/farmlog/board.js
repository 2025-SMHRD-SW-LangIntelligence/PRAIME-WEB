// 무한스크롤 관련 변수들
let currentPage = 0;
let isLoading = false;
let hasMoreData = true;
const pageSize = 10;

// ✅ 검색 결과 저장용 변수 추가
let searchResults = [];
let isSearchMode = false;

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
    isSearchMode = false;
    searchResults = [];
    
    // ✅ 기존 HTML의 카드들을 제거하고 새로 로드
    clearBoardList();
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
    
    // ✅ 검색 모드인지 확인
    if (isSearchMode && searchResults.length > 0) {
        // 검색 결과에서 페이징 처리
        loadSearchResultsFromMemory();
    } else {
        // 일반 목록 또는 새로운 검색 요청
        loadFromServer(keyword, searchOption);
    }
}

// ✅ 서버에서 데이터 로드
function loadFromServer(keyword, searchOption) {
    const url = `/api/farmlog?page=${currentPage}&size=${pageSize}&keyword=${encodeURIComponent(keyword)}&searchOption=${encodeURIComponent(searchOption)}`;
    
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newCards = doc.querySelectorAll('.board-card');
            
            if (newCards.length > 0) {
                const boardList = document.getElementById('board-list');
                
                // ✅ 검색 모드인 경우 검색 결과를 메모리에 저장
                if (keyword && keyword.trim() !== '') {
                    isSearchMode = true;
                    // 검색 결과 전체를 메모리에 저장 (서버에서 전체 반환)
                    searchResults = Array.from(newCards).map(card => {
                        return {
                            dlid: card.getAttribute('data-dlid'),
                            dltitle: card.getAttribute('data-title'),
                            dlcontent: card.getAttribute('data-content'),
                            dlcrop: card.getAttribute('data-crop'),
                            dlweather: card.getAttribute('data-weather'),
                            dltemp: card.getAttribute('data-temp'),
                            dldate: card.getAttribute('data-date')
                        };
                    });
                    
                    // 첫 페이지만 표시하고 나머지는 무한스크롤로 처리
                    const firstPageCards = searchResults.slice(0, pageSize);
                    
                    firstPageCards.forEach(log => {
                        const card = createCardFromData(log);
                        boardList.appendChild(card);
                    });
                    
                    currentPage = 1; // 다음 페이지부터 시작
                    hasMoreData = searchResults.length > pageSize;
                } else {
                    // 일반 목록 처리
                    isSearchMode = false;
                    
                    // 새로운 카드들 추가
                    newCards.forEach(card => {
                        boardList.appendChild(card.cloneNode(true));
                    });
                    
                    currentPage++;
                    hasMoreData = newCards.length === pageSize;
                }
            } else {
                hasMoreData = false;
                // ✅ 검색 결과가 없을 때 메시지 표시
                showNoResultsMessage();
            }
        })
        .catch(error => {
            console.error('데이터 로드 중 오류 발생:', error);
            // ✅ 에러 발생 시에도 메시지 표시
            showNoResultsMessage();
        })
        .finally(() => {
            isLoading = false;
            hideLoadingIndicator();
        });
}

// ✅ 검색 결과를 메모리에서 페이징 처리
function loadSearchResultsFromMemory() {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const pageResults = searchResults.slice(startIndex, endIndex);
    
    if (pageResults.length > 0) {
        const boardList = document.getElementById('board-list');
        
        // 검색 결과 카드들 생성 및 추가
        pageResults.forEach(log => {
            const card = createCardFromData(log);
            boardList.appendChild(card);
        });
        
        currentPage++;
        hasMoreData = endIndex < searchResults.length;
    } else {
        hasMoreData = false;
        // ✅ 검색 결과가 없을 때는 메시지 표시하지 않음 (이미 표시됨)
    }
    
    isLoading = false;
    hideLoadingIndicator();
}

// ✅ 카드 리스트 초기화
function clearBoardList() {
    const boardList = document.getElementById('board-list');
    const existingCards = boardList.querySelectorAll('.board-card');
    existingCards.forEach(card => card.remove());
    
    const noResult = boardList.querySelector('.no-result');
    if (noResult) noResult.remove();
}

// ✅ 검색 결과가 없을 때 메시지 표시
function showNoResultsMessage() {
    const boardList = document.getElementById('board-list');
    const keyword = document.getElementById('keyword')?.value || '';
    
    // ✅ 기존 no-result 메시지 제거
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

// ✅ 데이터로부터 카드 생성
function createCardFromData(log) {
    const card = document.createElement('div');
    card.className = 'board-card';
    card.onclick = () => location.href = `/farmlog/view/${log.dlid}`;
    
    const date = new Date(log.dldate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\./g, '').replace(/\s/g, '년 ').replace(/$/, '일');
    
    card.innerHTML = `
        <div class="board-card-image">
            <img src="/img/log.png" alt="영농일지 이미지" class="card-thumbnail">
        </div>
        <div class="board-card-content-wrapper">
            <div class="board-card-title">${log.dltitle}</div>
            <div class="board-card-content">${log.dlcontent}</div>
            <div class="board-card-meta">
                <span class="board-card-crop">${log.dlcrop}</span>
                <span class="board-card-weather">${log.dlweather}</span>
                <span class="board-card-temp">${log.dltemp}°C</span>
                <span class="board-card-date">${date}</span>
            </div>
        </div>
    `;
    
    return card;
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
    const keyword = document.getElementById('keyword')?.value || '';
    const searchOption = document.getElementById('searchOption')?.value || 'title';
    
    // ✅ 검색 버튼 클릭 시 즉시 초기화
    currentPage = 0;
    hasMoreData = true;
    isSearchMode = false;
    searchResults = [];
    
    // ✅ 기존 카드들을 모두 지우고 로딩 표시
    clearBoardList();
    showLoadingIndicator();
    
    // ✅ 빈 검색어 처리: 일반 목록으로 처리
    if (!keyword || keyword.trim() === '') {
        isSearchMode = false;
        loadFromServer('', searchOption);
    } else {
        // 검색어가 있는 경우 검색 실행
        loadFromServer(keyword.trim(), searchOption);
    }
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