document.addEventListener('DOMContentLoaded', async () => {
   
    // JSONデータを取得
    const data = JSON.parse(localStorage.getItem('responseData'));
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
        li.textContent = `・${label}`;
        tagBox.appendChild(li);
    });

    // 色情報を表示（例として色名のリストを表示）
    const colorBox = document.createElement('div');
    colorBox.classList.add('color-box');
    data.colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.textContent = color;
        colorDiv.style.backgroundColor = color;
        colorDiv.classList.add('color-item');
        colorBox.appendChild(colorDiv);
    });
    document.querySelector('.container').appendChild(colorBox);
});
