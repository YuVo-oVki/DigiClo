// 片岡優樹・酒井淳之介

console.clear();

document.addEventListener("DOMContentLoaded", async function () {

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
      img.src = coord.clotheimage;
      img.alt = "img";
      img.onclick = function() {
        submitImage(coord.coordinateid, this);
      };

      const bg = document.createElement('div');
      bg.classList.add('card-body');

      const title = document.createElement('h6');
      title.classList.add('card-title');
      title.textContent = coord.coordinatename;
      
      card.appendChild(img);
      card.appendChild(bg);
      bg.appendChild(title);
      filterableCards.appendChild(card);
    });
    
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  const selectElement = document.getElementById("change"); // セレクトボックス
  const cards = document.getElementsByClassName("card p-0"); // "card"クラスの要素を取得
  let selectedValue = "";

  // セレクトボックスが変更されたときのイベントリスナー
  selectElement.addEventListener("change", function () {
      selectedValue = this.value; // 選択された値

      // "card"クラスの要素をループして表示・非表示を切り替える
      for (let card of cards) { // 動的リストなので、`for...of`でループ
          if (card.getAttribute("kind") === selectedValue) {
              card.style.display = "flex"; // 表示（元のスタイルに合わせる）
          } else {
              card.style.display = "none"; // 非表示
          }
      }

  });

  function submitImage(id) {
    if (selectedValue == "Clothe") {
      window.location.href = `./clothe_info.html?image=${id}`;
    } else if (selectedValue == "Coordinate")
      window.location.href = `./coordinate_info.html?image=${id}`;
    }
    
    
  document.getElementById('searchButton').addEventListener('click', async () => {
    const word = encodeURIComponent(document.getElementById('tagInput').value);
    window.location.href = `/search_tag.html?tag=${word}`;
  });
  // ページ読み込み時の初期表示
  selectElement.dispatchEvent(new Event("change"));
});
