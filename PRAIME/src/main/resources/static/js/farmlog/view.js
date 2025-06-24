// farmlog/view.js

// deleteDiary function (from your existing code)
function deleteDiary(dlid) {
    if (!confirm("정말로 삭제하시겠습니까?")) return;

    fetch(`/farmlog/${encodeURIComponent(dlid)}`, {
        method: "DELETE",
        credentials: "include" // Include credentials for session management if necessary
    })
    .then(res => {
        if (!res.ok) throw new Error("삭제 실패");
        alert("삭제되었습니다.");
        location.href = "/farmlogBoardPage"; // ✅ 삭제 후 목록 페이지로 이동
    })
    .catch(err => {
        console.error(err);
        alert("삭제 중 오류 발생");
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const mainImage = document.getElementById("main-diary-image");
    const thumbnailImages = document.querySelectorAll(".thumbnail-image");

    // 초기 로드 시: 첫 번째 썸네일을 대표 이미지로 설정하고 선택 상태 표시
    if (thumbnailImages.length > 0) {
        // 모든 썸네일의 선택 클래스를 제거하고, 첫 번째 썸네일에만 추가
        // 이 부분은 페이지 초기 로드시 첫번째 썸네일이 선택되어 보여야 하므로 필요
        thumbnailImages.forEach(img => img.classList.remove('selected-thumbnail')); // 혹시 모를 잔여 클래스 제거
        thumbnailImages[0].classList.add('selected-thumbnail');

        // 대표 이미지의 src를 첫 번째 썸네일의 data-full-src로 설정
        mainImage.src = thumbnailImages[0].dataset.fullSrc;
    } else {
        // 이미지가 없을 경우 기본 'no-image.png' 설정 (Thymeleaf에서도 처리되지만 JS에서도 확실히)
        mainImage.src = '/img/no-image.png'; 
    }

    // 각 썸네일 클릭 이벤트 리스너 설정
    thumbnailImages.forEach(thumbnail => {
        thumbnail.addEventListener("click", function() {
            // 모든 썸네일에서 'selected-thumbnail' 클래스 제거
            thumbnailImages.forEach(img => img.classList.remove('selected-thumbnail'));

            // 클릭된 썸네일에 'selected-thumbnail' 클래스 추가
            this.classList.add('selected-thumbnail');

            // 클릭된 썸네일의 data-full-src 값으로 대표 이미지의 src 업데이트
            mainImage.src = this.dataset.fullSrc;
        });
    });
});