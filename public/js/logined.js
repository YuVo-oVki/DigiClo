console.clear();

document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem('token');  // トークン取得

    if (!token) {
        console.error('トークンがありません。');
        return;
    }

    try {
        // サーバーからデータを取得
        const response = await fetch('/logined', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.clothes && !data.coordinates) {
            console.error('データがありません');
            return;
        }
        
        renderClothes(data.clothes);
        renderCoordinates(data.coordinates);
        
        const loginUser = document.getElementById("loginUser");
        loginUser.textContent = data.userName;
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    // セレクトボックスの変更イベント
    const selectElement = document.getElementById("change");
    selectElement.addEventListener("change", function () {
        const selectedValue = this.value;
        const cards = document.getElementsByClassName("card");
        for (let card of cards) {
            card.style.display = card.getAttribute("kind") === selectedValue ? "flex" : "none";
        }
    });


    // ページ読み込み時に初期化
    selectElement.dispatchEvent(new Event("change"));

    // 検索ボタンのクリックイベント
    document.getElementById('searchButton').addEventListener('click', async () => {
        const word = encodeURIComponent(document.getElementById('tagInput').value);

        fetch(`/search_tag.html?tag=${word}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Search Results:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });

        window.location.href = `/search_tag.html?tag=${word}`;
    });

    // メニュー操作
    const menuButton = document.getElementById('menuButton');
    const drawerMenu = document.getElementById('drawerMenu');
    const drawerOverlay = document.getElementById('drawerOverlay');

    menuButton.addEventListener('click', () => {
        const isOpen = drawerMenu.classList.toggle('open');
        drawerOverlay.classList.toggle('active');
        menuButton.classList.toggle('active', isOpen);
    });

    drawerOverlay.addEventListener('click', () => {
        drawerMenu.classList.remove('open');
        drawerOverlay.classList.remove('active');
        menuButton.classList.remove('active');
    });
});

// カードのレンダリング
function renderClothes(clothes) {
    const filterableCards = document.getElementById('filterable-cards');
    clothes.forEach(cloth => {
        const card = createCard('Clothe', cloth.clotheimage, () => goToClotheInfo(cloth.clotheid));
        filterableCards.appendChild(card);
    });
}

function renderCoordinates(coordinates) {
    const filterableCards = document.getElementById('filterable-cards');
    coordinates.forEach(coord => {
        const card = createCard('Coordinate', coord.clotheimage, () => goToCoordinateInfo(coord.coordinateid), coord.coordinatename);
        filterableCards.appendChild(card);
    });
}

function createCard(kind, imageSrc, onClick, title = null) {
    const card = document.createElement('div');
    card.classList.add('card', 'p-0');
    card.setAttribute('kind', kind);

    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = "img";
    img.onclick = onClick;

    card.appendChild(img);

    if (title) {
        const bg = document.createElement('div');
        bg.classList.add('card-body');

        const titleElem = document.createElement('h6');
        titleElem.classList.add('card-title');
        titleElem.textContent = title;

        bg.appendChild(titleElem);
        card.appendChild(bg);
    }

    return card;
}

function goToClotheInfo(clotheId) {
    sessionStorage.setItem('id', clotheId);
    window.location.href = `./clothe_info.html?imageId=${clotheId}`;
}

function goToCoordinateInfo(coordinateId) {
    sessionStorage.setItem('id', coordinateId);
    window.location.href = `./coordinate_info.html?imageId=${coordinateId}`;
}
