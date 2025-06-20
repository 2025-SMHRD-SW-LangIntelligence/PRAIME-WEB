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

// 아이콘 경로 생성 함수
function getWeatherIconUrl(sky, pty) {
	const prefix = document.getElementById("weatherIconPrefix")?.value || "/img/weather/";
	let iconFile = "icon_2_2.png"; // fallback

	if (pty !== "0") {
		switch (pty) {
			case "1": iconFile = "icon_1_0.png"; break; // 비
			case "2": iconFile = "icon_1_1.png"; break; // 비/눈
			case "3": iconFile = "icon_1_1.png"; break; // 눈
			case "4": iconFile = "icon_1_2.png"; break; // 소나기
		}
	} else {
		switch (sky) {
			case "1": iconFile = "icon_0_0.png"; break; // 맑음
			case "3": iconFile = "icon_0_1.png"; break; // 구름 많음
			case "4": iconFile = "icon_0_2.png"; break; // 흐림
		}
	}
	return `${prefix}${iconFile}`;
}

async function fetchWeather() {
	const baseDate = await getTodayDate();
	const timeNcst = getBaseTime('now');
	const timeFcst = getBaseTime('forecast');

	const urlNcst = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${serviceKey}&pageNo=1&numOfRows=100&dataType=JSON&base_date=${baseDate}&base_time=${timeNcst}&nx=${nx}&ny=${ny}`;
	const urlFcst = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${serviceKey}&pageNo=1&numOfRows=100&dataType=JSON&base_date=${baseDate}&base_time=${timeFcst}&nx=${nx}&ny=${ny}`;

	try {
		const [resNcst, resFcst] = await Promise.all([fetch(urlNcst), fetch(urlFcst)]);
		const ncst = (await resNcst.json()).response.body.items.item;
		const fcst = (await resFcst.json()).response.body.items.item;
		const fcstTime = fcst[0].fcstTime;

		const temp = ncst.find(i => i.category === "T1H")?.obsrValue;
		const humid = ncst.find(i => i.category === "REH")?.obsrValue;
		const wind = ncst.find(i => i.category === "WSD")?.obsrValue;
		const rain = ncst.find(i => i.category === "RN1")?.obsrValue;

		const sky = fcst.find(i => i.category === "SKY" && i.fcstTime === fcstTime)?.fcstValue;
		const pty = fcst.find(i => i.category === "PTY" && i.fcstTime === fcstTime)?.fcstValue ?? "0";

		document.getElementById("temperature").textContent = `🌡 기온: ${temp}℃`;
		document.getElementById("humidity").textContent = `💧 습도: ${humid}%`;
		document.getElementById("rainfall").textContent = `🌧 강수: ${rain}mm`;
		document.getElementById("wind").textContent = `🍃 풍속: ${wind}m/s`;

		const iconUrl = getWeatherIconUrl(sky, pty);
		document.getElementById("weatherIcon").src = iconUrl;

		const warnings = checkWarnings({ humidity: humid, rainfall: rain, windSpeed: wind });
		document.getElementById("weatherWarning").innerHTML = "";
		warnings.forEach(w => {
			const span = document.createElement("span");
			span.textContent = w;
			document.getElementById("weatherWarning").appendChild(span);
		});

		const now = new Date();
		document.getElementById("updateTime").textContent = `${now.getHours()}시 ${now.getMinutes()}분 기준`;
	} catch (e) {
		console.error("날씨 정보 불러오기 실패:", e);
	}
}

window.addEventListener("DOMContentLoaded", fetchWeather);

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