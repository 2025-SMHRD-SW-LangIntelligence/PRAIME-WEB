// main.js 파일 

const serviceKey = "7GTN%2BzwFC7KgPhWIUmHGxHuVsDGd1TnKWWtReEorkPr%2F%2FX9KhMaSl0nTTkBrp9Eh2FXbykME%2BXR%2F3kPoxv3A4A%3D%3D";
const nx = 58, ny = 74;

async function getTodayDate() {
	const now = new Date();
	return now.toISOString().split('T')[0].replace(/-/g, '');
}

function getBaseTime(type = 'forecast') {
	const now = new Date();
	let hour = now.getHours(), minute = now.getMinutes();
	if (type === 'forecast') {
		const baseTimes = ['0200', '0500', '0800', '1100', '1400', '1700', '2000', '2300'];
		let base = '0200';
		for (let t of baseTimes) if (hour * 100 + minute >= parseInt(t) + 110) base = t;
		return base;
	}
	if (minute < 45) hour -= 1;
	if (hour < 0) hour = 23;
	return `${hour.toString().padStart(2, '0')}00`;
}

function checkWarnings({ humidity, rainfall, windSpeed }) {
	const warnings = [];
	if (windSpeed >= 21) warnings.push("💨 강풍 경보");
	else if (windSpeed >= 14) warnings.push("💨 강풍 주의보");

	if (rainfall >= 50) warnings.push("🌧 호우 경보");
	else if (rainfall >= 30) warnings.push("🌧 호우 주의보");

	if (humidity <= 25) warnings.push("🔥 건조 경보");
	else if (humidity <= 35) warnings.push("🔥 건조 주의보");

	return warnings.length ? warnings : ["특이사항 없음"];
}

// 아이콘 경로 생성 함수 - 제공된 URL 사용하도록 수정
function getWeatherIconUrl(sky, pty) {
    let iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-clear-icon.png"; // 기본값 (맑음 아이콘)

    // PTY (강수 형태) 우선 처리
    if (pty !== "0") {
        switch (pty) {
            case "1": // 비 (rain)
            case "4": // 소나기 (shower)
            case "5": // 빗방울 (drizzle)
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-showers-scattered-day-icon.png";
                break;
            case "2": // 비/눈 (rain/snow)
            case "3": // 눈 (snow)
            case "6": // 빗방울눈날림 (drizzle/snow)
            case "7": // 눈날림 (snow flurries)
                // 눈/비 혼합 또는 눈 아이콘으로 사용 가능한 것이 제한적
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-hail-icon.png"; // 일단 우박 아이콘으로 대체 (가장 유사)
                break;
            default:
                // 알 수 없는 PTY 값에 대한 기본값
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-clear-icon.png";
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
                // '흐림'에 명확히 맞는 아이콘이 없으므로 '구름 많음'과 동일하게 사용
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-clouds-icon.png";
                break;
            default:
                // 알 수 없는 SKY 값에 대한 기본값
                iconUrl = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-clear-icon.png";
                break;
        }
    }
    return iconUrl;
}


