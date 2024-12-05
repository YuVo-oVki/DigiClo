let imageId;

// URLのクエリパラメータからimageIdを取得
window.onload = async () => {
    imageId = new URLSearchParams(window.location.search).get('imageId');
    const formdata = { coordinateId: imageId };
    const imageGallery = document.getElementById('imageGallery');
    
    if (imageId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/getCoordinateInfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formdata)
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            
            const name = document.getElementById('coordinateName');
            name.textContent = data.rows[0].coordinatename || '未入力';
            let imgArray = [], currentIndex = 0, coordinateNum = 1;

            const mainImage = document.getElementById('mainImage');

            data.rows.forEach((row) => {
                const imageItem = document.createElement('div');
                imageItem.classList.add('image-item');
                
                const img = document.createElement('img');
                img.src = `${row.clotheimage}`; //画像パス
                img.alt = `${row.coordinatename}_${coordinateNum}`;
                
                currentIndex += 1;
                coordinateNum += 1;
                imgArray.push(row.clotheimage);

                imageItem.appendChild(img);
                imageGallery.appendChild(imageItem);
            })

            //1枚目の画像を表示
            currentIndex = 0;
            mainImage.src = `${imgArray[currentIndex]}`;
            
            //クリックしたら画像の切り替え
            mainImage.addEventListener('click' , () => {
                currentIndex = (currentIndex + 1) % imgArray.length; //次の画像へ最後まで行ったら1枚目へ
                mainImage.src = `${imgArray[currentIndex]}`;
                mainImage.alt = imgArray[currentIndex];
            });

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
        const formdata = { coordinateId : imageId }; 
        
        const token = localStorage.getItem('token');

        fetch('/deleteCoordinate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formdata)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Bad response");
            }
            return response.json()
        })
        .then(data => {
            alert(`コーデを削除しました。`);
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