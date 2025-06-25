document.addEventListener("DOMContentLoaded", async () => {
    // URL에서 dlid 추출 (경로 변수 방식: /farmlog/edit/{dlid})
    const pathSegments = window.location.pathname.split('/');
    const dlid = pathSegments[pathSegments.length - 1];

    if (!dlid || isNaN(dlid)) {
        alert("잘못된 접근입니다.");
        return;
    }

    try {
        console.log("🔍 수정 데이터 요청 중... dlid:", dlid);
        const response = await fetch(`/farmlog/editData/${dlid}`);
        console.log("📡 응답 상태:", response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ 서버 응답 오류:", errorText);
            throw new Error(`일지를 불러오는 데 실패했습니다. (${response.status}: ${response.statusText})`);
        }

        const data = await response.json();
        console.log("✅ 수정 데이터 로드 성공:", data);
        const log = data.log;
        const crops = data.crops;

        // 🥬 작물 라디오 버튼 생성
        const cropContainer = document.querySelector("#cropRadioContainer");
        cropContainer.innerHTML = ""; // 기존 라디오 버튼 제거

        crops.forEach(crop => {
            const label = document.createElement("label");
            label.classList.add("crop-radio-label");

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "dlcrop";
            input.value = crop;

            if (log.dlcrop === crop) {
                input.checked = true; // 기존 선택 작물
            }

            const span = document.createElement("span");
            span.textContent = crop;

            label.appendChild(input);
            label.appendChild(span);
            cropContainer.appendChild(label);
        });

        // 🌦️ 폼 필드 채우기
        document.querySelector("input[name='dltitle']").value = log.dltitle;
        document.querySelector("textarea[name='dlcontent']").value = log.dlcontent;
        document.querySelector("input[name='dlweather']").value = log.dlweather;
        document.querySelector("input[name='dltemp']").value = log.dltemp;
        document.querySelector("input[name='dldate']").value = log.dldate;
        document.querySelector("select[name='dlwork']").value = log.dlwork || "";
        document.querySelector("input[name='dlpesticide']").value = log.dlpesticide || "";

        // 🖼️ 기존 이미지 처리 (선택사항)
        if (log.dlimage && log.dlimage.length > 0) {
            const imgPreviewContainer = document.querySelector("#existingImageContainer");
            imgPreviewContainer.innerHTML = "";

            log.dlimage.forEach(img => {
                const div = document.createElement("div");
                div.classList.add("img-preview");

                const image = document.createElement("img");
                image.src = `/uploads/farmlog/${img.dlipath}`;
                image.alt = "기존 이미지";
                image.dataset.imageId = img.dliid;

                const delBtn = document.createElement("button");
                delBtn.textContent = "삭제";
                delBtn.type = "button";
                delBtn.addEventListener("click", () => {
                    div.remove();

                    // 삭제할 이미지 ID 기록 (서버에 넘김)
                    const deletedInput = document.createElement("input");
                    deletedInput.type = "hidden";
                    deletedInput.name = "deletedImageIds";
                    deletedInput.value = img.dliid;
                    document.querySelector("#editForm").appendChild(deletedInput);
                });

                div.appendChild(image);
                div.appendChild(delBtn);
                imgPreviewContainer.appendChild(div);
            });
        }

    } catch (error) {
        console.error("수정 데이터 로딩 오류:", error);
        alert("수정 데이터를 불러오는 중 문제가 발생했습니다.");
    }

    // ✅ 새 이미지 업로드 처리
    const imageInput = document.getElementById("dlimages");
    const uploadPreview = document.getElementById("upload-preview");
    
    imageInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length > 0) {
            uploadPreview.innerHTML = "";
            
            files.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const div = document.createElement("div");
                    div.style.position = "relative";
                    
                    const img = document.createElement("img");
                    img.src = e.target.result;
                    img.classList.add("thumbnail");
                    img.style.width = "80px";
                    img.style.height = "80px";
                    img.style.objectFit = "cover";
                    img.style.borderRadius = "0.5rem";
                    
                    const delBtn = document.createElement("button");
                    delBtn.textContent = "×";
                    delBtn.style.cssText = `
                        position: absolute;
                        top: 4px;
                        right: 4px;
                        background: rgba(0, 0, 0, 0.6);
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 24px;
                        height: 24px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 14px;
                        line-height: 1;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    `;
                    
                    delBtn.addEventListener("click", () => {
                        div.remove();
                        // 파일 목록에서 제거
                        const dt = new DataTransfer();
                        const remainingFiles = Array.from(imageInput.files).filter((_, i) => i !== index);
                        remainingFiles.forEach(file => dt.items.add(file));
                        imageInput.files = dt.files;
                    });
                    
                    div.appendChild(img);
                    div.appendChild(delBtn);
                    uploadPreview.appendChild(div);
                };
                reader.readAsDataURL(file);
            });
        }
    });

    // ✅ 수정 폼 제출 이벤트 리스너 추가
    const editForm = document.getElementById("editForm");
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

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

        // 4. FormData 생성
        const formData = new FormData(editForm);
        
        // 5. 삭제된 이미지 ID들 수집
        const deletedImageIds = [];
        document.querySelectorAll('input[name="deletedImageIds"]').forEach(input => {
            deletedImageIds.push(input.value);
        });
        
        // 삭제된 이미지 ID들을 FormData에 추가
        deletedImageIds.forEach(id => {
            formData.append('deletedImageIds', id);
        });

        try {
            const response = await fetch(`/farmlog/update/${dlid}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert("수정이 완료되었습니다.");
                window.location.href = `/farmlog/view/${dlid}`;
            } else {
                const errorData = await response.text();
                alert("수정 실패: " + errorData);
            }
        } catch (error) {
            console.error("수정 요청 오류:", error);
            alert("수정 중 오류가 발생했습니다.");
        }
    });
});
