const state = {
      todos: JSON.parse(localStorage.getItem('my_todos')) || [],
      notes: JSON.parse(localStorage.getItem('my_notes')) || [
        { id: 1, title: 'Welcome Note', body: 'Welcome to My Productivity Dashboard! Manage tasks, set timers, and take notes smoothly.', date: new Date().toISOString() }
      ],
      activeNoteId: null,
      timerSessions: parseInt(localStorage.getItem('timer_sessions')) || 0,
      currentFilter: 'all',
      calcExpression: '',
      currentDate: new Date()
    };

    function saveState() {
      localStorage.setItem('my_todos', JSON.stringify(state.todos));
      localStorage.setItem('my_notes', JSON.stringify(state.notes));
      localStorage.setItem('timer_sessions', state.timerSessions.toString());
      updateDashboardStats();
    }
/* =========================================================
   NAVIGATION
   ========================================================= */

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

const pages = document.querySelectorAll('.page');
const navItems = document.querySelectorAll('.nav-item');


/* =========================================================
   DESKTOP SIDEBAR
   ========================================================= */

function toggleMenu() {

    // Mobile / iPhone uses permanent bottom navigation.
    // Do not open/close the sidebar there.
    if (window.innerWidth <= 768) {
        return;
    }

    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}


/* =========================================================
   MENU BUTTON
   ========================================================= */

if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
}


/* =========================================================
   OVERLAY
   ========================================================= */

