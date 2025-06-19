// src/main/resources/static/js/diagnosis/upload.js
$(function(){
  const $page = $('#page-container');
  const $btnDiag = $('#start-diagnosis');
  const $btnHist = $('#view-history');

  // 버튼 활성화/비활성화 함수
  function setActive(isDiag){
    if(isDiag){
      $btnDiag.addClass('btn-primary').removeClass('btn-outline');
      $btnHist.addClass('btn-outline').removeClass('btn-primary');
    } else {
      $btnHist.addClass('btn-primary').removeClass('btn-outline');
      $btnDiag.addClass('btn-outline').removeClass('btn-primary');
    }
  }

  // 1) 기본 탭: 업로드
  setActive(true);

  // 2) 진단하기 버튼 클릭
  $btnDiag.on('click', function(){
    // page-container 안을 다시 업로드 섹션으로 갈아 끼움
    $page.load('/diagnosisPage #page-container > section.diagnosis-upload', function(){
      setActive(true);
    });
  });

  // 3) 진단 이력 버튼 클릭
  $btnHist.on('click', function(){
    // board.html 에 있는 section.diagnosis-board 만 가져와서 삽입
    $page.load('/diagnosisBoardPage section.diagnosis-board', function(){
      setActive(false);
    });
  });
});
