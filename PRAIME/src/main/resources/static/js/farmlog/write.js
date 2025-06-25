// write.js

document.addEventListener("DOMContentLoaded", () => {
	const imageInput = document.getElementById("dlimages");
	const preview = document.getElementById("upload-preview");
	const form = document.querySelector(".journal-form");
	let selectedFiles = []; // 사용자가 선택한 파일들을 저장할 배열

	// 작물 목록 불러오기 (farmlog.js에 정의된 함수 호출)
	if (typeof fetchCropOptions === 'function') {
		fetchCropOptions("/farmlog/write/crops", "crop-container");
	} else {
		console.error("fetchCropOptions 함수가 정의되지 않았습니다. farmlog.js를 확인하세요.");
	}

	// 날씨 정보 불러오기 (farmlog.js에 정의된 함수 호출)
	if (typeof fetchWeather === 'function') {
		fetchWeather();
	} else {
		console.error("fetchWeather 함수가 정의되지 않았습니다. farmlog.js를 확인하세요.");
	}

	// 이미지 선택 시 미리보기 표시 (파일 유효성 검사 강화)
	imageInput.addEventListener("change", (e) => {
		const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
		const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

		let validFiles = [];
		let invalidFileMessages = [];

		// 새로 선택된 파일들을 순회하며 유효성 검사
		Array.from(e.target.files).forEach(file => {
			const fileExtension = file.name.split(".").pop().toLowerCase();

			if (!allowedExtensions.includes(fileExtension)) {
				invalidFileMessages.push(`- ${file.name} (허용되지 않는 확장자: ${fileExtension})`);
			} else if (file.size > MAX_FILE_SIZE) {
				invalidFileMessages.push(`- ${file.name} (용량 초과: ${ (file.size / (1024 * 1024)).toFixed(2) }MB, 최대 ${ (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0) }MB)`);
			} else {
				validFiles.push(file); // 유효한 파일만 추가
			}
		});

		// 유효하지 않은 파일이 있으면 사용자에게 알림
		if (invalidFileMessages.length > 0) {
			let errorMessage = "다음 파일들은 업로드할 수 없습니다:\n" + invalidFileMessages.join('\n');
			errorMessage += `\n\n허용되는 확장자: ${allowedExtensions.join(', ')}\n`;
			alert(errorMessage);
		}

		// input 요소의 files 속성을 유효한 파일들로만 다시 설정
		// 이렇게 해야 renderImages나 폼 제출 시 유효한 파일만 처리됩니다.
		const dt = new DataTransfer();
		validFiles.forEach(file => dt.items.add(file));
		imageInput.files = dt.files;
		selectedFiles = validFiles; // selectedFiles 배열도 유효한 파일로 업데이트

		// renderImages 함수 (farmlog.js에 정의)를 사용하여 이미지 미리보기를 갱신
		// 이제 selectedFiles 배열에는 유효한 파일만 들어있으므로, 그것들만 미리보기됩니다.
		if (typeof renderImages === 'function') {
			renderImages(preview, selectedFiles, imageInput, true);
		} else {
			console.error("renderImages 함수가 정의되지 않았습니다. farmlog.js를 확인하세요.");
			preview.innerHTML = '';
			selectedFiles.forEach(file => {
				const p = document.createElement('p');
				p.textContent = `선택된 파일: ${file.name}`;
				preview.appendChild(p);
			});
		}
	});


	// 작성 폼 제출 이벤트 리스너
	form.addEventListener("submit", async (e) => {
		e.preventDefault(); // 기본 폼 제출 동작 방지

		// 1. 작물 선택 검증
		const selectedCrop = document.querySelector('input[name="dlcrop"]:checked');
		if (!selectedCrop) {
			alert("작물을 선택해주세요.");
			return; // 함수 실행 중단
		}

		// 2. 농작업 선택 검증
        const selectedWork = document.getElementById("dlwork").value;
        if (!selectedWork) {
            alert("농작업을 선택해주세요.");
            return; // 함수 실행 중단
        }

        // 3. 제목 및 내용 필드 검증 (선택적: HTML의 required 속성 사용 가능)
        const dltitle = document.getElementById('dltitle').value.trim();
        const dlcontent = document.getElementById('dlcontent').value.trim();
        if (!dltitle) {
            alert("제목을 입력해주세요.");
            return;
        }
        if (!dlcontent) {
            alert("내용을 입력해주세요.");
            return;
        }

        // 4. 폼 제출 직전에 현재 시분초를 포함한 날짜 업데이트 (가장 중요!)
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        // LocalDateTime에 맞는 ISO 8601 형식으로 dldate hidden input의 값 업데이트
        document.getElementById("dldate").value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

		// FormData 객체 생성 (폼의 모든 input 값들을 자동으로 포함)
		const formData = new FormData(form);

        // 이전 단계에서 imageInput.files가 이미 유효한 파일들로 필터링되었으므로,
        // 제출 시점에서는 추가적인 필터링 로직이 필요 없습니다.
        // 불필요한 중복 검사 및 DataTransfer 재구성을 제거합니다.

		try {
			// 서버로 데이터 전송 (비동기 POST 요청)
			const res = await fetch("/farmlog/write", {
				method: "POST",
				body: formData, // FormData 객체를 body에 직접 넣으면 Content-Type이 자동으로 multipart/form-data로 설정됨
				credentials: "include" // 세션 쿠키 등을 포함하여 요청
			});

			// 서버 응답 확인
			const responseText = await res.text(); // 응답 본문을 텍스트로 먼저 받음
			console.log("HTTP 상태 코드:", res.status);
			console.log("서버 응답 본문:", responseText); // 디버깅을 위해 서버 응답 본문 출력

			if (!res.ok) { // HTTP 상태 코드가 2xx가 아닌 경우 (예: 400, 500)
				let errorMessage = "일지 저장 실패: 알 수 없는 오류가 발생했습니다.";
				try {
					// 서버가 JSON 형식의 오류 메시지를 보냈을 경우 파싱 시도
					const errorJson = JSON.parse(responseText);
					if (errorJson.message) {
						errorMessage = `일지 저장 실패: ${errorJson.message}`;
					}
				} catch (parseError) {
					// JSON 파싱 실패 시 기본 에러 메시지 유지
				}
				// 오류 발생 시 alert 띄우고 throw하여 catch 블록으로 이동
				throw new Error(errorMessage);
			}

			// 성공 시 사용자에게 알림 후 게시판 페이지로 이동
			alert("영농일지가 성공적으로 저장되었습니다.");
			window.location.href = "/farmlogBoardPage";

		} catch (err) {
			// fetch 또는 Promise 체인에서 발생한 오류 처리
			console.error("일지 저장 중 오류 발생:", err);
			alert(err.message || "일지 저장 중 알 수 없는 오류가 발생했습니다.");
		}
	});

	// 작성 취소 버튼 클릭 이벤트 리스너
	document.querySelector(".cancel-btn").addEventListener("click", (e) => {
		e.preventDefault(); // 기본 버튼 동작 방지 (페이지 새로고침 등)
		if (confirm("작성을 취소하시겠습니까? 작성된 내용은 저장되지 않습니다.")) {
			window.history.back(); // 이전 페이지로 이동
		}
	});
});