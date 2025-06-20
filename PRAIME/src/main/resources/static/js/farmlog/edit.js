document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const entryId = urlParams.get("id");

	const form = document.getElementById("edit-form");
	const imageInput = document.getElementById("dlimages");
	const cancelBtn = document.querySelector(".cancel-btn");
	const preview = document.getElementById("upload-preview");
	let selectedFiles = [];

	// 1. 기존 데이터 불러오기
	fetch(`/farmlog/entry/${entryId}`)
		.then(res => res.json())
		.then(data => {
			document.getElementById("dlid").value = data.id;
			document.getElementById("dltitle").value = data.title;
			document.getElementById("dlcontent").value = data.content;
			document.getElementById("dldate").value = data.date;
			document.getElementById("dlweather").value = data.weather;
			loadCrops(data.crop);

			// 기존 이미지 미리보기
			data.images.forEach((src) => {
				const img = document.createElement("img");
				img.src = src;
				img.classList.add("thumbnail");
				preview.appendChild(img);
			});
		});

	// 2. 작물 목록 불러오기 및 선택 상태 표시
	function loadCrops(selectedCrop) {
		fetch("/farmlog/edit/crops")
			.then(res => res.json())
			.then(crops => {
				const container = document.getElementById("crop-radio-container");
				crops.forEach((crop, index) => {
					const radio = document.createElement("input");
					radio.type = "radio";
					radio.name = "crop";
					radio.value = crop;
					radio.id = `crop-${index}`;
					if (crop === selectedCrop) radio.checked = true;

					const label = document.createElement("label");
					label.htmlFor = radio.id;
					label.innerText = crop;
					label.classList.add("crop-card");

					const wrapper = document.createElement("div");
					wrapper.appendChild(radio);
					wrapper.appendChild(label);
					container.appendChild(wrapper);
				});
			});
	}

	// 3. 이미지 미리보기
	// ✅ 이미지 선택 시 썸네일 표시 + 삭제 처리
	imageInput.addEventListener("change", (e) => {
		selectedFiles = Array.from(e.target.files);
		renderPreview(selectedFiles);
	});

	function renderPreview(files) {
		preview.innerHTML = "";

		if (files.length === 0) {
			preview.innerHTML = "<p>선택된 이미지가 없습니다.</p>";
			return;
		}

		const count = document.createElement("p");
		count.textContent = `총 ${files.length}장 선택됨`;
		preview.appendChild(count);

		files.forEach((file, index) => {
			const reader = new FileReader();
			reader.onload = (ev) => {
				const wrapper = document.createElement("div");
				wrapper.style.position = "relative";

				const img = document.createElement("img");
				img.src = ev.target.result;
				img.classList.add("thumbnail");

				const delBtn = document.createElement("button");
				delBtn.textContent = "X";
				delBtn.onclick = (event) => {
					event.preventDefault();
					selectedFiles.splice(index, 1);
					const dt = new DataTransfer();
					selectedFiles.forEach(f => dt.items.add(f));
					imageInput.files = dt.files;
					renderPreview(selectedFiles);
				};

				wrapper.appendChild(img);
				wrapper.appendChild(delBtn);
				preview.appendChild(wrapper);
			};
			reader.readAsDataURL(file);
		});
	}

	// ✅ 폼 제출 시 파일 정리 포함
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		// 4. 수정 제출
		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			const formData = new FormData(form);
			selectedFiles.forEach(file => formData.append("files", file));

			try {
				const response = await fetch(`/farmlog/edit/${entryId}`, {
					method: "POST",
					body: formData,
				});
				if (!response.ok) throw new Error("업데이트 실패");
				alert("수정 완료되었습니다.");
				window.location.href = "/farmlog/board";
			} catch (err) {
				alert("수정 실패: " + err.message);
			}
		});

		let selectedFiles = [];
		let originalData = {}; // 원본 데이터 저장용

		const form = document.querySelector("#edit-form");
		const imageInput = document.getElementById("dlimages");
		const preview = document.getElementById("upload-preview");
		const cancelBtn = document.querySelector(".cancel-btn");
		const entryId = new URLSearchParams(window.location.search).get("id");

		// ✅ 초기 데이터 불러오기
		fetch(`/farmlog/entry/${entryId}`)
			.then(res => res.json())
			.then(data => {
				originalData = data; // 👉 원본 보관

				document.getElementById("dlid").value = data.id;
				document.getElementById("dltitle").value = data.title;
				document.getElementById("dlcontent").value = data.content;
				document.getElementById("dldate").value = data.date;
				document.getElementById("dlweather").value = data.weather;

				loadCrops(data.crop);
				renderOriginalImages(data.images);
			});

		// ✅ 작물 목록 + 기존 선택 반영
		function loadCrops(selectedCrop) {
			fetch("/farmlog/edit/crops")
				.then(res => res.json())
				.then(crops => {
					const container = document.getElementById("crop-radio-container");
					container.innerHTML = "";
					crops.forEach((crop, index) => {
						const radio = document.createElement("input");
						radio.type = "radio";
						radio.name = "crop";
						radio.value = crop;
						radio.id = `crop-${index}`;
						if (crop === selectedCrop) radio.checked = true;

						const label = document.createElement("label");
						label.htmlFor = radio.id;
						label.innerText = crop;
						label.classList.add("crop-card");

						const wrapper = document.createElement("div");
						wrapper.appendChild(radio);
						wrapper.appendChild(label);
						container.appendChild(wrapper);
					});
				});
		}

		// ✅ 원본 이미지 렌더링
		function renderOriginalImages(imageUrls) {
			preview.innerHTML = "";
			const countText = document.createElement("p");
			countText.textContent = `총 ${imageUrls.length}장 업로드됨`;
			preview.appendChild(countText);

			imageUrls.forEach(url => {
				const wrapper = document.createElement("div");
				wrapper.style.position = "relative";

				const img = document.createElement("img");
				img.src = url;
				img.classList.add("thumbnail");

				wrapper.appendChild(img);
				preview.appendChild(wrapper);
			});

			selectedFiles = []; // 새 파일 선택 초기화
			imageInput.value = ""; // 파일 인풋 초기화
		}

		// ✅ 이미지 새로 선택 시 썸네일
		imageInput.addEventListener("change", (e) => {
			selectedFiles = Array.from(e.target.files);
			renderSelectedPreview(selectedFiles);
		});

		function renderSelectedPreview(files) {
			preview.innerHTML = "";

			const count = document.createElement("p");
			count.textContent = `총 ${files.length}장 선택됨`;
			preview.appendChild(count);

			files.forEach((file, index) => {
				const reader = new FileReader();
				reader.onload = (ev) => {
					const wrapper = document.createElement("div");
					wrapper.style.position = "relative";

					const img = document.createElement("img");
					img.src = ev.target.result;
					img.classList.add("thumbnail");

					const delBtn = document.createElement("button");
					delBtn.textContent = "X";
					delBtn.onclick = (event) => {
						event.preventDefault();
						selectedFiles.splice(index, 1);
						const dt = new DataTransfer();
						selectedFiles.forEach(f => dt.items.add(f));
						imageInput.files = dt.files;
						renderSelectedPreview(selectedFiles);
					};

					wrapper.appendChild(img);
					wrapper.appendChild(delBtn);
					preview.appendChild(wrapper);
				};
				reader.readAsDataURL(file);
			});
		}

		// ✅ 폼 제출
		form.addEventListener("submit", async (e) => {
			e.preventDefault();

			const dt = new DataTransfer();
			selectedFiles.forEach(f => dt.items.add(f));
			imageInput.files = dt.files;

			const formData = new FormData(form);
			selectedFiles.forEach(file => formData.append("files", file));

			try {
				const response = await fetch(`/farmlog/update/${entryId}`, {
					method: "POST",
					body: formData,
				});

				if (!response.ok) throw new Error("업로드 실패");

				alert("수정 완료!");
				window.location.href = "/farmlog/board";
			} catch (err) {
				alert("오류: " + err.message);
			}
		});

		// ✅ 취소 버튼 클릭 시 → 원본 데이터로 복원
		cancelBtn.addEventListener("click", (e) => {
			e.preventDefault();

			document.getElementById("dltitle").value = originalData.title;
			document.getElementById("dlcontent").value = originalData.content;
			loadCrops(originalData.crop);
			renderOriginalImages(originalData.images);
		});
	});
});