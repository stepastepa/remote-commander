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
        email: user.email || '',
        mediaLink: '',
        message: 'Hello World!',
        numberOfSlides: '3',
        pausedSeconds: 0,
        slidesLinks: [
          `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`,
          `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`,
          `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`
        ],
        theme: 'F3F3F6+FFFFFF+191919',
        timer: 'currenttime',
        timerStatus: 'play',
        type: 'message'
      });
      console.log("Создан профиль для нового пользователя");
      return; // Ждём следующего срабатывания onSnapshot
    }

    // Документ существует — отображаем данные
    const data = roomSnap.data();

    // проверка на отсутствие некоторых полей у старых пользователей:
    data.mediaLink || '',
    data.message || 'Hello World!',
    data.numberOfSlides || '3',
    data.pausedSeconds || 0,
    data.slidesLinks || [
      `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`,
      `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`,
      `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`
    ],
    data.theme || 'F3F3F6+FFFFFF+191919',
    data.timer || 'currenttime',
    data.timerStatus || 'play',
    data.type || 'message'

    console.log(data);

    // скрываем неактивные типы комнат и их параметры в настройках
    let cards = document.querySelectorAll('.commander-container>div');
    let editFormGroups = document.querySelectorAll('#editForm>div');

    cards.forEach((el)=>{
      el.classList.remove('active');
    });
    editFormGroups.forEach((el)=>{
      el.classList.remove('active');
    });

    if (data.type === 'gallery') {
      cards[2].classList.add('active');
      editFormGroups[1].classList.add('active');
    } else if (data.type === 'timer') {
      cards[1].classList.add('active');
      editFormGroups[2].classList.add('active');
      editFormGroups[3].classList.add('active');
    } else {
      cards[0].classList.add('active');
      editFormGroups[0].classList.add('active');
      editFormGroups[3].classList.add('active');
    }

    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////

    /////////// message card setup ///////////
    document.querySelector('.message-card').innerHTML = ''; // reset
    document.querySelector('.message-card').innerHTML = `
      <span class="username">${data.email}</span>
      <span class="user-message ${data.message && data.mediaLink?"gap":""}">${data.message}</span>
    `;
    if(data.mediaLink) {
      addMedia(data.mediaLink);
    }

    /////////// timer card HTML setup ///////////
    timerImageGroup.innerHTML = ''; // reset
    timerImageGroup.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 48 24">
        <g fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <!-- <rect x="1" y="1" width="46" height="22" rx="5" ry="5" stroke="var(--message-bg)"></rect>
          <rect x="4" y="4" width="40" height="16" rx="2" ry="2" stroke="none" fill="var(--message-bg)" stroke-width="1"></rect> -->
          <text
            id="timerText"
            x="50%"
            y="53%"
            font-size="10"
            font-weight="bold"
            text-anchor="middle"
            dominant-baseline="middle"
            font-family="monospace"
            fill="var(--light-color)"
            stroke="none"
          >00:00</text>
        </g>
      </svg>
    `;

    /////////// gallery card HTML setup /////////
    document.querySelector('.gallery-card').innerHTML = ''; // reset
    let slides = data.slidesLinks;
    for (let i = 0; i < data.numberOfSlides; i++) {
      document.querySelector('.gallery-card').innerHTML += `<img src="${slides[i]}"/>`;
    }
    const images = document.querySelectorAll('.gallery-card img');
    stopShow(); // remove all previous slideshows !!!
    if(document.querySelector('.gallery-card').classList.contains('active')) {
      startShow(images);
    }

    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////

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

    ////////////////////////////////////////////////////
    // fill inputs fields
    messageInput.value = data.message || '';
    mediaLinkInput.value = data.mediaLink || '';
    numberOfSlidesInput.value = data.numberOfSlides || '5';

    // add blank inputs for links
    slidesGroup.innerHTML = ''; // reset
    for (let i = 0; i < data.numberOfSlides; i++) {
      slidesGroup.innerHTML += `<input type="text" value="" required/>`;
    }
    // fill inputs for links
    let slidesInputs = slidesGroup.querySelectorAll('input');
    slidesInputs.forEach((el, index)=>{
      if (!data.slidesLinks) {
        el.value = `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`;
      } else {
        el.value = data.slidesLinks[index];
      }
    });
    // console.log(slidesInputs);
    setRealtimeGalleryUpdate();

    /////  theme inputs  /////
    let themesInputs = themesContainer.querySelectorAll('input');
    if(data.theme.includes('magic')) {
      themesInputs[themesInputs.length - 1].setAttribute('checked', '');
    } else {
      themesInputs.forEach((el) => {
        el.removeAttribute('checked'); // reset theme inputs
        if(el.value === data.theme) {
          el.setAttribute('checked', '');
        }
      });
    }

    /////  timer inputs  /////
    let timerInputs = timersContainer.querySelectorAll('input');
    timerInputs.forEach((el) => {
        el.removeAttribute('checked'); // reset timer inputs
    });
    if(data.timer === 'timegoesup') {
      timerInputs[0].setAttribute('checked', '');
    } else if (data.timer === 'timegoesdown') {
      timerInputs[1].setAttribute('checked', '');
    } else {
      timerInputs[2].setAttribute('checked', '');
    }

    // switch mode and clean previous timer
    switchMode(data.timer, data.pausedSeconds);

    // update paused seconds
    pausedSeconds = data.pausedSeconds;

    // set status for timer
    if (data.type === 'timer') {
      if (data.timer === 'currenttime') { // ignore all if clock
        start();
      } else {
        console.log(data.timerStatus);
        if (data.timerStatus === 'start') start(pausedSeconds);
        if (data.timerStatus === 'pause') pause();
        if (data.timerStatus === 'reset') reset();
      }
    };

    // toggle timer control panel
    setupTimerButtons(data.timer);

    ////////////////////////////////////////////////////

    // setup room toggle
    let toggleContainerBtns = document.querySelectorAll('.toggle-container>div');
    toggleContainerBtns.forEach((el) => {
        el.classList.remove('active');
    });
    if (data.type === 'message') {
      toggleContainerBtns[0].classList.add('active');
    } else if (data.type === 'gallery') {
      toggleContainerBtns[1].classList.add('active');
    } else if (data.type === 'timer') {
      toggleContainerBtns[2].classList.add('active');
    }

    ////////////////////////////////////////////////////////////////
    // ждем загрузку картинки и проверяем высоту, чтоб все влазило
    const img = document.querySelector('.message-card img');
    if (img.complete) {
      bubbleHeightCheck();
    } else {
      img.addEventListener('load', bubbleHeightCheck);
    }
    ////////////////////////////////////////////////////////////////
  });
});

function addMedia(link) {
  let img = document.createElement('img');
  img.src = link;
  setupPointerEvents(img); // for fullscreen
  document.querySelector('.message-card').append(img);
}

function bubbleHeightCheck() {
  let viewportHeight = window.innerHeight; 
  let bubbleHeight = document.querySelector('.message-card').offsetHeight;
  let container = document.querySelector('.commander-container');

  // console.dir(viewportHeight);
  // console.dir(bubbleHeight);

  if(bubbleHeight > viewportHeight*0.9) {
    container.classList.add('scrollable');
  } else {
    container.classList.remove('scrollable');
  }
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

///////////////////////////////////
//    fullscreen image viewer    //
///////////////////////////////////

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
      toggleFullscreenImg(event); // stretch the image
      toggleFullscreen();         // toggle fullscreen mode

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

////////////////////////////////////////////////////////////
////////////////////     room update     ///////////////////
////////////////////////////////////////////////////////////

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
  document.querySelector('.message-card').classList.toggle('hidden');
}

// upload data
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(editForm);
  const payload = Object.fromEntries(formData.entries());

  // setup gallery slides
  let galleryData = [];
  let slides = slidesGroup.querySelectorAll('input');
  // console.log(slides[0].value);
  for(let i = 0; i < slides.length; i++) {
    galleryData.push(slides[i].value);
  }

  try {
    await updateDoc(doc(db, 'rooms', auth.currentUser.uid), {
      message: payload.message,
      theme: payload.theme==="magic+magic+magic"?`magic+magic+magic+${Math.random()}`:payload.theme,
      mediaLink: payload.mediaLink,
      numberOfSlides: payload.numberOfSlides,
      slidesLinks: galleryData,
      timer: payload.timer
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

/////////////////////////////////////
//    fullscreen website viewer    //
/////////////////////////////////////

fullscreenBtn.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
  if(!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    fullscreenBtn.querySelector('.minimize').classList.remove('hidden');
    fullscreenBtn.querySelector('.maximize').classList.add('hidden');
  } else {
    fullscreenBtn.querySelector('.minimize').classList.add('hidden');
    fullscreenBtn.querySelector('.maximize').classList.remove('hidden');
  }
});

//////////////////////////////////////
//    toggle commander room type    //
//////////////////////////////////////

let toggleContainerBtns = document.querySelectorAll('.toggle-container>div');

toggleContainerBtns.forEach((el) => {
  el.addEventListener('click', () => {
    let selectedType = 'message';
    // console.log(el.id);
    if(el.id === 'timerBtn') {
      selectedType = 'timer';
    } else if (el.id === 'galleryBtn') {
      selectedType = 'gallery';
    }
    activateRoomType(selectedType);
  });
});

async function activateRoomType(selectedType) {
  try {
    await updateDoc(doc(db, 'rooms', auth.currentUser.uid), {
      type: selectedType
    });
  } catch (err) {
    console.log(err.message);
  }
}

/////////////////////////////////////////
//    Gallery Form Realtime Updater    //
/////////////////////////////////////////

function setRealtimeGalleryUpdate() {
  numberOfSlidesInput.addEventListener('input', ()=>updateLinksInputs());
}

function updateLinksInputs() {
  if(numberOfSlidesInput.value === '' || numberOfSlidesInput.value === "0") return;

  let slidesInputs = slidesGroup.querySelectorAll('input');
  if (slidesInputs.length > +numberOfSlidesInput.value) {
    // удаляем лишние поля ввода
    for(let i = slidesInputs.length; i > +numberOfSlidesInput.value; i--) {
      slidesGroup.removeChild(slidesGroup.querySelectorAll('input')[slidesGroup.querySelectorAll('input').length - 1]);
    }
  } else if (slidesInputs.length < +numberOfSlidesInput.value) {
    // заново + прибавляем поля ввода
    slidesGroup.innerHTML = ''; // reset
    for(let i = 0; i < +numberOfSlidesInput.value; i++) {
      let link = '';
      // console.log(slidesInputs[i]?slidesInputs[i].value:'-');
      if (slidesInputs[i]) {
        link = slidesInputs[i].value;
      } else {
        link = `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`;
      }
      slidesGroup.innerHTML += `<input type="text" value=${link} required/>`;
    }
  }
}

/////////////////////////////////////////
//    Gallery Slide Show Controller    //
/////////////////////////////////////////

// function waitForAllImagesLoaded(startShow) {
//   // ждем загрузку картинок и проверяем запускаем показ
//   const images = document.querySelectorAll('.gallery-card img');
//   let loadedCount = 0;

//   images.forEach((el)=> {
//     if (el.complete) {
//       imageReady(el);
//       loadedCount++;
//       if (loadedCount === images.length) startShow(images);
//     } else {
//       el.addEventListener('load', () => {
//         imageReady(el);
//         loadedCount++;
//         if (loadedCount === images.length) startShow(images);
//       });
//     }
//   });
// }

// function imageReady(img) {
//   img.classList.add('downloaded');
// }

// function startShow(images) {
//   console.log('start show!!!');
//   let randomIndex = () => Math.floor(Math.random() * images.length) + 1;
//   images[randomIndex()].classList.add('active');
//   setTimeout(() => {
//     document.querySelector('.gallery-card img.active').classList.remove('active');
//     images[randomIndex()].classList.add('active');
//   }, 2000);
// }

let timeoutId = null; // храним ID setTimeout

function startShow(images) {
  function showNext() {
    // Удаляем текущее активное изображение
    const current = document.querySelector('.gallery-card img.showing');
    if (current) current.classList.remove('showing');

    // Случайное новое изображение
    const randomIndex = Math.floor(Math.random() * images.length);
    images[randomIndex].classList.add('showing');

    // Запускаем следующий показ и сохраняем ID
    timeoutId = setTimeout(showNext, 5000);
  }
  // Первый запуск
  showNext();
}

function stopShow() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

////////////////////////////////
//    random number 1-9999    //
////////////////////////////////

function randomNumber(x, y) {
  return Math.floor(Math.random() * (+y)) + (+x);
}

////////////////////////////
//    Timer Controller    //
////////////////////////////

// default Data for Timer
let intervalId = null;
let secondsPassed = 0;
let timerDuration = 60; // секунд для таймера
// 'stopwatch (timegoesup)' | 'timer (timegoesdown)' | 'clock (currenttime)'
let mode = 'timegoesup';
let isRunning = false;
let pausedSeconds = 0; // супер глобальная (?????)

// startBtn.addEventListener('click', start);
// pauseBtn.addEventListener('click', pause);
// resetBtn.addEventListener('click', reset);

// timerImageGroup.addEventListener('click', start);

// function startTimer() {
//   if (intervalId) return; // чтобы не запускать таймер повторно
//   intervalId = setInterval(() => {
//     secondsPassed++;
//     const minutes = Math.floor(secondsPassed / 60).toString().padStart(2, '0');
//     const seconds = (secondsPassed % 60).toString().padStart(2, '0');
//     timerText.textContent = `${minutes}:${seconds}`;
//   }, 1000);
// }

function switchMode(newMode, xxx) {
  pause();
  mode = newMode;
  secondsPassed = 0;

  // retrieve paused seconds from firebase:
  secondsPassed = xxx;
  updateDisplay();
}

function start(xxx) {
  if (isRunning) return;
  isRunning = true;

  if (mode === 'currenttime') {
    updateClock();
    intervalId = setInterval(updateClock, 1000);
  } else {
    // retrieve paused seconds from firebase:
    secondsPassed = xxx;

    intervalId = setInterval(() => {
      if (mode === 'timegoesup') {
        secondsPassed++;
      } else if (mode === 'timegoesdown') {
        if (secondsPassed > 0) {
          secondsPassed--;
        } else {
          pause();
        }
      }
      updateDisplay();
      pausedSeconds = secondsPassed;
    }, 1000);
  }
}

function pause() {
  isRunning = false;
  clearInterval(intervalId);
  intervalId = null;
}

function reset() {
  pause();
  secondsPassed = (mode === 'timegoesdown') ? timerDuration : 0;
  updateDisplay();
}

function updateDisplay() {
  let display = '00:00';
  if (mode === 'currenttime') return; // часы обновляются отдельно
  const minutes = Math.floor(secondsPassed / 60).toString().padStart(2, '0');
  const seconds = (secondsPassed % 60).toString().padStart(2, '0');
  display = `${minutes}:${seconds}`;
  timerText.textContent = display;
}

function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  timerText.textContent = `${h}:${m}`;
  // clock with seconds
  // const s = now.getSeconds().toString().padStart(2, '0');
  // timerText.textContent = `${h}:${m}:${s}`;
}

///////////////////////////////
// toggle timer control panel
function setupTimerButtons(timerType) {
  // console.log(timerType);
  if(timerType === 'currenttime') {
    timerControllerGroup.classList.add('hidden');
  } else {
    timerControllerGroup.classList.remove('hidden');
  }
}

////////////////////////////////////////////
// upload control panel status on firebase
// let timerButtons = timerControllerGroup.querySelectorAll('button');

// timerButtons.forEach((el) => {
//   el.addEventListener('click', () => {
//     let timerStatus = 'pause';
//     if(el.id === 'startBtn') {
//       timerStatus = 'start';
//     } else if (el.id === 'resetBtn') {
//       timerStatus = 'reset';
//     }
//     uploadTimerStatus(timerStatus);
//   });
// });

async function uploadTimerStatus(timerStatus) {
  try {
    await updateDoc(doc(db, 'rooms', auth.currentUser.uid), {
      timerStatus: timerStatus
    });
  } catch (err) {
    console.log(err.message);
  }
}

async function uploadPausedSeconds(pausedSeconds) {
  try {
    await updateDoc(doc(db, 'rooms', auth.currentUser.uid), {
      pausedSeconds: pausedSeconds
    });
  } catch (err) {
    console.log(err.message);
  }
}

startBtn.addEventListener('click', ()=>{
  uploadTimerStatus('start');
});

pauseBtn.addEventListener('click', ()=>{
  // console.log('===========> paused time: ' + pausedSeconds);
  uploadTimerStatus('pause');
  uploadPausedSeconds(pausedSeconds); // memorize paused seconds
});

resetBtn.addEventListener('click', ()=>{
  uploadTimerStatus('reset');
  uploadPausedSeconds(0); // reset paused seconds
});