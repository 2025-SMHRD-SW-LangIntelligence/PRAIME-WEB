function deleteDiary(dlid) {
  if (!confirm("정말로 삭제하시겠습니까?")) return;

  fetch(`/farmlog/${encodeURIComponent(dlid)}`, {
    method: "DELETE"
  })
    .then(res => {
      if (!res.ok) throw new Error("삭제 실패");
      alert("삭제되었습니다.");
      location.href = "/farmlog/board"; // ✅ 삭제 후 목록 페이지로 이동
    })
    .catch(err => {
      console.error(err);
      alert("삭제 중 오류 발생");
    });
}
