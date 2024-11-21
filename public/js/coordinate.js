//ボタンをクリックしたら
const submitButton = document.getElementById('submitButton');
submitButton.addEventListener('click', () => {
    const selectImages = []; //選択された画像を格納

   //テキストボックスからテキスト情報の取得
   const coordinateName = document.getElementById('coordinateName').value
    

    //チェックされた画像の値(value)を取得
    document.querySelectorAll('input[name="selectImages"]:checked').forEach((checkbox) => {
        selectImages.push(checkbox.value);
    });

    if (selectImages.length === 0) {
        alert('画像を選択してください。');
        return;
    }

    if (!coordinateName.trim()) {
        alert('コーディネート名を入力してください');
        return;
    }

    //選択された画像を表示（デバック用）
    // console.log('選択された画像：', selectImages);

    //フォームを作成してデータ送信
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = 'coordinate_cfm.html';
    

    //選択された画像をhidden inputとして追加
    selectImages.forEach((image) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'selectImages';
        input.value = image;
        form.appendChild(input);
    });

    //コーディネート名をhidden inputとして追加
    const nameInput = document.createElement('input');
    nameInput.type = 'hidden';
    nameInput.name = 'coordinateName';
    nameInput.value = coordinateName;
    form.appendChild(nameInput);


    //フォームをドキュメントに追加して送信
    document.body.appendChild(form);
    form.submit();
});