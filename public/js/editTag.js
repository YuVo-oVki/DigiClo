document.addEventListener('DOMContentLoaded', async () => {

    const token = localStorage.getItem('token'); 
    const clotheid = sessionStorage.getItem('id');
    const formdata = { clotheId : clotheid };

    await fetch('/getClothe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
        let newTag = prompt("追加するタグを入力してください:");

        if (newTag && newTag.trim()) {
            const tags = tagBox.querySelectorAll("li");
            let found = false;

            newTag = newTag.trim();
            tags.forEach((tag) => {
                if (tag.textContent === newTag) {
                    found = true;
                }
            });

            if (found != true) {    
                const newTagItem = document.createElement("li");
                newTagItem.className = "tag";
                newTagItem.textContent = `${newTag}`;
            
                // li要素をulに追加
                tagBox.appendChild(newTagItem);
            } else {
                alert("既に登録されています");
            }
        }
    });
    
    const deleteButton = document.querySelector(".delete-btn");
    // 削除ボタンをクリックしたときの処理
    deleteButton.addEventListener("click", () => {
        const delTag = prompt("削除したいタグを入力してください:");
        
        if (delTag && delTag.trim()) {
            // タグを全て取得
            const tags = tagBox.querySelectorAll("li");
            
            let found = false;
            tags.forEach((tag) => {
                if (tag.textContent === delTag.trim()) {
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

        if (items.length != 0) {
            const clotheId = sessionStorage.getItem('id');
            const tags = Array.from(items).map(item => item.textContent).join(','); 

            const data = {
                clotheid: clotheId,
                tags: tags
            }
        
            const token = localStorage.getItem('token'); 
        
            fetch('/editTag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
            // .catch(error => {
                //     alert("エラーが発生しました: " + error.message); // エラーメッセージ
                // });
        } else {
            alert("タグを最低1つ追加してください");
        }
});  