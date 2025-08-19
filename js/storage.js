// js/info.js
(function (global) {
  const props = global.__PAGE_PROPS__ || {};

  // 전역 상태 보관소
  const App = global.App || {};
  App.grade = props.grade;          // ex) 1
  App.section = props.section;      // ex) 3
  App.config = props.config || { classSize: 30, skipNumbers: [] };
  App.serverNow = props.serverNow;  // 서버 시각

  // 다른 곳에서 import 없이 window.App으로 접근 가능
  global.App = App;

  // 디버그용(원하면 지워도 됨)
  // console.log("[App]", App);
})(window);

$(".ultraman").hide();
/* ===================== 저장/복원 (localStorage) ===================== */
const STORAGE_KEY = 'modernClock.magnets.v1';

function saveState() {
  const magnets = {};
  document.querySelectorAll('.magnet:not(.placeholder)').forEach(m => {
    const num = m.dataset.number;
    const data = {};
    if (m.dataset.reason) data.reason = m.dataset.reason;
    if (m.classList.contains('attached')) {
      const section = m.closest('.board-section');
      data.attachedTo = section ? section.dataset.category : null;
    } else {
      data.attachedTo = null;
      data.left = parseFloat(m.style.left) || 0;
      data.top  = parseFloat(m.style.top)  || 0;
    }
    magnets[num] = data;
  });
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ v:1, magnets })); }
  catch (e) { console.warn('saveState failed:', e); }
}

function loadState() {
  let parsed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    parsed = JSON.parse(raw);
  } catch (e) {
    console.warn('loadState failed:', e);
    return;
  }
  if (!parsed || !parsed.magnets) return;

  Object.entries(parsed.magnets).forEach(([num, data]) => {
    const m = document.querySelector(`.magnet[data-number="${num}"]`);
    if (!m) return;

    // 이유 복원
    if (data.reason) {
      m.dataset.reason = data.reason;
      m.classList.add('has-reason');
    } else {
      delete m.dataset.reason;
      m.classList.remove('has-reason');
    }

    // 위치/소속 복원
    if (data.attachedTo) {
      const content = document.querySelector(`.board-section[data-category="${data.attachedTo}"] .section-content`);
      if (content) {
        m.classList.add('attached');
        m.style.left = '';
        m.style.top  = '';
        m.style.transform = '';
        content.appendChild(m);
      }
    } else {
      m.classList.remove('attached');
      const home = gridPos[+num] || { left: 0, top: 0 };
      m.style.left = ((data.left ?? home.left) + 0) + 'px';
      m.style.top  = ((data.top  ?? home.top)  + 0) + 'px';
      m.style.transform = 'translate(0,0)';
    }
  });

  sortAllSections();
  updateAttendance();
  updateMagnetOutline();
  updateEtcReasonPanel();
}

function resetSavedState() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}