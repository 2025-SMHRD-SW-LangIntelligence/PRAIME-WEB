document.addEventListener('DOMContentLoaded', function () {
    console.log('join2.js script started. (Submitting Step1 data only)');

    // 1. Thymeleaf에서 전달된 step1Data 파싱 (예: window.step1DataFromThymeleaf)
    const step1Data = typeof window.step1DataFromThymeleaf !== 'undefined' ? window.step1DataFromThymeleaf : {};
    console.log('Raw Step1 Data from Thymeleaf (from URL params):', step1Data);

    // 2. 배열 형태인 값은 첫 번째 값만 추출하여 hidden 필드로 처리
    const processedStep1Data = {};
    for (const key in step1Data) {
        if (step1Data.hasOwnProperty(key) && step1Data[key] !== null) {
            processedStep1Data[key] = Array.isArray(step1Data[key]) ? step1Data[key][0] : step1Data[key];
        }
    }
    console.log('Processed Step1 Data (single values for hidden fields):', processedStep1Data);

    const form = document.querySelector('.join-form');
    const joinBtn = document.getElementById('joinBtn');
    const farmAreaInput = document.getElementById('farm-area'); // Add this line to get the farm-area input

    if (!form) {
        console.error("Error: '.join-form' not found.");
        return;
    }
    if (!joinBtn) {
        console.error("Error: '#joinBtn' not found.");
        return;
    }
    if (!farmAreaInput) { // Add check for farmAreaInput
        console.error("Error: '#farm-area' input not found.");
        return;
    }

    // 3. Step1 데이터를 기반으로 hidden input 동적 생성
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

    // --- 농작물 선택 관련 UI (현재 서버 미연동) ---
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

        // 농민 관련 유효성 검사는 생략 (Step1 데이터만 사용 가정)

        console.log('Validation passed (only checking Step1 data assumed) and farm-area validation:', isValid);

        if (isValid) {
            const formData = new FormData(form);

            console.log('Sending FormData (only Step1 data expected):');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            axios.post('/joinFarmer.do', formData)
                .then(function (response) {
                    if (response.data.success) {
                        alert('회원가입이 완료되었습니다');
                        window.location.href = '/loginPage';
                    } else {
                        throw new Error(response.data.message || '회원가입에 실패했습니다. (서버 응답: ' + JSON.stringify(response.data) + ')');
                    }
                })
                .catch(function (error) {
                    console.error('회원가입 실패:', error);
                    let errorMessage = '회원가입 처리 중 알 수 없는 오류가 발생했습니다.';
                    if (error.response) {
                        errorMessage = `회원가입 실패: ${error.response.status} ${error.response.statusText}. `;
                        if (error.response.data && error.response.data.message) {
                            errorMessage += error.response.data.message;
                        } else if (error.response.data) {
                            errorMessage += JSON.stringify(error.response.data);
                        }
                    } else if (error.request) {
                        errorMessage = '서버로부터 응답이 없습니다. 네트워크 연결을 확인해주세요.';
                    } else {
                        errorMessage = `요청 설정 오류: ${error.message}`;
                    }
                    createErrorMessage(form, errorMessage);
                });
        }
    });
});

// --- 회원가입 취소 버튼 동작 ---
function goToRoleChoice() {
    if (confirm('회원가입을 취소하시겠습니까?\n입력한 내용이 저장되지 않습니다.')) {
        window.location.href = '/roleChoicePage';
    }
}