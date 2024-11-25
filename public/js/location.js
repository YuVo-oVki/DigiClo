const map = L.map('map').setView([35.6895, 139.6917], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // 地図クリックイベントで緯度経度を取得し、サーバーに送信
        map.on('click', (e) => {
            const data = { lat: e.latlng.lat, lng: e.latlng.lng };

            // Node.jsサーバーにPOSTリクエストを送信
            fetch('/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            .then((response) => response.text())
            .then((message) => console.log(message))
            .catch((error) => console.error('エラー:', error));
        });