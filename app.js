/* Rutta Bar · Calm Editorial Interactive Controller */
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

  const ICONS = {
    plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 3.2v9.6M3.2 8h9.6"/></svg>',
    search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="4.4"/><path d="M10.4 10.4L13.6 13.6" stroke-linecap="round"/></svg>',
    shield: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round"><path d="M8 2.2L3 4.2v3.6c0 3.1 2.1 5.1 5 6 2.9-.9 5-2.9 5-6V4.2L8 2.2z"/></svg>',
    play: '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M3 2.2l7 3.8-7 3.8V2.2z"/></svg>',
    pause: '<svg viewBox="0 0 12 12" fill="currentColor"><rect x="2.5" y="2.2" width="2.4" height="7.6" rx="0.6"/><rect x="7.1" y="2.2" width="2.4" height="7.6" rx="0.6"/></svg>',
    lock: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6.3" width="8" height="5.5" rx="1.4"/><path d="M4.8 6.3V4.6a2.2 2.2 0 014.4 0v1.7"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>'
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
    return {
      silver: t('finishSilver'),
      sky: t('finishSky'),
      starlight: t('finishStarlight'),
      midnight: t('finishMidnight')
    }[finish] || finish;
  }

  function renderAvatar(member, small = false) {
    const cls = small ? 'avatar avatar-sm' : 'avatar';
    if (!member) return `<span class="${cls}">?</span>`;
    if (member.avatar) return `<img class="${cls}" src="${member.avatar}" alt="${esc(member.name)}">`;
    return `<span class="${cls}" style="background:${member.tone || '#E5E1D8'}">${esc(member.initials)}</span>`;
  }

  function hwImageForState(mode) {
    if (mode === 'input') return 'assets/switch-photo-input.webp';
    if (mode === 'mute') return 'assets/switch-photo-mute.webp';
    return 'assets/switch-photo-ready.webp';
  }

  function showToast(msg, actionLabel = null, onAction = null) {
    const stack = $('#toast-stack');
    const el = document.createElement('div');
    el.className = 'toast';
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
      setTimeout(() => el.remove(), 220);
    }, actionLabel ? 4400 : 2600);
  }

  /* ---------- Chrome Sync ---------- */
  function syncChrome() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    $('#macos-menubar').hidden = !state.showMenubar;
    document.body.classList.toggle('has-menubar', state.showMenubar);
    document.body.classList.toggle('clean-shot', state.cleanShot);

    $$('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });

    $$('.lang-opt').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.lang === state.lang);
    });

    $$('.nav-link').forEach((link) => {
      const on = link.dataset.tab === state.activeTab;
      link.classList.toggle('is-active', on);
      link.setAttribute('aria-selected', String(on));
    });

    const activeCount = state.members.filter((m) => m.active).length;
    const pendingCount = state.decisions.filter((d) => d.status === 'pending').length;
    $('#nav-count-vp').textContent = String(state.members.length);
    const pBadge = $('#nav-count-pending');
    pBadge.textContent = String(pendingCount);
    pBadge.hidden = pendingCount === 0;

    // Effective visual hardware mode (paused member treated as visitor)
    const spk = state.activeSpeakerId && state.activeSpeakerId !== 'visitor' ? memberById(state.activeSpeakerId) : null;
    const visualMode = (state.hwState === 'input' && spk && !spk.active) ? 'visitor' : state.hwState;

    const labelMap = {
      ready: t('stateReady'),
      input: spk ? `${t('stateInput')} ${spk.name.split(' ')[0]}` : t('stateInput'),
      visitor: t('stateVisitor'),
      mute: t('stateMute')
    };
    const subMap = {
      ready: t('hwSubReady'),
      input: t('hwSubInput'),
      visitor: t('hwSubVisitor'),
      mute: t('hwSubMute')
    };

    $('#sidebar-led-dot').className = `status-dot dot-${visualMode}`;
    $('#sidebar-hw-label').textContent = state.lang === 'zh'
      ? `银色 Bar · ${labelMap[visualMode]}`
      : `Silver Bar · ${labelMap[visualMode]}`;

    $('#mb-status-dot').className = `status-dot dot-${visualMode}`;
    $('#mb-status-label').textContent = labelMap[visualMode];
    $('#mbp-sub').textContent = subMap[visualMode];
    $('#mbp-pill').textContent = labelMap[visualMode];
    $('#mbp-bar-img').src = hwImageForState(visualMode);
    $('#mbp-enrolled-count').textContent = String(activeCount);
    $('#mbp-pending-count').textContent = String(pendingCount);
  }

  function setHardwareState(mode, speakerId = null) {
    const wasMute = state.hwState === 'mute';
    if (mode === 'mute' || (wasMute && mode !== 'mute')) {
      playSwitchClick(mode === 'mute');
    }
    state.hwState = mode;
    state.activeSpeakerId = speakerId;
    if (mode === 'visitor') state.blockedVisitorsToday += 1;
    syncChrome();
    if (state.activeTab === 'voiceprints') renderCurrentView();
  }

  /* ---------- Floating Quiet Notice Card ---------- */
  function showDecisionNotice(decisionId) {
    const dec = state.decisions.find((d) => d.id === decisionId) || state.decisions[0];
    if (!dec) return;
    const owner = memberById(dec.ownerId);
    const allDone = dec.participants.every((p) => p.confirmed);
    const names = dec.participants.map((p) => memberById(p.memberId)?.name.split(' ')[0] || '').join(' & ');

    const fc = $('#floating-card');
    fc.hidden = false;
    fc.innerHTML = `
      <div class="nc-top">
        <span class="nc-brand">
          <img src="assets/monogram.svg" alt="" width="11" height="14">
          <span>${t('ncDecisionBrand')}</span>
        </span>
        <button type="button" class="btn-icon" id="fc-close-btn" aria-label="Close">${ICONS.close}</button>
      </div>
      <div class="nc-title">${esc(pick(dec.title))}</div>
      <div class="nc-sub">
        ${owner ? `${esc(owner.name)} ${t('ownerPrefix')}` : t('unassigned')} · ${esc(pick(dec.due))}<br>
        ${allDone
          ? (state.lang === 'zh' ? '双方已确认，已同步到 Linear、Notion 和 Slack。' : 'Confirmed and shared to Linear, Notion, and Slack.')
          : (state.lang === 'zh' ? `目前只有 ${names} 能看到，点确认后发给团队。` : `Private to ${names} until confirmed.`)}
      </div>
      <div class="nc-foot">
        <div class="confirm-group">
          ${dec.participants.map((p) => {
            const m = memberById(p.memberId);
            const first = m ? m.name.split(' ')[0] : '?';
            return `
              <button type="button" class="person-confirm ${p.confirmed ? 'is-done' : ''}" data-fc-confirm="${dec.id}:${p.memberId}">
                ${renderAvatar(m, true)}
                <span>${esc(first)} ${p.confirmed ? '✓' : (state.lang === 'zh' ? '确认' : 'Confirm')}</span>
              </button>
            `;
          }).join('')}
        </div>
        <button type="button" class="btn-text btn-xs" id="fc-open">${t('ncOpenLink')}</button>
      </div>
    `;

    $('#fc-close-btn', fc).addEventListener('click', () => { fc.hidden = true; });
    $('#fc-open', fc).addEventListener('click', () => {
      fc.hidden = true;
      state.activeTab = 'decisions';
      state.highlightedDecisionId = dec.id;
      renderAll();
    });
    $$('[data-fc-confirm]', fc).forEach((btn) => {
      btn.addEventListener('click', () => {
        const [did, mid] = btn.dataset.fcConfirm.split(':');
        toggleConfirm(did, mid, true);
      });
    });
  }

  function showVisitorNotice() {
    const fc = $('#floating-card');
    fc.hidden = false;
    fc.innerHTML = `
      <div class="nc-top">
        <span class="nc-brand">
          <img src="assets/monogram.svg" alt="" width="11" height="14">
          <span>${t('ncVisitorBrand')}</span>
        </span>
        <button type="button" class="btn-icon" id="fc-close-btn" aria-label="Close">${ICONS.close}</button>
      </div>
      <div class="nc-title">${t('ncVisitorTitle')}</div>
      <div class="nc-sub">${t('ncVisitorBody')}</div>
    `;
    $('#fc-close-btn', fc).addEventListener('click', () => { fc.hidden = true; });
  }

  /* ---------- VIEW 1: TEAM & VOICEPRINTS ---------- */
  function renderVoiceprintsView() {
    const spk = state.activeSpeakerId && state.activeSpeakerId !== 'visitor' ? memberById(state.activeSpeakerId) : null;
    let mode = state.hwState;
    let statusHeading = state.lang === 'zh' ? '桌上的银色 Rutta Bar · 待机中' : 'Silver Rutta Bar on your desk · Ready';
    let quoteText = t('deskBarIdleQuote');

    if (state.hwState === 'input' && spk) {
      if (!spk.active) {
        mode = 'visitor';
        statusHeading = state.lang === 'zh' ? `${spk.name}（已暂停声纹）` : `${spk.name} (voiceprint paused)`;
        quoteText = t('deskBarPausedQuote');
      } else {
        statusHeading = state.lang === 'zh' ? `识别到 ${spk.name} 正在说话` : `Hearing ${spk.name}`;
        quoteText = pick(spk.sampleUtterance);
      }
    } else if (state.hwState === 'visitor') {
      statusHeading = t('stateVisitor');
      quoteText = t('deskBarVisitorQuote');
    } else if (state.hwState === 'mute') {
      statusHeading = state.lang === 'zh' ? '物理静音已打开 · 指示灯熄灭' : 'Hardware muted · Top light off';
      quoteText = t('deskBarMuteQuote');
    }

    const q = state.vpSearch.trim().toLowerCase();
    const list = state.members.filter((m) => {
      if (state.vpFilter === 'active' && !m.active) return false;
      if (state.vpFilter === 'paused' && m.active) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || pick(m.role).toLowerCase().includes(q);
    });

    return `
      <header class="page-head">
        <div>
          <h1>${t('vpPageTitle')}</h1>
          <p>${t('vpPageSub')}</p>
        </div>
        <button type="button" class="btn-solid" id="btn-add-member">
          ${ICONS.plus}
          <span>${t('addMemberBtn')}</span>
        </button>
      </header>

      <!-- Quiet, Tactile Desk Hardware Strip -->
      <section class="desk-bar-strip mode-${mode}" aria-label="Connected Rutta Bar">
        <div>
          <div class="dbs-status-line">
            <span class="status-dot dot-${mode}"></span>
            <span>${esc(statusHeading)}</span>
          </div>
          <p class="dbs-quote">${esc(quoteText)}</p>
          <div class="dbs-actions">
            <button type="button" class="inline-action ${state.hwState === 'visitor' ? 'is-on' : ''}" id="act-try-visitor">
              ${t('tryVisitorLink')}
            </button>
            <button type="button" class="inline-action ${state.hwState === 'mute' ? 'is-on' : ''}" id="act-try-mute">
              ${state.hwState === 'mute' ? t('tryUnmuteLink') : t('tryMuteLink')}
            </button>
            ${state.hwState !== 'ready' ? `<button type="button" class="inline-action" id="act-back-ready">${t('tryStandbyLink')}</button>` : ''}
          </div>
        </div>

        <div class="bar-render-box">
          <div class="bar-render-inner">
            <img src="${hwImageForState(mode)}" alt="Rutta Bar">
            <span class="bar-led-cap mode-${mode}" aria-hidden="true"></span>
            <button type="button" class="bar-switch-btn" id="hw-switch-hotspot" aria-label="Physical mute switch" title="${t('tryMuteLink')}"></button>
          </div>
        </div>
      </section>

      <!-- Spacious Human Member List -->
      <div class="list-controls">
        <div class="tab-strip" role="group">
          <button type="button" class="tab-btn ${state.vpFilter === 'all' ? 'is-active' : ''}" data-vp-filter="all">${t('filterAll')} (${state.members.length})</button>
          <button type="button" class="tab-btn ${state.vpFilter === 'active' ? 'is-active' : ''}" data-vp-filter="active">${t('filterActive')}</button>
          <button type="button" class="tab-btn ${state.vpFilter === 'paused' ? 'is-active' : ''}" data-vp-filter="paused">${t('filterPaused')}</button>
        </div>
        <div class="search-quiet">
          ${ICONS.search}
          <input type="search" id="vp-search-input" value="${esc(state.vpSearch)}" placeholder="${esc(t('searchPlaceholder'))}">
        </div>
      </div>

      <div class="member-list">
        ${list.length === 0
          ? `<p style="padding:36px 0;text-align:center;color:var(--muted);">${t('emptyRoster')}</p>`
          : list.map((m) => {
            const isSpeaking = state.hwState === 'input' && state.activeSpeakerId === m.id && m.active;
            return `
              <div class="member-row ${m.active ? '' : 'is-paused'} ${isSpeaking ? 'is-speaking' : ''}">
                <div class="m-person">
                  ${renderAvatar(m)}
                  <div>
                    <div class="m-name">${esc(m.name)}</div>
                    <div class="m-role">${esc(pick(m.role))}</div>
                  </div>
                </div>

                <div class="m-voice">
                  <div class="voice-bars" aria-hidden="true">
                    ${m.bars.map((h, i) => `<span style="height:${Math.round(h * 0.16)}px;animation-delay:${(i * 0.06).toFixed(2)}s"></span>`).join('')}
                  </div>
                  <div class="m-heard">${m.active ? esc(pick(m.lastHeard)) : t('pausedLabel')}</div>
                </div>

                <div class="m-bar">
                  <span class="sw-dot sw-${m.finish}"></span>
                  <span>${finishLabel(m.finish)} Bar</span>
                </div>

                <div class="m-actions">
                  <button type="button" class="row-link" data-test-member="${m.id}">${t('btnTestVoice')}</button>
                  <button type="button" class="row-link" data-reenroll-member="${m.id}">${t('btnReenroll')}</button>
                  <button type="button" class="row-link is-danger" data-delete-member="${m.id}">${t('btnRemove')}</button>
                  <button type="button" class="switch" role="switch" aria-checked="${m.active}" data-toggle-member="${m.id}" aria-label="${esc(m.name)}"></button>
                </div>
              </div>
            `;
          }).join('')
        }
      </div>

      <div class="roster-footnote">
        <span>${t('rosterFootNote')}</span>
      </div>
    `;
  }

  /* ---------- VIEW 2: DECISIONS ---------- */
  function renderDecisionsView() {
    const pendingCount = state.decisions.filter((d) => d.status === 'pending').length;
    const mondayCount = state.decisions.filter((d) => d.status === 'monday').length;
    const filtered = state.decisions.filter((d) => state.decFilter === 'all' || d.status === state.decFilter);

    return `
      <header class="page-head">
        <div>
          <h1>${t('decPageTitle')}</h1>
          <p>${t('decPageSub')}</p>
        </div>
      </header>

      <div class="list-controls">
        <div class="tab-strip" role="group">
          <button type="button" class="tab-btn ${state.decFilter === 'all' ? 'is-active' : ''}" data-dec-filter="all">${t('decFilterAll')} (${state.decisions.length})</button>
          <button type="button" class="tab-btn ${state.decFilter === 'pending' ? 'is-active' : ''}" data-dec-filter="pending">${t('decFilterPending')} (${pendingCount})</button>
          <button type="button" class="tab-btn ${state.decFilter === 'synced' ? 'is-active' : ''}" data-dec-filter="synced">${t('decFilterSynced')}</button>
          <button type="button" class="tab-btn ${state.decFilter === 'monday' ? 'is-active' : ''}" data-dec-filter="monday">${t('decFilterMonday')} (${mondayCount})</button>
        </div>
      </div>

      <div class="decision-list">
        ${filtered.map((dec) => {
          const owner = memberById(dec.ownerId);
          const isOpen = state.expandedQuoteId === dec.id;
          const isPlaying = playingQuoteId === dec.id;
          const stLabel = dec.status === 'pending' ? t('statePendingShort') : dec.status === 'synced' ? t('stateSyncedShort') : t('stateMondayShort');

          return `
            <article class="decision-item ${state.highlightedDecisionId === dec.id ? 'is-focused' : ''}">
              <div class="dec-top">
                <div class="dec-title-row">
                  <span class="dec-dot st-${dec.status}"></span>
                  <h2 class="dec-title">${esc(pick(dec.title))}</h2>
                </div>
                <span class="dec-state-label ${dec.status === 'pending' ? 'is-pending' : ''}">${stLabel}</span>
              </div>

              <div class="dec-body">
                <p class="dec-summary">${esc(pick(dec.summary))}</p>

                <div class="dec-meta">
                  ${dec.status === 'monday' && !owner
                    ? `<select class="owner-select" data-assign-owner="${dec.id}">
                        <option value="">${t('assignOwnerPlaceholder')}</option>
                        ${state.members.filter((m) => m.active).map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join('')}
                      </select>`
                    : `<span><strong>${owner ? esc(owner.name) : t('unassigned')}</strong> ${owner ? t('ownerPrefix') : ''}</span>`
                  }
                  <span>·</span>
                  <span>${esc(pick(dec.due))}</span>
                  <span>·</span>
                  <span>${esc(pick(dec.context))}</span>
                </div>

                ${dec.visitorIgnoredCount > 0 ? `
                  <div class="dec-visitor-line">
                    ${ICONS.shield}
                    <span>${state.lang === 'zh'
                      ? `当时有 ${dec.visitorIgnoredCount} 位未加入的人在场，他的发言没有被记录`
                      : `${dec.visitorIgnoredCount} unenrolled person was present — their speech was not recorded`}</span>
                  </div>
                ` : ''}

                <div class="dec-foot">
                  ${dec.status === 'synced'
                    ? `<div class="synced-line">${t('syncedPrefix')} <span>${esc(dec.syncedTools.join(' · '))}</span></div>`
                    : `<div class="confirm-group">
                        ${dec.participants.map((p) => {
                          const m = memberById(p.memberId);
                          const first = m ? m.name.split(' ')[0] : '?';
                          return `
                            <button type="button" class="person-confirm ${p.confirmed ? 'is-done' : ''}" data-confirm-part="${dec.id}:${p.memberId}">
                              ${renderAvatar(m, true)}
                              <span>${esc(first)} ${p.confirmed ? `· ${t('confirmedSuffix')}` : `· ${t('confirmActionSuffix')}`}</span>
                            </button>
                          `;
                        }).join('')}
                      </div>`
                  }

                  <div class="dec-tools">
                    <button type="button" class="row-link" data-toggle-quote="${dec.id}">
                      ${isOpen ? t('btnHideQuote') : `${t('btnQuote')} ${dec.quoteDuration}`}
                    </button>
                    <button type="button" class="row-link" data-handoff-dec="${dec.id}">${t('btnHandoff')}</button>
                    <button type="button" class="row-link is-danger" data-delete-dec="${dec.id}">${t('btnDeleteRec')}</button>
                  </div>
                </div>

                ${isOpen ? `
                  <div class="quote-sheet">
                    <div class="qs-head">
                      <span>${t('quoteTitle')}</span>
                      <span>${t('quotePrivacyNote')}</span>
                    </div>
                    <div class="qs-player">
                      <button type="button" class="qs-play" data-play-quote="${dec.id}" aria-label="Play">
                        ${isPlaying ? ICONS.pause : ICONS.play}
                      </button>
                      <div class="qs-bars" id="qd-wave-${dec.id}">
                        ${Array.from({ length: 58 }, (_, i) => {
                          const h = 22 + ((i * 37 + 17) % 74);
                          const played = isPlaying && (i / 58) <= quotePlayPct;
                          return `<span class="${played ? 'is-played' : ''}" style="height:${h}%"></span>`;
                        }).join('')}
                      </div>
                      <span class="qs-time" id="qd-time-${dec.id}">${isPlaying ? formatClipTime(dec.quoteDuration, quotePlayPct) : `0:00 / ${dec.quoteDuration}`}</span>
                    </div>
                    <div class="qs-lines">
                      ${dec.quotes.map((q) => `
                        <div class="qs-line ${q.key ? 'is-key' : ''}">
                          <span class="qs-ts">${q.ts}</span>
                          <span class="qs-spk">${esc(q.speaker)}</span>
                          <span>${esc(pick(q))}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  function formatClipTime(totalStr, pct) {
    const parts = totalStr.split(':').map(Number);
    const sec = (parts[0] || 0) * 60 + (parts[1] || 12);
    return `0:${String(Math.min(sec, Math.round(sec * pct))).padStart(2, '0')} / ${totalStr}`;
  }

  /* ---------- VIEW 3: TOOLS & AGENT ---------- */
  function renderIntegrationsView() {
    const prompts = state.lang === 'zh'
      ? [
          { id: 'client-email', label: '把刚改的上线日期写封更新发给客户' },
          { id: 'linear-task', label: '在 Linear 建好周四发版任务给 Leo' },
          { id: 'why-silver', label: '查一下上次为什么选了银色款' }
        ]
      : [
          { id: 'client-email', label: 'Draft a client update for the Dec 10 launch shift' },
          { id: 'linear-task', label: 'Create Thursday’s Silver build ticket for Leo' },
          { id: 'why-silver', label: 'Why did we pick the Silver prototype?' }
        ];

    return `
      <header class="page-head">
        <div>
          <h1>${t('intPageTitle')}</h1>
          <p>${t('intPageSub')}</p>
        </div>
      </header>

      <section class="agent-desk">
        <h2>${t('agentHeading')}</h2>
        <p class="sub">${t('agentSub')}</p>

        <form class="agent-form" id="agent-form">
          <input type="text" id="agent-input" placeholder="${esc(t('agentPlaceholder'))}" autocomplete="off">
          <button type="submit" class="btn-solid">${t('agentRunBtn')}</button>
        </form>

        <div class="prompt-suggestions">
          ${prompts.map((p) => `<button type="button" class="prompt-link" data-agent-preset="${p.id}">${esc(p.label)}</button>`).join('')}
        </div>

        ${state.agentResult ? `
          <div class="agent-draft">
            <div class="ad-cite">
              <span>${esc(state.agentResult.citation)}</span>
              <span>${esc(state.agentResult.channel)}</span>
            </div>
            <div class="ad-paper">${esc(state.agentResult.body)}</div>
            <div class="ad-foot">
              <span style="font-size:12px;color:var(--muted);">${state.lang === 'zh' ? '仅基于已确认的文字决定起草' : 'Drafted from confirmed notes only'}</span>
              <button type="button" class="btn-solid btn-xs" id="agent-approve-btn" ${state.agentApproved ? 'disabled' : ''}>
                ${state.agentApproved ? t('agentApprovedDone') : t('agentApproveBtn')}
              </button>
            </div>
          </div>
        ` : ''}
      </section>

      <div class="section-label">${t('toolsSectionLabel')}</div>
      <div class="settings-list">
        ${state.integrations.map((tool) => `
          <div class="setting-row">
            <div class="sr-left">
              <div class="tool-mono">${esc(tool.letter)}</div>
              <div>
                <div class="sr-title">${esc(tool.name)}</div>
                <div class="sr-desc">${esc(pick(tool.desc))}</div>
              </div>
            </div>
            <div class="sr-right">
              <span class="sr-target">${esc(tool.target)}</span>
              ${tool.id === 'mcp'
                ? `<button type="button" class="row-link" data-copy-mcp="${tool.target}">${t('btnCopyMcp')}</button>`
                : `<button type="button" class="row-link" data-test-tool="${tool.id}" ${tool.enabled ? '' : 'disabled'}>${t('btnTestSync')}</button>`
              }
              <button type="button" class="switch" role="switch" aria-checked="${tool.enabled}" data-toggle-tool="${tool.id}" aria-label="${esc(tool.name)}"></button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ---------- VIEW 4: DEVICES & PRIVACY ---------- */
  function renderDevicesView() {
    const imgs = {
      silver: 'assets/hero-silver.webp',
      sky: 'assets/hero-sky.webp',
      starlight: 'assets/hero-starlight.webp',
      midnight: 'assets/hero-midnight.webp'
    };
    const teamBars = state.members.slice(0, 4);

    return `
      <header class="page-head">
        <div>
          <h1>${t('devPageTitle')}</h1>
          <p>${t('devPageSub')}</p>
        </div>
      </header>

      <div class="sync-note-row">
        <span class="section-label" style="margin:0;">${state.multiBarSync ? t('syncActiveText') : t('barsSectionLabel')}</span>
        <button type="button" class="inline-action ${state.multiBarSync ? 'is-on' : ''}" id="btn-toggle-multibar">
          ${state.multiBarSync ? t('syncBtnStop') : t('syncBtnStart')}
        </button>
      </div>

      <section class="bars-strip">
        ${teamBars.map((m, idx) => {
          const isMuted = m.barState === 'muted' && !state.multiBarSync;
          const isLid = m.barState === 'lid_closed';
          const isSync = state.multiBarSync && idx < 3;
          const dot = isSync ? 'dot-input' : isMuted ? 'dot-mute' : 'dot-ready';
          const sub = isSync
            ? (state.lang === 'zh' ? '正在同步同一段讨论' : 'Synced on huddle')
            : isMuted
              ? t('stateMute')
              : isLid
                ? (state.lang === 'zh' ? '合盖待机' : 'Lid closed')
                : t('stateReady');

          return `
            <div class="bar-tile ${isSync ? 'is-syncing' : ''}">
              <div class="bt-stage">
                <span class="status-dot ${dot}"></span>
                <img src="${imgs[m.finish]}" alt="${finishLabel(m.finish)} Rutta Bar">
              </div>
              <div class="bt-name">${esc(m.name.split(' ')[0])} · ${finishLabel(m.finish)}</div>
              <div class="bt-sub">${esc(sub)}</div>
            </div>
          `;
        }).join('')}
      </section>

      <section class="devices-split">
        <div class="lid-showcase ${state.lidClosed ? '' : 'is-open'}">
          <div class="lid-photo">
            <img src="assets/closedside-1200.webp" alt="Rutta Bar on closed MacBook Air">
            <span class="lid-led" aria-hidden="true"></span>
          </div>
          <div class="lid-copy">
            <h3>${t('lidTitle')}</h3>
            <p>${t('lidSub')}</p>
            <div class="lid-copy-foot">
              <span>${state.lidClosed ? t('lidClosedLabel') : t('lidOpenLabel')}</span>
              <button type="button" class="row-link" id="btn-toggle-lid">${t('lidToggleBtn')}</button>
            </div>
          </div>
        </div>

        <div>
          <div class="section-label">${t('privacySectionLabel')}</div>
          <div class="settings-list">
            ${state.policies.map((p) => `
              <div class="privacy-row">
                <div>
                  <div class="pr-title">
                    <span>${esc(pick(p.title))}</span>
                    ${p.locked ? `<span class="pr-lock" style="display:inline-flex;align-items:center;gap:3px;">${ICONS.lock} ${t('lockedText')}</span>` : ''}
                  </div>
                  <p class="pr-desc">${esc(pick(p.desc))}</p>
                </div>
                <button type="button" class="switch" role="switch" aria-checked="${p.enabled}" ${p.locked ? 'disabled' : ''} data-toggle-policy="${p.id}"></button>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  /* ---------- Render & Bindings ---------- */
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

  function bindVoiceprintsEvents(root) {
    $('#btn-add-member', root)?.addEventListener('click', () => openEnrollModal(null));

    const toggleMute = () => setHardwareState(state.hwState === 'mute' ? 'ready' : 'mute', null);
    $('#hw-switch-hotspot', root)?.addEventListener('click', toggleMute);
    $('#act-try-mute', root)?.addEventListener('click', toggleMute);
    $('#act-back-ready', root)?.addEventListener('click', () => {
      $('#floating-card').hidden = true;
      setHardwareState('ready', null);
    });
    $('#act-try-visitor', root)?.addEventListener('click', () => {
      setHardwareState('visitor', 'visitor');
      showVisitorNotice();
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

    $$('[data-toggle-member]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const m = memberById(b.dataset.toggleMember);
        if (!m) return;
        m.active = !m.active;
        showToast(state.lang === 'zh'
          ? `${m.name} 已${m.active ? '恢复声纹识别' : '暂停识别'}`
          : `${m.name} ${m.active ? 'resumed' : 'paused'}`);
        renderAll();
      });
    });

    $$('[data-test-member]', root).forEach((b) => {
      b.addEventListener('click', () => {
        $('#floating-card').hidden = true;
        setHardwareState('input', b.dataset.testMember);
      });
    });

    $$('[data-reenroll-member]', root).forEach((b) => {
      b.addEventListener('click', () => openEnrollModal(b.dataset.reenrollMember));
    });

    $$('[data-delete-member]', root).forEach((b) => {
      b.addEventListener('click', () => openDeleteModal(b.dataset.deleteMember));
    });
  }

  function bindDecisionsEvents(root) {
    $$('[data-dec-filter]', root).forEach((b) => {
      b.addEventListener('click', () => { state.decFilter = b.dataset.decFilter; renderCurrentView(); });
    });

    $$('[data-confirm-part]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const [did, mid] = b.dataset.confirmPart.split(':');
        toggleConfirm(did, mid, false);
      });
    });

    $$('[data-toggle-quote]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.dataset.toggleQuote;
        stopQuotePlayback();
        state.expandedQuoteId = state.expandedQuoteId === id ? null : id;
        renderCurrentView();
      });
    });

    $$('[data-play-quote]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.dataset.playQuote;
        if (playingQuoteId === id) { stopQuotePlayback(); renderCurrentView(); }
        else startQuotePlayback(id);
      });
    });

    $$('[data-handoff-dec]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const dec = state.decisions.find((d) => d.id === b.dataset.handoffDec);
        if (!dec) return;
        state.activeTab = 'integrations';
        renderAll();
        runAgentCustom(state.lang === 'zh' ? `基于「${pick(dec.title)}」写一条简短同步` : `Draft an update for "${pick(dec.title)}"`, dec);
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
        showToast(state.lang === 'zh' ? `已指派给 ${m.name}，并同步到 Linear` : `Assigned to ${m.name} and synced to Linear`);
        renderAll();
      });
    });

    $$('[data-delete-dec]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const idx = state.decisions.findIndex((d) => d.id === b.dataset.deleteDec);
        if (idx === -1) return;
        lastDeletedDecision = { item: state.decisions.splice(idx, 1)[0], idx };
        renderAll();
        showToast(
          state.lang === 'zh' ? '这条记录和关联原声已经删掉' : 'Note and source clip deleted',
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
      const val = $('#agent-input', root).value.trim();
      if (!val) return;
      runAgentCustom(val);
    });

    $$('[data-agent-preset]', root).forEach((b) => {
      b.addEventListener('click', () => runAgentPreset(b.dataset.agentPreset));
    });

    $('#agent-approve-btn', root)?.addEventListener('click', () => {
      state.agentApproved = true;
      renderCurrentView();
      showToast(state.lang === 'zh' ? '已发送' : 'Sent');
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
        if (!tool) return;
        showToast(state.lang === 'zh' ? `已往 ${tool.name}（${tool.target}）发了一条测试` : `Sent a test note to ${tool.name} (${tool.target})`);
      });
    });

    $$('[data-copy-mcp]', root).forEach((b) => {
      b.addEventListener('click', () => {
        navigator.clipboard?.writeText(b.dataset.copyMcp).catch(() => {});
        showToast(state.lang === 'zh' ? '已复制 MCP 地址' : 'Copied MCP URI');
      });
    });
  }

  function bindDevicesEvents(root) {
    $('#btn-toggle-multibar', root)?.addEventListener('click', () => {
      state.multiBarSync = !state.multiBarSync;
      state.hwState = state.multiBarSync ? 'input' : 'ready';
      renderAll();
    });
    $('#btn-toggle-lid', root)?.addEventListener('click', () => {
      state.lidClosed = !state.lidClosed;
      renderCurrentView();
    });
    $$('[data-toggle-policy]', root).forEach((b) => {
      b.addEventListener('click', () => {
        const p = state.policies.find((x) => x.id === b.dataset.togglePolicy);
        if (!p || p.locked) return;
        p.enabled = !p.enabled;
        renderCurrentView();
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
      showToast(state.lang === 'zh' ? '已确认，并同步到 Linear、Notion 和 Slack' : 'Confirmed and shared to Linear, Notion, and Slack');
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
    }, 160);
  }

  function runAgentPreset(presetId) {
    const map = {
      'client-email': {
        zh: {
          channel: '邮件草稿',
          citation: '依据：今天 14:19 工位旁确认的上线日期变更（Maya · Leo）',
          body: 'Hi 各位，\n\n刚和工程这边对了一下，为了把最终联调跑扎实，我们决定把上线日期从 12 月 3 日推迟一周到 12 月 10 日。Leo 已经同步调整了 Linear 和发布计划。\n\n如果你们那边有需要配合改时间的地方，随时告诉我。\n— Maya'
        },
        en: {
          channel: 'Email draft',
          citation: 'From today’s 14:19 desk decision (Maya & Leo)',
          body: 'Hi everyone,\n\nQuick heads-up after syncing with engineering: we’re moving launch from Dec 3 to Dec 10 to leave clean room for final QA. Leo has shifted the Linear dates to match.\n\nLet us know if anything on your side needs adjusting.\n— Maya'
        }
      },
      'linear-task': {
        zh: {
          channel: 'Linear 任务草稿',
          citation: '依据：3 天前设计评审记录（Maya · Leo）',
          body: '准备周五银色样机的测试固件\n\n负责人：Leo Park\n截止：周四 12:00\n说明：首轮用户测试统一使用银色机身，周四中午前同步到测试小组。'
        },
        en: {
          channel: 'Linear issue draft',
          citation: 'From design review, 3 days ago (Maya & Leo)',
          body: 'Prepare Silver prototype build for Friday test\n\nOwner: Leo Park\nDue: Thursday, 12:00\nNotes: First round of user testing uses the Silver unit; build goes out Thursday noon.'
        }
      },
      'why-silver': {
        zh: {
          channel: '团队记忆溯源',
          citation: '来自 3 天前设计评审（10:42 · Leo & Maya）',
          body: '当时把四款配色放到 MacBook Air 旁边比对后，大家觉得银色和机身侧边最自然，而且 Leo 周四中午前能先交出银色版的测试包。这条决定已经同步在 Notion 和 Linear（RUT-42）。'
        },
        en: {
          channel: 'Decision lookup',
          citation: 'From design review, 3 days ago (10:42 · Leo & Maya)',
          body: 'When comparing all four finishes beside the MacBook Air, Silver blended best with the side edge and Leo could deliver the Silver test build by Thursday noon. Logged in Notion and Linear (RUT-42).'
        }
      }
    };
    const chosen = map[presetId]?.[state.lang];
    if (!chosen) return;
    state.agentApproved = false;
    state.agentResult = chosen;
    renderCurrentView();
  }

  function runAgentCustom(promptText, linkedDec = null) {
    const dec = linkedDec || state.decisions[0];
    state.agentApproved = false;
    state.agentResult = {
      channel: state.lang === 'zh' ? '草稿' : 'Draft',
      citation: state.lang === 'zh' ? `依据：${pick(dec.title)}` : `Based on: ${pick(dec.title)}`,
      body: state.lang === 'zh'
        ? `按你的要求「${promptText}」拟了一版简短同步：\n\n「${pick(dec.title)}」，目前由 ${memberById(dec.ownerId)?.name || '待定'} 跟进，时间节点 ${pick(dec.due)}。需要补充细节可以直接改。`
        : `Draft for "${promptText}":\n\n"${pick(dec.title)}" — owned by ${memberById(dec.ownerId)?.name || 'TBD'}, due ${pick(dec.due)}. Ready to edit or send.`
    };
    renderCurrentView();
  }

  /* ---------- Enrollment & Delete Sheets ---------- */
  function openEnrollModal(memberId = null) {
    reenrollMemberId = memberId;
    sampledVoiceReady = false;
    stopVoiceSampling();

    const m = memberId ? memberById(memberId) : null;
    $('#enroll-modal-title').textContent = m ? `${t('enrollTitleReenroll')} · ${m.name}` : t('enrollTitle');
    $('#enroll-name').value = m ? m.name : '';
    $('#enroll-role').value = m ? pick(m.role) : '';
    $('#enroll-name').disabled = Boolean(m);

    const fin = m ? m.finish : 'silver';
    $$('#enroll-finish-selector .finish-opt').forEach((c) => c.classList.toggle('is-selected', c.dataset.finish === fin));

    updateEnrollQuote(m ? m.name : '');
    const box = $('#voice-capture-box');
    box.dataset.state = 'idle';
    $('#vc-status-text').textContent = t('vcIdle');
    $('#btn-sample-label').textContent = t('vcStartBtn');
    $('#enroll-save').disabled = true;
    $('#vc-wave').innerHTML = Array.from({ length: 24 }, () => '<span></span>').join('');
    $('#enroll-modal').hidden = false;
    if (!m) $('#enroll-name').focus();
  }

  function updateEnrollQuote(name) {
    const who = name.trim() || (state.lang === 'zh' ? '新加入的同事' : 'a teammate');
    $('#vc-quote').textContent = state.lang === 'zh'
      ? `“我是${who}，只有在工位讨论工作时才记录，我随时可以退出。”`
      : `"Hi, I’m ${who}. Only note work decisions while I’m enrolled, and I can leave anytime."`;
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
      }, 110);
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
          showToast(state.lang === 'zh' ? '没开麦克风权限，已用模拟语音完成采样' : 'Mic unavailable — running simulated sample');
          run(null);
        });
    } else {
      run(null);
    }
  }

  function saveEnrolledMember() {
    if (!sampledVoiceReady) return;
    const name = $('#enroll-name').value.trim() || (state.lang === 'zh' ? '新同事' : 'New Teammate');
    const role = $('#enroll-role').value.trim() || (state.lang === 'zh' ? '产品' : 'Product');
    const finish = $('#enroll-finish-selector .finish-opt.is-selected')?.dataset.finish || 'silver';
    const bars = Array.from({ length: 10 }, () => 34 + Math.round(Math.random() * 58));

    if (reenrollMemberId) {
      const m = memberById(reenrollMemberId);
      if (m) {
        m.role = { zh: role, en: role };
        m.finish = finish;
        m.bars = bars;
        m.active = true;
        m.lastHeard = { zh: '刚刚更新声纹', en: 'Updated just now' };
        showToast(state.lang === 'zh' ? `已更新 ${m.name} 的声纹` : `Updated ${m.name}’s voiceprint`);
      }
    } else {
      const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'NB';
      const tones = ['#E5E1D8', '#DDE3E0', '#E2E0E8', '#EAE0D5'];
      const newM = {
        id: 'm-' + Date.now(),
        name,
        role: { zh: role, en: role },
        avatar: null,
        initials,
        tone: tones[state.members.length % tones.length],
        finish,
        barName: 'MacBook Air',
        barState: 'online',
        lastHeard: { zh: '刚刚加入', en: 'Joined just now' },
        active: true,
        bars,
        sampleUtterance: {
          zh: `“我是 ${name}，这件事我来跟，周三前放到 Notion。”`,
          en: `"I’m ${name}—I’ll follow up and put it in Notion by Wednesday."`
        }
      };
      state.members.unshift(newM);
      setHardwareState('input', newM.id);
      showToast(state.lang === 'zh' ? `已记住 ${name} 的声音` : `Added ${name} to the team`);
    }

    $('#enroll-modal').hidden = true;
    renderAll();
  }

  function openDeleteModal(memberId) {
    const m = memberById(memberId);
    if (!m) return;
    pendingDeleteMemberId = memberId;
    $('#delete-desc').textContent = state.lang === 'zh'
      ? `确定移除 ${m.name} 的声纹吗？`
      : `Remove ${m.name}’s voiceprint?`;
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
      showToast(state.lang === 'zh' ? `已移除 ${removed.name} 的声纹` : `Removed ${removed.name}’s voiceprint`);
    }
    pendingDeleteMemberId = null;
    $('#delete-modal').hidden = true;
    renderAll();
  }

  /* ---------- Director Shots ---------- */
  function runDirectorShot(shot) {
    $('#director-drawer').hidden = true;
    if (shot === 'sceneD') {
      state.activeTab = 'voiceprints';
      setHardwareState('visitor', 'visitor');
      renderAll();
      showVisitorNotice();
    } else if (shot === 'sceneS1') {
      state.activeTab = 'voiceprints';
      $('#floating-card').hidden = true;
      setHardwareState('mute', null);
      renderAll();
    } else if (shot === 'sceneA') {
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
      showDecisionNotice('dec-launch');
    } else if (shot === 'sceneC') {
      state.activeTab = 'decisions';
      state.decFilter = 'all';
      state.expandedQuoteId = 'dec-silver';
      state.highlightedDecisionId = 'dec-silver';
      $('#floating-card').hidden = true;
      renderAll();
      startQuotePlayback('dec-silver');
    } else if (shot === 'sceneE') {
      state.activeTab = 'integrations';
      $('#floating-card').hidden = true;
      renderAll();
      runAgentPreset('client-email');
    } else if (shot === 'sceneL4') {
      state.activeTab = 'devices';
      state.multiBarSync = true;
      state.hwState = 'input';
      $('#floating-card').hidden = true;
      renderAll();
    }
  }

  /* ---------- Global Wiring ---------- */
  function initGlobalEvents() {
    $$('.nav-link').forEach((btn) => {
      btn.addEventListener('click', () => {
        stopQuotePlayback();
        state.activeTab = btn.dataset.tab;
        state.highlightedDecisionId = null;
        renderAll();
      });
    });

    $$('.lang-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.lang = btn.dataset.lang;
        if (state.agentResult) runAgentPreset('client-email');
        renderAll();
      });
    });

    // Optional menu bar popover
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
    $('#mbp-toggle-mute').addEventListener('click', () => setHardwareState(state.hwState === 'mute' ? 'ready' : 'mute', null));
    $('#mbp-trigger-card').addEventListener('click', () => {
      mbPop.hidden = true;
      showDecisionNotice('dec-launch');
    });

    // Enroll modal
    $('#enroll-close').addEventListener('click', () => { stopVoiceSampling(); $('#enroll-modal').hidden = true; });
    $('#enroll-cancel').addEventListener('click', () => { stopVoiceSampling(); $('#enroll-modal').hidden = true; });
    $('#enroll-modal').addEventListener('click', (e) => {
      if (e.target === $('#enroll-modal')) { stopVoiceSampling(); $('#enroll-modal').hidden = true; }
    });
    $('#enroll-name').addEventListener('input', (e) => updateEnrollQuote(e.target.value));
    $$('#enroll-finish-selector .finish-opt').forEach((c) => {
      c.addEventListener('click', () => {
        $$('#enroll-finish-selector .finish-opt').forEach((x) => x.classList.remove('is-selected'));
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

    // Director panel
    $('#director-trigger').addEventListener('click', () => { $('#director-drawer').hidden = !$('#director-drawer').hidden; });
    $('#director-close').addEventListener('click', () => { $('#director-drawer').hidden = true; });
    $$('.dp-item').forEach((b) => b.addEventListener('click', () => runDirectorShot(b.dataset.shot)));
    $('#toggle-menubar').addEventListener('change', (e) => { state.showMenubar = e.target.checked; syncChrome(); });
    $('#toggle-sound').addEventListener('change', (e) => { state.soundEnabled = e.target.checked; });
    $('#dd-clean-mode').addEventListener('click', () => {
      state.cleanShot = true;
      $('#director-drawer').hidden = true;
      syncChrome();
      showToast(state.lang === 'zh' ? '已隐藏辅助控件，按 H 恢复' : 'Clean screen ON — press H to restore');
    });
    $('#dd-reset').addEventListener('click', () => {
      const keepLang = state.lang;
      stopQuotePlayback();
      state = window.createInitialRuttaState();
      state.lang = keepLang;
      $('#toggle-menubar').checked = false;
      $('#floating-card').hidden = true;
      $('#director-drawer').hidden = true;
      renderAll();
      showToast(state.lang === 'zh' ? '已恢复初始状态' : 'State reset');
    });

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
