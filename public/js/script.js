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