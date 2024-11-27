document.getElementById('imageUpload').addEventListener('change', handleFileSelect);

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
        const imageUpload = document.getElementById('imageUpload');
        const imagePreview = document.getElementById('imagePreview');
        const errorMessage = document.getElementById('errorMessage');

        // エラーと入力をリセット
        resetErrorsAndInput();

        // ファイルが選択されているか確認
        if (imageUpload.files && imageUpload.files[0]) {
            const file = imageUpload.files[0];

            // 対応している画像形式か確認
            const validFormats = ["image/jpeg", "image/png"];
            if (!validFormats.includes(file.type)) {
                imagePreview.classList.add("error");
                errorMessage.textContent = "写真の形式が対応していません。対応形式: JPEG, PNG";
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
        const imgInput = document.getElementById('imageUpload');
        const errorMessage = document.getElementById('errorMessage');
        const imagePreview = document.getElementById('imagePreview');

        // エラーをリセット
        resetErrorsAndInput();

        // ファイルが選択されていない場合
        if (!imgInput.files || !imgInput.files[0]) {
            errorMessage.textContent = "写真の読み込みができませんでした。";
            errorMessage.style.display = "block";
            return;
        }

        const file = imgInput.files[0];
        const validFormats = ["image/jpeg", "image/png"];
        if (!validFormats.includes(file.type)) {
            errorMessage.textContent = "写真の形式が対応していません。対応形式: JPEG, PNG";
            errorMessage.style.display = "block";
            return;
        }

        // 画像をサーバーに送信する
        const formData = new FormData();
        formData.append('image', file);  // 'image'という名前で画像データを追加

        // 画像をサーバーに送信
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('アップロード失敗');
            }
            return response.json();
        })
        .then(data => {
            // サーバーからのレスポンス（例: 成功メッセージや解析結果）
            console.log('サーバーからのレスポンス:', data);
            // 必要に応じて、レスポンスに基づいて何かを表示する
            if (data.success) {
                alert('画像のアップロードが成功しました！');
                // サーバーから何かのデータ（例えば解析結果）を表示することができる
                // ここで解析結果に基づく処理を追加できます
                window.location.href = "displaytag.html"; // 画面遷移の例
            } else {
                alert('アップロードに失敗しました: ' + data.errorMessage);
            }
        })
        .catch(error => {
            alert("エラーが発生しました: " + error.message);
        });
    } catch (error) {
        alert("エラーが発生しました: " + error.message);
    }
}