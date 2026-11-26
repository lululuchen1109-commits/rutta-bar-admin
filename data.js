/* Human, natural bilingual copy & realistic team state for Rutta Bar */

window.RUTTA_I18N = {
  zh: {
    menuFile: '文件',
    menuEdit: '编辑',
    menuView: '显示',
    navVoiceprints: '团队成员',
    navDecisions: '记下来的事',
    navIntegrations: '同步与 Agent',
    navDevices: '设备与隐私',
    sidebarSub: '只听已加入的成员',
    directorBtn: '拍摄演示',
    disclaimerText: '概念界面示意（暂无实物样机）· 人物、声音与对话均为虚构示例',

    // Menu bar popover
    mbpEnrolled: '位成员在线',
    mbpPending: '条待确认',
    mbpMuteBtn: '切换静音',
    mbpCardBtn: '查看最近记录',

    // Hardware status (plain human language)
    stateReady: '待机中',
    stateInput: '正在听',
    stateVisitor: '未加入的声音，已忽略',
    stateMute: '已静音',
    hwSubReady: '已连接 · 绿灯缓慢呼吸',
    hwSubInput: '识别到成员说话 · 黄灯亮起',
    hwSubVisitor: '未认出是谁 · 灯不亮，未记录',
    hwSubMute: '物理滑键已拨到静音 · 橙标外露',

    // Voiceprints page
    vpPageTitle: '团队成员',
    vpPageSub: 'Rutta Bar 只认识名单里的声音。不在名单里的人说话，设备不亮灯，也不留记录。',
    addMemberBtn: '添加成员',
    deskBarIdleQuote: '插在 Mac 侧边随时待机。点右侧实物滑键可以直接静音，或试着让访客说句话。',
    deskBarVisitorQuote: '刚检测到一段未加入的声音，指示灯保持熄灭，音频已经直接丢弃，没有转写也没有保存。',
    deskBarMuteQuote: '物理滑键已切断麦克风采集，顶部状态灯熄灭。合盖或重新插上也会保持静音。',
    deskBarPausedQuote: '这位同事暂时停用了声纹，他现在说的话不会被记下来。',
    tryVisitorLink: '试试访客说话',
    tryStandbyLink: '回到待机',
    tryMuteLink: '拨动物理静音',
    tryUnmuteLink: '取消静音',

    filterAll: '全部',
    filterActive: '识别中',
    filterPaused: '已暂停',
    searchPlaceholder: '找同事…',
    btnTestVoice: '试听识别',
    btnReenroll: '重录',
    btnRemove: '移除',
    pausedLabel: '已暂停',
    rosterFootNote: '每人只需录几秒短句，随时可以自己暂停或彻底移除。',
    emptyRoster: '没有找到这位同事。',

    finishSilver: '银色',
    finishSky: '天蓝',
    finishStarlight: '星光',
    finishMidnight: '午夜',

    // Enroll sheet
    enrollTitle: '添加成员声纹',
    enrollTitleReenroll: '重新录一次声音',
    enrollSub: '读一句短话就行。加入后随时可以暂停或移除，不会留痕。',
    fieldName: '姓名',
    fieldRole: '角色',
    fieldFinish: '她 / 他的 Rutta Bar',
    vcPromptLabel: '请照常读出下面这句话',
    vcIdle: '准备好就可以开始',
    vcSampling: '正在记住你的声音…',
    vcDone: '好了，已经记住这个声音',
    vcStartBtn: '模拟录一段（3 秒）',
    vcRealMicBtn: '用本机麦克风',
    vcResampleBtn: '再录一次',
    cancel: '取消',
    enrollConfirmBtn: '完成加入',

    // Delete sheet
    deleteTitle: '移除声纹',
    deleteNote: '移除后，Rutta Bar 不会再识别这个声音——以后在工位旁说话时，设备灯不会亮，也不会转写或保存。已经确认进知识库的文字记录不受影响。',
    deleteConfirmBtn: '确认移除',

    // Decisions page
    decPageTitle: '记下来的事',
    decPageSub: '刚说定的事默认只给当时在场的人看，点一下确认再同步给团队。',
    decFilterPending: '待确认',
    decFilterSynced: '已同步',
    decFilterMonday: '周一未跟进',
    decFilterAll: '全部',
    statePendingShort: '仅在场可见',
    stateSyncedShort: '已同步',
    stateMondayShort: '待认领',
    ownerPrefix: '负责',
    unassigned: '还没定谁负责',
    assignOwnerPlaceholder: '指派给…',
    confirmedSuffix: '已确认',
    confirmActionSuffix: '确认并同步',
    syncedPrefix: '已同步到',
    btnQuote: '听原话',
    btnHideQuote: '收起',
    btnHandoff: '交给 Agent',
    btnDeleteRec: '删除',
    quotePrivacyNote: '只有当时在场的人能听这段原声，管理员看不到',
    quoteTitle: '当时原话',

    // Floating notice
    ncDecisionBrand: '刚记下的一件事',
    ncVisitorBrand: '未加入的声音',
    ncVisitorTitle: '有 1 位未加入的人在场，发言没有被记录',
    ncVisitorBody: '不在团队名单里，顶部灯保持熄灭，音频直接丢弃。',
    ncOpenLink: '打开看详情',

    // Integrations & Agent page
    intPageTitle: '同步与 Agent',
    intPageSub: '确认过的口头决定会自动去团队已经在用的工具里，也可以直接让 Agent 接着干。',
    agentHeading: '交给 Agent 接着处理',
    agentSub: '回工位说一句或打一行字，它会直接引用你们刚确认的决定。',
    agentPlaceholder: '比如：把刚改的上线日期写封简短更新发给客户…',
    agentRunBtn: '交给 Agent',
    agentApproveBtn: '确认发送',
    agentApprovedDone: '已发送',
    toolsSectionLabel: '已连接的工具与开放接口',
    btnTestSync: '试发一条',
    btnCopyMcp: '复制地址',

    // Devices & Privacy page
    devPageTitle: '设备与隐私',
    devPageSub: '插在每台 Mac 侧边的 Rutta Bar，以及团队共同遵守的四条边界。',
    barsSectionLabel: '办公室里的 Rutta Bar',
    syncBtnStart: '演示多人围聊时同步亮灯',
    syncBtnStop: '结束演示',
    syncActiveText: '3 台 Mac 上的 Bar 正在听同一段工位讨论，会自动合并成一条记录',
    lidTitle: '合上笔记本，它还在工作',
    lidSub: '散会合盖走出会议室时补的那一句，不会漏掉。回到工位打开盖子，记录卡已经在等你。',
    lidClosedLabel: '合盖待机 · 呼吸绿灯',
    lidOpenLabel: '已开盖 · 正常连接',
    lidToggleBtn: '切换合盖状态',
    privacySectionLabel: '隐私边界',
    lockedText: '固定开启',

    // Director
    ddTitle: '拍摄演示分镜',
    ddSub: '仅用于内容部录屏，按 H 隐藏底部入口',
    shotDTitle: '访客开口 · 顶灯不亮',
    shotDDesc: '未加入的人说话，直接忽略且右上角给安静提示',
    shotS1Title: '拨动物理静音 · 露出橙标',
    shotS1Desc: '硬断麦、指示灯熄灭',
    shotATitle: '工位改日期 + 两人确认',
    shotADesc: '右上角弹出记录卡，点击确认后同步到工具',
    shotCTitle: '谁记错了 · 听原话',
    shotCDesc: '展开时间点与原声波形',
    shotETitle: '一句话交给 Agent',
    shotEDesc: '引用刚确认的决定起草发给客户的更新',
    shotL4Title: '三台 Mac 一起亮灯',
    shotL4Desc: '工位旁多人讨论，自动合并为同一条记录',
    ddToggleMenubar: '显示模拟 macOS 顶部菜单栏',
    ddToggleSound: '物理开关拨动轻响',
    ddCleanMode: '纯净录屏（H）',
    ddReset: '恢复初始状态',
    undo: '撤销'
  },

  en: {
    menuFile: 'File',
    menuEdit: 'Edit',
    menuView: 'View',
    navVoiceprints: 'Team',
    navDecisions: 'Decisions',
    navIntegrations: 'Tools & Agent',
    navDevices: 'Devices & Privacy',
    sidebarSub: 'Enrolled teammates only',
    directorBtn: 'Demo shots',
    disclaimerText: 'Concept preview (no physical prototype yet) · Fictional teammates, voices, and notes',

    mbpEnrolled: 'enrolled',
    mbpPending: 'to confirm',
    mbpMuteBtn: 'Toggle mute',
    mbpCardBtn: 'Latest note',

    stateReady: 'Ready',
    stateInput: 'Listening',
    stateVisitor: 'Unenrolled voice ignored',
    stateMute: 'Muted',
    hwSubReady: 'Connected · Breathing green',
    hwSubInput: 'Teammate speaking · Amber light',
    hwSubVisitor: 'Unrecognized voice · Light stays off',
    hwSubMute: 'Physical switch muted · Orange mark visible',

    vpPageTitle: 'Team',
    vpPageSub: 'Rutta Bar only recognizes people on this list. Anyone else speaks, the light stays off and nothing is saved.',
    addMemberBtn: 'Add teammate',
    deskBarIdleQuote: 'Plugged into your Mac and quietly standing by. Click the physical switch to mute, or test a visitor voice.',
    deskBarVisitorQuote: 'Unenrolled voice detected. Top indicator stayed dark and the audio was dropped—never transcribed or saved.',
    deskBarMuteQuote: 'The side switch physically cuts the mic and turns the top light off. It stays muted across reconnects.',
    deskBarPausedQuote: 'This teammate paused their voiceprint, so their speech is ignored for now.',
    tryVisitorLink: 'Test a visitor voice',
    tryStandbyLink: 'Back to ready',
    tryMuteLink: 'Slide mute switch',
    tryUnmuteLink: 'Unmute',

    filterAll: 'All',
    filterActive: 'Active',
    filterPaused: 'Paused',
    searchPlaceholder: 'Filter people…',
    btnTestVoice: 'Test',
    btnReenroll: 'Re-record',
    btnRemove: 'Remove',
    pausedLabel: 'Paused',
    rosterFootNote: 'Each person records one short line once and can pause or remove their voiceprint anytime.',
    emptyRoster: 'No one matches that filter.',

    finishSilver: 'Silver',
    finishSky: 'Sky Blue',
    finishStarlight: 'Starlight',
    finishMidnight: 'Midnight',

    enrollTitle: 'Add a teammate',
    enrollTitleReenroll: 'Record voice again',
    enrollSub: 'One short sentence is enough. Anyone can pause or leave whenever they want.',
    fieldName: 'Name',
    fieldRole: 'Role',
    fieldFinish: 'Their Rutta Bar',
    vcPromptLabel: 'Read this line in your normal voice',
    vcIdle: 'Ready when you are',
    vcSampling: 'Learning voice…',
    vcDone: 'Got it—voice added',
    vcStartBtn: 'Simulate 3s sample',
    vcRealMicBtn: 'Use my mic',
    vcResampleBtn: 'Record again',
    cancel: 'Cancel',
    enrollConfirmBtn: 'Add to team',

    deleteTitle: 'Remove voiceprint',
    deleteNote: 'Once removed, Rutta Bar will no longer recognize this voice—the light stays dark when they speak and nothing is kept. Confirmed team notes stay as they are.',
    deleteConfirmBtn: 'Remove',

    decPageTitle: 'Decisions',
    decPageSub: 'Spoken notes stay private to the people in the room until someone confirms them for the team.',
    decFilterPending: 'To confirm',
    decFilterSynced: 'Shared',
    decFilterMonday: 'Monday follow-ups',
    decFilterAll: 'All',
    statePendingShort: 'Private until confirmed',
    stateSyncedShort: 'Shared',
    stateMondayShort: 'No owner yet',
    ownerPrefix: 'Owner',
    unassigned: 'Unassigned',
    assignOwnerPlaceholder: 'Assign to…',
    confirmedSuffix: 'confirmed',
    confirmActionSuffix: 'Confirm & share',
    syncedPrefix: 'Shared to',
    btnQuote: 'Hear quote',
    btnHideQuote: 'Hide',
    btnHandoff: 'Hand off',
    btnDeleteRec: 'Delete',
    quotePrivacyNote: 'Only participants present can play this clip — admins cannot',
    quoteTitle: 'Original moment',

    ncDecisionBrand: 'Just captured',
    ncVisitorBrand: 'Unenrolled voice',
    ncVisitorTitle: '1 unenrolled speaker was ignored',
    ncVisitorBody: 'Not in your team roster. The top light stayed off and the audio was discarded.',
    ncOpenLink: 'Open',

    intPageTitle: 'Tools & Agent',
    intPageSub: 'Confirmed decisions flow into the tools your team already uses, or straight to your Agent.',
    agentHeading: 'Hand off to your Agent',
    agentSub: 'Say or type what should happen next—it pulls directly from your confirmed decisions.',
    agentPlaceholder: 'e.g. Draft a short client note about moving launch to Dec 10…',
    agentRunBtn: 'Draft it',
    agentApproveBtn: 'Approve & send',
    agentApprovedDone: 'Sent',
    toolsSectionLabel: 'Connected tools & MCP',
    btnTestSync: 'Send test',
    btnCopyMcp: 'Copy URI',

    devPageTitle: 'Devices & Privacy',
    devPageSub: 'Every Rutta Bar plugged in at the office, and the boundaries the team agreed on.',
    barsSectionLabel: 'Bars in the studio',
    syncBtnStart: 'Preview multi-Bar sync',
    syncBtnStop: 'Stop preview',
    syncActiveText: '3 Bars are hearing the same desk huddle and merging it into one shared note',
    lidTitle: 'Still listening when the lid is shut',
    lidSub: 'Close your MacBook leaving a room and finish the thought—the note is waiting when you open it back up.',
    lidClosedLabel: 'Lid closed · Breathing green',
    lidOpenLabel: 'Lid open · Ready',
    lidToggleBtn: 'Toggle lid state',
    privacySectionLabel: 'Privacy boundaries',
    lockedText: 'Always on',

    ddTitle: 'Demo shots',
    ddSub: 'For screen recording. Press H to hide subtle controls.',
    shotDTitle: 'Visitor speaks · light stays off',
    shotDDesc: 'Unenrolled speaker ignored with quiet notice',
    shotS1Title: 'Physical mute · orange mark',
    shotS1Desc: 'Cuts mic capture and turns top light off',
    shotATitle: 'Desk date change + confirm',
    shotADesc: 'Shows notification card and confirms into tools',
    shotCTitle: 'Who remembered wrong? · quote',
    shotCDesc: 'Opens original spoken timestamp & waveform',
    shotETitle: 'Hand off to Agent',
    shotEDesc: 'Drafts client update citing the decision',
    shotL4Title: '3 Macs light up together',
    shotL4Desc: 'Team huddle deduplicated across nearby Bars',
    ddToggleMenubar: 'Show simulated macOS top bar',
    ddToggleSound: 'Subtle switch click sound',
    ddCleanMode: 'Clean screen (H)',
    ddReset: 'Reset state',
    undo: 'Undo'
  }
};

