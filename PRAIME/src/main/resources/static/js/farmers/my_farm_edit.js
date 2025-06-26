document.addEventListener('DOMContentLoaded', function () {
    console.log('my_farm_edit.js script started.');

    // 1. Thymeleaf에서 전달된 step1Data 파싱 (예: window.step1DataFromThymeleaf) - Keep as is if needed for other parts
    const step1Data = typeof window.step1DataFromThymeleaf !== 'undefined' ? window.step1DataFromThymeleaf : {};
    console.log('Raw Step1 Data from Thymeleaf (from URL params):', step1Data);

    // 2. 배열 형태인 값은 첫 번째 값만 추출하여 hidden 필드로 처리 - Keep as is if needed for other parts
    const processedStep1Data = {};
    for (const key in step1Data) {
        if (step1Data.hasOwnProperty(key) && step1Data[key] !== null) {
            processedStep1Data[key] = Array.isArray(step1Data[key]) ? step1Data[key][0] : step1Data[key];
        }
    }
    console.log('Processed Step1 Data (single values for hidden fields):', processedStep1Data);

    const form = document.querySelector('.join-form');
    const joinBtn = document.getElementById('joinBtn');
    const farmAreaInput = document.getElementById('farm-area');

    if (!form) {
        console.error("Error: '.join-form' not found.");
        return;
    }
    if (!joinBtn) {
        console.error("Error: '#joinBtn' not found.");
        return;
    }
    if (!farmAreaInput) {
        console.error("Error: '#farm-area' input not found.");
        return;
    }

    // 3. Step1 데이터를 기반으로 hidden input 동적 생성 - Keep as is if needed for other parts
    for (const key in processedStep1Data) {
        if (processedStep1Data.hasOwnProperty(key) && processedStep1Data[key] !== null) {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = key;
            hiddenInput.value = processedStep1Data[key];
            form.appendChild(hiddenInput);
            console.log(`Dynamically added hidden field: ${key} = ${processedStep1Data[key]}`);
        }
    }

    // --- 오류 메시지 생성 및 제거 함수 ---
    function createErrorMessage(inputOrForm, message) {
        const formGroup = inputOrForm.closest ? inputOrForm.closest('.form-group') : null;
        const target = formGroup || inputOrForm;

        const existingError = target.querySelector('.error-message');
        if (existingError) existingError.remove();

        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.textContent = message;
        errorSpan.style.color = 'var(--error-color)';
        errorSpan.style.fontSize = '0.8rem';
        errorSpan.style.display = 'block';
        target.appendChild(errorSpan);
    }

    function clearErrorMessage(input) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;

        const errorSpan = formGroup.querySelector('.error-message');
        if (errorSpan) errorSpan.remove();
    }

    // --- 입력 필드 유효성 검사: blur 시 에러 제거만 수행 ---
    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('blur', function () {
            if (this.value.trim()) {
                clearErrorMessage(this);
            }
        });
    });

    // --- 농작물 선택 관련 UI---
    const cropItems = document.querySelectorAll('.crop-item');
    const selectedCropsDisplay = document.getElementById('selectedCropsDisplay');

    cropItems.forEach(item => {
        item.addEventListener('click', function () {
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
        selectedCropsDisplay.innerHTML = ''; // Clear previous display

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

    // *** IMPORTANT: Call this function on page load to initialize the display ***
    // Also, initialize the 'selected' class for previously checked items
    cropItems.forEach(item => {
        const checkbox = item.querySelector('.crop-checkbox');
        if (checkbox.checked) {
            item.classList.add('selected');
        }
    });
    updateSelectedCropsDisplay();


    // --- 회원가입 버튼 클릭 처리 ---
    joinBtn.addEventListener('click', function (e) {
        e.preventDefault();

        let isValid = true;
        document.querySelectorAll('.error-message').forEach(el => el.remove());

        // Validate farm-area input for numbers only
        const farmAreaValue = farmAreaInput.value.trim();
        if (farmAreaValue === '') {
            createErrorMessage(farmAreaInput, '재배 면적을 입력해주세요.');
            isValid = false;
        } else if (isNaN(farmAreaValue) || !/^\d+$/.test(farmAreaValue)) { // Check if it's not a number or contains non-digits
            createErrorMessage(farmAreaInput, '재배 면적은 숫자만 입력 가능합니다.');
            isValid = false;
        } else if (parseInt(farmAreaValue, 10) <= 0) {
            createErrorMessage(farmAreaInput, '재배 면적은 0보다 큰 값을 입력해주세요.');
            isValid = false;
        }

        // Validate that at least one crop is selected
        const selectedCrops = document.querySelectorAll('.crop-checkbox:checked');
        if (selectedCrops.length === 0) {
            createErrorMessage(selectedCropsDisplay.closest('.form-group'), '농작물을 최소 하나 이상 선택해주세요.');
            isValid = false;
        }


        console.log('Validation passed (only checking Step1 data assumed) and farm-area validation:', isValid);

        if (isValid) {
            // The form action is "/farmers/update_farm", not "/joinFarmer.do" as per your HTML
            // Make sure the server-side endpoint correctly handles the update
            form.submit(); // Submit the form to the action specified in HTML
        }
    });
});

// --- 회원가입 취소 버튼 동작 ---
function goToRoleChoice() {
    if (confirm('회원가입을 취소하시겠습니까?\n입력한 내용이 저장되지 않습니다.')) {
        window.location.href = '/myInfoFarmerPage';
    }
}