// 片岡優樹・酒井淳之介

console.clear();

document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const tag = urlParams.get('tag');

  if (tag) {
    try {

      const response = await fetch(`/search?tag=${encodeURIComponent(tag)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // トークンを必ず含める
        }
      });      
      const data = await response.json();

      const loginUser = document.getElementById('loginUser');
      loginUser.textContent = data.userName;

      // clothesデータを追加
      const filterableCards = document.getElementById('filterable-cards');
      
      // Clothesセクションのカードを追加
      data.clothes.forEach(cloth => {
        const card = document.createElement('div');
        card.classList.add('card', 'p-0');
        
        const img = document.createElement('img');
        img.src = cloth.clotheimage;
        img.alt = "img";
        img.onclick = function() {
          submitImage(cloth.clotheid, this);
        };
        
        card.appendChild(img);
        filterableCards.appendChild(card);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    };

    function submitImage(id) {
      window.location.href = `./clothe_info.html?imageId=${id}`;
    }
  }
});
