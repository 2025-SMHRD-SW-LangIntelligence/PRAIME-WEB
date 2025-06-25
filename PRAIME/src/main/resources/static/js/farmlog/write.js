document.addEventListener("DOMContentLoaded", () => {
	const imageInput = document.getElementById("dlimages");
	const preview = document.getElementById("upload-preview");
	const form = document.querySelector(".journal-form");
	let selectedFiles = []; // 사용자가 선택한 파일들을 저장할 배열

	// 작물 목록 불러오기 (farmlog.js에 정의된 함수 호출)
	// 이 함수가 작물 데이터를 가져와 crop-container div에 동적으로 추가합니다.
	if (typeof fetchCropOptions === 'function') {
		fetchCropOptions("/farmlog/write/crops", "crop-container");
	} else {
		console.error("fetchCropOptions 함수가 정의되지 않았습니다. farmlog.js를 확인하세요.");
	}

	// 날씨 정보 불러오기 (farmlog.js에 정의된 함수 호출)
	// 이 함수가 날씨 데이터를 가져와 dlweather, dltemp hidden input에 설정합니다.
	if (typeof fetchWeather === 'function') {
		fetchWeather();
	} else {
		console.error("fetchWeather 함수가 정의되지 않았습니다. farmlog.js를 확인하세요.");
	}

	// 이미지 선택 시 미리보기 표시
	imageInput.addEventListener("change", (e) => {
		// 새로 선택된 파일들을 selectedFiles 배열에 저장
		selectedFiles = Array.from(e.target.files);
		
		// renderImages 함수 (farmlog.js에 정의)를 사용하여 이미지 미리보기를 갱신
		// 세 번째 인자 true는 새로운 파일이 선택되었을 때 기존 미리보기를 지우고 다시 그리는 것을 의미
		if (typeof renderImages === 'function') {
			renderImages(preview, selectedFiles, imageInput, true);
		} else {
			console.error("renderImages 함수가 정의되지 않았습니다. farmlog.js를 확인하세요.");
			// renderImages 함수가 없을 경우 대체 로직: 파일명만 표시
			preview.innerHTML = ''; // 미리보기 영역 비우기
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
        // 사용자가 '저장하기' 버튼을 누르는 시점의 정확한 시간을 전송하기 위함
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
		
		// DataTransfer 객체를 사용하여 유효한 파일만 새로 구성
		const dt = new DataTransfer();
		const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf','ico','gif','webp','bmp'];
		const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB 제한

		let filteredFileCount = 0; // 필터링되어 제외된 파일 개수

		// 선택된 파일들을 순회하며 유효성 검사 후 DataTransfer 객체에 추가
		selectedFiles.forEach(f => {
			const fileExtension = f.name.split(".").pop().toLowerCase(); // 파일 확장자 추출
			if (allowedExtensions.includes(fileExtension) && f.size <= MAX_FILE_SIZE) {
				dt.items.add(f); // 유효한 파일만 추가
			} else {
				filteredFileCount++; // 유효하지 않은 파일 카운트
			}
		});

		// 유효하지 않은 파일이 있었다면 사용자에게 알림
		if (filteredFileCount > 0) {
			alert(`${filteredFileCount}개의 파일이 허용되지 않는 형식('jpg', 'jpeg', 'png', 'pdf','ico','gif','webp','bmp')이거나 10MB를 초과하여 업로드에서 제외되었습니다.`);
		}

		// 파일 input의 files 속성을 DataTransfer 객체의 files로 업데이트
		// 이렇게 해야 폼 제출 시 유효한 파일들만 서버로 전송됨
		imageInput.files = dt.files;

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
