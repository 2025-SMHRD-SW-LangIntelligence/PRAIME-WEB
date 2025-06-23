// 더미데이터 배열 (50개)
const dummyData = [
    {
        id: 1,
        title: "사과나무 전정 작업 완료",
        content: "오늘 사과나무 전정 작업을 완료했습니다. 주요 가지들을 정리하고 순을 제거하여 나무의 생육을 도왔습니다.",
        date: "2024.01.15",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 2,
        title: "배나무 물주기 및 유인작업",
        content: "가지 유인 및 수분 관리 작업을 진행했습니다. 날씨가 건조해서 충분히 물을 주었습니다.",
        date: "2024.01.14",
        writer: "김농부",
        weather: "흐림",
        crop: "배"
    },
    {
        id: 3,
        title: "사과나무 병해충 예방 스프레이",
        content: "병해충 예방을 위한 스프레이 작업을 진행했습니다. 흰가루병과 진딧물 예방에 효과적입니다.",
        date: "2024.01.13",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 4,
        title: "배나무 수확 준비",
        content: "배 수확을 위한 준비 작업을 했습니다. 수확용 바구니와 도구들을 정리했습니다.",
        date: "2024.01.12",
        writer: "김농부",
        weather: "맑음",
        crop: "배"
    },
    {
        id: 5,
        title: "사과나무 비료 시비",
        content: "사과나무에 유기질 비료를 시비했습니다. 나무의 건강한 생육을 위해 필요한 영양분을 공급했습니다.",
        date: "2024.01.11",
        writer: "김농부",
        weather: "흐림",
        crop: "사과"
    },
    {
        id: 6,
        title: "농장 전체 점검",
        content: "농장 전체를 점검하고 정리했습니다. 잡초 제거와 경로 정리를 완료했습니다.",
        date: "2024.01.10",
        writer: "김농부",
        weather: "맑음",
        crop: "전체"
    },
    {
        id: 7,
        title: "사과나무 꽃가루받이 작업",
        content: "사과나무 꽃가루받이 작업을 진행했습니다. 벌통을 설치하여 자연 수분을 도왔습니다.",
        date: "2024.01.09",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 8,
        title: "배나무 병해충 진단",
        content: "배나무 잎에 이상한 반점이 발견되어 병해충 진단을 받았습니다. 조기 발견으로 대응할 수 있었습니다.",
        date: "2024.01.08",
        writer: "김농부",
        weather: "흐림",
        crop: "배"
    },
    {
        id: 9,
        title: "사과나무 가지 유인 작업",
        content: "사과나무 가지 유인 작업을 진행했습니다. 나무의 균형잡힌 생육을 위해 중요한 작업입니다.",
        date: "2024.01.07",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 10,
        title: "배나무 잎 제거 작업",
        content: "배나무에서 병든 잎들을 제거했습니다. 병해 확산을 방지하기 위한 중요한 작업입니다.",
        date: "2024.01.06",
        writer: "김농부",
        weather: "흐림",
        crop: "배"
    },
    {
        id: 11,
        title: "사과나무 수확 완료",
        content: "사과 수확을 완료했습니다. 품질이 좋아서 만족스러운 수확이었습니다.",
        date: "2024.01.05",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 12,
        title: "배나무 비료 주기",
        content: "배나무에 유기질 비료를 주었습니다. 나무의 건강한 생육을 위해 필요한 영양분을 공급했습니다.",
        date: "2024.01.04",
        writer: "김농부",
        weather: "흐림",
        crop: "배"
    },
    {
        id: 13,
        title: "농장 정리 작업",
        content: "농장 전체를 정리했습니다. 잡초 제거와 경로 정리를 완료했습니다.",
        date: "2024.01.03",
        writer: "김농부",
        weather: "맑음",
        crop: "전체"
    },
    {
        id: 14,
        title: "사과나무 병해충 예방",
        content: "사과나무 병해충 예방 작업을 진행했습니다. 흰가루병과 진딧물 예방에 효과적입니다.",
        date: "2024.01.02",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 15,
        title: "배나무 전정 작업",
        content: "배나무 전정 작업을 완료했습니다. 주요 가지들을 정리하고 순을 제거했습니다.",
        date: "2024.01.01",
        writer: "김농부",
        weather: "흐림",
        crop: "배"
    },
    {
        id: 16,
        title: "사과나무 물주기",
        content: "사과나무에 충분한 물을 주었습니다. 건조한 날씨로 인해 수분 관리가 중요했습니다.",
        date: "2023.12.31",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 17,
        title: "배나무 가지 유인",
        content: "배나무 가지 유인 작업을 진행했습니다. 나무의 균형잡힌 생육을 위해 중요한 작업입니다.",
        date: "2023.12.30",
        writer: "김농부",
        weather: "흐림",
        crop: "배"
    },
    {
        id: 18,
        title: "사과나무 잎 제거",
        content: "사과나무에서 병든 잎들을 제거했습니다. 병해 확산을 방지하기 위한 중요한 작업입니다.",
        date: "2023.12.29",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 19,
        title: "배나무 수확 준비",
        content: "배 수확을 위한 준비 작업을 했습니다. 수확용 바구니와 도구들을 정리했습니다.",
        date: "2023.12.28",
        writer: "김농부",
        weather: "맑음",
        crop: "배"
    },
    {
        id: 20,
        title: "농장 점검 및 정리",
        content: "농장 전체를 점검하고 정리했습니다. 잡초 제거와 경로 정리를 완료했습니다.",
        date: "2023.12.27",
        writer: "김농부",
        weather: "흐림",
        crop: "전체"
    },
    {
        id: 21,
        title: "사과나무 비료 시비",
        content: "사과나무에 유기질 비료를 시비했습니다. 나무의 건강한 생육을 위해 필요한 영양분을 공급했습니다.",
        date: "2023.12.26",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 22,
        title: "배나무 병해충 예방",
        content: "배나무 병해충 예방 작업을 진행했습니다. 흰가루병과 진딧물 예방에 효과적입니다.",
        date: "2023.12.25",
        writer: "김농부",
        weather: "흐림",
        crop: "배"
    },
    {
        id: 23,
        title: "사과나무 전정 작업",
        content: "사과나무 전정 작업을 완료했습니다. 주요 가지들을 정리하고 순을 제거했습니다.",
        date: "2023.12.24",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 24,
        title: "배나무 물주기",
        content: "배나무에 충분한 물을 주었습니다. 건조한 날씨로 인해 수분 관리가 중요했습니다.",
        date: "2023.12.23",
        writer: "김농부",
        weather: "맑음",
        crop: "배"
    },
    {
        id: 25,
        title: "농장 정리 작업",
        content: "농장 전체를 정리했습니다. 잡초 제거와 경로 정리를 완료했습니다.",
        date: "2023.12.22",
        writer: "김농부",
        weather: "흐림",
        crop: "전체"
    },
    {
        id: 26,
        title: "사과나무 가지 유인",
        content: "사과나무 가지 유인 작업을 진행했습니다. 나무의 균형잡힌 생육을 위해 중요한 작업입니다.",
        date: "2023.12.21",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 27,
        title: "배나무 잎 제거",
        content: "배나무에서 병든 잎들을 제거했습니다. 병해 확산을 방지하기 위한 중요한 작업입니다.",
        date: "2023.12.20",
        writer: "김농부",
        weather: "흐림",
        crop: "배"
    },
    {
        id: 28,
        title: "사과나무 수확 준비",
        content: "사과 수확을 위한 준비 작업을 했습니다. 수확용 바구니와 도구들을 정리했습니다.",
        date: "2023.12.19",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 29,
        title: "배나무 비료 주기",
        content: "배나무에 유기질 비료를 주었습니다. 나무의 건강한 생육을 위해 필요한 영양분을 공급했습니다.",
        date: "2023.12.18",
        writer: "김농부",
        weather: "맑음",
        crop: "배"
    },
    {
        id: 30,
        title: "농장 점검",
        content: "농장 전체를 점검했습니다. 전반적으로 상태가 양호합니다.",
        date: "2023.12.17",
        writer: "김농부",
        weather: "흐림",
        crop: "전체"
    },
    {
        id: 31,
        title: "사과나무 병해충 진단",
        content: "사과나무 잎에 이상한 반점이 발견되어 병해충 진단을 받았습니다. 조기 발견으로 대응할 수 있었습니다.",
        date: "2023.12.16",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 32,
        title: "배나무 전정 작업",
        content: "배나무 전정 작업을 완료했습니다. 주요 가지들을 정리하고 순을 제거했습니다.",
        date: "2023.12.15",
        writer: "김농부",
        weather: "흐림",
        crop: "배"
    },
    {
        id: 33,
        title: "사과나무 물주기",
        content: "사과나무에 충분한 물을 주었습니다. 건조한 날씨로 인해 수분 관리가 중요했습니다.",
        date: "2023.12.14",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 34,
        title: "배나무 가지 유인",
        content: "배나무 가지 유인 작업을 진행했습니다. 나무의 균형잡힌 생육을 위해 중요한 작업입니다.",
        date: "2023.12.13",
        writer: "김농부",
        weather: "맑음",
        crop: "배"
    },
    {
        id: 35,
        title: "농장 정리",
        content: "농장 전체를 정리했습니다. 잡초 제거와 경로 정리를 완료했습니다.",
        date: "2023.12.12",
        writer: "김농부",
        weather: "흐림",
        crop: "전체"
    },
    {
        id: 36,
        title: "사과나무 잎 제거",
        content: "사과나무에서 병든 잎들을 제거했습니다. 병해 확산을 방지하기 위한 중요한 작업입니다.",
        date: "2023.12.11",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 37,
        title: "배나무 수확 준비",
        content: "배 수확을 위한 준비 작업을 했습니다. 수확용 바구니와 도구들을 정리했습니다.",
        date: "2023.12.10",
        writer: "김농부",
        weather: "맑음",
        crop: "배"
    },
    {
        id: 38,
        title: "사과나무 비료 시비",
        content: "사과나무에 유기질 비료를 시비했습니다. 나무의 건강한 생육을 위해 필요한 영양분을 공급했습니다.",
        date: "2023.12.09",
        writer: "김농부",
        weather: "흐림",
        crop: "사과"
    },
    {
        id: 39,
        title: "배나무 병해충 예방",
        content: "배나무 병해충 예방 작업을 진행했습니다. 흰가루병과 진딧물 예방에 효과적입니다.",
        date: "2023.12.08",
        writer: "김농부",
        weather: "맑음",
        crop: "배"
    },
    {
        id: 40,
        title: "농장 점검 및 정리",
        content: "농장 전체를 점검하고 정리했습니다. 잡초 제거와 경로 정리를 완료했습니다.",
        date: "2023.12.07",
        writer: "김농부",
        weather: "맑음",
        crop: "전체"
    },
    {
        id: 41,
        title: "사과나무 전정 작업",
        content: "사과나무 전정 작업을 완료했습니다. 주요 가지들을 정리하고 순을 제거했습니다.",
        date: "2023.12.06",
        writer: "김농부",
        weather: "흐림",
        crop: "사과"
    },
    {
        id: 42,
        title: "배나무 물주기",
        content: "배나무에 충분한 물을 주었습니다. 건조한 날씨로 인해 수분 관리가 중요했습니다.",
        date: "2023.12.05",
        writer: "김농부",
        weather: "맑음",
        crop: "배"
    },
    {
        id: 43,
        title: "사과나무 가지 유인",
        content: "사과나무 가지 유인 작업을 진행했습니다. 나무의 균형잡힌 생육을 위해 중요한 작업입니다.",
        date: "2023.12.04",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 44,
        title: "배나무 잎 제거",
        content: "배나무에서 병든 잎들을 제거했습니다. 병해 확산을 방지하기 위한 중요한 작업입니다.",
        date: "2023.12.03",
        writer: "김농부",
        weather: "흐림",
        crop: "배"
    },
    {
        id: 45,
        title: "농장 정리 작업",
        content: "농장 전체를 정리했습니다. 잡초 제거와 경로 정리를 완료했습니다.",
        date: "2023.12.02",
        writer: "김농부",
        weather: "맑음",
        crop: "전체"
    },
    {
        id: 46,
        title: "사과나무 수확 준비",
        content: "사과 수확을 위한 준비 작업을 했습니다. 수확용 바구니와 도구들을 정리했습니다.",
        date: "2023.12.01",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 47,
        title: "배나무 비료 주기",
        content: "배나무에 유기질 비료를 주었습니다. 나무의 건강한 생육을 위해 필요한 영양분을 공급했습니다.",
        date: "2023.11.30",
        writer: "김농부",
        weather: "흐림",
        crop: "배"
    },
    {
        id: 48,
        title: "사과나무 병해충 예방",
        content: "사과나무 병해충 예방 작업을 진행했습니다. 흰가루병과 진딧물 예방에 효과적입니다.",
        date: "2023.11.29",
        writer: "김농부",
        weather: "맑음",
        crop: "사과"
    },
    {
        id: 49,
        title: "농장 점검",
        content: "농장 전체를 점검했습니다. 전반적으로 상태가 양호합니다.",
        date: "2023.11.28",
        writer: "김농부",
        weather: "맑음",
        crop: "전체"
    },
    {
        id: 50,
        title: "배나무 전정 작업",
        content: "배나무 전정 작업을 완료했습니다. 주요 가지들을 정리하고 순을 제거했습니다.",
        date: "2023.11.27",
        writer: "김농부",
        weather: "흐림",
        crop: "배"
    }
];

