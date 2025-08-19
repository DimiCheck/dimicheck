    // 게임 FAB 토글 및 메뉴 동작
    (function () {
        const fab = document.getElementById('gameFab');
        const menu = document.getElementById('gameMenu');
        const gomoku = document.getElementById('gomokuItem');
        const speedt = document.getElementById('speedTest');
        const circlet = document.getElementById('circleItem');
        const fireworksBtn = document.getElementById('fireworksItem');
        let menuFireworks = null;
        let fwStopTimer = null;
  
        if (!fab || !menu) return;
  
        function closeMenu() {
          menu.classList.remove('open');
          fab.setAttribute('aria-expanded', 'false');
        }
  
        function toggleMenu(e) {
          e.stopPropagation();
          const isOpen = menu.classList.toggle('open');
          fab.setAttribute('aria-expanded', String(isOpen));
        }
  
        fab.addEventListener('click', toggleMenu);
        document.addEventListener('click', (e) => {
          if (!menu.classList.contains('open')) return;
          const t = e.target;
          if (t === fab || fab.contains(t) || menu.contains(t)) return;
          closeMenu();
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') closeMenu();
        });
  
        if (gomoku) {
          gomoku.addEventListener('click', () => {
            window.location.href = 'gomoku.html';
          });
        }
        if (speedt) {
          speedt.addEventListener('click', () => {
            window.location.href = 'speed.html';
          });
        }
        if (circlet) {
          circlet.addEventListener('click', () => {
            window.location.href = 'circle.html';
          });
        }
        if (fireworksBtn) {
          fireworksBtn.addEventListener('click', () => {
            const container = document.querySelector('.fireworks');
            if (!container || !window.Fireworks) return;
            if (!menuFireworks) menuFireworks = new Fireworks.default(container);
            menuFireworks.start();
            if (fwStopTimer) clearTimeout(fwStopTimer);
            fwStopTimer = setTimeout(() => {
              try {
                if (menuFireworks && typeof menuFireworks.stop === 'function') menuFireworks.stop(true);
              } catch (_) {}
            }, 3500);
            closeMenu();
          });
        }
      })();
  
      $(".analog-clock")
      .on("mousedown touchstart", function () {
        $(".ultraman").show();
      })
      .on("mouseup mouseleave touchend touchcancel", function () {
        $(".ultraman").hide();
      });
  
