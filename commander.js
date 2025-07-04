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
  apiKey: "AIzaSyDKX-sDGZtY8AUypp1o7uAejDkQP6czw2E",
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

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

// импортируем палитру цветов
import themes from './themes.js';

////////////////////////////////////////
//////////     room setup     //////////
////////////////////////////////////////

onAuthStateChanged(auth, async (user) => {
  /*
  if (user) {
    const uid = user.uid;
    let roomRef = doc(db, "rooms", uid);
    let roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      // Профиль не существует, создаём его с дефолтными данными
      await setDoc(roomRef, {
        email: user.email || "",
        message: 'Hello World!'
      });
      console.log("Создан профиль для нового пользователя");
      // После создания — считываем заново
      roomSnap = await getDoc(roomRef);
    }

    if (roomSnap.exists()) {
      const data = roomSnap.data();
      document.querySelector('.commander-card span').innerText = `${data.email}: ${data.message}`;
    }
  } else {
    window.location.href = './index.html';
  }
  */
  if (!user) {
    window.location.href = './index.html';
    return;
  }
  
  const uid = user.uid;
  const roomRef = doc(db, "rooms", uid);

  onSnapshot(roomRef, async (roomSnap) => {
    if (!roomSnap.exists()) {
      // Документа нет — создаём его
      await setDoc(roomRef, {
        email: user.email || "",
        message: 'Hello World!',
        theme: 'F3F3F6+FFFFFF+191919',
        mediaLink: ''
      });
      console.log("Создан профиль для нового пользователя");
      return; // Ждём следующего срабатывания onSnapshot
    }

    // Документ существует — отображаем данные
    const data = roomSnap.data();
    document.querySelector('.commander-card').innerHTML = ''; // reset
    document.querySelector('.commander-card').innerHTML = `
      <span class="username">${data.email}</span>
      <span class="user-message" style="${data.message && data.mediaLink?"margin-bottom:0.5rem":""}">${data.message}</span>
    `;
    if(data.mediaLink) {
      addMedia(data.mediaLink);
    }
    // color theme setup
    let themeColors = data.theme.split('+');
    let bodyBg = '#'+themeColors[0];
    let messageBg = '#'+themeColors[1];
    let fontColor = '#'+themeColors[2];
    
    // random colors from themes.js
    if(bodyBg === "#magic" || messageBg === "#magic" || fontColor === "#magic") {
      const theme = themes[Math.floor(Math.random() * themes.length)];
      bodyBg = theme.bodyBg;
      messageBg = theme.messageBg;
      fontColor = theme.fontColor;
    }

    // обновляем css переменные
    const root = document.documentElement;
    root.style.setProperty('--font-color', fontColor);
    root.style.setProperty('--body-bg', bodyBg);
    root.style.setProperty('--message-bg', messageBg);

    // fill inputs fields
    messageInput.value = data.message || '';
    mediaLinkInput.value = data.mediaLink || '';
  });
});

function addMedia(link) {
  let img = document.createElement('img');
  img.src = link;
  setupPointerEvents(img); // for fullscreen
  document.querySelector('.commander-card').append(img);
}

/////////////////////////////////////////
//    prevent default touch actions    //
/////////////////////////////////////////

// prevent default pinch zooming
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) {
    e.preventDefault(); // отменяем дефолтное
  }
}, { passive: false });

// prevent default double tap zooming
let lastTouchEnd = 0;
document.addEventListener('touchend', function (e) {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault(); // отменяем дефолтное
  }
  lastTouchEnd = now;
}, { passive: false });

///////////////////////////
//    fullscreen view    //
///////////////////////////

function setupPointerEvents(element) {
  let lastClickTime = 0;
  let lastClickPos = null;
  const DOUBLE_CLICK_DELAY = 500; // миллисекунд
  const MAX_DISTANCE = 10; // пикселей

  element.addEventListener('pointerup', (event) => {
    const now = Date.now();
    const pos = { x: event.clientX, y: event.clientY };

    if (
      lastClickTime &&
      (now - lastClickTime < DOUBLE_CLICK_DELAY) &&
      lastClickPos &&
      distance(pos, lastClickPos) < MAX_DISTANCE
    ) {
      toggleFullscreenImg(event);

      // Сброс
      lastClickTime = 0;
      lastClickPos = null;
    } else {
      lastClickTime = now;
      lastClickPos = pos;
    }
  });

  function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }
}

function toggleFullscreenImg(e) {
  e.target.classList.toggle('fullscreen');
}

////////////////////////////////////////
//////////     room update     /////////
////////////////////////////////////////

// toggle ON/OFF
const fadedBG = document.querySelector('.bg-fading');

editBtn.addEventListener('click', () => {
  toggleCommanderRoom();
});
fadedBG.addEventListener('click', () => {
  toggleCommanderRoom();
});
backBtn.addEventListener('click', () => {
  toggleCommanderRoom();
});

function toggleCommanderRoom() {
  document.querySelector('.edit-container').classList.toggle('hidden');
  document.querySelector('.commander-card').classList.toggle('hidden');
}

// upload data
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(editForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    await updateDoc(doc(db, 'rooms', auth.currentUser.uid), {
      message: payload.message,
      theme: payload.theme==="magic+magic+magic"?`magic+magic+magic+${Math.random()}`:payload.theme,
      mediaLink: payload.mediaLink
    });
  } catch (err) {
    console.log(err.message);
  }

  toggleCommanderRoom();
});

///////////////////////
/////   logout    /////
///////////////////////

closeBtn.addEventListener('click', async () => {
  await signOut(auth);
});