// 무한 스크롤 관련 변수
let currentPage = 0;
const pageSize = 10;
let isLoading = false;
let isEnd = false;
let allData = [...dummyData]; // 검색 결과를 저장할 배열

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 초기 데이터 표시 (처음 10개)
    loadMoreItems();
    
    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', handleScroll);
    
    // 검색 폼 이벤트 리스너
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }
});

// 스크롤 핸들러
function handleScroll() {
    if (isLoading || isEnd) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // 스크롤이 페이지 하단에 가까워지면 추가 로드
    if (scrollTop + windowHeight >= documentHeight - 100) {
        loadMoreItems();
    }
}

// 추가 아이템 로드
function loadMoreItems() {
    if (isLoading || isEnd) return;
    
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const itemsToShow = allData.slice(startIndex, endIndex);
    
    if (itemsToShow.length === 0) {
        // 더 이상 로드할 데이터가 없음
        return;
    }
    
    isLoading = true;
    
    // 로딩 표시 (선택사항)
    showLoadingIndicator();
    
    // 실제 로딩 시뮬레이션 (0.5초 지연)
    setTimeout(() => {
        displayBoardList(itemsToShow, true); // true는 append 모드
        currentPage++;
        isLoading = false;
        hideLoadingIndicator();
    }, 500);
}

