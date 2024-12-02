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
        li.className = "tag";
        li.textContent = `${label}`;
        tagBox.appendChild(li);
    });

});

confBtn = document.getElementById('confirmButton');

confBtn.addEventListener('click', async () => {
    
    const items = document.getElementsByClassName('tag');
    const tags = Array.from(items).map(item => item.textContent).join(','); 

    const data = {
        imgPath: JSON.parse(localStorage.getItem('responseData')).path,
        tags: tags
    }
    
    fetch('/registerClothe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // JSONとして送信
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Request failed');
        }
        return response.json();
    })
    .then(data => {
        alert('登録が完了しました！');
        window.location.href = "logined.html"; // リダイレクト
    })
    .catch(error => {
        alert("エラーが発生しました: " + error.message); // エラーメッセージ
    });
    
});
