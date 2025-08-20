/* ===================== 시간 기반 이벤트 이미지 ===================== */
const displayedEvents = {};

function updateEventImage(phase) {
    const container = document.getElementById('timeEventContainer');
    if (!container) return;

    const breakImg = document.getElementById('eventImageBreak');
    const studyImg = document.getElementById('eventImageStudy');
    const lunchImg = document.getElementById('eventImageLunch');

    if (!phase) {
        // If there's no active phase, ensure everything is hidden.
        container.classList.remove('visible');
        [breakImg, studyImg, lunchImg].forEach(img => img.classList.remove('active'));
        return;
    }

    // Create a unique key for this specific event instance (date + phase start time)
    const eventKey = `${new Date().toDateString()}_${phase.label}_${phase.startMin}`;

    // If this event's image has already been shown, do nothing.
    if (displayedEvents[eventKey]) {
        return;
    }

    let activeImage = null;
    const label = phase.label;

    if (label.includes('쉬는 시간')) {
        activeImage = breakImg;
    } else if (label.includes('자습') || label.includes('방과후') || label.includes('야자') || label.includes('아침 시간')) {
        activeImage = studyImg;
    } else if (label.includes('점심') || label.includes('저녁')) {
        activeImage = lunchImg;
    }

    if (activeImage) {
        // Mark as displayed
        displayedEvents[eventKey] = true;

        // Show the container and the active image
        container.classList.add('visible');
        activeImage.classList.add('active');

        // Hide it after 5 seconds
        setTimeout(() => {
            activeImage.classList.add('hiding');

            // Wait for the disappear animation to finish before hiding the container
            activeImage.addEventListener('animationend', () => {
                container.classList.remove('visible');
                activeImage.classList.remove('active');
                activeImage.classList.remove('hiding');
            }, { once: true });
        }, 5000); // 5 seconds
    }
}