window.createInitialRuttaState = function () {
  return {
    lang: 'zh',
    activeTab: 'voiceprints',
    showMenubar: false,
    soundEnabled: true,
    cleanShot: false,
    multiBarSync: false,
    lidClosed: true,
    blockedVisitorsToday: 3,

    hwState: 'ready', // ready | input | visitor | mute
    activeSpeakerId: null,

    vpSearch: '',
    vpFilter: 'all',
    decFilter: 'all',
    expandedQuoteId: null,
    highlightedDecisionId: null,

    members: [
      {
        id: 'maya',
        name: 'Maya Lin',
        role: { zh: '产品设计', en: 'Product Design' },
        avatar: 'assets/persona-designer-720.webp',
        initials: 'ML',
        tone: '#E5E1D8',
        finish: 'silver',
        barName: 'MacBook Air',
        barState: 'online',
        lastHeard: { zh: '今天 14:19 识别过', en: 'Heard today, 14:19' },
        active: true,
        bars: [32, 66, 92, 52, 78, 42, 95, 60, 74, 38],
        sampleUtterance: {
          zh: '“上线日期别卡 12 月 3 号了，改成 12 月 10 号更稳妥，Leo 你改一下 Linear。”',
          en: '"Let’s move launch from Dec 3 to Dec 10—Leo, can you update Linear?"'
        }
      },
      {
        id: 'leo',
        name: 'Leo Park',
        role: { zh: '工程', en: 'Engineering' },
        avatar: null,
        initials: 'LP',
        tone: '#DDE3E0',
        finish: 'midnight',
        barName: 'MacBook Air',
        barState: 'online',
        lastHeard: { zh: '今天 14:19 识别过', en: 'Heard today, 14:19' },
        active: true,
        bars: [58, 40, 82, 94, 46, 70, 54, 88, 42, 76],
        sampleUtterance: {
          zh: '“好，周五用户测试就带银色那台，我周四中午前把新版包发给你。”',
          en: '"Got it. We’ll test the Silver build Friday—I’ll send it by Thursday noon."'
        }
      },
      {
        id: 'sam',
        name: 'Sam Rivera',
        role: { zh: '用户研究', en: 'Research' },
        avatar: 'assets/persona-researcher-720.webp',
        initials: 'SR',
        tone: '#E2E0E8',
        finish: 'sky',
        barName: 'MacBook Air',
        barState: 'lid_closed',
        lastHeard: { zh: '24 分钟前识别过', en: 'Heard 24m ago' },
        active: true,
        bars: [46, 82, 50, 72, 92, 58, 44, 80, 86, 48],
        sampleUtterance: {
          zh: '“Acme 那份 8 人档位报价我周一中午前发过去。”',
          en: '"I’ll send Acme the revised 8-seat quote before Monday noon."'
        }
      },
      {
        id: 'chloe',
        name: 'Chloe Wu',
        role: { zh: '内容', en: 'Content' },
        avatar: 'assets/persona-teacher-720.webp',
        initials: 'CW',
        tone: '#EAE0D5',
        finish: 'starlight',
        barName: 'MacBook Air',
        barState: 'muted',
        lastHeard: { zh: '昨天识别过 · 目前静音', en: 'Yesterday · Muted' },
        active: true,
        bars: [70, 48, 62, 88, 42, 82, 74, 46, 90, 58],
        sampleUtterance: {
          zh: '“合盖 10 分钟以后能不能接着亮灯拾音，下周得有人补测一下。”',
          en: '"We should double-check lid-closed wakeup capture next week."'
        }
      },
      {
        id: 'alex',
        name: 'Alex Chen',
        role: { zh: '前端', en: 'Frontend' },
        avatar: null,
        initials: 'AC',
        tone: '#E4E2DD',
        finish: 'silver',
        barName: 'MacBook Air',
        barState: 'online',
        lastHeard: { zh: '已暂停识别', en: 'Paused' },
        active: false,
        bars: [38, 60, 74, 44, 84, 52, 66, 88, 50, 40],
        sampleUtterance: {
          zh: '“我这边先暂停一会儿。”',
          en: '"Pausing my voiceprint for a bit."'
        }
      }
    ],

    decisions: [
      {
        id: 'dec-launch',
        status: 'pending',
        title: {
          zh: '上线日期从 12 月 3 日推迟到 12 月 10 日',
          en: 'Move launch date from Dec 3 to Dec 10'
        },
        summary: {
          zh: '给联调测试留多一周缓冲，Leo 负责顺延 Linear 里的排期和关联任务。',
          en: 'Give final QA an extra week. Leo will shift the Linear milestone and linked tasks.'
        },
        ownerId: 'leo',
        due: { zh: '12 月 10 日', en: 'Dec 10' },
        context: { zh: '2 分钟前 · 工位旁', en: '2m ago · By the desk' },
        visitorIgnoredCount: 0,
        participants: [
          { memberId: 'maya', confirmed: true },
          { memberId: 'leo', confirmed: false }
        ],
        syncedTools: ['Linear RUT-48', 'Notion', 'Slack #product'],
        quoteDuration: '0:12',
        quotes: [
          {
            ts: '14:19:08',
            speaker: 'Maya',
            key: true,
            zh: '“上线日期别卡 12 月 3 号了，改成 12 月 10 号更稳妥，你觉得呢？”',
            en: '"Let’s not squeeze Dec 3—moving launch to Dec 10 gives QA breathing room."'
          },
          {
            ts: '14:19:15',
            speaker: 'Leo',
            key: true,
            zh: '“同意，我来把 Linear 和发布计划里的日期顺延一周。”',
            en: '"Agreed. I’ll push the Linear milestone and release plan out a week."'
          }
        ]
      },
      {
        id: 'dec-quote',
        status: 'pending',
        title: {
          zh: '周一中午前把修订版报价发给 Acme 团队',
          en: 'Send revised quote to Acme before Monday noon'
        },
        summary: {
          zh: '散会前定下按 8 人团队档位重新核算，Sam 负责整理发送。',
          en: 'Agreed to re-quote at the 8-seat tier before wrapping up; Sam will send it over.'
        },
        ownerId: 'sam',
        due: { zh: '周一 12:00', en: 'Mon noon' },
        context: { zh: '24 分钟前 · 会议室 B', en: '24m ago · Room B' },
        visitorIgnoredCount: 1,
        participants: [
          { memberId: 'maya', confirmed: true },
          { memberId: 'sam', confirmed: false }
        ],
        syncedTools: ['Linear RUT-51', 'Notion'],
        quoteDuration: '0:16',
        quotes: [
          {
            ts: '13:56:41',
            speaker: 'Sam',
            key: true,
            zh: '“那 Acme 这单我周一中午前把 8 人档位的报价发过去。”',
            en: '"I’ll get the updated 8-seat quote over to Acme before Monday noon."'
          },
          {
            ts: '13:56:48',
            speaker: 'Maya',
            key: false,
            zh: '“好，发之前在 Slack 同步我一眼就行。”',
            en: '"Great—just ping me in Slack before it goes out."'
          }
        ]
      },
      {
        id: 'dec-silver',
        status: 'synced',
        title: {
          zh: '周五用户测试统一带银色（Silver）样机',
          en: 'Bring the Silver prototype for Friday’s user test'
        },
        summary: {
          zh: '比对四款配色后确定首轮测试用银色机身，Leo 周四中午前交付测试固件。',
          en: 'Picked Silver after comparing finishes side by side; Leo delivers the test build Thursday noon.'
        },
        ownerId: 'leo',
        due: { zh: '周四 12:00', en: 'Thu noon' },
        context: { zh: '3 天前 · 设计评审', en: '3d ago · Design review' },
        visitorIgnoredCount: 0,
        participants: [
          { memberId: 'maya', confirmed: true },
          { memberId: 'leo', confirmed: true }
        ],
        syncedTools: ['Linear RUT-42', 'Notion', 'Slack #hardware'],
        quoteDuration: '0:14',
        quotes: [
          {
            ts: '10:42:04',
            speaker: 'Maya',
            key: false,
            zh: '“周五给测试团队带哪一款配色过去？”',
            en: '"Which finish are we bringing to Friday’s user test?"'
          },
          {
            ts: '10:42:09',
            speaker: 'Leo',
            key: true,
            zh: '“就选银色那台。我周四中午前把新版发给你。”',
            en: '"The Silver one. I’ll send the new build by Thursday noon."'
          }
        ]
      },
      {
        id: 'dec-monday',
        status: 'monday',
        title: {
          zh: '补测 Mac 合盖休眠 10 分钟后的拾音唤醒',
          en: 'Check lid-closed wakeup capture after 10 min sleep'
        },
        summary: {
          zh: '上周站会口头提到但当时没定谁来跟，今早整理进了未跟进清单。',
          en: 'Mentioned during standup without an owner—surfaced in Monday follow-ups.'
        },
        ownerId: null,
        due: { zh: '本周内', en: 'This week' },
        context: { zh: '上周站会', en: 'Last standup' },
        visitorIgnoredCount: 0,
        participants: [
          { memberId: 'maya', confirmed: true },
          { memberId: 'chloe', confirmed: true }
        ],
        syncedTools: ['Linear RUT-53'],
        quoteDuration: '0:09',
        quotes: [
          {
            ts: '09:34:12',
            speaker: 'Chloe',
            key: true,
            zh: '“对了，合盖 10 分钟以后能不能接着亮灯拾音，下周得有人补测一下。”',
            en: '"Someone should check if lid-closed capture wakes cleanly after 10 minutes of sleep."'
          }
        ]
      }
    ],

    integrations: [
      {
        id: 'linear',
        name: 'Linear',
        letter: 'L',
        enabled: true,
        desc: { zh: '带负责人的口头待办，确认后自动建任务', en: 'Create assigned issues once a spoken commitment is confirmed' },
        target: 'Rutta Core'
      },
      {
        id: 'notion',
        name: 'Notion',
        letter: 'N',
        enabled: true,
        desc: { zh: '确认后的决定自动记入团队文档，带上时间出处', en: 'Append confirmed decisions and timestamps to team docs' },
        target: 'Team Decisions'
      },
      {
        id: 'slack',
        name: 'Slack',
        letter: '#',
        enabled: true,
        desc: { zh: '有变更时发一条简短摘要到对应频道', en: 'Post a short note to the channel after confirmation' },
        target: '#product'
      },
      {
        id: 'mcp',
        name: 'MCP',
        letter: 'M',
        enabled: true,
        desc: { zh: '给 Claude、Cursor 或团队自己的 Agent 读取已确认上下文', en: 'Let Claude, Cursor, or your own Agents read confirmed notes' },
        target: 'mcp://rutta.local/v1/northstar'
      }
    ],

    agentResult: null,
    agentApproved: false,

    policies: [
      {
        id: 'whitelist',
        locked: false,
        enabled: true,
        title: { zh: '只记已加入的成员', en: 'Enrolled teammates only' },
        desc: { zh: '访客或未加入同事说话时，设备不亮灯，音频直接丢弃，不转写也不保存。', en: 'When visitors or non-members speak, the light stays off and audio is dropped.' }
      },
      {
        id: 'two-party',
        locked: false,
        enabled: true,
        title: { zh: '先给在场的人看，确认再分享', en: 'Private to participants first' },
        desc: { zh: '新记下的事默认只有对话里的人能看到，点确认后才进入团队空间和工具。', en: 'Notes stay visible only to people in the conversation until confirmed.' }
      },
      {
        id: 'no-admin-audio',
        locked: true,
        enabled: true,
        title: { zh: '管理员看不到原始录音', en: 'Admins cannot access raw audio' },
        desc: { zh: '后台只能管理成员名单和同步去向，系统本身不提供回听他人原声的权限。', en: 'Workspace settings cover membership and routing only—raw audio is never exposed.' }
      },
      {
        id: 'self-delete',
        locked: false,
        enabled: true,
        title: { zh: '随时退出、自己删记录', en: 'Leave or delete anytime' },
        desc: { zh: '任何人都可以随时移除自己的声纹，或删掉自己参与过的任何一条记录。', en: 'Anyone can remove their voiceprint or delete a note they were part of.' }
      }
    ]
  };
};
