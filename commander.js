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
        message: 'Hello World!'
      });
      console.log("Создан профиль для нового пользователя");
      return; // Ждём следующего срабатывания onSnapshot
    }

    // Документ существует — отображаем данные
    const data = roomSnap.data();
    document.querySelector('.commander-card').innerHTML = ''; // reset
    document.querySelector('.commander-card').innerHTML = `
      <span class="username">${data.email}</span>
      <span class="mesage">${data.message}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" class="message-tail" fill="${data.bg}">
        <path d="M 100 100 L 100 50 A 50 50 0 0 1 85 100 Z"/>
      </svg>
    `;
    document.querySelector('.commander-card').style.backgroundColor = data.bg;
    if(data.mediaLink) {
      addMedia(data.mediaLink);
    }
  });
});

function addMedia(link) {
  let img = document.createElement('img');
  img.src = link;
  document.querySelector('.commander-card').append(img);
}

////////////////////////////////////////
//////////     room update     /////////
////////////////////////////////////////

editBtn.addEventListener('click', () => {
  document.querySelector('.edit-card').classList.toggle('hidden');
  document.querySelector('.commander-card').classList.toggle('hidden');
});

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(editForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    await updateDoc(doc(db, 'rooms', auth.currentUser.uid), {
      message: payload.message,
      bg: payload.bg,
      mediaLink: payload.mediaLink
    });
  } catch (err) {
    console.log(err.message);
  }
});

///////////////////////
/////   logout    /////
///////////////////////

closeBtn.addEventListener('click', async () => {
  await signOut(auth);
});