// edit.js

document.addEventListener("DOMContentLoaded", async () => {
    const pathSegments = window.location.pathname.split('/');
    const dlid = pathSegments[pathSegments.length - 1];

    const preview = document.getElementById("upload-preview");
    const form = document.getElementById("editForm");
    const imageInput = document.getElementById("dlimages");
    const uploadBox = document.querySelector(".image-upload-panel .upload-box"); // Get the upload box element

    if (!dlid || isNaN(dlid)) {
        alert("잘못된 접근입니다. 일지 ID가 유효하지 않습니다.");
        window.history.back();
        return;
    }

    document.getElementById("dlid").value = dlid;

    try {
        const response = await fetch(`/farmlog/editData/${dlid}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`일지를 불러오는 데 실패했습니다. (${response.status}: ${response.statusText})`);
        }
        const data = await response.json();
        const log = data.log;

        document.getElementById("dltitle").value = log.dltitle || "";
        document.getElementById("dlcontent").value = log.dlcontent || "";
        document.getElementById("dlweather").value = log.dlweather || "";
        document.getElementById("dltemp").value = log.dltemp || "";
        document.getElementById("dldate").value = log.dldate || "";
        document.getElementById("dlwork").value = log.dlwork || "";
        document.getElementById("dlpesticide").value = log.dlpesticide || "";

        if (typeof fetchCropOptions === 'function') {
            fetchCropOptions("/farmlog/write/crops", "crop-container", log.dlcrop);
        } else {
            console.error("fetchCropOptions 함수가 정의되지 않았습니다. farmlog.js를 확인하세요.");
        }

        if (log.dlimage && log.dlimage.length > 0) {
            const imgPreviewContainer = document.querySelector("#existingImageContainer");
            imgPreviewContainer.innerHTML = "";

            log.dlimage.forEach(img => {
                const div = document.createElement("div");
                div.classList.add("img-preview");
                div.style.position = "relative";

                const image = document.createElement("img");
                image.src = `/uploads/crops/${img.dlipath}`;
                image.alt = "기존 일지 이미지";
                image.dataset.imageId = img.dliid;
                image.classList.add("thumbnail");
                image.style.width = "80px";
                image.style.height = "80px";
                image.style.objectFit = "cover";
                image.style.borderRadius = "0.5rem";

                const deleteIcon = document.createElement("i");
                deleteIcon.classList.add("fas", "fa-trash-alt", "delete-icon");
                deleteIcon.title = "기존 이미지 삭제";
                deleteIcon.style.cursor = "pointer";

                deleteIcon.style.position = "absolute";
                deleteIcon.style.top = "5px";
                deleteIcon.style.right = "5px";
                deleteIcon.style.color = "#dc3545";
                deleteIcon.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
                deleteIcon.style.borderRadius = "50%";
                deleteIcon.style.padding = "3px";
                deleteIcon.style.fontSize = "1.2em";
                deleteIcon.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

                deleteIcon.addEventListener("click", () => {
                    if (confirm("이 이미지를 정말 삭제하시겠습니까?")) {
                        div.remove();

                        const deletedInput = document.createElement("input");
                        deletedInput.type = "hidden";
                        deletedInput.name = "deletedImageIds";
                        deletedInput.value = img.dliid;
                        form.appendChild(deletedInput);
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
        window.history.back();
    }

    // Function to handle file validation and update imageInput.files
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
        imageInput.files = dt.files;

        // renderImages 함수 (farmlog.js에 정의)를 사용하여 이미지 미리보기를 갱신
        if (typeof renderImages === 'function') {
            renderImages(preview, validFiles, imageInput, true); // 유효한 파일만 미리보기
        } else {
            console.error("renderImages 함수가 정의되지 않았습니다. farmlog.js를 확인하세요.");
            preview.innerHTML = '';
            validFiles.forEach(file => {
                const p = document.createElement('p');
                p.textContent = `선택된 파일: ${file.name}`;
                preview.appendChild(p);
            });
        }
    }


    // ✅ 새 이미지 업로드 처리 (파일 유효성 검사 강화)
    imageInput.addEventListener("change", (e) => {
        handleFiles(e.target.files);
    });

    // --- Drag and Drop Functionality ---
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.add('drag-over'); // Add a class for visual feedback
    });

    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('drag-over'); // Remove the class
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('drag-over'); // Remove the class

        const files = e.dataTransfer.files; // Get files from the dataTransfer object
        if (files.length > 0) {
            // Check if any of the dropped items are images
            const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

            if (imageFiles.length > 0) {
                // If there are image files, process them
                handleFiles(imageFiles);
            } else {
                alert('이미지 파일만 업로드할 수 있습니다.');
            }
        }
    });
    // --- End Drag and Drop Functionality ---


    // ✅ 수정 폼 제출 이벤트 리스너
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

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
        const dlcontent = document.getElementById('dlcontent').value.trim();
        if (!dltitle) {
            alert("제목을 입력해주세요.");
            return;
        }
        if (!dlcontent) {
            alert("내용을 입력해주세요.");
            return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        document.getElementById("dldate").value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

        const formData = new FormData(form);

        try {
            const response = await fetch(`/farmlog/update/${dlid}`, {
                method: 'POST',
                body: formData,
                credentials: "include"
            });

            const responseText = await response.text();
            console.log("HTTP 상태 코드:", response.status);
            console.log("서버 응답 본문:", responseText);

            if (!response.ok) {
                let errorMessage = "일지 수정 실패: 알 수 없는 오류가 발생했습니다.";
                try {
                    const errorJson = JSON.parse(responseText);
                    if (errorJson.message) {
                        errorMessage = `일지 수정 실패: ${errorJson.message}`;
                    }
                } catch (parseError) {
                }
                throw new Error(errorMessage);
            }

            alert("영농일지가 성공적으로 수정되었습니다.");
            window.location.href = `/farmlog/view/${dlid}`;

        } catch (err) {
            console.error("일지 수정 중 오류 발생:", err);
            alert(err.message || "일지 수정 중 알 수 없는 오류가 발생했습니다.");
        }
    });
});