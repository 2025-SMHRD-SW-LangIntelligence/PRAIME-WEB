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
        location.href = "/farmlog/board"; // ✅ 삭제 후 목록 페이지로 이동 (수정됨: farmlogBoardPage -> farmlog/board)
    })
    .catch(err => {
        console.error(err);
        alert("삭제 중 오류 발생");
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const mainImage = document.getElementById("main-diary-image");
    const thumbnailImages = document.querySelectorAll(".thumbnail-image");

    // Modal elements
    const imageModal = document.getElementById("imageModal");
    const modalImg = document.getElementById("img01");
    const closeButton = document.querySelector(".close-button");

    // Initial load: Set the first thumbnail as the main image and mark it as selected
    if (thumbnailImages.length > 0) {
        thumbnailImages.forEach(img => img.classList.remove('selected-thumbnail'));
        thumbnailImages[0].classList.add('selected-thumbnail');
        mainImage.src = thumbnailImages[0].dataset.fullSrc;
    } else {
        // If no images, set a default 'no-image.png'
        mainImage.src = '/img/no-image.png'; 
    }

    // Event listener for each thumbnail click
    thumbnailImages.forEach(thumbnail => {
        thumbnail.addEventListener("click", function() {
            thumbnailImages.forEach(img => img.classList.remove('selected-thumbnail'));
            this.classList.add('selected-thumbnail');
            mainImage.src = this.dataset.fullSrc;
        });
    });

    // ✅ Event listener for main image click to open the modal
    mainImage.addEventListener("click", function() {
        if (mainImage.src.includes('/img/no-image.png')) {
            // Do not open modal if it's the default no-image
            return;
        }
        imageModal.style.display = "block";
        modalImg.src = this.src; // Set the modal image source to the current main image source
    });

    // ✅ Event listener for the close button click
    closeButton.addEventListener("click", function() {
        imageModal.style.display = "none";
    });

    // ✅ Close the modal when clicking outside the image
    imageModal.addEventListener("click", function(event) {
        if (event.target === imageModal) {
            imageModal.style.display = "none";
        }
    });

    // ✅ Optional: Close modal with Escape key
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && imageModal.style.display === "block") {
            imageModal.style.display = "none";
        }
    });
});