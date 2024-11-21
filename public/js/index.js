// 酒井淳之介・片岡優樹

console.clear();

const signupBtn = document.getElementById('signup');
const loginBtn = document.getElementById('login');

signupBtn.addEventListener('click', (e) => {
    let parent = e.target.parentNode;
    Array.from(e.target.parentNode.classList).find((element) => {
        if(element !== "slide-up") {
            parent.classList.add('slide-up')
        }else{
            loginBtn.parentNode.parentNode.classList.add('slide-up')
            parent.classList.remove('slide-up')
        }
    });
});

loginBtn.addEventListener('click', (e) => {
  let parent = e.target.parentNode.parentNode;
  Array.from(e.target.parentNode.parentNode.classList).find((element) => {
    if(element !== "slide-up") {
      parent.classList.add('slide-up')
    }else{
      signupBtn.parentNode.classList.add('slide-up')
      parent.classList.remove('slide-up')
    }
  });
});

// フォームが送信された時にユーザーを追加
document.getElementById('userMakeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const userId = document.getElementById('userId').value;
    const userName = document.getElementById('userName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userName, email, password })
      });
  
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        window.location.href = '/logined.html';  // 登録成功後にリダイレクト
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('エラーが発生しました:', error);
      alert('ユーザー登録に失敗しました。');
    }
  });

document.getElementById('userLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();  // フォームのデフォルトの送信をキャンセル
  
    const userId = document.getElementById('loginUserId').value;
    const password = document.getElementById('loginPassword').value;
  
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // ログイン成功時
        alert(data.message);
        // ログイン後、例えば、ユーザー名を表示するか、ホームページにリダイレクトする
        window.location.href = '/logined.html'; // ダッシュボードへのリダイレクトなど
      } else {
        // エラーメッセージを画面上に表示
        alert(data.error); // エラーメッセージ
      }
    } catch (error) {
      console.error('ログインリクエストエラー:', error);
      alert('ログイン中にエラーが発生しました');
    }
});
