/* Rutta Bar Admin Console · Interactive Controller */
(() => {
  'use strict';

  let state = window.createInitialRuttaState();
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

  /* ---------- Subtle Web Audio Tactile Click (S1 Physical Switch) ---------- */
  function playTactileClick(isMute) {
    if (!state.soundEnabled) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isMute ? 320 : 480, now);
      osc.frequency.exponentialRampToValueAtTime(isMute ? 110 : 180, now + 0.028);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch (_) {}
  }

  /* ---------- Helpers ---------- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function memberById(id) {
    return state.members.find((m) => m.id === id) || null;
  }

  function finishLabel(finish) {
    const map = {
      silver: t('finishSilver'),
      sky: t('finishSky'),
      starlight: t('finishStarlight'),
      midnight: t('finishMidnight')
    };
    return map[finish] || finish;
  }

  function renderAvatar(member, small = false) {
    const cls = small ? 'avatar avatar-sm' : 'avatar';
    if (!member) {
      return `<span class="${cls}" style="background:#94A3B8">?</span>`;
    }
    if (member.avatar) {
      return `<img class="${cls}" src="${member.avatar}" alt="${escapeHtml(member.name)}">`;
    }
    return `<span class="${cls}" style="background:${member.color}">${escapeHtml(member.initials)}</span>`;
  }

  function hwImageForState(mode) {
    if (mode === 'input') return 'assets/switch-photo-input.webp';
    if (mode === 'mute') return 'assets/switch-photo-mute.webp';
    return 'assets/switch-photo-ready.webp';
  }

  function showToast(message, actionLabel = null, onAction = null) {
    const stack = $('#toast-stack');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span>${escapeHtml(message)}</span>`;
    if (actionLabel && onAction) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = actionLabel;
      btn.addEventListener('click', () => {
        onAction();
        el.remove();
      });
      el.appendChild(btn);
    }
    stack.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(12px)';
      el.style.transition = 'all 0.2s ease';
      setTimeout(() => el.remove(), 220);
    }, actionLabel ? 4600 : 2800);
  }

  /* ---------- Chrome & Shared Indicators Update ---------- */
  function syncChrome() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    document.body.classList.toggle('has-menubar', state.showMenubar);
    document.body.classList.toggle('clean-shot', state.cleanShot);

    // Static i18n text nodes
    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });

    // Language buttons
    $$('.lang-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.lang === state.lang);
    });

    // Active nav item & page title
    const titles = {
      voiceprints: t('navVoiceprints'),
      decisions: t('navDecisions'),
      integrations: t('navIntegrations'),
      devices: t('navDevices')
    };
    $('#page-title').textContent = titles[state.activeTab] || '';
    $$('.nav-item').forEach((item) => {
      const active = item.dataset.tab === state.activeTab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });

    // Topbar CTA button adapts subtly per tab
    const topBtn = $('#topbar-primary-btn');
    if (state.activeTab === 'voiceprints') {
      topBtn.hidden = false;
      topBtn.querySelector('span').textContent = t('addVoiceprintBtn');
    } else if (state.activeTab === 'decisions') {
      topBtn.hidden = false;
      topBtn.querySelector('span').textContent = state.lang === 'zh' ? '模拟新口头决定' : 'Simulate Decision';
    } else if (state.activeTab === 'devices') {
      topBtn.hidden = false;
      topBtn.querySelector('span').textContent = state.multiBarSync ? t('syncBtnStop') : t('syncBtnStart');
    } else {
      topBtn.hidden = true;
    }

    // Counts
    const activeVpCount = state.members.filter((m) => m.active).length;
    const pendingCount = state.decisions.filter((d) => d.status === 'pending').length;
    $('#nav-count-vp').textContent = String(state.members.length);
    const pendingBadge = $('#nav-count-pending');
    pendingBadge.textContent = String(pendingCount);
    pendingBadge.hidden = pendingCount === 0;

    // Menu Bar & Sidebar Hardware Status Sync
    const dotCls = `state-${state.hwState}`;
    const stateLabelMap = {
      ready: t('stateReady'),
      input: t('stateInput'),
      visitor: t('stateVisitor'),
      mute: t('stateMute')
    };
    const subMap = {
      ready: t('hwSubReady'),
      input: t('hwSubInput'),
      visitor: t('hwSubVisitor'),
      mute: t('hwSubMute')
    };
    const pillClsMap = {
      ready: 'pill-ready',
      input: 'pill-input',
      visitor: 'pill-visitor',
      mute: 'pill-mute'
    };

    $('#mb-status-dot').className = `mb-status-dot ${dotCls}`;
    $('#mb-status-label').textContent = stateLabelMap[state.hwState];
    $('#sidebar-led-dot').className = `led-dot ${dotCls}`;
    $('#sidebar-hw-label').textContent = state.hwState === 'mute'
      ? (state.lang === 'zh' ? '本机 Bar 已物理静音' : 'Local Bar hardware muted')
      : (state.lang === 'zh' ? `${activeVpCount} 位声纹在线 · 4 台 Bar` : `${activeVpCount} voiceprints · 4 Bars`);

    $('#mbp-sub').textContent = subMap[state.hwState];
    $('#mbp-pill').className = `status-pill ${pillClsMap[state.hwState]}`;
    $('#mbp-pill').textContent = stateLabelMap[state.hwState];
    $('#mbp-bar-img').src = hwImageForState(state.hwState);
    $('#mbp-enrolled-count').textContent = `${activeVpCount} / ${state.members.length}`;
    $('#mbp-pending-count').textContent = String(pendingCount);
    $('#mbp-blocked-count').textContent = String(state.blockedVisitorsToday);
  }

  /* ---------- Hardware Simulator State Setter ---------- */
  function setHardwareSimulation(mode, speakerId = null) {
    const prevMute = state.hwState === 'mute';
    if (mode === 'mute' || (prevMute && mode !== 'mute')) {
      playTactileClick(mode === 'mute');
    }
    state.hwState = mode;
    state.activeSpeakerId = speakerId;
    if (mode === 'visitor') {
      state.blockedVisitorsToday += 1;
    }
    syncChrome();
    if (state.activeTab === 'voiceprints') {
      renderCurrentView();
    }
  }

  /* ---------- Floating macOS Top-Right Capture Card ---------- */
  function showFloatingDecisionCard(decisionId) {
    const dec = state.decisions.find((d) => d.id === decisionId) || state.decisions[0];
    if (!dec) return;
    const fc = $('#floating-card');
    const owner = memberById(dec.ownerId);
    const allConfirmed = dec.participants.every((p) => p.confirmed);
    const pNames = dec.participants.map((p) => memberById(p.memberId)?.name.split(' ')[0] || '').join(' & ');

    fc.hidden = false;
    fc.innerHTML = `
      <div class="fc-top">
        <span class="fc-app">
          <img src="assets/monogram.svg" alt="" width="12" height="15">
          <span>${t('fcHeaderDecision')}</span>
        </span>
        <button type="button" class="fc-close" id="fc-close-btn" aria-label="Close">×</button>
      </div>
      <div class="fc-title">${escapeHtml(pick(dec.title))}</div>
      <div class="fc-meta">
        <span><b>${t('ownerLabel')}:</b> ${owner ? escapeHtml(owner.name) : t('unassigned')}</span>
        <span><b>${t('dueLabel')}:</b> ${escapeHtml(pick(dec.due))}</span>
      </div>
      <div class="fc-privacy ${allConfirmed ? 'is-synced' : ''}">
        ${allConfirmed
          ? `✓ ${state.lang === 'zh' ? '双方已确认 · 已同步 Linear / Notion / Slack' : 'Confirmed · Synced to Linear, Notion & Slack'}`
          : `🔒 ${state.lang === 'zh' ? `仅 ${pNames} 可见，确认后进入团队空间` : `Private to ${pNames} until confirmed`}`
        }
      </div>
      <div class="fc-confirm-row">
        <div class="confirm-avatars">
          ${dec.participants.map((p) => {
            const m = memberById(p.memberId);
            const first = m ? m.name.split(' ')[0] : '?';
            return `
              <button type="button" class="confirm-person ${p.confirmed ? 'is-confirmed' : 'is-waiting'}" data-fc-confirm="${dec.id}:${p.memberId}">
                ${renderAvatar(m, true)}
                <span>${escapeHtml(first)} ${p.confirmed ? '✓' : `· ${t('clickToConfirm')}`}</span>
              </button>
            `;
          }).join('')}
        </div>
        <button type="button" class="btn-ghost btn-xs" id="fc-open-decisions">${t('fcOpenDetail')} →</button>
      </div>
    `;

    $('#fc-close-btn', fc).addEventListener('click', () => { fc.hidden = true; });
    $('#fc-open-decisions', fc).addEventListener('click', () => {
      fc.hidden = true;
      state.activeTab = 'decisions';
      state.highlightedDecisionId = dec.id;
      renderAll();
    });
    $$('[data-fc-confirm]', fc).forEach((btn) => {
      btn.addEventListener('click', () => {
        const [did, mid] = btn.dataset.fcConfirm.split(':');
        toggleParticipantConfirm(did, mid, true);
      });
    });
  }

  function showFloatingVisitorCard() {
    const fc = $('#floating-card');
    fc.hidden = false;
    fc.innerHTML = `
      <div class="fc-top">
        <span class="fc-app">
          <img src="assets/monogram.svg" alt="" width="12" height="15">
          <span>${t('fcHeaderVisitor')}</span>
        </span>
        <button type="button" class="fc-close" id="fc-close-btn" aria-label="Close">×</button>
      </div>
      <div class="fc-title">🛡️ ${t('fcVisitorTitle')}</div>
      <div class="fc-privacy is-visitor" style="margin-top:9px">
        ${t('fcVisitorBody')}
      </div>
    `;
    $('#fc-close-btn', fc).addEventListener('click', () => { fc.hidden = true; });
  }

  /* ---------- VIEW 1: VOICEPRINTS & LIVE HARDWARE PRIVACY SANDBOX ---------- */
  function renderVoiceprintsView() {
    const activeSpeaker = state.activeSpeakerId && state.activeSpeakerId !== 'visitor'
      ? memberById(state.activeSpeakerId)
      : null;

    let readoutSpeaker = t('readoutReadySpeaker');
    let readoutScore = '4s breathing LED';
    let readoutText = t('readoutReadyText');
    let pillCls = 'pill-ready';
    let pillText = t('stateReady');
    let readoutMode = state.hwState;

    if (state.hwState === 'input' && activeSpeaker) {
      if (!activeSpeaker.active) {
        readoutMode = 'visitor';
        readoutSpeaker = `${activeSpeaker.name} · ${t('readoutPausedSpeaker')}`;
        readoutScore = t('readoutPausedScore');
        readoutText = t('readoutPausedText');
        pillCls = 'pill-visitor';
        pillText = t('stateVisitor');
      } else {
        readoutSpeaker = `${activeSpeaker.name} (${pick(activeSpeaker.role)})`;
        readoutScore = `${t('readoutMatchScore')} ${activeSpeaker.confidence} · ${activeSpeaker.voiceHash}`;
        readoutText = pick(activeSpeaker.sampleUtterance);
        pillCls = 'pill-input';
        pillText = t('stateInput');
      }
    } else if (state.hwState === 'visitor') {
      readoutSpeaker = t('readoutVisitorSpeaker');
      readoutScore = t('readoutVisitorScore');
      readoutText = t('readoutVisitorText');
      pillCls = 'pill-visitor';
      pillText = t('stateVisitor');
    } else if (state.hwState === 'mute') {
      readoutSpeaker = t('readoutMuteSpeaker');
      readoutScore = t('readoutMuteScore');
      readoutText = t('readoutMuteText');
      pillCls = 'pill-mute';
      pillText = t('stateMute');
    }

    const q = state.vpSearch.trim().toLowerCase();
    const filteredMembers = state.members.filter((m) => {
      if (state.vpFilter === 'active' && !m.active) return false;
      if (state.vpFilter === 'paused' && m.active) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q)
        || pick(m.role).toLowerCase().includes(q)
        || m.voiceHash.toLowerCase().includes(q);
    });

    const waveBars = Array.from({ length: 24 }, (_, idx) => {
      const delay = ((idx % 7) * 0.08).toFixed(2);
      return `<i style="animation-delay:${delay}s"></i>`;
    }).join('');

    return `
      <!-- Top Live Hardware Privacy Sandbox -->
      <section class="card hardware-sandbox" aria-label="Live Hardware Privacy Simulator">
        <div class="hw-stage-box">
          <div class="hw-stage-header">
            <span class="hw-stage-name">
              <span class="led-dot state-${readoutMode}"></span>
              <span>Rutta Bar · ${finishLabel('silver')}</span>
            </span>
            <span class="status-pill ${pillCls}">${pillText}</span>
          </div>

          <div class="hw-photo-wrap">
            <img src="${hwImageForState(readoutMode)}" alt="Rutta Bar hardware close-up">
            <span class="hw-led-halo mode-${readoutMode}" aria-hidden="true"></span>
            <button type="button" class="hw-switch-hotspot" id="hw-switch-hotspot" title="${state.lang === 'zh' ? '点击拨动物理静音开关' : 'Click to toggle physical mute switch'}" aria-label="Physical mute switch"></button>
          </div>

          <div class="hw-stage-foot">
            <span>${readoutMode === 'ready' ? t('hwSubReady') : readoutMode === 'input' ? t('hwSubInput') : readoutMode === 'visitor' ? t('hwSubVisitor') : t('hwSubMute')}</span>
            <button type="button" class="hw-hint-link" id="hw-toggle-mute-link">${t('hwClickSwitchHint')}</button>
          </div>
        </div>

        <div class="sandbox-controls">
          <div>
            <div class="sandbox-eyebrow">${t('sandboxEyebrow')}</div>
            <h2 class="sandbox-title">${t('sandboxTitle')}</h2>
          </div>

          <div class="speaker-chips" role="group" aria-label="Simulate speaker">
            <button type="button" class="speaker-chip ${state.hwState === 'ready' ? 'is-active' : ''}" data-sim="ready">
              <span class="led-dot state-ready"></span>${t('chipStandby')}
            </button>
            ${state.members.slice(0, 4).map((m) => `
              <button type="button" class="speaker-chip ${state.hwState === 'input' && state.activeSpeakerId === m.id ? 'is-active' : ''}" data-sim-member="${m.id}">
                ${escapeHtml(m.name.split(' ')[0])}${!m.active ? ` (${t('statusPaused')})` : ''}
              </button>
            `).join('')}
            <button type="button" class="speaker-chip chip-visitor ${state.hwState === 'visitor' ? 'is-active' : ''}" data-sim="visitor">
              🛡️ ${t('chipVisitor')}
            </button>
            <button type="button" class="speaker-chip chip-mute ${state.hwState === 'mute' ? 'is-active' : ''}" data-sim="mute">
              🔇 ${t('chipMute')}
            </button>
          </div>

          <div class="live-readout mode-${readoutMode}">
            <div class="lr-top">
              <span class="lr-speaker">${escapeHtml(readoutSpeaker)}</span>
              <span class="lr-score">${escapeHtml(readoutScore)}</span>
            </div>
            <p class="lr-text">${escapeHtml(readoutText)}</p>
            <div class="live-mini-wave" aria-hidden="true">${waveBars}</div>
          </div>
        </div>
      </section>

      <!-- Enrolled Team Voiceprints Roster -->
      <section class="card roster-card" aria-label="Team Voiceprint Roster">
        <div class="roster-toolbar">
          <div>
            <h2 style="font-size:15.5px;font-weight:660;">${t('rosterTitle')}</h2>
            <p style="font-size:12.5px;color:var(--muted);margin-top:2px;">${t('rosterSub')}</p>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <div class="search-input-wrap">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14" stroke-linecap="round"/></svg>
              <input type="search" id="vp-search-input" value="${escapeHtml(state.vpSearch)}" placeholder="${escapeHtml(t('searchPlaceholder'))}">
            </div>
            <div class="filter-pills" role="group">
              <button type="button" class="filter-pill ${state.vpFilter === 'all' ? 'is-active' : ''}" data-vp-filter="all">${t('filterAll')} (${state.members.length})</button>
              <button type="button" class="filter-pill ${state.vpFilter === 'active' ? 'is-active' : ''}" data-vp-filter="active">${t('filterActive')}</button>
              <button type="button" class="filter-pill ${state.vpFilter === 'paused' ? 'is-active' : ''}" data-vp-filter="paused">${t('filterPaused')}</button>
            </div>
          </div>
        </div>

        <div class="vp-list">
          ${filteredMembers.length === 0
            ? `<div style="padding:36px 20px;text-align:center;color:var(--muted);">${t('emptyRoster')}</div>`
            : filteredMembers.map((m) => `
              <div class="vp-row ${m.active ? '' : 'is-paused'}">
                <div class="vp-member">
                  ${renderAvatar(m)}
                  <div style="min-width:0;">
                    <div class="vp-name">${escapeHtml(m.name)}</div>
                    <div class="vp-role">${escapeHtml(pick(m.role))}</div>
                  </div>
                </div>

                <div class="vp-sig">
                  <div class="vp-bars" aria-hidden="true">
                    ${m.bars.map((h) => `<span style="height:${Math.round(h * 0.17)}px"></span>`).join('')}
                  </div>
                  <div class="vp-hash">${escapeHtml(m.voiceHash)} · ${escapeHtml(m.confidence)}</div>
                </div>

                <div class="vp-device">
                  <span class="finish-dot swatch-${m.finish}"></span>
                  <span>${finishLabel(m.finish)} Bar</span>
                </div>

                <div>
                  <span class="status-pill ${m.active ? 'pill-ready' : 'pill-paused'}">
                    ${m.active ? t('statusActive') : t('statusPaused')}
                  </span>
                </div>

                <div class="vp-actions">
                  <button type="button" class="toggle-btn" role="switch" aria-checked="${m.active}" data-toggle-member="${m.id}" title="${m.active ? t('statusActive') : t('statusPaused')}"></button>
                  <button type="button" class="btn-soft btn-xs" data-test-member="${m.id}">${t('btnTestVoice')}</button>
                  <button type="button" class="btn-ghost btn-xs" data-reenroll-member="${m.id}">${t('btnReenroll')}</button>
                  <button type="button" class="btn-ghost btn-xs" style="color:var(--red)" data-delete-member="${m.id}">${t('btnDelete')}</button>
                </div>
              </div>
            `).join('')
          }
        </div>
      </section>
    `;
  }

  /* ---------- VIEW 2: DECISIONS, 2-PERSON CONFIRM & SOURCE QUOTES ---------- */
  function renderDecisionsView() {
    const filtered = state.decisions.filter((d) => {
      if (state.decFilter === 'all') return true;
      return d.status === state.decFilter;
    });

    const pendingCount = state.decisions.filter((d) => d.status === 'pending').length;
    const mondayCount = state.decisions.filter((d) => d.status === 'monday').length;

    return `
      <div class="decisions-toolbar">
        <div class="filter-pills" role="group">
          <button type="button" class="filter-pill ${state.decFilter === 'all' ? 'is-active' : ''}" data-dec-filter="all">${t('decFilterAll')} (${state.decisions.length})</button>
          <button type="button" class="filter-pill ${state.decFilter === 'pending' ? 'is-active' : ''}" data-dec-filter="pending">${t('decFilterPending')} (${pendingCount})</button>
          <button type="button" class="filter-pill ${state.decFilter === 'synced' ? 'is-active' : ''}" data-dec-filter="synced">${t('decFilterSynced')}</button>
          <button type="button" class="filter-pill ${state.decFilter === 'monday' ? 'is-active' : ''}" data-dec-filter="monday">${t('decFilterMonday')} (${mondayCount})</button>
        </div>
        <span style="font-size:12.5px;color:var(--muted);">${t('decHint')}</span>
      </div>

      <div class="decision-stack">
        ${filtered.map((dec) => {
          const owner = memberById(dec.ownerId);
          const isQuoteOpen = state.expandedQuoteId === dec.id;
          const isPlaying = playingQuoteId === dec.id;
          const badgeCls = dec.status === 'synced' ? 'pill-ready' : dec.status === 'monday' ? 'pill-mute' : 'pill-input';
          const badgeText = dec.status === 'synced' ? t('badgeSynced') : dec.status === 'monday' ? t('badgeMonday') : t('badgePending');

          return `
            <article class="card decision-card ${state.highlightedDecisionId === dec.id ? 'is-highlighted' : ''}" data-decision-id="${dec.id}">
              <div class="dc-header">
                <div>
                  <h3 class="dc-title">${escapeHtml(pick(dec.title))}</h3>
                  <p class="dc-summary">${escapeHtml(pick(dec.summary))}</p>
                </div>
                <span class="status-pill ${badgeCls}">${badgeText}</span>
              </div>

              <div class="dc-meta-row">
                ${dec.status === 'monday' && !owner
                  ? `<label style="display:inline-flex;align-items:center;gap:6px;">
                      <span style="color:var(--muted)">${t('ownerLabel')}:</span>
                      <select class="assign-select" data-assign-owner="${dec.id}">
                        <option value="">${t('assignOwnerPlaceholder')}</option>
                        ${state.members.filter((m) => m.active).map((m) => `<option value="${m.id}">${escapeHtml(m.name)}</option>`).join('')}
                      </select>
                    </label>`
                  : `<span class="dc-meta-chip">${renderAvatar(owner, true)} <span>${t('ownerLabel')}: <b>${owner ? escapeHtml(owner.name) : t('unassigned')}</b></span></span>`
                }
                <span class="dc-meta-chip">📅 ${t('dueLabel')}: <b>${escapeHtml(pick(dec.due))}</b></span>
                <span class="dc-meta-chip">🎙️ ${escapeHtml(pick(dec.context))}</span>
              </div>

              ${dec.visitorIgnoredCount > 0 ? `
                <div class="visitor-shield-banner">
                  <span>🛡️</span>
                  <span>${state.lang === 'zh'
                    ? `本段讨论中有 ${dec.visitorIgnoredCount} 位未加入访客发言，已自动过滤（未转写、未保存）`
                    : `${dec.visitorIgnoredCount} unenrolled visitor spoke during this session — automatically ignored (not transcribed or saved)`}</span>
                </div>
              ` : ''}

              <div class="dc-confirm-bar">
                ${dec.status === 'synced'
                  ? `<div class="sync-pills">
                      <span style="font-size:12px;color:var(--muted);margin-right:2px;">${t('syncedToPrefix')}</span>
                      ${dec.syncedTools.map((st, idx) => `<span class="sync-pill" style="animation-delay:${idx * 90}ms">✓ ${escapeHtml(st.tool)} · ${escapeHtml(st.detail)}</span>`).join('')}
                    </div>`
                  : `<div class="confirm-avatars">
                      <span style="font-size:12px;color:var(--muted);">${t('confirmPrompt')}</span>
                      ${dec.participants.map((p) => {
                        const m = memberById(p.memberId);
                        const first = m ? m.name.split(' ')[0] : '?';
                        return `
                          <button type="button" class="confirm-person ${p.confirmed ? 'is-confirmed' : 'is-waiting'}" data-confirm-part="${dec.id}:${p.memberId}">
                            ${renderAvatar(m, true)}
                            <span>${escapeHtml(first)} · ${p.confirmed ? `✓ ${t('confirmedTag')}` : t('clickToConfirm')}</span>
                          </button>
                        `;
                      }).join('')}
                    </div>`
                }

                <div class="dc-actions">
                  <button type="button" class="btn-soft btn-xs" data-toggle-quote="${dec.id}">
                    🎧 ${isQuoteOpen ? t('btnHideQuote') : `${t('btnQuote')} (${dec.quoteDuration})`}
                  </button>
                  <button type="button" class="btn-soft btn-xs" data-handoff-dec="${dec.id}">
                    ✦ ${t('btnHandoff')}
                  </button>
                  <button type="button" class="btn-ghost btn-xs" style="color:var(--red)" data-delete-dec="${dec.id}">
                    ${t('btnDeleteRec')}
                  </button>
                </div>
              </div>

              ${isQuoteOpen ? `
                <div class="quote-drawer">
                  <div class="qd-top">
                    <strong>${t('quoteHeader')}</strong>
                    <span class="qd-lock">${t('quoteLockNote')}</span>
                  </div>
                  <div class="qd-player">
                    <button type="button" class="qd-play-btn" data-play-quote="${dec.id}" aria-label="Play source clip">
                      ${isPlaying ? '❚❚' : '▶'}
                    </button>
                    <div class="qd-wave-track" id="qd-wave-${dec.id}">
                      ${Array.from({ length: 34 }, (_, i) => {
                        const h = 25 + ((i * 37 + 19) % 72);
                        const played = isPlaying && (i / 34) <= quotePlayPct;
                        return `<span class="${played ? 'is-played' : ''}" style="height:${h}%"></span>`;
                      }).join('')}
                    </div>
                    <span class="qd-time" id="qd-time-${dec.id}">${isPlaying ? formatClipTime(dec.quoteDuration, quotePlayPct) : `0:00 / ${dec.quoteDuration}`}</span>
                  </div>
                  <div class="qd-lines">
                    ${dec.quotes.map((q) => `
                      <div class="qd-line ${q.key ? 'is-key' : ''}">
                        <span class="qd-ts">${q.ts}</span>
                        <span class="qd-spk">${escapeHtml(q.speaker)}</span>
                        <span>${escapeHtml(pick(q))}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  function formatClipTime(totalStr, pct) {
    const parts = totalStr.split(':').map(Number);
    const totalSec = (parts[0] || 0) * 60 + (parts[1] || 12);
    const cur = Math.min(totalSec, Math.round(totalSec * pct));
    return `0:${String(cur).padStart(2, '0')} / ${totalStr}`;
  }

  /* ---------- VIEW 3: INTEGRATIONS & AGENT HANDOFF ---------- */
  function renderIntegrationsView() {
    const presets = state.lang === 'zh'
      ? [
          { id: 'client-email', label: '🎙️ “把刚才定的上线延期发给客户”' },
          { id: 'linear-task', label: '🎙️ “在 Linear 建好周四发版任务并 @Leo”' },
          { id: 'why-silver', label: '🎙️ “查一下之前为什么选了银色款？”' }
        ]
      : [
          { id: 'client-email', label: '🎙️ "Draft the Dec 10 launch update for the client"' },
          { id: 'linear-task', label: '🎙️ "Create Thursday’s Silver build ticket in Linear for Leo"' },
          { id: 'why-silver', label: '🎙️ "Why did the team pick the Silver prototype?"' }
        ];

    return `
      <section class="card agent-panel">
        <div class="section-head">
          <div>
            <h2>${t('agentTitle')}</h2>
            <p>${t('agentSub')}</p>
          </div>
          <span class="status-pill pill-ready">MCP Connected</span>
        </div>

        <form class="agent-input-row" id="agent-form">
          <input type="text" id="agent-input" placeholder="${escapeHtml(t('agentPlaceholder'))}" autocomplete="off">
          <button type="submit" class="btn-primary btn-accent">${t('agentRunBtn')}</button>
        </form>

        <div class="agent-presets">
          ${presets.map((p) => `<button type="button" class="preset-chip" data-agent-preset="${p.id}">${escapeHtml(p.label)}</button>`).join('')}
        </div>

        ${state.agentResult ? `
          <div class="agent-output">
            <div class="ao-head">
              <span class="ao-badge">✦ ${t('agentDraftLabel')}</span>
              <span style="font-size:12px;color:var(--muted);">${escapeHtml(state.agentResult.channel)}</span>
            </div>
            <div class="ao-cite">
              <span>📌</span>
              <span>${escapeHtml(state.agentResult.citation)}</span>
            </div>
            <div class="ao-body">${escapeHtml(state.agentResult.body)}</div>
            <div class="ao-foot">
              <span style="font-size:12px;color:var(--muted);">${state.lang === 'zh' ? '所有引用均来自已确认口头决定，未读取原始录音' : 'Grounded strictly in confirmed decisions · Zero raw audio read'}</span>
              <button type="button" class="btn-primary btn-sm ${state.agentApproved ? '' : 'btn-accent'}" id="agent-approve-btn" ${state.agentApproved ? 'disabled' : ''}>
                ${state.agentApproved ? t('agentApprovedDone') : t('agentApproveBtn')}
              </button>
            </div>
          </div>
        ` : ''}
      </section>

      <div class="section-head" style="margin-top:4px;">
        <div>
          <h2>${t('toolsTitle')}</h2>
          <p>${t('toolsSub')}</p>
        </div>
      </div>

      <section class="tools-grid">
        ${state.integrations.map((tool) => `
          <div class="card tool-card">
            <div class="tc-top">
              <div class="tc-id">
                <div class="tc-icon" style="background:${tool.color}">${escapeHtml(tool.letter)}</div>
                <div>
                  <div class="tc-name">${escapeHtml(tool.name)}</div>
                  <div class="tc-desc">${escapeHtml(pick(tool.desc))}</div>
                </div>
              </div>
              <button type="button" class="toggle-btn" role="switch" aria-checked="${tool.enabled}" data-toggle-tool="${tool.id}"></button>
            </div>
            <div class="tc-config">
              <span class="tc-uri">${escapeHtml(tool.target)}</span>
              ${tool.id === 'mcp'
                ? `<button type="button" class="btn-soft btn-xs" data-copy-mcp="${tool.target}">${t('btnCopyMcp')}</button>`
                : `<button type="button" class="btn-soft btn-xs" data-test-tool="${tool.id}" ${tool.enabled ? '' : 'disabled'}>${t('btnTestSync')}</button>`
              }
            </div>
          </div>
        `).join('')}
      </section>
    `;
  }

  /* ---------- VIEW 4: DEVICES (MULTI-BAR SYNC) & PRIVACY RULES ---------- */
  function renderDevicesView() {
    const finishesImg = {
      silver: 'assets/hero-silver.webp',
      sky: 'assets/hero-sky.webp',
      starlight: 'assets/hero-starlight.webp',
      midnight: 'assets/hero-midnight.webp'
    };

    const teamBars = state.members.slice(0, 4);

    return `
      <section class="card sync-banner ${state.multiBarSync ? 'is-syncing' : ''}">
        <div>
          <h2 style="font-size:15.5px;font-weight:660;">${t('syncTitle')}</h2>
          <p style="font-size:12.5px;color:var(--ink-2);margin-top:3px;">
            ${state.multiBarSync ? `✨ ${t('syncActiveMsg')}` : t('syncSub')}
          </p>
        </div>
        <button type="button" class="btn-primary ${state.multiBarSync ? '' : 'btn-accent'}" id="btn-toggle-multibar">
          ${state.multiBarSync ? t('syncBtnStop') : t('syncBtnStart')}
        </button>
      </section>

      <section class="bars-grid">
        ${teamBars.map((m, idx) => {
          const isMuted = m.barState === 'muted' && !state.multiBarSync;
          const isLid = m.barState === 'lid_closed';
          const isPulsing = state.multiBarSync && idx < 3;
          const ledState = isPulsing ? 'state-input' : isMuted ? 'state-mute' : 'state-ready';
          const statusLabel = isPulsing
            ? (state.lang === 'zh' ? '同频同步中' : 'Synced pulse')
            : isMuted
              ? t('stateMute')
              : isLid
                ? (state.lang === 'zh' ? '合盖待机' : 'Lid closed')
                : t('stateReady');

          return `
            <div class="card bar-card ${isPulsing ? 'is-synced-pulse' : ''}">
              <div class="bar-card-img">
                <span class="bar-sync-ring ${ledState}"></span>
                <img src="${finishesImg[m.finish]}" alt="${finishLabel(m.finish)} Rutta Bar">
              </div>
              <div>
                <div class="bar-owner">${escapeHtml(m.name)}</div>
                <div class="bar-model">${escapeHtml(m.barName)} · ${finishLabel(m.finish)}</div>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;">
                <span class="status-pill ${isPulsing ? 'pill-input' : isMuted ? 'pill-mute' : 'pill-ready'}">${statusLabel}</span>
                <span style="font-size:11.5px;color:var(--muted);">USB-C</span>
              </div>
            </div>
          `;
        }).join('')}
      </section>

      <section class="devices-bottom-grid">
        <div class="card lid-card ${state.hwState === 'mute' ? 'is-muted' : ''}">
          <div class="lid-visual">
            <img src="assets/closedside-1200.webp" alt="Rutta Bar attached to closed MacBook Air">
            <span class="lid-led-indicator" aria-hidden="true"></span>
          </div>
          <div class="lid-body">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
              <h3 style="font-size:14.5px;font-weight:660;">${t('lidTitle')}</h3>
              <span class="status-pill ${state.lidClosed ? 'pill-ready' : 'pill-input'}">
                ${state.lidClosed ? t('lidStatusClosed') : t('lidStatusOpen')}
              </span>
            </div>
            <p style="font-size:12.5px;color:var(--muted);line-height:1.5;">${t('lidSub')}</p>
            <div>
              <button type="button" class="btn-soft btn-sm" id="btn-toggle-lid">${t('lidToggleBtn')}</button>
            </div>
          </div>
        </div>

        <div class="card privacy-rules-card">
          <div class="section-head">
            <div>
              <h2>${t('privacyTitle')}</h2>
              <p>${t('privacySub')}</p>
            </div>
          </div>
          <div class="policy-list">
            ${state.policies.map((p) => `
              <div class="policy-item ${p.locked ? 'is-locked' : ''}">
                <div>
                  <div class="policy-title">
                    <span>${escapeHtml(pick(p.title))}</span>
                    ${p.locked ? `<span class="lock-tag">🔒 ${t('lockedBadge')}</span>` : ''}
                  </div>
                  <div class="policy-desc">${escapeHtml(pick(p.desc))}</div>
                </div>
                <button type="button" class="toggle-btn" role="switch" aria-checked="${p.enabled}" ${p.locked ? 'disabled' : ''} data-toggle-policy="${p.id}"></button>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  /* ---------- Render Orchestrator & View Bindings ---------- */
  function renderCurrentView() {
    const root = $('#view-container');
    if (state.activeTab === 'voiceprints') {
      root.innerHTML = renderVoiceprintsView();
      bindVoiceprintsEvents(root);
    } else if (state.activeTab === 'decisions') {
      root.innerHTML = renderDecisionsView();
      bindDecisionsEvents(root);
    } else if (state.activeTab === 'integrations') {
      root.innerHTML = renderIntegrationsView();
      bindIntegrationsEvents(root);
    } else {
      root.innerHTML = renderDevicesView();
      bindDevicesEvents(root);
    }
  }

  function renderAll() {
    syncChrome();
    renderCurrentView();
  }

  /* ---------- View Event Bindings ---------- */
  function bindVoiceprintsEvents(root) {
    const toggleMute = () => {
      if (state.hwState === 'mute') {
        setHardwareSimulation('ready', null);
      } else {
        setHardwareSimulation('mute', null);
      }
    };
    $('#hw-switch-hotspot', root)?.addEventListener('click', toggleMute);
    $('#hw-toggle-mute-link', root)?.addEventListener('click', toggleMute);

    $$('[data-sim]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.sim;
        setHardwareSimulation(mode, mode === 'visitor' ? 'visitor' : null);
        if (mode === 'visitor') {
          showFloatingVisitorCard();
        }
      });
    });

    $$('[data-sim-member]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        setHardwareSimulation('input', btn.dataset.simMember);
      });
    });

    const searchInput = $('#vp-search-input', root);
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.vpSearch = e.target.value;
        const pos = e.target.selectionStart;
        renderCurrentView();
        const next = $('#vp-search-input');
        if (next) {
          next.focus();
          next.setSelectionRange(pos, pos);
        }
      });
    }

    $$('[data-vp-filter]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        state.vpFilter = btn.dataset.vpFilter;
        renderCurrentView();
      });
    });

    $$('[data-toggle-member]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const m = memberById(btn.dataset.toggleMember);
        if (!m) return;
        m.active = !m.active;
        showToast(
          state.lang === 'zh'
            ? `${m.name} 声纹已${m.active ? '重新启用' : '暂停（发言将按访客忽略）'}`
            : `${m.name}'s voiceprint ${m.active ? 're-enabled' : 'paused (treated as visitor)'}`
        );
        renderAll();
      });
    });

    $$('[data-test-member]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.testMember;
        setHardwareSimulation('input', id);
        $('.hardware-sandbox')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });

    $$('[data-reenroll-member]', root).forEach((btn) => {
      btn.addEventListener('click', () => openEnrollModal(btn.dataset.reenrollMember));
    });

    $$('[data-delete-member]', root).forEach((btn) => {
      btn.addEventListener('click', () => openDeleteModal(btn.dataset.deleteMember));
    });
  }

  function bindDecisionsEvents(root) {
    $$('[data-dec-filter]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        state.decFilter = btn.dataset.decFilter;
        renderCurrentView();
      });
    });

    $$('[data-confirm-part]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const [did, mid] = btn.dataset.confirmPart.split(':');
        toggleParticipantConfirm(did, mid, false);
      });
    });

    $$('[data-toggle-quote]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.toggleQuote;
        stopQuotePlayback();
        state.expandedQuoteId = state.expandedQuoteId === id ? null : id;
        renderCurrentView();
      });
    });

    $$('[data-play-quote]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.playQuote;
        if (playingQuoteId === id) {
          stopQuotePlayback();
          renderCurrentView();
        } else {
          startQuotePlayback(id);
        }
      });
    });

    $$('[data-handoff-dec]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const dec = state.decisions.find((d) => d.id === btn.dataset.handoffDec);
        if (!dec) return;
        state.activeTab = 'integrations';
        renderAll();
        runAgentPrompt(
          state.lang === 'zh'
            ? `基于「${pick(dec.title)}」起草同步邮件和任务更新`
            : `Draft team update and action items for "${pick(dec.title)}"`,
          dec
        );
      });
    });

    $$('[data-assign-owner]', root).forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const memberId = e.target.value;
        if (!memberId) return;
        const dec = state.decisions.find((d) => d.id === sel.dataset.assignOwner);
        const m = memberById(memberId);
        if (!dec || !m) return;
        dec.ownerId = memberId;
        dec.status = 'synced';
        showToast(
          state.lang === 'zh'
            ? `已指派给 ${m.name} 并同步至 Linear`
            : `Assigned to ${m.name} & synced to Linear`
        );
        renderAll();
      });
    });

    $$('[data-delete-dec]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = state.decisions.findIndex((d) => d.id === btn.dataset.deleteDec);
        if (idx === -1) return;
        const removed = state.decisions.splice(idx, 1)[0];
        lastDeletedDecision = { item: removed, idx };
        renderAll();
        showToast(
          state.lang === 'zh' ? '已删除该条记录（含关联原话片段）' : 'Record & source clip permanently deleted',
          t('undo'),
          () => {
            if (lastDeletedDecision) {
              state.decisions.splice(lastDeletedDecision.idx, 0, lastDeletedDecision.item);
              lastDeletedDecision = null;
              renderAll();
            }
          }
        );
      });
    });
  }

  function bindIntegrationsEvents(root) {
    $('#agent-form', root)?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#agent-input', root);
      const val = input.value.trim();
      if (!val) return;
      runAgentPrompt(val);
    });

    $$('[data-agent-preset]', root).forEach((btn) => {
      btn.addEventListener('click', () => runAgentPreset(btn.dataset.agentPreset));
    });

    $('#agent-approve-btn', root)?.addEventListener('click', () => {
      state.agentApproved = true;
      renderCurrentView();
      showToast(state.lang === 'zh' ? 'Agent 动作已发送并记录出处' : 'Agent action approved & dispatched');
    });

    $$('[data-toggle-tool]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const tool = state.integrations.find((x) => x.id === btn.dataset.toggleTool);
        if (!tool) return;
        tool.enabled = !tool.enabled;
        renderCurrentView();
        showToast(`${tool.name} ${tool.enabled ? (state.lang === 'zh' ? '已连接' : 'connected') : (state.lang === 'zh' ? '已断开' : 'disconnected')}`);
      });
    });

    $$('[data-test-tool]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const tool = state.integrations.find((x) => x.id === btn.dataset.testTool);
        if (!tool) return;
        showToast(state.lang === 'zh' ? `✓ 已向 ${tool.name}（${tool.target}）发送测试卡片` : `✓ Test decision synced to ${tool.name} (${tool.target})`);
      });
    });

    $$('[data-copy-mcp]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const uri = btn.dataset.copyMcp;
        navigator.clipboard?.writeText(uri).catch(() => {});
        showToast(state.lang === 'zh' ? `已复制 MCP 地址：${uri}` : `Copied MCP URI: ${uri}`);
      });
    });
  }

  function bindDevicesEvents(root) {
    $('#btn-toggle-multibar', root)?.addEventListener('click', () => {
      state.multiBarSync = !state.multiBarSync;
      if (state.multiBarSync) {
        state.hwState = 'input';
      } else {
        state.hwState = 'ready';
      }
      renderAll();
    });

    $('#btn-toggle-lid', root)?.addEventListener('click', () => {
      state.lidClosed = !state.lidClosed;
      renderCurrentView();
    });

    $$('[data-toggle-policy]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = state.policies.find((x) => x.id === btn.dataset.togglePolicy);
        if (!p || p.locked) return;
        p.enabled = !p.enabled;
        renderCurrentView();
      });
    });
  }

  /* ---------- Two-Party Confirmation Logic ---------- */
  function toggleParticipantConfirm(decisionId, memberId, fromFloatingCard) {
    const dec = state.decisions.find((d) => d.id === decisionId);
    if (!dec) return;
    const part = dec.participants.find((p) => p.memberId === memberId);
    if (!part) return;
    part.confirmed = !part.confirmed;
    const allDone = dec.participants.every((p) => p.confirmed);
    if (allDone) {
      dec.status = 'synced';
      showToast(
        state.lang === 'zh'
          ? '✓ 双方已确认 · 已自动同步至 Linear / Notion / Slack'
          : '✓ Confirmed by both · Synced to Linear, Notion & Slack'
      );
    }
    renderAll();
    if (fromFloatingCard) {
      showFloatingDecisionCard(decisionId);
    }
  }

  /* ---------- Quote Playback Scrubber ---------- */
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
      if (quotePlayPct >= 1) {
        stopQuotePlayback();
        renderCurrentView();
        return;
      }
      const wave = $(`#qd-wave-${decisionId}`);
      const timeEl = $(`#qd-time-${decisionId}`);
      const dec = state.decisions.find((d) => d.id === decisionId);
      if (wave) {
        const bars = $$('span', wave);
        bars.forEach((b, i) => b.classList.toggle('is-played', (i / bars.length) <= quotePlayPct));
      }
      if (timeEl && dec) {
        timeEl.textContent = formatClipTime(dec.quoteDuration, quotePlayPct);
      }
    }, 160);
  }

  /* ---------- Agent Handoff Generator (Demo Scene E & F7) ---------- */
  function runAgentPreset(presetId) {
    const map = {
      'client-email': {
        zh: {
          channel: '草稿目标 · Gmail / Slack #client-updates',
          citation: '引用口头决定：上线日期延后至 12 月 10 日（Maya & Leo · 14:19）',
          body: 'Hi 团队：\n\n刚和工程侧确认，为了让最终联调更稳妥，我们将上线日期从 12 月 3 日调整至 12 月 10 日。Linear 里程碑（RUT-48）与关联发布计划已由 Leo 同步顺延一周。\n\n如有外部节奏需要提前对齐，欢迎随时回复。\n— Northstar 团队'
        },
        en: {
          channel: 'Draft target · Gmail / Slack #client-updates',
          citation: 'Cited decision: Move launch date from Dec 3 to Dec 10 (Maya & Leo · 14:19)',
          body: 'Hi team,\n\nQuick update from our desk review: we’re moving our target launch from Dec 3 to Dec 10 to give final QA a clean buffer. Leo has shifted the Linear milestone (RUT-48) and dependent tasks accordingly.\n\nLet us know if any external schedules need adjustment.\n— Northstar Studio'
        }
      },
      'linear-task': {
        zh: {
          channel: '草稿目标 · Linear (Rutta Core)',
          citation: '引用口头决定：周五用户测试统一采用银色样机（Maya & Leo · 10:42）',
          body: '标题：[RUT-54] 准备周五银色（Silver）样机测试包\n负责人：@Leo Park\n截止时间：周四 12:00\n上下文：设计评审确认首轮用户测试使用银色版本，需在周四中午前同步至测试团队。'
        },
        en: {
          channel: 'Draft target · Linear (Rutta Core)',
          citation: 'Cited decision: Use Silver prototype for Friday’s user test (Maya & Leo · 10:42)',
          body: 'Title: [RUT-54] Deliver Silver prototype test build\nAssignee: @Leo Park\nDue: Thursday 12:00 PM\nContext: Confirmed during design review that Friday user tests will run on the Silver finish.'
        }
      },
      'why-silver': {
        zh: {
          channel: '知识库溯源 · Notion + MCP 检索',
          citation: '命中 3 天前设计评审记录（10:42:09 · Leo & Maya）',
          body: '原因汇总：\n1. 评审对比了银色、天蓝、星光、午夜四款阳极氧化样品，团队认为银色与 MacBook Air 原机侧边融合度最高。\n2. Leo 当场确认周四中午前可优先交付银色版测试包。\n3. 相关记录已双人确认并同步至 Notion《Hardware Review》与 Linear #RUT-42。'
        },
        en: {
          channel: 'Decision Audit · Notion + MCP Lookup',
          citation: 'Matched Design Review 3 days ago (10:42:09 · Leo & Maya)',
          body: 'Why Silver was chosen:\n1. After comparing all four anodized finishes (Silver, Sky Blue, Starlight, Midnight), Silver matched the reference MacBook Air edge most seamlessly.\n2. Leo committed to shipping the Silver test build by Thursday noon.\n3. Confirmed by both Maya & Leo and logged in Notion (Hardware Review) & Linear #RUT-42.'
        }
      }
    };
    const chosen = map[presetId]?.[state.lang];
    if (!chosen) return;
    state.agentApproved = false;
    state.agentResult = chosen;
    renderCurrentView();
  }

  function runAgentPrompt(promptText, linkedDecision = null) {
    const dec = linkedDecision || state.decisions[0];
    state.agentApproved = false;
    state.agentResult = {
      channel: state.lang === 'zh' ? 'Agent 响应 · MCP 实时上下文' : 'Agent Output · Live MCP Context',
      citation: state.lang === 'zh'
        ? `已引用决定：${pick(dec.title)}（${pick(dec.context)}）`
        : `Cited decision: ${pick(dec.title)} (${pick(dec.context)})`,
      body: state.lang === 'zh'
        ? `已根据你的指令「${promptText}」整理动作草稿：\n\n• 核心变更：${pick(dec.title)}\n• 负责人：${memberById(dec.ownerId)?.name || '待指派'} · 截止：${pick(dec.due)}\n• 下一步：同步通知团队频道并更新关联 Linear 任务状态。`
        : `Prepared action draft for "${promptText}":\n\n• Verified decision: ${pick(dec.title)}\n• Owner: ${memberById(dec.ownerId)?.name || 'Unassigned'} · Due: ${pick(dec.due)}\n• Next step: Post update to #product-updates and sync Linear ticket.`
    };
    renderCurrentView();
  }

  /* ---------- Voiceprint Enrollment Modal ---------- */
  function openEnrollModal(memberId = null) {
    reenrollMemberId = memberId;
    sampledVoiceReady = false;
    stopVoiceSampling();

    const modal = $('#enroll-modal');
    const nameInput = $('#enroll-name');
    const roleInput = $('#enroll-role');
    const m = memberId ? memberById(memberId) : null;

    $('#enroll-modal-title').textContent = m ? `${t('enrollTitleReenroll')} · ${m.name}` : t('enrollTitle');
    nameInput.value = m ? m.name : '';
    roleInput.value = m ? pick(m.role) : '';
    nameInput.disabled = Boolean(m);

    const targetFinish = m ? m.finish : 'silver';
    $$('#enroll-finish-selector .finish-chip').forEach((chip) => {
      chip.classList.toggle('is-selected', chip.dataset.finish === targetFinish);
    });

    $('#vc-quote').textContent = state.lang === 'zh'
      ? `“我是 ${m ? m.name : '团队新成员'}，同意加入 Rutta Bar 工作空间，只记录我参与的工作决定。”`
      : `"Hi Rutta, I'm ${m ? m.name : 'a teammate'}. Only capture work decisions when I'm enrolled."`;

    const box = $('#voice-capture-box');
    box.dataset.state = 'idle';
    $('#vc-status-text').textContent = t('vcIdle');
    $('#vc-pct').textContent = '0%';
    $('#vc-progress-bar').style.width = '0%';
    $('#btn-sample-label').textContent = t('vcStartBtn');
    $('#enroll-save').disabled = true;

    const wave = $('#vc-wave');
    wave.innerHTML = Array.from({ length: 28 }, () => '<span></span>').join('');

    modal.hidden = false;
    if (!m) nameInput.focus();
  }

  function stopVoiceSampling() {
    if (sampleTimer) clearInterval(sampleTimer);
    sampleTimer = null;
    if (micStream) {
      micStream.getTracks().forEach((tr) => tr.stop());
      micStream = null;
    }
  }

  function startVoiceSampling(useRealMic = false) {
    stopVoiceSampling();
    const box = $('#voice-capture-box');
    box.dataset.state = 'sampling';
    $('#vc-status-text').textContent = t('vcSampling');
    const bars = $$('#vc-wave span');
    let pct = 0;

    const runLoop = (analyser = null) => {
      const dataArr = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
      sampleTimer = setInterval(() => {
        pct = Math.min(100, pct + 4);
        $('#vc-pct').textContent = `${pct}%`;
        $('#vc-progress-bar').style.width = `${pct}%`;
        if (analyser && dataArr) {
          analyser.getByteFrequencyData(dataArr);
        }
        bars.forEach((bar, i) => {
          const val = dataArr
            ? Math.max(8, Math.min(40, (dataArr[i % dataArr.length] / 255) * 44))
            : 8 + Math.round(Math.random() * 32);
          bar.style.height = `${val}px`;
        });
        if (pct >= 100) {
          stopVoiceSampling();
          sampledVoiceReady = true;
          box.dataset.state = 'done';
          $('#vc-status-text').textContent = t('vcDone');
          $('#btn-sample-label').textContent = t('vcResampleBtn');
          $('#enroll-save').disabled = false;
          bars.forEach((bar, i) => {
            bar.style.height = `${12 + ((i * 19 + 7) % 24)}px`;
          });
        }
      }, 105);
    };

    if (useRealMic && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          micStream = stream;
          const AC = window.AudioContext || window.webkitAudioContext;
          const ctx = new AC();
          const src = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          src.connect(analyser);
          runLoop(analyser);
        })
        .catch(() => {
          showToast(state.lang === 'zh' ? '未开启麦克风权限，已自动切换为模拟采样' : 'Mic unavailable—running simulated voice sample');
          runLoop(null);
        });
    } else {
      runLoop(null);
    }
  }

  function saveEnrolledMember() {
    if (!sampledVoiceReady) return;
    const name = $('#enroll-name').value.trim() || (state.lang === 'zh' ? '新成员' : 'New Member');
    const role = $('#enroll-role').value.trim() || (state.lang === 'zh' ? '产品研发' : 'Product Team');
    const finish = $('#enroll-finish-selector .finish-chip.is-selected')?.dataset.finish || 'silver';
    const randBars = Array.from({ length: 12 }, () => 36 + Math.round(Math.random() * 60));

    if (reenrollMemberId) {
      const m = memberById(reenrollMemberId);
      if (m) {
        m.role = { zh: role, en: role };
        m.finish = finish;
        m.bars = randBars;
        m.active = true;
        m.confidence = '98.8%';
        showToast(state.lang === 'zh' ? `✓ ${m.name} 声纹已重新校准` : `✓ ${m.name}'s voiceprint re-calibrated`);
      }
    } else {
      const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'RB';
      const palette = ['#2563EB', '#0F766E', '#7C3AED', '#EA580C', '#0284C7'];
      const hash = 'VP-' + Math.random().toString(16).slice(2, 6).toUpperCase();
      const newMember = {
        id: 'm-' + Date.now(),
        name,
        role: { zh: role, en: role },
        avatar: null,
        initials,
        color: palette[state.members.length % palette.length],
        finish,
        barName: `${name.split(' ')[0]}'s MacBook Air`,
        barState: 'online',
        voiceHash: hash,
        confidence: '98.6%',
        active: true,
        bars: randBars,
        sampleUtterance: {
          zh: `“我是 ${name}，这个需求我来跟进，周三下午前把方案放进 Notion。”`,
          en: `"I'm ${name}—I'll own this follow-up and drop the spec in Notion by Wednesday."`
        }
      };
      state.members.unshift(newMember);
      setHardwareSimulation('input', newMember.id);
      showToast(state.lang === 'zh' ? `✓ 已为 ${name} 生成声纹（${hash}）并加入白名单` : `✓ Enrolled ${name} (${hash}) into voiceprint whitelist`);
    }

    $('#enroll-modal').hidden = true;
    renderAll();
  }

  /* ---------- Delete Voiceprint Modal ---------- */
  function openDeleteModal(memberId) {
    const m = memberById(memberId);
    if (!m) return;
    pendingDeleteMemberId = memberId;
    $('#delete-desc').textContent = state.lang === 'zh'
      ? `确定移除「${m.name}」（${m.voiceHash}）的声纹吗？`
      : `Remove voiceprint for "${m.name}" (${m.voiceHash})?`;
    $('#delete-modal').hidden = false;
  }

  function confirmDeleteMember() {
    if (!pendingDeleteMemberId) return;
    const idx = state.members.findIndex((m) => m.id === pendingDeleteMemberId);
    if (idx !== -1) {
      const removed = state.members.splice(idx, 1)[0];
      if (state.activeSpeakerId === removed.id) {
        state.hwState = 'ready';
        state.activeSpeakerId = null;
      }
      showToast(
        state.lang === 'zh'
          ? `已彻底销毁 ${removed.name} 的声纹，后续发言将按访客丢弃`
          : `Deleted ${removed.name}'s voiceprint — future speech will be ignored`
      );
    }
    pendingDeleteMemberId = null;
    $('#delete-modal').hidden = true;
    renderAll();
  }

  /* ---------- Demo Director: 1-Click Video Shot Triggers ---------- */
  function runDirectorShot(shot) {
    $('#director-drawer').hidden = true;

    if (shot === 'sceneA') {
      state.activeTab = 'decisions';
      state.decFilter = 'all';
      const dec = state.decisions.find((d) => d.id === 'dec-launch');
      if (dec) {
        dec.status = 'pending';
        dec.participants[0].confirmed = true;
        dec.participants[1].confirmed = false;
        state.highlightedDecisionId = dec.id;
      }
      state.hwState = 'input';
      state.activeSpeakerId = 'maya';
      renderAll();
      showFloatingDecisionCard('dec-launch');
      return;
    }

    if (shot === 'sceneD') {
      state.activeTab = 'voiceprints';
      setHardwareSimulation('visitor', 'visitor');
      renderAll();
      showFloatingVisitorCard();
      return;
    }

    if (shot === 'sceneC') {
      state.activeTab = 'decisions';
      state.decFilter = 'all';
      state.expandedQuoteId = 'dec-silver';
      state.highlightedDecisionId = 'dec-silver';
      $('#floating-card').hidden = true;
      renderAll();
      startQuotePlayback('dec-silver');
      return;
    }

    if (shot === 'sceneE') {
      state.activeTab = 'integrations';
      $('#floating-card').hidden = true;
      renderAll();
      runAgentPreset('client-email');
      return;
    }

    if (shot === 'sceneL4') {
      state.activeTab = 'devices';
      state.multiBarSync = true;
      state.hwState = 'input';
      $('#floating-card').hidden = true;
      renderAll();
      return;
    }

    if (shot === 'sceneS1') {
      state.activeTab = 'voiceprints';
      $('#floating-card').hidden = true;
      setHardwareSimulation('mute', null);
      renderAll();
    }
  }

  /* ---------- Global Wiring ---------- */
  function initGlobalEvents() {
    // Sidebar nav
    $$('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        stopQuotePlayback();
        state.activeTab = btn.dataset.tab;
        state.highlightedDecisionId = null;
        renderAll();
      });
    });

    // Language toggle
    $$('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.lang = btn.dataset.lang;
        if (state.agentResult) runAgentPreset('client-email');
        renderAll();
      });
    });

    // Topbar Primary CTA
    $('#topbar-primary-btn').addEventListener('click', () => {
      if (state.activeTab === 'voiceprints') {
        openEnrollModal(null);
      } else if (state.activeTab === 'decisions') {
        runDirectorShot('sceneA');
      } else if (state.activeTab === 'devices') {
        state.multiBarSync = !state.multiBarSync;
        state.hwState = state.multiBarSync ? 'input' : 'ready';
        renderAll();
      }
    });

    // Menu bar popover
    const mbBtn = $('#menubar-rutta-btn');
    const mbPop = $('#menubar-popover');
    mbBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = mbPop.hidden;
      mbPop.hidden = !willOpen;
      mbBtn.setAttribute('aria-expanded', String(willOpen));
    });
    document.addEventListener('click', (e) => {
      if (!mbPop.hidden && !mbPop.contains(e.target) && !mbBtn.contains(e.target)) {
        mbPop.hidden = true;
        mbBtn.setAttribute('aria-expanded', 'false');
      }
    });
    $('#mbp-toggle-mute').addEventListener('click', () => {
      setHardwareSimulation(state.hwState === 'mute' ? 'ready' : 'mute', null);
    });
    $('#mbp-trigger-card').addEventListener('click', () => {
      mbPop.hidden = true;
      mbBtn.setAttribute('aria-expanded', 'false');
      showFloatingDecisionCard('dec-launch');
    });

    // Enroll modal
    $('#enroll-close').addEventListener('click', () => { stopVoiceSampling(); $('#enroll-modal').hidden = true; });
    $('#enroll-cancel').addEventListener('click', () => { stopVoiceSampling(); $('#enroll-modal').hidden = true; });
    $('#enroll-modal').addEventListener('click', (e) => {
      if (e.target === $('#enroll-modal')) { stopVoiceSampling(); $('#enroll-modal').hidden = true; }
    });
    $$('#enroll-finish-selector .finish-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        $$('#enroll-finish-selector .finish-chip').forEach((c) => c.classList.remove('is-selected'));
        chip.classList.add('is-selected');
      });
    });
    $('#btn-start-sample').addEventListener('click', () => startVoiceSampling(false));
    $('#btn-mic-sample').addEventListener('click', () => startVoiceSampling(true));
    $('#enroll-save').addEventListener('click', saveEnrolledMember);
    $('#enroll-name').addEventListener('input', (e) => {
      const val = e.target.value.trim();
      $('#vc-quote').textContent = state.lang === 'zh'
        ? `“我是 ${val || '团队新成员'}，同意加入 Rutta Bar 工作空间，只记录我参与的工作决定。”`
        : `"Hi Rutta, I'm ${val || 'a teammate'}. Only capture work decisions when I'm enrolled."`;
    });

    // Delete modal
    $('#delete-close').addEventListener('click', () => { $('#delete-modal').hidden = true; });
    $('#delete-cancel').addEventListener('click', () => { $('#delete-modal').hidden = true; });
    $('#delete-confirm').addEventListener('click', confirmDeleteMember);

    // Director Drawer
    $('#director-trigger').addEventListener('click', () => {
      $('#director-drawer').hidden = !$('#director-drawer').hidden;
    });
    $('#director-close').addEventListener('click', () => {
      $('#director-drawer').hidden = true;
    });
    $$('.dd-shot').forEach((btn) => {
      btn.addEventListener('click', () => runDirectorShot(btn.dataset.shot));
    });
    $('#toggle-menubar').addEventListener('change', (e) => {
      state.showMenubar = e.target.checked;
      syncChrome();
    });
    $('#toggle-sound').addEventListener('change', (e) => {
      state.soundEnabled = e.target.checked;
    });
    $('#dd-clean-mode').addEventListener('click', () => {
      state.cleanShot = true;
      $('#director-drawer').hidden = true;
      syncChrome();
      showToast(state.lang === 'zh' ? '已进入纯净录屏模式，按 H 恢复导演台' : 'Clean recording mode ON — press H to restore');
    });
    $('#dd-reset').addEventListener('click', () => {
      const keepLang = state.lang;
      stopQuotePlayback();
      state = window.createInitialRuttaState();
      state.lang = keepLang;
      $('#floating-card').hidden = true;
      $('#director-drawer').hidden = true;
      renderAll();
      showToast(state.lang === 'zh' ? '演示数据已重置' : 'Demo state reset');
    });

    // Keyboard shortcuts for content shooting
    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'Escape') {
        $('#enroll-modal').hidden = true;
        $('#delete-modal').hidden = true;
        $('#director-drawer').hidden = true;
        $('#floating-card').hidden = true;
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

  // Warm-cache secondary hardware renders in background so tab/state switches feel instant on public URL
  window.addEventListener('load', () => {
    [
      'assets/switch-photo-input.webp',
      'assets/switch-photo-mute.webp',
      'assets/hero-silver.webp',
      'assets/hero-sky.webp',
      'assets/hero-starlight.webp',
      'assets/hero-midnight.webp',
      'assets/closedside-1200.webp'
    ].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  });
})();
