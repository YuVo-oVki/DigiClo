// 片岡優樹(DB構築も)・酒井淳之介

// インポート箇所 //
const os = require('os');
const express = require('express'); //install
const jwt = require('jsonwebtoken'); // セッション機能で使う予定
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
const JWT_KEY = process.env.JWT_KEY;
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

// Auth設定 //
// JWTを検証するミドルウェア
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];  // "Bearer <token>" の形式
  if (token) {
    jwt.verify(token, JWT_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);  // トークンが無効の場合
      }
      req.user = user;  // トークン内のデータを req.user に設定
      next();  // 次のミドルウェアへ進む
    });
  } else {
    res.sendStatus(401);  // トークンがない場合
  }
};

module.exports = verifyToken;
// / 設定 //

// PostgreSQLデータベースへの接続情報を設定
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});

// API Key //
const RB_API_KEY = process.env.RB_KEY; // Remove.bg API
// Clarifai API Key //
const CR_PAT = process.env.CR_PAT;
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'color-recognition';
const MODEL_VERSION_ID = 'dd9458324b4b45c2be1a7ba84d27cd04';
const clarifaiApp = new Clarifai.App({
  apiKey: process.env.CA_CLIENT // Clarifai apparel-detection API
});
// /Clarifai API //
const PAT = process.env.PAT;  // OWM PAT
const API_KEY = process.env.OWM_KEY;   // OpenWeatherMap API
// / API //

const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set('authorization', 'Key ' + CR_PAT);

// データベースに接続
client.connect()
  .then(() => console.log('PostgreSQLに接続しました'))
  .catch((err) => console.error('PostgreSQL接続エラー:', err));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
  

// ユーザー登録エンドポイント
app.post('/add-user', async (req, res) => {
  const { userId, userName, email, password } = req.body;

  try {
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    let userIDQuery = `SELECT EXISTS (SELECT 1 FROM users WHERE UserID = $1)`;
    let userIdResult = await client.query(userIDQuery, [userId]);
    let emailQuery = `SELECT EXISTS (SELECT 1 FROM users WHERE Email = $1)`;
    let emailResult = await client.query(emailQuery, [email]);

    if (userIdResult.rows[0].exists) {
      return res.status(400).json({ error: 'IDが使われています' });
    } else if (emailResult.rows[0].exists) {
      return res.status(400).json({ error: 'Emailが使われています' });
    } else {
      // データベースにユーザーを挿入
      const insertQuery = `
        INSERT INTO users (UserID, UserName, Email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING UserID;
      `;
      const result = await client.query(insertQuery, [userId, userName, email, hashedPassword]);

      const token = jwt.sign(
        { userId: userId, userName: userName, email: email, password: hashedPassword },
        JWT_KEY,
        { expiresIn: '1h' });
      res.status(201).json({
        message: `ユーザー登録に成功しました: ${result.rows[0].userid}`,
        token
      });
    }
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    res.status(500).json({ error: 'ユーザー登録中にエラーが発生しました' });
  }
});

// ログインエンドポイント
app.post('/login', async (req, res) => {
  const { userId, password } = req.body;

  try {
    const selectQuery = `SELECT * FROM users WHERE UserID = $1`;
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

    const token = jwt.sign(
      { userId: user.userid, Email: user.email, userName: user.username, password: user.password },
      JWT_KEY,
      { expiresIn : '1h' })
    // ログイン成功時のレスポンス
    res.json({
      message: 'ログイン成功',
      token
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ error: 'ログイン中にエラーが発生しました' });
  }
});

