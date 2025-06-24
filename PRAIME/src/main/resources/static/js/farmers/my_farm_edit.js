// my_farm_edit.html 전용 JS 파일

document.addEventListener('DOMContentLoaded', function() {
	// 주소 찾기 버튼 클릭 이벤트 예시
	const addressBtn = document.querySelector('.address-find-btn');
	if (addressBtn) {
		addressBtn.addEventListener('click', function() {
			alert('주소찾기 기능은 준비 중입니다.');
			// 실제 주소 찾기 로직을 여기에 추가하세요.
		});
	}
	// 향후 추가 기능을 여기에 작성
	// --- 농작물 선택 관련 UI (현재 서버 미연동) ---
	const cropItems = document.querySelectorAll('.crop-item');
	const selectedCropsDisplay = document.getElementById('selectedCropsDisplay');

	document.querySelectorAll('.crop-checkbox:checked').forEach(checkbox => {
		checkbox.closest('.crop-item').classList.add('selected');
	});
	updateSelectedCropsDisplay();
	
	
	cropItems.forEach(item => {
		item.addEventListener('click', function() {
			const checkbox = this.querySelector('.crop-checkbox');
			checkbox.checked = !checkbox.checked;

			if (checkbox.checked) {
				this.classList.add('selected');
			} else {
				this.classList.remove('selected');
			}

			updateSelectedCropsDisplay();
		});
	});

	function updateSelectedCropsDisplay() {
		const selectedCheckboxes = document.querySelectorAll('.crop-checkbox:checked');
		selectedCropsDisplay.innerHTML = '';

		if (selectedCheckboxes.length > 0) {
			const selectedCrops = Array.from(selectedCheckboxes).map(checkbox => {
				const cropItem = checkbox.closest('.crop-item');
				return cropItem.querySelector('.crop-name').textContent;
			});

			const displayText = selectedCrops.map(crop => `#${crop}`).join(' ');
			selectedCropsDisplay.textContent = displayText;
		} else {
			selectedCropsDisplay.textContent = '선택된 농작물이 없습니다';
		}
	}
}); 