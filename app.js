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

app.get('/logined', async (req, res) => {
  try {
    // clothesテーブルとcoordinateテーブルからデータを取得
    const clothesQuery = 'SELECT clotheid, clotheimage FROM clothes ORDER BY clotheid;';
    const coordinatesQuery = `
      SELECT coordinateid, coordinatename, clotheimage
      FROM (SELECT 
            co.coordinateID,
            co.coordinatename,
            c.clotheimage,
            ROW_NUMBER() OVER (PARTITION BY co.coordinateID ORDER BY c.clotheID) AS rn
            FROM coordinate co
            JOIN clothes c ON co.clotheID = c.clotheID)
      WHERE rn = 1;
      ;
    `;

    let clothesResult = "", coordinateResult = "";

    try {
      clothesResult = await client.query(clothesQuery);
    } catch (err) {
      console.log(err);
    }

    try {
      coordinateResult = await client.query(coordinatesQuery);
    } catch (err) {
      console.log(err);
    }

    res.json({
      clothes: clothesResult.rows,
      coordinates: coordinateResult.rows || ""
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.get('/search', async (req, res) => {
  
  try {
    const target = req.query.tag;

    let clothesQuery = '';
    let clothesResult = '';
    let val = [];
    
    // clothesテーブルとcoordinateテーブルからデータを取得
    if (target) {
      clothesQuery =
      `SELECT clotheid, clotheimage, clothetag
      FROM clothes WHERE clothetag LIKE $1 ORDER BY clotheid;`;
      val = [`%${target}%`]
    } else {
      clothesQuery = 'SELECT clotheid, clotheimage, clothetag FROM clothes;';
    }

    try {
      clothesResult = await client.query(clothesQuery, val);
      res.json({
        clothes: clothesResult.rows
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
    console.log('分類結果を出しました');
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
  } catch (error){
    const errorMessage = error.response ? error.response.data : error.message;
    console.error('Remove.bg APIのエラー:', errorMessage);
    throw new Error('背景除去に失敗しました');
  }
}

app.post('/registerClothe', async (req, res) => {
  
  try {
    const { imgPath, tags } = req.body; // リクエストからデータ取得

    
    if (!imgPath || !tags) {
      return res.status(400).json({ error: 'Missing imgPath or tags' });
    }
    
    const selectQuery = `SELECT clotheid FROM "clothes" ORDER BY clotheid`;
    const result = await client.query(selectQuery);
    
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
      INSERT INTO clothes(clotheid, clothetag, clotheimage, fav, userid)
      VALUES ($1, $2, $3, $4, $5)
      `;   
    const flg = false, userId = 'MCGDev';     
    client.query(insertQuery, [insertId, tags, imgPath, flg, userId]);
    
    res.json({status: "ok"});
  } catch (error) {
    console.log("エラーが発生しました: ", error);
  }
});

app.post('/editTag', async (req, res) => {
  
  try {
    const { clotheid, tags } = req.body;

    if (!clotheid || !tags) {
      return res.status(400).json({ error: 'Missing clotheID or tags' });
    }
    
    let result = "";

    try {
      const updateQuery = `UPDATE clothes SET clothetag = $1 WHERE clotheid = $2`;
      result = await client.query(updateQuery, [tags, clotheid]);
    } catch (err) {
      console.log("clothesに登録されていません。")
    }
    
    res.json({ status: result });
  } catch (error) {
    console.log("エラーが発生しました: ", error);
  }
});

app.get('/getClotheAll', async (req, res) => {
  
  try {
    // clothesテーブルとcoordinateテーブルからデータを取得
    const clothesQuery = 'SELECT clotheid, clotheimage FROM clothes ORDER BY clotheid;';

    let clothesResult = ""

    try {
      clothesResult = await client.query(clothesQuery);
    } catch (err) {
      console.log(err);
    }


    res.json({ rows: clothesResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.post('/getClotheTag', async (req, res) => {

  try {
    const clotheId = req.body.clotheId;
    // clothesテーブルとcoordinateテーブルからデータを取得
    const clothesQuery = 'SELECT clotheid, clotheTag FROM clothes WHERE clotheid = $1;';

    let clotheTag = ""

    try {
      const clothesResult = await client.query(clothesQuery, [clotheId]);
      if (clothesResult.rows.length === 0) {
          res.status(404).json({ error: "Clothe not found" });
          return;
      }
      clotheTag = clothesResult.rows[0].clothetag;
    } catch (err) {
      console.log(err);
    }

    console.log(clotheTag);

    res.json({ tags: clotheTag });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.post('/registerCoordinate', async (req, res) => {
  try {

      // coordinateIDの決定
      const userId = req.body[0].userId;
      const selectQuery = `SELECT userid, max(coordinateid) as coordinateid FROM coordinate WHERE userid = $1 GROUP BY userid;`;
      const selectResult = await client.query(selectQuery, [userId]);
      
      let newCoordinateId = "";
      try  {
        const coordinateId = selectResult.rows[0].coordinateid;
        newCoordinateId = coordinateId + 1;
      } catch (err) {
        newCoordinateId = 1;
      }
    
      // 保存先DBに対するINSERT INTOクエリ
      const insertQuery = `
          INSERT INTO coordinate(userid, coordinateid, clotheid, coordinatename)
          VALUES ($1, $2, $3, $4);
      `;


      for (let i = 0; i < req.body.length; i++) {
        let { userId, clotheId, coordinateName } = req.body[i];
        await client.query(insertQuery, [userId, newCoordinateId, clotheId, coordinateName]);
      }
      res.json({ status: 'ok' });
  } catch (err) {
      console.error('エラー:', err);
      res.status(500).json({ error: 'Database error', details: err.message });
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