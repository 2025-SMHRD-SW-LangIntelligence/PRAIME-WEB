// main.js 파일

const serviceKey = "7GTN%2BzwFC7KgPhWIUmHGxHuVsDGd1TnKWWtReEorkPr%2F%2FX9KhMaSl0nTTkBrp9Eh2FXbykME%2BXR%2F3kPoxv3A4A%3D%3D";
const nx = 58, ny = 74; // 광주시 충장동 기준 (고정)

async function getTodayDate() {
    const now = new Date();
    return now.toISOString().split('T')[0].replace(/-/g, '');
}

function getBaseTime(type = 'forecast') {
    const now = new Date();
    let hour = now.getHours(), minute = now.getMinutes();

    // 'forecast' 타입: 3시간마다 업데이트되는 예보 (02, 05, 08, 11, 14, 17, 20, 23시)
    if (type === 'forecast') {
        const baseTimes = ['0200', '0500', '0800', '1100', '1400', '1700', '2000', '2300'];
        let base = '0200'; // 기본값

        // 현재 시간보다 같거나 작은 가장 최신 base_time 찾기 (발표 후 10분 정도 대기 시간 고려)
        for (let i = baseTimes.length - 1; i >= 0; i--) {
            const bt = parseInt(baseTimes[i].substring(0, 2)); // 시간 부분
            const bm = parseInt(baseTimes[i].substring(2, 4)); // 분 부분
            // 기준 시간 + 10분 (데이터 생성 지연 고려)
            if ((hour * 60 + minute) >= (bt * 60 + bm + 10)) { 
                base = baseTimes[i];
                break;
            }
        }
        return base;
    } 
    // 'now' 타입 (초단기 실황): 매시 45분 이후 업데이트
    if (minute < 45) { // 45분 이전이면 이전 시간으로
        hour -= 1;
    }
    if (hour < 0) { // 자정 이전이면 전날 23시
        hour = 23;
    }
    return `${hour.toString().padStart(2, '0')}00`;
}

function checkWarnings({ humidity, rainfall, windSpeed }) {
    const warnings = [];
    // 풍속 (m/s)
    if (windSpeed >= 21) warnings.push("💨 강풍 경보");
    else if (windSpeed >= 14) warnings.push("💨 강풍 주의보");

    // 강수량 (mm/hr)
    if (rainfall !== undefined && rainfall !== null) { // 강수량 데이터가 있을 때만 판단
        if (typeof rainfall === 'string') { // 문자열 "강수없음" 등 처리
            if (rainfall === '강수없음' || parseFloat(rainfall) === 0) {
                // 강수 없음
            } else {
                const numericRainfall = parseFloat(rainfall);
                if (numericRainfall >= 50) warnings.push("🌧 호우 경보");
                else if (numericRainfall >= 30) warnings.push("🌧 호우 주의보");
            }
        } else if (rainfall >= 50) warnings.push("🌧 호우 경보");
        else if (rainfall >= 30) warnings.push("🌧 호우 주의보");
    }

    // 습도 (%) (건조 특보 기준은 상대습도 25% 이하 2일 지속 등 복합적이나, 단순화)
    if (humidity !== undefined && humidity !== null) {
        if (humidity <= 25) warnings.push("🔥 건조 경보");
        else if (humidity <= 35) warnings.push("🔥 건조 주의보");
    }

    return warnings.length ? warnings : ["특이사항 없음"];
}

// 아이콘 경로 생성 함수
function getWeatherIconUrl(sky, pty) {
    let iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-clear-icon.png"; // 기본값 (맑음 아이콘)

    // PTY (강수 형태) 우선 처리
    if (pty !== "0") {
        switch (pty) {
            case "1": // 비
            case "5": // 빗방울
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-showers-scattered-day-icon.png";
                break;
            case "2": // 비/눈
            case "6": // 빗방울눈날림
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-snow-and-rain-icon.png";
                break;
            case "3": // 눈
            case "7": // 눈날림
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-snow-icon.png";
                break;
            case "4": // 소나기
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-storm-icon.png";
                break;
            default:
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-clear-icon.png"; // Fallback
                break;
        }
    } else { // PTY가 0일 경우 (강수 없음), SKY (하늘 상태) 처리
        switch (sky) {
            case "1": // 맑음
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-clear-icon.png";
                break;
            case "3": // 구름 많음
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-clouds-icon.png";
                break;
            case "4": // 흐림
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-overcast-icon.png";
                break;
            default:
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-clear-icon.png"; // Fallback
                break;
        }
    }
    return iconUrl;
}

