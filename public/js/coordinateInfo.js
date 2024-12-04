 // URLのクエリパラメータからimageIdを取得
 const urlParams = new URLSearchParams(window.location.search);
 const imageId = urlParams.get('imageId');
 const imageContainer = document.getElementById('imageContainer');


 if (imageId) {
 const img = document.createElement('img');
 img.src = `../images/${imageId}.jpg`;  // パスにIDを使って画像を指定
 img.alt = `Image${imageId}`;
 img.width = 300;
 imageContainer.appendChild(img);
 } else {
 imageContainer.innerText = '画像が選択されていません。';
 }
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
         alert(`コーデを削除しました。`);
         // 実際の削除処理（サーバー通信など）
         window.location.href = './logined.html'; // 削除後に戻る
     });

     // 「いいえ」を押したとき
     document.getElementById('confirmNo').addEventListener('click', () => {
         confirmDialog.remove(); // ダイアログを閉じる
     });
   }