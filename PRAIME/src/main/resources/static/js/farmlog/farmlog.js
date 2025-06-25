// farmlog.js

/**
 * 작물 목록을 서버에서 불러와 지정된 컨테이너에 라디오 버튼으로 표시합니다.
 *
 * @param {string} url 작물 목록을 가져올 API 엔드포인트 URL
 * @param {string} containerId 작물 라디오 버튼을 추가할 HTML 요소의 ID
 * @param {string|null} selectedCrop (선택 사항) 미리 선택할 작물의 이름 (수정 페이지에서 사용)
 */
function fetchCropOptions(url, containerId, selectedCrop = null) {
	fetch(url).then(res => res.json()).then(data => {
		const container = document.getElementById(containerId);
		container.innerHTML = ""; // 기존 내용 초기화

		if (data.length === 0) {
			// 작물이 없을 때 안내 메시지 표시
			const noCropsMessage = document.createElement("div");
			noCropsMessage.className = "no-crops-message";
			noCropsMessage.style.cssText = "text-align: center; padding: 20px; color: #666; background: #f9f9f9; border-radius: 8px; margin: 10px 0;";
			noCropsMessage.innerHTML = `
				<p style="margin: 0 0 10px 0; font-weight: bold;">등록된 작물이 없습니다</p>
				<p style="margin: 0; font-size: 14px;">영농일지를 작성하려면 먼저 농장 정보에서 작물을 등록해주세요.</p>
				<button onclick="location.href='/myFarmEditPage'" style="margin-top: 10px; padding: 8px 16px; background: #0f4f35; color: white; border: none; border-radius: 4px; cursor: pointer;">
					농장 정보 수정하기
				</button>
			`;
			container.appendChild(noCropsMessage);
			return;
		}

		data.forEach((crop, i) => {
			const input = document.createElement("input");
			input.type = "radio";
			input.name = "dlcrop";
			input.value = crop;
			input.id = `${containerId}-dlcrop-${i}`;
			input.hidden = true; // 라디오 버튼 자체를 숨김
			// 미리 선택된 작물이 있거나, 첫 번째 작물이면 자동으로 선택
			if (crop === selectedCrop || (selectedCrop === null && i === 0)) {
				input.checked = true;
			}

			const span = document.createElement("span");
			span.className = "crop-label";
			span.textContent = crop;

			const label = document.createElement("label");
			label.className = "crop-card"; // CSS 스타일링을 위한 클래스
			label.htmlFor = input.id;
			label.appendChild(input);
			label.appendChild(span);

			container.appendChild(label);
		});
	}).catch(error => {
		console.error("작물 목록을 불러오는 중 오류 발생:", error);
		const container = document.getElementById(containerId);
		container.innerHTML = `
			<div style="text-align: center; padding: 20px; color: #666; background: #f9f9f9; border-radius: 8px; margin: 10px 0;">
				<p style="margin: 0; color: #e74c3c;">작물 목록을 불러오는 중 오류가 발생했습니다.</p>
				<p style="margin: 10px 0 0 0; font-size: 14px;">페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
			</div>
		`;
	});
}

/**
 * 이미지 미리보기를 렌더링하고 이미지 제거 기능을 제공합니다.
 * 이 함수는 'farmlog.js'에 위치하여 'write.js'와 'edit.js' 모두에서 사용됩니다.
 *
 * @param {HTMLElement} container 미리보기가 표시될 컨테이너 요소
 * @param {Array<File|Object>} filesOrUrls 이미지 File 객체 배열 또는 { dlipath: "경로" } 형태의 객체 배열
 * @param {HTMLInputElement} inputEl 파일 선택 input 요소 (files 속성을 업데이트해야 함)
 * @param {boolean} isFile filesOrUrls가 File 객체 배열인지 여부 (true: File 배열, false: URL/객체 배열)
 */
