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

    const editButton = document.querySelector(".edit-btn");
    // ボタンクリック時の処理
    editButton.addEventListener("click", () => {
        // プロンプトでタグ名を入力
        const newTag = prompt("追加するタグを入力してください:");

        if (newTag) {
            // 新しいタグをliとして作成
            const newTagItem = document.createElement("li");
            newTagItem.className = "tag";
            newTagItem.textContent = `${newTag}`;
            // li要素をulに追加
            tagBox.appendChild(newTagItem);
        }
    });

    const deleteButton = document.querySelector(".delete-btn");
    // 削除ボタンをクリックしたときの処理
    deleteButton.addEventListener("click", () => {
        const delTag = prompt("削除したいタグを入力してください:");

        if (delTag) {
            // タグを全て取得
            const tags = tagBox.querySelectorAll("li");

            let found = false;
            tags.forEach((tag) => {
                if (tag.textContent === delTag) {
                    tag.remove(); // 一致したタグを削除
                    found = true;
                }
            });

            if (!found) {
                alert("指定されたタグが見つかりませんでした。");
            }
        }
    });
});

confBtn = document.getElementById('confirmButton');

confBtn.addEventListener('click', async () => {
    
    const items = document.getElementsByClassName('tag');
    const tags = Array.from(items).map(item => item.textContent).join(','); 

    const path = (JSON.parse(localStorage.getItem('responseData')).path).replace("public", "");

    const data = {
        imgPath: path,
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
