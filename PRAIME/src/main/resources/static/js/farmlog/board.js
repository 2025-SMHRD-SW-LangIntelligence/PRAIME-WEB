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

// 페이지 로드 시 초기 데이터 로드
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);

    // ✅ URL에서 초기 정렬 순서 가져오기 및 currentSortOrder 초기화
    currentSortOrder = urlParams.get('sortOrder') || 'desc';

    // URL 파라미터에서 검색 키워드 및 옵션 가져오기 (새로고침 시에도 유지되도록)
    currentKeyword = urlParams.get('keyword') || ''; // 전역 변수 초기화
    currentSearchOption = urlParams.get('searchOption') || 'title'; // 전역 변수 초기화

    const keywordInput = document.getElementById('keyword');
    const searchOptionSelect = document.getElementById('searchOption');

    if (keywordInput) keywordInput.value = currentKeyword;
    if (searchOptionSelect) searchOptionSelect.value = currentSearchOption;

    // 초기 데이터 로드 시 현재 검색 및 정렬 조건 전달
    loadInitialData(); // 인자 없이 호출하도록 변경
    setupInfiniteScroll();
    setupSearchForm();
    setupSortButton();
});

// 초기 데이터 로드
function loadInitialData() {
    currentPage = 0;
    hasMoreData = true;
    // isSearchMode 및 searchResults는 서버 페이징 방식에서는 불필요하므로 제거합니다.
    // clearBoardList(); // 기존 HTML의 카드들을 제거하고 새로 로드 (resetInfiniteScroll에서 수행)
    
    // 초기 데이터 로드는 resetInfiniteScroll 후 loadMoreItems를 호출하도록 통일
    resetInfiniteScroll(); 
    loadMoreItems(); // 인자 없이 호출하도록 변경
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
    
    if (scrollTop + windowHeight >= documentHeight - 100) { // 스크롤이 하단에 가까워지면
        // ✅ loadMoreItems 호출 시 전역 변수 사용
        loadMoreItems(); 
    }
}

// 더 많은 아이템 로드
// ✅ 함수 시그니처에서 인자 제거. 항상 전역 변수 currentKeyword, currentSearchOption, currentSortOrder 사용
function loadMoreItems() {
    if (isLoading || !hasMoreData) return;
    
    isLoading = true;
    showLoadingIndicator();
    
    // ✅ 서버에서 데이터 로드 시 전역 변수 사용
    loadFromServer(currentKeyword, currentSearchOption, currentSortOrder);
}

// ✅ 서버에서 데이터 로드 (keyword, searchOption, sortOrder 인자 추가)
function loadFromServer(keyword, searchOption, sortOrder) {
    const url = `/api/farmlog?page=${currentPage}&size=${pageSize}&keyword=${encodeURIComponent(keyword)}&searchOption=${encodeURIComponent(searchOption)}&sortOrder=${encodeURIComponent(sortOrder)}`;
    
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

            // 기존 "검색 결과 없음" 또는 "등록된 영농일지 없음" 메시지 제거
            const existingNoResult = boardList.querySelector('.no-result');
            if (existingNoResult) {
                existingNoResult.remove();
            }

            if (newCards.length > 0) {
                newCards.forEach(card => {
                    boardList.appendChild(card.cloneNode(true)); 
                });
                
                currentPage++;
                hasMoreData = newCards.length === pageSize; 
            } else {
                hasMoreData = false;
                // 첫 페이지 로드인데 데이터가 없으면 메시지 표시
                if (currentPage === 0 && boardList.querySelectorAll('.board-card').length === 0) { 
                    showNoResultsMessage(keyword);
                }
            }
        })
        .catch(error => {
            console.error('데이터 로드 중 오류 발생:', error);
            hasMoreData = false;
            // 에러 발생 시에도 메시지 표시
            if (currentPage === 0 && boardList.querySelectorAll('.board-card').length === 0) {
                showNoResultsMessage(keyword);
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

// createCardFromData 함수는 현재 HTML 조각을 서버에서 직접 받으므로 이 JS 로직에서는 사용되지 않습니다.
// JSON 데이터를 받을 때 클라이언트에서 동적으로 카드를 생성하는 용도로만 유효합니다.
// (주석 처리 또는 삭제 고려)
function createCardFromData(log) {
    const card = document.createElement('div');
    card.className = 'board-card';
    card.onclick = () => location.href = `/farmlog/view/${log.dlid}`;
    
    const dateObj = new Date(log.dldate); 
    const date = `${dateObj.getFullYear()}년 ${String(dateObj.getMonth() + 1).padStart(2, '0')}월 ${String(dateObj.getDate()).padStart(2, '0')}일 ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
    
    const thumbnailUrl = log.thumbnailUrl || (log.dlimage && log.dlimage.length > 0 ? `/uploads/farmlog/${log.dlimage[0].dlipath}` : '/img/log.png');
    
    card.innerHTML = `
        <div class="card-first-row">
            <div class="board-card-image">
                <img src="${thumbnailUrl}" alt="영농일지 이미지" class="card-thumbnail">
            </div>
            <div class="board-card-text-content">
                <div class="board-card-title">${log.dltitle}</div>
                <div class="board-card-content">${log.dlcontent}</div>
            </div>
        </div>
        <div class="card-second-row">
            <div class="board-card-meta-group">
                <span class="board-card-crop">${log.dlcrop}</span>
                <span class="board-card-weather">${log.dlweather}</span>
                <span class="board-card-temp">${log.dltemp}°C</span>
            </div>
            <div class="board-card-date-group">
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
    // 현재 검색 키워드와 옵션을 전역 변수에 저장
    currentKeyword = document.getElementById('keyword')?.value || '';
    currentSearchOption = document.getElementById('searchOption')?.value || 'title';
    
    // 검색 시 무한 스크롤 상태 재설정 및 데이터 다시 로드
    resetInfiniteScroll();
    // isSearchMode, searchResults 관련 로직은 서버 페이징 방식에서 제거합니다.

    // ✅ 첫 페이지 데이터 로드 (현재 검색 조건 + 현재 정렬 조건 모두 포함)
    loadMoreItems(); 
}

// 정렬 버튼 설정
function setupSortButton() {
    const sortButton = document.getElementById('sort-toggle-button');
    if (sortButton) {
        updateSortButtonUI(sortButton, currentSortOrder); // 초기 정렬 버튼 UI 업데이트
        
        sortButton.addEventListener('click', function() {
            currentSortOrder = (currentSortOrder === 'desc') ? 'asc' : 'desc'; // 현재 정렬 순서를 토글
            updateSortButtonUI(sortButton, currentSortOrder); // 버튼 텍스트 및 아이콘 업데이트
            
            // 정렬 시 무한 스크롤 상태 재설정 및 데이터 다시 로드
            resetInfiniteScroll();
            // isSearchMode, searchResults 관련 로직은 서버 페이징 방식에서 제거합니다.

            // ✅ 첫 페이지 데이터 로드 (현재 검색 조건 + 새로운 정렬 조건 모두 포함)
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