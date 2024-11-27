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
const https = require('https');
const socketIo = require('socket.io');
const cors = require('cors');
const { ClarifaiStub, grpc } = require('clarifai-nodejs-grpc');
const { Client } = require('pg');
const FormData = require('form-data');
const upload = multer({ dest: path.join(__dirname, 'uploads')});
require('dotenv').config();
// / インポート箇所 //

// IPv4アドレスの取得作業 //
function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // デフォルトはローカルホスト
}
const host = getIPAddress();
// / IPv4アドレスの取得作業 //

// 変数設定 //
const app = express();
const port = 3000;
const clients = {}; // 接続したクライアントのデータを格納（IPアドレスをキーに）
const corsOptions = {
  origin: `https://${host}:${port}`, // ここに許可するオリジンを指定
  methods: ['GET', 'POST'],       // 許可するHTTPメソッドを指定
};
// / 変数設定 //

// app.use //
app.use(cors(corsOptions));
// 静的ファイルの提供設定
app.use(express.json( { limit: '50mb' }));
app.use(express.urlencoded({ limit : '50mb', extended: true }));
// ミドルウェア設定 //
app.use(express.static(path.join(__dirname, 'public'))); // 静的ファイル（index.html）を提供

// / app.use //

// HTTPS設定 //
const private = 'C:/ssl/private-key.pem';
const cert = 'C:/ssl/cert.pem';
const privateKey = fs.readFileSync(private, 'utf8');
const certificate = fs.readFileSync(cert, 'utf8');
const credentials = { key: privateKey, cert: certificate };
  // HTTPSサーバーを作成 //
  const server = https.createServer(credentials, app);
  const io = socketIo(server);
  // / HTTPサーバー作成 //
// / HTTPS設定 //

// PostgreSQLデータベースへの接続情報を設定
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});

// API Key //
const REMOVE_BG_API_KEY = process.env.RB_KEY; // Remove.bg API
// Clarifai API Key //
const PAT = process.env.PAT;  // あなたのPATを使用してください
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'color-recognition';
const MODEL_VERSION_ID = 'dd9458324b4b45c2be1a7ba84d27cd04';
const IMAGE_PATH = './public/images/image0.jpg';  // 画像をセレクトして入れる予定
const API_KEY = process.env.OWM_KEY;   // OpenWeatherMap API
// Clarifai apparel-detection
const clarifaiApp = new Clarifai.App({
  apiKey: process.env.CA_CLIENT // Clarifai apparel-detection API
});
// /Clarifai API //
// / API //

const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set('authorization', 'Key ' + PAT);

// 色識別 & 画像保存 //
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/'); // アップロード先ディレクトリを 'images/' に変更
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ファイル名にタイムスタンプを追加
  }
});
const uploadColor = multer({ storage: storage }); // 色識別
// / 画像保存 //

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
app.post('/upload', upload.single('image'), async (req, res) => {
  
  try {
    if (req.file) {
      // アップロードされたファイル情報
      console.log('File uploaded:', req.file);
      res.send('File uploaded successfully');
    } else {
      res.status(400).send('No file uploaded or file is too large');
    }

    // アップロードされた画像ファイルのパス
    const filePath = req.file.path;
    //画像の背景をRemove.bgで削除
    const noBgImagePath = await removeBackground(filePath);

    
    console.log(noBgImagePath);
    // 画像ファイルをBase64に変換
    const imageBuffer = fs.readFileSync(noBgImagePath);
    const base64Image = imageBuffer.toString('base64');

    // Clarifaiのモデルに画像を送信して解析
    const response = await clarifaiApp.models.predict('e0be3b9d6a454f0493ac3a30784001ff', { base64: base64Image });
    
    console.log(response);

    if (!response.outputs || !response.outputs[0].data) {
      throw new Error('Clarifai APIから期待したレスポンスがありません');
    }

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

     // レスポンスのステータスコードを確認
     if (response.status !== 200) {
      throw new Error(`背景除去APIが失敗しました。ステータスコード: ${response.status}`);
    }
   
    const num = 0;
    //背景削除済みの画像データの保存
    const outputPath = path.join(__dirname, `images/clothes/clothe${num}.png`);
    fs.writeFileSync(outputPath, response.data);

    return outputPath; //背景除去した画像のパスを返す
  } catch (error){
    const errorMessage = error.response ? error.response.data : error.message;
    console.error('Remove.bg APIのエラー:', errorMessage);
    throw new Error('背景除去に失敗しました');
  }
}

app.post('/tag', upload.single('image'), async (req, res) => {
  
  try {
    if (req.file) {
      // アップロードされたファイル情報
      console.log('File uploaded:', req.file);
      res.send('File uploaded successfully');
    } else {
      res.status(400).send('No file uploaded or file is too large');
    }

    // アップロードされた画像ファイルのパス
    const filePath = req.file.path;
    //画像の背景をRemove.bgで削除
    const noBgImagePath = await removeBackground(filePath);

    
    console.log(noBgImagePath);
    // 画像ファイルをBase64に変換
    const imageBuffer = fs.readFileSync(noBgImagePath);
    const base64Image = imageBuffer.toString('base64');

    // Clarifaiのモデルに画像を送信して解析
    const response = await clarifaiApp.models.predict('e0be3b9d6a454f0493ac3a30784001ff', { base64: base64Image });
    
    console.log(response);

    if (!response.outputs || !response.outputs[0].data) {
      throw new Error('Clarifai APIから期待したレスポンスがありません');
    }

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

