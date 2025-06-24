// 무한스크롤 관련 변수들
let currentPage = 0;
let isLoading = false;
let hasMoreData = true;
const pageSize = 10;

// ✅ 검색 결과 저장용 변수 추가
let searchResults = [];
let isSearchMode = false;

// ✅ 정렬 관련 변수 추가
let currentSortOrder = 'desc'; // 기본값: 최신순

// 페이지 로드 시 초기 데이터 로드
document.addEventListener('DOMContentLoaded', function() {
    // ✅ URL에서 초기 정렬 순서 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    currentSortOrder = urlParams.get('sortOrder') || 'desc';
    
    // URL 파라미터에서 검색 키워드 및 옵션 가져오기 (새로고침 시에도 유지되도록)
    const initialKeyword = urlParams.get('keyword') || '';
    const initialSearchOption = urlParams.get('searchOption') || 'title';
    
    const keywordInput = document.getElementById('keyword');
    const searchOptionSelect = document.getElementById('searchOption');

    if (keywordInput) keywordInput.value = initialKeyword;
    if (searchOptionSelect) searchOptionSelect.value = initialSearchOption;

    loadInitialData(initialKeyword, initialSearchOption);
    setupInfiniteScroll();
    setupSearchForm();
    setupSortButton();
});

// 초기 데이터 로드
function loadInitialData(initialKeyword, initialSearchOption) {
    currentPage = 0;
    hasMoreData = true;
    isSearchMode = false;
    searchResults = [];
    
    clearBoardList(); // 기존 HTML의 카드들을 제거하고 새로 로드
    loadMoreItems(initialKeyword, initialSearchOption); // 초기 데이터 로드 시 검색 조건 전달
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
        loadMoreItems(document.getElementById('keyword')?.value || '', document.getElementById('searchOption')?.value || 'title');
    }
}

// 더 많은 아이템 로드
function loadMoreItems(keyword = '', searchOption = 'title') { // 기본값 설정
    if (isLoading || !hasMoreData) return;
    
    isLoading = true;
    showLoadingIndicator();
    
    // ✅ 검색 모드일 경우 검색 결과 메모리에서 페이징 처리 로직은 현재 서버 페이징 방식과 충돌 -> 제거 또는 수정 필요
    // 이전에 제안된 코드는 서버에서 HTML 조각을 받고 이를 `createCardFromData`로 가공하여 `searchResults`에 저장하는 방식이었음.
    // 하지만 `DailyLogController`는 `Page<DailyLogEntity>`를 반환하여 서버에서 페이징이 되므로,
    // `searchResults`에 '전체 검색 결과'를 담는 방식은 비효율적이고 복잡합니다.
    // 여기서는 `loadFromServer`가 항상 서버에 페이징 요청을 보내도록 합니다.
    
    // 기존의 isSearchMode && searchResults.length > 0 분기 로직을 제거하고,
    // 항상 loadFromServer를 호출하도록 통일합니다.
    loadFromServer(keyword, searchOption);
}

