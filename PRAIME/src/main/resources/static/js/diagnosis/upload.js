// /js/diagnosis/upload.js

// ----------------------------------------------------
// [0] 질병 설명 데이터 (class_id에 매핑)
// ----------------------------------------------------
const diseaseDataById = {
    // class_id: { label: "레이블명", description: "설명" }
    0: { label: "정상", description: "탐지된 병해충이 없거나, 모델이 객체탐지에 실패했습니다." },
    1: { label: "배검은별무늬병", description: "배 잎, 줄기, 과실 등에 검은색 별 모양의 병반이 생기는 병으로, 잎과 과실에 피해를 주며 수확량 감소를 유발합니다. 주로 겨울철 자낭각에서 월동하며 봄에 자낭포자가 퍼져 감염됩니다." },
    2: { label: "배과수화상병", description: "세균성 전염병으로, 잎과 가지, 과실 등이 불에 탄 듯 괴사하며 식물 전체가 말라 죽을 수 있는 치명적인 병입니다. 빠른 확산과 피해가 특징입니다." },
    3: { label: "사과갈색무늬병", description: "사과 잎에 갈색의 반점이 생기고 심하면 조기 낙엽을 유발하는 병으로, 나무 세력을 약화시키고 수확량에 악영향을 줍니다. 주로 6~9월에 심하게 발생합니다." },
    4: { label: "사과과수화상병", description: "사과에 발생하는 과수화상병으로, 가지와 잎, 과실이 괴사하며 나무 전체가 말라 죽을 수 있는 심각한 세균성 질병입니다. 빠른 방제가 필요합니다." },
    5: { label: "사과부란병", description: "사과 과실에 발생하는 병으로, 과실 표면에 부란(썩음) 현상이 나타나 상품 가치를 떨어뜨립니다. 주로 저장 중에 발생할 수 있습니다." },
    6: { label: "사과점무늬낙엽병", description: "사과 잎에 점무늬가 생기고 낙엽을 유발하는 병으로, 나무의 생육에 부정적인 영향을 미치며 수확량 감소를 초래합니다." },
    7: { label: "사과탄저병", description: "사과에 발생하는 탄저병으로, 과실과 가지에 검은색 병반이 생기며 심하면 과실이 썩고 나무가 약해집니다. 방제가 중요합니다." }
};

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
  const $resultDescriptionContainer = $('#result-description-container');
  const $resultDescription = $('#result-description');
  const $resetBtn = $('.reset-btn');
  const $diagnosisResultSaveBtn = $('#diagnosisResultSaveBtn');

  let lastDiagnosisResult = {
      label: '',
      confidence: 0,
      description: '',
      image: ''
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

    $uploadInput.val(''); // 파일 입력 필드 초기화

    $diagnosisResultSection.addClass('hidden'); // 진단 결과 섹션 숨기기
    $resultLabel.text('--'); // 레이블 초기화
    $resultConfidence.text('--%'); // 신뢰도 초기화
    $resultDescriptionContainer.addClass('hidden'); // 설명 컨테이너 숨기기
    $resultDescription.text('--'); // 설명 내용 초기화
    
    // lastDiagnosisResult 객체 초기화
    lastDiagnosisResult = {
        label: '',
        confidence: 0,
        description: '',
        image: ''
    };

    // '결과저장' 버튼 비활성화
    $diagnosisResultSaveBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');
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
      let resultDescription = '병해충 탐지에 실패했거나, 이미지를 다시 시도해 주세요.'; // 초기 설명
      let base64Image = null; // 초기 이미지 데이터

      // 응답 성공 및 탐지된 병해충이 있을 경우
      if (data.success && data.prediction_details.total_detections > 0) {
        const firstDetection = data.prediction_details.detections[0];
        const classId = firstDetection.class_id; // Flask에서 넘어온 class_id
        resultConfidence = parseFloat((firstDetection.confidence * 100).toFixed(2));
        base64Image = data.output_image.base64_encoded_image;

        // class_id에 해당하는 질병 정보 가져오기
        const diseaseInfo = diseaseDataById[classId];

        console.log('1. Flask에서 받은 class_id:', classId);
        console.log('2. diseaseDataById에서 찾아진 정보:', diseaseInfo);

        if (diseaseInfo) {
            resultLabel = diseaseInfo.label;
            resultDescription = diseaseInfo.description;
        } else {
            // 정의되지 않은 class_id인 경우
            resultLabel = '알 수 없는 질병';
            resultDescription = '알 수 없는 질병이 탐지되었습니다. 데이터베이스를 확인해주세요.';
        }
      } 
      // 응답 성공, 그러나 탐지된 병해충이 없을 경우 (total_detections가 0)
      else if (data.success && data.prediction_details.total_detections === 0) {
          // class_id 0을 "정상"으로 간주
          const normalInfo = diseaseDataById[0];
          resultLabel = normalInfo.label;
          resultDescription = normalInfo.description;
          base64Image = data.output_image ? data.output_image.base64_encoded_image : null; // 정상 이미지도 있을 수 있음
          console.log('total_detections가 0입니다. 정상으로 처리합니다.');
      }
      
      // 진단 결과 UI 업데이트
      $resultLabel.text(resultLabel); // 레이블 표시
      $resultConfidence.text(`${resultConfidence}%`); // 신뢰도 표시
      $diagnosisResultSection.removeClass('hidden'); // 결과 섹션 보이게

      // 질병 설명 UI 업데이트: "정상"이 아니고, 유효한 설명이 있을 때만 표시
      // resultLabel을 기준으로 "정상", "탐지 실패", "알 수 없는 질병"이 아닐 때 설명을 표시
      if (resultLabel !== "정상" && resultLabel !== "탐지 실패" && resultLabel !== "알 수 없는 질병" && resultDescription) {
          $resultDescription.text(resultDescription);
          $resultDescriptionContainer.removeClass('hidden'); // 설명 컨테이너 보이게
          console.log('4. 설명 컨테이너를 표시하고 설명을 설정했습니다.');
      } else {
          $resultDescription.text('--'); // 그 외의 경우 '--' 표시
          $resultDescriptionContainer.addClass('hidden'); // 설명 컨테이너 숨기기
          console.log('4. 설명 컨테이너를 숨겼거나 설명이 없어 --를 설정했습니다.');
      }

      // 업로드 박스 텍스트 업데이트
      $uploadTextH2.text('진단 완료').show();
      $uploadTextP.text('결과 저장 버튼을 클릭하여 진단 내용을 저장하세요.').show();

      // 진단된 이미지로 배경 변경
      if (base64Image) {
        $uploadBox.css('background-image', `url(data:image/jpeg;base64,${base64Image})`);
        $uploadBox.addClass('uploaded');
        $uploadIcon.hide();
        // 이미지가 업로드된 상태에서는 제목과 설명은 유지되어야 함
        $uploadTextH2.show(); 
        $uploadTextP.show(); 
        $uploadButtons.hide();
      }

      // 마지막 진단 결과 저장 (저장 버튼 클릭 시 사용)
      lastDiagnosisResult = {
          label: resultLabel,
          confidence: resultConfidence,
          description: resultDescription,
          image: base64Image
      };

      // '결과 저장' 버튼 활성화/비활성화
      // "정상", "탐지 실패", "알 수 없는 질병"이 아니고 신뢰도가 0보다 클 때만 활성화
      if (resultLabel !== '정상' && resultLabel !== '탐지 실패' && resultLabel !== '알 수 없는 질병' && resultConfidence > 0) {
          $diagnosisResultSaveBtn.prop('disabled', false).css('opacity', '1').css('cursor', 'pointer');
      } else {
          $diagnosisResultSaveBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');
      }

    })
    .catch(error => {
      console.error('진단 실패:', error); // 에러 로그
      let errorMessage = '진단 중 오류가 발생했습니다.';
      if (error.response) {
        errorMessage = `서버 오류: ${error.response.data.error || error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Flask 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
      } else {
        errorMessage = `요청 오류: ${error.message}`;
      }
      alert(errorMessage); // 사용자에게 알림

      // 오류 발생 시 UI 초기화
      $resultLabel.text('오류 발생');
      $resultConfidence.text('---');
      $diagnosisResultSection.removeClass('hidden');
      $resultDescriptionContainer.addClass('hidden');
      $resultDescription.text('--');
      
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
    if (lastDiagnosisResult.label === '' || lastDiagnosisResult.confidence === 0) {
        alert('저장할 진단 결과가 없습니다. 먼저 이미지를 업로드하고 진단을 완료해주세요.');
        return;
    }
    // "정상", "탐지 실패", "알 수 없는 질병" 결과는 저장하지 않음
    if (lastDiagnosisResult.label === '정상' || lastDiagnosisResult.label === '탐지 실패' || lastDiagnosisResult.label === '알 수 없는 질병') {
        alert('정상 또는 탐지 실패/알 수 없는 질병 결과는 저장할 수 없습니다.');
        return;
    }

    // 결과 이미지의 'data:image/jpeg;base64,' 접두사를 제거 (필요한 경우)
    const rawBase64Image = lastDiagnosisResult.image ? (lastDiagnosisResult.image.split(',')[1] || lastDiagnosisResult.image) : null;

    // 저장할 데이터 객체
    const saveData = {
        label: lastDiagnosisResult.label,
        confidence: lastDiagnosisResult.confidence,
        description: lastDiagnosisResult.description,
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
    // 업로드된 상태가 아닐 때만 클릭 활성화 (오류 발생 시에도 클릭 가능하도록)
    // if (!$uploadBox.hasClass('uploaded') || $resultLabel.text() === '오류 발생') {
        $uploadInput.click();
    // }
  });

  // 파일 입력 필드에 파일이 선택되었을 때 이벤트 처리
  $uploadInput.on('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        // 이미지 미리보기 및 UI 변경 (진단 전 임시 미리보기)
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
        $resultDescriptionContainer.addClass('hidden');
        $resultDescription.text('--');
        $diagnosisResultSaveBtn.prop('disabled', true).css('opacity', '0.6').css('cursor', 'not-allowed');
      };
      reader.readAsDataURL(file);

      // 파일 선택 후 바로 이미지 업로드 및 진단 API 호출
      uploadImage(file);
    } else {
      resetUI(); // 파일 선택 취소 시 UI 리셋
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