document.addEventListener("DOMContentLoaded", () => {
	const imageInput = document.getElementById("dlimages");
	const preview = document.getElementById("upload-preview");
	const form = document.querySelector(".journal-form");
	let selectedFiles = [];

	// 날짜 기본값 설정
	const now = new Date();
	const year = now.getFullYear();
	const month = (now.getMonth() + 1).toString().padStart(2, '0');
	const day = now.getDate().toString().padStart(2, '0');
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');
	// Seconds are generally not included in datetime-local value, but if you need them:
	// const seconds = now.getSeconds().toString().padStart(2, '0');

	// Format for datetime-local: YYYY-MM-DDTHH:mm (or YYYY-MM-DDTHH:mm:ss for seconds if needed)
	document.getElementById("dldate").value = `${year}-${month}-${day}T${hours}:${minutes}`;


	// 작물 목록 불러오기
	fetchCropOptions("/farmlog/write/crops", "crop-container");

	// 날씨 정보 불러오기
	fetchWeather();

	// 이미지 선택 시 미리보기 표시
	imageInput.addEventListener("change", (e) => {
		selectedFiles = Array.from(e.target.files);
		renderImages(preview, selectedFiles, imageInput, true); // farmlog.js에 정의
	});

	// 작성 폼 제출
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		
		// 작물 선택 검증
		const selectedCrop = document.querySelector('input[name="dlcrop"]:checked');
		if (!selectedCrop) {
			alert("작물을 선택해주세요.");
			return;
		}
		
		const formData = new FormData(form);
		const dt = new DataTransfer();
		const allowed = ['jpg', 'jpeg', 'png', 'pdf'];

		// 유효한 파일만 필터링 (확장자, 용량 제한)
		selectedFiles = selectedFiles.filter(f => {
			const ext = f.name.split(".").pop().toLowerCase();
			return allowed.includes(ext) && f.size <= 5 * 1024 * 1024;
		});

		selectedFiles.forEach(f => {
			dt.items.add(f);
		});

		imageInput.files = dt.files;

		try {
			const res = await fetch("/farmlog/write", {
				method: "POST",
				body: formData,
				credentials: "include"
			});

			// ✅ 응답 상태 확인
			console.log("HTTP 상태 코드:", res.status);

			// ✅ 응답 텍스트 출력 (디버깅용)
			const responseText = await res.text();
			console.log("서버 응답 본문:", responseText);

			if (!res.ok) throw new Error("서버 응답 오류");

			alert("저장 완료");
			window.location.href = "/farmlogBoardPage";
		} catch (err) {
			console.error(err);
			alert("저장 실패");
		}
	});

	// 작성 취소
	document.querySelector(".cancel-btn").addEventListener("click", (e) => {
		e.preventDefault();
		if (confirm("작성을 취소하시겠습니까?")) {
			window.history.back();
		}
	});
});