function renderImages(container, filesOrUrls, inputEl, isFile = true) {
	container.innerHTML = ""; // 기존 미리보기 모두 초기화 (새로 그리기 위함)

	// 총 선택 수 표시
	const count = document.createElement("p");
	count.textContent = `총 ${filesOrUrls.length}장 선택됨`;
	container.appendChild(count);

	filesOrUrls.forEach((item, index) => {
		const wrap = document.createElement("div");
		wrap.style.position = "relative"; // 삭제 아이콘의 absolute 위치 기준점
		wrap.style.display = "inline-block"; // 이미지들이 가로로 정렬되도록
		wrap.style.margin = "5px"; // 미리보기 이미지들 사이의 간격

		const img = document.createElement("img");
		img.classList.add("thumbnail"); // CSS 스타일링을 위한 클래스
		img.style.width = "80px"; // 고정 너비
		img.style.height = "80px"; // 고정 높이
		img.style.objectFit = "cover"; // 비율을 유지하며 공간을 채움
		img.style.borderRadius = "0.5rem"; // 둥근 모서리

		// 이미지 렌더링 (파일 또는 URL/객체에 따라 다름)
		if (isFile) {
			const reader = new FileReader();
			reader.onload = e => img.src = e.target.result; // Base64 데이터 URL 사용
			reader.readAsDataURL(item);
		} else {
			// 이미 존재하는 이미지 (수정 페이지)의 경우, URL 또는 { dlipath: "경로" } 객체 처리
			img.src = typeof item === "string" ? item : (item.dlipath ?? "");
		}

		wrap.appendChild(img);

		// 삭제 버튼 추가 (파일인 경우만, 기존 이미지도 삭제 가능)
		// isFile이 true이면 신규 업로드 파일, isFile이 false이면 기존 이미지 (dlid가 있는 경우)
		// 따라서 isFile 여부와 관계없이 삭제 아이콘은 표시
		const delBtn = document.createElement("i"); // Font Awesome 아이콘을 위해 <i> 태그 사용
		delBtn.classList.add("fas", "fa-trash-alt", "delete-icon"); // Font Awesome 아이콘 클래스 및 커스텀 클래스
		delBtn.title = "이미지 삭제"; // 툴팁
		delBtn.style.cursor = "pointer"; // 클릭 가능한 커서 표시

		// 삭제 아이콘의 위치 및 스타일 설정
		delBtn.style.position = "absolute"; // 부모 div 기준으로 절대 위치
		delBtn.style.top = "5px";   // 상단에서 5px 떨어진 위치
		delBtn.style.right = "5px"; // 오른쪽에서 5px 떨어진 위치
		delBtn.style.color = "#dc3545"; // 삭제 아이콘 색상 (빨간색)
		delBtn.style.backgroundColor = "rgba(255, 255, 255, 0.7)"; // 반투명 흰색 배경
		delBtn.style.borderRadius = "50%"; // 원형 배경
		delBtn.style.padding = "3px"; // 아이콘 주변 패딩
		delBtn.style.fontSize = "1.2em"; // 아이콘 크기
		delBtn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)"; // 그림자 효과

		delBtn.onclick = (e) => {
			e.preventDefault(); // 기본 이벤트 방지
			// 삭제 확인 메시지
			if (confirm("이 이미지를 정말 삭제하시겠습니까?")) {
				// isFile 여부에 따라 다른 삭제 로직 처리
				if (isFile) {
					// 새로운 파일을 삭제하는 경우 (write.js)
					// filesOrUrls 배열에서 해당 파일을 제거
					filesOrUrls.splice(index, 1);

					// inputEl.files를 업데이트하기 위해 DataTransfer 객체 재구성
					const dt = new DataTransfer();
					filesOrUrls.forEach(f => dt.items.add(f));
					inputEl.files = dt.files; // 실제 파일 입력 필드의 파일 목록 업데이트

				} else {
					// 기존 이미지를 삭제하는 경우 (edit.js)
					// filesOrUrls 배열에서 해당 객체를 제거
					// 서버로 보낼 deletedImageIds는 edit.js에서 직접 처리 (renderImages는 순수 렌더링 역할)
					filesOrUrls.splice(index, 1);
				}
				// 변경된 파일/URL 목록으로 미리보기를 다시 렌더링
				renderImages(container, filesOrUrls, inputEl, isFile);
			}
		};
		wrap.appendChild(delBtn);

		container.appendChild(wrap);
	});
}

/**
 * OpenWeatherMap API를 사용하여 현재 날씨 정보를 가져와 input 필드에 설정합니다.
 * (주의: API 키는 실제 서비스 시 서버 측에서 관리하는 것이 보안상 더 좋습니다.)
 */
function fetchWeather() {
	const API_KEY = "7GTN%2BzwFC7KgPhWIUmHGxHuVsDGd1TnKWWtReEorkPr%2F%2FX9KhMaSl0nTTkBrp9Eh2FXbykME%2BXR%2F3kPoxv3A4A%3D%3D"; // 여기에 실제 API 키를 넣으세요.
	const nx = 58, ny = 74; // 예시 좌표 (광주 기준)

	const now = new Date();
	let hour = now.getHours();
	// 기상청 API는 매시 45분 이후부터 다음 시간 데이터 제공
	if (now.getMinutes() < 45) {
		hour -= 1;
	}
	const base_time = `${hour < 10 ? "0" : ""}${hour}00`; // HH00 형식
	const base_date = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD 형식

	const weatherUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}`;

	fetch(weatherUrl).then(res => res.json()).then(data => {
		// API 응답 구조 확인 (오류 처리 추가)
		if (data.response.header.resultCode !== "00") {
			console.error("날씨 정보 API 호출 실패:", data.response.header.resultMsg);
			document.getElementById("dltemp").value = "정보 없음";
			document.getElementById("dlweather").value = "정보 없음";
			return;
		}

		const items = data.response.body.items.item;
		// 기온 (T1H)
		document.getElementById("dltemp").value = items.find(i => i.category === "T1H")?.obsrValue ?? "정보 없음";

		// 강수 형태 (PTY) -> 날씨 변환
		const pty = items.find(i => i.category === "PTY")?.obsrValue ?? "0";
		const skyMap = {
			"0": "맑음",
			"1": "비",
			"2": "비/눈",
			"3": "눈",
			"4": "소나기",
			// 추가 PTY 값에 대한 매핑이 필요할 수 있습니다.
		};
		document.getElementById("dlweather").value = skyMap[pty] ?? "정보 없음";
	}).catch(error => {
		console.error("날씨 정보를 불러오는 중 오류 발생:", error);
		document.getElementById("dltemp").value = "오류";
		document.getElementById("dlweather").value = "오류";
	});
}