app.get('/logined', verifyToken, async (req, res) => {
  try {
      const { userId, userName } = req.user;

      const clothesQuery = 'SELECT clotheid, clotheimage FROM clothes WHERE userid = $1 ORDER BY clotheid;';
      const coordinatesQuery = `
          SELECT coordinateid, coordinatename, clotheimage
          FROM (SELECT 
              co.coordinateID,
              co.coordinatename,
              c.clotheimage,
              ROW_NUMBER() OVER (PARTITION BY co.coordinateID ORDER BY c.clotheID) AS rn
              FROM coordinate co
              JOIN clothes c ON co.clotheID = c.clotheID AND co.userid = c.userid
              WHERE co.userid = $1)
          WHERE rn = 1;
      `;

      const clothesResult = await client.query(clothesQuery, [userId]);
      const coordinatesResult = await client.query(coordinatesQuery, [userId]);

      res.json({
          clothes: clothesResult.rows,
          coordinates: coordinatesResult.rows,
          userName: userName
      });
  } catch (err) {
      console.error(err);
      res.status(500).send('Database error');
  }
});


  app.post('/selectImage', verifyToken, (req, res) => {
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

  app.get('/search', verifyToken, async (req, res) => {
    
  try {
    const { userId, userName } = req.user;
    const target = req.query.tag;
    let clothesQuery = '';
    let clothesResult = '';
    let val = [];
    
    // clothesテーブルとcoordinateテーブルからデータを取得
    try {
      if (target) {
        clothesQuery =
        `SELECT clotheid, clotheimage, clothetag
        FROM clothes WHERE userid = $1 AND clothetag LIKE $2 ORDER BY clotheid;`;
        val = `%${target}%`
        clothesResult = await client.query(clothesQuery, [userId, val]);
      } else {
        clothesQuery = 'SELECT clotheid, clotheimage, clothetag FROM clothes WHERE userid = $1;';
        clothesResult = await client.query(clothesQuery, [userId]);
      }

      res.json({
        clothes: clothesResult.rows,
        userName: userName
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Database error');
    }
  } catch (err) {
    console.log(err);
  }
});

// 画像アップロードエンドポイント
app.post('/tag', upload.single('image'), async (req, res) => {

  try {

    if (!req.file){
      res.status(400).send('No file uploaded or file is too large');
    }

    // アップロードされた画像ファイルのパス
    const filePath = req.file.path;
    // 画像の背景をRemove.bgで削除
    const imagePath = await removeBackground(filePath);

    // 画像ファイルをBase64に変換
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Clarifaiのモデルに画像を送信して解析
    const response = await clarifaiApp.models.predict('e0be3b9d6a454f0493ac3a30784001ff', { base64: base64Image });
    
    //分析結果から信頼度を0.8以上のラベルを取得
    const concepts = response.outputs[0].data.concepts;
    const filteredLabels = concepts.filter(concept => concept.value > 0.8).map(concept => concept.name);

    // color-recognition //
      // Clarifai APIを呼び出す
      const colorLabels = await new Promise((resolve, reject) => {
        stub.PostModelOutputs(
          {
            user_app_id: {
              user_id: USER_ID,
              app_id: APP_ID
            },
            model_id: MODEL_ID,
            version_id: MODEL_VERSION_ID,
            inputs: [
              { data: { image: { base64: base64Image } } }
            ]
          },
          metadata,
          (err, response) => {
            if (err) {
              reject('Error calling Clarifai API: ' + err);
            }
    
            if (response.status.code !== 10000) {
              reject('Clarifai API error: ' + response.status.description);
            }
            
            const colorArray = response.outputs[0].data.colors;
            const colorRes = colorArray.map(color => color.w3c.name);
            // 成功した場合にcolorsデータを返す
            resolve(colorRes);
          }
        );
      });

    if (!response.outputs || !response.outputs[0].data) {
      throw new Error('Clarifai APIから期待したレスポンスがありません');
    }

    // 分析結果をクライアントに返す
    //ラベルをフィルタリングして信頼度の高いものを選択
    const allLabels = [...filteredLabels, ...colorLabels]; // ラベルと色を統合

    // 結果をクライアントに返す
    res.json({labels: allLabels, path: imagePath});
  } catch (error) {
    console.error('画像分類中にエラーが発生しました:', error);
    res.status(500).json({ error: '画像分類中にエラーが発生しました。' });
  }
});

// 画像の背景を削除する関数
async function removeBackground(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);

    const response = await axios({
      method: 'post',
      url: 'https://api.remove.bg/v1.0/removebg',
      headers: {
        'X-Api-Key': RB_API_KEY, // APIキーをここで設定
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
   
    // ファイルの保存先のパス
    let num = 1, flg = 0;
    let outputPath = `public/images/clothes/clothe${num}.png`;
    
    do {
      try {
        fs.readFileSync(outputPath);
        outputPath = `public/images/clothes/clothe${num}.png`;
        num += 1;
      } catch {
        flg = 1;
      }
    } while(flg == 0)
      
    fs.writeFileSync(outputPath, response.data);
    return outputPath; //背景除去した画像のパスを返す
  } catch (error) {
    const errorMessage = error.response ? error.response.data : error.message;
    console.error('Remove.bg APIのエラー:', errorMessage);
    throw new Error('背景除去に失敗しました');
  }
}

app.post('/registerClothe', verifyToken, async (req, res) => {
  
  try {
    const { userId } = req.user;
    const { imgPath, tags } = req.body; // リクエストからデータ取得

    
    if (!imgPath || !tags) {
      return res.status(400).json({ error: 'Missing imgPath or tags' });
    }
    
    const selectQuery = `SELECT clotheid FROM clothes WHERE userid = $1 ORDER BY clotheid`;
    const result = await client.query(selectQuery, [userId]);
    
    const clotheArray = result.rows.length;

    let insertId = 1;
    try {
      for (let i = 1; i <= clotheArray; i++) {
        if (insertId == result.rows[i - 1].clotheid) {
          insertId += 1;
        }
      }
    } catch (err) {
      console.log("clothesになにも登録されていないかDBに接続できていません。")
    }

    const insertQuery = `
      INSERT INTO clothes(clotheid, clothetag, clotheimage, userid)
      VALUES ($1, $2, $3, $4)
      `;
    client.query(insertQuery, [insertId, tags, imgPath, userId]);
    
    res.json({status: "ok"});
  } catch (error) {
    console.log("エラーが発生しました: ", error);
  }
});

app.post('/getClothe', verifyToken, async (req, res) => {
  
  try {
    const userId = req.user.userId;
    const clotheId = req.body.clotheId;

    // clothesテーブルとcoordinateテーブルからデータを取得
    const clothesQuery = `
      SELECT clotheid, clotheTag, clotheimage FROM clothes
      WHERE userid = $1 AND clotheid = $2;
    `;
    
    let clotheTag = "", image = "";
    
    try {
      const clothesResult = await client.query(clothesQuery, [userId, clotheId]);
      if (clothesResult.rows.length === 0) {
        res.status(404).json({ error: "Clothe not found" });
        return;
      }
      clotheTag = clothesResult.rows[0].clothetag;
      image = clothesResult.rows[0].clotheimage;
    } catch (err) {
      console.log(err);
    }
    
    res.json({ tags: clotheTag, path: image });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.post('/editTag', verifyToken, async (req, res) => {
  
  try {
    const { userId } = req.user;
    const { clotheid, tags } = req.body;

    if (!userId || !clotheid || !tags) {
      return res.status(400).json({ error: 'Missing userID or clotheID or tags' });
    }
    
    let result = "";

    try {
      const updateQuery = `UPDATE clothes SET clothetag = $1 WHERE userid = $2 AND clotheid = $3`;
      result = await client.query(updateQuery, [tags, userId, clotheid]);
    } catch (err) {
      console.log("clothesに登録されていません。")
    }
    res.json({ status: "ok" });
  } catch (error) {
    console.log("エラーが発生しました: ", error);
  }
});

app.post('/deleteClothe', verifyToken, async(req, res) => {
  try {
    const { clotheId } = req.body;
    const { userId } = req.user;

    // 衣服がコーディネートに含まれているか確認
    const checkCoordinatedClothesQuery = 'SELECT 1 FROM coordinate WHERE userid = $1 AND clotheid = $2 LIMIT 1';
    const coordinatedResult = await client.query(checkCoordinatedClothesQuery, [userId, clotheId]);

    if (coordinatedResult.rowCount > 0) {
      // コーディネートに登録されている場合
      return res.status(400).json({ error: 'この衣服はコーディネートに登録されているため、削除できません。' });
    }

    // 衣服がコーディネートに含まれていない場合、削除を進める
    const selectQuery = 'SELECT clotheimage FROM clothes WHERE userid = $1 AND clotheid = $2';
    const deleteQuery = 'DELETE FROM clothes WHERE userid = $1 AND clotheid = $2';
    const clotheResult = await client.query(selectQuery, [userId, clotheId]);

    if (!clotheResult.rows.length) {
      return res.status(404).json({ error: '指定された衣服が見つかりません。' });
    }

    await client.query(deleteQuery, [userId, clotheId]);

    const deleteFile = (filePath) => {
      fs.unlink(filePath, (err) => {
          if (err) {
              console.error(`Error deleting file: ${err.message}`);
              return;
          }
      });
    };
    deleteFile(`./public/${clotheResult.rows[0].clotheimage}`);

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    if (err.code === "23503") {
      res.status(404).json({ error: '外部キー制約エラー' });
    } else {
      res.status(500).json({ error: '削除エラーが発生しました' });
    }
  }
});

app.get('/getClotheAll', verifyToken, async (req, res) => {
  
  try {
    const { userId } = req.user;
    // clothesテーブルとcoordinateテーブルからデータを取得
    const clothesQuery = `
      SELECT clotheid, clotheimage FROM clothes
      WHERE userid = $1 ORDER BY clotheid;
    `;
    let clothesResult = "";
    
    try {
      clothesResult = await client.query(clothesQuery, [userId]);
    } catch (err) {
      console.log(err);
    }
    
    res.json({ rows: clothesResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.post('/registerCoordinate', verifyToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const selectQuery = `SELECT DISTINCT(coordinateid) FROM coordinate WHERE userid = $1;`;
    const result = await client.query(selectQuery, [userId]);
    
    const clotheArray = result.rows.length;

    let insertId = 1;
    try {
      for (let i = 1; i <= clotheArray; i++) {
        if (insertId == result.rows[i - 1].coordinateid) {
          insertId += 1;
        }
      }
    } catch (err) {
      console.log("clothesになにも登録されていないかDBに接続できていません。")
    }
    
      // 保存先DBに対するINSERT INTOクエリ
      const insertQuery = `
      INSERT INTO coordinate(userid, coordinateid, clotheid, coordinatename)
      VALUES ($1, $2, $3, $4);
      `;
      
      for (let i = 0; i < req.body.length; i++) {
        let { clotheId, coordinateName } = req.body[i];
        await client.query(insertQuery, [userId, insertId, clotheId, coordinateName]);
      }
      res.json({ status: 'ok' });
    } catch (err) {
      console.error('エラー:', err);
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  });

app.post('/getCoordinateInfo', verifyToken, async (req, res) => {
  const coorId = req.body.coordinateId;
  
  try {
    const { userId } = req.user;
    // clothesテーブルとcoordinateテーブルからデータを取得
    const clothesQuery = `
      SELECT clothes.clotheid, clotheimage, coordinatename FROM clothes
      INNER JOIN coordinate
      ON clothes.clotheid = coordinate.clotheid AND clothes.userid = coordinate.userid
      WHERE clothes.userid = $1 AND coordinateid = $2;
    `;
    let clothesResult = "";
    
    try {
      clothesResult = await client.query(clothesQuery, [userId, coorId]);
    } catch (err) {
      console.log(err);
    }
    
    res.json({ rows: clothesResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json('Database error');
  }
});

app.post('/deleteCoordinate', verifyToken, async(req, res) => {
  
  const { coordinateId } = req.body;
  
  try {
    const { userId } = req.user;
    const deleteQuery = 'DELETE FROM coordinate WHERE userid = $1 AND coordinateid = $2';
    await client.query(deleteQuery, [userId, coordinateId]);

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).send('Deletion error');
  }
}); 


  async function getWeather(city) {
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await axios.get(url);
      const weather = response.data.weather[0].main;  //天気情報
      const temp = response.data.main.temp; //気温
      const timestamp = response.data.dt; //現在のタイムスタンプ
      const month = new Date(timestamp * 1000).getMonth() + 1; //月を取得
      return { weather, temp, month };
    } catch (error) {
      console.error("Error fetching weather data:", error.message);
      throw new Error("天気データを取得できませんでした。");
    }
  }

  // 天気の英語を日本語に変換する関数
  function translateWeather(weather) {
    switch (weather) {
      case 'Clear':
        return '晴れ';
      case 'Clouds':
        return '曇り';
      case 'Rain':
        return '雨';
      case 'Snow':
        return '雪';
      case 'Thunderstorm':
        return '雷雨';
      case 'Drizzle':
        return '小雨';
      case 'Mist':
        return '霧';
      default:
        return '不明';  // 未対応の天気
    }
    
  }

  //コーディネート用のキーワードを生成
  function generateKeyword(weather, month, gender) {

    let baseKeyword;

    if (weather && weather.main && weather.main.includes('Rain')) {
      baseKeyword =  '雨の日 ファッション';
    } else if (month >= 3 && month <= 5) {
      baseKeyword =  '春 トレンド ファッション';
    } else if (month >= 6 && month <= 8) {
      baseKeyword =  '夏 トレンド ファッション';
    } else if (month >= 9 && month <= 11) {
      baseKeyword =  '秋 トレンド ファッション';
    } else if (month >= 12 || month <= 2) {
      baseKeyword =  '冬 トレンド ファッション';
    }

    // baseKeyword が未設定の場合、デフォルト値を返す
    if (!baseKeyword) {
      baseKeyword = 'カジュアル ファッション'; // デフォルトのキーワード
    }

    //性別によるキーワード調整
    if (gender === 'female') {
      return `${baseKeyword} 女性`;
    } else if (gender === 'male') {
      return `${baseKeyword} 男性`;
    }
    return baseKeyword;   //デフォルト 
  }

  //画像検索
  async function searchImages(keyword) {
    const apiKey = process.env.BING_API_KEY;
    const url = `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(keyword)}&count=3&setLang=ja`;

    try {
      const response = await axios.get(url, {
        headers: { 'Ocp-Apim-Subscription-Key': apiKey },
      });
      const imageUrls = response.data.value.map(img => img.contentUrl);  //複数の画像URL
      return imageUrls;
    } catch (error) {
      console.error("Error fetching image:", error.message);
      throw new Error("画像を取得できませんでした。")
    }
  }

  //APIエンドポイント
  app.get('/get-outfit', async (req, res) => {
    const city = process.env.CITY || 'Tokyo';
    const gender = req.query.gender || 'female'; //デフォルト
    try {
      //天気データ取得
      const weatherData = await getWeather(city);
      
      //天気情報の翻訳
      const weatherInJapanese = translateWeather(weatherData.weather);
      
      //キーワード生成
      const keyword = generateKeyword(weatherData.weather, weatherData.month, gender);

      //画像検索
      const imageUrls = await searchImages(keyword);

      //レスポンス
      res.json({
        weather: weatherInJapanese,
        temp: weatherData.temp,
        keyword,
        imageUrls,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

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

  const url1h = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=ja`;

  // 天気データの取得
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