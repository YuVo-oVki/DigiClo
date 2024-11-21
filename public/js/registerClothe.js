document.getElementById('imageInput').addEventListener('change', handleFileSelect);

function resetErrorsAndInput() {
    const imagePreview = document.getElementById('imagePreview');
    const errorMessage = document.getElementById('errorMessage');

    // エラーメッセージをリセット
    errorMessage.style.display = "none";
    errorMessage.textContent = "";

    // プレビュー枠をリセット
    imagePreview.classList.remove("error");
    imagePreview.innerHTML = "<p>ここに画像が表示されます</p>";
}

function handleFileSelect() {
    try {
        const imageInput = document.getElementById('imageInput');
        const imagePreview = document.getElementById('imagePreview');
        const errorMessage = document.getElementById('errorMessage');

        // エラーと入力をリセット
        resetErrorsAndInput();

        // ファイルが選択されているか確認
        if (imageInput.files && imageInput.files[0]) {
            const file = imageInput.files[0];

            // 対応している画像形式か確認
            const validFormats = ["image/jpeg", "image/png", "image/gif"];
            if (!validFormats.includes(file.type)) {
                imagePreview.classList.add("error");
                errorMessage.textContent = "写真の形式が対応していません。対応形式: JPEG, PNG, GIF";
                errorMessage.style.display = "block";
                return;
            }

            const reader = new FileReader();

            // ファイル読み込み完了時の処理
            reader.onload = function (e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="プレビュー画像">`;
            };

            // ファイルを読み込む
            reader.readAsDataURL(file);
        } else {
            resetErrorsAndInput();
        }
    } catch (error) {
        alert("エラーが発生しました: " + error.message);
    }
}

function confirmImage() {
    try {
        const imageInput = document.getElementById('imageInput');
        const imagePreview = document.getElementById('imagePreview');
        const errorMessage = document.getElementById('errorMessage');

        // エラーをリセット
        resetErrorsAndInput();

        // ファイルが選択されていない場合
        if (!imageInput.files || !imageInput.files[0]) {
            imagePreview.classList.add("error");
            errorMessage.textContent = "写真の読み込みができませんでした。";
            errorMessage.style.display = "block";
            return;
        }

        // 対応形式を再チェック
        const file = imageInput.files[0];
        const validFormats = ["image/jpeg", "image/png", "image/gif"];
        if (!validFormats.includes(file.type)) {
            imagePreview.classList.add("error");
            errorMessage.textContent = "写真の形式が対応していません。対応形式: JPEG, PNG, GIF";
            errorMessage.style.display = "block";
            return;
        }

        window.location.href = "displaytag.html";
    } catch (error) {
        alert("エラーが発生しました: " + error.message);
    }
}
