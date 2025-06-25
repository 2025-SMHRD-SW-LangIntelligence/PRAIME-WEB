// edit.js

document.addEventListener("DOMContentLoaded", async () => {
    // URL에서 dlid 추출 (경로 변수 방식: /farmlog/edit/{dlid})
    const pathSegments = window.location.pathname.split('/');
    const dlid = pathSegments[pathSegments.length - 1]; // 마지막 세그먼트가 dlid

    const preview = document.getElementById("upload-preview"); // 새 이미지 미리보기 컨테이너
    const form = document.getElementById("editForm"); // 수정 폼
    const imageInput = document.getElementById("dlimages"); // 새 이미지 파일 input

    // dlid 유효성 검사
    if (!dlid || isNaN(dlid)) {
        alert("잘못된 접근입니다. 일지 ID가 유효하지 않습니다.");
        window.history.back(); // 이전 페이지로 돌려보내기
        return;
    }

    // Hidden input에 dlid 설정 (폼 제출 시 사용)
    document.getElementById("dlid").value = dlid;

    try {
        console.log("🔍 수정 데이터 요청 중... dlid:", dlid);
        // 서버에서 일지 데이터와 사용자 작물 목록을 함께 가져옵니다.
        const response = await fetch(`/farmlog/editData/${dlid}`);
        console.log("📡 응답 상태:", response.status, response.statusText);

        if (!response.ok) {
            // 서버에서 에러 응답이 왔을 경우
            const errorText = await response.text();
            console.error("❌ 서버 응답 오류:", errorText);
            throw new Error(`일지를 불러오는 데 실패했습니다. (${response.status}: ${response.statusText})`);
        }

        const data = await response.json();
        console.log("✅ 수정 데이터 로드 성공:", data);
        const log = data.log; // DB에서 가져온 일지 데이터 (DailyLogEntity)
        // const crops = data.crops; // 사용자 정의 작물 목록은 fetchCropOptions에서 직접 가져옵니다.

        // 🌦️ 폼 필드 채우기
        document.getElementById("dltitle").value = log.dltitle || "";
        document.getElementById("dlcontent").value = log.dlcontent || "";
        document.getElementById("dlweather").value = log.dlweather || "";
        document.getElementById("dltemp").value = log.dltemp || "";
        document.getElementById("dldate").value = log.dldate || ""; // 날짜는 서버에서 넘겨주는 형식 그대로 사용
        document.getElementById("dlwork").value = log.dlwork || ""; // 농작업 선택

        // 농약은 선택 사항이므로 값이 없으면 빈 문자열
        document.getElementById("dlpesticide").value = log.dlpesticide || "";

        // --- 작물 목록 불러오기 및 기본값 설정 ---
        // farmlog.js의 fetchCropOptions 함수를 사용하여 작물 라디오 버튼들을 생성하고,
        // 현재 일지의 작물(log.dlcrop)을 기본값으로 선택되도록 합니다.
        if (typeof fetchCropOptions === 'function') {
            fetchCropOptions("/farmlog/write/crops", "crop-container", log.dlcrop);
        } else {
            console.error("fetchCropOptions 함수가 정의되지 않았습니다. farmlog.js를 확인하세요.");
        }

        // 🖼️ 기존 이미지 미리보기 및 삭제 기능 설정
        if (log.dlimage && log.dlimage.length > 0) {
            const imgPreviewContainer = document.querySelector("#existingImageContainer");
            imgPreviewContainer.innerHTML = ""; // 기존 로딩 메시지 등 삭제

            log.dlimage.forEach(img => {
                const div = document.createElement("div");
                div.classList.add("img-preview"); // CSS를 위한 클래스
                div.style.position = "relative"; // 아이콘 위치 지정을 위해

                const image = document.createElement("img");
                image.src = `/uploads/crops/${img.dlipath}`; // 이미지 경로
                image.alt = "기존 일지 이미지";
                image.dataset.imageId = img.dliid; // 이미지 ID 저장 (삭제 시 필요)
                image.classList.add("thumbnail"); // CSS를 위한 클래스
                image.style.width = "80px";
                image.style.height = "80px";
                image.style.objectFit = "cover";
                image.style.borderRadius = "0.5rem";


				// 삭제 아이콘 생성 (<i> 태그 직접 사용)
				const deleteIcon = document.createElement("i");
				deleteIcon.classList.add("fas", "fa-trash-alt", "delete-icon");
				deleteIcon.title = "기존 이미지 삭제"; // 툴팁
				deleteIcon.style.cursor = "pointer"; // 클릭 가능한 커서

				// --- 삭제 아이콘의 위치 및 스타일 설정 ---
				deleteIcon.style.position = "absolute"; // 부모 div 기준으로 절대 위치
				deleteIcon.style.top = "5px";   // 상단에서 5px 떨어진 위치
				deleteIcon.style.right = "5px"; // 오른쪽에서 5px 떨어진 위치
				deleteIcon.style.color = "#dc3545"; // 삭제 아이콘 색상 (빨간색)
				deleteIcon.style.backgroundColor = "rgba(255, 255, 255, 0.7)"; // 반투명 흰색 배경
				deleteIcon.style.borderRadius = "50%"; // 원형 배경
				deleteIcon.style.padding = "3px"; // 아이콘 주변 패딩
				deleteIcon.style.fontSize = "1.2em"; // 아이콘 크기
				deleteIcon.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)"; // 그림자 효과
				// ------------------------------------------

				// 삭제 아이콘 클릭 이벤트 리스너
				deleteIcon.addEventListener("click", () => {
				    if (confirm("이 이미지를 정말 삭제하시겠습니까?")) {
				        div.remove(); // 미리보기 div 제거

				        // 삭제할 이미지 ID를 숨겨진 input으로 폼에 추가
				        const deletedInput = document.createElement("input");
				        deletedInput.type = "hidden";
				        deletedInput.name = "deletedImageIds"; // 서버에서 이 이름으로 배열을 받음
				        deletedInput.value = img.dliid;
				        form.appendChild(deletedInput); // 폼에 추가하여 서버로 전송
				    }
				});

                div.appendChild(image);
                div.appendChild(deleteIcon);
                imgPreviewContainer.appendChild(div);
            });
        }
    } catch (error) {
        console.error("수정 데이터 로딩 오류:", error);
        alert("수정 데이터를 불러오는 중 문제가 발생했습니다. 관리자에게 문의하세요.");
        window.history.back(); // 오류 시 이전 페이지로 돌려보내기
    }

    // ✅ 새 이미지 업로드 처리
    // farmlog.js의 renderImages 함수를 사용하여 미리보기와 제거 기능을 제공합니다.
    imageInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        // renderImages 함수 (farmlog.js에 정의)를 사용하여 이미지 미리보기를 갱신
        // clearExisting = true : 기존 미리보기는 지우고 새로 그립니다.
        if (typeof renderImages === 'function') {
            renderImages(preview, files, imageInput, true);
        } else {
            console.error("renderImages 함수가 정의되지 않았습니다. farmlog.js를 확인하세요.");
            // renderImages 함수가 없을 경우 대체 로직: 파일명만 표시
            preview.innerHTML = ''; // 미리보기 영역 비우기
            files.forEach(file => {
                const p = document.createElement('p');
                p.textContent = `선택된 파일: ${file.name}`;
                preview.appendChild(p);
            });
        }
    });

    // ✅ 수정 폼 제출 이벤트 리스너
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // 기본 폼 제출 동작 방지

        // 1. 작물 선택 검증
        const selectedCrop = document.querySelector('input[name="dlcrop"]:checked');
        if (!selectedCrop) {
            alert("작물을 선택해주세요.");
            return;
        }

        // 2. 농작업 선택 검증
        const selectedWork = document.getElementById("dlwork").value;
        if (!selectedWork) {
            alert("농작업을 선택해주세요.");
            return;
        }

        // 3. 제목 및 내용 필드 검증
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

        // 4. 날짜 필드 업데이트 (저장 직전 현재 시간으로)
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        // LocalDateTime에 맞는 ISO 8601 형식으로 dldate hidden input의 값 업데이트
        document.getElementById("dldate").value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;


        // 5. FormData 생성 (폼의 모든 input 값들을 자동으로 포함)
        const formData = new FormData(form);

        // 6. 파일 유효성 검사 및 필터링 (선택된 새 이미지 파일에만 해당)
        // DataTransfer 객체를 사용하여 유효한 파일만 새로 구성
        const dt = new DataTransfer();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']; // 허용 확장자
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB 제한

        let filteredFileCount = 0;
        Array.from(imageInput.files).forEach(f => {
            const fileExtension = f.name.split(".").pop().toLowerCase();
            if (allowedExtensions.includes(fileExtension) && f.size <= MAX_FILE_SIZE) {
                dt.items.add(f);
            } else {
                filteredFileCount++;
            }
        });

        if (filteredFileCount > 0) {
            alert(`${filteredFileCount}개의 파일이 허용되지 않는 형식( ${allowedExtensions.join(', ')} )이거나 10MB를 초과하여 업로드에서 제외되었습니다.`);
        }
        imageInput.files = dt.files; // 필터링된 파일로 input files 업데이트

        // 7. 서버로 데이터 전송 (비동기 POST 요청)
        try {
            const response = await fetch(`/farmlog/update/${dlid}`, {
                method: 'POST',
                body: formData, // FormData 객체를 body에 직접 넣으면 Content-Type이 자동으로 multipart/form-data로 설정됨
                credentials: "include" // 세션 쿠키 등을 포함하여 요청
            });

            // 서버 응답 확인
            const responseText = await response.text();
            console.log("HTTP 상태 코드:", response.status);
            console.log("서버 응답 본문:", responseText); // 디버깅을 위해 서버 응답 본문 출력

            if (!response.ok) { // HTTP 상태 코드가 2xx가 아닌 경우 (예: 400, 500)
                let errorMessage = "일지 수정 실패: 알 수 없는 오류가 발생했습니다.";
                try {
                    const errorJson = JSON.parse(responseText);
                    if (errorJson.message) {
                        errorMessage = `일지 수정 실패: ${errorJson.message}`;
                    }
                } catch (parseError) {
                    // JSON 파싱 실패 시 기본 에러 메시지 유지
                }
                throw new Error(errorMessage);
            }

            // 성공 시 사용자에게 알림 후 상세 페이지로 이동
            alert("영농일지가 성공적으로 수정되었습니다.");
            window.location.href = `/farmlog/view/${dlid}`; // 수정된 일지 상세 페이지로 이동

        } catch (err) {
            // fetch 또는 Promise 체인에서 발생한 오류 처리
            console.error("일지 수정 중 오류 발생:", err);
            alert(err.message || "일지 수정 중 알 수 없는 오류가 발생했습니다.");
        }
    });
});