function fetchCropOptions(url, containerId, selectedCrop = null) {
	fetch(url).then(res => res.json()).then(data => {
		const container = document.getElementById(containerId);
		container.innerHTML = "";
		data.forEach((crop, i) => {
			const input = document.createElement("input");
			input.type = "radio";
			input.name = "dlcrop";
			input.value = crop;
			input.id = `${containerId}-dlcrop-${i}`;
			input.hidden = true;
			if (crop === selectedCrop || (selectedCrop === null && i === 0)) input.checked = true;

			const span = document.createElement("span");
			span.className = "crop-label";
			span.textContent = crop;

			const label = document.createElement("label");
			label.className = "crop-card";
			label.htmlFor = input.id;
			label.appendChild(input);
			label.appendChild(span);

			container.appendChild(label);
		});
	});
}

function renderImages(container, filesOrUrls, inputEl, isFile = true) {
	container.innerHTML = "";

	// 총 선택 수 표시
	const count = document.createElement("p");
	count.textContent = `총 ${filesOrUrls.length}장 선택됨`;
	container.appendChild(count);

	filesOrUrls.forEach((item, index) => {
		const wrap = document.createElement("div");
		wrap.style.position = "relative";

		const img = document.createElement("img");
		img.classList.add("thumbnail");

		// 이미지 렌더링
		if (isFile) {
			const reader = new FileReader();
			reader.onload = e => img.src = e.target.result;
			reader.readAsDataURL(item);
		} else {
			// URL 또는 { dlipath: "/경로" } 형태 처리
			img.src = typeof item === "string" ? item : (item.dlipath ?? "");
		}

		wrap.appendChild(img);

		// 삭제 버튼 추가 (파일인 경우만)
		if (isFile) {
			const delBtn = document.createElement("button");
			delBtn.className = "delete-thumbnail";
			delBtn.innerHTML = '<i class="fas fa-times-circle"></i>';
			delBtn.onclick = (e) => {
				e.preventDefault();
				filesOrUrls.splice(index, 1);

				const dt = new DataTransfer();
				filesOrUrls.forEach(f => dt.items.add(f));
				inputEl.files = dt.files;

				renderImages(container, filesOrUrls, inputEl, true);
			};
			wrap.appendChild(delBtn);
		}

		container.appendChild(wrap);
	});
}


function fetchWeather() {
	const API_KEY = "7GTN%2BzwFC7KgPhWIUmHGxHuVsDGd1TnKWWtReEorkPr%2F%2FX9KhMaSl0nTTkBrp9Eh2FXbykME%2BXR%2F3kPoxv3A4A%3D%3D";
	const nx = 58, ny = 74;
	const now = new Date();
	let hour = now.getHours();
	if (now.getMinutes() < 45) hour -= 1;
	const base_time = `${hour < 10 ? "0" : ""}${hour}00`;
	const base_date = now.toISOString().slice(0, 10).replace(/-/g, "");
	const weatherUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}`;

	fetch(weatherUrl).then(res => res.json()).then(data => {
		const items = data.response.body.items.item;
		document.getElementById("dltemp").value = items.find(i => i.category === "T1H")?.obsrValue ?? "0";
		const pty = items.find(i => i.category === "PTY")?.obsrValue ?? "0";
		const skyMap = { "0": "맑음", "1": "비", "2": "비/눈", "3": "눈", "4": "소나기" };
		document.getElementById("dlweather").value = skyMap[pty] ?? "정보 없음";
	});
}