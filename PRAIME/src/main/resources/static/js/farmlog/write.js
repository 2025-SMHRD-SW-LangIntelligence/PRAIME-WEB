document.addEventListener("DOMContentLoaded", function () {
  const imageInput = document.getElementById("dimages");
  const preview = document.getElementById("upload-preview");
  const form = document.querySelector(".journal-form");
  const weatherInput = document.getElementById("weather");
  const dateInput = document.getElementById("date");

  let selectedFiles = [];

  // 🌤 1. 날짜 세팅
  const today = new Date();
  const yyyyMMdd = today.toISOString().slice(0, 10).replace(/-/g, "");
  dateInput.value = today.toISOString().split("T")[0];

  // 🌦 2. 기상청 날씨 API 호출 (초단기실황)
  const API_KEY = "7GTN%2BzwFC7KgPhWIUmHGxHuVsDGd1TnKWWtReEorkPr%2F%2FX9KhMaSl0nTTkBrp9Eh2FXbykME%2BXR%2F3kPoxv3A4A%3D%3D"; // 반드시 encodeURIComponent()로 인코딩한 값
  const nx = 58; // 서울 기준
  const ny = 74;

  // base_time 계산 (기상청은 1시간 단위로 30분 이후부터 응답 가능)
  const now = new Date();
  let hour = now.getHours();
  let minute = now.getMinutes();

  if (minute < 45) hour -= 1;
  const base_time = (hour < 10 ? "0" : "") + hour + "00";
  const base_date = yyyyMMdd;

  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const items = data.response.body.items.item;
      const temp = items.find(i => i.category === "T1H")?.obsrValue;
      const pty = items.find(i => i.category === "PTY")?.obsrValue;

      const skyMap = {
        "0": "맑음",
        "1": "비",
        "2": "비/눈",
        "3": "눈",
        "4": "소나기"
      };

      const condition = skyMap[pty] || "정보 없음";
      weatherInput.value = `${temp}°C / ${condition}`;
    })
    .catch(err => {
      console.error("날씨 API 오류:", err);
      weatherInput.value = "날씨 정보 없음";
    });

  // 📸 3. 이미지 선택 & 미리보기
  imageInput.addEventListener("change", function (e) {
    selectedFiles = Array.from(e.target.files);
    preview.innerHTML = "";

    const countText = document.createElement("p");
    countText.textContent = `총 ${selectedFiles.length}장 선택됨`;
    preview.appendChild(countText);

    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function (ev) {
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";

        const img = document.createElement("img");
        img.src = ev.target.result;
        img.classList.add("thumbnail");

        const delBtn = document.createElement("button");
        delBtn.textContent = "X";
        Object.assign(delBtn.style, {
          position: "absolute",
          top: "2px",
          right: "2px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          width: "20px",
          height: "20px",
          lineHeight: "20px",
        });

        delBtn.onclick = (event) => {
          event.stopPropagation(); // ✅ label 전파 차단
          event.preventDefault();

          selectedFiles.splice(index, 1);
          imageInput.value = ""; // 리셋

          // DataTransfer로 재구성
          const dt = new DataTransfer();
          selectedFiles.forEach(f => dt.items.add(f));
          imageInput.files = dt.files;
          imageInput.dispatchEvent(new Event("change"));
        };

        wrapper.appendChild(img);
        wrapper.appendChild(delBtn);
        preview.appendChild(wrapper);
      };
      reader.readAsDataURL(file);
    });
  });

  // 💾 4. 저장 버튼 제출 처리
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    selectedFiles.forEach(file => {
      formData.append("dimages", file); // 이미지 전송
    });

    fetch("/farmlog/write", {
      method: "POST",
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error("서버 오류");
        return res.json();
      })
      .then(data => {
        alert("저장되었습니다.");
        location.href = "/farmlog/list";
      })
      .catch(err => {
        console.error(err);
        alert("저장 실패");
      });
  });
});