import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';

import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

import {
  getFirestore,
  collection,  // Ссылка на коллекцию
  doc,         // Ссылка на документ внутри коллекции

  getDoc,      // Получить один документ
  getDocs,     // Получить все документы коллекции
  
  onSnapshot,  // Слушать документ или документы

  setDoc,      // Записать (или перезаписать) документ
  addDoc,      // Добавить новый документ с авто-id
  updateDoc,   // Обновить только указанные поля
  deleteDoc,   // Удалить документ

  query,       // Создает фильтрованный/отсортированный запрос
  where,       // Фильтр по условию
  orderBy,     // Сортировка по полю
  limit,       // Ограничить количество
  startAt      // Пагинация (откуда начать)
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyClOhEXpKSOHjyhdXm9vrWi-XvBPP8OpJM",
  authDomain: "remote-commander-d4f53.firebaseapp.com",
  projectId: "remote-commander-d4f53",
  storageBucket: "remote-commander-d4f53.firebasestorage.app",
  messagingSenderId: "1047320397059",
  appId: "1:1047320397059:web:7750f238182305be4fd536",
  measurementId: "G-06HQD7LMZ1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

///////////////////////////////////////////////////
//////////     toggle login/register     //////////
///////////////////////////////////////////////////

const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');

const loginContainer = document.getElementById('loginContainer');
const registerContainer = document.getElementById('registerContainer');


loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginContainer.classList.add('active');
  registerContainer.classList.remove('active');
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  registerContainer.classList.add('active');
  loginContainer.classList.remove('active');
});

//////////////////////////////////////
//////////     register     //////////
//////////////////////////////////////

const formReg = document.getElementById('registerForm');
const messageReg = document.getElementById('msgReg');

formReg.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(formReg);
  const payload = Object.fromEntries(formData.entries());

  if (passwordInputReg.value !== confirmPasswordInputReg.value) {
    confirmPasswordInputReg.classList.add('invalid');
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, payload.email, payload.password);
    // ✅ переходим на страницу edit.html
    window.location.href = `./room.html`;
  } catch (err) {
    // переводим ошибки на человеческий язык
    let msg;
    switch (err.code) {
      case "auth/email-already-in-use":
        msg = "This email is already used";
        break;
      case "auth/invalid-email":
        msg = "Email is incorrect";
        break;
      case "auth/weak-password":
        msg = "Password is too weak";
        break;
      default:
        msg = err.message;
    }
    messageReg.textContent = `${msg}`;
    messageReg.classList.remove('active-success');
    messageReg.classList.add('active-error');
    registerContainer.classList.add('incorrect');
  }
});

/////////////////////////////////////
//////////     sign in     //////////
/////////////////////////////////////

const formLog = document.getElementById('loginForm');
const messageLog = document.getElementById('msgLog');

formLog.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(formLog);
  const payload = Object.fromEntries(formData.entries());

  // console.log(payload.email);
  // console.log(payload.password);

  try {
    await signInWithEmailAndPassword(auth, payload.email, payload.password);
    // ✅ переходим на страницу edit.html
    window.location.href = `./room.html`;
  } catch (err) {
    // переводим ошибки на человеческий язык
    let msg;
    switch (err.code) {
      case "auth/invalid-credential":
        msg = "Email and Password are incorrect";
        break;
      default:
        msg = err.message;
    }
    messageLog.textContent = `${msg}`;
    messageLog.classList.remove('active-success');
    messageLog.classList.add('active-error');
    loginContainer.classList.add('incorrect');
  }
});

///////////////////////////////////////////////
//////////     Input error reset     //////////
///////////////////////////////////////////////

const allInputs = document.querySelectorAll('input');

allInputs.forEach((el) => el.addEventListener('input', () => {
  el.classList.remove('invalid');
}));

emailInputReg.addEventListener('input', () => {
  emailInputReg.closest('.incorrect').querySelector('.active-error').classList.remove('active-error');
  emailInputReg.closest('.incorrect').classList.remove('incorrect');
});

passwordInputReg.addEventListener('input', () => {
  passwordInputReg.closest('.incorrect').querySelector('.active-error').classList.remove('active-error');
  passwordInputReg.closest('.incorrect').classList.remove('incorrect');
});

/////////////////////////////////////////////
//////////     secure redirect     //////////
/////////////////////////////////////////////

onAuthStateChanged(auth, async (user) => {
  if (user) {
    window.location.href = './room.html';
    return;
  }
});