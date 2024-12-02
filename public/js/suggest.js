/// 位置情報を取得
function getWeather() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const latitude = position.coords.latitude; // 緯度
        const longitude = position.coords.longitude; // 経度
  
        console.log(`取得した緯度: ${latitude}, 経度: ${longitude}`);
  
        // サーバーに天気情報をリクエスト
        const response = await fetch('/get-weather', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ latitude, longitude })
        });
  
        if (response.ok) {
          const data = await response.json();
  
          // 天気情報を表示
          let weatherHtml = `<h2>天気予報</h2>`;
            
          weatherHtml += `<div><p>○${data.date}の天気情報</p>`
          weatherHtml += `<p>天気: ${data.weather}</p>`
          weatherHtml += `<p>気温: ${data.temp}°C</p>`
          weatherHtml += `<p>湿度: ${data.humid}</p>`
          weatherHtml += `<p>風速: ${data.wind}</p><br><div>`
        //   Object.keys(data).map(forecast => {
        // });
  
          // 必要ならHTMLに表示
          document.getElementById("weather").innerHTML = weatherHtml;
        } else {
          document.getElementById("weather").innerHTML = '天気情報の取得に失敗しました。';
        }
      }, (error) => {
        console.error("位置情報の取得に失敗しました:", error);
      });
    } else {
      console.error("このブラウザでは位置情報が利用できません。");
    }
  }
  
// ページ読み込み時に天気を取得
window.onload = getWeather;
  