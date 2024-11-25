// 片岡優樹(DB構築も)・酒井淳之介

// インポート箇所 //
const os = require('os');
const express = require('express'); //install
const multer = require('multer'); //install
const Clarifai = require('clarifai'); //clarifai
const path = require('path');
const fs = require('fs');
const axios = require('axios'); //install
const bcrypt = require('bcrypt');
const upload = multer({ dest: 'uploads/' });

//静的ファイルの提供設定
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const { Client } = require('pg');

// 静的ファイルの提供設定
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQLデータベースへの接続情報を設定
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});

// データベースに接続
client.connect()
  .then(() => console.log('PostgreSQLに接続しました'))
  .catch((err) => console.error('PostgreSQL接続エラー:', err));

// ユーザー登録エンドポイント
app.post('/add-user', async (req, res) => {
  const { userId, userName, email, password } = req.body;

  try {
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // データベースにユーザーを挿入
    const insertQuery = `
      INSERT INTO "users" (UserID, UserName, Email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING UserID;
    `;
    const result = await client.query(insertQuery, [userId, userName, email, hashedPassword]);

    res.status(201).json({ message: `ユーザー登録に成功しました: ${result.rows[0].userid}` });
  } catch (error) {
    console.error('ユーザー登録エラー:', error);

    let userIDQuery = `SELECT EXISTS (SELECT 1 FROM users WHERE UserID = $1)`;
    let userIdResult = await client.query(userIDQuery, [userId]);
    let emailQuery = `SELECT EXISTS (SELECT 1 FROM users WHERE Email = $1)`;
    let emailResult = await client.query(emailQuery, [email]);

    if (userIdResult.rows[0].exists) {
      res.status(500).json({ error: 'IDが使われています' });
    } else if (emailResult.rows[0].exists) {
      res.status(500).json({ error: 'Emailが使われています' });
    } else {
      res.status(500).json({ error: 'ユーザー登録に失敗しました' });
    }
  }
});

// ログインエンドポイント
app.post('/login', async (req, res) => {
  const { userId, password } = req.body;

  try {
    const selectQuery = `SELECT * FROM "users" WHERE UserID = $1`;
    const result = await client.query(selectQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'ユーザーIDが見つかりません' });
    }

    const user = result.rows[0];

    // パスワードの照合
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'パスワードが間違っています' });
    }

    // ログイン成功時のレスポンス
    res.json({ message: 'ログイン成功', userName: user.username });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ error: 'ログイン中にエラーが発生しました' });
  }
});

app.post('/selectImage', (req, res) => {
  const imageId = req.body.imageId;
  const kind = req.body.kind;
  if (kind === "Clothe") {
      res.redirect(`/clothe_info.html?imageId=${imageId}`);
  } else if (kind === "Coordinate") {
      res.redirect(`/coordinate_info.html?imageId=${imageId}`);
  } else {
      res.status(400).send('Invalid kind specified.');
  }
});

// 画像アップロードエンドポイント
app.post('/upload', uploadColor.single('image'), async (req, res) => {
  try {
    // アップロードされた画像ファイルのパス
    const filePath = path.join(__dirname, req.file.path);
    //画像の背景をRemove.bgで削除
    const noBgImagePath = await removeBackground(filePath);

    // 画像ファイルをBase64に変換
    const imageBuffer = fs.readFileSync(noBgImagePath);
    const base64Image = imageBuffer.toString('base64');

    console.log(base64Image);

    // Clarifaiのモデルに画像を送信して解析
    const response = await clarifaiApp.models.predict('e0be3b9d6a454f0493ac3a30784001ff', { base64: base64Image });
    
    //分析結果から信頼度を0.8以上のラベルを取得
    const concepts = response.outputs[0].data.concepts;

    // 分析結果をクライアントに返す
    //ラベルをフィルタリングして信頼度の高いものを選択
    const filteredLabels = concepts.filter(concept => concept.value > 0.8);
    res.json({
      labels: filteredLabels.map(concept => concept.name) // ラベルのリストを返す
    });
    console.log('分類結果を出しました')
  } catch (error) {
    console.error('画像分類中にエラーが発生しました:', error);
    res.status(500).json({ error: '画像分類中にエラーが発生しました。' });
  }
});

//画像の背景を削除する関数
async function removeBackground(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    console.log(imageData);

    const response = await axios({
      method: 'post',
      url: 'https://api.remove.bg/v1.0/removebg',
      headers: {
        'X-Api-Key': REMOVE_BG_API_KEY, // APIキーをここで設定
      },
      data: {
        image_file_b64: imageData.toString('base64'), // Base64エンコードした画像データ
      },
      responseType: 'arraybuffer' // バイナリデータとして受信
    });

    console.log(response);
    
    // レスポンスのステータスコードを確認
     if (response.status !== 200) {
      throw new Error(`背景除去APIが失敗しました。ステータスコード: ${response.status}`);
    }
   
    //背景削除済みの画像データの保存
    const outputPath = path.join(__dirname, 'images/no-bg-image.png');
    fs.writeFileSync(outputPath, response.data);

    return outputPath; //背景除去した画像のパスを返す
  } catch (error){
    const errorMessage = error.response ? error.response.data : error.message;
    console.error('Remove.bg APIのエラー:', errorMessage);
    throw new Error('背景除去に失敗しました');
  }
}

