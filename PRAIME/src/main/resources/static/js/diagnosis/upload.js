// /js/diagnosis/upload.js

// ----------------------------------------------------
// [0] 질병 설명 데이터 (class_id에 매핑)
// ----------------------------------------------------
const diseaseDataById = {
    // class_id: { label: "레이블명", shortDescription: "탐지결과 바로 아래 표시될 간략 설명", description: "설명", solution: "해결 방법" }
    0: {
        label: "배 정상",
        shortDescription: "탐지된 병해충이 없습니다.",
        description: "탐지된 병해충이 없습니다.",
        solution: "건강한 작물입니다! 평소와 같이 잘 관리해주세요."
    },
    1: {
        label: "배검은별무늬병",
        shortDescription: "배 잎, 줄기, 과실에 검은색 별 모양 병반.",
        description: "배 잎, 줄기, 과실 등에 검은색 별 모양의 병반이 생기는 병으로, 잎과 과실에 피해를 주며 수확량 감소를 유발합니다. 주로 겨울철 자낭각에서 월동하며 봄에 자낭포자가 퍼져 감염됩니다.",
        solution: "① 낙엽 제거 및 소각하여 병원균 밀도 줄이기\n② 발아 전 석회유황합제 살포\n③ 생육기 중 보호 살균제(예: 만코제브, 클로로탈로닐) 주기적 살포\n④ 배수가 잘 되도록 토양 관리"
    },
    2: {
        label: "배과수화상병",
        shortDescription: "치명적인 세균성 전염병, 불에 탄 듯 괴사.",
        description: "세균성 전염병으로, 잎과 가지, 과실 등이 불에 탄 듯 괴사하며 식물 전체가 말라 죽을 수 있는 치명적인 병입니다. 빠른 확산과 피해가 특징입니다.",
        solution: "① 감염된 부위 즉시 제거 및 소각 (최소 30cm 아래까지)\n② 도구 소독 철저 (70% 알코올 또는 락스 희석액)\n③ 치료제는 없으며, 확산 방지가 최우선\n④ 의심될 경우 즉시 농업기술센터에 신고"
    },
    3: {
        label: "사과갈색무늬병",
        shortDescription: "사과 잎에 갈색 반점, 조기 낙엽 유발.",
        description: "사과 잎에 갈색의 반점이 생기고 심하면 조기 낙엽을 유발하는 병으로, 나무 세력을 약화시키고 수확량에 악영향을 줍니다. 주로 6~9월에 심하게 발생합니다.",
        solution: "① 병든 낙엽 제거 및 소각\n② 질소 비료 과다 사용 자제\n③ 통풍과 채광을 좋게 하여 습도 낮추기\n④ 살균제(예: 디페노코나졸, 테부코나졸) 주기적 살포"
    },
    4: {
        label: "사과과수화상병",
        shortDescription: "심각한 세균성 질병, 나무 전체 고사 가능.",
        description: "사과에 발생하는 과수화상병으로, 가지와 잎, 과실이 괴사하며 나무 전체가 말라 죽을 수 있는 심각한 세균성 질병입니다. 빠른 방제가 필요합니다.",
        solution: "① 감염된 부위 즉시 제거 및 소각 (최소 30cm 아래까지)\n② 도구 소독 철저 (70% 알코올 또는 락스 희석액)\n③ 치료제는 없으며, 확산 방지가 최우선\n④ 의심될 경우 즉시 농업기술센터에 신고"
    },
    5: {
        label: "사과부란병",
        shortDescription: "과실 표면에 부란(썩음) 현상 발생.",
        description: "사과 과실에 발생하는 병으로, 과실 표면에 부란(썩음) 현상이 나타나 상품 가치를 떨어뜨립니다. 주로 저장 중에 발생할 수 있습니다.",
        solution: "① 저장 전 과실 손상 최소화\n② 저온 다습한 환경 피하기\n③ 수확 후 살균제 처리 고려\n④ 병든 과실은 즉시 제거"
    },
    6: {
        label: "사과점무늬낙엽병",
        shortDescription: "사과 잎에 점무늬, 낙엽 유발.",
        description: "사과 잎에 점무늬가 생기고 낙엽을 유발하는 병으로, 나무의 생육에 부정적인 영향을 미치며 수확량 감소를 초래합니다.",
        solution: "① 병든 잎과 가지 제거\n② 과원 내 통풍 및 채광 개선\n③ 질소 비료 과용 피하기\n④ 살균제(예: 만코제브, 캡탄) 주기적 살포"
    },
    7: {
        label: "사과탄저병",
        shortDescription: "과실과 가지에 검은색 병반 발생.",
        description: "사과에 발생하는 탄저병으로, 과실과 가지에 검은색 병반이 생기며 심하면 과실이 썩고 나무가 약해집니다. 방제가 중요합니다.",
        solution: "① 병든 과실 및 가지 제거\n② 비가림 시설로 강우에 의한 전파 줄이기\n③ 봉지 씌우기 실시\n④ 살균제(예: 프로피네브, 플루퀸코나졸) 주기적 살포"
    },
    8: {
        label: "사과 정상",
        shortDescription: "탐지된 병해충이 없습니다.",
        description: "탐지된 병해충이 없습니다.",
        solution: "건강한 작물입니다! 평소와 같이 잘 관리해주세요."
    },
};

