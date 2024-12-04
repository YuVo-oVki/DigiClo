let imageId;

// URLのクエリパラメータからimageIdを取得
window.onload = (async() => {
    imageId = new URLSearchParams(window.location.search).size;
    const formdata = { clotheId : imageId }; 

    fetch('/getClotheTag', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formdata)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json(); // レスポンスをJSON形式に変換
    })
    .then(data => {
        if (data.tags) {
            tags = data.tags.split(',');
            tag.innerHTML = "<h4>登録されているタグ</h4>";
            tags.forEach(tagRow => {
                tag.innerHTML += `<div class="tagName">・${tagRow}<br></div>`;
            });
        } else {
            tag.textContent = "タグが見つかりません。";
        }
    })
    .catch(error => console.error('Error:', error));
    
    const imageContainer = document.getElementById('imageContainer');
    const tag = document.getElementById('tagInfo');

    if (imageId) {
        const img = document.createElement('img');
        img.src = `./images/clothes/clothe${imageId}.png`;  // パスにIDを使って画像を指定
        img.alt = `Clothe${imageId}`;
        img.width = 300;
        imageContainer.appendChild(img);
    } else {
        imageContainer.innerText = '画像が選択されていません。';
    }
    
});

// 戻るボタン処理
function goBack() {
    window.location.href = './logined.html'; // 元のページに戻る
}

function edit() {
    sessionStorage.setItem('id', imageId);
    window.location.href = './clothe_tag_edit.html'
}

// 削除確認ダイアログを表示
function confirmDelete() {
    const confirmDialog = document.createElement('div');
    confirmDialog.innerHTML = `
    <div class="confirm-dialog">
            <p>本当に削除しますか？</p>
            <button class="btn btn-danger" id="confirmYes">はい</button>
            <button class="btn btn-secondary" id="confirmNo">いいえ</button>
        </div>
    `;

    document.body.appendChild(confirmDialog);

    // 「はい」を押したとき
    document.getElementById('confirmYes').addEventListener('click', () => {
        alert(`衣服を削除しました。`);
        // 実際の削除処理（サーバー通信など）
        window.location.href = './logined.html'; // 削除後に戻る
    });

    // 「いいえ」を押したとき
    document.getElementById('confirmNo').addEventListener('click', () => {
        confirmDialog.remove(); // ダイアログを閉じる
    });
}