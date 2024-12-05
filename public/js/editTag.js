document.addEventListener('DOMContentLoaded', async () => {

    const clotheid = sessionStorage.getItem('id');;
    const formdata = { clotheId : clotheid };

    fetch('/getClothe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formdata)
    })
    .then(response => response.json()) // レスポンスをJSON形式に変換
    .then(data => {
        const tagArray = data.tags.split(',');
        tagArray.forEach(label => {
        const li = document.createElement('li');
        li.className = "tag";
        li.textContent = `${label}`;
        tagBox.appendChild(li);
        })
    })
    .catch(error => console.error('Error:', error));
    });
    // タグをHTMLに表示
    const tagBox = document.querySelector('.tag-box ul');    
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
    
    confBtn = document.getElementById('confirmButton');
    
    confBtn.addEventListener('click', async () => {
        
        const items = document.getElementsByClassName('tag');
        const clotheId = sessionStorage.getItem('id');
    const tags = Array.from(items).map(item => item.textContent).join(','); 

    const data = {
        clotheid: clotheId,
        tags: tags
    }
    
    fetch('/editTag', {
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
        alert('変更処理が完了しました！');
        window.location.href = "logined.html"; // リダイレクト
    })
    // .catch(error => {
        //     alert("エラーが発生しました: " + error.message); // エラーメッセージ
        // });
        
});  