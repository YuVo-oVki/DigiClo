const menuButton = document.getElementById('menuButton');
const drawerMenu = document.getElementById('drawerMenu');
const drawerOverlay = document.getElementById('drawerOverlay');
 
// メニューを開閉するイベントリスナー
menuButton.addEventListener('click', () => {
    const isOpen = drawerMenu.classList.toggle('open');
    drawerOverlay.classList.toggle('active');
    menuButton.classList.toggle('active', isOpen); // ボタンの状態を切り替え
});
 
// オーバーレイクリックでメニューを閉じる
drawerOverlay.addEventListener('click', () => {
    drawerMenu.classList.remove('open');
    drawerOverlay.classList.remove('active');
    menuButton.classList.remove('active'); // ボタンの状態をリセット
});