async function fetchWeather() {
	const baseDate = await getTodayDate();
	const timeNcst = getBaseTime('now');
	const timeFcst = getBaseTime('forecast'); // 예보 호출을 위한 base_time (예: 0200, 0500 등)

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

        if (!ncstResponse.response || !ncstResponse.response.body || !ncstResponse.response.body.items || !ncstResponse.response.body.items.item) {
            throw new Error("Ncst API 응답 형식이 올바르지 않거나 데이터가 없습니다.");
        }
        if (!fcstResponse.response || !fcstResponse.response.body || !fcstResponse.response.body.items || !fcstResponse.response.body.items.item) {
            throw new Error("Fcst API 응답 형식이 올바르지 않거나 데이터가 없습니다.");
        }

		const ncst = ncstResponse.response.body.items.item;
		const fcst = fcstResponse.response.body.items.item;
		
        // === 여기부터 수정 ===
        // fcst 배열에서 SKY와 PTY 카테고리의 값을 직접 찾아봅니다.
        // 특정 fcstTime과 fcstDate에 대한 정확한 매칭이 어려울 수 있으므로,
        // 가장 최근의 base_time으로 가져온 fcst 배열에서 SKY와 PTY를 찾도록 변경합니다.
        // (fcst 배열에는 여러 예보 시간과 카테고리가 섞여 있습니다.)
        
        let sky = "1"; // 기본값: 맑음
        let pty = "0"; // 기본값: 없음

        // PTY (강수 형태) 값을 먼저 찾습니다. (fcst 배열에서 PTY 카테고리만 필터링)
        const ptyItem = fcst.find(item => item.category === "PTY");
        if (ptyItem) {
            pty = ptyItem.fcstValue;
        }

        // SKY (하늘 상태) 값을 찾습니다. (fcst 배열에서 SKY 카테고리만 필터링)
        const skyItem = fcst.find(item => item.category === "SKY");
        if (skyItem) {
            sky = skyItem.fcstValue;
        }

        console.log(`Parsed SKY: ${sky}, PTY: ${pty}`);
        // === 여기까지 수정 ===

        // 기온, 습도, 강수, 풍속은 초단기 실황(Ncst)에서 가져옵니다.
		const temp = ncst.find(i => i.category === "T1H")?.obsrValue;
		const humid = ncst.find(i => i.category === "REH")?.obsrValue;
		const wind = ncst.find(i => i.category === "WSD")?.obsrValue;
		const rain = ncst.find(i => i.category === "RN1")?.obsrValue;
        
        console.log(`Fetched temp: ${temp}, humid: ${humid}, wind: ${wind}, rain: ${rain}`);

        const displayTemp = temp !== undefined ? `${temp}℃` : 'N/A';
        const displayHumid = humid !== undefined ? `${humid}%` : 'N/A';
        const displayRain = rain !== undefined ? `${rain}mm` : 'N/A';
        const displayWind = wind !== undefined ? `${wind}m/s` : 'N/A';

        console.log(`Display values - Temp: ${displayTemp}, Humid: ${displayHumid}, Rain: ${displayRain}, Wind: ${displayWind}`);


		document.getElementById("temperature").textContent = `🌡 기온: ${displayTemp}`;
		document.getElementById("humidity").textContent = `💧 습도: ${displayHumid}`;
		document.getElementById("rainfall").textContent = `🌧 강수: ${displayRain}`;
		document.getElementById("wind").textContent = `🍃 풍속: ${displayWind}`;

		const iconUrl = getWeatherIconUrl(sky, pty);
		const weatherIconElement = document.getElementById("weatherIcon");
        if (weatherIconElement) {
            weatherIconElement.src = iconUrl;
            console.log(`Weather icon set to: ${iconUrl}`);
        } else {
            console.error("weatherIcon element not found!");
        }


		const warnings = checkWarnings({ humidity: humid, rainfall: rain, windSpeed: wind });
		document.getElementById("weatherWarning").innerHTML = "";
		warnings.forEach(w => {
			const span = document.createElement("span");
			span.textContent = w;
			document.getElementById("weatherWarning").appendChild(span);
		});

		const now = new Date();
		document.getElementById("updateTime").textContent = `${now.getHours()}시 ${now.getMinutes()}분 기준`;
        console.log("--- 날씨 정보 fetch 완료 ---");
	} catch (e) {
		console.error("날씨 정보 불러오기 실패:", e);
        const weatherIconElement = document.getElementById("weatherIcon");
        if (weatherIconElement) {
            weatherIconElement.src = "https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/128/Status-weather-clear-icon.png";
        }
	}
}


window.addEventListener("DOMContentLoaded", () => {
    fetchWeather(); // 기존 날씨 정보 로드

    // --- 이미지 모달 관련 JavaScript 코드 추가 시작 ---
    const imageModal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const modalCaption = document.getElementById("modalCaption");
    const closeButton = document.querySelector(".close-button");

    // 모든 진단 이미지 썸네일에 클릭 이벤트 리스너 추가
    // DOMContentLoaded 시점에 이미지가 존재한다고 가정 (서버 사이드 렌더링 시)
    // 만약 이미지가 JavaScript로 동적으로 추가된다면, 해당 이미지 추가 후 이 리스너를 호출해야 합니다.
    const diagnosisThumbnails = document.querySelectorAll(".journal-image-thumbnail img");

    diagnosisThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener("click", function() {
            imageModal.style.display = "block"; // 모달 보이기
            modalImage.src = this.src; // 클릭된 이미지의 src를 모달 이미지에 설정

            // 이미지의 alt 텍스트 또는 다른 정보를 캡션으로 사용 (옵션)
            const parentItem = this.closest('.journal-item');
            if (parentItem) {
                const titleElement = parentItem.querySelector('.journal-title');
                const descElement = parentItem.querySelector('.journal-desc');
                let captionText = '';
                if (titleElement) captionText += titleElement.textContent;
                if (descElement) captionText += (captionText ? ' - ' : '') + descElement.textContent;
                modalCaption.textContent = captionText;
            } else {
                modalCaption.textContent = this.alt || ''; // alt 속성 사용
            }
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
    // --- 이미지 모달 관련 JavaScript 코드 추가 끝 ---
});


// 페이지 이동 함수들
function goToMyInfoFarmerPage() {
	window.location.href = "/myInfoFarmerPage";
}
function goToFarmlogPage() {
	window.location.href = "/farmlogPage";
}
function goToDiagnosisPage() {
	window.location.href = "/diagnosisPage";
}
function goToFarmlogWritePage() {
	window.location.href = "/farmlogWritePage";
}