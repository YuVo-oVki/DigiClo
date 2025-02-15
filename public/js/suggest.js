async function fetchOutfit() {
    try {
      //ボタンから性別の取得
      const token = localStorage.getItem('token');
      const gender = document.querySelector('input[name="gender"]:checked').value;

      //サーバーのエンドポイントにリクエスト
      const response = await fetch(`/get-outfit?gender=${gender}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      const data = await response.json();

      //天気情報と気温の表示
      document.getElementById('weather').innerHTML = `
          <p>天気: ${data.weather}</p>
          <p>気温: ${data.temp}°C</p>
          <p>キーワード: ${data.keyword}</p>
      `;

      //画像を表示
      const imagesContainer = document.getElementById('image');
      imagesContainer.innerHTML = ''; //既存の内容をクリア
      data.image.forEach((imgs, index) => {
        const img = document.createElement('img');
        img.src = imgs;
        img.alt = `服装の提案${index + 1}`;
        img.style.margin = '10px';
        img.style.maxWidth = '200px'
        imagesContainer.appendChild(img);
      });
    } catch (error){
      //エラー
      document.getElementById('error').innerText = "画像の取得に失敗しました。しばらく経ってから再度お試しください。";
      console.error('Error',error);
    }
  }
  
  //生成ボタンをクリックにfechOutfitを実行する
  document.getElementById('generate-button').addEventListener('click', fetchOutfit);