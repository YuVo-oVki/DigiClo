// サーバーから色認識の結果を取得
fetch('/color-recognition')
.then(response => response.json())
.then(data => {
    const colorsList = document.getElementById('colors-list');
    
    // 配列の各色情報にアクセスしてリストアイテムを作成
    data.forEach(color => {
        const listItem = document.createElement('li');
        
        // color.name と color.hex をリストアイテムに表示
        listItem.textContent = `Color: ${color.name}, Hex: ${color.hex}`;
        colorsList.appendChild(listItem);
    });
})
.catch(error => {
    console.error('Error fetching color data:', error);
});