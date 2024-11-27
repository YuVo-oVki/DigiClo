<<<<<<< HEAD
<<<<<<< HEAD
const uploadButton = document.getElementById('uploadButton'); // button
const imageUpload = document.getElementById('imageUpload'); // input tag
const resultDiv = document.getElementById('result'); // out
=======
const uploadButton = document.getElementById('uploadButton');
const imageUpload = document.getElementById('imageUpload');
const resultDiv = document.getElementById('result');
>>>>>>> 25505a2 (edited "2024-11-26")
=======
const uploadButton = document.getElementById('uploadButton'); // button
const imageUpload = document.getElementById('imageUpload'); // input tag
const resultDiv = document.getElementById('result'); // out
>>>>>>> e3fc10b (edited "2024-11-26")

uploadButton.addEventListener('click', async () => {
    const file = imageUpload.files[0];
    if (!file) {
    alert('画像を選択してください。');
    return;
    }

    const formData = new FormData();
    formData.append('image', file);

    // 画像をサーバーにアップロードして解析結果を取得
    const response = await fetch('/upload', {
    method: 'POST',
    body: formData
    });

    if (!response.ok) {
    throw new Error('画像のアップロードに失敗しました');
    }

    const data = await response.json();
    console.log(data);  // レスポンスデータの確認

    // 分類結果を表示
    resultDiv.innerHTML = `
    <h3>分類結果:</h3>
    <ul>
        ${data.labels.map(label => `<li>${label}</li>`).join('')}
    </ul>
    `;
});