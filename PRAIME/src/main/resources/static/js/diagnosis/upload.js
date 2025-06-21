// /js/diagnosis/upload.js

// ----------------------------------------------------
// [1] 상단 탭 (진단하기, 진단 이력) 활성화 및 페이지 이동 관리
// ----------------------------------------------------
$(function(){
  const $btnDiag = $('#start-diagnosis'); // '진단하기' 버튼
  const $btnHist = $('#view-history');   // '진단 이력' 버튼

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
  const $resetBtn = $('.reset-btn');
  const $diagnosisResultSaveBtn = $('#diagnosisResultSaveBtn');

  // 진단 결과를 저장할 변수
  let lastDiagnosisResult = {
      label: '',
      confidence: 0,
      image: ''
  };

  // 숨겨진 파일 입력 요소를 body에 추가
  $('body').append($uploadInput);

  // 초기 UI 상태 설정: '결과 저장' 버튼 비활성화
  $diagnosisResultSaveBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');

  /**
   * @function resetUI
   * @description 업로드 박스와 진단 결과 UI를 초기 상태로 되돌립니다.
   */
  function resetUI() {
    $uploadBox.css({
      'background-image': 'none',
      'background-size': '',
      'background-position': '',
      'background-repeat': ''
    }).removeClass('uploaded');

    $uploadIcon.show();
    $uploadTextH2.show().text('작물 사진 업로드');
    $uploadTextP.show().text('병해충이 의심되는 부분을 촬영하거나 이미지를 업로드하세요');

    $uploadInput.val('');

    $diagnosisResultSection.addClass('hidden');
    $resultLabel.text('--');
    $resultConfidence.text('--%');

    lastDiagnosisResult = {
        label: '',
        confidence: 0,
        image: ''
    };

    $diagnosisResultSaveBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');
  }

  /**
   * @function uploadImage
   * @description 선택된 이미지를 Flask API로 전송하고 진단 결과를 처리합니다.
   * @param {File} file - 업로드할 이미지 파일 객체.
   */
  function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file); // 'files'에서 'file'로 변경
    formData.append('conf_threshold', 0.5);

    // 업로드 중 시각적 피드백
    $uploadBox.css('border-color', 'var(--primary-color)').css('opacity', '0.8');
    $uploadTextH2.text('진단 중...').show();
    $uploadTextP.text('AI가 작물을 분석하고 있습니다. 잠시만 기다려 주세요.').show();

    // Axios를 이용한 비동기 파일 업로드 및 진단 요청
    axios.post('http://localhost:5000/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30초 타임아웃 추가
    })
    .then(response => {
      console.log('진단 성공:', response.data);
      const data = response.data;

      if (data.success && data.prediction_details.total_detections > 0) {
        // 탐지된 결과가 있을 경우 UI 업데이트
        const firstDetection = data.prediction_details.detections[0];
        const label = firstDetection.class_name;
        const confidence = (firstDetection.confidence * 100).toFixed(2);
        const base64Image = data.output_image.base64_encoded_image;

        $resultLabel.text(label);
        $resultConfidence.text(`${confidence}%`);
        $diagnosisResultSection.removeClass('hidden');

        $uploadTextH2.text('진단 완료').show();
        $uploadTextP.text('결과 저장 버튼을 클릭하여 진단 내용을 저장하세요.').show();

        // 탐지 결과가 반영된 이미지 미리보기 업데이트
        if (base64Image) {
          $uploadBox.css('background-image', `url(data:image/jpeg;base64,${base64Image})`);
        }

        // 진단 결과를 저장할 변수에 업데이트
        lastDiagnosisResult = {
            label: label,
            confidence: parseFloat(confidence),
            image: base64Image
        };

        // '결과 저장' 버튼 활성화
        $diagnosisResultSaveBtn.prop('disabled', false).css('opacity', '1').css('cursor', 'pointer');

      } else {
        // 탐지된 병해충이 없거나 탐지에 실패한 경우
        $resultLabel.text('병해충 없음 또는 탐지 실패');
        $resultConfidence.text('---');
        $diagnosisResultSection.removeClass('hidden');

        $uploadTextH2.text('진단 완료').show();
        $uploadTextP.text('탐지된 병해충이 없거나, 이미지를 다시 시도해주세요.').show();

        // 탐지 실패 시에는 '결과 저장' 버튼 비활성화 유지
        $diagnosisResultSaveBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');
      }
    })
    .catch(error => {
      console.error('진단 실패:', error);
      
      let errorMessage = '진단 중 오류가 발생했습니다.';
      
      if (error.response) {
        // 서버 응답이 있는 경우
        console.error('응답 데이터:', error.response.data);
        console.error('응답 상태:', error.response.status);
        errorMessage = `서버 오류: ${error.response.data.error || error.response.statusText}`;
      } else if (error.request) {
        // 요청은 보내졌지만 응답을 받지 못한 경우
        console.error('요청 데이터:', error.request);
        errorMessage = 'Flask 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
      } else {
        // 요청 설정 중 문제 발생
        console.error('에러 메시지:', error.message);
        errorMessage = `요청 오류: ${error.message}`;
      }
      
      alert(errorMessage);

      $resultLabel.text('오류 발생');
      $resultConfidence.text('---');
      $diagnosisResultSection.removeClass('hidden');

      $uploadTextH2.text('오류 발생').show();
      $uploadTextP.text('진단 중 오류가 발생했습니다.').show();

      $diagnosisResultSaveBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');
    })
    .finally(() => {
      $uploadBox.css('border-color', 'var(--border-color)').css('opacity', '1');
    });
  }

  /**
  * @function saveDiagnosisResult
  * @description 진단 결과를 Spring Boot 백엔드에 저장 요청합니다.
  */
  function saveDiagnosisResult() {
    if (lastDiagnosisResult.label === '' || lastDiagnosisResult.confidence === 0) {
        alert('저장할 진단 결과가 없습니다. 먼저 이미지를 업로드하고 진단을 완료해주세요.');
        return;
    }

    // 결과 이미지의 'data:image/jpeg;base64,' 접두사를 제거 (필요한 경우)
    const rawBase64Image = lastDiagnosisResult.image.split(',')[1] || lastDiagnosisResult.image;

    const saveData = {
        label: lastDiagnosisResult.label,
        confidence: lastDiagnosisResult.confidence,
        resultImageBase64: rawBase64Image
    };

    console.log("저장할 데이터:", saveData);

    // Spring Boot 백엔드 API로 POST 요청
    axios.post('http://localhost:8087/api/diagnosis/save', saveData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('결과 저장 성공:', response.data);
      alert('진단 결과가 성공적으로 저장되었습니다!');
      // --- 변경된 부분 시작 ---
      window.location.href = '/diagnosisBoardPage'; // 저장 성공 후 페이지 이동
      // --- 변경된 부분 끝 ---
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
      const reader = new FileReader();
      reader.onload = function(e) {
        // 이미지 미리보기 및 UI 변경
        $uploadBox.css('background-image', `url(${e.target.result})`)
                  .css('background-size', 'cover')
                  .css('background-position', 'center')
                  .css('background-repeat', 'no-repeat')
                  .addClass('uploaded');

        $uploadIcon.hide();
        $uploadTextH2.hide();
        $uploadTextP.hide();
        $uploadButtons.hide();

        $diagnosisResultSection.addClass('hidden');
        $resultLabel.text('--');
        $resultConfidence.text('--%');
        $diagnosisResultSaveBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');
      };
      reader.readAsDataURL(file);

      // 파일 선택 후 바로 이미지 업로드 및 진단 API 호출
      uploadImage(file);
    } else {
      resetUI();
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