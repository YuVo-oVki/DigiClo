//ページをロードした時にURLパラメータからデータを取得
window.onload = function() {
    //パラメータ取得
    const params = new URLSearchParams(window.location.search);
    const coordinateName = params.get('coordinateName');//テキストデータを取得
    const selectImagePath = params.getAll('selectImagePath'); //複数の画像データを取得
    const selectImageId = params.getAll('selectImageId'); //複数のclotheIdを取得

    //コーディネート名を表示
    const nameElement = document.getElementById('coordinateName');
    nameElement.textContent = coordinateName || '未入力' ;

    //画像ギャラリーの要素を取得
    const imageGallery = document.querySelector('.image-gallery');

    //画像を動的に追加
    selectImagePath.forEach((imgRow) => {
        const imageItem = document.createElement('div');
        imageItem.classList.add('image-item');

        const img = document.createElement('img');
        img.src = `${imgRow}`; //画像パス
        img.alt = imgRow.replace("clothe", "image").replace(".png","");

        imageItem.appendChild(img);
        imageGallery.appendChild(imageItem);
    });

    let currentIndex = 0; //現在の画像インデックス
    const mainImage = document.getElementById('mainImage');

    //1枚目の画像を表示
    mainImage.src = `${selectImagePath[currentIndex]}`;
    alt = selectImagePath[currentIndex];

    //クリックしたら画像の切り替え
    mainImage.addEventListener('click' , () => {
        currentIndex = (currentIndex + 1) % selectImagePath.length; //次の画像へ最後まで行ったら1枚目へ
        mainImage.src = `${selectImagePath[currentIndex]}`;
        mainImage.alt = selectImagePath[currentIndex];
    });

    const confBtn = document.getElementsByClassName('confirmation-button')[0];

    confBtn.addEventListener('click', async () => {
    
        let formdata = [];
        selectImageId.forEach(id => {
            id = id.replace('clothe', '');
            formdata.push({
                clotheId: id,
                coordinateName: coordinateName
            });
        });

        const token = localStorage.getItem('token');

            await fetch('/registerCoordinate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formdata)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTPエラー! status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                console.log('サーバーからのレスポンス:', result);
                alert('登録が完了しました！');
                window.location.href = './logined.html';
            })
            // .catch(error => console.error('エラー:', error));
        // } catch (err) {
        //     console.error("エラーが発生しました:", err);
        // }
    });
};
