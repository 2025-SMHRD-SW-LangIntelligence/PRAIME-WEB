// js/farmlog/edit.js

document.addEventListener("DOMContentLoaded", async () => {
    // URL에서 dlid(일지 ID) 추출
    const pathSegments = window.location.pathname.split('/');
    const dlid = pathSegments[pathSegments.length - 1]; // 예: /farmlog/edit/123 -> "123"

    const preview = document.getElementById("upload-preview"); // 새로 업로드할 이미지 미리보기 영역
    const form = document.getElementById("editForm");
    const imageInput = document.getElementById("dlimages"); // 새 이미지를 선택하는 input (name="newImages")
    const uploadBox = document.querySelector(".image-upload-panel .upload-box"); // 드래그 앤 드롭 또는 클릭 영역
    const existingImageContainer = document.getElementById("existingImageContainer"); // 기존 이미지 미리보기 컨테이너

    // dlid 유효성 검사
    if (!dlid || isNaN(dlid)) {
        alert("잘못된 접근입니다. 유효한 일지 ID가 필요합니다.");
        window.history.back();
        return;
    }
	


    // 숨겨진 dlid input 필드에 값 설정
    document.getElementById("dlid").value = dlid;

    try {
        // ✅ 백엔드 API 엔드포인트에 맞춰 fetch URL 수정: /farmlog/editData/{dlid}
        const response = await fetch(`/farmlog/editData/${dlid}`); 
        if (!response.ok) {
            const errorText = await response.text();
            // 서버에서 보낸 메시지가 있다면 활용하고, 없다면 기본 메시지
            const message = response.statusText ? `(${response.status}: ${response.statusText})` : (errorText || '');
            throw new Error(`일지를 불러오는 데 실패했습니다. ${message}`);
        }
        
        const data = await response.json();
        const log = data.log; // 가정: 백엔드에서 'log'라는 키로 데이터를 넘겨줌

        // 폼 필드에 기존 데이터 채우기
        document.getElementById("dltitle").value = log.dltitle || "";
        document.getElementById("dlcontent").value = log.dlcontent || "";
        document.getElementById("dlweather").value = log.dlweather || ""; // hidden 필드
        document.getElementById("dltemp").value = log.dltemp || "";     // hidden 필드
        
        // dldate는 hidden이지만, 정확한 데이터는 필요하므로 넣어줌 (YYYY-MM-DDTHH:MM:SS 또는 YYYY-MM-DD)
        if (log.dldate) {
            // ISO 8601 형식 (예: 2023-01-20T10:30:00) 또는 YYYY-MM-DD 형식으로 가정
            // hidden 필드이므로, 서버에서 받는 문자열 그대로 넣어주는 것이 일반적
            document.getElementById("dldate").value = log.dldate; 
        } else {
            document.getElementById("dldate").value = "";
        }
        
        document.getElementById("dlwork").value = log.dlwork || "";
        document.getElementById("dlpesticide").value = log.dlpesticide || "";

        // 작물 선택 옵션 로드 및 기존 선택값 표시
        // 'fetchCropOptions' 함수는 farmlog.js에 정의되어 있다고 가정
        if (typeof fetchCropOptions === 'function') {
            // ✅ API 엔드포인트를 /farmlog/write/crops로 유지 (이전과 동일)
            fetchCropOptions("/farmlog/write/crops", "crop-container", log.dlcrop);
        } else {
            console.error("fetchCropOptions 함수가 정의되지 않았습니다. farmlog.js 파일을 확인하세요.");
            // 함수가 없을 경우 대체 메시지 표시
            const cropContainer = document.getElementById("crop-container");
            if (cropContainer) {
                cropContainer.innerHTML = '<p style="color: red;">작물 목록을 불러올 수 없습니다. 스크립트 오류.</p>';
            }
        }

        // 기존 이미지 미리보기 및 삭제 기능
        if (log.dlimage && log.dlimage.length > 0) {
            existingImageContainer.innerHTML = ""; // 기존 내용 비우기 (로딩 메시지 제거)

            log.dlimage.forEach(img => {
                const div = document.createElement("div");
                div.classList.add("img-preview"); // CSS에 .img-preview 스타일이 있어야 함
                div.style.position = "relative"; // 삭제 아이콘 위치 조정을 위해 필요

                const image = document.createElement("img");
                // ✅ 이미지 경로 수정: 백엔드 이미지 서빙 경로에 맞춰 조정
                // 예: /uploads/farmlog/{fileName} 또는 /uploads/crops/{fileName}
                // 현재 HTML에서 /uploads/crops/로 되어 있으니 그에 맞춰 유지
                image.src = `/uploads/crops/${img.dlipath}`; 
                image.alt = "기존 일지 이미지";
                image.dataset.imageId = img.dliid; // 이미지 ID 저장 (삭제 요청 시 사용)
                image.classList.add("thumbnail"); // CSS에 .thumbnail 스타일이 있어야 함
                // 인라인 스타일도 적용하여 기본적인 크기 및 모양 유지
                image.style.width = "80px";
                image.style.height = "80px";
                image.style.objectFit = "cover";
                image.style.borderRadius = "0.5rem";

                const deleteIcon = document.createElement("i");
                deleteIcon.classList.add("fas", "fa-times-circle", "delete-icon"); // 'fa-times-circle'이 더 적합해 보입니다.
                deleteIcon.title = "기존 이미지 삭제";
                deleteIcon.style.cursor = "pointer";
                deleteIcon.style.position = "absolute";
                deleteIcon.style.top = "0px";   // 이미지 우측 상단으로 조정
                deleteIcon.style.right = "0px"; // 이미지 우측 상단으로 조정
                deleteIcon.style.color = "#dc3545"; // 빨간색
                deleteIcon.style.backgroundColor = "white"; // 배경색 추가 (선택 사항)
                deleteIcon.style.borderRadius = "50%";
                deleteIcon.style.padding = "2px";
                deleteIcon.style.fontSize = "1.5em"; // 아이콘 크기
                deleteIcon.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)"; // 그림자 효과

                deleteIcon.addEventListener("click", () => {
                    if (confirm("이 이미지를 정말 삭제하시겠습니까?")) {
                        div.remove(); // DOM에서 이미지 제거

                        // 삭제할 이미지 ID를 숨겨진 input에 추가하여 서버로 전송
                        const deletedInput = document.createElement("input");
                        deletedInput.type = "hidden";
                        deletedInput.name = "deletedImageIds"; // 서버에서 이 이름을 받도록 설정
                        deletedInput.value = img.dliid;
                        form.appendChild(deletedInput); // 폼에 추가하여 제출 시 함께 전송
                    }
                });

                div.appendChild(image);
                div.appendChild(deleteIcon);
                existingImageContainer.appendChild(div);
            });
        } else {
             existingImageContainer.innerHTML = '<p style="text-align: center; color: #999;">기존 이미지가 없습니다.</p>';
        }

    } catch (error) {
        console.error("수정 데이터 로딩 오류:", error);
        alert(`수정 데이터를 불러오는 중 문제가 발생했습니다: ${error.message}. 관리자에게 문의하세요.`);
        window.history.back(); 
    }

    // --- 파일 유효성 검사 및 이미지 처리 함수 ---
    function handleFiles(files) {
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

        let validFiles = [];
        let invalidFileMessages = [];

        Array.from(files).forEach(file => {
            const fileExtension = file.name.split(".").pop().toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                invalidFileMessages.push(`- ${file.name} (허용되지 않는 확장자: ${fileExtension})`);
            } else if (file.size > MAX_FILE_SIZE) {
                invalidFileMessages.push(`- ${file.name} (용량 초과: ${ (file.size / (1024 * 1024)).toFixed(2) }MB, 최대 ${ (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0) }MB)`);
            } else {
                validFiles.push(file);
            }
        });

        if (invalidFileMessages.length > 0) {
            let errorMessage = "다음 파일들은 업로드할 수 없습니다:\n" + invalidFileMessages.join('\n');
            errorMessage += `\n\n허용되는 확장자: ${allowedExtensions.join(', ')}\n`;
            alert(errorMessage);
        }

        // input 요소의 files 속성을 유효한 파일들로만 다시 설정
        const dt = new DataTransfer();
        validFiles.forEach(file => dt.items.add(file));
        imageInput.files = dt.files; // HTML input name이 newImages이므로, 여기서 설정된 files가 newImages로 전송됩니다.

        // renderImages 함수 (farmlog.js에 정의)를 사용하여 이미지 미리보기를 갱신
        // `renderImages`는 일반적으로 새 파일만 처리하고 기존 이미지는 별도 영역에 표시
        if (typeof renderImages === 'function') {
            // `imageInput`의 name 속성이 "newImages"이므로, `renderImages` 함수 내부에서도 이를 고려해야 할 수 있습니다.
            // 여기서는 `dlimages` ID를 가진 input을 넘겨주고, 함수 내부에서 `input.files`를 참조할 것입니다.
            renderImages(preview, validFiles, imageInput, true); 
        } else {
            console.error("renderImages 함수가 정의되지 않았습니다. farmlog.js를 확인하세요.");
            // renderImages가 없을 경우 대체 처리: 간단한 파일 이름 목록만 표시
            preview.innerHTML = '';
            validFiles.forEach(file => {
                const p = document.createElement('p');
                p.textContent = `선택된 파일: ${file.name}`;
                preview.appendChild(p);
            });
        }
    }

    // 새 이미지 업로드 처리 (input change 이벤트)
    imageInput.addEventListener("change", (e) => {
        handleFiles(e.target.files);
    });

    // --- Drag and Drop Functionality ---
    // '사진 추가' 텍스트를 클릭하면 파일 선택창이 열리도록 연결
    const uploadText = uploadBox.querySelector('p');
    if (uploadText) {
        uploadText.addEventListener('click', () => {
            imageInput.click();
        });
    }

    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.add('drag-over'); // 드래그 오버 시 시각적 피드백
    });

    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('drag-over'); // 드래그 영역 벗어날 때 제거
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('drag-over'); // 드롭 후 제거

        const files = e.dataTransfer.files; // 드롭된 파일 가져오기
        if (files.length > 0) {
            const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

            if (imageFiles.length > 0) {
                handleFiles(imageFiles); // 이미지 파일만 처리
            } else {
                alert('이미지 파일만 업로드할 수 있습니다.');
            }
        }
    });
    // --- End Drag and Drop Functionality ---

    // ✅ 수정 폼 제출 이벤트 리스너
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // 폼 기본 제출 동작 방지

        // 필수 필드 유효성 검사
        const selectedCrop = document.querySelector('input[name="dlcrop"]:checked');
        if (!selectedCrop) {
            alert("작물을 선택해주세요.");
            return;
        }

        const selectedWork = document.getElementById("dlwork").value;
        if (!selectedWork) {
            alert("농작업을 선택해주세요.");
            return;
        }

        const dltitle = document.getElementById('dltitle').value.trim();
        if (!dltitle) {
            alert("제목을 입력해주세요.");
            return;
        }
        
        const dlcontent = document.getElementById('dlcontent').value.trim();
        if (!dlcontent) {
            alert("내용을 입력해주세요.");
            return;
        }

        // dldate, dlweather, dltemp는 hidden 필드이며,
        // 로드 시 값이 채워졌거나, 백엔드에서 자동으로 처리될 것으로 가정합니다.
        // 클라이언트에서 값을 강제로 설정할 필요가 없다면 아래 코드는 삭제해도 됩니다.
        // 만약 비어있다면 현재 시간으로 설정 (선택 사항)
        // if (!document.getElementById("dldate").value) {
        //     const now = new Date();
        //     const year = now.getFullYear();
        //     const month = (now.getMonth() + 1).toString().padStart(2, '0');
        //     const day = now.getDate().toString().padStart(2, '0');
        //     // Hidden 필드에 THH:MM:SS 형식이 필요한 경우
        //     const hours = now.getHours().toString().padStart(2, '0');
        //     const minutes = now.getMinutes().toString().padStart(2, '0');
        //     const seconds = now.getSeconds().toString().padStart(2, '0');
        //     document.getElementById("dldate").value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        // }


        const formData = new FormData(form);

        // 이미지 input의 name이 "newImages"이므로, FormData에 자동으로 추가됩니다.
        // 삭제할 이미지 ID도 "deletedImageIds" 이름으로 FormData에 이미 추가되어 있습니다.

        try {
            // ✅ 백엔드 API 엔드포인트에 맞춰 fetch URL 수정: /farmlog/update/{dlid}
            const response = await fetch(`/farmlog/update/${dlid}`, { 
                method: 'POST',
                body: formData,
                credentials: "include" // 세션 쿠키 등을 함께 보낼 때 필요
            });

            const responseText = await response.text(); 
            console.log("HTTP 상태 코드:", response.status);
            console.log("서버 응답 본문:", responseText);

            if (!response.ok) {
                let errorMessage = "영농일지 수정 실패: 알 수 없는 오류가 발생했습니다.";
                try {
                    const errorJson = JSON.parse(responseText); // JSON 형식의 오류 메시지 파싱 시도
                    if (errorJson.message) {
                        errorMessage = `영농일지 수정 실패: ${errorJson.message}`;
                    } else if (errorJson.error) { // Spring Boot 기본 에러 응답 형식
                        errorMessage = `영농일지 수정 실패: ${errorJson.error} - ${errorJson.message}`;
                    }
                } catch (parseError) {
                    // JSON 파싱 실패 시, 응답 텍스트를 그대로 사용
                    errorMessage = `영농일지 수정 실패: ${responseText || '알 수 없는 오류'}`;
                }
                throw new Error(errorMessage);
            }

            // 성공 응답이 JSON 형식이라면 파싱하여 성공 메시지 확인 (선택 사항)
            // const result = JSON.parse(responseText); 
            // if (result.success) { 
            alert("영농일지가 성공적으로 수정되었습니다.");
            window.location.href = `/farmlog/view/${dlid}`; // 수정 후 상세 보기 페이지로 이동
            // } else {
            //     alert(result.message || "영농일지 수정에 실패했습니다.");
            // }

        } catch (err) {
            console.error("일지 수정 중 오류 발생:", err);
            alert(err.message || "영농일지 수정 중 알 수 없는 오류가 발생했습니다.");
        }
    });
});

// URL에서 dlid(일지 ID) 추출
const pathSegments = window.location.pathname.split('/');
const dlid = pathSegments[pathSegments.length - 1]; // 예: /farmlog/edit/123 -> "123"
// 이전게시물보기로 가기
function goToViewPage(){
	window.location.href='/farmlog/view/'+dlid
}