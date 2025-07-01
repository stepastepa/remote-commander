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
    document.querySelector('.commander-card span').innerText = `${data.email}: ${data.message}`;
  });
});

////////////////////////////////////////
//////////     room update     /////////
////////////////////////////////////////



///////////////////////
/////   logout    /////
///////////////////////

optionBtn.addEventListener('click', async () => {
  await signOut(auth);
});