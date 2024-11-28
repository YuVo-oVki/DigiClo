document.addEventListener('DOMContentLoaded', async () => {
    // try {
        // APIリクエストを送信
        const response = await fetch('/tag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: localStorage.getItem('uploadedImage') })
        });

        console.log(response);

        // // レスポンスのステータスを確認
        // if (!response.ok) {
        //     const errorText = await response.text();
        //     throw new Error(`サーバーエラー: ${response.status} - ${errorText}`);
        // }

        // JSONデータを取得
        const data = await response.json();
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

    // } catch (error) {
    //     console.error('タグデータ取得エラー:', error);
    //     alert(`エラーが発生しました: ${error.message}`);
    // }
});