async function fetchWeather() {
    const baseDate = await getTodayDate();
    const timeNcst = getBaseTime('now'); // 초단기 실황 (현재 날씨)
    const timeFcst = getBaseTime('forecast'); // 동네 예보 (하늘 상태, 강수 형태 등)

    console.log("--- 날씨 정보 fetch 시작 ---");
    console.log(`baseDate: ${baseDate}, timeNcst: ${timeNcst}, timeFcst: ${timeFcst}`);

    const urlNcst = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${serviceKey}&pageNo=1&numOfRows=100&dataType=JSON&base_date=${baseDate}&base_time=${timeNcst}&nx=${nx}&ny=${ny}`;
    const urlFcst = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${serviceKey}&pageNo=1&numOfRows=100&dataType=JSON&base_date=${baseDate}&base_time=${timeFcst}&nx=${nx}&ny=${ny}`;

    console.log("API URL Ncst:", urlNcst);
    console.log("API URL Fcst:", urlFcst);

    try {
        const [resNcst, resFcst] = await Promise.all([fetch(urlNcst), fetch(urlFcst)]);

        if (!resNcst.ok) throw new Error(`Ncst API 응답 오류: ${resNcst.status}`);
        if (!resFcst.ok) throw new Error(`Fcst API 응답 오류: ${resFcst.status}`);

        const ncstResponse = await resNcst.json();
        const fcstResponse = await resFcst.json();

        console.log("Ncst 응답:", ncstResponse);
        console.log("Fcst 응답:", fcstResponse);

        // 데이터 유효성 검사
        if (!ncstResponse.response || !ncstResponse.response.body || !ncstResponse.response.body.items || !ncstResponse.response.body.items.item || ncstResponse.response.body.items.item.length === 0) {
            console.warn("Ncst API 데이터가 없거나 형식이 올바르지 않습니다.");
            // 특정 에러 대신 기본값으로 진행
        }
        if (!fcstResponse.response || !fcstResponse.response.body || !fcstResponse.response.body.items || !fcstResponse.response.body.items.item || fcstResponse.response.body.items.item.length === 0) {
            console.warn("Fcst API 데이터가 없거나 형식이 올바르지 않습니다.");
            // 특정 에러 대신 기본값으로 진행
        }

        const ncstItems = ncstResponse.response.body.items.item || [];
        const fcstItems = fcstResponse.response.body.items.item || [];
        
        let sky = "1"; // 기본값: 맑음
        let pty = "0"; // 기본값: 강수 없음

        // PTY (강수 형태) 값을 먼저 찾습니다. (가장 최신 예보 시간 기준)
        // FCST 배열은 미래 시간도 포함하므로, 'base_time'과 가장 가까운 'fcstTime'을 찾거나,
        // 단순히 PTY와 SKY 카테고리 중 첫 번째 값을 사용하는 것이 일반적.
        // 여기서는 예보 데이터에서 'fcstDate'가 'baseDate'와 같고 'fcstTime'이 현재 시간과 가장 가까운 데이터를 찾는 것이 이상적이지만
        // 간단화를 위해, fcstItems 내에서 해당 카테고리를 가진 첫 번째 아이템을 찾습니다.
        const ptyItem = fcstItems.find(item => item.category === "PTY");
        if (ptyItem) {
            pty = ptyItem.fcstValue;
        }

        // SKY (하늘 상태) 값을 찾습니다.
        const skyItem = fcstItems.find(item => item.category === "SKY");
        if (skyItem) {
            sky = skyItem.fcstValue;
        }

        console.log(`Parsed SKY: ${sky}, PTY: ${pty}`);

        // 초단기 실황(Ncst)에서 가져올 값들
        const temp = ncstItems.find(i => i.category === "T1H")?.obsrValue; // 기온
        const humid = ncstItems.find(i => i.category === "REH")?.obsrValue; // 습도
        const wind = ncstItems.find(i => i.category === "WSD")?.obsrValue; // 풍속
        const rain = ncstItems.find(i => i.category === "RN1")?.obsrValue; // 1시간 강수량

        console.log(`Fetched temp: ${temp}, humid: ${humid}, wind: ${wind}, rain: ${rain}`);

        // 화면에 표시
        document.getElementById("temperature").textContent = `🌡 기온: ${temp !== undefined ? `${temp}℃` : 'N/A'}`;
        document.getElementById("humidity").textContent = `💧 습도: ${humid !== undefined ? `${humid}%` : 'N/A'}`;
        document.getElementById("rainfall").textContent = `🌧 강수: ${rain !== undefined && rain !== '강수없음' ? `${rain}mm` : '강수 없음'}`; // '강수없음' 문자열 처리
        document.getElementById("wind").textContent = `🍃 풍속: ${wind !== undefined ? `${wind}m/s` : 'N/A'}`;

        const iconUrl = getWeatherIconUrl(sky, pty);
        const weatherIconElement = document.getElementById("weatherIcon");
        if (weatherIconElement) {
            weatherIconElement.src = iconUrl;
            console.log(`Weather icon set to: ${iconUrl}`);
        } else {
            console.error("weatherIcon element not found!");
        }

        const warnings = checkWarnings({ humidity: humid, rainfall: rain, windSpeed: wind });
        const weatherWarningElement = document.getElementById("weatherWarning");
        if (weatherWarningElement) {
            weatherWarningElement.innerHTML = "";
            warnings.forEach(w => {
                const span = document.createElement("span");
                span.textContent = w;
                weatherWarningElement.appendChild(span);
            });
        } else {
            console.error("weatherWarning element not found!");
        }

        const now = new Date();
        const updateTimeElement = document.getElementById("updateTime");
        if (updateTimeElement) {
            updateTimeElement.textContent = `${now.getHours()}시 ${now.getMinutes()}분 기준`;
        } else {
            console.error("updateTime element not found!");
        }
        console.log("--- 날씨 정보 fetch 완료 ---");

    } catch (e) {
        console.error("날씨 정보 불러오기 실패:", e);
        const weatherIconElement = document.getElementById("weatherIcon");
        if (weatherIconElement) {
            weatherIconElement.src = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-clear-icon.png"; // 오류 시 기본 아이콘
        }
        document.getElementById("temperature").textContent = `🌡 기온: 정보 없음`;
        document.getElementById("humidity").textContent = `💧 습도: 정보 없음`;
        document.getElementById("rainfall").textContent = `🌧 강수: 정보 없음`;
        document.getElementById("wind").textContent = `🍃 풍속: 정보 없음`;
        document.getElementById("weatherWarning").innerHTML = "<span>날씨 정보를 불러올 수 없습니다.</span>";
        document.getElementById("updateTime").textContent = `오류 발생`;
    }
}