// ✅ 서버에서 데이터 로드 (JSON 응답 처리 -> HTML 조각 응답으로 다시 변경)
// 이전 답변에서 JSON 응답을 권장했으나, 현재 HTML과 JS가 HTML 조각을 처리하고 있으므로 HTML 조각 반환으로 유지합니다.
function loadFromServer(keyword, searchOption) {
    const url = `/api/farmlog?page=${currentPage}&size=${pageSize}&keyword=${encodeURIComponent(keyword)}&searchOption=${encodeURIComponent(searchOption)}&sortOrder=${currentSortOrder}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! status: ${response.status}: ${text}`);
                });
            }
            // 서버가 HTML 조각을 반환한다고 가정
            return response.text(); 
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newCards = doc.querySelectorAll('.board-card'); // HTML 조각에서 .board-card 요소 찾기
            
            const boardList = document.getElementById('board-list');

            // 기존 "검색 결과 없음" 메시지 또는 "등록된 영농일지 없음" 메시지 제거
            const existingNoResult = boardList.querySelector('.no-result');
            if (existingNoResult) {
                existingNoResult.remove();
            }

            if (newCards.length > 0) {
                // 새로운 카드들을 실제 DOM에 추가
                // 검색 모드일 때만 createCardFromData를 사용하도록 수정.
                // 일반 목록 로드 시에는 서버에서 받은 HTML 조각을 그대로 추가.
                // (이는 이전 버전의 board.js 로직을 따름. JSON 방식이 더 유연하지만 현재 구조에 맞춤)

                if (keyword && keyword.trim() !== '') {
                    // 검색 모드일 경우, data-* 속성에서 정보를 추출하여 createCardFromData로 재구성
                    isSearchMode = true;
                    // 검색 결과 전체를 메모리에 저장 (서버에서 전체를 주지 않고 페이징해서 줌 -> 이 로직은 비효율적)
                    // -> searchResults 관련 로직은 제거하고, 받아온 newCards를 바로 DOM에 추가하도록 변경합니다.
                    //    createCardFromData를 호출하려면 log 객체가 필요하므로, 여기서는 사용하지 않습니다.
                    //    대신 newCards에 이미 이미지 정보가 포함되어 있다고 가정하고 그대로 추가합니다.

                    newCards.forEach(card => {
                        boardList.appendChild(card.cloneNode(true)); // 서버에서 받은 HTML 조각 그대로 추가
                    });
                    
                } else {
                    isSearchMode = false;
                    // 새로운 카드들 추가 (일반 목록 로드 시)
                    newCards.forEach(card => {
                        boardList.appendChild(card.cloneNode(true));
                    });
                }
                
                currentPage++;
                hasMoreData = newCards.length === pageSize; // 받아온 데이터 수가 페이지 크기와 같으면 다음 페이지가 있을 가능성 있음
            } else {
                hasMoreData = false;
                // 첫 페이지 로드인데 데이터가 없으면 "검색 결과 없음" 또는 "등록된 일지 없음" 메시지 표시
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

// ✅ 이 함수는 이제 사용되지 않습니다. 서버에서 HTML 조각을 직접 받으므로 DOMParser를 통해 직접 추가합니다.
//     따라서 createCardFromData도 사용되지 않습니다.
// function loadSearchResultsFromMemory() { /* ... */ }


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

// ✅ createCardFromData 함수 수정: 이제 이 함수는 서버가 HTML 조각을 줄 때 사용되지 않고,
//    대신 서버에서 JSON 데이터를 받을 때 클라이언트에서 동적으로 카드를 생성하는 용도로 사용될 것입니다.
//    현재 코드에서는 서버가 HTML 조각을 주기 때문에, 이 함수를 직접적으로 사용하는 부분은 없습니다.
//    (loadFromServer에서 newCards를 직접 appendChild 하고 있습니다.)
//    따라서 이 함수는 DTO와 함께 사용될 때 유용합니다.
//    다만, data-thumbnail-url 속성을 사용하도록 내용을 업데이트해둡니다.
function createCardFromData(log) {
    const card = document.createElement('div');
    card.className = 'board-card';
    card.onclick = () => location.href = `/farmlog/view/${log.dlid}`;
    
    // log.dldate가 String 타입일 경우 new Date()로 파싱
    const dateObj = new Date(log.dldate); 
    const date = `${dateObj.getFullYear()}년 ${String(dateObj.getMonth() + 1).padStart(2, '0')}월 ${String(dateObj.getDate()).padStart(2, '0')}일 ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
    
    // log.thumbnailUrl (DTO에 thumbnailUrl 필드가 있을 경우) 또는 log.dlimage[0].dlipath를 사용
    // 서버가 HTML 조각을 주면 이 함수는 호출되지 않으므로, 이 부분은 클라이언트 JSON 처리 시 유효합니다.
    const thumbnailUrl = log.thumbnailUrl || (log.dlimage && log.dlimage.length > 0 ? `/uploads/farmlog/${log.dlimage[0].dlipath}` : '/img/log.png');
    
    card.innerHTML = `
        <div class="board-card-image">
            <img src="${thumbnailUrl}" alt="영농일지 이미지" class="card-thumbnail">
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
    // 현재 검색 키워드와 옵션을 전역 변수에 저장
    currentKeyword = document.getElementById('keyword')?.value || '';
    currentSearchOption = document.getElementById('searchOption')?.value || 'title';
    
    // 검색 시 무한 스크롤 상태 재설정 및 데이터 다시 로드
    resetInfiniteScroll();
    isSearchMode = true; // 검색 모드 활성화 (단, searchResults 로직은 사용하지 않음)
    searchResults = []; // 필요 없지만, 명시적으로 초기화

    // 첫 페이지 데이터 로드 (검색 조건 포함)
    loadMoreItems(currentKeyword, currentSearchOption);
}


// 날짜별 정렬 (현재 이 함수들은 직접 호출되지 않음)
function sortByDate(ascending = false) {
    console.log('정렬 기능:', ascending ? '오래된순' : '최신순');
}

function sortByLatest() {
    sortByDate(false);
}

function sortByOldest() {
    sortByDate(true);
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
            isSearchMode = false; // 정렬은 검색 모드를 해제함
            searchResults = []; // 필요 없지만, 명시적으로 초기화

            // 첫 페이지 데이터 로드 (현재 검색 조건 + 새로운 정렬 조건)
            const keyword = document.getElementById('keyword')?.value || '';
            const searchOption = document.getElementById('searchOption')?.value || 'title';
            loadMoreItems(keyword, searchOption);
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

// ✅ 검색 결과 정렬 (이 함수는 searchResults 배열이 사용되지 않으므로 필요 없습니다.)
// function sortSearchResults() { /* ... */ }