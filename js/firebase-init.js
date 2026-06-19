// Инициализация Firebase
// Вставьте вашу конфигурацию из Firebase Console здесь
const firebaseConfig = {
  apiKey: "AIzaSyDM1QEVP4rpm9_rRaa_YuD_AFiOZSDQPz8",
  authDomain: "dgd-namahatta.firebaseapp.com",
  projectId: "dgd-namahatta",
  storageBucket: "dgd-namahatta.firebasestorage.app",
  messagingSenderId: "362654397593",
  appId: "1:362654397593:web:dfbe2fe5fecee0ec9ef408"
};

// Инициализация Firebase SDK (через compat mode для интеграции в без-модульный код)
firebase.initializeApp(firebaseConfig);

// Экспортируем ссылки на сервисы в глобальный объект window для доступа из app.js
window.fbAuth = firebase.auth();
window.fbDb = firebase.firestore();
