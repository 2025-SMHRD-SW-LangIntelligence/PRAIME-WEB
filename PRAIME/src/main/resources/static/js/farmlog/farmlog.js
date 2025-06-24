// ✅ 작성/수정 공통 작물 선택 라디오 생성기
export function fetchCropOptionsFromList(cropList, selectedCrop, containerId) {
	const container = document.getElementById(containerId);
	if (!container || !Array.isArray(cropList)) return;

	container.innerHTML = "";

	cropList.forEach((crop, idx) => {
		const id = `crop-${idx}`;
		const wrapper = document.createElement("label");
		wrapper.className = "crop-card";

		const radio = document.createElement("input");
		radio.type = "radio";
		radio.name = "dlcrop";
		radio.value = crop;
		radio.id = id;

		if (crop === selectedCrop) {
			radio.checked = true;
		}

		const span = document.createElement("span");
		span.className = "crop-label";
		span.textContent = crop;

		wrapper.appendChild(radio);
		wrapper.appendChild(span);
		container.appendChild(wrapper);
	});
}


// ✅ 기상청 날씨 정보 fetch (직접 API 호출)
export function fetchWeather() {
	const API_KEY = "7GTN%2BzwFC7KgPhWIUmHGxHuVsDGd1TnKWWtReEorkPr%2F%2FX9KhMaSl0nTTkBrp9Eh2FXbykME%2BXR%2F3kPoxv3A4A%3D%3D";
	const nx = 58, ny = 74;

	const now = new Date();
	let hour = now.getHours();
	if (now.getMinutes() < 45) hour -= 1;
	if (hour < 0) hour = 23;

	const base_time = `${hour < 10 ? "0" : ""}${hour}00`;
	const base_date = now.toISOString().split("T")[0].replace(/-/g, "");

	const weatherUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}`;

	fetch(weatherUrl)
		.then(res => res.json())
		.then(data => {
			const items = data?.response?.body?.items?.item ?? [];
			const temp = items.find(i => i.category === "T1H")?.obsrValue ?? "";
			const pty = items.find(i => i.category === "PTY")?.obsrValue ?? "0";

			const skyMap = {
				"0": "맑음",
				"1": "비",
				"2": "비/눈",
				"3": "눈",
				"4": "소나기"
			};

			document.getElementById("dltemp").value = temp;
			document.getElementById("dlweather").value = skyMap[pty] ?? "정보 없음";
		})
		.catch(err => {
			console.error("날씨 정보 불러오기 실패:", err);
		});
}

// ✅ 이미지 미리보기 렌더링
export function renderImages(container, files, inputElement, showExisting = false) {
	container.innerHTML = "";

	// 기존 이미지 렌더링 (수정 페이지에서만 사용)
	if (showExisting) {
		const existingImgs = document.querySelectorAll(".existing-thumbnail");
		existingImgs.forEach(img => {
			const wrapper = document.createElement("div");
			wrapper.className = "image-wrapper";
			wrapper.dataset.imageId = img.dataset.imageId;
			wrapper.style.position = "relative";
			wrapper.innerHTML = `
				<img src="${img.src}" class="thumbnail" />
				<button type="button" class="delete-thumbnail">&times;</button>
			`;
			container.appendChild(wrapper);
		});
	}

	// 새로 업로드한 이미지 렌더링
	files.forEach((file, idx) => {
		const reader = new FileReader();
		reader.onload = () => {
			const wrapper = document.createElement("div");
			wrapper.className = "image-wrapper";
			wrapper.dataset.index = idx;
			wrapper.style.position = "relative";
			wrapper.innerHTML = `
				<img src="${reader.result}" class="thumbnail" />
				<button type="button" class="delete-thumbnail">&times;</button>
			`;
			container.appendChild(wrapper);
		};
		reader.readAsDataURL(file);
	});
}
