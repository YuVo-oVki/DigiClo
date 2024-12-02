// 片岡優樹・酒井淳之介

console.clear();

document.addEventListener("DOMContentLoaded", function() {
  const selectElement = document.getElementById("change");
  const cards = document.querySelectorAll(".card");

  // select が変更されたときのイベントリスナー
  selectElement.addEventListener("change", function() {
      const selectedValue = this.value; // 選択された値

      // カードごとにループして表示・非表示を切り替え
      cards.forEach(card => {
          // data-name 属性の値と selectedValue が一致するか確認
          if (card.getAttribute("kind") === selectedValue) {
              card.style.display = "block";
          } else {
              card.style.display = "none";
          }
      });
  });

  // ページ読み込み時の初期表示
  selectElement.dispatchEvent(new Event("change"));
});

window.onload = async function() {
    try {
      // サーバーからデータを取得
      const response = await fetch('/logined');
      const data = await response.json();

      // clothesデータを追加
      const filterableCards = document.getElementById('filterable-cards');
      
      // Clothesセクションのカードを追加
      data.clothes.forEach(cloth => {
        const card = document.createElement('div');
        card.classList.add('card', 'p-0');
        card.setAttribute('kind', 'Clothe');
        
        const img = document.createElement('img');
        img.src = cloth.clotheimage;
        img.alt = "img";
        img.onclick = function() {
          submitImage(cloth.clotheid, this);
        };
        
        card.appendChild(img);
        filterableCards.appendChild(card);
      });

      // Coordinateセクションのカードを追加
      data.coordinates.forEach(coord => {
        const card = document.createElement('div');
        card.classList.add('card', 'p-0');
        card.setAttribute('kind', 'Coordinate');
        
        const img = document.createElement('img');
        img.src = coord.coordinateimage;
        img.alt = "img";
        img.onclick = function() {
          submitImage(coord.coordinateid, this);
        };
        
        card.appendChild(img);
        filterableCards.appendChild(card);
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // 画像がクリックされたときの処理
  function submitImage(id, element) {
    console.log('Image clicked:', id);
    // 他の処理（例えば、選択した画像を表示するなど）を追加
  }