$(function(){
  // const $page = $('#page-container'); // 페이지 이동 방식에서는 이 요소에 내용을 로드하지 않으므로 더 이상 필요하지 않을 수 있습니다.
  const $btnDiag = $('#start-diagnosis');
  const $btnHist = $('#view-history');

  // 버튼 활성화/비활성화 함수
  // 이 함수는 클릭 시 버튼의 시각적 상태를 변경하는 데 사용됩니다.
  // 실제 페이지 이동 후에는 새로 로드된 페이지의 스크립트에서
  // 현재 URL에 따라 어떤 버튼이 활성화되어야 하는지 판단하여 설정하는 것이 일반적입니다.
  function setActive(isDiag){
    if(isDiag){
      $btnDiag.addClass('btn-primary').removeClass('btn-outline');
      $btnHist.addClass('btn-outline').removeClass('btn-primary');
    } else {
      $btnHist.addClass('btn-primary').removeClass('btn-outline');
      $btnDiag.addClass('btn-outline').removeClass('btn-primary');
    }
  }

  // 1) 페이지 로드 시 초기 버튼 상태 설정
  // 현재 URL에 따라 어떤 버튼이 활성화될지 결정하는 로직을 추가하는 것이 좋습니다.
  // 예시:
  const currentPath = window.location.pathname;
  if (currentPath === '/diagnosisUploadPage' || currentPath === '/') { // 기본 경로나 업로드 페이지일 경우
      setActive(true);
  } else if (currentPath === '/diagnosisBoardPage') { // 이력 페이지일 경우
      setActive(false);
  } else {
      setActive(true); // 그 외의 경우 기본값 (업로드 탭 활성화)
  }


  // 2) 진단하기 버튼 클릭
  $btnDiag.on('click', function(e){
    // e.preventDefault(); // 만약 버튼이 <a> 태그라면 기본 동작(링크 이동)을 막을 수 있습니다.
    setActive(true); // 클릭 시 버튼 상태 변경 (페이지 이동 전에 잠깐 보일 수 있습니다)
    window.location.href = '/diagnosisUploadPage'; // 지정된 URL로 페이지 이동
  });

  // 3) 진단 이력 버튼 클릭
  $btnHist.on('click', function(e){
    // e.preventDefault(); // 만약 버튼이 <a> 태그라면 기본 동작(링크 이동)을 막을 수 있습니다.
    setActive(false); // 클릭 시 버튼 상태 변경 (페이지 이동 전에 잠깐 보일 수 있습니다)
    window.location.href = '/diagnosisBoardPage'; // 지정된 URL로 페이지 이동
  });
});
