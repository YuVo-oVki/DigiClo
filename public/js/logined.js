function submitImage(imageId, element) {
    console.log('Image clicked!'); // デバッグ用ログ
    const kind = element.closest('.card').getAttribute('kind'); // 親要素の `kind` 属性を取得
    document.getElementById('imageIdInput').value = imageId;
    document.getElementById('kindInput').value = kind;
    document.getElementById('imageForm').submit();
}

document.addEventListener('DOMContentLoaded', async () => {
   
    // JSONデータを取得
    const data = JSON.parse(localStorage.getItem('imageData'));
    console.log('取得データ:', data);

    // // レスポンスのフォーマットをチェック
    // if (!data.labels || !data.colors) {
    //     throw new Error('レスポンスフォーマットが不正です');
    // }

    // タグをHTMLに表示
    const tagBox = document.querySelector('.tag-box ul');
    tagBox.innerHTML = ''; // 初期化
    data.labels.forEach(label => {
        const li = document.createElement('li');
        li.className = "tag";
        li.textContent = `${label}`;
        tagBox.appendChild(li);
    });

});