document.addEventListener('DOMContentLoaded', function() {
    const joinBtn = document.getElementById('joinBtn');
    const form = document.querySelector('.join-form');

    // 에러 메시지 생성 함수
    function createErrorMessage(input, message) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;
        
        let existingError = formGroup.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.textContent = message;
        errorSpan.style.color = 'var(--error-color)';
        errorSpan.style.fontSize = '0.8rem';
        errorSpan.style.marginTop = '4px';
        errorSpan.style.display = 'block';
        formGroup.appendChild(errorSpan);
    }
    
    // 에러 메시지 제거 함수
    function clearErrorMessage(input) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;
        
        const errorSpan = formGroup.querySelector('.error-message');
        if (errorSpan) errorSpan.remove();
    }

    // 입력 필드 포커스 아웃 시 유효성 검사
    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim()) {
                clearErrorMessage(this);
            }
        });
    });

    // 농작물 다중 선택 기능
    const cropItems = document.querySelectorAll('.crop-item');
    const selectedCropsDisplay = document.getElementById('selectedCropsDisplay');

    cropItems.forEach(item => {
        item.addEventListener('click', function() {
            const checkbox = this.querySelector('.crop-checkbox');
            checkbox.checked = !checkbox.checked;
            
            if(checkbox.checked) {
                this.classList.add('selected');
            } else {
                this.classList.remove('selected');
            }
            
            updateSelectedCropsDisplay();
        });
    });

    // 선택된 농작물 표시 업데이트
    function updateSelectedCropsDisplay() {
        const selectedCheckboxes = document.querySelectorAll('.crop-checkbox:checked');
        selectedCropsDisplay.innerHTML = '';
        
        if(selectedCheckboxes.length > 0) {
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

    // 회원가입 버튼 클릭 이벤트
    joinBtn.addEventListener('click', function(e) {
        e.preventDefault();
        let isValid = true;

        // 모든 에러 메시지 제거
        document.querySelectorAll('.error-message').forEach(el => el.remove());

        // 필수 입력 필드 검사
        const requiredFields = [
            { name: 'farm-name', message: '농장명을 입력해주세요' },
            { name: 'farm-area', message: '농장면적을 입력해주세요' },
            { name: 'farm-address', message: '농장주소를 입력해주세요' },
            { name: 'address-detail', message: '상세주소를 입력해주세요' }
        ];

        requiredFields.forEach(field => {
            const input = form.querySelector(`[name="${field.name}"]`);
            if (!input || !input.value.trim()) {
                createErrorMessage(input || form, field.message);
                if (isValid && input) input.focus();
                isValid = false;
            }
        });

        // 면적 단위 선택 확인
        const areaUnit = form.querySelector('[name="area-unit"]');
        if (!areaUnit.value) {
            createErrorMessage(areaUnit, '면적 단위를 선택해주세요');
            if (isValid) areaUnit.focus();
            isValid = false;
        }

        // 농작물 선택 확인
        const selectedCheckboxes = document.querySelectorAll('.crop-checkbox:checked');
        if(selectedCheckboxes.length === 0) {
            createErrorMessage(document.querySelector('.crop-category-group'), '최소 1개 이상의 농작물을 선택해주세요');
            isValid = false;
        }

        if (isValid) {
            const formData = collectFormData();
            console.log('회원가입 데이터:', formData);
            // 실제 API 호출 코드 작성
            // axios.post('/api/farmers/join', formData)...
            alert('회원가입이 완료되었습니다');
            window.location.href = '/template/login.html';
        }
    });

    // 폼 데이터 수집 함수
    function collectFormData() {
        const selectedCrops = Array.from(document.querySelectorAll('.crop-checkbox:checked'))
                                .map(checkbox => checkbox.value);
        
        return {
            farmName: form.querySelector('[name="farm-name"]').value,
            farmArea: form.querySelector('[name="farm-area"]').value,
            areaUnit: form.querySelector('[name="area-unit"]').value,
            farmAddress: form.querySelector('[name="farm-address"]').value,
            addressDetail: form.querySelector('[name="address-detail"]').value,
            crops: selectedCrops
        };
    }
});

// 취소 버튼 이벤트 핸들러
function goToRoleChoice() {
    if(confirm('회원가입을 취소하시겠습니까?\n입력한 내용이 저장되지 않습니다.')) {
        window.location.href = '/template/role_choice.html';
    }
}