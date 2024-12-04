//ページをロードした時にURLパラメータからデータを取得
window.onload = function() {
    //パラメータ取得
    const params = new URLSearchParams(window.location.search);
    const coordinateName = params.get('coordinateName');//テキストデータを取得
    const selectImages = params.getAll('selectImages'); //複数の画像データを取得

    //コーディネート名を表示
    const nameElement = document.getElementById('coordinateName');
    nameElement.textContent = coordinateName || '未入力' ;

    //画像ギャラリーの要素を取得
    const imageGallery = document.querySelector('.image-gallery');

    //画像を動的に追加
    selectImages.forEach((imageName) => {

        const imageItem = document.createElement('div');
        imageItem.classList.add('image-item');

        const img = document.createElement('img');
        img.src = `./images/clothes/${imageName}`; //画像パス
        img.alt = imageName.replace("clothe", "image").replace(".png","");

      imageItem.appendChild(img);
      imageGallery.appendChild(imageItem);
    });

    let currentIndex = 0; //現在の画像インデックス
    const mainImage = document.getElementById('mainImage');

    //1枚目の画像を表示
    mainImage.src = `./images/clothes/${selectImages[currentIndex]}`;
    alt = selectImages[currentIndex];

    //クリックしたら画像の切り替え
    mainImage.addEventListener('click' , () => {
        currentIndex = (currentIndex + 1) % selectImages.length; //次の画像へ最後まで行ったら1枚目へ
        mainImage.src = `./images/Clothes/${selectImages[currentIndex]}`;
        mainImage.alt = selectImages[currentIndex];
    });

    const confBtn = document.getElementsByClassName('confirmation-button')[0];
    
    confBtn.addEventListener('click', async () => {

        // try {
            let formdata = []; // 配列として初期化

            for (let i = 0; i < selectImages.length; i++) {
                let id = selectImages[i].replace("clothe", "").replace(".png", ""); // clotheと.pngを除去
                formdata.push({
                    userId: 'MCGDev',             // ユーザーID
                    clotheId: id,  // 数値として扱う
                    coordinateName: coordinateName // コーディネート名
                });
            }

            await fetch('/registerCoordinate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
