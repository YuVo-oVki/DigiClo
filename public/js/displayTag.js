document.addEventListener('DOMContentLoaded', async () => {
    try {
        // APIリクエストを送信
        const response = await fetch('/tag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: localStorage.getItem('uploadedImage') })
        });

        // レスポンスのステータスを確認
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`サーバーエラー: ${response.status} - ${errorText}`);
        }

        // JSONデータを取得
        const data = await response.json();
        console.log('取得データ:', data);

        // レスポンスのフォーマットをチェック
        if (!data.labels || !data.colors) {
            throw new Error('レスポンスフォーマットが不正です');
        }

    } catch (error) {
        console.error('タグデータ取得エラー:', error);
        alert(`エラーが発生しました: ${error.message}`);
    }
});

  
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // APIリクエストを送信
        const response = await fetch('/tag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: localStorage.getItem('uploadedImage') })
        });

        // レスポンスのステータスを確認
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`サーバーエラー: ${response.status} - ${errorText}`);
        }

        // JSONデータを取得
        const data = await response.json();
        console.log('取得データ:', data);

        // レスポンスのフォーマットをチェック
        if (!data.labels || !data.colors) {
            throw new Error('レスポンスフォーマットが不正です');
        }

        // タグと色を表示
        displayTags(data.labels);
        displayColors(data.colors);
    } catch (error) {
        console.error('タグデータ取得エラー:', error);
        alert(`エラーが発生しました: ${error.message}`);
    }
});

  