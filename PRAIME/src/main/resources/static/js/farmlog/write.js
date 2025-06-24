import { fetchCropOptionsFromList, fetchWeather, renderImages } from "./farmlog.js";

document.addEventListener("DOMContentLoaded", async () => {
	const form = document.querySelector("#journal-form");
	const imageInput = document.getElementById("dlimages");
	const preview = document.getElementById("upload-preview");
	let selectedFiles = [];

	// 날짜 기본값 설정
		const now = new Date();
		const year = now.getFullYear();
		const month = (now.getMonth() + 1).toString().padStart(2, '0');
		const day = now.getDate().toString().padStart(2, '0');
		const hours = now.getHours().toString().padStart(2, '0');
		const minutes = now.getMinutes().toString().padStart(2, '0');
		// 다음 줄을 추가하여 '초' 정보도 가져옵니다.
		const seconds = now.getSeconds().toString().padStart(2, '0'); // 초 추가!

		// Format for LocalDateTime: YYYY-MM-DDTHH:mm:ss
		// '초'까지 포함된 형식으로 dldate 값을 설정합니다.
		document.getElementById("dldate").value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

	// ✅ 작물 목록 fetch 후 첫 번째 항목 자동 선택
	try {
		const res = await fetch("/farmlog/write/crops", {
			credentials: "include"
		});
		const crops = await res.json();

		if (Array.isArray(crops) && crops.length > 0) {
			const firstCrop = crops[0]; // 첫 번째 작물 선택
			fetchCropOptionsFromList(crops, firstCrop, "crop-container");
		}
	} catch (err) {
		console.error("작물 목록 불러오기 실패:", err);
	}

	// 날씨 정보 자동 입력
	fetchWeather();

	// 이미지 선택 미리보기
	imageInput.addEventListener("change", (e) => {
		selectedFiles = Array.from(e.target.files);
		renderImages(preview, selectedFiles, imageInput);
	});

	// 폼 제출
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const formData = new FormData(form);
		const dt = new DataTransfer();
		const allowed = ['jpg', 'jpeg', 'png', 'pdf'];

		selectedFiles = selectedFiles.filter(file => {
			const ext = file.name.split('.').pop().toLowerCase();
			return allowed.includes(ext) && file.size <= 5 * 1024 * 1024;
		});

		selectedFiles.forEach(file => dt.items.add(file));
		imageInput.files = dt.files;

		try {
			const res = await fetch(form.action, {
				method: "POST",
				body: formData,
				credentials: "include"
				
			});
			console.log("폼 제출 전 dlwork 값:", form.querySelector("#dlwork").value);
			const responseText = await res.text();
			console.log("작성 결과:", responseText);
			
			if (!res.ok) throw new Error("작성 실패");
			alert("등록 완료!");
			window.location.href = "/farmlogBoardPage";
		} catch (err) {
			console.error(err);
			alert("등록 중 오류 발생");
		}
	});

	// 취소 버튼
	document.querySelector(".cancel-btn").addEventListener("click", (e) => {
		e.preventDefault();
		if (confirm("작성을 취소하시겠습니까?")) {
			history.back();
		}
	});
});

