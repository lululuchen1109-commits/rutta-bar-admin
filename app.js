/* Rutta macOS Desktop App · Dual-Role Controller (Employee Personal App + Workspace Admin) */
(() => {
  'use strict';

  let state = window.createInitialRuttaState();
  // Support optional ?role=admin or ?role=employee deep link
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'admin') {
      state.roleMode = 'admin';
      state.activeTab = 'voiceprints';
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
    shield: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round"><path d="M8 2.2L3 4.2v3.6c0 3.1 2.1 5.1 5 6 2.9-.9 5-2.9 5-6V4.2L8 2.2z"/></svg>',
    play: '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M3 2.2l7 3.8-7 3.8V2.2z"/></svg>',
    pause: '<svg viewBox="0 0 12 12" fill="currentColor"><rect x="2.5" y="2.2" width="2.4" height="7.6" rx="0.6"/><rect x="7.1" y="2.2" width="2.4" height="7.6" rx="0.6"/></svg>',
    lock: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6.3" width="8" height="5.5" rx="1.4"/><path d="M4.8 6.3V4.6a2.2 2.2 0 014.4 0v1.7"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
    wave: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"><path d="M4 10v0M7 7v6M10 4.5v11M13 7v6M16 10v0"/></svg>',
    check: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="13" height="13" rx="2.5"/><path d="M7 10.2l2 2 4-4.2"/></svg>',
    bar: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6.8" width="15" height="6.4" rx="2.4"/><circle cx="6.2" cy="10" r="0.95" fill="currentColor" stroke="none"/><path d="M10.8 10h3.2"/></svg>',
    nodes: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2"/><circle cx="14" cy="6" r="2"/><circle cx="10" cy="14" r="2"/><path d="M7.6 7.4L9.2 12.2M12.4 7.4l-1.6 4.8M8 6h4"/></svg>',
    arrowRight: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h12M11.5 5.5L16 10l-4.5 4.5"/></svg>',
    clock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3.2l2.1 1.3"/></svg>'
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
      gain.gain.setValueAtTime(0.065, now);
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

  function canBeCapturedByPeer(member) {
    return Boolean(member && member.active && member.allowPeerCapture && member.tempPauseMinutes === 0);
  }

  function finishLabel(f) {
    return { silver: t('finishSilver'), sky: t('finishSky'), starlight: t('finishStarlight'), midnight: t('finishMidnight') }[f] || f;
  }

  function hwImageForState(mode) {
    if (mode === 'input') return 'assets/switch-photo-input.webp';
    if (mode === 'mute') return 'assets/switch-photo-mute.webp';
    return 'assets/switch-photo-ready.webp';
  }

  function finishHeroImage(finish) {
    return {
      silver: 'assets/hero-silver.webp',
      sky: 'assets/hero-sky.webp',
      starlight: 'assets/hero-starlight.webp',
      midnight: 'assets/hero-midnight.webp'
    }[finish] || 'assets/hero-silver.webp';
  }

  function renderMemberHardwareVisual(member, previewMode, switchId) {
    if (member.finish === 'silver') {
      return `
        <div class="hw-render-wrap">
          <img src="${hwImageForState(previewMode)}" alt="Silver Rutta Bar">
          <span class="hw-led-overlay mode-${previewMode}" aria-hidden="true"></span>
          <button type="button" class="hw-switch-area" id="${switchId}" aria-label="Physical mute switch"></button>
        </div>
      `;
    }
    const isMuted = previewMode === 'mute';
    return `
      <div class="hw-render-wrap is-finish-hero ${isMuted ? 'is-muted' : ''}">
        <img src="${finishHeroImage(member.finish)}" alt="${finishLabel(member.finish)} Rutta Bar">
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:6px;">
        <button type="button" class="btn btn-secondary btn-xs" id="${switchId}">
          ${isMuted ? (state.lang === 'zh' ? '恢复物理开关' : 'Unmute switch') : (state.lang === 'zh' ? '拨动物理静音' : 'Engage physical mute')}
        </button>
      </div>
    `;
  }

  function renderAvatar(member, size = 'md') {
    const cls = size === 'xs' ? 'avatar avatar-xs' : size === 'sm' ? 'avatar avatar-sm' : 'avatar';
    if (!member) return `<span class="${cls}">?</span>`;
    if (member.avatar) return `<img class="${cls}" src="${member.avatar}" alt="${esc(member.name)}">`;
    return `<span class="${cls}">${esc(member.initials)}</span>`;
  }

  function showToast(msg, actionLabel = null, onAction = null) {
    const stack = $('#toast-stack');
    if (!actionLabel) {
      $$('.toast:not(.has-action)', stack).forEach((old) => old.remove());
    }
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
    }, actionLabel ? 4200 : 2400);
  }

  function switchRole(role, targetTab = null) {
    stopQuotePlayback();
    closeMemberDrawer();
    state.roleMode = role;
    if (targetTab) {
      state.activeTab = targetTab;
    } else {
      state.activeTab = role === 'employee' ? 'my-voice' : 'voiceprints';
    }
    state.decFilter = 'all';
    renderAll();
  }

  function employeeDecisions(empId) {
    return state.decisions.filter((d) => d.participants.some((p) => p.memberId === empId));
  }

  function adminDecisions() {
    // Admins ONLY see confirmed/synced workspace records & Monday team follow-ups — NEVER private unconfirmed drafts
    return state.decisions.filter((d) => d.status !== 'pending');
  }

  /* ---------- Chrome, Role Switcher, Sidebar & Menu Bar Sync ---------- */
  function syncChrome() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    $('#macos-menubar').hidden = !state.showMenubar;
    $('#toggle-menubar').checked = state.showMenubar;
    document.body.classList.toggle('has-menubar', state.showMenubar);
    document.body.classList.toggle('clean-shot', state.cleanShot);

    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('.lang-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.lang === state.lang));
    $$('.role-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.role === state.roleMode));

    const emp = currentEmployee();

    // Render Role Identity sub-block in Sidebar
    const idBox = $('#role-identity');
    if (state.roleMode === 'employee') {
      const maya = memberById('maya');
      const leo = memberById('leo');
      idBox.innerHTML = `
        <div class="emp-switcher">
          <button type="button" class="emp-pill ${state.currentEmployeeId === 'maya' ? 'is-active' : ''}" data-pick-emp="maya">
            ${renderAvatar(maya, 'xs')}
            <span>Maya</span>
            <span class="emp-pill-tag">A</span>
          </button>
          <button type="button" class="emp-pill ${state.currentEmployeeId === 'leo' ? 'is-active' : ''}" data-pick-emp="leo">
            ${renderAvatar(leo, 'xs')}
            <span>Leo</span>
            <span class="emp-pill-tag">B</span>
          </button>
        </div>
      `;
      $$('[data-pick-emp]', idBox).forEach((b) => {
        b.addEventListener('click', () => {
          stopQuotePlayback();
          state.currentEmployeeId = b.dataset.pickEmp;
          renderAll();
        });
      });
    } else {
      idBox.innerHTML = `
        <div class="admin-scope-pill">
          ${ICONS.shield}
          <span>${state.lang === 'zh' ? '管理者视角 · 无权听原声' : 'Admin scope · Zero raw audio'}</span>
        </div>
      `;
    }

    // Render Role-Specific Navigation
    const navEl = $('#rail-nav');
    if (state.roleMode === 'employee') {
      const myPending = employeeDecisions(emp.id).filter((d) => d.status === 'pending').length;
      navEl.innerHTML = `
        <div class="rail-group-label">${t('groupMySpace')} · ${esc(emp.name.split(' ')[0])}</div>
        <button type="button" class="rail-item ${state.activeTab === 'my-voice' ? 'is-active' : ''}" data-tab="my-voice" role="tab">
          ${ICONS.wave}
          <span>${t('navMyVoice')}</span>
          <span class="rail-count">${canBeCapturedByPeer(emp) ? (state.lang === 'zh' ? '可被录' : 'Open') : (state.lang === 'zh' ? '仅本机' : 'Self')}</span>
        </button>
        <button type="button" class="rail-item ${state.activeTab === 'my-decisions' ? 'is-active' : ''}" data-tab="my-decisions" role="tab">
          ${ICONS.check}
          <span>${t('navMyDecisions')}</span>
          ${myPending > 0 ? `<span class="rail-count is-accent" id="nav-count-pending">${myPending}</span>` : ''}
        </button>
        <button type="button" class="rail-item ${state.activeTab === 'my-agent' ? 'is-active' : ''}" data-tab="my-agent" role="tab">
          ${ICONS.nodes}
          <span>${t('navMyAgent')}</span>
        </button>
      `;
    } else {
      const syncedCount = adminDecisions().length;
      navEl.innerHTML = `
        <div class="rail-group-label">${t('groupAdminCore')}</div>
        <button type="button" class="rail-item ${state.activeTab === 'voiceprints' ? 'is-active' : ''}" data-tab="voiceprints" role="tab">
          ${ICONS.wave}
          <span>${t('navVoiceprints')}</span>
          <span class="rail-count" id="nav-count-vp">${state.members.length}</span>
        </button>
        <button type="button" class="rail-item ${state.activeTab === 'decisions' ? 'is-active' : ''}" data-tab="decisions" role="tab">
          ${ICONS.check}
          <span>${t('navAdminDecisions')}</span>
          <span class="rail-count" id="nav-count-admin-dec">${syncedCount}</span>
        </button>

        <div class="rail-group-label">${t('groupAdminSystem')}</div>
        <button type="button" class="rail-item ${state.activeTab === 'devices' ? 'is-active' : ''}" data-tab="devices" role="tab">
          ${ICONS.bar}
          <span>${t('navDevices')}</span>
          <span class="rail-count">4</span>
        </button>
        <button type="button" class="rail-item ${state.activeTab === 'integrations' ? 'is-active' : ''}" data-tab="integrations" role="tab">
          ${ICONS.nodes}
          <span>${t('navIntegrations')}</span>
        </button>
      `;
    }

    $$('.rail-item', navEl).forEach((b) => {
      b.addEventListener('click', () => {
        stopQuotePlayback();
        closeMemberDrawer();
        state.activeTab = b.dataset.tab;
        renderAll();
      });
    });

    // Topbar Title & Contextual Action
    const headerMap = {
      'my-voice': [t('titleMyVoice'), t('subMyVoice')],
      'my-decisions': [t('titleMyDecisions'), t('subMyDecisions')],
      'my-agent': [t('titleMyAgent'), t('subMyAgent')],
      voiceprints: [t('titleVoiceprints'), t('subVoiceprints')],
      decisions: [t('titleAdminDecisions'), t('subAdminDecisions')],
      devices: [t('titleDevices'), t('subDevices')],
      integrations: [t('titleIntegrations'), t('subIntegrations')]
    };
    const [hTitle, hSub] = headerMap[state.activeTab] || ['', ''];
    $('#topbar-title').textContent = hTitle;
    $('#topbar-subtitle').textContent = hSub;

    const actionsEl = $('#topbar-actions');
    if (state.roleMode === 'employee' && state.activeTab === 'my-voice') {
      const paused = emp.tempPauseMinutes > 0;
      actionsEl.innerHTML = `
        <button type="button" class="btn ${paused ? 'btn-amber-soft' : 'btn-secondary'}" id="top-temp-pause">
          ${ICONS.clock}
          <span>${paused ? t('empQuickPauseActive') : t('empQuickPause')}</span>
        </button>
      `;
      $('#top-temp-pause', actionsEl).addEventListener('click', () => {
        emp.tempPauseMinutes = emp.tempPauseMinutes > 0 ? 0 : 30;
        showToast(emp.tempPauseMinutes > 0
          ? (state.lang === 'zh' ? `已开启 30 分钟免被同事收录（不影响本机）` : `Paused peer capture for 30m`)
          : (state.lang === 'zh' ? `已恢复跨设备收录设置` : `Resumed peer capture setting`));
        renderAll();
      });
    } else if (state.roleMode === 'admin' && state.activeTab === 'voiceprints') {
      actionsEl.innerHTML = `<button type="button" class="btn btn-primary" id="top-add-member">${ICONS.plus}<span>${t('btnAddMember')}</span></button>`;
      $('#top-add-member', actionsEl).addEventListener('click', () => openEnrollModal(null));
    } else if (state.roleMode === 'admin' && state.activeTab === 'devices') {
      actionsEl.innerHTML = `<button type="button" class="btn ${state.multiBarSync ? 'btn-primary' : 'btn-secondary'}" id="top-sync-btn">${state.multiBarSync ? t('syncBtnStop') : t('syncBtnStart')}</button>`;
      $('#top-sync-btn', actionsEl).addEventListener('click', () => {
        state.multiBarSync = !state.multiBarSync;
        state.hwState = state.multiBarSync ? 'input' : 'ready';
        renderAll();
      });
    } else {
      actionsEl.innerHTML = '';
    }

    // Sidebar Bottom Hardware Card & macOS Menu Bar Sync
    const localBarMode = state.roleMode === 'employee'
      ? (emp.barState === 'muted' ? 'mute' : state.hwState)
      : state.hwState;

    const stateLabels = {
      ready: state.lang === 'zh' ? '待机绿灯' : 'Ready',
      input: state.lang === 'zh' ? '识别拾音中' : 'Capturing',
      visitor: state.lang === 'zh' ? '已忽略未授权' : 'Ignored',
      mute: state.lang === 'zh' ? '物理静音' : 'Muted'
    };

    $('#sidebar-led-dot').className = `dot dot-${localBarMode}`;
    if (state.roleMode === 'employee') {
      $('#sidebar-hw-label').textContent = `${emp.name.split(' ')[0]} · ${finishLabel(emp.finish)} Bar`;
      $('#sidebar-hw-sub').textContent = emp.tempPauseMinutes > 0
        ? (state.lang === 'zh' ? '30 分钟免被同事收录中' : 'Peer capture paused 30m')
        : `${stateLabels[localBarMode]} · ${canBeCapturedByPeer(emp) ? (state.lang === 'zh' ? '允许他人收录' : 'Peers allowed') : (state.lang === 'zh' ? '仅本机收录' : 'Self only')}`;
    } else {
      const activeCount = state.members.filter((m) => m.active).length;
      $('#sidebar-hw-label').textContent = state.lang === 'zh' ? `${activeCount} 位声纹 · 4 台 Bar` : `${activeCount} active · 4 Bars`;
      $('#sidebar-hw-sub').textContent = stateLabels[localBarMode];
    }

    // Top macOS Menu Bar
    $('#mb-status-dot').className = `dot dot-${localBarMode}`;
    $('#mb-status-label').textContent = emp.tempPauseMinutes > 0
      ? (state.lang === 'zh' ? '免收录 30m' : 'Paused 30m')
      : stateLabels[localBarMode];
    $('#mbp-title').textContent = `Rutta Bar · ${finishLabel(emp.finish)}`;
    $('#mbp-sub').textContent = state.lang === 'zh'
      ? `${emp.name} 的 MacBook Air · USB-C`
      : `${emp.name}’s MacBook Air · USB-C`;
    $('#mbp-pill').textContent = stateLabels[localBarMode];
    $('#mbp-pill').className = `badge ${localBarMode === 'mute' ? 'badge-orange' : localBarMode === 'input' ? 'badge-amber' : localBarMode === 'visitor' ? 'badge-neutral' : 'badge-green'}`;
    $('#mbp-bar-img').src = emp.finish === 'silver' ? hwImageForState(localBarMode) : finishHeroImage(emp.finish);
    $('#mbp-bar-img').style.maxHeight = emp.finish === 'silver' ? '' : '54px';
    $('#mbp-bar-img').style.objectFit = 'contain';
    $('#mbp-toggle-peer').setAttribute('aria-checked', String(emp.allowPeerCapture));
  }

  function setHardwareState(mode) {
    const wasMute = state.hwState === 'mute';
    if (mode === 'mute' || (wasMute && mode !== 'mute')) playSwitchClick(mode === 'mute');
    state.hwState = mode;
    if (mode === 'visitor') state.blockedVisitorsToday += 1;
    syncChrome();
    if (state.activeTab === 'devices' || state.activeTab === 'my-voice') renderCurrentView();
    if (state.inspectedMemberId) renderMemberDrawer(state.inspectedMemberId);
  }

  /* ---------- Floating macOS Notification Card ---------- */
  function showDecisionNotice(decisionId) {
    const dec = state.decisions.find((d) => d.id === decisionId) || state.decisions[0];
    if (!dec) return;
    const owner = memberById(dec.ownerId);
    const capturer = memberById(dec.capturedById);
    const allDone = dec.participants.every((p) => p.confirmed);
    const names = dec.participants.map((p) => memberById(p.memberId)?.name.split(' ')[0] || '').join(' & ');

    const fc = $('#floating-card');
    fc.hidden = false;
    fc.innerHTML = `
      <div class="fn-head">
        <span class="fn-brand"><img src="assets/monogram.svg" alt="" width="10" height="13"><span>${t('fnDecision')}</span></span>
        <button type="button" class="icon-btn" id="fc-close-btn" aria-label="Close">${ICONS.close}</button>
      </div>
      <div class="fn-title">${esc(pick(dec.title))}</div>
      <div class="fn-desc">
        ${owner ? esc(owner.name) : t('unassigned')} · ${esc(pick(dec.due))}<br>
        ${capturer ? (state.lang === 'zh' ? `由 ${capturer.name.split(' ')[0]} 的 Rutta Bar 收录 · ` : `Via ${capturer.name.split(' ')[0]}’s Bar · `) : ''}
        ${allDone
          ? (state.lang === 'zh' ? '已同步至 Linear / Notion / Slack。' : 'Synced to Linear, Notion & Slack.')
          : (state.lang === 'zh' ? `仅 ${names} 可见，确认后同步。` : `Private to ${names} until confirmed.`)}
      </div>
      <div class="fn-foot">
        <div class="confirm-list">
          ${dec.participants.map((p) => {
            const m = memberById(p.memberId);
            const first = m ? m.name.split(' ')[0] : '?';
            return `
              <button type="button" class="confirm-chip ${p.confirmed ? 'is-confirmed' : ''}" data-fc-confirm="${dec.id}:${p.memberId}">
                ${renderAvatar(m, 'sm')}
                <span>${esc(first)} ${p.confirmed ? '✓' : t('confirmAction')}</span>
              </button>
            `;
          }).join('')}
        </div>
        <button type="button" class="btn btn-ghost btn-xs" id="fc-open">${t('fnOpen')}</button>
      </div>
    `;
    $('#fc-close-btn', fc).addEventListener('click', () => { fc.hidden = true; });
    $('#fc-open', fc).addEventListener('click', () => {
      fc.hidden = true;
      state.roleMode = 'employee';
      state.activeTab = 'my-decisions';
      state.selectedDecisionId = dec.id;
      renderAll();
    });
    $$('[data-fc-confirm]', fc).forEach((b) => {
      b.addEventListener('click', () => {
        const [did, mid] = b.dataset.fcConfirm.split(':');
        toggleConfirm(did, mid, true);
      });
    });
  }

  function showPrivacyNotice(isPeerBlock = false) {
    const fc = $('#floating-card');
    fc.hidden = false;
    fc.innerHTML = `
      <div class="fn-head">
        <span class="fn-brand"><img src="assets/monogram.svg" alt="" width="10" height="13"><span>${t('fnVisitor')}</span></span>
        <button type="button" class="icon-btn" id="fc-close-btn" aria-label="Close">${ICONS.close}</button>
      </div>
      <div class="fn-title">${isPeerBlock ? t('fnPeerTitle') : t('fnVisitorTitle')}</div>
      <div class="fn-desc">${isPeerBlock ? t('fnPeerDesc') : t('fnVisitorDesc')}</div>
    `;
    $('#fc-close-btn', fc).addEventListener('click', () => { fc.hidden = true; });
  }

  /* =====================================================================
   * EMPLOYEE VIEWS (Personal macOS App Experience)
   * ===================================================================== */
  function renderEmployeeVoiceView() {
    const emp = currentEmployee();
    const maya = memberById('maya');
    const leo = memberById('leo');
    const otherId = emp.id === 'leo' ? 'maya' : 'leo';
    const isMuted = emp.barState === 'muted';
    const previewMode = isMuted ? 'mute' : 'ready';
    const leoAllowedOnMaya = canBeCapturedByPeer(leo);

    return `
      ${emp.tempPauseMinutes > 0 ? `
        <div class="temp-pause-banner">
          <span>${state.lang === 'zh'
            ? `临时私密模式生效中（剩余 ${emp.tempPauseMinutes} 分钟）：在此期间同事的 Rutta Bar 将完全忽略你的声音，不亮灯也不留存。`
            : `Temporary privacy pause active (${emp.tempPauseMinutes}m left): teammates’ Bars will ignore your speech with zero storage.`}</span>
          <button type="button" class="btn btn-secondary btn-xs" id="btn-end-pause">${state.lang === 'zh' ? '立即恢复' : 'Resume now'}</button>
        </div>
      ` : ''}

      <section class="emp-top-grid">
        <div class="panel emp-bar-card">
          <div class="card-head-row">
            <div>
              <h2>${t('empBarCardTitle')} · ${finishLabel(emp.finish)}</h2>
              <p>${t('empBarCardSub')}</p>
            </div>
            <span class="badge ${isMuted ? 'badge-orange' : 'badge-green'}">${isMuted ? t('diagMute') : t('diagReady')}</span>
          </div>

          <div class="hw-studio-box">
            <div class="hw-studio-head">
              <span style="display:inline-flex;align-items:center;gap:6px;">
                <span class="dot ${isMuted ? 'dot-mute' : 'dot-ready'}"></span>
                <span>${esc(emp.name)} · MacBook Air</span>
              </span>
              <span style="color:var(--muted);">${emp.lidStandby ? (state.lang === 'zh' ? '合盖待机已开' : 'Lid standby ON') : (state.lang === 'zh' ? '仅开盖在线' : 'Lid open only')}</span>
            </div>
            ${renderMemberHardwareVisual(emp, previewMode, 'emp-hw-switch')}
          </div>

          <div class="drawer-kv-list">
            <div class="drawer-kv-row">
              <span>${state.lang === 'zh' ? '物理静音挡位' : 'Physical mute switch'}</span>
              <span>${isMuted ? (state.lang === 'zh' ? '已拨下 · 硬件断麦' : 'Engaged · Mic cut') : (state.lang === 'zh' ? '开启 · 正常待机' : 'Open · Ready')}</span>
            </div>
            <div class="drawer-kv-row">
              <span>${state.lang === 'zh' ? '当前跨设备状态' : 'Peer-capture status'}</span>
              <span>${canBeCapturedByPeer(emp) ? (state.lang === 'zh' ? '小会可被同事设备收录' : 'Teammates’ Bars allowed') : (state.lang === 'zh' ? '仅限我本机设备' : 'Own Bar only')}</span>
            </div>
          </div>
        </div>

        <div class="panel emp-consent-card">
          <div class="card-head-row">
            <div>
              <h2>${t('empConsentTitle')}</h2>
              <p>${t('empConsentSub')}</p>
            </div>
            <span class="badge badge-neutral">${ICONS.lock} ${state.lang === 'zh' ? '仅本人可改' : 'Self only'}</span>
          </div>

          <div class="consent-list">
            <div class="consent-item">
              <div>
                <div class="ci-title">${t('consentMasterTitle')}</div>
                <p class="ci-desc">${t('consentMasterDesc')}</p>
              </div>
              <button type="button" class="toggle" role="switch" aria-checked="${emp.active}" id="emp-toggle-master"></button>
            </div>

            <div class="consent-item is-featured">
              <div>
                <div class="ci-title">
                  <span>${t('consentPeerTitle')}</span>
                  <span class="badge ${canBeCapturedByPeer(emp) ? 'badge-green' : 'badge-neutral'}">${canBeCapturedByPeer(emp) ? t('peerAllowed') : t('peerSelfOnly')}</span>
                </div>
                <p class="ci-desc">${t('consentPeerDesc')}</p>
              </div>
              <button type="button" class="toggle" role="switch" aria-checked="${emp.allowPeerCapture}" ${emp.active ? '' : 'disabled'} id="emp-toggle-peer"></button>
            </div>

            <div class="consent-item">
              <div>
                <div class="ci-title">${t('consentConfirmTitle')}</div>
                <p class="ci-desc">${t('consentConfirmDesc')}</p>
              </div>
              <button type="button" class="toggle" role="switch" aria-checked="${emp.requireMyConfirm}" id="emp-toggle-confirm"></button>
            </div>

            <div class="consent-item">
              <div>
                <div class="ci-title">${t('consentLidTitle')}</div>
                <p class="ci-desc">${t('consentLidDesc')}</p>
              </div>
              <button type="button" class="toggle" role="switch" aria-checked="${emp.lidStandby}" id="emp-toggle-lid"></button>
            </div>
          </div>
        </div>
      </section>

      <!-- Live A & B Small-Meeting Peer Capture Check -->
      <section class="panel huddle-panel">
        <div class="card-head-row">
          <div>
            <h2>${t('huddleTitle')}</h2>
            <p>${t('huddleSub')}</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="btn btn-secondary btn-xs" id="btn-test-huddle-pop">
              ${state.lang === 'zh' ? '模拟开小会效果' : 'Simulate huddle'}
            </button>
            <button type="button" class="btn btn-ghost btn-xs" id="btn-switch-ab">
              ${t('huddleSwitchPerson')} (${otherId === 'maya' ? 'Maya A' : 'Leo B'}) →
            </button>
          </div>
        </div>

        <div class="huddle-flow">
          <div class="huddle-node">
            <div class="hn-head">
              <div class="user-cell">
                ${renderAvatar(maya, 'sm')}
                <div>
                  <div class="u-name" style="font-size:13px;">Maya Lin (A)</div>
                  <div class="u-meta" style="font-size:11.5px;">${state.lang === 'zh' ? '持有银色 Rutta Bar' : 'Silver Rutta Bar on desk'}</div>
                </div>
              </div>
              <span class="badge ${leoAllowedOnMaya ? 'badge-amber' : 'badge-green'}">
                <span class="dot ${leoAllowedOnMaya ? 'dot-input' : 'dot-ready'}"></span>
                ${leoAllowedOnMaya ? (state.lang === 'zh' ? '收录 A & B' : 'Captures A & B') : (state.lang === 'zh' ? '仅收录 A' : 'A only')}
              </span>
            </div>
            <div class="hn-result">
              ${leoAllowedOnMaya
                ? (state.lang === 'zh' ? 'Maya 的 Rutta Bar 识别到 Leo 已开启跨设备收录，黄灯常亮并合并整理双方发言。' : 'Maya’s Bar recognizes Leo’s opted-in voiceprint, lights amber, and drafts a shared note.')
                : (state.lang === 'zh' ? 'Maya 的 Rutta Bar 仅识别 Maya 本人发言；遇到 Leo 发言时立即跳过。' : 'Maya’s Bar captures Maya only and skips Leo’s voice completely.')}
            </div>
          </div>

          <div class="huddle-arrow" aria-hidden="true">
            ${ICONS.arrowRight}
            <span>${leoAllowedOnMaya ? (state.lang === 'zh' ? '已授权' : 'Allowed') : (state.lang === 'zh' ? '已拒收' : 'Blocked')}</span>
          </div>

          <div class="huddle-node ${leoAllowedOnMaya ? 'is-allowed' : 'is-blocked'}">
            <div class="hn-head">
              <div class="user-cell">
                ${renderAvatar(leo, 'sm')}
                <div>
                  <div class="u-name" style="font-size:13px;">Leo Park (B)</div>
                  <div class="u-meta" style="font-size:11.5px;">${leo.tempPauseMinutes > 0 ? (state.lang === 'zh' ? '临时免收录 30 分钟中' : 'Paused 30m') : (leo.allowPeerCapture ? (state.lang === 'zh' ? '允许被同事设备收录' : 'Peer capture ON') : (state.lang === 'zh' ? '已关闭“允许被同事设备收录”' : 'Peer capture OFF'))}</div>
                </div>
              </div>
              <span class="badge ${leoAllowedOnMaya ? 'badge-green' : 'badge-neutral'}">
                ${leoAllowedOnMaya ? (state.lang === 'zh' ? '同步推送给 B 确认' : 'Sent to B to confirm') : (state.lang === 'zh' ? '不亮灯 · 0 留存' : 'LED dark · 0 saved')}
              </span>
            </div>
            <div class="hn-result">
              ${leoAllowedOnMaya
                ? (state.lang === 'zh' ? '<strong>知情与确认权：</strong>生成的记录会立即推送到 Leo 的 Rutta App（标明「由 Maya 的设备收录」），Leo 可点确认或单方面销毁原话。' : '<strong>Full transparency:</strong> Leo immediately receives the draft labeled "Captured via Maya’s Bar" and can confirm or destroy it.')
                : (state.lang === 'zh' ? '<strong>零留存保护：</strong>即便 Leo 在团队白名单中，Maya 的设备遇到 Leo 声音时也会视同访客实时丢弃，不亮灯、不转写、不生成记录。' : '<strong>Zero storage:</strong> Even though Leo is in the team roster, Maya’s Bar drops his speech like a visitor—LED dark, zero transcript.')}
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Personal Voiceprint Management Strip -->
      <section class="panel vp-self-strip">
        <div class="vss-left">
          <div class="vp-cell">
            <div class="mini-wave">${emp.bars.map((h) => `<span style="height:${Math.round(h * 0.19)}px"></span>`).join('')}</div>
            <span class="badge ${emp.active ? 'badge-green' : 'badge-neutral'}">${emp.active ? t('statusActive') : t('statusPaused')}</span>
          </div>
          <span style="font-size:12.5px;color:var(--muted);">
            ${t('colLastHeard')}：${esc(pick(emp.lastHeard))} · ${state.lang === 'zh' ? '原声仅限本人在场回放，确认后 7 天自动销毁' : 'Clips accessible to participants only, auto-deleted after 7d'}
          </span>
        </div>
        <div class="vss-actions">
          <button type="button" class="btn btn-secondary btn-xs" id="emp-verify-vp">${t('drawerVerifyBtn')}</button>
          <button type="button" class="btn btn-secondary btn-xs" id="emp-reenroll-vp">${t('drawerReenroll')}</button>
        </div>
      </section>
    `;
  }

  function bindEmployeeVoiceEvents(root) {
    const emp = currentEmployee();
    $('#btn-end-pause', root)?.addEventListener('click', () => {
      emp.tempPauseMinutes = 0;
      renderAll();
    });
    $('#emp-hw-switch', root)?.addEventListener('click', () => {
      emp.barState = emp.barState === 'muted' ? 'online' : 'muted';
      playSwitchClick(emp.barState === 'muted');
      if (emp.id === 'maya') state.hwState = emp.barState === 'muted' ? 'mute' : 'ready';
      renderAll();
    });
    $('#emp-toggle-master', root)?.addEventListener('click', () => {
      emp.active = !emp.active;
      showToast(emp.active
        ? (state.lang === 'zh' ? '已启用你的团队声纹识别' : 'Voiceprint recognition enabled')
        : (state.lang === 'zh' ? '已暂停声纹：所有设备均不再识别你' : 'Voiceprint paused across all Bars'));
      renderAll();
    });
    $('#emp-toggle-peer', root)?.addEventListener('click', () => {
      if (!emp.active) return;
      emp.allowPeerCapture = !emp.allowPeerCapture;
      showToast(emp.allowPeerCapture
        ? (state.lang === 'zh' ? '已开启：开小会时允许同事设备收录并推送给你确认' : 'Peer capture enabled — drafts will be sent to you')
        : (state.lang === 'zh' ? '已关闭：同事设备遇到你的声音将不亮灯、不留存' : 'Peer capture disabled — teammates’ Bars will ignore you'));
      renderAll();
    });
    $('#emp-toggle-confirm', root)?.addEventListener('click', () => {
      emp.requireMyConfirm = !emp.requireMyConfirm;
      renderAll();
    });
    $('#emp-toggle-lid', root)?.addEventListener('click', () => {
      emp.lidStandby = !emp.lidStandby;
      renderAll();
    });
    $('#btn-switch-ab', root)?.addEventListener('click', () => {
      state.currentEmployeeId = emp.id === 'leo' ? 'maya' : 'leo';
      renderAll();
    });
    $('#btn-test-huddle-pop', root)?.addEventListener('click', () => {
      const leo = memberById('leo');
      if (canBeCapturedByPeer(leo)) {
        showDecisionNotice('dec-launch');
      } else {
        state.blockedVisitorsToday += 1;
        showPrivacyNotice(true);
      }
    });
    $('#emp-verify-vp', root)?.addEventListener('click', () => {
      emp.lastHeard = { zh: '刚刚验证通过', en: 'Verified just now' };
      showToast(state.lang === 'zh' ? `声纹识别正常 · 已匹配 ${emp.name}` : `Voiceprint matched ${emp.name}`);
      renderAll();
    });
    $('#emp-reenroll-vp', root)?.addEventListener('click', () => openEnrollModal(emp.id));
  }

  /* =====================================================================
   * SHARED DECISIONS VIEW (Strict Employee vs Admin Privacy Boundary)
   * ===================================================================== */
  function renderDecisionsView(isAdmin) {
    const emp = currentEmployee();
    const baseList = isAdmin ? adminDecisions() : employeeDecisions(emp.id);
    const pendingCount = baseList.filter((d) => d.status === 'pending').length;
    const mondayCount = baseList.filter((d) => d.status === 'monday').length;
    const list = baseList.filter((d) => state.decFilter === 'all' || d.status === state.decFilter);

    let selected = list.find((d) => d.id === state.selectedDecisionId) || list[0] || null;
    if (selected) state.selectedDecisionId = selected.id;

    const statusBadge = (st) => {
      if (st === 'synced') return `<span class="badge badge-green">${t('badgeSynced')}</span>`;
      if (st === 'monday') return `<span class="badge badge-neutral">${t('badgeMonday')}</span>`;
      return `<span class="badge badge-amber">${t('badgePending')}</span>`;
    };

    const hiddenDraftsCount = state.decisions.filter((d) => d.status === 'pending').length;

    return `
      ${isAdmin ? `
        <div class="scope-banner">
          <div class="scope-banner-left">
            ${ICONS.lock}
            <span>${state.lang === 'zh'
              ? `管理者权限隔离生效中：当前有 ${hiddenDraftsCount} 条未确认私密讨论已自动隐藏，所有原始音频回放均不可访问。`
              : `Admin privacy isolation active: ${hiddenDraftsCount} unconfirmed private drafts are hidden and all original voice clips are locked.`}</span>
          </div>
          <button type="button" class="btn btn-secondary btn-xs" id="btn-jump-emp-dec">
            ${state.lang === 'zh' ? '切到员工端对比 →' : 'Compare Employee view →'}
          </button>
        </div>
      ` : ''}

      <section class="panel split-view">
        <div class="split-list-col">
          <div class="split-list-head">
            <button type="button" class="pill-filter ${state.decFilter === 'all' ? 'is-active' : ''}" data-dec-filter="all">${t('decFilterAll')} (${baseList.length})</button>
            ${!isAdmin ? `<button type="button" class="pill-filter ${state.decFilter === 'pending' ? 'is-active' : ''}" data-dec-filter="pending">${t('decFilterPending')} (${pendingCount})</button>` : ''}
            <button type="button" class="pill-filter ${state.decFilter === 'synced' ? 'is-active' : ''}" data-dec-filter="synced">${t('decFilterSynced')}</button>
            <button type="button" class="pill-filter ${state.decFilter === 'monday' ? 'is-active' : ''}" data-dec-filter="monday">${t('decFilterMonday')} (${mondayCount})</button>
          </div>
          <div class="split-items">
            ${list.map((d) => {
              const owner = memberById(d.ownerId);
              const dotCls = d.status === 'synced' ? 'dot-ready' : d.status === 'pending' ? 'dot-input' : 'dot-paused';
              return `
                <button type="button" class="split-item ${selected && selected.id === d.id ? 'is-selected' : ''}" data-select-dec="${d.id}">
                  <div class="si-top">
                    <span class="si-meta"><span class="dot ${dotCls}"></span>${esc(pick(d.context))}</span>
                    ${d.visitorIgnoredCount > 0 ? `<span class="badge badge-neutral">${state.lang === 'zh' ? '已过滤访客' : 'Visitor filtered'}</span>` : ''}
                  </div>
                  <div class="si-title">${esc(pick(d.title))}</div>
                  <div class="si-meta">${owner ? esc(owner.name) : t('unassigned')} · ${esc(pick(d.due))}</div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="split-detail-col">
          ${!selected
            ? `<p style="color:var(--muted);padding:40px 0;text-align:center;">${state.lang === 'zh' ? '暂无记录' : 'No records in this view'}</p>`
            : renderDecisionDetail(selected, statusBadge, isAdmin)
          }
        </div>
      </section>
    `;
  }

  function renderDecisionDetail(dec, statusBadge, isAdmin) {
    const owner = memberById(dec.ownerId);
    const capturer = memberById(dec.capturedById);
    const isPlaying = playingQuoteId === dec.id;

    return `
      <div class="det-head">
        <div>
          <h2 class="det-title">${esc(pick(dec.title))}</h2>
          <p class="det-summary">${esc(pick(dec.summary))}</p>
        </div>
        ${statusBadge(dec.status)}
      </div>

      <div class="kv-grid">
        <div>
          <div class="kv-k">${t('kvOwner')}</div>
          <div class="kv-v">
            ${dec.status === 'monday' && !owner
              ? `<select class="select-clean" data-assign-owner="${dec.id}">
                  <option value="">${t('assignPlaceholder')}</option>
                  ${state.members.filter((m) => m.active).map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join('')}
                </select>`
              : `${renderAvatar(owner, 'sm')}<span>${owner ? esc(owner.name) : t('unassigned')}</span>`
            }
          </div>
        </div>
        <div>
          <div class="kv-k">${t('kvDue')}</div>
          <div class="kv-v">${esc(pick(dec.due))}</div>
        </div>
        <div>
          <div class="kv-k">${t('kvSource')}</div>
          <div class="kv-v">
            ${capturer
              ? `<i class="sw sw-${capturer.finish}"></i><span>${state.lang === 'zh' ? `${capturer.name.split(' ')[0]} 的 Rutta Bar` : `${capturer.name.split(' ')[0]}’s Bar`}</span>`
              : esc(pick(dec.context))}
          </div>
        </div>
      </div>

      ${dec.visitorIgnoredCount > 0 ? `
        <div class="visitor-notice-bar">
          ${ICONS.shield}
          <span>${state.lang === 'zh'
            ? `讨论期间检测到 ${dec.visitorIgnoredCount} 位未加入访客发言，状态灯未亮，音频已实时丢弃。`
            : `${dec.visitorIgnoredCount} unenrolled visitor spoke during this session — LED stayed dark and audio was dropped.`}</span>
        </div>
      ` : ''}

      <div class="confirm-section">
        ${dec.status === 'synced'
          ? `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12.5px;color:var(--muted);">
              <span>${t('syncedToLabel')}:</span>
              ${dec.syncedTools.map((st) => `<span class="badge badge-green">✓ ${esc(st)}</span>`).join('')}
            </div>`
          : `<div class="confirm-list">
              <span style="font-size:12.5px;color:var(--muted);">${t('confirmPrompt')}</span>
              ${dec.participants.map((p) => {
                const m = memberById(p.memberId);
                const first = m ? m.name.split(' ')[0] : '?';
                return `
                  <button type="button" class="confirm-chip ${p.confirmed ? 'is-confirmed' : ''}" data-confirm-part="${dec.id}:${p.memberId}">
                    ${renderAvatar(m, 'sm')}
                    <span>${esc(first)} · ${p.confirmed ? t('confirmedTag') : t('confirmAction')}</span>
                  </button>
                `;
              }).join('')}
            </div>`
        }
      </div>

      ${isAdmin ? `
        <div class="quote-box is-admin-locked">
          <div class="qal-icon">${ICONS.lock}</div>
          <div>
            <div class="qal-title">${t('adminAudioLockedTitle')}</div>
            <div class="qal-desc">${t('adminAudioLockedDesc')}</div>
          </div>
        </div>
      ` : `
        <div class="quote-box">
          <div class="qb-top">
            <span class="qb-title">${t('quoteTitle')} (${dec.quoteDuration})</span>
            <span class="qb-lock">${ICONS.lock} ${t('quoteLock')}</span>
          </div>
          <div class="qb-player">
            <button type="button" class="qb-play" data-play-quote="${dec.id}" aria-label="Play quote">
              ${isPlaying ? ICONS.pause : ICONS.play}
            </button>
            <div class="qb-wave" id="qd-wave-${dec.id}">
              ${Array.from({ length: 56 }, (_, i) => {
                const h = 22 + ((i * 37 + 17) % 74);
                const played = isPlaying && (i / 56) <= quotePlayPct;
                return `<span class="${played ? 'is-played' : ''}" style="height:${h}%"></span>`;
              }).join('')}
            </div>
            <span class="qb-time" id="qd-time-${dec.id}">${isPlaying ? formatClipTime(dec.quoteDuration, quotePlayPct) : `0:00 / ${dec.quoteDuration}`}</span>
          </div>
          <div class="qb-lines">
            ${dec.quotes.map((q) => `
              <div class="qb-line ${q.key ? 'is-key' : ''}">
                <span class="qb-ts">${q.ts}</span>
                <span class="qb-spk">${esc(q.speaker)}</span>
                <span>${esc(pick(q))}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `}

      <div class="det-actions">
        ${!isAdmin
          ? `<button type="button" class="btn btn-ghost btn-xs" style="color:var(--red);" data-delete-dec="${dec.id}">${t('btnDeleteRec')}</button>`
          : `<span style="font-size:12px;color:var(--muted);">${state.lang === 'zh' ? '文字决定留存中 · 原声片段到期自动销毁' : 'Text decision archived · Source clip auto-expires'}</span>`
        }
        ${!isAdmin
          ? `<button type="button" class="btn btn-primary btn-xs" data-handoff-dec="${dec.id}">${t('btnHandoffAgent')}</button>`
          : ''
        }
      </div>
    `;
  }

  function formatClipTime(totalStr, pct) {
    const parts = totalStr.split(':').map(Number);
    const sec = (parts[0] || 0) * 60 + (parts[1] || 12);
    return `0:${String(Math.min(sec, Math.round(sec * pct))).padStart(2, '0')} / ${totalStr}`;
  }

  /* =====================================================================
   * ADMIN VIEW 1: VOICEPRINTS TABLE
   * ===================================================================== */
  function renderAdminVoiceprintsView() {
    const activeMembers = state.members.filter((m) => m.active);
    const peerAllowedCount = activeMembers.filter((m) => canBeCapturedByPeer(m)).length;
    const q = state.vpSearch.trim().toLowerCase();
    const rows = state.members.filter((m) => {
      if (state.vpFilter === 'active' && !m.active) return false;
      if (state.vpFilter === 'paused' && m.active) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || pick(m.role).toLowerCase().includes(q);
    });

    const barStatusLabel = (bs) => {
      if (bs === 'muted') return state.lang === 'zh' ? '物理静音' : 'Muted';
      if (bs === 'lid_closed') return state.lang === 'zh' ? '合盖待机' : 'Lid closed';
      return state.lang === 'zh' ? '在线' : 'Online';
    };

    const peerBadge = (m) => {
      if (!m.active) return `<span class="badge badge-neutral">${t('statusPaused')}</span>`;
      if (m.tempPauseMinutes > 0) return `<span class="badge badge-amber">${t('peerTempPaused')}</span>`;
      if (m.allowPeerCapture) return `<span class="badge badge-green">${t('peerAllowed')}</span>`;
      return `<span class="badge badge-neutral">${ICONS.lock} ${t('peerSelfOnly')}</span>`;
    };

    return `
      <section class="metrics-row">
        <div class="panel metric-card">
          <div class="mc-label">
            <span>${t('metricEnrolled')}</span>
            <span class="badge badge-green"><span class="dot dot-ready"></span>${state.lang === 'zh' ? '白名单生效' : 'Active'}</span>
          </div>
          <div class="mc-value-row">
            <span class="mc-value">${activeMembers.length} <span style="font-size:15px;font-weight:500;color:var(--muted);">/ ${state.members.length}</span></span>
          </div>
          <div class="mc-foot">${t('metricEnrolledFoot')}</div>
        </div>

        <div class="panel metric-card">
          <div class="mc-label">
            <span>${t('metricPeerAllowed')}</span>
            <span class="badge badge-neutral">${ICONS.lock} ${state.lang === 'zh' ? '本人授权' : 'Self-owned'}</span>
          </div>
          <div class="mc-value-row">
            <span class="mc-value">${peerAllowedCount} <span style="font-size:15px;font-weight:500;color:var(--muted);">/ ${activeMembers.length}</span></span>
            <button type="button" class="link-act" id="jump-emp-consent">${state.lang === 'zh' ? '去员工端体验 →' : 'Employee view →'}</button>
          </div>
          <div class="mc-foot">${t('metricPeerFoot')}</div>
        </div>

        <div class="panel metric-card">
          <div class="mc-label">
            <span>${t('metricBlocked')}</span>
            <span class="badge badge-neutral">${state.lang === 'zh' ? '0 留存' : '0 saved'}</span>
          </div>
          <div class="mc-value-row">
            <span class="mc-value">${state.blockedVisitorsToday}</span>
          </div>
          <div class="mc-foot">${t('metricBlockedFoot')}</div>
        </div>
      </section>

      <section class="panel table-panel">
        <div class="table-toolbar">
          <div class="seg-tabs" role="group">
            <button type="button" class="seg-tab ${state.vpFilter === 'all' ? 'is-active' : ''}" data-vp-filter="all">${t('filterAll')} (${state.members.length})</button>
            <button type="button" class="seg-tab ${state.vpFilter === 'active' ? 'is-active' : ''}" data-vp-filter="active">${t('filterActive')}</button>
            <button type="button" class="seg-tab ${state.vpFilter === 'paused' ? 'is-active' : ''}" data-vp-filter="paused">${t('filterPaused')}</button>
          </div>
          <div class="search-box">
            ${ICONS.search}
            <input type="search" id="vp-search-input" value="${esc(state.vpSearch)}" placeholder="${esc(t('searchPlaceholder'))}">
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>${t('colMember')}</th>
              <th>${t('colVoiceprint')}</th>
              <th>${t('colPeerConsent')}</th>
              <th>${t('colDevice')}</th>
              <th>${t('colLastHeard')}</th>
              <th>${t('colEnabled')}</th>
              <th style="text-align:right;">${t('colActions')}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length === 0
              ? `<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--muted);">${t('emptyRoster')}</td></tr>`
              : rows.map((m) => `
                <tr class="${m.active ? '' : 'is-paused'}" data-open-member="${m.id}">
                  <td>
                    <div class="user-cell">
                      ${renderAvatar(m)}
                      <div>
                        <div class="u-name">${esc(m.name)}</div>
                        <div class="u-meta">${esc(pick(m.role))} · ${esc(m.email)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="vp-cell">
                      <div class="mini-wave" aria-hidden="true">
                        ${m.bars.map((h) => `<span style="height:${Math.round(h * 0.17)}px"></span>`).join('')}
                      </div>
                      <span class="badge ${m.active ? 'badge-green' : 'badge-neutral'}">${m.active ? t('statusActive') : t('statusPaused')}</span>
                    </div>
                  </td>
                  <td>${peerBadge(m)}</td>
                  <td>
                    <span class="bar-cell">
                      <i class="sw sw-${m.finish}"></i>
                      <span>${finishLabel(m.finish)} · ${barStatusLabel(m.barState)}</span>
                    </span>
                  </td>
                  <td class="time-cell">${esc(pick(m.lastHeard))}</td>
                  <td onclick="event.stopPropagation()">
                    <button type="button" class="toggle" role="switch" aria-checked="${m.active}" data-toggle-member="${m.id}" aria-label="${esc(m.name)}"></button>
                  </td>
                  <td onclick="event.stopPropagation()">
                    <div class="row-actions">
                      <button type="button" class="link-act" data-inspect-member="${m.id}">${t('actDetails')}</button>
                      <button type="button" class="link-act danger" data-delete-member="${m.id}">${t('actRemove')}</button>
                    </div>
                  </td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      </section>
    `;
  }

  /* ---------- Admin Right-Side Inspector Drawer ---------- */
  function renderMemberDrawer(memberId) {
    const m = memberById(memberId);
    if (!m) { closeMemberDrawer(); return; }
    state.inspectedMemberId = memberId;
    const isMuted = m.barState === 'muted';
    const previewMode = isMuted ? 'mute' : 'ready';

    const drawer = $('#member-drawer');
    drawer.innerHTML = `
      <div class="id-head">
        <div class="user-cell">
          ${renderAvatar(m)}
          <div>
            <div class="u-name">${esc(m.name)}</div>
            <div class="u-meta">${esc(pick(m.role))} · ${esc(m.email)}</div>
          </div>
        </div>
        <button type="button" class="icon-btn" id="drawer-close" aria-label="Close">${ICONS.close}</button>
      </div>
      <div class="id-body">
        <div>
          <div class="kv-k">${t('drawerVoiceLabel')}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:10px;background:var(--surface-2);border:1px solid var(--border);margin-top:6px;">
            <div class="vp-cell">
              <div class="mini-wave">${m.bars.map((h) => `<span style="height:${Math.round(h * 0.18)}px"></span>`).join('')}</div>
              <span class="badge ${m.active ? 'badge-green' : 'badge-neutral'}">${m.active ? t('statusActive') : t('statusPaused')}</span>
            </div>
            <button type="button" class="toggle" role="switch" aria-checked="${m.active}" id="drawer-toggle-active"></button>
          </div>
        </div>

        <div>
          <div class="kv-k">${t('drawerPeerLabel')}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-radius:10px;background:var(--surface-2);border:1px solid var(--border);margin-top:6px;">
            <div>
              <div style="font-size:13px;font-weight:580;">${canBeCapturedByPeer(m) ? t('peerAllowed') : t('peerSelfOnly')}</div>
              <div style="font-size:11.5px;color:var(--muted);margin-top:2px;">${state.lang === 'zh' ? '管理者仅可查看，不可代员工开启' : 'Read-only for admins'}</div>
            </div>
            <button type="button" class="toggle" role="switch" aria-checked="${m.allowPeerCapture}" disabled aria-label="Employee controlled"></button>
          </div>
        </div>

        <div>
          <div class="kv-k">${t('drawerDeviceLabel')} · ${finishLabel(m.finish)} Rutta Bar</div>
          <div class="hw-studio-box" style="margin-top:6px;padding:15px 18px;">
            ${renderMemberHardwareVisual(m, previewMode, 'drawer-hw-switch')}
            <div style="margin-top:10px;display:flex;justify-content:space-between;font-size:12px;color:var(--muted);">
              <span>${m.finish === 'silver' ? t('drawerMuteHint') : (state.lang === 'zh' ? '机械静音滑键硬件断麦' : 'Hardware mic disconnect')}</span>
              <span>${isMuted ? t('diagMute') : t('diagReady')}</span>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:8px;">
          <button type="button" class="btn btn-secondary" style="flex:1;" id="drawer-verify-btn">${t('drawerVerifyBtn')}</button>
          <button type="button" class="btn btn-secondary" style="flex:1;" id="drawer-reenroll-btn">${t('drawerReenroll')}</button>
        </div>

        <div class="drawer-kv-list">
          <div class="drawer-kv-row">
            <span>${t('colLastHeard')}</span>
            <span>${esc(pick(m.lastHeard))}</span>
          </div>
          <div class="drawer-kv-row">
            <span>${state.lang === 'zh' ? '原始音频访问' : 'Raw audio access'}</span>
            <span>${state.lang === 'zh' ? '仅本人与在场成员' : 'Participants only'}</span>
          </div>
        </div>
      </div>
      <div class="id-foot">
        <button type="button" class="btn btn-ghost" style="color:var(--red);" id="drawer-remove-btn">${t('drawerRemove')}</button>
        <button type="button" class="btn btn-primary" id="drawer-done-btn">${state.lang === 'zh' ? '完成' : 'Done'}</button>
      </div>
    `;

    $('#member-drawer-backdrop').hidden = false;
    $('#drawer-close', drawer).addEventListener('click', closeMemberDrawer);
    $('#drawer-done-btn', drawer).addEventListener('click', closeMemberDrawer);
    $('#drawer-toggle-active', drawer).addEventListener('click', () => {
      m.active = !m.active;
      renderAll();
      renderMemberDrawer(m.id);
    });
    $('#drawer-hw-switch', drawer).addEventListener('click', () => {
      m.barState = m.barState === 'muted' ? 'online' : 'muted';
      if (m.id === 'maya') state.hwState = m.barState === 'muted' ? 'mute' : 'ready';
      playSwitchClick(m.barState === 'muted');
      renderAll();
      renderMemberDrawer(m.id);
    });
    $('#drawer-verify-btn', drawer).addEventListener('click', () => {
      if (!m.active) {
        showToast(state.lang === 'zh' ? `${m.name} 声纹当前已暂停，发言将被忽略` : `${m.name}’s voiceprint is paused`);
      } else {
        m.lastHeard = { zh: '刚刚验证通过', en: 'Verified just now' };
        showToast(state.lang === 'zh' ? `声纹识别正常 · 已匹配 ${m.name}` : `Voiceprint matched ${m.name}`);
        renderAll();
        renderMemberDrawer(m.id);
      }
    });
    $('#drawer-reenroll-btn', drawer).addEventListener('click', () => {
      closeMemberDrawer();
      openEnrollModal(m.id);
    });
    $('#drawer-remove-btn', drawer).addEventListener('click', () => {
      closeMemberDrawer();
      openDeleteModal(m.id);
    });
  }

  function closeMemberDrawer() {
    state.inspectedMemberId = null;
    $('#member-drawer-backdrop').hidden = true;
  }

  /* =====================================================================
   * ADMIN VIEW 3: TEAM DEVICES & DIAGNOSTIC
   * ===================================================================== */
  function renderAdminDevicesView() {
    const imgs = {
      silver: 'assets/hero-silver.webp',
      sky: 'assets/hero-sky.webp',
      starlight: 'assets/hero-starlight.webp',
      midnight: 'assets/hero-midnight.webp'
    };
    const diagCopy = {
      ready: [t('diagReadyHead'), t('diagReadyBody'), 'badge-green', t('diagReady')],
      input: [t('diagInputHead'), t('diagInputBody'), 'badge-amber', t('diagInput')],
      visitor: [t('diagVisitorHead'), t('diagVisitorBody'), 'badge-neutral', t('diagVisitor')],
      mute: [t('diagMuteHead'), t('diagMuteBody'), 'badge-orange', t('diagMute')]
    };
    const [dHead, dBody, dBadgeCls, dBadgeText] = diagCopy[state.hwState];
    const teamBars = state.members.slice(0, 4);

    return `
      <section class="panel device-hero-panel">
        <div class="hw-studio-box">
          <div class="hw-studio-head">
            <span style="display:inline-flex;align-items:center;gap:7px;">
              <span class="dot dot-${state.hwState}"></span>
              <span>Rutta Bar · ${finishLabel('silver')}</span>
            </span>
            <span class="badge ${dBadgeCls}">${dBadgeText}</span>
          </div>
          <div class="hw-render-wrap">
            <img src="${hwImageForState(state.hwState)}" alt="Rutta Bar hardware">
            <span class="hw-led-overlay mode-${state.hwState}" aria-hidden="true"></span>
            <button type="button" class="hw-switch-area" id="hw-switch-hotspot" aria-label="Physical mute switch"></button>
          </div>
        </div>

        <div class="hw-diag-col">
          <div>
            <h2 class="hw-diag-title">${t('diagTitle')}</h2>
            <p class="hw-diag-desc">${t('diagDesc')}</p>
          </div>
          <div class="diag-seg" role="group">
            <button type="button" class="diag-btn ${state.hwState === 'ready' ? 'is-active' : ''}" data-diag="ready">${t('diagReady')}</button>
            <button type="button" class="diag-btn ${state.hwState === 'input' ? 'is-active' : ''}" data-diag="input">${t('diagInput')}</button>
            <button type="button" class="diag-btn ${state.hwState === 'visitor' ? 'is-active' : ''}" data-diag="visitor">${t('diagVisitor')}</button>
            <button type="button" class="diag-btn ${state.hwState === 'mute' ? 'is-active' : ''}" data-diag="mute">${t('diagMute')}</button>
          </div>
          <div class="diag-readout">
            <strong>${esc(dHead)}</strong>
            <span>${esc(dBody)}</span>
          </div>
        </div>
      </section>

      <div class="fleet-head">
        <h2>${state.multiBarSync ? t('syncBannerText') : t('fleetTitle')}</h2>
      </div>

      <section class="fleet-grid">
        ${teamBars.map((m, idx) => {
          const isSync = state.multiBarSync && idx < 3;
          const isLocalActive = idx === 0 && !isSync;
          const isMuted = !isSync && (isLocalActive ? state.hwState === 'mute' : m.barState === 'muted');
          const isInput = isSync || (isLocalActive && state.hwState === 'input');
          const isVisitor = isLocalActive && state.hwState === 'visitor';
          const isLid = !isSync && !isMuted && !isInput && !isVisitor && m.barState === 'lid_closed';
          const dot = isInput ? 'dot-input' : isMuted ? 'dot-mute' : isVisitor ? 'dot-visitor' : 'dot-ready';
          const badge = isSync
            ? `<span class="badge badge-amber">${state.lang === 'zh' ? '同频同步' : 'Synced'}</span>`
            : isInput
              ? `<span class="badge badge-amber">${t('diagInput')}</span>`
              : isMuted
                ? `<span class="badge badge-orange">${t('diagMute')}</span>`
                : isVisitor
                  ? `<span class="badge badge-neutral">${t('diagVisitor')}</span>`
                  : isLid
                    ? `<span class="badge badge-green">${state.lang === 'zh' ? '合盖待机' : 'Lid closed'}</span>`
                    : `<span class="badge badge-green">${t('diagReady')}</span>`;

          return `
            <div class="panel fleet-card ${isSync ? 'is-sync' : ''}">
              <div class="fc-img">
                <span class="dot ${dot}"></span>
                <img src="${imgs[m.finish]}" alt="${finishLabel(m.finish)} Rutta Bar">
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                <div>
                  <div class="fc-name">${esc(m.name)}</div>
                  <div class="fc-sub">${finishLabel(m.finish)} · ${canBeCapturedByPeer(m) ? (state.lang === 'zh' ? '可被他人录' : 'Peers OK') : (state.lang === 'zh' ? '仅限本机' : 'Self only')}</div>
                </div>
                ${badge}
              </div>
            </div>
          `;
        }).join('')}
      </section>

      <section class="panel lid-row-card ${state.lidClosed ? '' : 'is-open'}">
        <div class="lid-img-wrap">
          <img src="assets/closedside-1200.webp" alt="Closed MacBook Air with Rutta Bar">
          <span class="lid-dot" aria-hidden="true"></span>
        </div>
        <div class="lid-info">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <h3 style="font-size:15px;font-weight:630;">${t('lidTitle')}</h3>
            <span class="badge ${state.lidClosed ? 'badge-green' : 'badge-neutral'}">${state.lidClosed ? t('lidClosedTag') : t('lidOpenTag')}</span>
          </div>
          <p style="font-size:13px;color:var(--ink-2);line-height:1.58;">${t('lidDesc')}</p>
          <div style="margin-top:4px;">
            <button type="button" class="btn btn-secondary btn-xs" id="btn-toggle-lid">${t('lidToggleBtn')}</button>
          </div>
        </div>
      </section>
    `;
  }

  /* =====================================================================
   * AGENT & INTEGRATIONS VIEWS (Employee vs Admin)
   * ===================================================================== */
  function renderAgentCard() {
    const chips = state.lang === 'zh'
      ? [
          { id: 'client-email', label: '把刚改的上线日期写封更新发给客户' },
          { id: 'linear-task', label: '在 Linear 建好周四发版任务给 Leo' },
          { id: 'why-silver', label: '查一下上次为什么选了银色款' }
        ]
      : [
          { id: 'client-email', label: 'Draft client update for Dec 10 launch shift' },
          { id: 'linear-task', label: 'Create Thursday Silver build ticket for Leo' },
          { id: 'why-silver', label: 'Why did we pick the Silver finish?' }
        ];

    return `
      <section class="panel section-card">
        <div class="sc-head">
          <h2>${t('agentTitle')}</h2>
          <p>${t('agentDesc')}</p>
        </div>
        <form class="agent-form" id="agent-form">
          <input type="text" id="agent-input" placeholder="${esc(t('agentPlaceholder'))}" autocomplete="off">
          <button type="submit" class="btn btn-primary">${t('agentRun')}</button>
        </form>
        <div class="agent-chips">
          ${chips.map((c) => `<button type="button" class="agent-chip ${state.agentPreset === c.id ? 'is-active' : ''}" data-agent-preset="${c.id}">${esc(c.label)}</button>`).join('')}
        </div>
        ${state.agentResult ? `
          <div class="agent-draft">
            <div class="ad-meta">
              <span>${esc(state.agentResult.citation)}</span>
              <span>${esc(state.agentResult.channel)}</span>
            </div>
            <div class="ad-body">${esc(state.agentResult.body)}</div>
            <div class="ad-foot">
              <span>${state.lang === 'zh' ? '基于已确认文字记录生成，未读取原始音频' : 'Grounded in confirmed notes only · No raw audio read'}</span>
              <button type="button" class="btn btn-primary btn-xs" id="agent-approve-btn" ${state.agentApproved ? 'disabled' : ''}>
                ${state.agentApproved ? t('agentSent') : t('agentApprove')}
              </button>
            </div>
          </div>
        ` : ''}
      </section>
    `;
  }

  function renderEmployeeAgentView() {
    return `
      <div class="int-layout">
        ${renderAgentCard()}

        <section class="panel section-card">
          <div class="sc-head">
            <h2>${state.lang === 'zh' ? '确认后同步去向（团队配置）' : 'Sync Destinations (Workspace Config)'}</h2>
            <p>${state.lang === 'zh' ? '仅在你点击确认后，文字决定才会推送到以下已启用工具；配置由管理者维护。' : 'Confirmed text notes flow to these active workspace tools.'}</p>
          </div>
          <div class="tool-rows">
            ${state.integrations.map((tool) => `
              <div class="tool-row">
                <div class="tr-left">
                  <div class="tool-mark">${esc(tool.letter)}</div>
                  <div>
                    <div class="tr-name">${esc(tool.name)}</div>
                    <div class="tr-desc">${esc(pick(tool.desc))}</div>
                  </div>
                </div>
                <div class="tr-right">
                  <span class="tr-mono">${esc(tool.target)}</span>
                  <span class="badge ${tool.enabled ? 'badge-green' : 'badge-neutral'}">${tool.enabled ? (state.lang === 'zh' ? '已启用' : 'On') : (state.lang === 'zh' ? '已停用' : 'Off')}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function renderAdminIntegrationsView() {
    return `
      <div class="int-layout">
        <div style="display:flex;flex-direction:column;gap:16px;">
          <section class="panel section-card">
            <div class="sc-head">
              <h2>${t('toolsTitle')}</h2>
              <p>${t('toolsDesc')}</p>
            </div>
            <div class="tool-rows">
              ${state.integrations.map((tool) => `
                <div class="tool-row">
                  <div class="tr-left">
                    <div class="tool-mark">${esc(tool.letter)}</div>
                    <div>
                      <div class="tr-name">${esc(tool.name)}</div>
                      <div class="tr-desc">${esc(pick(tool.desc))}</div>
                    </div>
                  </div>
                  <div class="tr-right">
                    <span class="tr-mono">${esc(tool.target)}</span>
                    ${tool.id === 'mcp'
                      ? `<button type="button" class="btn btn-secondary btn-xs" data-copy-mcp="${tool.target}">${t('btnCopy')}</button>`
                      : `<button type="button" class="btn btn-secondary btn-xs" data-test-tool="${tool.id}" ${tool.enabled ? '' : 'disabled'}>${t('btnTest')}</button>`
                    }
                    <button type="button" class="toggle" role="switch" aria-checked="${tool.enabled}" data-toggle-tool="${tool.id}" aria-label="${esc(tool.name)}"></button>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>

          <section class="panel section-card">
            <div class="sc-head">
              <h2>${state.lang === 'zh' ? '管理合规日志（仅记录配置，不含对话内容）' : 'Governance Audit Log (Config only · Zero dialogue)'}</h2>
              <p>${state.lang === 'zh' ? '追踪声纹名录变更与系统自动清理记录，方便团队安全审计。' : 'Tracks roster updates and auto-expiry runs for workspace governance.'}</p>
            </div>
            <div class="tool-rows">
              ${state.auditLogs.map((log) => `
                <div class="audit-row">
                  <span>${esc(pick(log.text))}</span>
                  <span class="audit-time">${esc(pick(log.time))}</span>
                </div>
              `).join('')}
            </div>
          </section>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px;">
          <section class="panel section-card">
            <div class="sc-head">
              <h2>${t('privacyTitle')}</h2>
              <p>${t('privacyDesc')}</p>
            </div>
            <div class="tool-rows">
              ${state.policies.map((p) => `
                <div class="policy-row">
                  <div>
                    <div class="pr-name">
                      <span>${esc(pick(p.title))}</span>
                      ${p.locked ? `<span class="badge badge-neutral">${ICONS.lock} ${t('lockedBadge')}</span>` : ''}
                    </div>
                    <p class="pr-desc">${esc(pick(p.desc))}</p>
                  </div>
                  <button type="button" class="toggle" role="switch" aria-checked="${p.enabled}" ${p.locked ? 'disabled' : ''} data-toggle-policy="${p.id}"></button>
                </div>
              `).join('')}
            </div>
          </section>

          <section class="panel section-card">
            <div class="sc-head">
              <h2>${state.lang === 'zh' ? '数据留存与权限摘要' : 'Retention & Access Summary'}</h2>
            </div>
            <div class="drawer-kv-list">
              <div class="drawer-kv-row">
                <span>${state.lang === 'zh' ? '未匹配 / 拒收语音' : 'Unauthorized / blocked speech'}</span>
                <span>${state.lang === 'zh' ? '实时丢弃（0 留存）' : 'Dropped immediately (0 saved)'}</span>
              </div>
              <div class="drawer-kv-row">
                <span>${state.lang === 'zh' ? '原声片段自动销毁' : 'Source clip auto-expiry'}</span>
                <span>${state.lang === 'zh' ? '确认后 7 天自动清理' : '7 days after confirmation'}</span>
              </div>
              <div class="drawer-kv-row">
                <span>${state.lang === 'zh' ? '跨设备收录控制权' : 'Peer-capture override'}</span>
                <span>${state.lang === 'zh' ? '仅员工本人（管理者只读）' : 'Employee only (Admin read-only)'}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  /* =====================================================================
   * RENDER ORCHESTRATION & BINDINGS
   * ===================================================================== */
  function renderCurrentView() {
    const root = $('#view-container');
    if (state.roleMode === 'employee') {
      if (state.activeTab === 'my-voice') {
        root.innerHTML = renderEmployeeVoiceView();
        bindEmployeeVoiceEvents(root);
      } else if (state.activeTab === 'my-decisions') {
        root.innerHTML = renderDecisionsView(false);
        bindDecisionsEvents(root);
      } else {
        root.innerHTML = renderEmployeeAgentView();
        bindIntegrationsEvents(root);
      }
    } else {
      if (state.activeTab === 'voiceprints') {
        root.innerHTML = renderAdminVoiceprintsView();
        bindAdminVoiceprintsEvents(root);
      } else if (state.activeTab === 'decisions') {
        root.innerHTML = renderDecisionsView(true);
        bindDecisionsEvents(root);
      } else if (state.activeTab === 'devices') {
        root.innerHTML = renderAdminDevicesView();
        bindDevicesEvents(root);
      } else {
        root.innerHTML = renderAdminIntegrationsView();
        bindIntegrationsEvents(root);
      }
    }
  }

  function renderAll() {
    syncChrome();
    renderCurrentView();
  }

  function bindAdminVoiceprintsEvents(root) {
    $('#jump-emp-consent', root)?.addEventListener('click', () => {
      state.currentEmployeeId = 'leo';
      switchRole('employee', 'my-voice');
    });

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
    $$('[data-open-member]', root).forEach((tr) => {
      tr.addEventListener('click', () => renderMemberDrawer(tr.dataset.openMember));
    });
    $$('[data-inspect-member]', root).forEach((b) => {
      b.addEventListener('click', () => renderMemberDrawer(b.dataset.inspectMember));
    });
    $$('[data-toggle-member]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const m = memberById(b.dataset.toggleMember);
        if (!m) return;
        m.active = !m.active;
        showToast(state.lang === 'zh' ? `${m.name} 声纹已${m.active ? '启用' : '暂停'}` : `${m.name} ${m.active ? 'enabled' : 'paused'}`);
        renderAll();
      });
    });
    $$('[data-delete-member]', root).forEach((b) => {
      b.addEventListener('click', () => openDeleteModal(b.dataset.deleteMember));
    });
  }

  function bindDecisionsEvents(root) {
    $('#btn-jump-emp-dec', root)?.addEventListener('click', () => {
      state.currentEmployeeId = 'leo';
      switchRole('employee', 'my-decisions');
    });
    $$('[data-dec-filter]', root).forEach((b) => {
      b.addEventListener('click', () => { stopQuotePlayback(); state.decFilter = b.dataset.decFilter; renderCurrentView(); });
    });
    $$('[data-select-dec]', root).forEach((b) => {
      b.addEventListener('click', () => { stopQuotePlayback(); state.selectedDecisionId = b.dataset.selectDec; renderCurrentView(); });
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
        showToast(state.lang === 'zh' ? `已指派给 ${m.name} 并同步 Linear` : `Assigned to ${m.name} & synced to Linear`);
        renderAll();
      });
    });
    $$('[data-handoff-dec]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const dec = state.decisions.find((d) => d.id === b.dataset.handoffDec);
        if (!dec) return;
        state.activeTab = 'my-agent';
        renderAll();
        runAgentCustom(state.lang === 'zh' ? `基于「${pick(dec.title)}」起草团队同步` : `Draft update for "${pick(dec.title)}"`, dec);
      });
    });
    $$('[data-delete-dec]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const idx = state.decisions.findIndex((d) => d.id === b.dataset.deleteDec);
        if (idx === -1) return;
        lastDeletedDecision = { item: state.decisions.splice(idx, 1)[0], idx };
        state.selectedDecisionId = state.decisions[0]?.id || null;
        renderAll();
        showToast(state.lang === 'zh' ? '已删除该条记录并销毁关联原话' : 'Record & source clip destroyed', t('undo'), () => {
          if (lastDeletedDecision) {
            state.decisions.splice(lastDeletedDecision.idx, 0, lastDeletedDecision.item);
            state.selectedDecisionId = lastDeletedDecision.item.id;
            lastDeletedDecision = null;
            renderAll();
          }
        });
      });
    });
  }

  function bindDevicesEvents(root) {
    $('#hw-switch-hotspot', root)?.addEventListener('click', () => {
      setHardwareState(state.hwState === 'mute' ? 'ready' : 'mute');
    });
    $$('[data-diag]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const mode = b.dataset.diag;
        setHardwareState(mode);
        if (mode === 'visitor') showPrivacyNotice(false);
      });
    });
    $('#btn-toggle-lid', root)?.addEventListener('click', () => {
      state.lidClosed = !state.lidClosed;
      renderCurrentView();
    });
  }

  function bindIntegrationsEvents(root) {
    $('#agent-form', root)?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = $('#agent-input', root).value.trim();
      if (val) runAgentCustom(val);
    });
    $$('[data-agent-preset]', root).forEach((b) => b.addEventListener('click', () => runAgentPreset(b.dataset.agentPreset)));
    $('#agent-approve-btn', root)?.addEventListener('click', () => {
      state.agentApproved = true;
      renderCurrentView();
      showToast(state.lang === 'zh' ? '已发送并归档' : 'Sent & logged');
    });
    $$('[data-toggle-tool]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const tool = state.integrations.find((x) => x.id === b.dataset.toggleTool);
        if (!tool) return;
        tool.enabled = !tool.enabled;
        renderCurrentView();
      });
    });
    $$('[data-test-tool]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const tool = state.integrations.find((x) => x.id === b.dataset.testTool);
        if (tool) showToast(state.lang === 'zh' ? `已向 ${tool.name} 发送测试同步` : `Sent test sync to ${tool.name}`);
      });
    });
    $$('[data-copy-mcp]', root).forEach((b) => {
      b.addEventListener('click', () => {
        navigator.clipboard?.writeText(b.dataset.copyMcp).catch(() => {});
        showToast(state.lang === 'zh' ? '已复制 MCP 地址' : 'Copied MCP URI');
      });
    });
    $$('[data-toggle-policy]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const p = state.policies.find((x) => x.id === b.dataset.togglePolicy);
        if (p && !p.locked) { p.enabled = !p.enabled; renderCurrentView(); }
      });
    });
  }

  /* ---------- Actions ---------- */
  function toggleConfirm(decisionId, memberId, fromNotice) {
    const dec = state.decisions.find((d) => d.id === decisionId);
    if (!dec) return;
    const part = dec.participants.find((p) => p.memberId === memberId);
    if (!part) return;
    part.confirmed = !part.confirmed;
    if (dec.participants.every((p) => p.confirmed)) {
      dec.status = 'synced';
      showToast(state.lang === 'zh' ? '双方已确认，同步至团队空间与 Linear / Notion / Slack' : 'Confirmed & synced to workspace tools');
    }
    renderAll();
    if (fromNotice) showDecisionNotice(decisionId);
  }

  function stopQuotePlayback() {
    if (quotePlayTimer) clearInterval(quotePlayTimer);
    quotePlayTimer = null;
    playingQuoteId = null;
    quotePlayPct = 0;
  }

  function startQuotePlayback(decisionId) {
    stopQuotePlayback();
    playingQuoteId = decisionId;
    quotePlayPct = 0;
    renderCurrentView();
    quotePlayTimer = setInterval(() => {
      quotePlayPct += 0.04;
      if (quotePlayPct >= 1) { stopQuotePlayback(); renderCurrentView(); return; }
      const wave = $(`#qd-wave-${decisionId}`);
      const timeEl = $(`#qd-time-${decisionId}`);
      const dec = state.decisions.find((d) => d.id === decisionId);
      if (wave) {
        const bars = $$('span', wave);
        bars.forEach((b, i) => b.classList.toggle('is-played', (i / bars.length) <= quotePlayPct));
      }
      if (timeEl && dec) timeEl.textContent = formatClipTime(dec.quoteDuration, quotePlayPct);
    }, 150);
  }

  function runAgentPreset(presetId) {
    const map = {
      'client-email': {
        zh: {
          channel: '邮件草稿 · Gmail',
          citation: '引用决定：上线日期推迟至 12 月 10 日（Maya & Leo · 14:19）',
          body: 'Hi 各位，\n\n刚与工程侧对齐，为了让回归测试更充分，我们将上线日期从 12 月 3 日调整至 12 月 10 日。Leo 已同步顺延 Linear 里程碑（RUT-48）及发布计划。\n\n如有外部日程需要同步调整，随时告诉我。\n— Maya'
        },
        en: {
          channel: 'Email draft · Gmail',
          citation: 'Cited: Move launch from Dec 3 to Dec 10 (Maya & Leo · 14:19)',
          body: 'Hi team,\n\nAfter syncing with engineering, we are moving our target launch from Dec 3 to Dec 10 to give final QA a clean week. Leo has updated the Linear milestone (RUT-48) and release schedule.\n\nLet us know if any external timelines need adjusting.\n— Maya'
        }
      },
      'linear-task': {
        zh: {
          channel: '任务草稿 · Linear',
          citation: '引用决定：周五测试采用银色样机（Maya & Leo · 10:42）',
          body: '[RUT-54] 准备周五银色样机测试固件\n负责人：Leo Park · 截止：周四 12:00\n说明：设计评审确定首轮测试使用银色机身，周四中午前同步测试小组。'
        },
        en: {
          channel: 'Issue draft · Linear',
          citation: 'Cited: Use Silver prototype Friday (Maya & Leo · 10:42)',
          body: '[RUT-54] Deliver Silver prototype test build\nOwner: Leo Park · Due: Thu 12:00\nContext: First round of Friday user testing uses the Silver unit.'
        }
      },
      'why-silver': {
        zh: {
          channel: '知识库溯源 · MCP',
          citation: '命中 3 天前设计评审记录（10:42）',
          body: '对比四款阳极氧化配色后，团队认为银色与 MacBook Air 侧边融合度最高，且 Leo 周四中午前可先交付银色测试包。该决定已归档至 Notion 与 Linear（RUT-42）。'
        },
        en: {
          channel: 'Decision lookup · MCP',
          citation: 'Matched Design Review · 3d ago (10:42)',
          body: 'Silver matched the MacBook Air aluminum edge most naturally and Leo could ship the Silver build by Thursday noon. Logged in Notion and Linear (RUT-42).'
        }
      }
    };
    const chosen = map[presetId]?.[state.lang];
    if (!chosen) return;
    state.agentPreset = presetId;
    state.agentApproved = false;
    state.agentResult = chosen;
    renderCurrentView();
  }

  function runAgentCustom(promptText, linkedDec = null) {
    const dec = linkedDec || state.decisions[0];
    state.agentPreset = null;
    state.agentApproved = false;
    state.agentResult = {
      channel: state.lang === 'zh' ? '草稿 · MCP' : 'Draft · MCP',
      citation: state.lang === 'zh' ? `引用决定：${pick(dec.title)}` : `Cited: ${pick(dec.title)}`,
      body: state.lang === 'zh'
        ? `依据指令「${promptText}」整理如下：\n\n• 决定内容：${pick(dec.title)}\n• 负责人：${memberById(dec.ownerId)?.name || '待指派'} · 节点：${pick(dec.due)}`
        : `Draft for "${promptText}":\n\n• Decision: ${pick(dec.title)}\n• Owner: ${memberById(dec.ownerId)?.name || 'Unassigned'} · Due: ${pick(dec.due)}`
    };
    renderCurrentView();
  }

  /* ---------- Enrollment & Delete Modals ---------- */
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
    $$('#enroll-finish-selector .finish-btn').forEach((c) => c.classList.toggle('is-selected', c.dataset.finish === fin));

    updateEnrollQuote(m ? m.name : '');
    const box = $('#voice-capture-box');
    box.dataset.state = 'idle';
    $('#vc-status-text').textContent = t('vcIdle');
    $('#btn-sample-label').textContent = t('vcStartBtn');
    $('#enroll-save').disabled = true;
    $('#vc-wave').innerHTML = Array.from({ length: 26 }, () => '<span></span>').join('');
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
          const v = arr ? Math.max(6, Math.min(34, (arr[i % arr.length] / 255) * 38)) : 6 + Math.round(Math.random() * 26);
          bar.style.height = `${v}px`;
        });
        if (ticks >= 24) {
          stopVoiceSampling();
          sampledVoiceReady = true;
          box.dataset.state = 'done';
          $('#vc-status-text').textContent = t('vcDone');
          $('#btn-sample-label').textContent = t('vcResampleBtn');
          $('#enroll-save').disabled = false;
          bars.forEach((bar, i) => { bar.style.height = `${10 + ((i * 17 + 5) % 18)}px`; });
        }
      }, 105);
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
          showToast(state.lang === 'zh' ? '未获取麦克风权限，已使用模拟采样' : 'Mic unavailable — using simulated sample');
          run(null);
        });
    } else {
      run(null);
    }
  }

  function saveEnrolledMember() {
    if (!sampledVoiceReady) return;
    const name = $('#enroll-name').value.trim() || (state.lang === 'zh' ? '新成员' : 'New Member');
    const role = $('#enroll-role').value.trim() || (state.lang === 'zh' ? '产品研发' : 'Product');
    const email = $('#enroll-email').value.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'member'}@northstar.co`;
    const finish = $('#enroll-finish-selector .finish-btn.is-selected')?.dataset.finish || 'silver';
    const bars = Array.from({ length: 10 }, () => 34 + Math.round(Math.random() * 58));

    if (reenrollMemberId) {
      const m = memberById(reenrollMemberId);
      if (m) {
        m.role = { zh: role, en: role };
        m.email = email;
        m.finish = finish;
        m.bars = bars;
        m.active = true;
        m.lastHeard = { zh: '刚刚更新', en: 'Updated now' };
        showToast(state.lang === 'zh' ? `已更新 ${m.name} 的声纹` : `Updated ${m.name}’s voiceprint`);
      }
    } else {
      const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'NB';
      state.members.unshift({
        id: 'm-' + Date.now(),
        name,
        email,
        role: { zh: role, en: role },
        avatar: null,
        initials,
        finish,
        barState: 'online',
        lastHeard: { zh: '刚刚录入', en: 'Just enrolled' },
        active: true,
        allowPeerCapture: true,
        tempPauseMinutes: 0,
        requireMyConfirm: true,
        lidStandby: true,
        bars
      });
      showToast(state.lang === 'zh' ? `已添加 ${name} 至声纹白名单` : `Added ${name} to voiceprint roster`);
    }
    $('#enroll-modal').hidden = true;
    renderAll();
  }

  function openDeleteModal(memberId) {
    const m = memberById(memberId);
    if (!m) return;
    pendingDeleteMemberId = memberId;
    $('#delete-desc').textContent = state.lang === 'zh' ? `确定移除 ${m.name} 的声纹吗？` : `Remove ${m.name}’s voiceprint?`;
    $('#delete-modal').hidden = false;
  }

  function confirmDeleteMember() {
    if (!pendingDeleteMemberId) return;
    const idx = state.members.findIndex((m) => m.id === pendingDeleteMemberId);
    if (idx !== -1) {
      const removed = state.members.splice(idx, 1)[0];
      showToast(state.lang === 'zh' ? `已移除 ${removed.name} 的声纹` : `Removed ${removed.name}’s voiceprint`);
    }
    pendingDeleteMemberId = null;
    $('#delete-modal').hidden = true;
    renderAll();
  }

  /* ---------- Shot Director ---------- */
  function runDirectorShot(shot) {
    $('#director-drawer').hidden = true;
    closeMemberDrawer();
    $('#floating-card').hidden = true;

    if (shot === 'scenePeerBlock') {
      const leo = memberById('leo');
      if (leo) { leo.active = true; leo.allowPeerCapture = false; leo.tempPauseMinutes = 0; }
      state.currentEmployeeId = 'leo';
      switchRole('employee', 'my-voice');
      showPrivacyNotice(true);
    } else if (shot === 'sceneAdminLock') {
      switchRole('admin', 'decisions');
      state.selectedDecisionId = 'dec-silver';
      renderAll();
    } else if (shot === 'sceneA') {
      const dec = state.decisions.find((d) => d.id === 'dec-launch');
      if (dec) {
        dec.status = 'pending';
        dec.participants[0].confirmed = true;
        dec.participants[1].confirmed = false;
        state.selectedDecisionId = dec.id;
      }
      state.currentEmployeeId = 'leo';
      state.hwState = 'input';
      switchRole('employee', 'my-decisions');
      showDecisionNotice('dec-launch');
    } else if (shot === 'sceneC') {
      state.currentEmployeeId = 'maya';
      state.selectedDecisionId = 'dec-silver';
      switchRole('employee', 'my-decisions');
      startQuotePlayback('dec-silver');
    } else if (shot === 'sceneD') {
      switchRole('admin', 'devices');
      setHardwareState('visitor');
      showPrivacyNotice(false);
    } else if (shot === 'sceneS1') {
      switchRole('admin', 'devices');
      setHardwareState('mute');
    } else if (shot === 'sceneE') {
      state.currentEmployeeId = 'maya';
      switchRole('employee', 'my-agent');
      runAgentPreset('client-email');
    } else if (shot === 'sceneL4') {
      state.multiBarSync = true;
      state.hwState = 'input';
      switchRole('admin', 'devices');
    }
  }

  /* ---------- Global Wiring ---------- */
  function initGlobalEvents() {
    $$('.role-btn').forEach((b) => {
      b.addEventListener('click', () => switchRole(b.dataset.role));
    });

    $$('.lang-btn').forEach((b) => {
      b.addEventListener('click', () => {
        state.lang = b.dataset.lang;
        if (state.agentResult) runAgentPreset(state.agentPreset || 'client-email');
        renderAll();
      });
    });

    $('#rail-device-status').addEventListener('click', () => {
      state.activeTab = state.roleMode === 'employee' ? 'my-voice' : 'devices';
      renderAll();
    });

    $('#member-drawer-backdrop').addEventListener('click', (e) => {
      if (e.target === $('#member-drawer-backdrop')) closeMemberDrawer();
    });

    // Native macOS Menu Bar Popover
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
    $('#mbp-toggle-peer').addEventListener('click', () => {
      const emp = currentEmployee();
      emp.allowPeerCapture = !emp.allowPeerCapture;
      renderAll();
    });
    $('#mbp-toggle-mute').addEventListener('click', () => {
      const emp = currentEmployee();
      emp.barState = emp.barState === 'muted' ? 'online' : 'muted';
      setHardwareState(emp.barState === 'muted' ? 'mute' : 'ready');
    });
    $('#mbp-toggle-pause').addEventListener('click', () => {
      const emp = currentEmployee();
      emp.tempPauseMinutes = emp.tempPauseMinutes > 0 ? 0 : 30;
      mbPop.hidden = true;
      renderAll();
    });

    // Enroll modal
    $('#enroll-close').addEventListener('click', () => { stopVoiceSampling(); $('#enroll-modal').hidden = true; });
    $('#enroll-cancel').addEventListener('click', () => { stopVoiceSampling(); $('#enroll-modal').hidden = true; });
    $('#enroll-modal').addEventListener('click', (e) => { if (e.target === $('#enroll-modal')) { stopVoiceSampling(); $('#enroll-modal').hidden = true; } });
    $('#enroll-name').addEventListener('input', (e) => updateEnrollQuote(e.target.value));
    $$('#enroll-finish-selector .finish-btn').forEach((c) => {
      c.addEventListener('click', () => {
        $$('#enroll-finish-selector .finish-btn').forEach((x) => x.classList.remove('is-selected'));
        c.classList.add('is-selected');
      });
    });
    $('#btn-start-sample').addEventListener('click', () => startVoiceSampling(false));
    $('#btn-mic-sample').addEventListener('click', () => startVoiceSampling(true));
    $('#enroll-save').addEventListener('click', saveEnrolledMember);

    // Delete modal
    $('#delete-close').addEventListener('click', () => { $('#delete-modal').hidden = true; });
    $('#delete-cancel').addEventListener('click', () => { $('#delete-modal').hidden = true; });
    $('#delete-confirm').addEventListener('click', confirmDeleteMember);

    // Director
    $('#director-trigger').addEventListener('click', () => { $('#director-drawer').hidden = !$('#director-drawer').hidden; });
    $('#director-close').addEventListener('click', () => { $('#director-drawer').hidden = true; });
    $$('.dp-btn').forEach((b) => b.addEventListener('click', () => runDirectorShot(b.dataset.shot)));
    $('#toggle-menubar').addEventListener('change', (e) => { state.showMenubar = e.target.checked; syncChrome(); });
    $('#toggle-sound').addEventListener('change', (e) => { state.soundEnabled = e.target.checked; });
    $('#dd-clean-mode').addEventListener('click', () => {
      state.cleanShot = true;
      $('#director-drawer').hidden = true;
      syncChrome();
      showToast(state.lang === 'zh' ? '已进入纯净录屏模式（按 H 恢复）' : 'Clean screen ON (press H to restore)');
    });
    $('#dd-reset').addEventListener('click', () => {
      const keepLang = state.lang;
      stopQuotePlayback();
      closeMemberDrawer();
      state = window.createInitialRuttaState();
      state.lang = keepLang;
      $('#floating-card').hidden = true;
      $('#director-drawer').hidden = true;
      renderAll();
      showToast(state.lang === 'zh' ? '已重置演示数据' : 'Demo data reset');
    });

    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'Escape') {
        $('#enroll-modal').hidden = true;
        $('#delete-modal').hidden = true;
        $('#director-drawer').hidden = true;
        $('#floating-card').hidden = true;
        $('#menubar-popover').hidden = true;
        closeMemberDrawer();
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
      'assets/switch-photo-input.webp',
      'assets/switch-photo-mute.webp',
      'assets/hero-silver.webp',
      'assets/hero-sky.webp',
      'assets/hero-starlight.webp',
      'assets/hero-midnight.webp',
      'assets/closedside-1200.webp'
    ].forEach((src) => { const im = new Image(); im.src = src; });
  });
})();