if (overlay) {
    overlay.addEventListener('click', () => {

        if (window.innerWidth <= 768) {
            return;
        }

        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
}


/* =========================================================
   PAGE SWITCH
   ========================================================= */

function switchPage(index) {

    /* -----------------------------------------
       Change active page
       ----------------------------------------- */

    pages.forEach((page, idx) => {

        if (idx === index) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }

    });


    /* -----------------------------------------
       Change active navigation item
       ----------------------------------------- */

    navItems.forEach((item, idx) => {

        if (idx === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }

    });


    /* -----------------------------------------
       Desktop only:
       close sidebar after selecting page
       ----------------------------------------- */

    if (window.innerWidth > 768) {

        sidebar.classList.remove('active');
        overlay.classList.remove('active');

    }


    /* -----------------------------------------
       Update dashboard
       ----------------------------------------- */

    updateDashboardStats();


    /* -----------------------------------------
       Calendar
       ----------------------------------------- */

    if (index === 5) {
        renderCalendar();
    }


    /* -----------------------------------------
       Scroll to top on mobile
       ----------------------------------------- */

    if (window.innerWidth <= 768) {

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    }
}


/* =========================================================
   RESPONSIVE NAVIGATION
   ========================================================= */

function handleNavigationResize() {

    if (window.innerWidth <= 768) {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');

    }

}


/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener('resize', handleNavigationResize);


/* Run once when page loads */

handleNavigationResize();

    function updateDashboardStats() {
      const totalTasks = state.todos.length;
      const completedTasks = state.todos.filter(t => t.completed).length;

      document.getElementById('dash-total-tasks').innerText = totalTasks;
      document.getElementById('dash-completed-tasks').innerText = completedTasks;
      document.getElementById('dash-timer-sessions').innerText = state.timerSessions;
      document.getElementById('dash-notes-count').innerText = state.notes.length;

      const recentList = document.getElementById('dash-recent-tasks');
      recentList.innerHTML = '';
      const recentTasks = state.todos.filter(t => !t.completed).slice(-4).reverse();

      if (recentTasks.length === 0) {
        recentList.innerHTML = `<li style="color:var(--text-muted); font-size:13px;">No active tasks remaining!</li>`;
      } else {
        recentTasks.forEach(task => {
          const li = document.createElement('li');
          li.className = 'task-item';
          li.innerHTML = `
            <div class="task-left">
              <span class="task-text">${escapeHtml(task.text)}</span>
            </div>
            <span class="tag tag-${task.category.toLowerCase()}">${task.category}</span>
          `;
          recentList.appendChild(li);
        });
      }
    }

    const todoInput = document.getElementById('todoInput');
    const todoCategory = document.getElementById('todoCategory');
    const addTodoBtn = document.getElementById('addTodoBtn');
    const todoList = document.getElementById('todoList');

    function addTodo() {
      const text = todoInput.value.trim();
      if (!text) return;

      state.todos.push({
        id: Date.now(),
        text: text,
        category: todoCategory.value,
        completed: false
      });

      todoInput.value = '';
      saveState();
      renderTodos();
    }

    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTodo();
    });

    function toggleTodo(id) {
      state.todos = state.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      saveState();
      renderTodos();
    }

    function deleteTodo(id) {
      state.todos = state.todos.filter(t => t.id !== id);
      saveState();
      renderTodos();
    }

    function setTodoFilter(filter, btn) {
      state.currentFilter = filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTodos();
    }

    function renderTodos() {
      todoList.innerHTML = '';
      let filtered = state.todos;

      if (state.currentFilter === 'active') filtered = state.todos.filter(t => !t.completed);
      if (state.currentFilter === 'completed') filtered = state.todos.filter(t => t.completed);

      if (filtered.length === 0) {
        todoList.innerHTML = `<li style="color:var(--text-muted); font-size:14px; text-align:center; padding: 20px;">No tasks found.</li>`;
        return;
      }

      filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
          <div class="task-left">
            <div class="checkbox" onclick="toggleTodo(${task.id})"><i class="ri-check-line"></i></div>
            <span class="task-text">${escapeHtml(task.text)}</span>
          </div>
          <span class="tag tag-${task.category.toLowerCase()}">${task.category}</span>
          <button class="btn-icon" onclick="deleteTodo(${task.id})"><i class="ri-delete-bin-line"></i></button>
        `;
        todoList.appendChild(li);
      });
    }

    let timerInterval = null;
    let timerSeconds = 25 * 60;
    let totalTimerSeconds = 25 * 60;
    let isTimerRunning = false;

    const timerDisplay = document.getElementById('timerDisplay');
    const timerProgress = document.getElementById('timerProgress');
    const timerStartBtn = document.getElementById('timerStartBtn');
    const timerStatus = document.getElementById('timerStatus');

    function updateTimerUI() {
      const mins = Math.floor(timerSeconds / 60);
      const secs = timerSeconds % 60;
      timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      const totalDash = 691;
      const progressRatio = timerSeconds / totalTimerSeconds;
      const offset = totalDash - (progressRatio * totalDash);
      timerProgress.style.strokeDashoffset = offset;
    }

    function toggleTimer() {
      if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerStartBtn.innerHTML = `<i class="ri-play-fill"></i> Start`;
      } else {
        isTimerRunning = true;
        timerStartBtn.innerHTML = `<i class="ri-pause-fill"></i> Pause`;
        timerInterval = setInterval(() => {
          if (timerSeconds > 0) {
            timerSeconds--;
            updateTimerUI();
          } else {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timerStartBtn.innerHTML = `<i class="ri-play-fill"></i> Start`;
            state.timerSessions++;
            saveState();
            alert('Focus session completed! Great job.');
          }
        }, 1000);
      }
    }

    function resetTimer() {
      clearInterval(timerInterval);
      isTimerRunning = false;
      timerSeconds = totalTimerSeconds;
      timerStartBtn.innerHTML = `<i class="ri-play-fill"></i> Start`;
      updateTimerUI();
    }

    function setTimerMode(mins, statusText, btn) {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      totalTimerSeconds = mins * 60;
      timerSeconds = totalTimerSeconds;
      timerStatus.innerText = statusText;
      resetTimer();
    }

    const notesList = document.getElementById('notesList');
    const noteTitle = document.getElementById('noteTitle');
    const noteBody = document.getElementById('noteBody');

    function renderNotes() {
      const query = document.getElementById('noteSearch').value.toLowerCase();
      notesList.innerHTML = '';

      const filtered = state.notes.filter(n => n.title.toLowerCase().includes(query) || n.body.toLowerCase().includes(query));

      filtered.forEach(note => {
        const card = document.createElement('div');
        card.className = `note-card ${note.id === state.activeNoteId ? 'active' : ''}`;
        card.onclick = () => selectNote(note.id);
        card.innerHTML = `
          <h4>${escapeHtml(note.title || 'Untitled Note')}</h4>
          <p>${escapeHtml(note.body || 'No description...')}</p>
        `;
        notesList.appendChild(card);
      });
    }

    function selectNote(id) {
      state.activeNoteId = id;
      const note = state.notes.find(n => n.id === id);
      if (note) {
        noteTitle.value = note.title;
        noteBody.value = note.body;
      }
      renderNotes();
    }

    function createNewNote() {
      const newNote = {
        id: Date.now(),
        title: 'New Note',
        body: '',
        date: new Date().toISOString()
      };
      state.notes.unshift(newNote);
      saveState();
      selectNote(newNote.id);
    }

    function saveCurrentNote() {
      if (!state.activeNoteId) return;
      state.notes = state.notes.map(n => {
        if (n.id === state.activeNoteId) {
          return { ...n, title: noteTitle.value, body: noteBody.value };
        }
        return n;
      });
      saveState();
      renderNotes();
    }

    function deleteCurrentNote() {
      if (!state.activeNoteId) return;
      state.notes = state.notes.filter(n => n.id !== state.activeNoteId);
      state.activeNoteId = state.notes.length > 0 ? state.notes[0].id : null;
      if (state.activeNoteId) {
        selectNote(state.activeNoteId);
      } else {
        noteTitle.value = '';
        noteBody.value = '';
      }
      saveState();
      renderNotes();
    }

    const calcHistory = document.getElementById('calcHistory');
    const calcOutput = document.getElementById('calcOutput');

    function calcInput(val) {
      if (state.calcExpression === '0' && !isNaN(val)) {
        state.calcExpression = val;
      } else {
        state.calcExpression += val;
      }
      calcOutput.innerText = state.calcExpression || '0';
    }

    function calcClear() {
      state.calcExpression = '';
      calcHistory.innerText = '';
      calcOutput.innerText = '0';
    }

    function calcBackspace() {
      state.calcExpression = state.calcExpression.slice(0, -1);
      calcOutput.innerText = state.calcExpression || '0';
    }

    function calcEvaluate() {
      try {
        calcHistory.innerText = state.calcExpression;
        const result = Function(`'use strict'; return (${state.calcExpression})`)();
        state.calcExpression = String(result);
        calcOutput.innerText = state.calcExpression;
      } catch (err) {
        calcOutput.innerText = 'Error';
        state.calcExpression = '';
      }
    }

    function renderCalendar() {
      const monthYearHeader = document.getElementById('calMonthYear');
      const calendarDays = document.getElementById('calendarDays');
      calendarDays.innerHTML = '';

      const date = state.currentDate;
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      monthYearHeader.innerText = `${monthNames[month]} ${year}`;

      const firstDayIndex = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();

      for (let x = 0; x < firstDayIndex; x++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'cal-day empty';
        calendarDays.appendChild(emptyDiv);
      }

      const today = new Date();
      for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'cal-day';
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
          dayDiv.classList.add('today');
        }

        dayDiv.innerHTML = `<span class="cal-day-number">${day}</span>`;
        calendarDays.appendChild(dayDiv);
      }
    }

    function changeMonth(delta) {
      state.currentDate.setMonth(state.currentDate.getMonth() + delta);
      renderCalendar();
    }

    // Helper Utility Functions
    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    window.onload = function() {
      renderTodos();
      updateDashboardStats();
      if (state.notes.length > 0) selectNote(state.notes[0].id);
      updateTimerUI();
    };