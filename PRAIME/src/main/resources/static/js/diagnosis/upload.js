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
    // e.preventDefault(); // 필요 시 버튼의 기본 동작(예: <a> 태그의 링크 이동) 방지
    setActive(true); // 버튼 시각적 상태 변경
    window.location.href = '/diagnosisUploadPage'; // '진단하기' 페이지로 이동
  });

  // '진단 이력' 버튼 클릭 시 이벤트 핸들러
  $btnHist.on('click', function(e){
    // e.preventDefault(); // 필요 시 버튼의 기본 동작 방지
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
  // 실제 파일 입력 요소는 사용자에게 보이지 않게 동적으로 생성하여 body에 추가합니다.
  const $uploadInput = $('<input type="file" id="actual-file-input" accept="image/*" style="display:none;">');
  const $uploadIcon = $uploadBox.find('.upload-icon');
  const $uploadTextH2 = $uploadBox.find('h2');
  const $uploadTextP = $uploadBox.find('p');
  const $uploadButtons = $uploadBox.find('.upload-buttons'); // '파일 업로드' 버튼을 감싸는 div (이제 숨겨짐)
  const $diagnosisResultSection = $('#diagnosisResult'); // 진단 결과 표시 섹션
  const $resultLabel = $('#result-label');             // 진단 레이블 표시 span
  const $resultConfidence = $('#result-confidence');   // 진단 신뢰도 표시 span
  const $resetBtn = $('.reset-btn');                 // '리셋' 버튼
  const $diagnosisResultBtn = $('#diagnosisResultBtn'); // '결과' 버튼

  // 숨겨진 파일 입력 요소를 body에 추가
  $('body').append($uploadInput);

  // 초기 UI 상태 설정: '결과' 버튼 비활성화
  $diagnosisResultBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');


  /**
   * @function resetUI
   * @description 업로드 박스와 진단 결과 UI를 초기 상태로 되돌립니다.
   */
  function resetUI() {
    // 업로드 박스 초기화 (배경 이미지 제거, 클래스 제거, 배경 관련 CSS 초기화)
    $uploadBox.css({
      'background-image': 'none',
      'background-size': '',
      'background-position': '',
      'background-repeat': ''
    }).removeClass('uploaded');

    // 업로드 박스 내 텍스트 및 아이콘 다시 표시
    $uploadIcon.show();
    $uploadTextH2.show().text('작물 사진 업로드');
    $uploadTextP.show().text('병해충이 의심되는 부분을 촬영하거나 이미지를 업로드하세요');
    // $uploadButtons.show(); // <-- 이 줄을 제거하거나 주석 처리합니다.

    // 파일 입력 필드 값 초기화 (동일 파일 재선택 시 change 이벤트 발생 위함)
    $uploadInput.val('');

    // 진단 결과 섹션 숨김 및 내용 초기화
    $diagnosisResultSection.addClass('hidden');
    $resultLabel.text('--');
    $resultConfidence.text('--%');

    // '결과' 버튼 비활성화 및 스타일 초기화
    $diagnosisResultBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');
  }


  /**
   * @function uploadImage
   * @description 선택된 이미지를 Flask API로 전송하고 진단 결과를 처리합니다.
   * @param {File} file - 업로드할 이미지 파일 객체.
   */
  function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conf_threshold', 0.5); // AI 진단 신뢰도 임계값 설정

    // 업로드 중 시각적 피드백
    $uploadBox.css('border-color', 'var(--primary-color)').css('opacity', '0.8');
    $uploadTextH2.text('진단 중...').show();
    $uploadTextP.text('AI가 작물을 분석하고 있습니다. 잠시만 기다려 주세요.').show();

    // Axios를 이용한 비동기 파일 업로드 및 진단 요청
    axios.post('http://localhost:5000/predict', formData, { // Flask API 엔드포인트
      headers: {
        'Content-Type': 'multipart/form-data', // 파일 업로드를 위한 필수 헤더
      },
    })
    .then(response => {
      console.log('진단 성공:', response.data);
      const data = response.data;

      if (data.success && data.prediction_details.total_detections > 0) {
        // 탐지된 결과가 있을 경우 UI 업데이트
        const firstDetection = data.prediction_details.detections[0]; // 첫 번째 (가장 높은 신뢰도) 결과 사용
        $resultLabel.text(firstDetection.class_name);
        $resultConfidence.text(`${(firstDetection.confidence * 100).toFixed(2)}%`);
        $diagnosisResultSection.removeClass('hidden'); // 진단 결과 섹션 표시

        $uploadTextH2.text('진단 완료').show();
        $uploadTextP.text('결과 버튼을 클릭하여 진단 내용을 확인하세요.').show();

        // 탐지 결과가 반영된 이미지 미리보기 업데이트 (Base64 인코딩된 이미지 사용)
        const base64Image = data.output_image.base64_encoded_image;
        if (base64Image) {
          $uploadBox.css('background-image', `url(data:image/jpeg;base64,${base64Image})`);
        }
      } else {
        // 탐지된 병해충이 없거나 탐지에 실패한 경우
        $resultLabel.text('병해충 없음 또는 탐지 실패');
        $resultConfidence.text('---');
        $diagnosisResultSection.removeClass('hidden'); // 결과 섹션 표시 (탐지 없음을 알림)

        $uploadTextH2.text('진단 완료').show();
        $uploadTextP.text('탐지된 병해충이 없거나, 이미지를 다시 시도해주세요.').show();
      }

      // '결과' 버튼 활성화 및 스타일 변경
      $diagnosisResultBtn.prop('disabled', false).css('opacity', '1').css('cursor', 'pointer');

    })
    .catch(error => {
      // API 호출 실패 시 에러 처리
      console.error('진단 실패:', error);
      alert('진단 중 오류가 발생했습니다. 다시 시도해주세요.');

      $resultLabel.text('오류 발생');
      $resultConfidence.text('---');
      $diagnosisResultSection.removeClass('hidden'); // 오류 발생 시에도 결과 섹션 표시

      $uploadTextH2.text('오류 발생').show();
      $uploadTextP.text('진단 중 오류가 발생했습니다.').show();

      // '결과' 버튼 비활성화 유지
      $diagnosisResultBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');

    })
    .finally(() => {
      // API 호출 완료 후 최종 처리 (로딩 스피너 제거 등)
      $uploadBox.css('border-color', 'var(--border-color)').css('opacity', '1'); // 테두리 색상 원복
    });
  }


  // ----------------------------------------------------
  // [2-1] 이벤트 리스너: 파일 업로드 및 리셋, 결과 버튼 동작
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

        $diagnosisResultSection.addClass('hidden'); // 새 이미지 업로드 시 결과 숨김
        $resultLabel.text('--');
        $resultConfidence.text('--%');
        $diagnosisResultBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');
      };
      reader.readAsDataURL(file); // 파일을 Base64로 읽어 URL 생성

      // 파일 선택 후 바로 이미지 업로드 및 진단 API 호출
      uploadImage(file);
    } else {
      // 파일 선택이 취소되거나 파일이 없는 경우 UI 초기화
      resetUI();
    }
  });

  // '리셋' 버튼 클릭 시 UI 초기화
  $resetBtn.on('click', function() {
    resetUI();
  });

  // '결과' 버튼 클릭 시 (현재는 진단 결과 섹션을 표시/확인하는 역할)
  $diagnosisResultBtn.on('click', function() {
    if ($diagnosisResultSection.hasClass('hidden')) {
      $diagnosisResultSection.removeClass('hidden');
    }
    // 향후 진단 상세 페이지 이동 또는 모달 팝업 등의 기능 추가 가능
  });
});