// ----------------------------------------------------
// [1] 상단 탭 (진단하기, 진단 이력) 활성화 및 페이지 이동 관리
// ----------------------------------------------------
$(function(){
    const $btnDiag = $('#start-diagnosis'); // '진단하기' 버튼
    const $btnHist = $('#view-history');    // '진단 이력' 버튼

    /**
     * @function setActive
     * @description '진단하기' 또는 '진단 이력' 버튼의 활성/비활성 시각적 상태를 설정합니다.
     * @param {boolean} isDiag - '진단하기' 탭을 활성화할 경우 true, '진단 이력' 탭을 활성화할 경우 false.
     */
    function setActive(isDiag){
        if(isDiag){
            $btnDiag.addClass('btn-primary').removeClass('btn-outline');
            $btnHist.addClass('btn-outline').removeClass('btn-primary');
        } else {
            $btnHist.addClass('btn-primary').removeClass('btn-outline');
            $btnDiag.addClass('btn-outline').removeClass('btn-primary');
        }
    }

    // 페이지 로드 시 현재 URL 경로에 따라 초기 탭 상태 설정
    const currentPath = window.location.pathname;
    if (currentPath === '/diagnosisUploadPage' || currentPath === '/') {
        setActive(true); // 기본 경로 또는 업로드 페이지인 경우 '진단하기' 탭 활성화
    } else if (currentPath === '/diagnosisBoardPage') {
        setActive(false); // 이력 페이지인 경우 '진단 이력' 탭 활성화
    } else {
        setActive(true); // 그 외의 경우 기본값으로 '진단하기' 탭 활성화
    }

    // '진단하기' 버튼 클릭 시 이벤트 핸들러
    $btnDiag.on('click', function(e){
        setActive(true); // 버튼 시각적 상태 변경
        window.location.href = '/diagnosisUploadPage'; // '진단하기' 페이지로 이동
    });

    // '진단 이력' 버튼 클릭 시 이벤트 핸들러
    $btnHist.on('click', function(e){
        setActive(false); // 버튼 시각적 상태 변경
        window.location.href = '/diagnosisBoardPage'; // '진단 이력' 페이지로 이동
    });
});