window.addEventListener("DOMContentLoaded", () => {
    // 오늘 날짜 업데이트
    const todayElement = document.querySelector(".today");
    if (todayElement) {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        todayElement.textContent = `${year}년 ${month}월 ${day}일`;
    }

    fetchWeather(); // 날씨 정보 로드

    // --- 이미지 모달 관련 JavaScript 코드 시작 ---
    const imageModal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const modalLabel = document.getElementById("modalLabel");
    const modalConfidence = document.getElementById("modalConfidence");
    const modalDescription = document.getElementById("modalDescription");
    const closeButton = document.querySelector(".close-button");

    // .recent-diagnosis-section 안의 .journal-item에만 클릭 이벤트 리스너 추가
    const diagnosisJournalItems = document.querySelectorAll(".recent-diagnosis-section .journal-item");

    diagnosisJournalItems.forEach(item => {
        item.addEventListener("click", function() {
            // dataset을 통해 data-* 속성 값들을 가져옴
            const imgSrc = this.dataset.imageSrc;
            const label = this.dataset.label;
            const confidence = this.dataset.confidence;
            const description = this.dataset.description;

            modalImage.src = imgSrc;
            modalLabel.textContent = `진단명: ${label || '정보 없음'}`;
            modalConfidence.textContent = `신뢰도: ${confidence || '0%'}`;
            modalDescription.textContent = `간략 설명: ${description || '설명 없음'}`;

            imageModal.style.display = "flex"; // 모달을 flexbox로 표시하여 내용 중앙 정렬
        });
    });

    // 닫기 버튼 클릭 시 모달 닫기
    closeButton.addEventListener("click", () => {
        imageModal.style.display = "none";
    });

    // 모달 외부 영역 클릭 시 모달 닫기
    window.addEventListener("click", (event) => {
        if (event.target === imageModal) {
            imageModal.style.display = "none";
        }
    });
    // --- 이미지 모달 관련 JavaScript 코드 끝 ---
});


// 페이지 이동 함수들
function goToMyInfoFarmerPage() {
    window.location.href = "/myInfoFarmerPage";
}
function goToFarmlogPage() {
    window.location.href = "/farmlogBoardPage"; // 영농일지 목록 페이지로 변경
}
function goToDiagnosisPage() {
    window.location.href = "/diagnosisBoardPage"; // 진단 이력 목록 페이지로 변경
}
function goToFarmlogWritePage() {
    window.location.href = "/farmlogWritePage";
}
function goToDiagnosisUploadPage() {
    window.location.href = "/diagnosisUploadPage";
}