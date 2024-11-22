// 片岡優樹(DB構築も)・酒井淳之介

const express = require('express'); //install
const multer = require('multer'); //install
const Clarifai = require('clarifai'); //clarifai
const path = require('path');
const fs = require('fs');
const axios = require('axios'); //install
const app = express();
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
  user: 'dcdev',
  host: 'localhost',
  database: 'digiclo',
  password: 'AC7Digital49Closet7!',
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

//Remove.bg APIキー設定
const REMOVE_BG_API_KEY = 'RakJJata7tyDLUz9LgWM1XVp';

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
   
    //背景削除済みの画像データの保存    
    let tail = 0;
    let flg = 0;

    do {
      flg = 0;
      // `images/image{tail}.png` が存在するか確認
      if (fs.existsSync(`image${tail}.png`)) {
        // 存在すれば、tail を1増やす
        tail += 1;
      } else {
        // 存在しなければ flg を 1 にしてループを終了
        flg = 1;
      }
    } while (flg !== 1);

    // 新しいファイルパスを生成
    const outputPath = path.join(__dirname, `images/tag/image${tail}.png`);

  // `response.data`を指定したパスに書き込む
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

// 画像アップロードエンドポイント
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // アップロードされた画像ファイルのパス
    const filePath = path.join(__dirname, req.file.path);
    //画像の背景をRemove.bgで削除
    const noBgImagePath = await removeBackground(filePath);

    // 画像ファイルをBase64に変換
    const imageBuffer = fs.readFileSync(noBgImagePath);
    const base64Image = imageBuffer.toString('base64');

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

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

