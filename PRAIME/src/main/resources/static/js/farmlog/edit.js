// edit.js - 페이지 전용 JavaScript (모듈로 선언되어야 함)
import { renderImages, fetchCropOptionsFromList } from './farmlog.js'; // <-- 이 줄 추가

document.addEventListener('DOMContentLoaded', () => {
	console.log('Edit page loaded.');
	const container = document.getElementById('crop-container');
	const imageInput = document.getElementById("dlimages");
	const preview = document.getElementById("upload-preview");
	
	if (!container) return;
	
	const cropListRaw = container.dataset.crops;
	const selectedCrop = container.dataset.selected;

	    try {
	        const cropList = JSON.parse(cropListRaw.replace(/&quot;/g, '"'));
	        fetchCropOptionsFromList(cropList, selectedCrop, 'crop-container');
	    } catch (e) {
	        console.error("작물 데이터 파싱 실패:", e);
	    }
	
	// 이미지 input이나 미리보기 컨테이너가 존재하는 경우에만 이미지 렌더링
	if (imageInput && preview) {
		let selectedFiles = Array.from(imageInput.files ?? []);

		renderImages(preview, selectedFiles, imageInput, true); // 수정 페이지에선 기존 이미지도 렌더링

		// 새 이미지 추가 시 미리보기
		imageInput.addEventListener("change", (e) => {
			selectedFiles = Array.from(e.target.files);
			renderImages(preview, selectedFiles, imageInput, true);
		});
	}

	// 취소 버튼 존재 여부 확인 후 이벤트 연결
	const cancelBtn = document.querySelector(".cancel-btn");
	if (cancelBtn) {
		cancelBtn.addEventListener("click", (e) => {
			e.preventDefault();
			if (confirm("수정을 취소하시겠습니까?")) {
				history.back();
			}
		});
	}
	
	// 삭제된 이미지 ID 저장
	document.addEventListener('click', (e) => {
		if (e.target.classList.contains('delete-thumbnail')) {
			// ⛔ 사용자 확인
			if (!confirm("정말 이 이미지를 삭제하시겠습니까?")) return;
			const wrapper = e.target.closest('.image-wrapper');
			const image = wrapper.querySelector('img');
			const imageId = image?.dataset.imageId;

			if (imageId) {
				// 삭제된 이미지 ID를 hidden input에 추가
				const hiddenInput = document.getElementById('deletedImageIds');
				let currentIds = hiddenInput.value ? hiddenInput.value.split(',') : [];
				currentIds.push(imageId);
				hiddenInput.value = currentIds.join(',');

				// 미리보기에서 제거
				wrapper.remove();
			}
		}
	});

	
	const form = document.querySelector("form");
	if (form) {
		form.addEventListener("submit", (e) => {
			console.log("🚀 Form 제출됨");

			// FormData 객체를 사용해 전체 값 출력
			const formData = new FormData(form);
			for (let [key, value] of formData.entries()) {
				console.log(`${key}:`, value);
			}

			// 이미지 파일 확인
			const imageInput = document.getElementById("newImages");
			if (imageInput?.files) {
				Array.from(imageInput.files).forEach((file, idx) => {
					console.log(`🖼️ 새 이미지 [${idx}]:`, file.name);
				});
			}

			// 삭제된 이미지 ID 확인
			const deleted = document.getElementById("deletedImageIds");
			console.log("🗑️ 삭제할 이미지 ID 목록:", deleted?.value);
		});
	}
});
