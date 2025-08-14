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
// детектор свайпов
import { swipeListener } from './components/swipeListener.js';

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
        pausedSecondsTimer: 0,
        slidesLinks: [
          `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`,
          `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`,
          `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`
        ],
        theme: 'f3f3f6+ffffff+0d0c22',
        timer: 'currenttime',
        timerStatus: 'start',
        type: 'message',
        timeForTimer: 0,
        clockType: 'circular'
      });
      console.log("Создан профиль для нового пользователя");
      return; // Ждём следующего срабатывания onSnapshot
    }

    // Документ существует — отображаем данные
    const data = roomSnap.data();

    // проверка на отсутствие некоторых полей у старых пользователей:
    data.mediaLink = data.mediaLink || '',
    data.message = data.message || 'Hello World!',
    data.numberOfSlides = data.numberOfSlides || '3',
    data.pausedSeconds = data.pausedSeconds || 0,
    data.pausedSecondsTimer = data.pausedSecondsTimer || 0,
    data.slidesLinks = data.slidesLinks || [
      `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`,
      `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`,
      `https://picsum.photos/seed/${randomNumber(1,9999)}/1920/1080`
    ],
    data.theme = data.theme || 'f3f3f6+ffffff+0d0c22',
    data.timer = data.timer || 'currenttime',
    data.timerStatus = data.timerStatus || 'start',
    data.type = data.type || 'message',
    data.timeForTimer = data.timeForTimer || 0,
    data.clockType = data.clockType || 'circular'

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

    /////////// 🟡🟡🟡 timer card HTML setup 🟡🟡🟡 ///////////
    /*
    timerImageGroup.innerHTML = ''; // reset
    timerImageGroup.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="numeric-clock" width="100%" height="100%" viewBox="-24 -24 48 48">
        <mask id="maskGroup">
          <rect fill="black" x="-50%" y="-50%" width="100%" height="100%"/>
          <rect id="maskTimer" fill="white" x="-50%" y="-50%" width="100%" height="100%"/>
        </mask>

        <g id="timerBackGroup">
          <rect id="bgFillBack" x="-50%" y="-50%" width="100%" height="100%" stroke="none"></rect>
          <g id="firstGroupBack">
            <text class="timerTextBack" id="firstNumberBack" x="-11%" y="0">0</text>
            <text class="timerTextBack" id="secondNumberBack" x="11%" y="0">0</text>
          </g>
          <g id="secondGroupBack">
            <text class="timerTextBack" id="thirdNumberBack" x="-11%" y="0">0</text>
            <text class="timerTextBack" id="fourthNumberBack" x="11%" y="0">0</text>
          </g>
        </g>

        <g id="timerFrontGroup" mask="url(#maskGroup)">
          <rect id="bgFillFront" x="-50%" y="-50%" width="100%" height="100%" stroke="none"></rect>
          <g id="firstGroupFront">
            <text class="timerTextFront" id="firstNumberFront" x="-11%" y="0">0</text>
            <text class="timerTextFront" id="secondNumberFront" x="11%" y="0">0</text>
          </g>
          <g id="secondGroupFront">
            <text class="timerTextFront" id="thirdNumberFront" x="-11%" y="0">0</text>
            <text class="timerTextFront" id="fourthNumberFront" x="11%" y="0">0</text>
          </g>
        </g>
      </svg>
    `;
    */

    circularImageGroup.innerHTML = ''; // reset
    circularImageGroup.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="circular-clock" width="100%" height="100%" viewBox="-100 -100 200 200">
        <defs>
          <filter id="shadowCirc" x="-100" y="-100" width="200" height="200" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0.2" dy="1" stdDeviation="1" flood-color="black" flood-opacity="0.4"/>
          </filter>
        </defs>

        <g class="minute-markers-group">

        </g>
        <g class="hour-markers-group">
        
        </g>

        <text id="clockText" class="clock-text" x="0" y="-17%">MON 31</text>

        <g id="shadowGroupHour">
          <g id="hourHand">
            <line class="hand" x1="0" y1="0" x2="0" y2="-42"/>
            <line class="hand hand-thick" x1="0" y1="-12" x2="0" y2="-42"/>
            <g id="hourHandInner">
              <line class="hand" x1="0" y1="-12" x2="0" y2="-42"/>
            </g>
          </g>
        </g>
        <g id="shadowGroupMinute">
          <g id="minHand">
            <line class="hand" x1="0" y1="0" x2="0" y2="-84"/>
            <line class="hand hand-thick" x1="0" y1="-12" x2="0" y2="-84"/>
            <g id="minHandInner">
              <line class="hand" x1="0" y1="-12" x2="0" y2="-84"/>
            </g>
            <circle class="center-bottom" r="3.5"/>
          </g>
        </g>

        <g id="secHand">
          <line class="hand-sec" x1="0" y1="12" x2="0" y2="-84"/>
          <circle class="center" r="1.8"/>
        </g>
      </svg>
    `;

    ///////////// узнаем пропорцию экрана для viewbox /////////////
    let windowProportion = window.innerWidth / window.innerHeight;
    function calcViewbox(minSize) {
      windowProportion = window.innerWidth / window.innerHeight;
      let width = windowProportion > 1 ? minSize * windowProportion : minSize;
      let height = windowProportion > 1 ? minSize : minSize / windowProportion;
      let x = -(width / 2);
      let y = -(height / 2);
      return `${x} ${y} ${width} ${height}`;
    }

    function setViewboxAndDrawClock(svgElement, minSize) {
      // Задаем начальный viewBox
      svgElement.setAttribute('viewBox', calcViewbox(minSize));
      // рисуем часы
      clockConstruction(svgElement);

      // Слушаем resize
      window.addEventListener('resize', () => {
        svgElement.setAttribute('viewBox', calcViewbox(minSize));
        // рисуем часы
        clockConstruction(svgElement);
      });
    }

    function clockConstruction(svgElement) {
      const [x, y, width, height] = svgElement.getAttribute('viewBox').split(' ').map(Number);
      
      let minuteGroup = document.querySelector('.minute-markers-group');
      let hourGroup = document.querySelector('.hour-markers-group');

      // Удаляем старые линии:
      minuteGroup.innerHTML = '';
      hourGroup.innerHTML = '';
      
      createMarkers(minuteGroup, hourGroup, width, height);
    }

    // setViewboxAndDrawClock(timerImageGroup.querySelector('svg'), 48);
    setViewboxAndDrawClock(circularImageGroup.querySelector('svg'), 200);

    ///////////// циферблат формируем /////////////
    /*
    // простой круглый циферблат
    const minuteGroup = document.querySelector('.minute-markers-group');
    const hourGroup = document.querySelector('.hour-markers-group');

    const radiusOuter = 95;
    const radiusOuterNarrow = 80;
    const minuteLength = 6;
    const hourLength = 15;

    for (let i = 0; i < 60; i++) {
      const angle = (i * 6) * Math.PI / 180;
      const x1 = radiusOuter * Math.cos(angle);
      const y1 = radiusOuter * Math.sin(angle);
      const x2 = (radiusOuter - minuteLength) * Math.cos(angle);
      const y2 = (radiusOuter - minuteLength) * Math.sin(angle);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', 'var(--dark-color)');
      line.setAttribute('stroke-linecap', 'round');

      // Каждая пятая засечка — темнее и толще
      if (i % 5 === 0) {
        line.setAttribute('stroke-width', '3');
        line.setAttribute('opacity', '0.6');
      } else {
        line.setAttribute('stroke-width', '2');
        line.setAttribute('opacity', '0.2');
      }

      minuteGroup.appendChild(line);
    }

    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) * Math.PI / 180;
      const x1 = radiusOuterNarrow * Math.cos(angle);
      const y1 = radiusOuterNarrow * Math.sin(angle);
      const x2 = (radiusOuterNarrow - hourLength) * Math.cos(angle);
      const y2 = (radiusOuterNarrow - hourLength) * Math.sin(angle);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', 'var(--dark-color)');
      line.setAttribute('stroke-width', '4');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('opacity', '0.85');

      hourGroup.appendChild(line);
    }
    */

    // динамический прямоугольный циферблат как у Apple Watch
    function createMarkers(minuteGroup, hourGroup, width, height) {
      const halfWidth = width / 2;
      const halfHeight = height / 2;

      // const minuteOffset = 5; // отступ для минутной засечки
      // const hourOffset = 15;  // отступ для часовой засечки

      for (let i = 0; i < 60; i++) {
        const angle = (i * 6) * Math.PI / 180;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Пересечение с прямоугольником
        let rX = (halfWidth * 0.97) / Math.abs(cosA);
        let rY = (halfHeight * 0.97) / Math.abs(sinA);

        // Если cos или sin равен нулю, избегаем деления на ноль
        if (Math.abs(cosA) < 0.0001) rX = Infinity;
        if (Math.abs(sinA) < 0.0001) rY = Infinity;

        const r = Math.min(rX, rY);
        let minuteOffset = r * 0.05;

        // Новый: фиксируем отступ от края
        const x1 = cosA * r;
        const y1 = sinA * r;
        const x2 = cosA * (r - minuteOffset);
        const y2 = sinA * (r - minuteOffset);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'var(--dark-color)');
        line.setAttribute('stroke-linecap', 'round');

        if (i % 5 === 0) {
          line.setAttribute('stroke-width', '3');
          line.setAttribute('opacity', '0.6');
        } else {
          line.setAttribute('stroke-width', '2');
          line.setAttribute('opacity', '0.2');
        }

        minuteGroup.appendChild(line);
      }

      for (let i = 0; i < 12; i++) {
        const angle = (i * 30) * Math.PI / 180;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        let rX = (halfWidth * 0.84) / Math.abs(cosA);
        let rY = (halfHeight * 0.84) / Math.abs(sinA);

        if (Math.abs(cosA) < 0.0001) rX = Infinity;
        if (Math.abs(sinA) < 0.0001) rY = Infinity;

        const r = Math.min(rX, rY);
        let hourOffset = r * 0.2;

        const x1 = cosA * r;
        const y1 = sinA * r;
        const x2 = cosA * (r - hourOffset);
        const y2 = sinA * (r - hourOffset);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'var(--dark-color)');
        line.setAttribute('stroke-width', '4');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('opacity', '0.85');

        hourGroup.appendChild(line);
      }
    }

    ////////////////////////////////////////////////////
    ////////////////////////////////////////////////////

    // toggle between diffenent clocks
    if (data.clockType === 'circular' && data.timer === 'currenttime') {
      timerImageGroup.classList.add('hidden');
      circularImageGroup.classList.remove('hidden');
      setupCircularClock();
    } else {
      timerImageGroup.classList.remove('hidden');
      circularImageGroup.classList.add('hidden');
    }

    ////////////////////////////////////////////////////
    ////////////////////////////////////////////////////

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

    // color theme setup
    let themeColors = data.theme.toLowerCase();
    // console.log(themeColors);
    themeColors = themeColors.split('+');
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
    // modify some themes for circular clock

    if (bodyBg === '#8e8e93') {
      // golden accent for darkish bg color theme
      circularImageGroup.style.setProperty('--accent', 'gold');
    } else if (messageBg === '#ff2d55') {
      // green accent for reddish hand color theme
      circularImageGroup.style.setProperty('--accent', 'rgb(67, 220, 17)');
    } else if (messageBg === '#ffcc00') {
      // blue accent for yellowish hand color theme
      circularImageGroup.style.setProperty('--accent', 'rgb(20, 118, 255)');
    } else {
      circularImageGroup.removeAttribute('style');
    }

    ////////////////////////////////////////////////////
    // modify some themes for numeric clock

    if(data.timer !== 'currenttime') {
      if (bodyBg === '#8e8e93' || bodyBg === '#6ea5d0' || bodyBg === '#a7d29a' || bodyBg === '#f5d261') {
        timerImageGroup.querySelector('#numericFrontGroup').style.setProperty('--font-color', '#191919');
        timerImageGroup.querySelector('#numericFrontGroup').style.setProperty('--message-bg', bodyBg);
      } else {
        timerImageGroup.querySelector('#numericFrontGroup').removeAttribute('style');
      }
    } else {
      timerImageGroup.querySelector('#numericFrontGroup').removeAttribute('style');
    }

    ////////////////////////////////////////////////////
    // 🟢 fill inputs fields
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
        if(el.value.toLowerCase() === data.theme.toLowerCase()) {
          el.setAttribute('checked', '');
        }
      });
    }

    /////  timer/clock inputs  /////
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
    let clockInputs = clocksContainer.querySelectorAll('input');
    clockInputs.forEach((el) => {
        el.removeAttribute('checked'); // reset clock inputs
    });
    if(data.clockType === 'circular') {
      clockInputs[0].setAttribute('checked', '');
    } else {
      clockInputs[1].setAttribute('checked', '');
    }

    // switch mode and clean previous timer
    if (data.timer === 'timegoesup') {
      switchMode(data.timer, data.pausedSeconds);
    } else if (data.timer === 'timegoesdown') {
      switchMode(data.timer, '', data.timeForTimer, data.pausedSecondsTimer);
    } else {
      switchMode(data.timer);
    }

    // update paused seconds
    pausedSeconds = data.pausedSeconds;
    pausedSecondsTimer = data.pausedSecondsTimer;
    timerSeconds = data.timeForTimer;

    // 🟢🟢🟢 fill timeSet inputs for timer 🟢🟢🟢
    let h = Math.floor(timerSeconds / 3600);
    let m = Math.floor((timerSeconds % 3600) / 60);
    let s = timerSeconds % 60;

    hours.value = h > 0 ? h : '';
    minutes.value = m > 0 ? m : '';
    seconds.value = s > 0 ? s : '';

    // set status for timer
    if (data.type === 'timer') {
      if (data.timer === 'currenttime') { // ignore all if clock
        start();
      } else {
        console.log(data.timerStatus);
        if (data.timerStatus === 'start') start(pausedSeconds, timerSeconds, pausedSecondsTimer);
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
    if (data.mediaLink) {
      const img = document.querySelector('.message-card img');
      if (img.complete) {
        bubbleHeightCheck();
      } else {
        img.addEventListener('load', bubbleHeightCheck);
      }
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

///////////////////////////////////////////////////////////
/////////////     🟣🟣🟣 room update 🟣🟣🟣     ////////////
///////////////////////////////////////////////////////////

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
  // console.log(payload);

  // setup gallery slides
  let galleryData = [];
  let slides = slidesGroup.querySelectorAll('input');
  // console.log(slides[0].value);
  for(let i = 0; i < slides.length; i++) {
    galleryData.push(slides[i].value);
  } 

  ////////////////////////////////////////////////////////////////////////
  console.log('current mode: ' + mode);
  try {
    await updateDoc(doc(db, 'rooms', auth.currentUser.uid), {
      mediaLink: payload.mediaLink,
      message: payload.message,
      numberOfSlides: payload.numberOfSlides,
      slidesLinks: galleryData,
      theme: payload.theme==="magic+magic+magic"?`magic+magic+magic+${Math.random()}`:payload.theme.toLowerCase(),
      timer: payload.timer,
      timeForTimer: calculateSecondsForTimer(),
      pausedSecondsTimer: mode==='timegoesdown'?calculateSecondsForTimer():pausedSecondsTimer,
      timerStatus: 'start', // auto switch to start
      clockType: payload.clockType,
      updater: Math.random() // 🟣🟣🟣 it always uploads something unique !!!
    });
  } catch (err) {
    console.log(err.message);
  }
  ////////////////////////////////////////////////////////////////////////
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

// toggle with swipes
swipeListener(
  () => {
    console.log('Свайп вправо!');
    if(timerBtn.classList.contains('active')) {
      timerBtn.classList.remove('active');
      messageBtn.classList.add('active');
    } else if (galleryBtn.classList.contains('active')) {
      galleryBtn.classList.remove('active');
      timerBtn.classList.add('active');
    } else if (messageBtn.classList.contains('active')) {
      messageBtn.classList.remove('active');
      galleryBtn.classList.add('active');
    }

    activateRoomType(getSelectedType());
  },
  () => {
    console.log('Свайп влево!');
    if(timerBtn.classList.contains('active')) {
      timerBtn.classList.remove('active');
      galleryBtn.classList.add('active');
    } else if (galleryBtn.classList.contains('active')) {
      galleryBtn.classList.remove('active');
      messageBtn.classList.add('active');
    } else if (messageBtn.classList.contains('active')) {
      messageBtn.classList.remove('active');
      timerBtn.classList.add('active');
    }

    activateRoomType(getSelectedType());
  }
);

function getSelectedType() {
  let activeBtn = roomToggle.querySelector('.active');

  let selectedType = '';
  if(activeBtn.id === 'timerBtn') {
    selectedType = 'timer';
  } else if (activeBtn.id === 'galleryBtn') {
    selectedType = 'gallery';
  } else if (activeBtn.id === 'messageBtn') {
    selectedType = 'message';
  }
  return selectedType;
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

/////////////////////////////////////////
//    🟠🟠🟠 Timer Controller 🟠🟠🟠    //
/////////////////////////////////////////

// default Data for Timer
let intervalId = null;
let secondsPassed = 0;
// 'stopwatch (timegoesup)' | 'timer (timegoesdown)' | 'clock (currenttime)'
let mode = 'timegoesup';
let isRunning = false;
let pausedSeconds = 0;
let pausedSecondsTimer = 0;
let timerSeconds = 0;

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


function switchMode(newMode, pausedSeconds, timerSeconds, pausedSecondsTimer) {
  pause();
  mode = newMode;

  // retrieve current seconds from firebase:
  if (pausedSeconds) secondsPassed = pausedSeconds;
  if (timerSeconds)  secondsPassed = timerSeconds;
  if (pausedSecondsTimer) secondsPassed = pausedSecondsTimer;
  // 🟧🟧🟧
  updateDisplay();
}

function start(xxx, yyy, ttt) {
  if (isRunning) return;
  isRunning = true;

  if (mode === 'currenttime') {
    // smooth (60fps)
    intervalId = requestAnimationFrame(updateClock);

    // steps (per second)
    // updateClock();
    // intervalId = setInterval(updateClock, 1000);
  } else {
    // retrieve current seconds from firebase:
    secondsPassed = xxx;
    if (mode === 'timegoesdown') secondsPassed = ttt;
    // 🟧🟧🟧

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
      if (mode === 'timegoesdown') pausedSecondsTimer = secondsPassed;
    }, 1000);
  }
}

function pause() {
  isRunning = false;
  cancelAnimationFrame(intervalId);
  clearInterval(intervalId);
  intervalId = null;
}

function reset() {
  pause();
  if (mode === 'timegoesup') secondsPassed = 0;
  if (mode === 'timegoesdown') secondsPassed = calculateSecondsForTimer();
  updateDisplay();
}

function updateDisplay() {
  let display = '00:00';
  if (mode === 'currenttime') return; // часы обновляются отдельно
  const minutes = Math.floor(secondsPassed / 60).toString().padStart(2, '0');
  const seconds = (secondsPassed % 60).toString().padStart(2, '0');

  firstNumberBack.textContent = minutes[0];
  secondNumberBack.textContent = minutes[1];
  thirdNumberBack.textContent = seconds[0];
  fourthNumberBack.textContent = seconds[1];

  firstNumberFront.textContent = minutes[0];
  secondNumberFront.textContent = minutes[1];
  thirdNumberFront.textContent = seconds[0];
  fourthNumberFront.textContent = seconds[1];

  // timerImageGroup.setAttribute('style', `--dynamic-mask: ${seconds*(100/60)}%`);
  timerImageGroup.setAttribute('style', `--dynamic-mask: 0%`);
}

function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  // timerTextFront.textContent = `${hours}:${minutes}`;
  // timerTextBack.textContent = `${hours}:${minutes}`;

  firstNumberBack.textContent = hours[0];
  secondNumberBack.textContent = hours[1];
  thirdNumberBack.textContent = minutes[0];
  fourthNumberBack.textContent = minutes[1];

  firstNumberFront.textContent = hours[0];
  secondNumberFront.textContent = hours[1];
  thirdNumberFront.textContent = minutes[0];
  fourthNumberFront.textContent = minutes[1];

  // clock with seconds
  // const s = now.getSeconds().toString().padStart(2, '0');
  // timerText.textContent = `${h}:${m}:${s}`;
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000; // smooth
  timerImageGroup.setAttribute('style', `--dynamic-mask: ${seconds*(100/60)}%`);

  intervalId = requestAnimationFrame(updateClock); // 60fps
}

///////////////////////////////
// toggle timer control panel
function setupTimerButtons(timerType) {
  // console.log(timerType);
  if (timerType === 'currenttime') {
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

async function uploadPausedSeconds(pausedSeconds, pausedSecondsTimer) {
  if (mode === 'timegoesup') {
    try {
      await updateDoc(doc(db, 'rooms', auth.currentUser.uid), {
        pausedSeconds: pausedSeconds,
      });
    } catch (err) {
      console.log(err.message);
    }
  } else if (mode === 'timegoesdown') {
    try {
      await updateDoc(doc(db, 'rooms', auth.currentUser.uid), {
        pausedSecondsTimer: pausedSecondsTimer
      });
    } catch (err) {
      console.log(err.message);
    }
  }
}

startBtn.addEventListener('click', ()=>{
  uploadTimerStatus('start');
});

pauseBtn.addEventListener('click', ()=>{
  uploadTimerStatus('pause');
  uploadPausedSeconds(pausedSeconds, pausedSecondsTimer); // memorize paused seconds
});

resetBtn.addEventListener('click', ()=>{
  uploadTimerStatus('reset');
  uploadPausedSeconds(0, calculateSecondsForTimer()); // reset seconds to zero or to initial value
});

// setup current time for timer from inputs
function calculateSecondsForTimer() {
  return (+hours.value*60*60) + (+minutes.value*60) + (+seconds.value);
}

//////////////////////////
//    circular clock    //
//////////////////////////

function setupCircularClock() {
  let showDate = true;

  function animateClock() {
    const date = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const amPm = date.getHours() >= 12 ? "PM" : "AM";
    const hour = date.getHours() + date.getMinutes() / 60; // плавный ход
    const min = date.getMinutes() + date.getSeconds() / 60; // плавный ход
    const sec = date.getSeconds() + date.getMilliseconds() / 1000; // плавный ход

    clockText.textContent = showDate ? `${dayName} ${day}` : amPm;
    hourHand.setAttribute('transform', `rotate(${(360 / 12) * hour})`);
    minHand.setAttribute('transform', `rotate(${(360 / 60) * min})`);
    secHand.setAttribute('transform', `rotate(${(360 / 60) * sec})`);

    requestAnimationFrame(animateClock);
  }
  requestAnimationFrame(animateClock);

  clockText.addEventListener('click', () => {
    showDate = !showDate;
  });
}