// 급식 정보 표시 기능
(function () {
    const foodItem = document.getElementById('foodItem');
    if (!foodItem) return;

    foodItem.addEventListener('click', fetchAndShowMeal);

    function getTodayDateString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    async function fetchAndShowMeal() {
        const date = getTodayDateString();
        const url = `https://api.xn--299a1v27nvthhjj.com/meal/${date}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            createMealModal(data);
        } catch (error) {
            console.error('Fetch error:', error);
            alert('급식 정보를 불러오는 데 실패했습니다.');
        }
    }

    function createMealModal(data) {
        // 이전 모달 제거
        const existingModal = document.querySelector('.meal-modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'meal-modal-overlay';

        const content = document.createElement('div');
        content.className = 'meal-modal-content';

        const header = document.createElement('div');
        header.className = 'meal-modal-header';

        const title = document.createElement('h2');
        title.className = 'meal-modal-title';
        title.textContent = `${data.date} 급식 정보`;

        const closeButton = document.createElement('button');
        closeButton.className = 'meal-modal-close';
        closeButton.innerHTML = '&times;';

        const mealGrid = document.createElement('div');
        mealGrid.className = 'meal-grid';

        const breakfastCard = createMealCard('아침', data.breakfast.replaceAll("/", "\n") || '정보 없음');
        const lunchCard = createMealCard('점심', data.lunch.replaceAll("/", "\n") || '정보 없음');
        const dinnerCard = createMealCard('저녁', data.dinner.replaceAll("/", "\n") || '정보 없음');

        mealGrid.append(breakfastCard, lunchCard, dinnerCard);
        header.append(title, closeButton);
        content.append(header, mealGrid);
        overlay.append(content);
        document.body.append(overlay);

        // 애니메이션을 위해 클래스 추가
        setTimeout(() => overlay.classList.add('visible'), 10);

        // 닫기 이벤트
        closeButton.addEventListener('click', () => closeModal(overlay));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay);
            }
        });
    }

    function createMealCard(title, menu) {
        const card = document.createElement('div');
        card.className = 'meal-card';

        const cardTitle = document.createElement('h3');
        cardTitle.className = 'meal-card-title';
        cardTitle.textContent = title;

        const cardMenu = document.createElement('p');
        cardMenu.className = 'meal-card-menu';
        cardMenu.textContent = menu.replace(/\n/g, '\n');

        card.append(cardTitle, cardMenu);
        return card;
    }

    function closeModal(overlay) {
        overlay.classList.remove('visible');
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }
})();

// 시간표 표시 기능
document.addEventListener('DOMContentLoaded', () => {
    const timeItem = document.getElementById('timeItem');
    if (!timeItem) return;

    const timetableModal = document.getElementById('timetableModal');
    const modalClose = timetableModal.querySelector('.modal-close');
    const gradeSelector = document.getElementById('gradeSelector');
    const classSelector = document.getElementById('classSelector');
    const timetableContainer = document.getElementById('timetableContainer');

    const ATPT_OFCDC_SC_CODE = 'J10'; // 경기도교육청
    const SD_SCHUL_CODE = '7530560'; // 한국디지털미디어고등학교
    const API_KEY = 'da82433f0f3a4351bda4ca9a0f11fc7d'; // NEIS API KEY

    let isInitialized = false;

    function formatDate(date) {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return year + month + day;
    }

    function getWeekDays() {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        
        const weekDays = [];
        for (let i = 0; i < 5; i++) {
            const weekDay = new Date(monday);
            weekDay.setDate(monday.getDate() + i);
            weekDays.push(formatDate(weekDay));
        }
        return weekDays;
    }

    function renderTimetable(data) {
        const days = ['월', '화', '수', '목', '금'];
        const maxPeriod = 7;

        let tableHTML = '<table>';
        tableHTML += '<thead><tr><th>교시</th>';
        days.forEach(day => tableHTML += `<th>${day}</th>`);
        tableHTML += '</tr></thead>';
        
        tableHTML += '<tbody>';
        for (let period = 1; period <= maxPeriod; period++) {
            tableHTML += `<tr><td>${period}</td>`;
            for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
                const dayData = data[dayIndex] || [];
                const subject = dayData.find(item => item.PERIO == period)?.ITRT_CNTNT || '';
                tableHTML += `<td>${subject}</td>`;
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';

        timetableContainer.innerHTML = tableHTML;
    }

    // 캐시 유효성 검사
    function isValidWeeklyData(candidate, expectedWeekStart) {
        if (!candidate) return false;
        // 래핑된 형태 { weekStart, savedAt, grade, classNum, data }
        let data = candidate;
        if (!Array.isArray(candidate) && candidate.data) {
            if (expectedWeekStart && candidate.weekStart && String(candidate.weekStart) !== String(expectedWeekStart)) {
                return false; // 주 시작 날짜 불일치
            }
            data = candidate.data;
        }
        if (!Array.isArray(data)) return false;
        if (data.length !== 5) return false; // 평일 5일 분량
        // 각 요일은 배열이어야 하고 전체가 전부 빈 배열이면 무효
        if (!data.every(d => Array.isArray(d))) return false;
        const hasAny = data.some(d => Array.isArray(d) && d.length > 0);
        if (!hasAny) return false;
        // 레코드의 기본 키들이 존재하는지 대략 점검
        const looksReasonable = data.every(day => day.every(r => r && typeof r === 'object' && (
            'PERIO' in r || 'ITRT_CNTNT' in r || 'SUBJECT' in r
        )));
        return looksReasonable;
    }

    function unwrapWeekly(candidate) {
        if (!candidate) return null;
        if (Array.isArray(candidate)) return candidate;
        if (candidate && Array.isArray(candidate.data)) return candidate.data;
        return null;
    }

    async function fetchTimetable(grade, classNum) {
        timetableContainer.innerHTML = '<p>시간표를 불러오는 중입니다...</p>';
        const weekDays = getWeekDays();
        const weekStart = weekDays[0];
        const cacheKey = `timetable_${grade}_${classNum}_${weekStart}`;

        // 캐시 확인 및 유효성 검사
        const cached = loadTimetableData(cacheKey);
        if (isValidWeeklyData(cached, weekStart)) {
            renderTimetable(unwrapWeekly(cached));
            return;
        }

        try {
            const requests = weekDays.map(date => {
                const url = new URL('https://open.neis.go.kr/hub/hisTimetable');
                const params = {
                    KEY: API_KEY,
                    Type: 'json',
                    ATPT_OFCDC_SC_CODE,
                    SD_SCHUL_CODE,
                    GRADE: grade,
                    CLASS_NM: classNum,
                    ALL_TI_YMD: date
                };
                Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
                return fetch(url);
            });

            const responses = await Promise.all(requests);
            const results = await Promise.all(responses.map(res => res.json()));
            
            const weeklyData = results.map(result => {
                if (result.hisTimetable && result.hisTimetable[1] && result.hisTimetable[1].row) {
                    return result.hisTimetable[1].row;
                }
                return [];
            });

            // 비정상/빈 데이터면 재시도 없이 실패 처리
            if (!isValidWeeklyData(weeklyData, weekStart)) {
                throw new Error('수신한 시간표 데이터가 비정상입니다.');
            }

            // 메타 포함하여 저장 (기존 순수 배열 캐시와도 호환)
            const wrapped = {
                weekStart,
                savedAt: Date.now(),
                grade,
                classNum,
                data: weeklyData
            };
            saveTimetableData(cacheKey, wrapped);
            renderTimetable(weeklyData);

        } catch (error) {
            console.error('Failed to fetch timetable:', error);
            timetableContainer.innerHTML = '<p>시간표를 불러오는데 실패했습니다. 다시 시도해주세요.</p>';
        }
    }

    function initTimetablePopup() {
        if (isInitialized) return;

        for (let i = 1; i <= 3; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}학년`;
            gradeSelector.appendChild(option);
        }

        for (let i = 1; i <= 6; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}반`;
            classSelector.appendChild(option);
        }

        const lastGrade = loadTimetableData('last_grade') || '1';
        const lastClass = loadTimetableData('last_class') || '3';

        gradeSelector.value = lastGrade;
        classSelector.value = lastClass;

        gradeSelector.addEventListener('change', updateTimetable);
        classSelector.addEventListener('change', updateTimetable);
        
        isInitialized = true;
    }
    
    function updateTimetable() {
        const grade = gradeSelector.value;
        const classNum = classSelector.value;
        saveTimetableData('last_grade', grade);
        saveTimetableData('last_class', classNum);
        fetchTimetable(grade, classNum);
    }

    function openModal() {
        initTimetablePopup();
        timetableModal.hidden = false;
        document.body.style.overflow = 'hidden';
        updateTimetable();
    }

    function closeModal() {
        timetableModal.hidden = true;
        document.body.style.overflow = 'auto';
    }

    timeItem.addEventListener('click', openModal);
    modalClose.addEventListener('click', closeModal);
    timetableModal.addEventListener('click', (e) => {
        if (e.target === timetableModal) {
            closeModal();
        }
    });
});