/* ===================== 전체화면/시계 ===================== */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        document.body.classList.add('fullscreen');
      }).catch(()=>{});
    }
  }
  function exitFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        document.body.classList.remove('fullscreen');
      }).catch(()=>{});
    }
  }
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) document.body.classList.remove('fullscreen');
  });

  function updateClock() {
  const now = new Date();

  // ===== 1) 디지털 시계 =====
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('hours').textContent = h;
  document.getElementById('minutes').textContent = m;
  document.getElementById('seconds').textContent = s;

  const days = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  document.getElementById('date').textContent =
    `${months[now.getMonth()]} ${now.getDate()}일 ${days[now.getDay()]}`;

  // ===== 2) 아날로그 바늘 =====
  const hoursDeg = (now.getHours() % 12) * 30 + (now.getMinutes() * 0.5);
  const minutesDeg = now.getMinutes() * 6 + (now.getSeconds() * 0.1);
  const secondsDeg = now.getSeconds() * 6;
  document.getElementById('hourHand').style.transform   = `translateX(-50%) rotate(${hoursDeg}deg)`;
  document.getElementById('minuteHand').style.transform = `translateX(-50%) rotate(${minutesDeg}deg)`;
  document.getElementById('secondHand').style.transform = `translateX(-50%) rotate(${secondsDeg}deg)`;
  const sh = document.getElementById('secondHand');
  sh.style.transition = 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
  if (now.getSeconds() == 59) { // 59.5초에 베지어 없애고 각도 초기화
    setTimeout(() => {
      sh.style.transition = '';
      sh.style.transform = 'translateX(-50%) rotate(-6deg)';
    }, 500);
  }

  // ===== 3) 구간(phase) 정의 & 찾기 =====
  // 분 단위로 하루 타임라인 정의 (startMin <= 현재 < endMin)
  const PHASES = [
    { label: '아침 시간',    startMin: 0,              endMin: 8*60 + 15 }, // 00:00 ~ 08:15
    { label: '아침 자습',    startMin: 8*60 + 15,      endMin: 8*60 + 50 }, // 08:15 ~ 08:50
    { label: '아침 조회',    startMin: 8*60 + 50,      endMin: 9*60      }, // 08:50 ~ 09:00
    { label: '오전 수업 시간',    startMin: 9*60,      endMin: 12*60 + 50 }, //9:00 ~ 12:50
    { label: '점심 시간',    startMin: 12*60 + 50,      endMin: 13*60 + 10 }, //12:50 ~ 1:50
    { label: '오후 수업 시간',    startMin: 13*60,      endMin: 16*60 + 40 }, //13:50 ~ 16:40
    { label: '청소 시간',    startMin: 16*60 + 40,      endMin: 17*60 }, //16:40 ~ 17:00
    { label: '종례',    startMin: 17*60,      endMin: 17*60 + 10}, //17:00 ~ 17:10
    { label: '방과후 1타임',  startMin: 17*60 + 10,     endMin: 17*60 + 50 }, // 17:10 ~ 17:50
    { label: '쉬는 시간',    startMin: 17*60 + 50,     endMin: 17*60 + 55 }, // 17:50 ~ 17:55
    { label: '방과후 2타임',  startMin: 17*60 + 55,     endMin: 18*60 + 35 }, // 17:55 ~ 18:35
    { label: '저녁 시간',    startMin: 18*60 + 35,     endMin: 19*60 + 50 }, // 18:35 ~ 19:50
    { label: '야자 1타임',   startMin: 19*60 + 50,     endMin: 21*60 + 10 }, // 19:50 ~ 21:10
    { label: '쉬는 시간',    startMin: 21*60 + 10,     endMin: 21*60 + 30 }, // 21:10 ~ 21:30
    { label: '야자 2타임',   startMin: 21*60 + 30,     endMin: 22*60 + 50 }, // 21:30 ~ 22:50
    { label: '끝.',         startMin: 22*60 + 50,     endMin: 24*60     }  // 22:50 ~ 24:00
  ];


  const tstatEl = document.getElementById('tstat');
  const pb = document.getElementById('progressbar');
  if (pb) pb.max = 100;

  const curMin = now.getHours()*60 + now.getMinutes();
  let phase = null;
  for (const p of PHASES) {
    if (curMin >= p.startMin && curMin < p.endMin) { phase = p; break; }
  }

  updateEventImage(phase);

  const countdownContainer = document.getElementById('finalCountdown');

  // ===== 4) 특수 카운트다운(22:49:50~22:49:59) =====
  const hh = Number(h), mm = Number(m), ss = Number(s);
  let overrideLabel = null;
  if (hh === 22 && mm === 49 && ss >= 50) {
    overrideLabel = String(60 - ss); // 10~1 초 카운트다운
  }

  // Handle the large countdown display
  if (countdownContainer) {
    if (overrideLabel !== null) {
      countdownContainer.textContent = overrideLabel;
      countdownContainer.classList.add('visible');
    } else {
      countdownContainer.classList.remove('visible');
    }
  }

  // ===== 5) 상태 텍스트 & 불꽃놀이 =====
  if (overrideLabel !== null) {
    tstatEl.textContent = ''; // Hide small counter during big countdown
  } else if (phase) {
    tstatEl.textContent = phase.label;
  } else {
    tstatEl.textContent = '';
  }

  if (phase && phase.label === '끝.') {
    // 하루 종료 연출 (한 번만)
    if (typeof isfired !== 'undefined' && isfired === 0) {
      isfired = 1;
      const container = document.querySelector('.fireworks');
      if (container && window.Fireworks) {
        const fireworks = new Fireworks.default(container);
        fireworks.start();
      }
    }
  }

  // ===== 6) 프로그레스 바(구간 진행률) =====
  if (pb) {
    if (!phase || overrideLabel !== null) {
      // 구간 없음 또는 카운트다운 구간에서는 진행률 0으로
      pb.value = 0;
      pb.title = '';
      pb.style.setProperty('--p', 0); 
    } else {
      const nowSec   = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
      const startSec = phase.startMin * 60;
      const endSec   = phase.endMin * 60;

      const sh = String((phase.startMin-(phase.startMin%60))/60).padStart(2, '0');
      const sm = String(phase.startMin%60).padStart(2, '0');

      const eh = String((phase.endMin-(phase.endMin%60))/60).padStart(2, '0');
      const em = String(phase.endMin%60).padStart(2, '0');

      document.getElementById('start-time').innerHTML = `${sh}:${sm}`  ;
      document.getElementById('end-time').innerHTML = `${eh}:${em}`;
      const total    = Math.max(1, endSec - startSec);
      const elapsed  = Math.min(Math.max(0, nowSec - startSec), total);
      const percent  = Math.round((elapsed / total) * 100);
      pb.value = percent; // 0~100
      pb.title = `${phase.label} · ${percent}% 진행`;
      pb.style.setProperty('--p', percent);
    }
  }
}

  // 초기화
  createMagnets();
  loadState();

  updateAttendance();
  updateEtcReasonPanel();
  updateClock();
  const clockInterval = setInterval(updateClock, 1000);
  // setTimeout(() => {
  //   const sh = document.getElementById('secondHand');
  //   if (sh) sh.style.transition = 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)';

  // }, 1000);
