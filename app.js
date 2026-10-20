/*
 * Mentor PWA — vanilla JS, no build step.
 * Sections: config → dates → state → selectors → render → events → PWA → init
 */
(function () {
  'use strict';

  // ===== 1. Config & small helpers =====
  const PLAN = window.PLAN_DATA;
  const STORAGE_KEY = 'mentor.v1';
  const BACKUP_KEY = 'mentor.v1.backup';
  const APP_VERSION = '1.0.1';

  if (!PLAN) {
    const view = document.getElementById('view');
    if (view) view.innerHTML = '<div class="empty">计划数据加载失败：请确认 data/plan.js 存在。</div>';
    return;
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
  const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const safeObject = (value) => {
    const out = {};
    if (!isPlainObject(value)) return out;
    for (const key of Object.keys(value)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      out[key] = value[key];
    }
    return out;
  };
  const uid = () => (
    window.crypto && typeof window.crypto.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2)
  );

  // ===== 2. Dates (local time, never toISOString for date keys) =====
  const pad2 = (n) => String(n).padStart(2, '0');
  const dateKey = (date = new Date()) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  const parseKey = (key) => {
    const parts = String(key || '').split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return new Date(NaN);
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
  };
  const isValidDateKey = (key) => /^\d{4}-\d{2}-\d{2}$/.test(String(key || '')) && !Number.isNaN(parseKey(key).getTime());
  const todayKey = () => dateKey(new Date());
  const addDays = (date, amount) => {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  };
  const startOfWeek = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    const offset = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - offset);
    return d;
  };
  const isoWeek = (date = new Date()) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };
  const teachingWeek = (date = new Date()) => {
    const start = startOfWeek(parseKey(PLAN.meta.teachingWeek1Start || PLAN.meta.startDate));
    const current = startOfWeek(date);
    return Math.round((current - start) / (7 * 86400000)) + 1;
  };
  const teachingWeekLabel = (date = new Date()) => {
    const week = teachingWeek(date);
    if (week < 1) return '学期前';
    if (week > (PLAN.meta.teachingWeeks || 16)) return `第 ${week} 周（考试/假期）`;
    return `第 ${week} 教学周`;
  };
  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const fmtDate = (date) => `${date.getMonth() + 1}月${date.getDate()}日`;
  const fmtFull = (date) => `${fmtDate(date)} ${DAY_NAMES[date.getDay()]}`;
  const fmtRange = (start) => {
    const end = addDays(start, 6);
    return `${start.getMonth() + 1}/${start.getDate()}–${end.getMonth() + 1}/${end.getDate()}`;
  };
  const daysUntil = (dateStr) => Math.round((parseKey(dateStr) - parseKey(todayKey())) / 86400000);
  const sameDay = (a, b) => dateKey(a) === dateKey(b);

  // ===== 3. State =====
  function defaultState() {
    return {
      schemaVersion: 1,
      mode: 'blue',
      tab: 'today',
      viewDate: todayKey(),
      priorities: {},
      priorityDone: {},
      done: {},
      onlineDone: {},
      customTasks: {},
      gym: {},
      goals: {},
      milestonesDone: {},
      papersDone: {},
      reviews: [],
      settings: { lastExportAt: null }
    };
  }

  function normalizeState(raw) {
    const base = defaultState();
    if (!isPlainObject(raw)) return base;

    const priorities = {};
    for (const [key, value] of Object.entries(safeObject(raw.priorities))) {
      if (Array.isArray(value)) priorities[key] = value.slice(0, 3).map((item) => String(item == null ? '' : item));
    }
    const priorityDone = {};
    for (const [key, value] of Object.entries(safeObject(raw.priorityDone))) {
      if (Array.isArray(value)) priorityDone[key] = [0, 1, 2].map((i) => Boolean(value[i]));
    }

    const customTasks = {};
    for (const [key, value] of Object.entries(safeObject(raw.customTasks))) {
      if (Array.isArray(value)) {
        customTasks[key] = value
          .filter(isPlainObject)
          .map((task) => ({
            id: String(task.id || uid()),
            title: String(task.title || '').slice(0, 120),
            time: String(task.time || '').slice(0, 20),
            done: Boolean(task.done)
          }));
      }
    }

    const booleanMap = (value) => {
      const out = {};
      for (const [key, item] of Object.entries(safeObject(value))) if (item) out[key] = true;
      return out;
    };
    const goals = {};
    for (const [key, value] of Object.entries(safeObject(raw.goals))) {
      const number = Number(value);
      if (Number.isFinite(number)) goals[key] = number;
    }
    const reviews = Array.isArray(raw.reviews)
      ? raw.reviews.filter(isPlainObject).map((review) => ({
          week: String(review.week || ''),
          weekLabel: String(review.weekLabel || ''),
          mode: PLAN.modes[review.mode] ? review.mode : 'blue',
          wins: String(review.wins || ''),
          issues: String(review.issues || ''),
          next: Array.isArray(review.next) ? review.next.slice(0, 3).map((item) => String(item)) : [],
          sleep: Number(review.sleep) || 0,
          gym: Number(review.gym) || 0,
          updatedAt: String(review.updatedAt || '')
        })).slice(-200)
      : [];

    return {
      ...base,
      mode: PLAN.modes[raw.mode] ? raw.mode : base.mode,
      tab: ['today', 'week', 'goals', 'review', 'settings'].includes(raw.tab) ? raw.tab : base.tab,
      viewDate: isValidDateKey(raw.viewDate) ? raw.viewDate : base.viewDate,
      priorities,
      priorityDone,
      done: booleanMap(raw.done),
      onlineDone: booleanMap(raw.onlineDone),
      customTasks,
      gym: booleanMap(raw.gym),
      goals,
      milestonesDone: booleanMap(raw.milestonesDone),
      papersDone: booleanMap(raw.papersDone),
      reviews,
      settings: { ...base.settings, ...safeObject(raw.settings) }
    };
  }

  function loadState() {
    let raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (error) { console.warn(error); }
    if (!raw) return defaultState();
    try {
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      console.warn('state parse failed', error);
      try { localStorage.setItem(BACKUP_KEY + '.corrupt.' + Date.now(), raw); } catch (_) { /* ignore */ }
      return defaultState();
    }
  }

  let state = loadState();
  let saveTimer = null;
  function save(immediate = false) {
    const write = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        toast('保存失败：存储空间可能已满，请先导出备份');
      }
    };
    clearTimeout(saveTimer);
    if (immediate) write();
    else saveTimer = setTimeout(write, 150);
  }

  // ===== 4. Selectors =====
  const modeInfo = (key = state.mode) => PLAN.modes[key] || PLAN.modes.blue;
  const currentDate = () => parseKey(state.viewDate);
  const currentWeekStart = () => startOfWeek(currentDate());
  const weekKey = (date = currentDate()) => dateKey(startOfWeek(date));
  const templateFor = (dayKey, mode = state.mode) => (PLAN.weeklyTemplate[dayKey] || [])
    .filter((block) => !Array.isArray(block.modes) || block.modes.includes(mode));

  // Fixed anchors + real courses for the given date. Courses are filtered by
  // their endWeek so 12-week courses disappear after week 12.
  function blocksForDay(date, mode = state.mode) {
    const dayKey = DAY_KEYS[date.getDay()];
    const base = templateFor(dayKey, mode);
    const week = teachingWeek(date);
    const courses = (PLAN.courses || []).filter((course) => (
      !course.online && course.day === dayKey && week <= (course.endWeek || PLAN.meta.teachingWeeks || 16)
    ));
    const courseBlocks = courses.map((course, index) => ({
      id: `course-${course.id || index}`,
      time: course.start || '',
      end: course.end || '',
      title: course.name + (course.location ? ` · ${course.location}` : ''),
      category: 'class',
      modes: ['green', 'blue', 'red']
    }));
    return [...base, ...courseBlocks].sort((a, b) => String(a.time).localeCompare(String(b.time)));
  }

  function onlineCoursesFor(date) {
    const dayKey = DAY_KEYS[date.getDay()];
    const week = teachingWeek(date);
    return (PLAN.courses || []).filter((course) => (
      course.online && course.day === dayKey && week <= (course.endWeek || PLAN.meta.teachingWeeks || 16)
    ));
  }

  const onlineDoneKey = (dateStr, id) => `${dateStr}|online|${id}`;
  const isActionable = (block) => !['routine', 'rest'].includes(block.category);
  const blockDoneKey = (dateStr, id) => `${dateStr}|${id}`;
  const isBlockDone = (dateStr, id) => Boolean(state.done[blockDoneKey(dateStr, id)]);
  const customTasksFor = (dateStr) => (Array.isArray(state.customTasks[dateStr]) ? state.customTasks[dateStr] : []);

  const prioritiesFor = (wk) => {
    if (Array.isArray(state.priorities[wk])) return state.priorities[wk];
    const firstWeek = dateKey(startOfWeek(parseKey(PLAN.meta.startDate)));
    if (wk === firstWeek) return PLAN.firstWeekPriorities.slice(0, 3);
    const previous = state.reviews.find((review) => review.week === dateKey(addDays(parseKey(wk), -7)));
    if (previous && Array.isArray(previous.next)) return previous.next.slice(0, 3);
    return ['', '', ''];
  };
  const priorityDoneFor = (wk) => (Array.isArray(state.priorityDone[wk]) ? state.priorityDone[wk] : [false, false, false]);

  const gymCountForWeek = (weekStart) => {
    let count = 0;
    for (let i = 0; i < 7; i += 1) if (state.gym[dateKey(addDays(weekStart, i))]) count += 1;
    return count;
  };
  const totalGymCount = () => Object.keys(state.gym).filter((key) => state.gym[key]).length;

  const nextMilestone = () => PLAN.milestones
    .filter((milestone) => !state.milestonesDone[milestone.id])
    .map((milestone) => ({ ...milestone, days: daysUntil(milestone.date) }))
    .filter((milestone) => milestone.days >= 0)
    .sort((a, b) => a.days - b.days)[0];

  function goalCurrent(goal) {
    if (goal.auto === 'gym') return totalGymCount();
    const value = Number(state.goals[goal.id]);
    return Number.isFinite(value) ? value : 0;
  }

  function formatGoalValue(goal, value) {
    if (goal.unit === 'GPA') return Number(value || 0).toFixed(1);
    return String(value);
  }

  function weekStats(weekStart, mode = state.mode) {
    let total = 0;
    let done = 0;
    let gym = 0;
    for (let i = 0; i < 7; i += 1) {
      const day = addDays(weekStart, i);
      const dk = dateKey(day);
      const blocks = blocksForDay(day, mode).filter(isActionable);
      const customs = customTasksFor(dk);
      const online = onlineCoursesFor(day);
      total += blocks.length + customs.length + online.length;
      done += blocks.filter((block) => isBlockDone(dk, block.id)).length
        + customs.filter((task) => task.done).length
        + online.filter((course) => state.onlineDone[onlineDoneKey(dk, course.id)]).length;
      if (state.gym[dk]) gym += 1;
    }
    return { total, done, gym, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function isNowBlock(block) {
    if (dateKey(currentDate()) !== todayKey()) return false;
    const [startHour, startMinute] = String(block.time || '').split(':').map(Number);
    const [endHour, endMinute] = String(block.end || '').split(':').map(Number);
    if (!Number.isFinite(startHour)) return false;
    const start = startHour * 60 + (startMinute || 0);
    let end = endHour * 60 + (endMinute || 0);
    if (!Number.isFinite(endHour) || end <= start) end = start + 30;
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    return current >= start && current < end;
  }

  // ===== 5. Render =====
  function render(resetScroll = false) {
    if (!['today', 'week', 'goals', 'review', 'settings'].includes(state.tab)) state.tab = 'today';
    document.body.dataset.mode = state.mode;
    const info = modeInfo();
    const modeChipText = $('#mode-chip-text');
    if (modeChipText) modeChipText.textContent = info.label;
    const topbarTitle = $('#topbar-title');
    if (topbarTitle) {
      const titles = { today: '今日', week: '周计划', goals: '目标', review: '复盘', settings: '设置' };
      topbarTitle.textContent = state.tab === 'today' && state.viewDate !== todayKey() ? '计划' : titles[state.tab];
    }
    $$('.tab').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === state.tab));

    const view = $('#view');
    const scroll = view.scrollTop;
    let html = '';
    if (state.tab === 'today') html = renderToday();
    else if (state.tab === 'week') html = renderWeek();
    else if (state.tab === 'goals') html = renderGoals();
    else if (state.tab === 'review') html = renderReview();
    else html = renderSettings();
    view.innerHTML = html;
    view.scrollTop = resetScroll ? 0 : scroll;
    autoGrowPriorities();
  }

  function autoGrowPriorities() {
    $$('.priority-input').forEach((el) => {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    });
  }

  function modeBanner() {
    const info = modeInfo();
    const mark = info.key === 'green' ? '恢' : info.key === 'red' ? '冲' : '常';
    return `<section class="mode-banner">
      <div class="mode-mark">${mark}</div>
      <div><h3>${esc(info.label)} · 每周 ${esc(info.weeklyHours)}</h3><p>${esc(info.description)}</p></div>
    </section>`;
  }

  function priorityRows(wk) {
    const values = prioritiesFor(wk);
    const done = priorityDoneFor(wk);
    return values.map((value, index) => `
      <div class="priority-row ${done[index] ? 'is-done' : ''}">
        <button class="check ${done[index] ? 'is-done' : ''}" type="button" data-action="toggle-priority" data-idx="${index}" aria-label="切换第 ${index + 1} 项完成状态"></button>
        <span class="index">${index + 1}</span>
        <textarea class="priority-input" data-priority-input="${index}" rows="3" placeholder="写一件最重要的事" aria-label="第 ${index + 1} 个优先目标">${esc(value)}</textarea>
      </div>`).join('');
  }

  function blockRow(block, dateStr, done, options = {}) {
    const now = options.now && isNowBlock(block) ? 'is-now' : '';
    return `<button type="button" class="block-row ${done ? 'is-done' : ''} ${now}" data-action="toggle-block" data-date="${esc(dateStr)}" data-id="${esc(block.id)}" data-cat="${esc(block.category || 'routine')}">
      <span class="block-time">${esc(block.time || '')}</span>
      <span class="block-dot"></span>
      <span class="block-title">${esc(block.title)}</span>
      <span class="check ${done ? 'is-done' : ''}" aria-hidden="true"></span>
    </button>`;
  }

  function customRow(task, dateStr) {
    const done = Boolean(task.done);
    return `<div class="block-row ${done ? 'is-done' : ''}" role="button" tabindex="0" data-action="toggle-custom" data-date="${esc(dateStr)}" data-id="${esc(task.id)}" data-cat="custom">
      <span class="block-time">${esc(task.time || '自定义')}</span>
      <span class="block-dot"></span>
      <span class="block-title">${esc(task.title)}</span>
      <span class="custom-actions">
        <span class="check ${done ? 'is-done' : ''}" aria-hidden="true"></span>
        <button class="custom-delete" type="button" data-action="delete-custom" data-date="${esc(dateStr)}" data-id="${esc(task.id)}" aria-label="删除这件事">×</button>
      </span>
    </div>`;
  }

  function gymCard(block, dateStr, done) {
    return `<section class="gym-card ${done ? 'is-done' : ''}">
      <div class="gym-emoji" aria-hidden="true">🏋️</div>
      <div>
        <h3>${done ? '今天已训练' : '健身打卡'}</h3>
        <p>${esc(block.title)} · 目标每周 4–5 次</p>
      </div>
      <div class="spacer"></div>
      <button class="btn ${done ? '' : 'btn-primary'} btn-sm" type="button" data-action="toggle-gym" data-date="${esc(dateStr)}">${done ? '取消' : '打卡'}</button>
    </section>`;
  }

  function renderToday() {
    const date = currentDate();
    const dk = dateKey(date);
    const wk = weekKey(date);
    const blocks = blocksForDay(date);
    const customs = customTasksFor(dk);
    const online = onlineCoursesFor(date);
    const actionable = blocks.filter(isActionable);
    const doneCount = actionable.filter((block) => isBlockDone(dk, block.id)).length
      + customs.filter((task) => task.done).length
      + online.filter((course) => state.onlineDone[onlineDoneKey(dk, course.id)]).length;
    const total = actionable.length + customs.length + online.length;
    const isToday = dk === todayKey();
    const gymBlock = blocks.find((block) => block.category === 'gym');
    const gymDone = Boolean(state.gym[dk]);
    const next = nextMilestone();
    const isSunday = date.getDay() === 0;
    const reviewed = state.reviews.some((review) => review.week === wk);

    return `
      <section class="date-nav">
        <button class="icon-btn" type="button" data-action="prev-day" aria-label="前一天">‹</button>
        <div class="date-main"><strong>${fmtFull(date)}</strong><span>${teachingWeekLabel(date)} · 完成 ${doneCount}/${total}</span></div>
        <button class="icon-btn" type="button" data-action="next-day" aria-label="后一天">›</button>
      </section>
      ${!isToday ? `<div class="today-note"><span>正在查看 ${fmtFull(date)}</span><button class="btn btn-sm" type="button" data-action="go-today">回到今天</button></div>` : ''}
      ${isSunday && !reviewed ? `<div class="today-note"><span>今天是周日，记得做周复盘</span><button class="btn btn-sm" type="button" data-action="switch-tab" data-tab="review">去复盘</button></div>` : ''}
      ${modeBanner()}
      <section class="card">
        <div class="section-head"><h2>今天最重要的 3 件事</h2><span class="hint">${state.mode === 'green' ? '恢复档：只保这些' : '优先完成'}</span></div>
        <div class="priority-list">${priorityRows(wk)}</div>
      </section>
      ${gymBlock ? gymCard(gymBlock, dk, gymDone) : ''}
      ${online.length ? `<section class="card">
        <div class="section-head"><h2>网课（刷课）</h2><span class="hint">可倍速 / 碎片时间</span></div>
        ${online.map((course) => {
          const done = Boolean(state.onlineDone[onlineDoneKey(dk, course.id)]);
          return `<div class="paper-row ${done ? 'is-done' : ''}">
            <button class="check ${done ? 'is-done' : ''}" type="button" data-action="toggle-online" data-date="${esc(dk)}" data-id="${esc(course.id)}" aria-label="切换网课完成状态"></button>
            <div class="paper-main"><div class="paper-title">${esc(course.name)}</div><div class="paper-meta">${esc(course.start || '')}–${esc(course.end || '')} · 网课，可并行</div></div>
          </div>`;
        }).join('')}
      </section>` : ''}
      <section class="card">
        <div class="section-head"><h2>时间线</h2><button class="btn btn-sm btn-ghost" type="button" data-action="add-task" data-date="${esc(dk)}">＋ 加一件事</button></div>
        <div class="timeline">
          ${blocks.map((block) => blockRow(block, dk, isBlockDone(dk, block.id), { now: isToday })).join('')}
          ${customs.map((task) => customRow(task, dk)).join('')}
        </div>
      </section>
      ${next ? `<section class="card">
        <div class="section-head"><h2>下一个里程碑</h2><span class="hint">${esc(next.category)}</span></div>
        <div class="milestone-row">
          <span class="m-dot"></span>
          <div><div class="m-title">${esc(next.title)}</div><div class="m-date">${esc(next.date)}</div></div>
          <span class="m-days">${next.days === 0 ? '今天' : `还有 ${next.days} 天`}</span>
        </div>
      </section>` : ''}
    `;
  }

  function renderWeek() {
    const weekStart = currentWeekStart();
    const wk = dateKey(weekStart);
    let html = `
      <section class="week-nav">
        <button class="icon-btn" type="button" data-action="prev-week" aria-label="上一周">‹</button>
        <div class="week-title"><strong>${teachingWeekLabel(weekStart)}</strong><span>${fmtRange(weekStart)}</span></div>
        <button class="icon-btn" type="button" data-action="next-week" aria-label="下一周">›</button>
      </section>
      ${weekStart.getTime() !== startOfWeek(new Date()).getTime() ? `<div class="today-note"><span>正在查看其他周</span><button class="btn btn-sm" type="button" data-action="go-this-week">回到本周</button></div>` : ''}
      <section class="card">
        <div class="section-head"><h2>本周 3 个优先目标</h2><span class="hint">完成即胜利</span></div>
        <div class="priority-list">${priorityRows(wk)}</div>
      </section>`;

    for (let i = 0; i < 7; i += 1) {
      const day = addDays(weekStart, i);
      const dk = dateKey(day);
      const blocks = blocksForDay(day).filter((block) => isActionable(block));
      const customs = customTasksFor(dk);
      const online = onlineCoursesFor(day);
      const done = blocks.filter((block) => isBlockDone(dk, block.id)).length
        + customs.filter((task) => task.done).length
        + online.filter((course) => state.onlineDone[onlineDoneKey(dk, course.id)]).length;
      const total = blocks.length + customs.length + online.length;
      html += `<section class="day-card ${sameDay(day, new Date()) ? 'is-today' : ''} ${dk === state.viewDate ? 'is-selected' : ''}">
        <div class="day-head" role="button" tabindex="0" data-action="select-day" data-date="${esc(dk)}">
          <span class="day-name">${DAY_NAMES[day.getDay()]}</span>
          <span class="day-date">${fmtDate(day)}</span>
          <span class="day-count">${done}/${total}</span>
        </div>
        <div class="day-blocks">
          ${blocks.map((block) => blockRow(block, dk, isBlockDone(dk, block.id))).join('')}
          ${customs.map((task) => customRow(task, dk)).join('')}
          ${online.length ? `<div class="day-more">网课：${online.map((course) => esc(course.name)).join(' / ')}（可倍速）</div>` : ''}
        </div>
      </section>`;
    }
    return html;
  }

  function goalCard(goal) {
    const current = goalCurrent(goal);
    const pct = goal.target > 0 ? Math.min(100, Math.max(0, Math.round((current / goal.target) * 100))) : 0;
    const value = formatGoalValue(goal, current);
    const target = formatGoalValue(goal, goal.target);
    const unit = goal.unit === 'GPA' ? '' : ` ${esc(goal.unit)}`;
    return `<div class="goal-card">
      <div class="goal-top">
        <div><h3>${esc(goal.title)}</h3><p>${esc(goal.subtitle)}</p></div>
        <div class="goal-value"><strong>${esc(value)}${unit}</strong><span>目标 ${esc(target)}${unit}</span></div>
      </div>
      <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
      <div class="goal-meta">
        <span>${esc(goal.category)}${goal.deadline ? ` · 截止 ${esc(goal.deadline)}` : ''}</span>
        ${goal.auto === 'gym'
          ? '<span class="chip">自动统计</span>'
          : `<button class="btn btn-sm btn-ghost" type="button" data-action="update-goal" data-id="${esc(goal.id)}">更新</button>`}
      </div>
    </div>`;
  }

  function milestoneRow(milestone) {
    const done = Boolean(state.milestonesDone[milestone.id]);
    const days = daysUntil(milestone.date);
    const label = done ? '已完成' : days < 0 ? `已过 ${Math.abs(days)} 天` : days === 0 ? '今天' : `还有 ${days} 天`;
    return `<div class="milestone-row ${done ? 'is-done' : ''} ${!done && days < 0 ? 'is-past' : ''}">
      <button class="check ${done ? 'is-done' : ''}" type="button" data-action="toggle-milestone" data-id="${esc(milestone.id)}" aria-label="切换里程碑完成状态"></button>
      <div><div class="m-title">${esc(milestone.title)}</div><div class="m-date">${esc(milestone.date)} · ${esc(milestone.category)}</div></div>
      <span class="m-days">${label}</span>
    </div>`;
  }

  function competitionRow(competition) {
    const roleClass = competition.role === '主攻' ? 'role-main' : competition.role === '学习型参与' ? 'role-learn' : 'role-pause';
    return `<div class="competition-card">
      <div class="c-top"><h3>${esc(competition.name)}</h3><span class="chip ${roleClass}">${esc(competition.role)}</span></div>
      <p>${esc(competition.note)}</p>
      <p class="tiny">${competition.deadline ? `截止 ${esc(competition.deadline)} · ` : ''}${esc(competition.status)}</p>
    </div>`;
  }

  function paperRow(paper) {
    const done = Boolean(state.papersDone[paper.id]);
    const title = paper.link
      ? `<a href="${esc(paper.link)}" target="_blank" rel="noopener">${esc(paper.title)}</a>`
      : esc(paper.title);
    return `<div class="paper-row ${done ? 'is-done' : ''}">
      <button class="check ${done ? 'is-done' : ''}" type="button" data-action="toggle-paper" data-id="${esc(paper.id)}" aria-label="切换已读状态"></button>
      <div class="paper-main"><div class="paper-title">${title}</div><div class="paper-meta">${esc(paper.meta)}</div></div>
    </div>`;
  }

  function renderGoals() {
    const milestones = [...PLAN.milestones].sort((a, b) => a.date.localeCompare(b.date));
    const papersDone = PLAN.papers.filter((paper) => state.papersDone[paper.id]).length;
    return `
      <section class="card">
        <div class="section-head"><h2>学期目标</h2><span class="hint">${esc(modeInfo().label)}</span></div>
        <div class="goal-list">${PLAN.goals.map(goalCard).join('')}</div>
      </section>
      <section class="card">
        <div class="section-head"><h2>里程碑</h2><span class="hint">${milestones.filter((m) => !state.milestonesDone[m.id]).length} 个未完成</span></div>
        ${milestones.map(milestoneRow).join('')}
      </section>
      <section class="card">
        <div class="section-head"><h2>竞赛</h2><span class="hint">铸造赛主攻</span></div>
        ${PLAN.competitions.map(competitionRow).join('')}
      </section>
      <section class="card">
        <div class="section-head"><h2>科研文献</h2><span class="hint">${papersDone}/${PLAN.papers.length} 已读</span></div>
        ${PLAN.papers.map(paperRow).join('')}
      </section>
    `;
  }

  function reviewItem(review) {
    const mode = modeInfo(review.mode);
    return `<div class="review-item">
      <div class="r-head"><strong>${esc(review.weekLabel || review.week || '')}</strong><span class="chip">${esc(mode.short)}</span></div>
      ${review.wins ? `<p>做成：${esc(review.wins)}</p>` : ''}
      ${review.issues ? `<p>卡点：${esc(review.issues)}</p>` : ''}
      ${Array.isArray(review.next) && review.next.length ? `<p>下周：${esc(review.next.join('；'))}</p>` : ''}
      ${review.sleep ? `<p class="tiny">睡眠 ${esc(review.sleep)}h · 训练 ${esc(review.gym || 0)} 次</p>` : ''}
    </div>`;
  }

  function renderReview() {
    const weekStart = currentWeekStart();
    const wk = dateKey(weekStart);
    const existing = state.reviews.find((review) => review.week === wk) || {};
    const selectedMode = existing.mode || state.mode;
    const stats = weekStats(weekStart, selectedMode);
    const modeOptions = Object.values(PLAN.modes).map((mode) => `<option value="${mode.key}" ${selectedMode === mode.key ? 'selected' : ''}>${esc(mode.label)}</option>`).join('');
    const history = [...state.reviews].sort((a, b) => String(b.week).localeCompare(String(a.week))).slice(0, 8);
    return `
      <section class="card">
        <div class="section-head"><h2>${teachingWeekLabel(weekStart)} · ${fmtRange(weekStart)}</h2><span class="hint">${esc(modeInfo(selectedMode).label)}</span></div>
        <div class="stat-grid">
          <div class="stat"><strong>${stats.pct}%</strong><span>完成率</span></div>
          <div class="stat"><strong>${stats.gym}</strong><span>训练次数</span></div>
          <div class="stat"><strong>${stats.done}/${stats.total}</strong><span>完成项</span></div>
        </div>
      </section>
      <form id="review-form" class="card form-grid">
        <div class="form-row"><label for="review-mode">本周档位</label><select id="review-mode" class="select" name="mode">${modeOptions}</select></div>
        <div class="form-row"><label for="review-wins">做成了什么（3 件）</label><textarea id="review-wins" class="textarea" name="wins" placeholder="哪怕很小，也写下来">${esc(existing.wins || '')}</textarea></div>
        <div class="form-row"><label for="review-issues">卡在哪 / 最大阻力</label><textarea id="review-issues" class="textarea" name="issues" placeholder="具体到一件事，不要写“不够自律”">${esc(existing.issues || '')}</textarea></div>
        <div class="form-row"><label for="review-next">下周最重要的 3 件事（一行一件）</label><textarea id="review-next" class="textarea" name="next" placeholder="1. ...&#10;2. ...&#10;3. ...">${esc((existing.next || []).join('\n'))}</textarea></div>
        <div class="form-row"><label for="review-sleep">平均睡眠（小时）</label><input id="review-sleep" class="input" type="number" step="0.1" min="0" max="12" name="sleep" value="${existing.sleep == null ? '' : esc(existing.sleep)}" inputmode="decimal"></div>
        <div class="form-actions"><button class="btn btn-primary" type="submit">保存复盘</button><button class="btn" type="button" data-action="export">导出备份</button></div>
        <p class="tiny muted">建议每周导出一次备份；iOS 的 Safari 标签页和主屏幕 App 数据不互通，先在主屏幕 App 里录数据。</p>
      </form>
      <section class="card">
        <div class="section-head"><h2>历史复盘</h2><span class="hint">${state.reviews.length} 条</span></div>
        <div class="review-history">${history.length ? history.map(reviewItem).join('') : '<div class="empty">还没有复盘。周日花 60 分钟，写下第一周。</div>'}</div>
      </section>
    `;
  }

  function installInstructions() {
    if (location.protocol === 'file:') {
      return '当前是 <code>file://</code> 打开：可以看页面，但无法安装/离线。请在 app 目录运行 <code>python -m http.server 8000</code>，再用手机访问 HTTPS 地址。';
    }
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) return '用 Safari 打开 → 分享 → 添加到主屏幕。先安装，再录数据。';
    if (/android/i.test(ua)) return '用 Chrome 打开 → 右上角菜单 → 安装应用 / 添加到主屏幕。';
    return '用手机浏览器打开这个页面的 HTTPS 地址，然后添加到主屏幕。';
  }

  function renderSettings() {
    const modes = Object.values(PLAN.modes).map((mode) => `
      <button class="mode-option ${state.mode === mode.key ? 'is-active' : ''}" type="button" data-action="set-mode" data-mode="${mode.key}">
        <span class="m-swatch" style="background:${mode.color}"></span>
        <span class="m-copy"><strong>${esc(mode.label)}</strong><span>${esc(mode.description)}</span><span class="tiny">每周 ${esc(mode.weeklyHours)} · 训练 ${mode.gymTarget} 次 · 睡眠 ${mode.sleepTarget}h</span></span>
      </button>`).join('');
    const installHtml = deferredPrompt
      ? '<button class="btn btn-primary btn-block" type="button" data-action="install">安装到主屏幕</button>'
      : `<div class="about">${installInstructions()}</div>`;
    return `
      <section class="card"><div class="section-head"><h2>当前档位</h2><span class="hint">按身体和节点切换</span></div><div class="mode-list">${modes}</div></section>
      <section class="card">
        <div class="section-head"><h2>数据</h2></div>
        <div class="settings-row"><div class="s-copy"><strong>导出备份</strong><span>下载 JSON；每周至少一次</span></div><button class="btn btn-sm" type="button" data-action="export">导出</button></div>
        <div class="settings-row"><div class="s-copy"><strong>复制备份</strong><span>导出失败时的兜底</span></div><button class="btn btn-sm" type="button" data-action="copy-backup">复制</button></div>
        <div class="settings-row"><div class="s-copy"><strong>导入备份</strong><span>整体替换当前数据；导入前自动备份</span></div><label class="btn btn-sm">选择文件<input id="import-file" type="file" accept="application/json,.json" hidden></label></div>
        <div class="settings-row"><div class="s-copy"><strong>清除数据</strong><span>只清完成记录/复盘，不动计划</span></div><button class="btn btn-sm btn-danger" type="button" data-action="reset">清除</button></div>
      </section>
      <section class="card">
        <div class="section-head"><h2>安装到手机</h2></div>
        ${installHtml}
        <p class="tiny muted" style="margin:10px 0 0">iOS：先安装，再录数据。Safari 标签页与主屏幕 App 的数据不互通。</p>
      </section>
      <section class="card">
        <div class="section-head"><h2>关于</h2></div>
        <div class="about">
          Mentor · 大二上学期计划<br>
          App 版本 ${APP_VERSION} · 计划版本 ${esc(PLAN.meta.version)} · 更新 ${esc(PLAN.meta.lastUpdated)}<br>
          课表尚未导入；当前为通用模板。课表到了以后改 <code>data/plan.js</code> 的 <code>courses</code> 和周模板。<br>
          当前地址：<span class="tiny">${esc(location.href)}</span>
        </div>
      </section>
    `;
  }

  // ===== 6. Modals, toast, export/import =====
  function openModal(html) {
    const root = $('#modal-root');
    root.innerHTML = `<div class="modal-backdrop"><div class="modal-sheet" role="dialog" aria-modal="true">${html}</div></div>`;
    document.body.style.overflow = 'hidden';
    const first = root.querySelector('input, select, textarea, button');
    if (first) setTimeout(() => first.focus(), 50);
  }

  function closeModal() {
    $('#modal-root').innerHTML = '';
    document.body.style.overflow = '';
  }

  let toastTimer = null;
  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2400);
  }

  function openModeModal() {
    const options = Object.values(PLAN.modes).map((mode) => `
      <button class="mode-option ${state.mode === mode.key ? 'is-active' : ''}" type="button" data-action="set-mode" data-mode="${mode.key}">
        <span class="m-swatch" style="background:${mode.color}"></span>
        <span class="m-copy"><strong>${esc(mode.label)}</strong><span>${esc(mode.description)}</span><span class="tiny">每周 ${esc(mode.weeklyHours)} · 训练 ${mode.gymTarget} 次 · 睡眠 ${mode.sleepTarget}h</span></span>
      </button>`).join('');
    openModal(`<div class="modal-head"><h2>切换档位</h2><button class="modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button></div><div class="mode-list">${options}</div><p class="tiny muted" style="margin:12px 2px 0">期末前 3 周、竞赛截止前 2–4 周建议切红色；身体不适或连续 3 天睡眠不足 6.5h 切绿色。</p>`);
  }

  function openAddTask(dateStr) {
    openModal(`<div class="modal-head"><h2>加一件事</h2><button class="modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button></div>
      <form id="add-task-form" class="form-grid" data-date="${esc(dateStr)}">
        <div class="form-row"><label for="task-title">做什么</label><input id="task-title" class="input" name="title" required maxlength="80" placeholder="例如：给导师发进度消息"></div>
        <div class="form-row"><label for="task-time">时间（可选）</label><input id="task-time" class="input" name="time" maxlength="10" placeholder="例如 19:00"></div>
        <div class="form-actions"><button class="btn btn-primary" type="submit">添加</button><button class="btn" type="button" data-action="close-modal">取消</button></div>
      </form>`);
  }

  function openGoalForm(goal) {
    openModal(`<div class="modal-head"><h2>更新 · ${esc(goal.title)}</h2><button class="modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button></div>
      <form id="goal-form" class="form-grid" data-id="${esc(goal.id)}">
        <div class="form-row"><label for="goal-value">当前值（目标 ${esc(formatGoalValue(goal, goal.target))}${goal.unit === 'GPA' ? '' : ' ' + esc(goal.unit)}）</label><input id="goal-value" class="input" name="value" type="number" step="any" min="0" value="${esc(goalCurrent(goal))}" inputmode="decimal" required></div>
        <div class="form-actions"><button class="btn btn-primary" type="submit">保存</button><button class="btn" type="button" data-action="close-modal">取消</button></div>
      </form>`);
  }

  function openInstallHelp() {
    openModal(`<div class="modal-head"><h2>安装到手机</h2><button class="modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button></div>
      <div class="about">
        <p><strong>iPhone / iPad：</strong>用 Safari 打开 → 分享按钮 → 添加到主屏幕。</p>
        <p><strong>Android：</strong>用 Chrome 打开 → 右上角菜单 → 安装应用 / 添加到主屏幕。</p>
        <p><strong>重要：</strong>iOS 的 Safari 标签页和主屏幕 App 使用两套存储。先安装，再从主屏幕 App 录入数据。</p>
        <p>当前地址：<br><span class="tiny">${esc(location.href)}</span></p>
      </div>
      <div class="form-actions" style="margin-top:12px"><button class="btn btn-primary" type="button" data-action="copy-url">复制地址</button><button class="btn" type="button" data-action="close-modal">关闭</button></div>`);
  }

  function exportState() {
    state.settings.lastExportAt = new Date().toISOString();
    save(true);
    const payload = {
      ...state,
      exportedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      planVersion: PLAN.meta.version
    };
    const json = JSON.stringify(payload, null, 2);
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mentor-backup-${todayKey()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast('已导出备份');
    } catch (error) {
      toast('导出失败，请用“复制备份”');
    }
  }

  function copyBackup() {
    const json = JSON.stringify(state, null, 2);
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(json).then(() => toast('已复制备份 JSON')).catch(() => toast('复制失败，请用导出'));
    } else {
      toast('当前浏览器不支持复制，请用导出');
    }
  }

  function importFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || ''));
        if (!isPlainObject(data)) throw new Error('不是有效的备份文件');
        const next = normalizeState(data);
        if (!window.confirm('导入会整体替换当前数据（会先自动备份），继续？')) return;
        try { localStorage.setItem(BACKUP_KEY, localStorage.getItem(STORAGE_KEY) || ''); } catch (_) { /* ignore */ }
        state = next;
        save(true);
        render(true);
        toast('导入成功');
      } catch (error) {
        toast('导入失败：' + error.message);
      }
    };
    reader.readAsText(file);
  }

  function resetState() {
    if (!window.confirm('确定清除所有完成记录、复盘、自定义任务和目标进度吗？计划内容不会删除。')) return;
    state = defaultState();
    save(true);
    render(true);
    toast('已清除');
  }

  // ===== 7. Events =====
  document.addEventListener('click', (event) => {
    if (event.target.classList && event.target.classList.contains('modal-backdrop')) {
      closeModal();
      return;
    }
    const el = event.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;

    switch (action) {
      case 'switch-tab':
        state.tab = el.dataset.tab;
        save();
        render(true);
        break;
      case 'open-mode':
        openModeModal();
        break;
      case 'set-mode':
        if (!PLAN.modes[el.dataset.mode]) break;
        state.mode = el.dataset.mode;
        save(true);
        closeModal();
        render(false);
        toast('已切换到' + modeInfo().label);
        break;
      case 'toggle-priority': {
        const index = Number(el.dataset.idx);
        const wk = weekKey();
        const done = priorityDoneFor(wk).slice();
        done[index] = !done[index];
        state.priorityDone[wk] = done;
        save(true);
        render(false);
        break;
      }
      case 'toggle-block': {
        const dateStr = el.dataset.date;
        const id = el.dataset.id;
        const key = blockDoneKey(dateStr, id);
        if (state.done[key]) delete state.done[key];
        else state.done[key] = true;
        if (id === 'gym') {
          if (state.done[key]) state.gym[dateStr] = true;
          else delete state.gym[dateStr];
        }
        save(true);
        render(false);
        break;
      }
      case 'toggle-gym': {
        const dateStr = el.dataset.date;
        if (state.gym[dateStr]) {
          delete state.gym[dateStr];
          delete state.done[blockDoneKey(dateStr, 'gym')];
        } else {
          state.gym[dateStr] = true;
          state.done[blockDoneKey(dateStr, 'gym')] = true;
        }
        save(true);
        render(false);
        break;
      }
      case 'toggle-custom': {
        const dateStr = el.dataset.date;
        const tasks = customTasksFor(dateStr);
        const task = tasks.find((item) => item.id === el.dataset.id);
        if (!task) break;
        task.done = !task.done;
        state.customTasks[dateStr] = tasks;
        save(true);
        render(false);
        break;
      }
      case 'delete-custom': {
        const dateStr = el.dataset.date;
        state.customTasks[dateStr] = customTasksFor(dateStr).filter((task) => task.id !== el.dataset.id);
        if (!state.customTasks[dateStr].length) delete state.customTasks[dateStr];
        save(true);
        render(false);
        break;
      }
      case 'add-task':
        openAddTask(el.dataset.date);
        break;
      case 'update-goal': {
        const goal = PLAN.goals.find((item) => item.id === el.dataset.id);
        if (goal) openGoalForm(goal);
        break;
      }
      case 'toggle-milestone':
        if (state.milestonesDone[el.dataset.id]) delete state.milestonesDone[el.dataset.id];
        else state.milestonesDone[el.dataset.id] = true;
        save(true);
        render(false);
        break;
      case 'toggle-paper':
        if (state.papersDone[el.dataset.id]) delete state.papersDone[el.dataset.id];
        else state.papersDone[el.dataset.id] = true;
        save(true);
        render(false);
        break;
      case 'toggle-online': {
        const key = onlineDoneKey(el.dataset.date, el.dataset.id);
        if (state.onlineDone[key]) delete state.onlineDone[key];
        else state.onlineDone[key] = true;
        save(true);
        render(false);
        break;
      }
      case 'prev-day':
        state.viewDate = dateKey(addDays(currentDate(), -1));
        save();
        render(true);
        break;
      case 'next-day':
        state.viewDate = dateKey(addDays(currentDate(), 1));
        save();
        render(true);
        break;
      case 'prev-week':
        state.viewDate = dateKey(addDays(currentWeekStart(), -7));
        save();
        render(true);
        break;
      case 'next-week':
        state.viewDate = dateKey(addDays(currentWeekStart(), 7));
        save();
        render(true);
        break;
      case 'go-today':
        state.viewDate = todayKey();
        state.tab = 'today';
        save();
        render(true);
        break;
      case 'go-this-week':
        state.viewDate = todayKey();
        save();
        render(true);
        break;
      case 'select-day':
        state.viewDate = el.dataset.date;
        state.tab = 'today';
        save();
        render(true);
        break;
      case 'export':
        exportState();
        break;
      case 'copy-backup':
        copyBackup();
        break;
      case 'reset':
        resetState();
        break;
      case 'install':
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(() => {
            deferredPrompt = null;
            if (state.tab === 'settings') render(false);
          }).catch(() => {});
        } else {
          openInstallHelp();
        }
        break;
      case 'copy-url':
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(location.href).then(() => toast('地址已复制')).catch(() => toast('复制失败'));
        }
        break;
      case 'close-modal':
        closeModal();
        break;
      default:
        break;
    }
  });

  document.addEventListener('input', (event) => {
    if (!event.target.matches('[data-priority-input]')) return;
    const index = Number(event.target.dataset.priorityInput);
    const wk = weekKey();
    const values = prioritiesFor(wk).slice();
    values[index] = event.target.value;
    state.priorities[wk] = values;
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';
    save();
  });

  document.addEventListener('change', (event) => {
    if (event.target.id !== 'import-file') return;
    const file = event.target.files && event.target.files[0];
    importFile(file);
    event.target.value = '';
  });

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (form.id === 'add-task-form') {
      event.preventDefault();
      const data = new FormData(form);
      const title = String(data.get('title') || '').trim();
      if (!title) return;
      const dateStr = form.dataset.date;
      const task = {
        id: uid(),
        title,
        time: String(data.get('time') || '').trim(),
        done: false
      };
      state.customTasks[dateStr] = customTasksFor(dateStr).concat(task);
      save(true);
      closeModal();
      render(false);
      toast('已添加');
      return;
    }
    if (form.id === 'goal-form') {
      event.preventDefault();
      const value = Number(new FormData(form).get('value'));
      if (!Number.isFinite(value)) return;
      state.goals[form.dataset.id] = value;
      save(true);
      closeModal();
      render(false);
      toast('已更新');
      return;
    }
    if (form.id === 'review-form') {
      event.preventDefault();
      const data = new FormData(form);
      const weekStart = currentWeekStart();
      const wk = dateKey(weekStart);
      const next = String(data.get('next') || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 3);
      const review = {
        week: wk,
        weekLabel: teachingWeekLabel(weekStart),
        mode: String(data.get('mode') || state.mode),
        wins: String(data.get('wins') || '').trim(),
        issues: String(data.get('issues') || '').trim(),
        next,
        sleep: Number(data.get('sleep') || 0),
        gym: gymCountForWeek(weekStart),
        updatedAt: new Date().toISOString()
      };
      const index = state.reviews.findIndex((item) => item.week === wk);
      if (index >= 0) state.reviews[index] = review;
      else state.reviews.push(review);
      save(true);
      render(false);
      toast('复盘已保存');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[role="button"][data-action]')) {
      event.preventDefault();
      event.target.click();
    }
  });

  // ===== 8. PWA =====
  let deferredPrompt = null;
  let updateBannerShown = false;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (state.tab === 'settings') render(false);
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    toast('已安装到主屏幕');
    if (state.tab === 'settings') render(false);
  });

  function showUpdateBanner(registration) {
    if (updateBannerShown) return;
    updateBannerShown = true;
    const banner = document.createElement('div');
    banner.className = 'update-banner';
    banner.innerHTML = '<span>新版本已就绪</span><button class="btn btn-sm btn-primary" type="button" id="update-btn">刷新</button>';
    document.body.appendChild(banner);
    document.getElementById('update-btn').addEventListener('click', () => {
      if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
    });
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
        if (registration.waiting) showUpdateBanner(registration);
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) showUpdateBanner(registration);
          });
        });
        setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
      } catch (error) {
        console.warn('Service worker registration failed', error);
      }
    });
  }

  // ===== 9. Init =====
  if (location.protocol === 'file:') {
    const warning = document.createElement('div');
    warning.className = 'file-warning';
    warning.textContent = '当前是 file:// 打开：可以看页面，但无法安装/离线。请在 app 目录运行 python -m http.server 8000。';
    const topbar = document.querySelector('.topbar');
    if (topbar) topbar.insertAdjacentElement('afterend', warning);
  }

  const tabParam = new URLSearchParams(location.search).get('tab');
  if (['today', 'week', 'goals', 'review', 'settings'].includes(tabParam)) state.tab = tabParam;

  // A fresh open always starts on today, but keeps the last tab.
  state.viewDate = todayKey();
  save(true);
  render(true);

  let lastToday = todayKey();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    if (todayKey() !== lastToday) {
      lastToday = todayKey();
      state.viewDate = todayKey();
      save();
      render(true);
    }
  });
})();
