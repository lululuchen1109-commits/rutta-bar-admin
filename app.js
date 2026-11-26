/* Rutta for Mac v5 · Native macOS Window, Memory Stream & Voiceprint Circle Controller */
(() => {
  'use strict';

  let state = window.createInitialRuttaState();
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'admin') {
      state.roleMode = 'admin';
      state.activeTab = 'circle';
    }
  } catch (_) {}

  let audioCtx = null;
  let sampleTimer = null;
  let micStream = null;
  let quotePlayTimer = null;
  let quotePlayPct = 0;
  let playingQuoteId = null;
  let pendingDeleteMemberId = null;
  let reenrollMemberId = null;
  let sampledVoiceReady = false;
  let lastDeletedDecision = null;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const t = (key) => (window.RUTTA_I18N[state.lang] && window.RUTTA_I18N[state.lang][key]) || key;
  const pick = (obj) => (typeof obj === 'string' ? obj : (obj && (obj[state.lang] || obj.zh)) || '');

  const ICONS = {
    plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round"><path d="M8 3.2v9.6M3.2 8h9.6"/></svg>',
    search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="4.4"/><path d="M10.4 10.4L13.6 13.6" stroke-linecap="round"/></svg>',
    lock: '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6.3" width="8" height="5.5" rx="1.4"/><path d="M4.8 6.3V4.6a2.2 2.2 0 014.4 0v1.7"/></svg>',
    play: '<svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><path d="M3.2 2.2l6.8 3.8-6.8 3.8V2.2z"/></svg>',
    pause: '<svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><rect x="2.5" y="2.2" width="2.4" height="7.6" rx="0.6"/><rect x="7.1" y="2.2" width="2.4" height="7.6" rx="0.6"/></svg>',
    close: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
    today: '<svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3" width="13" height="12.5" rx="2.6"/><path d="M6 2v2M12 2v2M2.5 6.8h13"/></svg>',
    wave: '<svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3.5 9v0M6.2 6.2v5.6M9 3.8v10.4M11.8 6.2v5.6M14.5 9v0"/></svg>',
    spark: '<svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2.5l1.6 4.4L15 8.5l-4.4 1.6L9 14.5l-1.6-4.4L3 8.5l4.4-1.6L9 2.5z"/></svg>',
    circle: '<svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="6.4" r="2.6"/><path d="M4.2 14.2c.9-2.2 2.6-3.3 4.8-3.3s3.9 1.1 4.8 3.3" stroke-linecap="round"/></svg>',
    flow: '<svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2.8" y="3" width="12.4" height="12" rx="2.4"/><path d="M6.2 9.2l2 2 3.8-4"/></svg>',
    grid: '<svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="2.8" y="2.8" width="5" height="5" rx="1.3"/><rect x="10.2" y="2.8" width="5" height="5" rx="1.3"/><rect x="2.8" y="10.2" width="5" height="5" rx="1.3"/><rect x="10.2" y="10.2" width="5" height="5" rx="1.3"/></svg>',
    shield: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round"><path d="M8 2L3 4v3.7c0 3.1 2.1 5.1 5 6.1 2.9-1 5-3 5-6.1V4L8 2z"/></svg>',
    ext: '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l5-5M4.5 3.5h4v4"/></svg>'
  };

  function playSwitchClick(isMute) {
    if (!state.soundEnabled) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isMute ? 300 : 460, now);
      osc.frequency.exponentialRampToValueAtTime(isMute ? 105 : 170, now + 0.025);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.032);
    } catch (_) {}
  }

  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function memberById(id) {
    return state.members.find((m) => m.id === id) || null;
  }

  function currentEmployee() {
    return memberById(state.currentEmployeeId) || state.members[0];
  }

  function finishLabel(f) {
    return { silver: t('finishSilver'), sky: t('finishSky'), starlight: t('finishStarlight'), midnight: t('finishMidnight') }[f] || f;
  }

  function mountedPhoto(finish) {
    return {
      silver: 'assets/openside-silver.webp',
      midnight: 'assets/openside-midnight.webp',
      sky: 'assets/openside-sky.webp',
      starlight: 'assets/openside-starlight.webp'
    }[finish] || 'assets/openside-silver.webp';
  }

  function visibilityBadge(m) {
    if (!m.active) return `<span class="pill-tag pill-neutral">${state.lang === 'zh' ? '已暂停' : 'Paused'}</span>`;
    if (m.visibility === 'team') return `<span class="pill-tag pill-green">${state.lang === 'zh' ? '团队互通' : 'Team Bars'}</span>`;
    if (m.visibility === 'pause30') return `<span class="pill-tag pill-amber">${state.lang === 'zh' ? '免打扰 30m' : 'Quiet 30m'}</span>`;
    return `<span class="pill-tag pill-neutral">${ICONS.lock} ${state.lang === 'zh' ? '仅我的 Mac' : 'My Mac Only'}</span>`;
  }

  function renderAvatar(member, size = 'md') {
    const cls = size === 'xs' ? 'avatar avatar-xs' : size === 'sm' ? 'avatar avatar-sm' : 'avatar';
    if (!member) return `<span class="${cls}">?</span>`;
    if (member.avatar) return `<img class="${cls}" src="${member.avatar}" alt="${esc(member.name)}">`;
    return `<span class="${cls}">${esc(member.initials)}</span>`;
  }

  function showToast(msg, actionLabel = null, onAction = null) {
    const stack = $('#toast-stack');
    if (!actionLabel) $$('.toast:not(.has-action)', stack).forEach((old) => old.remove());
    const el = document.createElement('div');
    el.className = actionLabel ? 'toast has-action' : 'toast';
    el.innerHTML = `<span>${esc(msg)}</span>`;
    if (actionLabel && onAction) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = actionLabel;
      b.addEventListener('click', () => { onAction(); el.remove(); });
      el.appendChild(b);
    }
    stack.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.2s';
      setTimeout(() => el.remove(), 200);
    }, actionLabel ? 4000 : 2400);
  }

  function switchRole(role, tab = null) {
    stopQuotePlayback();
    state.roleMode = role;
    state.activeTab = tab || (role === 'employee' ? 'today' : 'circle');
    state.decFilter = 'all';
    renderAll();
  }

  function setEmployeeVisibility(member, vis, announce = true) {
    member.visibility = vis;
    if (vis === 'self' || vis === 'pause30') {
      if (announce) {
        showToast(vis === 'self'
          ? (state.lang === 'zh' ? `${member.name.split(' ')[0]} 已设为「仅我的 Mac」：同事设备遇到你将不亮灯、0 留存` : `Set to My Mac Only — teammates’ Bars stay dark`)
          : (state.lang === 'zh' ? `已开启 30 分钟免打扰：所有设备静默忽略你的声音` : `Quiet 30m active — all Bars ignore your voice`));
      }
    } else if (announce) {
      showToast(state.lang === 'zh' ? `已设为「同团队成员」：小会可互通，经你确认后才共享` : `Set to Team Bars — huddle notes require your confirm`);
    }
    renderAll();
  }

  function employeeDecisions(empId) {
    return state.decisions.filter((d) => d.participants.some((p) => p.memberId === empId));
  }

  function adminDecisions() {
    return state.decisions.filter((d) => d.status !== 'pending');
  }

  /* =====================================================================
   * MACOS CHROME, MENU BAR & VIBRANCY SIDEBAR SYNC
   * ===================================================================== */
  function syncChrome() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    $('#macos-menubar').hidden = !state.showMenubar;
    $('#toggle-menubar').checked = state.showMenubar;
    $('#toggle-zoom').checked = state.windowZoomed;
    document.body.classList.toggle('has-menubar', state.showMenubar);
    document.body.classList.toggle('clean-shot', state.cleanShot);
    $('#desktop-stage').classList.toggle('is-zoomed', state.windowZoomed);
    $('#osm-clock').textContent = state.lang === 'zh' ? '周四 14:22' : 'Thu 14:22';

    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('.lang-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.lang === state.lang));
    $$('.mac-seg-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.role === state.roleMode));

    const emp = currentEmployee();
    const isMuted = emp.barState === 'muted';
    const dotCls = isMuted ? 'dot-mute' : state.multiBarSync ? 'dot-input' : emp.visibility === 'pause30' ? 'dot-visitor' : 'dot-ready';

    // Sidebar Identity Block
    const idEl = $('#sidebar-identity');
    if (state.roleMode === 'employee') {
      const maya = memberById('maya');
      const leo = memberById('leo');
      idEl.innerHTML = `
        <div class="person-switcher">
          <button type="button" class="person-chip ${emp.id === 'maya' ? 'is-active' : ''}" data-pick-emp="maya">
            ${renderAvatar(maya, 'xs')}
            <span>Maya</span>
            <span class="person-role-tag">A</span>
          </button>
          <button type="button" class="person-chip ${emp.id === 'leo' ? 'is-active' : ''}" data-pick-emp="leo">
            ${renderAvatar(leo, 'xs')}
            <span>Leo</span>
            <span class="person-role-tag">B</span>
          </button>
        </div>
      `;
      $$('[data-pick-emp]', idEl).forEach((b) => {
        b.addEventListener('click', () => {
          stopQuotePlayback();
          state.currentEmployeeId = b.dataset.pickEmp;
          renderAll();
        });
      });
    } else {
      idEl.innerHTML = `
        <div class="admin-identity-bar">
          <strong>Northstar Studio</strong>
          <span>${state.lang === 'zh' ? '脱敏管理' : 'Privacy-scoped'}</span>
        </div>
      `;
    }

    // Sidebar Navigation
    const navEl = $('#rail-nav');
    if (state.roleMode === 'employee') {
      const myPending = employeeDecisions(emp.id).filter((d) => d.status === 'pending').length;
      navEl.innerHTML = `
        <div class="nav-section-label">${t('secPersonal')} · ${esc(emp.name.split(' ')[0])}</div>
        <button type="button" class="nav-row ${state.activeTab === 'today' ? 'is-active' : ''}" data-tab="today" role="tab">
          ${ICONS.today}
          <span>${t('navToday')}</span>
          ${myPending > 0 ? `<span class="nav-badge is-amber" id="nav-count-pending">${myPending}</span>` : ''}
        </button>
        <button type="button" class="nav-row ${state.activeTab === 'my-bar' ? 'is-active' : ''}" data-tab="my-bar" role="tab">
          ${ICONS.wave}
          <span>${t('navMyBar')}</span>
          <span class="nav-badge">${emp.visibility === 'team' ? (state.lang === 'zh' ? '互通' : 'Team') : emp.visibility === 'self' ? (state.lang === 'zh' ? '仅本机' : 'Self') : '30m'}</span>
        </button>
        <button type="button" class="nav-row ${state.activeTab === 'ask-agent' ? 'is-active' : ''}" data-tab="ask-agent" role="tab">
          ${ICONS.spark}
          <span>${t('navAskAgent')}</span>
        </button>
      `;
    } else {
      const activeCount = state.members.filter((m) => m.active).length;
      navEl.innerHTML = `
        <div class="nav-section-label">${t('secWorkspace')}</div>
        <button type="button" class="nav-row ${state.activeTab === 'circle' ? 'is-active' : ''}" data-tab="circle" role="tab">
          ${ICONS.circle}
          <span>${t('navCircle')}</span>
          <span class="nav-badge" id="nav-count-vp">${activeCount}/${state.members.length}</span>
        </button>
        <button type="button" class="nav-row ${state.activeTab === 'team-flow' ? 'is-active' : ''}" data-tab="team-flow" role="tab">
          ${ICONS.flow}
          <span>${t('navTeamFlow')}</span>
          <span class="nav-badge" id="nav-count-admin-dec">${adminDecisions().length}</span>
        </button>
        <button type="button" class="nav-row ${state.activeTab === 'connections' ? 'is-active' : ''}" data-tab="connections" role="tab">
          ${ICONS.grid}
          <span>${t('navConnections')}</span>
        </button>
      `;
    }

    $$('.nav-row', navEl).forEach((b) => {
      b.addEventListener('click', () => {
        stopQuotePlayback();
        state.activeTab = b.dataset.tab;
        renderAll();
      });
    });

    // Unified Toolbar Title & Right Action
    const titleMap = {
      today: [t('titleToday'), t('subToday')],
      'my-bar': [t('titleMyBar'), t('subMyBar')],
      'ask-agent': [t('titleAskAgent'), t('subAskAgent')],
      circle: [t('titleCircle'), t('subCircle')],
      'team-flow': [t('titleTeamFlow'), t('subTeamFlow')],
      connections: [t('titleConnections'), t('subConnections')]
    };
    const [tTitle, tSub] = titleMap[state.activeTab] || ['', ''];
    $('#topbar-title').textContent = tTitle;
    $('#topbar-subtitle').textContent = tSub;

    const actEl = $('#topbar-actions');
    if (state.roleMode === 'admin' && state.activeTab === 'circle') {
      actEl.innerHTML = `<button type="button" class="mac-btn mac-btn-primary" id="top-add-member">${ICONS.plus}<span>${t('btnInviteVoice')}</span></button>`;
      $('#top-add-member', actEl).addEventListener('click', () => openEnrollModal(null));
    } else if (state.roleMode === 'admin' && state.activeTab === 'connections') {
      actEl.innerHTML = `
        <button type="button" class="mac-btn mac-btn-subtle" id="top-visitor-btn">${state.lang === 'zh' ? '模拟外部访客说话' : 'Simulate visitor'}</button>
        <button type="button" class="mac-btn ${state.multiBarSync ? 'mac-btn-primary' : 'mac-btn-subtle'}" id="top-sync-btn">${state.multiBarSync ? (state.lang === 'zh' ? '结束三机同频' : 'Stop 3-Mac sync') : (state.lang === 'zh' ? '演示三台 Mac 同频去重' : '3-Mac sync demo')}</button>
      `;
      $('#top-visitor-btn', actEl).addEventListener('click', () => {
        state.blockedToday += 1;
        state.visitorGateDemo = true;
        renderAll();
        showPrivacyBanner('visitor');
      });
      $('#top-sync-btn', actEl).addEventListener('click', () => {
        state.multiBarSync = !state.multiBarSync;
        state.visitorGateDemo = false;
        renderAll();
      });
    } else {
      actEl.innerHTML = '';
    }

    // Sidebar Bottom Hardware Strip & Top Menu Bar
    const statusLabel = isMuted
      ? (state.lang === 'zh' ? '物理静音中' : 'Muted')
      : emp.visibility === 'pause30'
        ? (state.lang === 'zh' ? '免打扰 30m' : 'Quiet 30m')
        : state.multiBarSync
          ? (state.lang === 'zh' ? '同频拾音中' : 'Synced')
          : (state.lang === 'zh' ? '待机呼吸绿灯' : 'Ready');

    $('#sidebar-hw-img').src = mountedPhoto(emp.finish);
    $('#sidebar-led-dot').className = `dot ${dotCls}`;
    $('#sidebar-hw-label').textContent = `${emp.name.split(' ')[0]} · ${finishLabel(emp.finish)} Bar`;
    $('#sidebar-hw-sub').textContent = `${statusLabel} · ${emp.visibility === 'team' ? t('visTeamShort') : emp.visibility === 'self' ? t('visSelfShort') : t('visPauseShort')}`;

    $('#mb-status-dot').className = `dot ${dotCls}`;
    $('#mb-status-label').textContent = statusLabel;
    $('#mbp-thumb').src = mountedPhoto(emp.finish);
    $('#mbp-title').textContent = `Rutta Bar · ${finishLabel(emp.finish)}`;
    $('#mbp-sub').textContent = `${emp.name} · MacBook Air`;
    $('#mbp-pill').textContent = statusLabel;
    $('#mbp-pill').className = `pill-tag ${isMuted ? 'pill-orange' : emp.visibility === 'pause30' ? 'pill-amber' : 'pill-green'}`;
    $$('#mbp-vis-grid .osmp-vis-btn').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.setVis === emp.visibility);
    });
  }

  /* =====================================================================
   * MACOS TOP-RIGHT FLOATING NOTIFICATION BANNERS
   * ===================================================================== */
  function showDecisionBanner(decId) {
    const dec = state.decisions.find((d) => d.id === decId) || state.decisions[0];
    if (!dec) return;
    const capturer = memberById(dec.capturedById);
    const allDone = dec.participants.every((p) => p.confirmed);
    const fc = $('#floating-card');
    fc.hidden = false;
    fc.innerHTML = `
      <div class="mn-top">
        <span class="mn-app"><img src="assets/monogram.svg" alt="" width="10" height="13"><span>Rutta · ${state.lang === 'zh' ? '刚刚捕捉的口头承诺' : 'Spoken commitment'}</span></span>
        <button type="button" class="icon-close" id="fc-close-btn" aria-label="Close">${ICONS.close}</button>
      </div>
      <div class="mn-title">${esc(pick(dec.title))}</div>
      <div class="mn-desc">
        ${capturer ? (state.lang === 'zh' ? `来自 ${capturer.name.split(' ')[0]} 的${finishLabel(capturer.finish)} Bar · ` : `Via ${capturer.name.split(' ')[0]}’s Bar · `) : ''}
        ${allDone
          ? (state.lang === 'zh' ? '双方已确认，已同步至 Linear / Notion / Slack。' : 'Confirmed & synced to Linear, Notion, and Slack.')
          : (state.lang === 'zh' ? '未确认前仅你们 2 人可见，管理者不可访问。' : 'Private to participants until confirmed.')}
      </div>
      <div class="mn-foot">
        <div class="confirm-pills">
          ${dec.participants.map((p) => {
            const m = memberById(p.memberId);
            const first = m ? m.name.split(' ')[0] : '?';
            return `
              <button type="button" class="confirm-pill ${p.confirmed ? 'is-done' : ''}" data-fc-confirm="${dec.id}:${p.memberId}">
                ${renderAvatar(m, 'xs')}
                <span>${esc(first)} ${p.confirmed ? '✓' : (state.lang === 'zh' ? '确认' : 'Confirm')}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
    $('#fc-close-btn', fc).addEventListener('click', () => { fc.hidden = true; });
    $$('[data-fc-confirm]', fc).forEach((b) => {
      b.addEventListener('click', () => {
        const [did, mid] = b.dataset.fcConfirm.split(':');
        toggleConfirm(did, mid, true);
      });
    });
  }

  function showPrivacyBanner(kind = 'peer') {
    const fc = $('#floating-card');
    fc.hidden = false;
    const isPeer = kind === 'peer';
    fc.innerHTML = `
      <div class="mn-top">
        <span class="mn-app"><img src="assets/monogram.svg" alt="" width="10" height="13"><span>Rutta · ${state.lang === 'zh' ? '声纹隐私门禁' : 'Voiceprint Gate'}</span></span>
        <button type="button" class="icon-close" id="fc-close-btn" aria-label="Close">${ICONS.close}</button>
      </div>
      <div class="mn-title">${isPeer
        ? (state.lang === 'zh' ? '小会防收录生效 · 已忽略 Leo 的发言' : 'Leo’s speech ignored on teammate’s Bar')
        : (state.lang === 'zh' ? '1 位外部访客开口 · 顶灯未亮、0 留存' : '1 visitor spoke · LED stayed dark, 0 saved')}</div>
      <div class="mn-desc">${isPeer
        ? (state.lang === 'zh' ? 'Leo 将可见性设为了「仅我的 Mac」：Maya 的 Rutta Bar 遇到 Leo 声音时保持熄灯并实时丢弃，仅收录 Maya 本人。' : 'Leo set visibility to My Mac Only. Maya’s Bar drops Leo’s voice immediately without lighting up.')
        : (state.lang === 'zh' ? '未匹配到北极星团队白名单声纹，硬件顶灯保持熄灭，音频片段已在内存端实时丢弃。' : 'Voice did not match Northstar’s circle. Top LED stayed off and audio was discarded.')}</div>
    `;
    $('#fc-close-btn', fc).addEventListener('click', () => { fc.hidden = true; });
  }

  /* =====================================================================
   * EMPLOYEE VIEW 1: TODAY'S MEMORY STREAM + AIRDROP VISIBILITY BAR
   * ===================================================================== */
  function renderEmployeeTodayView() {
    const emp = currentEmployee();
    const allMine = employeeDecisions(emp.id);
    const pendingCnt = allMine.filter((d) => d.status === 'pending').length;
    const list = allMine.filter((d) => state.decFilter === 'all' || d.status === state.decFilter);
    let selected = list.find((d) => d.id === state.selectedDecisionId) || list[0] || null;
    if (selected) state.selectedDecisionId = selected.id;

    const visExplain = emp.visibility === 'team'
      ? (state.lang === 'zh' ? '小会时同事的 Bar 可识别我，草稿经我确认后才共享' : 'Teammates’ Bars can include you in huddles (requires your confirm)')
      : emp.visibility === 'self'
        ? (state.lang === 'zh' ? '小会时同事的 Bar 遇到我不亮灯、0 留存（仅本机可记我）' : 'Teammates’ Bars stay dark & drop your voice (My Mac Only)')
        : (state.lang === 'zh' ? '免打扰生效中：所有 Rutta Bar 静默忽略我的声音' : 'Quiet 30m active: all Bars ignore your voice');

    return `
      <!-- Compact Ambient Hardware & AirDrop-style Voice Visibility Strip -->
      <section class="ambient-strip">
        <div class="as-device">
          <img class="as-photo" src="${mountedPhoto(emp.finish)}" alt="">
          <div>
            <div class="as-title">
              <span class="dot ${emp.barState === 'muted' ? 'dot-mute' : 'dot-ready'}"></span>
              <span>${esc(emp.name)} · ${finishLabel(emp.finish)} Rutta Bar</span>
              ${emp.barState === 'muted' ? `<span class="pill-tag pill-orange">${state.lang === 'zh' ? '物理静音' : 'Muted'}</span>` : ''}
            </div>
            <div class="as-sub">${esc(visExplain)}</div>
          </div>
        </div>

        <div class="as-visibility">
          <span class="as-vis-label">${t('visLabel')}</span>
          <div class="airdrop-seg" role="group" aria-label="Voice Visibility">
            <button type="button" class="airdrop-btn ${emp.visibility === 'self' ? 'is-active' : ''}" data-vis="self">${t('visSelfShort')}</button>
            <button type="button" class="airdrop-btn ${emp.visibility === 'team' ? 'is-active' : ''}" data-vis="team">${t('visTeamShort')}</button>
            <button type="button" class="airdrop-btn ${emp.visibility === 'pause30' ? 'is-active' : ''}" data-vis="pause30">${t('visPauseShort')}</button>
          </div>
        </div>
      </section>

      <!-- Master-Detail Spoken Memory Stream -->
      <section class="memory-workspace">
        <div class="memory-feed">
          <div class="mf-head">
            <div class="mf-tabs">
              <button type="button" class="mf-tab ${state.decFilter === 'all' ? 'is-active' : ''}" data-dec-filter="all">${state.lang === 'zh' ? '全部' : 'All'} (${allMine.length})</button>
              <button type="button" class="mf-tab ${state.decFilter === 'pending' ? 'is-active' : ''}" data-dec-filter="pending">${state.lang === 'zh' ? '待确认' : 'Inbox'} (${pendingCnt})</button>
              <button type="button" class="mf-tab ${state.decFilter === 'synced' ? 'is-active' : ''}" data-dec-filter="synced">${state.lang === 'zh' ? '已归档' : 'Synced'}</button>
            </div>
          </div>
          <div class="mf-list">
            ${list.map((d) => {
              const capturer = memberById(d.capturedById);
              const dotCls = d.status === 'synced' ? 'dot-ready' : d.status === 'pending' ? 'dot-input' : 'dot-paused';
              return `
                <button type="button" class="mf-card ${selected && selected.id === d.id ? 'is-selected' : ''}" data-select-dec="${d.id}">
                  <div class="mfc-top">
                    <span class="mfc-time"><span class="dot ${dotCls}"></span>${esc(pick(d.timeShort))} · ${esc(d.duration)}</span>
                    ${d.visitorIgnoredCount > 0 ? `<span class="pill-tag pill-neutral">${state.lang === 'zh' ? '已滤 1 访客' : '1 visitor dropped'}</span>` : ''}
                  </div>
                  <div class="mfc-title">${esc(pick(d.title))}</div>
                  <div class="mfc-foot">
                    <div class="avatar-stack">
                      ${d.participants.map((p) => renderAvatar(memberById(p.memberId), 'xs')).join('')}
                    </div>
                    <span class="mfc-via">${capturer ? (state.lang === 'zh' ? `经 ${capturer.name.split(' ')[0]} 的 Bar` : `Via ${capturer.name.split(' ')[0]}’s Bar`) : ''}</span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="note-canvas">
          ${selected ? renderDecisionNote(selected, false) : `<p style="color:var(--muted);padding:32px 0;text-align:center;">${state.lang === 'zh' ? '暂无讨论记录' : 'No notes in this filter'}</p>`}
        </div>
      </section>
    `;
  }

  function renderDecisionNote(dec, isAdmin) {
    const owner = memberById(dec.ownerId);
    const capturer = memberById(dec.capturedById);
    const isPlaying = playingQuoteId === dec.id;
    const showInlineAgent = !isAdmin && state.inlineAgentDecId === dec.id && state.agentResult;

    const statusPill = dec.status === 'synced'
      ? `<span class="pill-tag pill-green">${state.lang === 'zh' ? '已确认并同步团队空间' : 'Confirmed & synced'}</span>`
      : dec.status === 'monday'
        ? `<span class="pill-tag pill-neutral">${state.lang === 'zh' ? '周一待认领跟进' : 'Unassigned follow-up'}</span>`
        : `<span class="pill-tag pill-amber">${state.lang === 'zh' ? '私密草稿 · 待双方确认' : 'Private draft · Confirm'}</span>`;

    return `
      <div>
        <div class="nc-eyebrow">
          <span class="nc-provenance">
            ${capturer ? `<i class="sw sw-${capturer.finish}"></i>` : ''}
            <span>${esc(pick(dec.context))}${capturer ? (state.lang === 'zh' ? ` · 收录自 ${capturer.name.split(' ')[0]} 的${finishLabel(capturer.finish)} Rutta Bar` : ` · Captured via ${capturer.name.split(' ')[0]}’s Bar`) : ''}</span>
          </span>
          ${statusPill}
        </div>
        <h2 class="nc-title">${esc(pick(dec.title))}</h2>
        <p class="nc-summary">${esc(pick(dec.summary))}</p>
      </div>

      <div class="nc-bento-row">
        <div class="nc-bento">
          <span class="ncb-label">${state.lang === 'zh' ? '负责人与节点' : 'Owner & target date'}</span>
          <div class="ncb-main">
            ${dec.status === 'monday' && !owner
              ? `<select class="mac-btn mac-btn-subtle mac-btn-xs" data-assign-owner="${dec.id}">
                  <option value="">${state.lang === 'zh' ? '指派负责人…' : 'Assign owner…'}</option>
                  ${state.members.filter((m) => m.active).map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join('')}
                </select>`
              : `<span class="ncb-owner">${renderAvatar(owner, 'sm')}<span>${owner ? esc(owner.name) : (state.lang === 'zh' ? '待认领' : 'Unassigned')}</span></span>`
            }
            <span class="ncb-due">${esc(pick(dec.due))}</span>
          </div>
        </div>

        <div class="nc-bento ${dec.status === 'synced' ? 'nc-bento-sage' : 'nc-bento-warm'}">
          <span class="ncb-label">${dec.status === 'synced'
            ? (state.lang === 'zh' ? '已自动流转至' : 'Synced destinations')
            : (state.lang === 'zh' ? '在场成员确认后解锁共享' : 'Participants confirm to share')}</span>
          <div class="confirm-pills">
            ${dec.status === 'synced'
              ? dec.syncedTools.map((tool) => `<span class="pill-tag pill-green">✓ ${esc(tool)}</span>`).join('')
              : dec.participants.map((p) => {
                  const m = memberById(p.memberId);
                  const first = m ? m.name.split(' ')[0] : '?';
                  return `
                    <button type="button" class="confirm-pill ${p.confirmed ? 'is-done' : ''}" data-confirm-part="${dec.id}:${p.memberId}">
                      ${renderAvatar(m, 'xs')}
                      <span>${esc(first)} · ${p.confirmed ? (state.lang === 'zh' ? '已确认 ✓' : 'Confirmed ✓') : (state.lang === 'zh' ? '点此确认' : 'Confirm')}</span>
                    </button>
                  `;
                }).join('')
            }
          </div>
        </div>
      </div>

      ${dec.visitorIgnoredCount > 0 ? `
        <div style="display:flex;align-items:center;gap:8px;padding:9px 13px;border-radius:10px;background:var(--bento-cool);font-size:12px;color:var(--ink-2);">
          ${ICONS.shield}
          <span>${state.lang === 'zh'
            ? `讨论中检测到 ${dec.visitorIgnoredCount} 位未加入声纹圈的外部访客开口：指示灯未亮，访客语音已实时丢弃。`
            : `${dec.visitorIgnoredCount} unenrolled visitor spoke during this session: LED stayed dark and visitor audio was dropped immediately.`}</span>
        </div>
      ` : ''}

      ${isAdmin ? `
        <div class="encrypted-vault">
          <div class="ev-left">
            <div class="ev-lock-orb">${ICONS.lock}</div>
            <div>
              <div class="ev-title">${state.lang === 'zh' ? '端到端参与者原声锁（管理者无权回放）' : 'Participant-Encrypted Source Clip (Locked for Admins)'}</div>
              <div class="ev-desc">${state.lang === 'zh' ? '原声波形仅对本场在场成员开放核对，并在确认 7 天后自动抹除；管理者仅可查看上方已确认文字结论。' : 'Original audio waveforms are accessible strictly to present participants and auto-erase 7 days after confirmation.'}</div>
            </div>
          </div>
          <button type="button" class="mac-btn mac-btn-subtle mac-btn-xs" id="btn-demo-switch-listener">
            <span>${state.lang === 'zh' ? '以当事人视角试听' : 'Preview as participant'}</span>
            ${ICONS.ext}
          </button>
        </div>
      ` : `
        <div class="voice-proof-card">
          <div class="vp-head">
            <div class="vp-legend">
              <span>${state.lang === 'zh' ? '双轨声纹核对片段' : 'Dual-track source clip'} (${dec.quoteDuration})</span>
              <span style="font-weight:500;color:var(--muted);"><i class="spk-dot spk-a"></i>${esc(dec.quotes[0]?.speaker || 'A')}</span>
              ${dec.quotes[1] ? `<span style="font-weight:500;color:var(--muted);"><i class="spk-dot spk-b"></i>${esc(dec.quotes[1].speaker)}</span>` : ''}
            </div>
            <span style="display:inline-flex;align-items:center;gap:5px;color:var(--muted);">
              ${ICONS.lock}
              <span>${state.lang === 'zh' ? '仅在场成员可回放 · 7 天后自动抹除' : 'Participants only · Auto-erases in 7d'}</span>
            </span>
          </div>

          <div class="vp-scrubber">
            <button type="button" class="vp-play-btn" data-play-quote="${dec.id}" aria-label="Play source clip">
              ${isPlaying ? ICONS.pause : ICONS.play}
            </button>
            <div class="vp-bars" id="qd-wave-${dec.id}">
              ${Array.from({ length: 60 }, (_, i) => {
                const h = 24 + ((i * 37 + 19) % 72);
                const trackCls = i < 28 ? 'track-a' : 'track-b';
                const played = isPlaying ? (i / 60) <= quotePlayPct : i < 16;
                return `<span class="${trackCls} ${played ? 'is-played' : ''}" style="height:${h}%"></span>`;
              }).join('')}
            </div>
            <span class="vp-clock" id="qd-time-${dec.id}">${isPlaying ? formatClipTime(dec.quoteDuration, quotePlayPct) : `0:00 / ${dec.quoteDuration}`}</span>
          </div>

          <div class="vp-transcript">
            ${dec.quotes.map((q) => `
              <div class="vpt-row ${q.key ? 'is-key' : ''}">
                <span class="vpt-ts">${q.ts}</span>
                <span class="vpt-spk" style="color:${q.track === 'a' ? 'var(--indigo)' : 'var(--green-deep)'}">${esc(q.speaker)}</span>
                <span>${esc(pick(q))}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="inline-agent-bar">
          <div class="iab-row">
            <div class="iab-chips">
              <span style="font-size:11.5px;font-weight:600;color:var(--muted);margin-right:2px;">${state.lang === 'zh' ? '顺手交给 Agent：' : 'Hand off to Agent:'}</span>
              <button type="button" class="prompt-pill ${showInlineAgent && state.agentPreset === 'client-email' ? 'is-active' : ''}" data-inline-agent="${dec.id}:client-email">${state.lang === 'zh' ? '起草客户延期邮件' : 'Draft client update email'}</button>
              <button type="button" class="prompt-pill ${showInlineAgent && state.agentPreset === 'linear-task' ? 'is-active' : ''}" data-inline-agent="${dec.id}:linear-task">${state.lang === 'zh' ? '生成 Linear 任务单' : 'Create Linear issue'}</button>
            </div>
            <button type="button" class="mac-btn mac-btn-ghost mac-btn-xs" style="color:var(--red);" data-delete-dec="${dec.id}">
              ${state.lang === 'zh' ? '销毁此段记录与原声' : 'Destroy note & clip'}
            </button>
          </div>

          ${showInlineAgent ? `
            <div class="agent-draft-box">
              <div class="adb-meta">
                <span>${esc(state.agentResult.citation)}</span>
                <span>${esc(state.agentResult.channel)}</span>
              </div>
              <div class="adb-body">${esc(state.agentResult.body)}</div>
              <div class="adb-foot">
                <span>${state.lang === 'zh' ? '仅基于已确认文字结论生成 · 未读取原始音频' : 'Grounded in confirmed text only · Zero raw audio read'}</span>
                <button type="button" class="mac-btn mac-btn-primary mac-btn-xs" id="inline-agent-send" ${state.agentApproved ? 'disabled' : ''}>
                  ${state.agentApproved ? (state.lang === 'zh' ? '已发送 ✓' : 'Sent ✓') : (state.lang === 'zh' ? '确认并发送' : 'Approve & send')}
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      `}
    `;
  }

  function formatClipTime(totalStr, pct) {
    const parts = totalStr.split(':').map(Number);
    const sec = (parts[0] || 0) * 60 + (parts[1] || 12);
    return `0:${String(Math.min(sec, Math.round(sec * pct))).padStart(2, '0')} / ${totalStr}`;
  }

  /* =====================================================================
   * EMPLOYEE VIEW 2: MY VOICEPRINT & STUDIO HARDWARE STAGE
   * ===================================================================== */
  function renderEmployeeBarView() {
    const emp = currentEmployee();
    const isMuted = emp.barState === 'muted';

    let stageImg = mountedPhoto(emp.finish);
    let stageBadge = `${finishLabel(emp.finish)} Rutta Bar · ${isMuted ? (state.lang === 'zh' ? '物理静音已拨下' : 'Hardware muted') : (state.lang === 'zh' ? 'MacBook Air 侧插待机中' : 'Side-mounted & ready')}`;
    if (state.hwStageView === 'macro') {
      stageImg = isMuted ? 'assets/macro-mute.webp' : 'assets/macro-ready.webp';
      stageBadge = isMuted
        ? (state.lang === 'zh' ? '微距实拍 · 露出橙色机械标，顶灯彻底熄灭' : 'Macro · Orange mark exposed, LED dark')
        : (state.lang === 'zh' ? '微距实拍 · 顶部绿灯缓慢呼吸，滑键开启' : 'Macro · Breathing green LED, switch open');
    } else if (state.hwStageView === 'closed') {
      stageImg = 'assets/closedside-1200.webp';
      stageBadge = state.lang === 'zh' ? '合盖休眠持续待机 · 散会补一句不漏记' : 'Lid-closed standby · Captures hallway wrap-ups';
    }

    const visOpts = [
      {
        id: 'team',
        title: state.lang === 'zh' ? '同团队成员设备可收录（推荐）' : 'Team Rutta Bars allowed (Recommended)',
        tag: state.lang === 'zh' ? '小会互通' : 'Huddles OK',
        desc: state.lang === 'zh'
          ? '与同事开小会或围坐讨论时，对方的 Rutta Bar 可以识别你的声纹，并将生成的草稿同步推给你确认后才对外共享。'
          : 'During desk huddles, a teammate’s Rutta Bar can recognize you and send the private draft to both of you for confirmation.'
      },
      {
        id: 'self',
        title: state.lang === 'zh' ? '仅我的 Mac 设备可收录' : 'My Mac’s Rutta Bar only',
        tag: state.lang === 'zh' ? '他人设备不亮灯' : 'Strict self-only',
        desc: state.lang === 'zh'
          ? '只有插在你本人电脑上的 Rutta Bar 能识别你；其他同事的设备遇到你的声音将视同外部访客——不亮灯、不转写、0 留存。'
          : 'Only your own Mac’s Bar recognizes you. Other teammates’ Bars treat your voice like an external visitor—LED stays dark, 0 saved.'
      },
      {
        id: 'pause30',
        title: state.lang === 'zh' ? '临时免打扰（30 分钟）' : 'Quiet Mode (Pause 30 minutes)',
        tag: state.lang === 'zh' ? '聊私事一键隐身' : 'Temporary pause',
        desc: state.lang === 'zh'
          ? '临时谈私事或敏感话题时一键开启，30 分钟内所有设备均静默忽略你的声音，到期自动恢复原设置。'
          : 'Silently ignores your voice across every device for 30 minutes during private chats, then resumes automatically.'
      }
    ];

    return `
      <div class="studio-split">
        <section class="hw-stage-card">
          <div class="cb-head" style="margin-bottom:0;">
            <div>
              <h2>${esc(emp.name)} · ${finishLabel(emp.finish)} Rutta Bar</h2>
              <p>${state.lang === 'zh' ? 'USB-C 直连供电 · 无内置电池 · 双面盲拨机械静音滑键' : 'USB-C powered · Battery-free · Tactile mechanical mute slider'}</p>
            </div>
            <div class="airdrop-seg">
              <button type="button" class="airdrop-btn ${state.hwStageView === 'mounted' ? 'is-active' : ''}" data-stage-view="mounted">${state.lang === 'zh' ? '装机实拍' : 'Mounted'}</button>
              <button type="button" class="airdrop-btn ${state.hwStageView === 'macro' ? 'is-active' : ''}" data-stage-view="macro">${state.lang === 'zh' ? '滑键微距' : 'Switch macro'}</button>
              <button type="button" class="airdrop-btn ${state.hwStageView === 'closed' ? 'is-active' : ''}" data-stage-view="closed">${state.lang === 'zh' ? '合盖待机' : 'Lid closed'}</button>
            </div>
          </div>

          <div class="sculptural-frame">
            <img src="${stageImg}" alt="Rutta Bar studio view">
            <span class="sf-badge-tl">
              <span class="dot ${isMuted ? 'dot-mute' : 'dot-ready'}"></span>
              <span>${esc(stageBadge)}</span>
            </span>
            <div class="sf-action-br">
              <button type="button" class="mac-btn ${isMuted ? 'mac-btn-primary' : 'mac-btn-subtle'}" id="btn-stage-mute">
                ${isMuted ? (state.lang === 'zh' ? '推回滑键 · 恢复待机' : 'Slide open · Resume') : (state.lang === 'zh' ? '拨下物理静音滑键' : 'Slide physical mute')}
              </button>
            </div>
          </div>

          <div class="kv-box">
            <div class="kv-line">
              <span>${state.lang === 'zh' ? '声纹校准状态' : 'Acoustic signature'}</span>
              <span style="display:inline-flex;align-items:center;gap:8px;">
                <span class="sr-wave">${emp.bars.map((h) => `<span style="height:${Math.round(h * 0.17)}px"></span>`).join('')}</span>
                <span class="pill-tag pill-green">${state.lang === 'zh' ? '已校准' : 'Calibrated'}</span>
              </span>
            </div>
            <div class="kv-line">
              <span>${state.lang === 'zh' ? '合盖休眠持续待机' : 'Lid-closed standby'}</span>
              <button type="button" class="mac-switch" role="switch" aria-checked="${emp.lidStandby}" id="emp-lid-switch"></button>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;">
            <button type="button" class="mac-btn mac-btn-subtle mac-btn-xs" id="emp-reenroll-btn">${state.lang === 'zh' ? '重新朗读校准声纹' : 'Recalibrate voiceprint'}</button>
            <button type="button" class="mac-btn mac-btn-subtle mac-btn-xs" id="emp-test-peer-banner">${state.lang === 'zh' ? '测试与 Maya 开小会时的收录提示' : 'Simulate huddle with Maya'}</button>
          </div>
        </section>

        <section class="card-box">
          <div class="cb-head">
            <div>
              <h2>${state.lang === 'zh' ? '谁的 Rutta Bar 可以收录我的声音' : 'Who Can Capture My Voice'}</h2>
              <p>${state.lang === 'zh' ? '像 AirDrop 一样随时切换可见范围；仅你本人可改，团队管理员无法代开。' : 'Switch visibility anytime like AirDrop—admins cannot override your choice.'}</p>
            </div>
            <span class="pill-tag pill-neutral">${ICONS.lock} ${state.lang === 'zh' ? '本人独占' : 'Self-owned'}</span>
          </div>

          <div class="consent-radio-cards">
            ${visOpts.map((opt) => `
              <button type="button" class="consent-card-opt ${emp.visibility === opt.id ? 'is-selected' : ''}" data-pick-vis="${opt.id}">
                <div>
                  <div class="cco-title">
                    <span>${esc(opt.title)}</span>
                    <span class="pill-tag ${opt.id === 'team' ? 'pill-green' : opt.id === 'pause30' ? 'pill-amber' : 'pill-neutral'}">${esc(opt.tag)}</span>
                  </div>
                  <p class="cco-desc">${esc(opt.desc)}</p>
                </div>
                <span class="cco-radio" aria-hidden="true"></span>
              </button>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }

  /* =====================================================================
   * EMPLOYEE VIEW 3: ASK AGENT (MCP CONTEXT HANDOFF)
   * ===================================================================== */
  function renderEmployeeAgentView() {
    if (!state.agentResult) computeAgentPreset(state.agentPreset || 'client-email');
    const chips = state.lang === 'zh'
      ? [
          { id: 'client-email', label: '把刚改到 12 月 10 日的上线排期写封客户更新邮件' },
          { id: 'linear-task', label: '按周二评审结论给 Leo 建好银色样机固件单' },
          { id: 'why-silver', label: '回溯一下当时为什么选了银色款机身？' }
        ]
      : [
          { id: 'client-email', label: 'Draft client email for moving launch to Dec 10' },
          { id: 'linear-task', label: 'Create Thursday Silver firmware ticket for Leo' },
          { id: 'why-silver', label: 'Why did we pick the Silver finish?' }
        ];

    return `
      <div class="gov-grid">
        <section class="card-box" style="display:flex;flex-direction:column;gap:14px;">
          <div class="cb-head" style="margin-bottom:0;">
            <div>
              <h2>${state.lang === 'zh' ? '一句话把口头决定交给 Agent' : 'Hand Off Spoken Decisions to Agent'}</h2>
              <p>${state.lang === 'zh' ? '通过本地 MCP 仅读取已确认的文字决定，不暴露任何原始录音。' : 'Reads confirmed text notes via MCP without exposing raw audio.'}</p>
            </div>
          </div>

          <form id="agent-form" style="display:flex;gap:8px;">
            <input type="text" id="agent-input" style="flex:1;padding:8px 12px;border-radius:9px;border:0;background:var(--bento);box-shadow:inset 0 0 0 0.5px var(--hair-strong);" placeholder="${state.lang === 'zh' ? '输入指令，例如：帮我把刚定的延期原因发给客户…' : 'Ask Rutta Agent…'}" autocomplete="off">
            <button type="submit" class="mac-btn mac-btn-primary">${state.lang === 'zh' ? '生成草稿' : 'Generate'}</button>
          </form>

          <div class="iab-chips">
            ${chips.map((c) => `<button type="button" class="prompt-pill ${state.agentPreset === c.id ? 'is-active' : ''}" data-agent-preset="${c.id}">${esc(c.label)}</button>`).join('')}
          </div>

          ${state.agentResult ? `
            <div class="agent-draft-box">
              <div class="adb-meta">
                <span>${esc(state.agentResult.citation)}</span>
                <span>${esc(state.agentResult.channel)}</span>
              </div>
              <div class="adb-body">${esc(state.agentResult.body)}</div>
              <div class="adb-foot">
                <span>${state.lang === 'zh' ? '数据源：已确认文字纪要 · 0 原始音频读取' : 'Source: Confirmed text notes · 0 raw audio read'}</span>
                <button type="button" class="mac-btn mac-btn-primary mac-btn-xs" id="agent-approve-btn" ${state.agentApproved ? 'disabled' : ''}>
                  ${state.agentApproved ? (state.lang === 'zh' ? '已发出 ✓' : 'Sent ✓') : (state.lang === 'zh' ? '确认并发送' : 'Approve & send')}
                </button>
              </div>
            </div>
          ` : ''}
        </section>

        <section class="card-box">
          <div class="cb-head">
            <div>
              <h2>${state.lang === 'zh' ? '已连接的团队流转去向' : 'Connected Workspace Destinations'}</h2>
              <p>${state.lang === 'zh' ? '只有你在卡片上点击确认后，对应决定才会同步至以下工具。' : 'Notes sync here only after participants confirm.'}</p>
            </div>
          </div>
          <div class="connector-grid">
            ${state.integrations.map((tool) => `
              <div class="conn-tile">
                <div class="ct-top">
                  <span class="ct-icon">${esc(tool.glyph)}</span>
                  <span class="pill-tag ${tool.enabled ? 'pill-green' : 'pill-neutral'}">${tool.enabled ? (state.lang === 'zh' ? '已连接' : 'Active') : (state.lang === 'zh' ? '已停用' : 'Off')}</span>
                </div>
                <div>
                  <div class="ct-name">${esc(tool.name)}</div>
                  <div class="ct-target">${esc(tool.target)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }

  /* =====================================================================
   * ADMIN VIEW 1: VOICEPRINT CIRCLE & SCULPTURAL SEAT INSPECTOR
   * ===================================================================== */
  function renderAdminCircleView() {
    const activeList = state.members.filter((m) => m.active);
    const teamVisCount = activeList.filter((m) => m.visibility === 'team').length;
    const selfOnlyCount = activeList.length - teamVisCount;

    const q = state.vpSearch.trim().toLowerCase();
    const rows = state.members.filter((m) => {
      if (state.vpFilter === 'active' && !m.active) return false;
      if (state.vpFilter === 'paused' && m.active) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || pick(m.role).toLowerCase().includes(q);
    });

    let inspected = memberById(state.selectedSeatId) || rows[0] || state.members[0];
    if (inspected) state.selectedSeatId = inspected.id;

    const barStateText = (m) => {
      if (!m.active) return state.lang === 'zh' ? '声纹已停用' : 'Voiceprint paused';
      if (m.barState === 'muted') return state.lang === 'zh' ? '物理静音已拨下' : 'Hardware muted';
      if (m.barState === 'lid_closed') return state.lang === 'zh' ? '合盖持续待机中' : 'Lid-closed standby';
      return state.lang === 'zh' ? 'USB-C 在线待机' : 'USB-C ready';
    };

    return `
      <!-- Soft Tactile Studio Pulse Bento -->
      <section class="pulse-bento-grid">
        <div class="pulse-tile tone-sage">
          <div class="pt-top">
            <span>${state.lang === 'zh' ? '声纹圈活跃席位' : 'Active voiceprint circle'}</span>
            <span class="pill-tag pill-green"><span class="dot dot-ready"></span>${state.lang === 'zh' ? '白名单生效' : 'Gate ON'}</span>
          </div>
          <div class="pt-num">${activeList.length}<small>/ ${state.members.length} ${state.lang === 'zh' ? '位成员' : 'seats'}</small></div>
          <div class="pt-foot">${state.lang === 'zh' ? '仅识别声纹圈内成员，随时支持本人退出销毁' : 'Only enrolled teammates trigger capture'}</div>
        </div>

        <div class="pulse-tile tone-cool">
          <div class="pt-top">
            <span>${state.lang === 'zh' ? '小会跨设备可见性分布' : 'Huddle peer-capture visibility'}</span>
            <span class="pill-tag pill-neutral">${ICONS.lock} ${state.lang === 'zh' ? '员工自决' : 'Member-set'}</span>
          </div>
          <div class="pt-num">${teamVisCount}<small>${state.lang === 'zh' ? `位团队互通 · ${selfOnlyCount} 位仅本机` : `Team Bars · ${selfOnlyCount} Self-only`}</small></div>
          <div class="pt-foot">${state.lang === 'zh' ? '成员可在菜单栏随时切为「仅我的 Mac」，管理员不可代开' : 'Set by each member in their menu bar'}</div>
        </div>

        <div class="pulse-tile tone-warm">
          <div class="pt-top">
            <span>${state.lang === 'zh' ? '今日已静默忽略未授权语音' : 'Unauthorized speech dropped'}</span>
            <span class="pill-tag pill-neutral">${state.lang === 'zh' ? '0 秒落盘' : '0 saved'}</span>
          </div>
          <div class="pt-num">${state.blockedToday}<small>${state.lang === 'zh' ? '次不亮灯丢弃' : 'dropped today'}</small></div>
          <div class="pt-foot">${state.lang === 'zh' ? '涵盖外部来访客户与设为「仅本机」的同事发言' : 'Includes visitors & self-only teammates'}</div>
        </div>
      </section>

      <!-- Left Voiceprint Roster + Right Sculptural MacBook Air Seat Inspector -->
      <section class="circle-workspace">
        <div class="seat-list-card">
          <div class="sl-toolbar">
            <div class="mf-tabs">
              <button type="button" class="mf-tab ${state.vpFilter === 'all' ? 'is-active' : ''}" data-vp-filter="all">${state.lang === 'zh' ? '全部席位' : 'All'} (${state.members.length})</button>
              <button type="button" class="mf-tab ${state.vpFilter === 'active' ? 'is-active' : ''}" data-vp-filter="active">${state.lang === 'zh' ? '活跃中' : 'Active'}</button>
              <button type="button" class="mf-tab ${state.vpFilter === 'paused' ? 'is-active' : ''}" data-vp-filter="paused">${state.lang === 'zh' ? '已暂停' : 'Paused'}</button>
            </div>
            <div class="mac-search">
              ${ICONS.search}
              <input type="search" id="vp-search-input" value="${esc(state.vpSearch)}" placeholder="${state.lang === 'zh' ? '搜索成员或岗位…' : 'Filter teammates…'}">
            </div>
          </div>

          <div class="seat-rows">
            ${rows.length === 0
              ? `<div style="padding:36px;text-align:center;color:var(--muted);">${state.lang === 'zh' ? '未找到匹配成员' : 'No matching teammates'}</div>`
              : rows.map((m) => `
                <div class="seat-row ${inspected && inspected.id === m.id ? 'is-selected' : ''} ${m.active ? '' : 'is-paused'}" data-select-seat="${m.id}">
                  <div class="sr-person">
                    ${renderAvatar(m)}
                    <div style="min-width:0;">
                      <div class="sr-name">${esc(m.name)}</div>
                      <div class="sr-meta">
                        <i class="sw sw-${m.finish}" style="width:8px;height:8px;"></i>
                        <span>${esc(pick(m.role))} · ${finishLabel(m.finish)}</span>
                      </div>
                    </div>
                  </div>

                  <div class="sr-wave" aria-hidden="true">
                    ${m.bars.slice(0, 10).map((h) => `<span style="height:${Math.round(h * 0.17)}px"></span>`).join('')}
                  </div>

                  <div>${visibilityBadge(m)}</div>

                  <div style="display:flex;align-items:center;justify-content:flex-end;gap:10px;" onclick="event.stopPropagation()">
                    <button type="button" class="mac-switch" role="switch" aria-checked="${m.active}" data-toggle-member="${m.id}" aria-label="${esc(m.name)}"></button>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>

        ${inspected ? `
          <aside class="seat-inspector">
            <div class="si-stage">
              <img src="${mountedPhoto(inspected.finish)}" alt="${finishLabel(inspected.finish)} Rutta Bar">
              <div class="si-overlay-bar">
                <span style="display:inline-flex;align-items:center;gap:6px;">
                  <span class="dot ${!inspected.active ? 'dot-paused' : inspected.barState === 'muted' ? 'dot-mute' : 'dot-ready'}"></span>
                  <span>${esc(inspected.name)} · ${finishLabel(inspected.finish)} Bar</span>
                </span>
                <span style="color:var(--muted);font-size:11px;">${barStateText(inspected)}</span>
              </div>
            </div>

            <div class="kv-box">
              <div class="kv-line">
                <span>${state.lang === 'zh' ? '工作邮箱' : 'Work email'}</span>
                <span>${esc(inspected.email)}</span>
              </div>
              <div class="kv-line">
                <span>${state.lang === 'zh' ? '最近声纹匹配' : 'Last recognized'}</span>
                <span>${esc(pick(inspected.lastHeard))}</span>
              </div>
              <div class="kv-line">
                <span>${state.lang === 'zh' ? '跨设备收录可见性' : 'Huddle visibility'}</span>
                <span>${visibilityBadge(inspected)}</span>
              </div>
              <div class="kv-line">
                <span>${state.lang === 'zh' ? '权限归属' : 'Control ownership'}</span>
                <span style="color:var(--muted);font-weight:500;">${state.lang === 'zh' ? '员工本人控制 · 管理员只读' : 'Employee-owned (read-only)'}</span>
              </div>
            </div>

            <div style="display:flex;gap:7px;flex-wrap:wrap;">
              ${(inspected.id === 'leo' || inspected.id === 'maya') ? `
                <button type="button" class="mac-btn mac-btn-subtle mac-btn-xs" style="flex:1;" data-jump-emp="${inspected.id}">
                  <span>${state.lang === 'zh' ? `切到 ${inspected.name.split(' ')[0]} 个人视角` : `Open ${inspected.name.split(' ')[0]}’s view`}</span>
                  ${ICONS.ext}
                </button>
              ` : ''}
              <button type="button" class="mac-btn mac-btn-subtle mac-btn-xs" style="flex:1;" data-reenroll-seat="${inspected.id}">${state.lang === 'zh' ? '重新校准声纹' : 'Recalibrate'}</button>
              <button type="button" class="mac-btn mac-btn-ghost mac-btn-xs" style="color:var(--red);" data-delete-member="${inspected.id}">${state.lang === 'zh' ? '销毁声纹' : 'Remove'}</button>
            </div>
          </aside>
        ` : ''}
      </section>
    `;
  }

  /* =====================================================================
   * ADMIN VIEW 2: TEAM DECISION FLOW (PRIVACY-SCOPED OUTCOMES)
   * ===================================================================== */
  function renderAdminFlowView() {
    const visibleList = adminDecisions();
    const hiddenDrafts = state.decisions.filter((d) => d.status === 'pending').length;
    const mondayCnt = visibleList.filter((d) => d.status === 'monday').length;
    const list = visibleList.filter((d) => state.decFilter === 'all' || d.status === state.decFilter);
    let selected = list.find((d) => d.id === state.selectedDecisionId) || list[0] || null;
    if (selected) state.selectedDecisionId = selected.id;

    return `
      <div class="ambient-strip" style="background:var(--bento-cool);">
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="ev-lock-orb" style="width:30px;height:30px;border-radius:8px;">${ICONS.shield}</span>
          <div>
            <div style="font-weight:630;font-size:12.5px;">${state.lang === 'zh'
              ? `团队脱敏看板：${hiddenDrafts} 条未确认私密讨论已自动隐藏，所有原始音频均对管理者加密隔离`
              : `Privacy-scoped board: ${hiddenDrafts} unconfirmed drafts are hidden and all original voice clips stay locked`}</div>
            <div style="font-size:11.5px;color:var(--muted);">${state.lang === 'zh'
              ? '这里仅汇总已获在场双方确认的正式团队决定与待认领跟进项，避免管理后台演变为录音监控工具。'
              : 'Surfaces confirmed team commitments and unassigned follow-ups—never raw surveillance audio.'}</div>
          </div>
        </div>
        <button type="button" class="mac-btn mac-btn-subtle mac-btn-xs" id="btn-compare-emp-today">
          <span>${state.lang === 'zh' ? '对比员工端视图' : 'Compare Employee view'}</span>
          ${ICONS.ext}
        </button>
      </div>

      <section class="memory-workspace">
        <div class="memory-feed">
          <div class="mf-head">
            <div class="mf-tabs">
              <button type="button" class="mf-tab ${state.decFilter === 'all' ? 'is-active' : ''}" data-dec-filter="all">${state.lang === 'zh' ? '全部公开项' : 'All'} (${visibleList.length})</button>
              <button type="button" class="mf-tab ${state.decFilter === 'synced' ? 'is-active' : ''}" data-dec-filter="synced">${state.lang === 'zh' ? '已同步' : 'Synced'}</button>
              <button type="button" class="mf-tab ${state.decFilter === 'monday' ? 'is-active' : ''}" data-dec-filter="monday">${state.lang === 'zh' ? '待认领' : 'Follow-up'} (${mondayCnt})</button>
            </div>
          </div>
          <div class="mf-list">
            ${list.map((d) => {
              const owner = memberById(d.ownerId);
              return `
                <button type="button" class="mf-card ${selected && selected.id === d.id ? 'is-selected' : ''}" data-select-dec="${d.id}">
                  <div class="mfc-top">
                    <span class="mfc-time"><span class="dot ${d.status === 'synced' ? 'dot-ready' : 'dot-paused'}"></span>${esc(pick(d.context))}</span>
                  </div>
                  <div class="mfc-title">${esc(pick(d.title))}</div>
                  <div class="mfc-foot">
                    <span class="mfc-via">${owner ? esc(owner.name) : (state.lang === 'zh' ? '暂未认领负责人' : 'Unassigned')}</span>
                    <span class="mfc-via">${esc(pick(d.due))}</span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="note-canvas">
          ${selected ? renderDecisionNote(selected, true) : ''}
        </div>
      </section>
    `;
  }

  /* =====================================================================
   * ADMIN VIEW 3: CONNECTORS, MULTI-BAR SYNC STAGE & PRIVACY GUARDRAILS
   * ===================================================================== */
  function renderAdminConnectionsView() {
    const fleet = state.members.slice(0, 4);

    return `
      <!-- Multi-Bar Desk Sync & Visitor Gate Live Stage -->
      <section class="card-box" style="margin-bottom:16px;">
        <div class="cb-head" style="margin-bottom:4px;">
          <div>
            <h2>${state.multiBarSync
              ? (state.lang === 'zh' ? '多机协同实况：3 台邻近 MacBook Air 正在同频拾取同一场讨论，自动合并为 1 条记录' : 'Live Sync: 3 nearby MacBook Airs capturing one huddle — deduplicated into 1 note')
              : state.visitorGateDemo
                ? (state.lang === 'zh' ? '门禁拦截实况：检测到未入圈外部访客发言，全部设备顶灯保持熄灭（0 留存）' : 'Gate Active: Unenrolled visitor speaking — all LEDs stay dark with 0 storage')
                : (state.lang === 'zh' ? '工位硬件场实况（4 台已配对 Rutta Bar）' : 'Studio Hardware Fleet (4 Paired Rutta Bars)')}</h2>
            <p>${state.lang === 'zh' ? '插在 MacBook Air 左侧 USB-C 口即插即用；多人围坐时自动去重，不会向 Linear 重复推送多份待办。' : 'Plug-and-play on MacBook Air USB-C; nearby Bars automatically deduplicate shared huddles.'}</p>
          </div>
        </div>

        <div class="fleet-mini-grid">
          ${fleet.map((m, idx) => {
            const isSync = state.multiBarSync && idx < 3;
            const isMuted = !isSync && m.barState === 'muted';
            const dot = isSync ? 'dot-input' : isMuted ? 'dot-mute' : state.visitorGateDemo ? 'dot-visitor' : 'dot-ready';
            const tag = isSync
              ? `<span class="pill-tag pill-amber">${state.lang === 'zh' ? '同频去重' : 'Synced'}</span>`
              : isMuted
                ? `<span class="pill-tag pill-orange">${state.lang === 'zh' ? '物理静音' : 'Muted'}</span>`
                : state.visitorGateDemo
                  ? `<span class="pill-tag pill-neutral">${state.lang === 'zh' ? '灯不亮' : 'Dark'}</span>`
                  : `<span class="pill-tag pill-green">${m.barState === 'lid_closed' ? (state.lang === 'zh' ? '合盖待机' : 'Lid closed') : (state.lang === 'zh' ? '在线' : 'Ready')}</span>`;

            return `
              <div class="fleet-mini-card ${isSync ? 'is-sync' : ''}">
                <img class="fmc-img" src="${mountedPhoto(m.finish)}" alt="${finishLabel(m.finish)}">
                <div class="fmc-name">
                  <span style="display:inline-flex;align-items:center;gap:5px;"><span class="dot ${dot}"></span>${esc(m.name.split(' ')[0])}</span>
                  ${tag}
                </div>
                <div class="fmc-sub">${finishLabel(m.finish)} · ${m.visibility === 'team' ? (state.lang === 'zh' ? '小会互通' : 'Team Bars') : (state.lang === 'zh' ? '仅限本机' : 'My Mac Only')}</div>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <div class="gov-grid">
        <section class="card-box">
          <div class="cb-head">
            <div>
              <h2>${state.lang === 'zh' ? '团队工作流连接器与开放 MCP' : 'Workspace Connectors & Open MCP'}</h2>
              <p>${state.lang === 'zh' ? '当事成员点击确认后，结构化结论自动推送至对应项目与桌面端 Agent。' : 'Confirmed commitments route into your existing tools and MCP Agents.'}</p>
            </div>
          </div>

          <div class="connector-grid">
            ${state.integrations.map((tool) => `
              <div class="conn-tile">
                <div class="ct-top">
                  <span class="ct-icon">${esc(tool.glyph)}</span>
                  <button type="button" class="mac-switch" role="switch" aria-checked="${tool.enabled}" data-toggle-tool="${tool.id}" aria-label="${esc(tool.name)}"></button>
                </div>
                <div>
                  <div class="ct-name">${esc(tool.name)}</div>
                  <div class="ct-target">${esc(tool.target)}</div>
                  <p style="font-size:11.5px;color:var(--ink-2);margin-top:4px;">${esc(pick(tool.desc))}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="card-box">
          <div class="cb-head">
            <div>
              <h2>${state.lang === 'zh' ? '团队隐私与防监控围栏' : 'Anti-Surveillance Privacy Guardrails'}</h2>
              <p>${state.lang === 'zh' ? '核心底线由硬件与协议层强制锁定，管理员亦不可关闭。' : 'Core boundaries are protocol-locked and cannot be disabled by admins.'}</p>
            </div>
          </div>

          <div>
            ${state.policies.map((p) => `
              <div class="guardrail-row">
                <div>
                  <div class="gr-title">
                    <span>${esc(pick(p.title))}</span>
                    ${p.locked ? `<span class="pill-tag pill-neutral">${ICONS.lock} ${state.lang === 'zh' ? '系统锁死' : 'Locked'}</span>` : ''}
                  </div>
                  <p class="gr-desc">${esc(pick(p.desc))}</p>
                </div>
                <button type="button" class="mac-switch" role="switch" aria-checked="${p.enabled}" ${p.locked ? 'disabled' : ''} data-toggle-policy="${p.id}"></button>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }

  /* =====================================================================
   * RENDER DISPATCH & INTERACTION WIRING
   * ===================================================================== */
  function renderCurrentView() {
    const root = $('#view-container');
    if (state.roleMode === 'employee') {
      if (state.activeTab === 'today') {
        root.innerHTML = renderEmployeeTodayView();
        bindMemoryEvents(root);
      } else if (state.activeTab === 'my-bar') {
        root.innerHTML = renderEmployeeBarView();
        bindEmployeeBarEvents(root);
      } else {
        root.innerHTML = renderEmployeeAgentView();
        bindAgentEvents(root);
      }
    } else {
      if (state.activeTab === 'circle') {
        root.innerHTML = renderAdminCircleView();
        bindAdminCircleEvents(root);
      } else if (state.activeTab === 'team-flow') {
        root.innerHTML = renderAdminFlowView();
        bindMemoryEvents(root);
      } else {
        root.innerHTML = renderAdminConnectionsView();
        bindConnectionsEvents(root);
      }
    }
  }

  function renderAll() {
    syncChrome();
    renderCurrentView();
  }

  function bindMemoryEvents(root) {
    const emp = currentEmployee();

    $$('[data-vis]', root).forEach((b) => {
      b.addEventListener('click', () => {
        setEmployeeVisibility(emp, b.dataset.vis, true);
        if (b.dataset.vis === 'self') showPrivacyBanner('peer');
      });
    });

    $$('[data-dec-filter]', root).forEach((b) => {
      b.addEventListener('click', () => {
        stopQuotePlayback();
        state.decFilter = b.dataset.decFilter;
        renderCurrentView();
      });
    });

    $$('[data-select-dec]', root).forEach((b) => {
      b.addEventListener('click', () => {
        stopQuotePlayback();
        state.selectedDecisionId = b.dataset.selectDec;
        renderCurrentView();
      });
    });

    $$('[data-confirm-part]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const [did, mid] = b.dataset.confirmPart.split(':');
        toggleConfirm(did, mid, false);
      });
    });

    $$('[data-play-quote]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.dataset.playQuote;
        if (playingQuoteId === id) { stopQuotePlayback(); renderCurrentView(); }
        else startQuotePlayback(id);
      });
    });

    $$('[data-assign-owner]', root).forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const mid = e.target.value;
        if (!mid) return;
        const dec = state.decisions.find((d) => d.id === sel.dataset.assignOwner);
        const m = memberById(mid);
        if (!dec || !m) return;
        dec.ownerId = mid;
        dec.status = 'synced';
        showToast(state.lang === 'zh' ? `已指派给 ${m.name} 并推送至 Linear` : `Assigned to ${m.name} & pushed to Linear`);
        renderAll();
      });
    });

    $$('[data-inline-agent]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const [did, preset] = b.dataset.inlineAgent.split(':');
        state.inlineAgentDecId = did;
        computeAgentPreset(preset);
        renderCurrentView();
      });
    });

    $('#inline-agent-send', root)?.addEventListener('click', () => {
      state.agentApproved = true;
      renderCurrentView();
      showToast(state.lang === 'zh' ? '已发送草稿并归档记录' : 'Sent & archived');
    });

    $$('[data-delete-dec]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const idx = state.decisions.findIndex((d) => d.id === b.dataset.deleteDec);
        if (idx === -1) return;
        lastDeletedDecision = { item: state.decisions.splice(idx, 1)[0], idx };
        state.selectedDecisionId = state.decisions[0]?.id || null;
        renderAll();
        showToast(state.lang === 'zh' ? '已销毁该段记录与原声' : 'Note & source clip destroyed', t('undo'), () => {
          if (lastDeletedDecision) {
            state.decisions.splice(lastDeletedDecision.idx, 0, lastDeletedDecision.item);
            state.selectedDecisionId = lastDeletedDecision.item.id;
            lastDeletedDecision = null;
            renderAll();
          }
        });
      });
    });

    $('#btn-demo-switch-listener', root)?.addEventListener('click', () => {
      state.currentEmployeeId = 'maya';
      switchRole('employee', 'today');
    });

    $('#btn-compare-emp-today', root)?.addEventListener('click', () => {
      state.currentEmployeeId = 'leo';
      switchRole('employee', 'today');
    });
  }

  function bindEmployeeBarEvents(root) {
    const emp = currentEmployee();
    $$('[data-stage-view]', root).forEach((b) => {
      b.addEventListener('click', () => {
        state.hwStageView = b.dataset.stageView;
        renderCurrentView();
      });
    });
    $('#btn-stage-mute', root)?.addEventListener('click', () => {
      emp.barState = emp.barState === 'muted' ? 'online' : 'muted';
      playSwitchClick(emp.barState === 'muted');
      renderAll();
    });
    $('#emp-lid-switch', root)?.addEventListener('click', () => {
      emp.lidStandby = !emp.lidStandby;
      renderCurrentView();
    });
    $$('[data-pick-vis]', root).forEach((b) => {
      b.addEventListener('click', () => {
        setEmployeeVisibility(emp, b.dataset.pickVis, true);
        if (b.dataset.pickVis === 'self') showPrivacyBanner('peer');
      });
    });
    $('#emp-reenroll-btn', root)?.addEventListener('click', () => openEnrollModal(emp.id));
    $('#emp-test-peer-banner', root)?.addEventListener('click', () => {
      if (emp.visibility === 'team') showDecisionBanner('dec-launch');
      else showPrivacyBanner('peer');
    });
  }

  function bindAgentEvents(root) {
    $('#agent-form', root)?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = $('#agent-input', root).value.trim();
      if (!val) return;
      state.agentPreset = null;
      state.agentApproved = false;
      const dec = state.decisions[0];
      state.agentResult = {
        channel: state.lang === 'zh' ? 'MCP 草稿' : 'MCP Draft',
        citation: state.lang === 'zh' ? `引用决定：${pick(dec.title)}` : `Cited: ${pick(dec.title)}`,
        body: state.lang === 'zh'
          ? `已根据指令「${val}」结合已确认口头决定生成：\n\n• 事项：${pick(dec.title)}\n• 负责人：${memberById(dec.ownerId)?.name || '待认领'} · 截止：${pick(dec.due)}`
          : `Draft for "${val}":\n\n• Decision: ${pick(dec.title)}\n• Owner: ${memberById(dec.ownerId)?.name || 'Unassigned'} · Due: ${pick(dec.due)}`
      };
      renderCurrentView();
    });
    $$('[data-agent-preset]', root).forEach((b) => {
      b.addEventListener('click', () => {
        computeAgentPreset(b.dataset.agentPreset);
        renderCurrentView();
      });
    });
    $('#agent-approve-btn', root)?.addEventListener('click', () => {
      state.agentApproved = true;
      renderCurrentView();
      showToast(state.lang === 'zh' ? '已发出并归档' : 'Sent & logged');
    });
  }

  function bindAdminCircleEvents(root) {
    const input = $('#vp-search-input', root);
    if (input) {
      input.addEventListener('input', (e) => {
        state.vpSearch = e.target.value;
        const pos = e.target.selectionStart;
        renderCurrentView();
        const next = $('#vp-search-input');
        if (next) { next.focus(); next.setSelectionRange(pos, pos); }
      });
    }
    $$('[data-vp-filter]', root).forEach((b) => {
      b.addEventListener('click', () => { state.vpFilter = b.dataset.vpFilter; renderCurrentView(); });
    });
    $$('[data-select-seat]', root).forEach((row) => {
      row.addEventListener('click', () => { state.selectedSeatId = row.dataset.selectSeat; renderCurrentView(); });
    });
    $$('[data-toggle-member]', root).forEach((sw) => {
      sw.addEventListener('click', () => {
        const m = memberById(sw.dataset.toggleMember);
        if (!m) return;
        m.active = !m.active;
        showToast(state.lang === 'zh' ? `${m.name} 声纹已${m.active ? '启用' : '暂停'}` : `${m.name} ${m.active ? 'enabled' : 'paused'}`);
        renderAll();
      });
    });
    $$('[data-jump-emp]', root).forEach((b) => {
      b.addEventListener('click', () => {
        state.currentEmployeeId = b.dataset.jumpEmp;
        switchRole('employee', 'my-bar');
      });
    });
    $$('[data-reenroll-seat]', root).forEach((b) => {
      b.addEventListener('click', () => openEnrollModal(b.dataset.reenrollSeat));
    });
    $$('[data-delete-member]', root).forEach((b) => {
      b.addEventListener('click', () => openDeleteModal(b.dataset.deleteMember));
    });
  }

  function bindConnectionsEvents(root) {
    $$('[data-toggle-tool]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const tool = state.integrations.find((x) => x.id === b.dataset.toggleTool);
        if (tool) { tool.enabled = !tool.enabled; renderCurrentView(); }
      });
    });
    $$('[data-toggle-policy]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const p = state.policies.find((x) => x.id === b.dataset.togglePolicy);
        if (p && !p.locked) { p.enabled = !p.enabled; renderCurrentView(); }
      });
    });
  }

  /* ---------- Core Helpers ---------- */
  function toggleConfirm(decId, memberId, fromBanner) {
    const dec = state.decisions.find((d) => d.id === decId);
    if (!dec) return;
    const part = dec.participants.find((p) => p.memberId === memberId);
    if (!part) return;
    part.confirmed = !part.confirmed;
    if (dec.participants.every((p) => p.confirmed)) {
      dec.status = 'synced';
      showToast(state.lang === 'zh' ? '双方已确认，已自动推送至 Linear / Notion / Slack' : 'Confirmed & pushed to Linear, Notion, and Slack');
    }
    renderAll();
    if (fromBanner) showDecisionBanner(decId);
  }

  function stopQuotePlayback() {
    if (quotePlayTimer) clearInterval(quotePlayTimer);
    quotePlayTimer = null;
    playingQuoteId = null;
    quotePlayPct = 0;
  }

  function startQuotePlayback(decId) {
    stopQuotePlayback();
    playingQuoteId = decId;
    quotePlayPct = 0;
    renderCurrentView();
    quotePlayTimer = setInterval(() => {
      quotePlayPct += 0.045;
      if (quotePlayPct >= 1) { stopQuotePlayback(); renderCurrentView(); return; }
      const wave = $(`#qd-wave-${decId}`);
      const timeEl = $(`#qd-time-${decId}`);
      const dec = state.decisions.find((d) => d.id === decId);
      if (wave) {
        const bars = $$('span', wave);
        bars.forEach((b, i) => b.classList.toggle('is-played', (i / bars.length) <= quotePlayPct));
      }
      if (timeEl && dec) timeEl.textContent = formatClipTime(dec.quoteDuration, quotePlayPct);
    }, 140);
  }

  function computeAgentPreset(presetId) {
    const map = {
      'client-email': {
        zh: {
          channel: '邮件草稿 · Apple Mail / Gmail',
          citation: '引用已确认讨论：上线日期顺延至 12 月 10 日（Maya & Leo · 14:19）',
          body: 'Hi 各位，\n\n刚与工程侧对齐，为留出完整一周完成最终回归与固件压测，我们将目标上线日由 12 月 3 日顺延至 12 月 10 日。Leo 已同步更新 Linear 里程碑（RUT-48）与发布排期。\n\n如有外部节奏需要协同调整，随时告诉我。\n— Maya'
        },
        en: {
          channel: 'Email Draft · Apple Mail / Gmail',
          citation: 'Cited: Move target launch to Dec 10 (Maya & Leo · 14:19)',
          body: 'Hi team,\n\nAfter syncing with engineering, we are moving our target launch from Dec 3 to Dec 10 to give final regression testing a clean week. Leo has updated Linear milestone RUT-48 and the release calendar.\n\nLet me know if any external schedules need adjusting.\n— Maya'
        }
      },
      'linear-task': {
        zh: {
          channel: '任务单草稿 · Linear',
          citation: '引用已归档决定：周五首轮测试采用银色样机（Maya & Leo）',
          body: '[RUT-54] 交付周五银色样机用户测试固件\n负责人：Leo Park · 截止：周四 12:00\n上下文：硬件评审选定银色阳极氧化铝机身，周四中午前同步测试包。'
        },
        en: {
          channel: 'Issue Draft · Linear',
          citation: 'Cited: Use Silver prototype for Friday test (Maya & Leo)',
          body: '[RUT-54] Ship Silver prototype firmware build\nOwner: Leo Park · Due: Thu 12:00\nContext: Hardware review selected the Silver shell for Friday’s user test.'
        }
      },
      'why-silver': {
        zh: {
          channel: '记忆回溯 · MCP',
          citation: '命中周二硬件评审记录（10:42）',
          body: '对比四款阳极氧化铝配色后，银色款与 MacBook Air 侧边铝金属机身视觉一体感最强，且 Leo 可在周四中午前优先交付银色测试包（已归档至 Linear RUT-42）。'
        },
        en: {
          channel: 'Context Lookup · MCP',
          citation: 'Matched Tuesday Hardware Review (10:42)',
          body: 'Silver blended most seamlessly into the MacBook Air aluminum edge and Leo could deliver the Silver firmware build by Thursday noon (logged in Linear RUT-42).'
        }
      }
    };
    const chosen = map[presetId]?.[state.lang];
    if (!chosen) return;
    state.agentPreset = presetId;
    state.agentApproved = false;
    state.agentResult = chosen;
  }

  /* ---------- Enrollment & Delete Sheet Modals ---------- */
  function openEnrollModal(memberId = null) {
    reenrollMemberId = memberId;
    sampledVoiceReady = false;
    stopVoiceSampling();
    const m = memberId ? memberById(memberId) : null;

    $('#enroll-modal-title').textContent = m ? `${t('enrollTitleReenroll')} · ${m.name}` : t('enrollTitle');
    $('#enroll-name').value = m ? m.name : '';
    $('#enroll-role').value = m ? pick(m.role) : '';
    $('#enroll-email').value = m ? m.email : '';
    $('#enroll-name').disabled = Boolean(m);

    const fin = m ? m.finish : 'silver';
    $$('#enroll-finish-selector .finish-pill').forEach((c) => c.classList.toggle('is-selected', c.dataset.finish === fin));

    updateEnrollQuote(m ? m.name : '');
    const box = $('#voice-capture-box');
    box.dataset.state = 'idle';
    $('#vc-status-text').textContent = t('vcIdle');
    $('#btn-sample-label').textContent = t('vcStartBtn');
    $('#enroll-save').disabled = true;
    $('#vc-wave').innerHTML = Array.from({ length: 28 }, () => '<span></span>').join('');
    $('#enroll-modal').hidden = false;
    if (!m) $('#enroll-name').focus();
  }

  function updateEnrollQuote(name) {
    const who = name.trim() || (state.lang === 'zh' ? '新加入的同事' : 'a teammate');
    $('#vc-quote').textContent = state.lang === 'zh'
      ? `“我是${who}，同意在工作讨论时识别我的声音，随时可以退出。”`
      : `"Hi, I’m ${who}. Recognize my voice during work discussions—I can opt out anytime."`;
  }

  function stopVoiceSampling() {
    if (sampleTimer) clearInterval(sampleTimer);
    sampleTimer = null;
    if (micStream) { micStream.getTracks().forEach((tr) => tr.stop()); micStream = null; }
  }

  function startVoiceSampling(useRealMic = false) {
    stopVoiceSampling();
    const box = $('#voice-capture-box');
    box.dataset.state = 'sampling';
    $('#vc-status-text').textContent = t('vcSampling');
    const bars = $$('#vc-wave span');
    let ticks = 0;

    const run = (analyser = null) => {
      const arr = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
      sampleTimer = setInterval(() => {
        ticks += 1;
        if (analyser && arr) analyser.getByteFrequencyData(arr);
        bars.forEach((bar, i) => {
          const v = arr ? Math.max(5, Math.min(30, (arr[i % arr.length] / 255) * 34)) : 5 + Math.round(Math.random() * 24);
          bar.style.height = `${v}px`;
        });
        if (ticks >= 22) {
          stopVoiceSampling();
          sampledVoiceReady = true;
          box.dataset.state = 'done';
          $('#vc-status-text').textContent = t('vcDone');
          $('#btn-sample-label').textContent = t('vcResampleBtn');
          $('#enroll-save').disabled = false;
          bars.forEach((bar, i) => { bar.style.height = `${9 + ((i * 17 + 5) % 18)}px`; });
        }
      }, 100);
    };

    if (useRealMic && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          micStream = stream;
          const AC = window.AudioContext || window.webkitAudioContext;
          const ctx = new AC();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          ctx.createMediaStreamSource(stream).connect(analyser);
          run(analyser);
        })
        .catch(() => {
          showToast(state.lang === 'zh' ? '未获取麦克风权限，已切换模拟采样' : 'Using simulated voice sample');
          run(null);
        });
    } else {
      run(null);
    }
  }

  function saveEnrolledMember() {
    if (!sampledVoiceReady) return;
    const name = $('#enroll-name').value.trim() || (state.lang === 'zh' ? '新成员' : 'New Teammate');
    const role = $('#enroll-role').value.trim() || (state.lang === 'zh' ? '产品研发' : 'Product');
    const email = $('#enroll-email').value.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'member'}@northstar.co`;
    const finish = $('#enroll-finish-selector .finish-pill.is-selected')?.dataset.finish || 'silver';
    const bars = Array.from({ length: 12 }, () => 36 + Math.round(Math.random() * 58));

    if (reenrollMemberId) {
      const m = memberById(reenrollMemberId);
      if (m) {
        m.role = { zh: role, en: role };
        m.email = email;
        m.finish = finish;
        m.bars = bars;
        m.active = true;
        m.lastHeard = { zh: '刚刚校准', en: 'Just calibrated' };
        showToast(state.lang === 'zh' ? `已更新 ${m.name} 的声纹` : `Updated ${m.name}’s voiceprint`);
      }
    } else {
      const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'NS';
      const newId = 'm-' + Date.now();
      state.members.unshift({
        id: newId,
        name,
        email,
        role: { zh: role, en: role },
        avatar: null,
        initials,
        finish,
        barState: 'online',
        visibility: 'team',
        requireConfirm: true,
        lidStandby: true,
        active: true,
        lastHeard: { zh: '刚刚加入', en: 'Just enrolled' },
        bars
      });
      state.selectedSeatId = newId;
      showToast(state.lang === 'zh' ? `${name} 已加入团队声纹圈` : `Added ${name} to voiceprint circle`);
    }
    $('#enroll-modal').hidden = true;
    renderAll();
  }

  function openDeleteModal(memberId) {
    const m = memberById(memberId);
    if (!m) return;
    pendingDeleteMemberId = memberId;
    $('#delete-desc').textContent = state.lang === 'zh' ? `确认将 ${m.name} 移出声纹圈并销毁声纹吗？` : `Destroy ${m.name}’s voiceprint?`;
    $('#delete-modal').hidden = false;
  }

  function confirmDeleteMember() {
    if (!pendingDeleteMemberId) return;
    const idx = state.members.findIndex((m) => m.id === pendingDeleteMemberId);
    if (idx !== -1) {
      const removed = state.members.splice(idx, 1)[0];
      if (state.selectedSeatId === removed.id) state.selectedSeatId = state.members[0]?.id || null;
      showToast(state.lang === 'zh' ? `已销毁 ${removed.name} 的声纹` : `Destroyed ${removed.name}’s voiceprint`);
    }
    pendingDeleteMemberId = null;
    $('#delete-modal').hidden = true;
    renderAll();
  }

  /* ---------- Shot Director ---------- */
  function runDirectorShot(shot) {
    $('#director-drawer').hidden = true;
    $('#floating-card').hidden = true;
    $('#menubar-popover').hidden = true;

    if (shot === 'scenePeerBlock') {
      const leo = memberById('leo');
      if (leo) { leo.active = true; leo.visibility = 'self'; }
      state.currentEmployeeId = 'leo';
      switchRole('employee', 'today');
      showPrivacyBanner('peer');
    } else if (shot === 'sceneAdminCircle') {
      state.selectedSeatId = 'maya';
      switchRole('admin', 'circle');
    } else if (shot === 'sceneAdminLock') {
      state.selectedDecisionId = 'dec-silver';
      switchRole('admin', 'team-flow');
    } else if (shot === 'sceneA') {
      const dec = state.decisions.find((d) => d.id === 'dec-launch');
      if (dec) {
        dec.status = 'pending';
        dec.participants[0].confirmed = true;
        dec.participants[1].confirmed = false;
        state.selectedDecisionId = dec.id;
      }
      state.currentEmployeeId = 'leo';
      switchRole('employee', 'today');
      showDecisionBanner('dec-launch');
    } else if (shot === 'sceneC') {
      state.currentEmployeeId = 'maya';
      state.selectedDecisionId = 'dec-silver';
      switchRole('employee', 'today');
      startQuotePlayback('dec-silver');
    } else if (shot === 'sceneS1') {
      const maya = memberById('maya');
      if (maya) maya.barState = 'muted';
      state.currentEmployeeId = 'maya';
      state.hwStageView = 'macro';
      playSwitchClick(true);
      switchRole('employee', 'my-bar');
    } else if (shot === 'sceneD') {
      state.multiBarSync = false;
      state.visitorGateDemo = true;
      state.blockedToday += 1;
      switchRole('admin', 'connections');
      showPrivacyBanner('visitor');
    } else if (shot === 'sceneE') {
      state.currentEmployeeId = 'maya';
      state.selectedDecisionId = 'dec-launch';
      state.inlineAgentDecId = 'dec-launch';
      computeAgentPreset('client-email');
      switchRole('employee', 'today');
    } else if (shot === 'sceneL4') {
      state.multiBarSync = true;
      state.visitorGateDemo = false;
      switchRole('admin', 'connections');
    }
  }

  /* ---------- Global Event Listeners ---------- */
  function initGlobalEvents() {
    $$('.mac-seg-btn').forEach((b) => {
      b.addEventListener('click', () => switchRole(b.dataset.role));
    });

    $$('.lang-btn').forEach((b) => {
      b.addEventListener('click', () => {
        state.lang = b.dataset.lang;
        if (state.agentResult) computeAgentPreset(state.agentPreset || 'client-email');
        renderAll();
      });
    });

    $('#tl-zoom').addEventListener('click', () => {
      state.windowZoomed = !state.windowZoomed;
      syncChrome();
    });

    $('#rail-device-status').addEventListener('click', () => {
      state.activeTab = state.roleMode === 'employee' ? 'my-bar' : 'connections';
      renderAll();
    });

    // Menu Bar Companion Popover
    const mbBtn = $('#menubar-rutta-btn');
    const mbPop = $('#menubar-popover');
    mbBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = mbPop.hidden;
      mbPop.hidden = !open;
      mbBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!mbPop.hidden && !mbPop.contains(e.target) && !mbBtn.contains(e.target)) {
        mbPop.hidden = true;
        mbBtn.setAttribute('aria-expanded', 'false');
      }
    });
    $$('#mbp-vis-grid .osmp-vis-btn').forEach((b) => {
      b.addEventListener('click', () => {
        setEmployeeVisibility(currentEmployee(), b.dataset.setVis, true);
        if (b.dataset.setVis === 'self') showPrivacyBanner('peer');
      });
    });
    $('#mbp-toggle-mute').addEventListener('click', () => {
      const emp = currentEmployee();
      emp.barState = emp.barState === 'muted' ? 'online' : 'muted';
      playSwitchClick(emp.barState === 'muted');
      renderAll();
    });
    $('#mbp-latest-card').addEventListener('click', () => {
      mbPop.hidden = true;
      showDecisionBanner('dec-launch');
    });

    // Enroll & Delete Sheet Modals
    $('#enroll-close').addEventListener('click', () => { stopVoiceSampling(); $('#enroll-modal').hidden = true; });
    $('#enroll-cancel').addEventListener('click', () => { stopVoiceSampling(); $('#enroll-modal').hidden = true; });
    $('#enroll-modal').addEventListener('click', (e) => { if (e.target === $('#enroll-modal')) { stopVoiceSampling(); $('#enroll-modal').hidden = true; } });
    $('#enroll-name').addEventListener('input', (e) => updateEnrollQuote(e.target.value));
    $$('#enroll-finish-selector .finish-pill').forEach((c) => {
      c.addEventListener('click', () => {
        $$('#enroll-finish-selector .finish-pill').forEach((x) => x.classList.remove('is-selected'));
        c.classList.add('is-selected');
      });
    });
    $('#btn-start-sample').addEventListener('click', () => startVoiceSampling(false));
    $('#btn-mic-sample').addEventListener('click', () => startVoiceSampling(true));
    $('#enroll-save').addEventListener('click', saveEnrolledMember);

    $('#delete-close').addEventListener('click', () => { $('#delete-modal').hidden = true; });
    $('#delete-cancel').addEventListener('click', () => { $('#delete-modal').hidden = true; });
    $('#delete-confirm').addEventListener('click', confirmDeleteMember);

    // Director
    $('#director-trigger').addEventListener('click', () => { $('#director-drawer').hidden = !$('#director-drawer').hidden; });
    $('#director-close').addEventListener('click', () => { $('#director-drawer').hidden = true; });
    $$('.dp-item').forEach((b) => b.addEventListener('click', () => runDirectorShot(b.dataset.shot)));
    $('#toggle-menubar').addEventListener('change', (e) => { state.showMenubar = e.target.checked; syncChrome(); });
    $('#toggle-zoom').addEventListener('change', (e) => { state.windowZoomed = e.target.checked; syncChrome(); });
    $('#toggle-sound').addEventListener('change', (e) => { state.soundEnabled = e.target.checked; });
    $('#dd-clean-mode').addEventListener('click', () => {
      state.cleanShot = true;
      $('#director-drawer').hidden = true;
      syncChrome();
      showToast(state.lang === 'zh' ? '纯净录屏已开启（按 H 恢复）' : 'Clean screen ON (press H to restore)');
    });
    $('#dd-reset').addEventListener('click', () => {
      const keepLang = state.lang;
      stopQuotePlayback();
      state = window.createInitialRuttaState();
      state.lang = keepLang;
      $('#floating-card').hidden = true;
      $('#director-drawer').hidden = true;
      renderAll();
      showToast(state.lang === 'zh' ? '已重置演示数据' : 'Demo reset');
    });

    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'Escape') {
        $('#enroll-modal').hidden = true;
        $('#delete-modal').hidden = true;
        $('#director-drawer').hidden = true;
        $('#floating-card').hidden = true;
        $('#menubar-popover').hidden = true;
        stopVoiceSampling();
      } else if (e.key.toLowerCase() === 'h') {
        state.cleanShot = !state.cleanShot;
        syncChrome();
      } else if (e.key.toLowerCase() === 'd') {
        $('#director-drawer').hidden = !$('#director-drawer').hidden;
      }
    });
  }

  initGlobalEvents();
  renderAll();

  window.addEventListener('load', () => {
    [
      'assets/openside-silver.webp',
      'assets/openside-midnight.webp',
      'assets/openside-sky.webp',
      'assets/openside-starlight.webp',
      'assets/macro-ready.webp',
      'assets/macro-mute.webp',
      'assets/closedside-1200.webp'
    ].forEach((src) => { const im = new Image(); im.src = src; });
  });
})();
