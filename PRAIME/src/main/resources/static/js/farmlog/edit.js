document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dlid = urlParams.get("id");

    if (!dlid) {
        alert("잘못된 접근입니다.");
        return;
    }

    try {
        const response = await fetch(`/farmlog/editData/${dlid}`);
        if (!response.ok) {
            throw new Error("일지를 불러오는 데 실패했습니다.");
        }

        const data = await response.json();
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

            label.appendChild(input);
            label.append(" " + crop);
            cropContainer.appendChild(label);
        });

        // 🌦️ 폼 필드 채우기
        document.querySelector("input[name='dltitle']").value = log.dltitle;
        document.querySelector("textarea[name='dlcontent']").value = log.dlcontent;
        document.querySelector("input[name='dlweather']").value = log.dlweather;
        document.querySelector("input[name='dltemp']").value = log.dltemp;
        document.querySelector("input[name='dldate']").value = log.dldate;

        // 🖼️ 기존 이미지 처리 (선택사항)
        if (log.dlimage && log.dlimage.length > 0) {
            const imgPreviewContainer = document.querySelector("#existingImageContainer");
            imgPreviewContainer.innerHTML = "";

            log.dlimage.forEach(img => {
                const div = document.createElement("div");
                div.classList.add("img-preview");

                const image = document.createElement("img");
                image.src = `/image/${img.savedName}`;
                image.alt = "기존 이미지";
                image.dataset.imageId = img.diid;

                const delBtn = document.createElement("button");
                delBtn.textContent = "삭제";
                delBtn.type = "button";
                delBtn.addEventListener("click", () => {
                    div.remove();

                    // 삭제할 이미지 ID 기록 (서버에 넘김)
                    const deletedInput = document.createElement("input");
                    deletedInput.type = "hidden";
                    deletedInput.name = "deletedImageIds";
                    deletedInput.value = img.diid;
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
});
