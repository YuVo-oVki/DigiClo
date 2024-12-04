let imageId;

// URLのクエリパラメータからimageIdを取得
window.onload = async () => {
    imageId = new URLSearchParams(window.location.search).get('imageId');
    const formdata = { clotheId: imageId };
    const imageContainer = document.getElementById('imageContainer');
    const tag = document.getElementById('tagInfo');
    
    if (imageId) {
        try {
            const response = await fetch('/getClotheTag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formdata)
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            // パスを使用して画像を表示
            const img = document.createElement('img');
            img.src = data.path; // サーバーから取得した画像パスを設定
            img.alt = `Clothe${imageId}`;
            img.width = 300;
            imageContainer.appendChild(img);

            // タグ情報の表示
            if (data.tags) {
                const tags = data.tags.split(',');
                tag.innerHTML = "<h4>登録されているタグ</h4>";
                tags.forEach(tagRow => {
                    tag.innerHTML += `<div class="tagName">・${tagRow}<br></div>`;
                });
            } else {
                tag.textContent = "タグが見つかりません。";
            }
        } catch (error) {
            console.error('Error:', error);
            imageContainer.innerText = '画像を取得できませんでした。';
        }
    } else {
        imageContainer.innerText = '画像が選択されていません。';
    }
};

// 戻るボタン処理
function goBack() {
    window.location.href = './logined.html'; // 元のページに戻る
}

function edit() {
    sessionStorage.setItem('id', imageId);
    sessionStorage.setItem('tag', document.getElementsByClassName('tagName'));
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
        imageId = new URLSearchParams(window.location.search).get('imageId');
        const formdata = { clotheId : imageId }; 
        
        fetch('/deleteClothe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formdata)
        })
        .then(response => {
            if (response.status == 404) {
                alert("登録したコーデに衣服が含まれているので削除できません。");
                throw new Error("404: Unable to delete clothe.")
            } else if (!response.ok) {
                throw new Error("Bad response");
            }
            return response.json();
        })
        .then(data => {
            alert(`衣服を削除しました。`);
        })
        .catch(error => console.error('Error:', error));
        // 実際の削除処理（サーバー通信など）
        window.location.href = './logined.html'; // 削除後に戻る
    });

    // 「いいえ」を押したとき
    document.getElementById('confirmNo').addEventListener('click', () => {
        confirmDialog.remove(); // ダイアログを閉じる
    });
}