// 로딩 인디케이터 표시
function showLoadingIndicator() {
    const boardList = document.querySelector('.board-list');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-indicator';
    loadingDiv.className = 'loading-indicator';
    loadingDiv.innerHTML = '<div class="loading-spinner"></div><p>로딩 중...</p>';
    boardList.appendChild(loadingDiv);
}

// 로딩 인디케이터 숨기기
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// 게시판 리스트 표시 함수 (수정됨)
function displayBoardList(data, append = false) {
    const boardList = document.querySelector('.board-list');
    if (!boardList) return;
    
    // append 모드가 아니면 기존 내용 제거
    if (!append) {
        boardList.innerHTML = '';
        currentPage = 0;
    }
    
    // 새로운 카드들 생성
    data.forEach(item => {
        const card = createBoardCard(item);
        boardList.appendChild(card);
    });
}

// 게시판 카드 생성 함수
function createBoardCard(item) {
    const card = document.createElement('div');
    card.className = 'board-card';
    card.onclick = () => location.href = `/view/${item.id}`;
    
    card.innerHTML = `
        <div class="board-card-title">${item.title}</div>
        <div class="board-card-content">${item.content}</div>
        <div class="board-card-date">${item.date}</div>
    `;
    
    return card;
}

// 검색 기능 (수정됨)
function performSearch() {
    const keyword = document.getElementById('keyword').value.toLowerCase();
    const searchOption = document.getElementById('searchOption').value;
    
    if (!keyword.trim()) {
        // 검색어가 없으면 모든 데이터 표시
        allData = [...dummyData];
        currentPage = 0;
        loadMoreItems();
        return;
    }
    
    const filteredData = dummyData.filter(item => {
        switch(searchOption) {
            case 'title':
                return item.title.toLowerCase().includes(keyword);
            case 'content':
                return item.content.toLowerCase().includes(keyword);
            case 'writer':
                return item.writer.toLowerCase().includes(keyword);
            case 'weather':
                return item.weather.toLowerCase().includes(keyword);
            case 'day':
                return item.date.includes(keyword);
            default:
                return item.title.toLowerCase().includes(keyword) || 
                       item.content.toLowerCase().includes(keyword);
        }
    });
    
    allData = filteredData;
    currentPage = 0;
    displayBoardList([], false); // 기존 내용 제거
    loadMoreItems(); // 검색 결과 로드
    
    // 검색 결과가 없을 때 메시지 표시
    if (filteredData.length === 0) {
        const boardList = document.querySelector('.board-list');
        const noResult = document.createElement('div');
        noResult.className = 'no-result';
        noResult.textContent = '검색 결과가 없습니다.';
        boardList.appendChild(noResult);
    }
}

// 날짜별 정렬 기능
function sortByDate(ascending = false) {
    allData = [...dummyData].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return ascending ? dateA - dateB : dateB - dateA;
    });
    currentPage = 0;
    displayBoardList([], false);
    loadMoreItems();
}

// 최신순 정렬 (기본값)
function sortByLatest() {
    sortByDate(false);
}

// 오래된순 정렬
function sortByOldest() {
    sortByDate(true);
} 