// ----------------------------------------------------
// [2] 작물 사진 업로드 및 AI 진단 기능 관리
// ----------------------------------------------------
$(function(){
    // DOM 요소 캐싱
    const $uploadBox = $('.upload-box');
    const $uploadInput = $('<input type="file" id="actual-file-input" accept="image/*" style="display:none;">');
    const $uploadIcon = $uploadBox.find('.upload-icon');
    const $uploadTextH2 = $uploadBox.find('h2');
    const $uploadTextP = $uploadBox.find('p');
    const $uploadButtons = $uploadBox.find('.upload-buttons');
    const $diagnosisResultSection = $('#diagnosisResult');
    const $resultLabel = $('#result-label');
    const $resultConfidence = $('#result-confidence');
    const $resultShortDescription = $('#result-short-description'); // New: Short description element
    const $resultDescriptionContainer = $('#result-description-container');
    const $resultDescription = $('#result-description');
    const $solutionContainer = $('#solution-container'); // New: 해결 방법 컨테이너
    const $solutionText = $('#solution-text'); // New: 해결 방법 텍스트
    const $googleSearchLinkContainer = $('#google-search-link-container'); // Google search link container
    const $googleSearchLink = $('#google-search-link'); // Google search link
    const $resetBtn = $('.reset-btn');
    const $diagnosisResultSaveBtn = $('#diagnosisResultSaveBtn');

    let lastDiagnosisResult = {
        label: '',
        confidence: 0,
        description: '',
        shortDescription: '', // New: Store short description
        solution: '', // New: Store solution
        image: '',
        classId: null // New: Store class_id for link generation
    };

    $('body').append($uploadInput);
    // 초기 로드 시 '결과저장' 버튼 비활성화
    $diagnosisResultSaveBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');

    // UI를 초기 상태로 리셋하는 함수
    function resetUI() {
        $uploadBox.css({
            'background-image': 'none',
            'background-size': '',
            'background-position': '',
            'background-repeat': ''
        }).removeClass('uploaded'); // 업로드된 상태 클래스 제거

        $uploadIcon.show(); // 업로드 아이콘 보이기
        $uploadTextH2.show().text('작물 사진 업로드'); // 제목 초기화
        $uploadTextP.show().text('병해충이 의심되는 부분을 촬영하거나 이미지를 업로드하세요'); // 설명 초기화
        $uploadButtons.show(); // 버튼 보이기 (reset 시)

        $uploadInput.val(''); // 파일 입력 필드 초기화

        $diagnosisResultSection.addClass('hidden'); // 진단 결과 섹션 숨기기
        $resultLabel.text('--'); // 레이블 초기화
        $resultConfidence.text('--%'); // 신뢰도 초기화
        $resultShortDescription.text(''); // Short description 초기화
        $resultDescriptionContainer.addClass('hidden'); // 설명 컨테이너 숨기기
        $resultDescription.text('--'); // 설명 내용 초기화
        
        $solutionContainer.css('display', 'none'); // 해결 방법 컨테이너 숨김
        $solutionText.text('--'); // 해결 방법 텍스트 초기화

        $googleSearchLinkContainer.css('display', 'none'); // 초기화 시 링크 컨테이너 숨김을 명확하게
        $googleSearchLink.attr('href', '#'); // Reset link

        // lastDiagnosisResult 객체 초기화
        lastDiagnosisResult = {
            label: '',
            confidence: 0,
            description: '',
            shortDescription: '',
            solution: '', // Reset solution
            image: '',
            classId: null
        };

        // '결과저장' 버튼 비활성화
        $diagnosisResultSaveBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');
    }

    // 이미지 미리보기 및 UI 변경 함수
    function previewImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            $uploadBox.css('background-image', `url(${e.target.result})`)
                    .css('background-size', 'cover')
                    .css('background-position', 'center')
                    .css('background-repeat', 'no-repeat')
                    .addClass('uploaded'); // 업로드 상태 클래스 추가

            $uploadIcon.hide(); // 아이콘 숨기기
            $uploadTextH2.hide(); // 제목 숨기기
            $uploadTextP.hide(); // 설명 숨기기
            $uploadButtons.hide(); // 버튼 숨기기

            // 진단 결과 섹션 및 버튼 초기화 (새 진단을 위해)
            $diagnosisResultSection.addClass('hidden');
            $resultLabel.text('--');
            $resultConfidence.text('--%');
            $resultShortDescription.text(''); // Clear short description
            $resultDescriptionContainer.addClass('hidden');
            $resultDescription.text('--');
            
            $solutionContainer.css('display', 'none'); // 해결 방법 컨테이너 숨김
            $solutionText.text('--'); // 해결 방법 텍스트 초기화

            $googleSearchLinkContainer.css('display', 'none'); // 새로운 미리보기 시 링크 컨테이너 숨김을 명확하게
            $googleSearchLink.attr('href', '#'); // Reset link
            $diagnosisResultSaveBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');
        };
        reader.readAsDataURL(file);
    }

    // 이미지 업로드 및 AI 진단 요청 함수
    function uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('conf_threshold', 0.5); // 신뢰도 임계값 설정

        // 진단 중 UI 상태 변경
        $uploadBox.css('border-color', 'var(--primary-color)').css('opacity', '0.8');
        $uploadTextH2.text('진단 중...').show();
        $uploadTextP.text('AI가 작물을 분석하고 있습니다. 잠시만 기다려 주세요.').show();

        // Flask 서버로 진단 요청
        axios.post('http://localhost:5000/predict', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30초 타임아웃
        })
        .then(response => {
            console.log('Flask 진단 성공 응답 (전체):', response.data); // 전체 응답 로그
            const data = response.data;

            let resultLabel = '탐지 실패'; // 초기 레이블
            let resultConfidence = 0; // 초기 신뢰도
            let resultDescription = '진단 중 오류가 발생했습니다.'; // 초기 설명
            let resultShortDescription = ''; // Initial short description
            let resultSolution = ''; // Initial solution
            let detectedClassId = null; // Store detected class_id
            let base64Image = null; // 초기 이미지 데이터

            // Flask 응답에서 output_image가 있다면 미리 가져옴
            if (data.output_image && data.output_image.base64_encoded_image) {
                base64Image = data.output_image.base64_encoded_image;
            }

            // prediction_details 유효성 검사 및 detections 배열 확인
            if (data.success && data.prediction_details && Array.isArray(data.prediction_details.detections)) {
                const detections = data.prediction_details.detections;

                if (detections.length === 0) {
                    // Case 1: detections 배열이 비어있는 경우 (객체 탐지 실패)
                    resultLabel = '객체탐지 실패';
                    resultConfidence = 0;
                    resultShortDescription = '모델이 객체탐지에 실패했습니다.';
                    resultDescription = '흐릿하거나 확대된 이미지의 경우 정확한 진단이 되지 않을 수 있습니다.';
                    resultSolution = '정확한 진단을 위해 선명하고 적절한 크기의 이미지를 업로드해주세요.';
                } else {
                    // detections 배열에 내용이 있는 경우
                    const firstDetection = detections[0];
                    const classId = firstDetection.class_id; // Flask에서 넘어온 class_id
                    detectedClassId = classId; // Store class_id
                    resultConfidence = parseFloat((firstDetection.confidence * 100).toFixed(2));

                    // class_id에 해당하는 질병 정보 가져오기
                    const diseaseInfo = diseaseDataById[classId];

                    if (diseaseInfo) {
                        resultLabel = diseaseInfo.label;
                        resultDescription = diseaseInfo.description;
                        resultShortDescription = diseaseInfo.shortDescription;
                        resultSolution = diseaseInfo.solution; // Get solution
                    } else {
                        // 정의되지 않은 class_id인 경우
                        resultLabel = '알 수 없는 질병';
                        resultDescription = '알 수 없는 질병이 탐지되었습니다. 데이터베이스를 확인해주세요.';
                        resultShortDescription = '알 수 없는 질병이 탐지되었습니다.';
                        resultSolution = '해당 질병에 대한 정보가 없습니다. 관리자에게 문의해주세요.';
                    }
                }
            } else {
                // success가 false이거나 prediction_details가 없거나 detections가 배열이 아닌 경우 (예상치 못한 응답)
                resultLabel = '탐지 실패';
                resultConfidence = 0;
                resultShortDescription = '진단 처리 중 알 수 없는 오류가 발생했습니다.';
                resultDescription = data.error || '진단 처리 중 알 수 없는 오류가 발생했습니다.';
                resultSolution = '진단 중 오류가 발생했습니다. 다시 시도해주세요.';
            }

            // 진단 결과 UI 업데이트
            $resultLabel.text(resultLabel); // 레이블 표시
            $resultConfidence.text(`${resultConfidence}%`); // 신뢰도 표시
            $resultShortDescription.text(resultShortDescription); // Display short description
            $diagnosisResultSection.removeClass('hidden'); // 결과 섹션 보이게

            // 질병 설명 UI 업데이트
            if (resultDescription && resultDescription !== '--') {
                $resultDescription.text(resultDescription);
                $resultDescriptionContainer.removeClass('hidden'); // 설명 컨테이너 보이게
            } else {
                $resultDescription.text('--'); // 그 외의 경우 '--' 표시
                $resultDescriptionContainer.addClass('hidden'); // 설명 컨테이너 숨기기
            }

            // 해결 방법 UI 업데이트 및 가시성 제어
            $solutionContainer.css('display', 'none'); // 기본적으로 숨김
            if (resultSolution && resultSolution !== '--' && !resultLabel.includes('객체탐지 실패')) {
                $solutionText.html(resultSolution.replace(/\n/g, '<br>')); // 줄바꿈 적용
                $solutionContainer.css('display', 'block'); // 조건 만족 시 보이게
            }
            
            // Google Search Link update: '정상' 라벨이거나 질병이 아니면 무조건 숨김
            $googleSearchLinkContainer.css('display', 'none'); // 기본적으로 숨김 처리
            if (detectedClassId !== null && detectedClassId >= 1 && detectedClassId <= 7 && !resultLabel.includes('정상')) {
                const diseaseName = diseaseDataById[detectedClassId].label;
                const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(diseaseName)} 질병 정보`;
                $googleSearchLink.attr('href', googleSearchUrl);
                $googleSearchLinkContainer.css('display', 'block'); // 조건 만족 시에만 다시 보이게
            }


            // 업로드 박스 텍스트 업데이트
            $uploadTextH2.text('진단 완료').show();
            $uploadTextP.text('결과 저장 버튼을 클릭하여 진단 내용을 저장하세요.').show();

            // 진단된 이미지로 배경 변경
            if (base64Image) {
                $uploadBox.css('background-image', `url(data:image/jpeg;base64,${base64Image})`);
                $uploadBox.addClass('uploaded');
                $uploadIcon.hide();
                $uploadTextH2.show();
                $uploadTextP.show();
                $uploadButtons.hide();
            }

            // 마지막 진단 결과 저장 (저장 버튼 클릭 시 사용)
            lastDiagnosisResult = {
                label: resultLabel,
                confidence: resultConfidence,
                description: resultDescription,
                shortDescription: resultShortDescription,
                solution: resultSolution, // Store solution
                image: base64Image,
                classId: detectedClassId
            };

            // '결과 저장' 버튼 활성화/비활성화
            if (resultLabel !== '객체탐지 실패' && resultLabel !== '알 수 없는 질병' && (resultConfidence > 0 || resultLabel.includes('정상'))) {
                $diagnosisResultSaveBtn.prop('disabled', false).css('opacity', '1').css('cursor', 'pointer');
            } else {
                $diagnosisResultSaveBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');
            }

        })
        .catch(error => {
            console.error('진단 실패:', error);
            let errorMessage = '진단 중 오류가 발생했습니다.';
            if (error.response) {
                errorMessage = `서버 오류: ${error.response.data.error || error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'Flask 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
            } else {
                errorMessage = `요청 오류: ${error.message}`;
            }
            alert(errorMessage);

            // 오류 발생 시 UI 초기화
            $resultLabel.text('오류 발생');
            $resultConfidence.text('---');
            $resultShortDescription.text('진단 중 오류가 발생했습니다.');
            $diagnosisResultSection.removeClass('hidden');
            $resultDescriptionContainer.addClass('hidden');
            $resultDescription.text('--');
            $solutionContainer.css('display', 'none'); // 오류 시 해결 방법 숨김
            $googleSearchLinkContainer.css('display', 'none'); // 오류 시에도 숨김

            $uploadTextH2.text('오류 발생').show();
            $uploadTextP.text('진단 중 오류가 발생했습니다.').show();

            $diagnosisResultSaveBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');
        })
        .finally(() => {
            // 진단 요청 완료 후 UI 상태 복원 (테두리 색상, 투명도)
            $uploadBox.css('border-color', 'var(--border-color)').css('opacity', '1');
        });
    }

    /**
    * @function saveDiagnosisResult
    * @description 진단 결과를 Spring Boot 백엔드에 저장 요청합니다.
    */
    function saveDiagnosisResult() {
        // 저장할 데이터 유효성 검사
        if (lastDiagnosisResult.label === '' || (lastDiagnosisResult.label !== '정상' && lastDiagnosisResult.confidence === 0)) {
            alert('저장할 진단 결과가 없습니다. 먼저 이미지를 업로드하고 진단을 완료해주세요.');
            return;
        }
        // "객체탐지 실패", "알 수 없는 질병" 결과는 저장하지 않음
        if (lastDiagnosisResult.label === '객체탐지 실패' || lastDiagnosisResult.label === '알 수 없는 질병') {
            alert('객체 탐지 실패 또는 알 수 없는 질병 결과는 저장할 수 없습니다.');
            return;
        }

        // 결과 이미지의 'data:image/jpeg;base64,' 접두사를 제거 (필요한 경우)
        const rawBase64Image = lastDiagnosisResult.image ? (lastDiagnosisResult.image.split(',')[1] || lastDiagnosisResult.image) : null;

        // 저장할 데이터 객체
        const saveData = {
            label: lastDiagnosisResult.label,
            confidence: lastDiagnosisResult.confidence,
            description: lastDiagnosisResult.description,
            solution: lastDiagnosisResult.solution, // Save solution
            resultImageBase64: rawBase64Image
        };

        console.log("저장할 데이터:", saveData);
        alert("저장할 데이터:", saveData);

        // Spring Boot 백엔드 API로 POST 요청
        axios.post('http://localhost:8087/api/diagnosis/save', saveData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log('결과 저장 성공:', response.data);
            alert('진단 결과가 성공적으로 저장되었습니다!');
            window.location.href = '/diagnosisBoardPage'; // 저장 성공 후 진단 이력 페이지로 이동
        })
        .catch(error => {
            console.error('결과 저장 실패:', error);
            if (error.response) {
                console.error('응답 데이터:', error.response.data);
                console.error('응답 상태:', error.response.status);
                alert(`결과 저장 실패: ${error.response.data.message || error.response.statusText}`);
            } else if (error.request) {
                console.error('요청 데이터 없음:', error.request);
                alert('결과 저장 실패: 서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.');
            } else {
                console.error('에러 메시지:', error.message);
                alert('결과 저장 중 알 수 없는 오류가 발생했습니다.');
            }
        });
    }

    // ----------------------------------------------------
    // [2-1] 이벤트 리스너: 파일 업로드 및 리셋, 결과 저장 버튼 동작
    // ----------------------------------------------------

    // 'upload-box' 클릭 시 숨겨진 파일 입력 필드 열기
    $uploadBox.on('click', function() {
        $uploadInput.click();
    });

    // 파일 입력 필드에 파일이 선택되었을 때 이벤트 처리
    $uploadInput.on('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            previewImage(file);
            uploadImage(file);
        } else {
            resetUI(); // 파일 선택 취소 시 UI 리셋
        }
    });

    // Drag and drop functionality
    $uploadBox.on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('drag-over');
    });

    $uploadBox.on('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('drag-over');
    });

    $uploadBox.on('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('drag-over');

        const files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                // Set the file to the hidden input for consistency
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                $uploadInput[0].files = dataTransfer.files;

                previewImage(file);
                uploadImage(file);
            } else {
                alert('이미지 파일만 업로드할 수 있습니다.');
            }
        }
    });

    // '리셋' 버튼 클릭 시 UI 초기화
    $resetBtn.on('click', function() {
        resetUI();
    });

    // '결과 저장' 버튼 클릭 시 진단 결과 저장 함수 호출
    $diagnosisResultSaveBtn.on('click', function() {
        saveDiagnosisResult();
    });
});