// Clarifai APIクライアントの初期化
const clarifaiApp = new Clarifai.App({
  apiKey: 'ceedd263955d4bcfa6f7ae540f1f4f25' // ここに取得したAPIキーを入力
});

// サーバー側でのタグエンドポイント設定
app.post('/tag', async (req, res) => {
  try {
      const { image } = req.body;
      if (!image) {
          return res.status(400).json({ error: '画像データが提供されていません' });
      }

      // 画像解析処理（背景削除、Clarifai API、色認識など）
      const noBgImagePath = await removeBackground(image);
      const base64Image = fs.readFileSync(noBgImagePath).toString('base64');

      // Clarifai APIを使用してラベルを取得
      const clarifaiResponse = await clarifaiApp.models.predict('e0be3b9d6a454f0493ac3a30784001ff', { base64: base64Image });
      const tags = clarifaiResponse.outputs[0].data.concepts.filter(c => c.value > 0.8).map(c => c.name);

      // 色認識処理
      const colorsResponse = await colorRecognition(noBgImagePath);
      const colors = colorsResponse.colors.map(c => c.w3c.name);

      // クライアントに結果を返す
      res.json({ labels: tags, colors });
  } catch (error) {
      console.error('サーバーエラー:', error);
      res.status(500).json({ error: '画像解析中にエラーが発生しました' });
  }
});

// // /color-recognitionエンドポイントで色認識を実行
// app.get('/color-recognition', (req, res) => {
//   // 画像をバイナリデータとして読み込む
//   fs.readFile(IMAGE_PATH, (err, imageBytes) => {
//     if (err) {
//       console.error('Failed to read image file:', err);
//       return res.status(500).send({ error: 'Failed to read image file.' });
//     }

//     // Clarifai APIを呼び出す
//     stub.PostModelOutputs(
//       {
//         user_app_id: {
//           "user_id": USER_ID,
//           "app_id": APP_ID
//         },
//         model_id: MODEL_ID,
//         version_id: MODEL_VERSION_ID,
//         inputs: [
//           { data: { image: { base64: imageBytes.toString('base64') } } } // バイナリデータをBase64エンコード
//         ]
//       },
//       metadata,
//       (err, response) => {
//         if (err) {
//           console.error('Error calling Clarifai API:', err);
//           return res.status(500).send({ error: 'Failed to process image: ' + err.message });
//         }

//         if (response.status.code !== 10000) {
//           console.error('Clarifai API error:', response.status.description);
//           return res.status(500).send({ error: 'Post model outputs failed: ' + response.status.description });
//         }

//         // 結果を処理してレスポンスに送信
//         try {
//           const output = response.outputs[0];
//           const colorArray = output.data.colors;
//           const colors = colorArray.map(color => color.w3c);

//           res.json(colors); // クライアントに結果を送信
//         } catch (processError) {
//           console.error('Error processing response:', processError);
//           res.status(500).send({ error: 'Error processing response.' });
//         }
//       }
//     );
//   });
// });

// 緯度と経度を受け取るルート
app.post('/get-weather', (req, res) => {
  // クライアントの接続を処理
  io.on('connection', (socket) => {
    console.log('A user connected');

    // クライアントが位置情報を送信してきたときの処理
    socket.on('location-update', (data) => {
        const clientId = socket.id;
        clients[clientId] = { lat: data.latitude, lon: data.longitude };
    });

    // クライアントの切断を処理
    socket.on('disconnect', () => {
        console.log('User disconnected');
        delete clients[socket.id]; // 切断したクライアントのデータを削除
    });
  });

  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "緯度または経度が不足しています。" });
  }

  // 3h ver.
  const url3h = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=ja`;
  // 1h ver.
  const url1h = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=ja`;

  // 天d気データの取得
  https.get(url1h, (response) => {
    let data = '';
  
    // データを受信
    response.on('data', (chunk) => {
      data += chunk;
    });
  
    // データ受信完了後の処理
    response.on('end', () => {
      const forecastData = JSON.parse(data); // 全データjson形式で取得
      console.log(forecastData.current);
      // console.log(forecastData.hourly);

      // 今のデータを取得 //
      const crnt = forecastData.current;
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
      const currentData = JSON.parse(`{ 
                              "date":"${dateStr}",
                              "weather":"${crnt.weather[0].description}",
                              "temp":"${crnt.temp}",
                              "humid":"${crnt.humidity}",
                              "wind":"${crnt.wind_speed}",
                              "hour":"${date.getHours()}"
                        }`);
      console.log(currentData);
      // / 取得 //
      
      // 24時間先まで(分未満切り捨て)のデータを取得
      // const hour = 24; 
      // for (i = 0; i < hour.length; i++) {
      //   JSON.parse(`
      //     { "hour":"${// ここに時間を記入 //}"
      //       "weather":"${crnt.weather[0].description}",
      //       "temp":"${crnt.temp}",
      //       "humid":"${crnt.humidity}",
      //       "wind":"${crnt.wind_speed}"
      //     }
      //   `);
      // }

      // クライアントに天気予報データを送信
      res.json(currentData);
    });
  }).on('error', (err) => {
    console.error(`エラー: ${err.message}`);
    res.status(500).json({ error: "天気情報の取得に失敗しました。" });
  });
});

server.listen(port, host, () => {
    console.log(`HTTPS server running at https://${host}:${port}`);
});

