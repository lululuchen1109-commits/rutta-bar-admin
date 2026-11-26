/* Bilingual i18n dictionary & rich initial demo dataset for Rutta Bar Admin Console */

window.RUTTA_I18N = {
  zh: {
    menuFile: '文件',
    menuEdit: '编辑',
    menuView: '显示',
    menuPrivacy: '隐私',
    navVoiceprints: '声纹管理',
    navDecisions: '口头决定',
    navIntegrations: '工具与 Agent',
    navDevices: '设备与隐私',
    sidebarPrivacyNote: '声纹白名单开启 · 管理者不可见原始音频',
    directorBtn: '宣发演示脚本',
    conceptBadge: '概念演示 · 模拟数据',
    addVoiceprintBtn: '录入成员声纹',
    disclaimerText: '概念界面演示（暂无实物样机）· 页面中的成员、声纹与对话均为虚构示意，设计目标为仅处理已加入成员发言。',

    // Menu bar popover
    mbpEnrolled: '已加入声纹',
    mbpPending: '待确认记录',
    mbpBlocked: '今日拦截访客',
    mbpMuteBtn: '拨动物理静音',
    mbpCardBtn: '弹出记录卡',

    // Hardware states
    stateReady: '待机侦测',
    stateInput: '已识别 · 捕捉中',
    stateVisitor: '访客 · 已忽略',
    stateMute: '物理静音',
    hwSubReady: 'USB-C 已连接 · 顶面绿灯缓慢呼吸',
    hwSubInput: '已匹配团队声纹 · 顶面黄灯常亮',
    hwSubVisitor: '未加入者发言 · 顶灯不亮，音频实时丢弃',
    hwSubMute: '机械滑键已拨至静音 · 橙标外露，硬件断麦',
    hwClickSwitchHint: '点击实物滑键可切换物理静音 →',

    // Voiceprints view
    sandboxEyebrow: '隐私可视化 · 现场状态模拟',
    sandboxTitle: '只有已加入声纹才被识别，访客开口灯不亮',
    chipStandby: '待机',
    chipVisitor: '未加入访客',
    chipMute: '物理静音',
    readoutReadySpeaker: 'Rutta Bar 待机中（呼吸绿灯）',
    readoutReadyText: '插在 Mac 左侧 USB-C 口随时在线，不需手动点「开始录音」。点击上方任意角色测试声纹门禁与灯光响应。',
    readoutVisitorSpeaker: '未识别声纹（访客 / 未加入同事）',
    readoutVisitorScore: '未命中白名单 · 0 留存',
    readoutVisitorText: '检测到非白名单人声：顶部状态灯保持熄灭/静止，音频帧直接丢弃，不转写、不保存、不进记录。',
    readoutMuteSpeaker: '硬件物理静音已开启',
    readoutMuteScore: '橙色机械标记外露',
    readoutMuteText: '侧边滑键已硬件切断麦克风采集，顶部指示灯熄灭，合盖或重新连接后依然保持静音位。',
    readoutPausedSpeaker: '该成员已暂停声纹识别',
    readoutPausedScore: '已暂停 · 按访客处理',
    readoutPausedText: '成员已主动暂停声纹匹配，当前发言不会被转写或记录。随时可在下方重新开启。',
    readoutMatchScore: '声纹匹配度',

    rosterTitle: '团队声纹白名单',
    rosterSub: '每位成员仅需录入一次，可随时暂停或彻底删除声纹退出记录。',
    searchPlaceholder: '搜索成员姓名或角色…',
    filterAll: '全部',
    filterActive: '已启用',
    filterPaused: '已暂停',
    btnTestVoice: '试音',
    btnReenroll: '重录',
    btnDelete: '删除',
    statusActive: '识别中',
    statusPaused: '已暂停',
    emptyRoster: '没有匹配的团队成员，可点击右上角录入新成员声纹。',

    // Finishes
    finishSilver: '银色',
    finishSky: '天蓝色',
    finishStarlight: '星光色',
    finishMidnight: '午夜色',

    // Enroll modal
    enrollTitle: '录入新成员声纹',
    enrollTitleReenroll: '重新录入声纹',
    enrollSub: '仅需朗读数秒校准句，系统只识别已加入成员，随时可一键删除退出。',
    fieldName: '成员姓名',
    fieldRole: '团队角色',
    fieldFinish: '配对的 Rutta Bar 配色',
    vcPromptLabel: '请朗读以下校准句（或点击一键模拟采样）',
    vcIdle: '等待声纹采样…',
    vcSampling: '正在提取声纹特征向量…',
    vcDone: '声纹采样完成 · 区分度 98.6%（可用于白名单过滤）',
    vcStartBtn: '开始 3 秒模拟采样',
    vcRealMicBtn: '使用本机麦克风试采',
    vcResampleBtn: '重新采样',
    cancel: '取消',
    enrollConfirmBtn: '保存并加入声纹白名单',

    // Delete modal
    deleteTitle: '移除成员声纹？',
    deleteImpact1: '• 声纹特征向量立即从团队空间销毁',
    deleteImpact2: '• 该成员之后的发言将被 Rutta Bar 视为未加入访客，直接丢弃且灯不亮',
    deleteImpact3: '• 已确认的历史文档记录不受影响，仍可按需单独删除',
    deleteConfirmBtn: '确认删除声纹',

    // Decisions view
    decFilterAll: '全部记录',
    decFilterPending: '待当事人确认',
    decFilterSynced: '已同步团队空间',
    decFilterMonday: '周一未跟进清单',
    decHint: '记录默认仅当时在场成员可见，确认后才流转至团队知识库与工具。',
    badgePending: '仅当事成员可见 · 待确认',
    badgeSynced: '已确认 · 同步至团队空间',
    badgeMonday: '周一清单 · 待认领',
    ownerLabel: '负责人',
    dueLabel: '时间',
    sourceLabel: '来源',
    unassigned: '暂未指派',
    assignOwnerPlaceholder: '一键指派负责人…',
    confirmPrompt: '双方确认后进入团队空间：',
    confirmedTag: '已确认',
    clickToConfirm: '点击确认',
    btnQuote: '调出原话',
    btnHideQuote: '收起原话',
    btnHandoff: '交给 Agent',
    btnDeleteRec: '删除',
    quoteLockNote: '🔒 原始片段仅当时在场成员可听，管理者不可见',
    quoteHeader: '原话时间点证据 · 解决「谁记错了」',
    syncedToPrefix: '已自动同步：',

    // Floating notification card
    fcHeaderDecision: '刚捕捉到一条口头决定',
    fcHeaderVisitor: '隐私防护 · 访客已拦截',
    fcVisitorTitle: '1 位未加入成员发言未记录',
    fcVisitorBody: 'Rutta Bar 识别到未在声纹白名单中的声音，顶部指示灯保持静止，该段语音已直接丢弃。',
    fcOpenDetail: '在后台查看',

    // Integrations & Agent
    agentTitle: '一句话交给 Agent',
    agentSub: '回到工位说一句，Agent 自动读取已确认的口头决定与出处，直接起草动作。',
    agentPlaceholder: '试试输入或点下方语音指令：例如「把刚才定的上线延期发给客户」…',
    agentRunBtn: '执行交接',
    agentRunning: '正在检索已确认口头决定并生成…',
    agentDraftLabel: 'Agent 已自动引用口头决定起草完成',
    agentApproveBtn: '确认发送 / 创建',
    agentApprovedDone: '✓ 已发送执行',
    toolsTitle: '团队工具与开放 MCP 接口',
    toolsSub: '沉淀下来的决定属于团队，自动流向 Linear、Notion、Slack 或任意支持 MCP 的 Agent。',
    btnTestSync: '测试同步',
    btnCopyMcp: '复制 MCP 地址',
    mcpNote: '开放权限：仅暴露已确认的结构化决定与待办，永不暴露原始音频。',

    // Devices & Privacy
    syncTitle: '团队多台 Rutta Bar 同频同步',
    syncSub: '同事围着工位讨论时，相邻 Mac 上的多台 Bar 自动同色亮灯、去重合并为同一条团队决定。',
    syncBtnStart: '模拟 3 台 Mac 同步亮灯',
    syncBtnStop: '结束同步演示',
    syncActiveMsg: '3 台 Rutta Bar 正同步捕捉同一场工位讨论 · 自动去重合并',
    lidTitle: 'Mac 合盖休眠，Rutta Bar 仍在工作',
    lidSub: '合上笔记本走出会议室时补一句，侧边呼吸灯持续待机，回工位开盖即见待确认记录卡。',
    lidStatusClosed: '已合盖 · 呼吸绿灯待机中',
    lidStatusOpen: '已开盖 · 桌面就绪',
    lidToggleBtn: '切换合盖 / 开盖状态',
    privacyTitle: '四条核心隐私设计原则',
    privacySub: '默认透明可见，硬件物理断麦 + 软件白名单双重保障。',
    lockedBadge: '硬锁定 · 不可关闭',

    // Director
    ddTitle: '🎬 内容部拍片导演台',
    ddSub: '一键触发宣发调研 P0 核心分镜',
    shotATitle: '工位改日期 + 双人确认',
    shotADesc: '右上角弹出记录卡，点击头像同步工具',
    shotDTitle: '访客来了 · 灯光不亮',
    shotDDesc: '未加入者说话，灯纹丝不动且直接丢弃',
    shotCTitle: '谁记错了 · 调出原话',
    shotCDesc: '定位时间戳并播放当事人原话声波',
    shotETitle: '一句话交给 Agent',
    shotEDesc: '自动引用刚定下的方案起草邮件',
    shotL4Title: '多台 Bar 同频共振',
    shotL4Desc: '三台 Mac 同色亮灯，区分个人录音笔',
    shotS1Title: '物理静音 · 露出橙标',
    shotS1Desc: '滑键咔哒拨动，顶灯熄灭硬断麦',
    ddToggleMenubar: '显示顶部 macOS 菜单栏（适合录屏）',
    ddToggleSound: '物理拨键微音效',
    ddCleanMode: '纯净录屏模式（按 H 恢复）',
    ddReset: '重置演示数据',
    undo: '撤销'
  },

  en: {
    menuFile: 'File',
    menuEdit: 'Edit',
    menuView: 'View',
    menuPrivacy: 'Privacy',
    navVoiceprints: 'Voiceprints',
    navDecisions: 'Decisions',
    navIntegrations: 'Tools & Agent',
    navDevices: 'Devices & Privacy',
    sidebarPrivacyNote: 'Voiceprint gate active · Admins cannot access raw audio',
    directorBtn: 'Demo Shot Director',
    conceptBadge: 'Concept Demo · Simulated',
    addVoiceprintBtn: 'Add Voiceprint',
    disclaimerText: 'Concept UI demo (no physical prototype yet) · Simulated voiceprints and fictional team conversations. Designed to process enrolled members only.',

    mbpEnrolled: 'Enrolled',
    mbpPending: 'Pending',
    mbpBlocked: 'Visitors ignored',
    mbpMuteBtn: 'Toggle Mute Switch',
    mbpCardBtn: 'Show Capture Card',

    stateReady: 'Standby',
    stateInput: 'Capturing',
    stateVisitor: 'Visitor Ignored',
    stateMute: 'Hardware Muted',
    hwSubReady: 'USB-C connected · Top green LED breathing',
    hwSubInput: 'Enrolled speaker matched · Solid amber LED',
    hwSubVisitor: 'Unenrolled voice · LED stays still, audio dropped',
    hwSubMute: 'Physical switch muted · Orange mark visible, mic cut',
    hwClickSwitchHint: 'Click the physical switch on the Bar to mute →',

    sandboxEyebrow: 'Visible Privacy · Live Hardware Test',
    sandboxTitle: 'Only enrolled teammates trigger capture. Visitors never light the LED.',
    chipStandby: 'Standby',
    chipVisitor: 'Unenrolled Visitor',
    chipMute: 'Physical Mute',
    readoutReadySpeaker: 'Rutta Bar Ready (Breathing Green)',
    readoutReadyText: 'Plugged into your MacBook Air USB-C port—no "start recording" button needed. Pick a speaker above to test the voiceprint gate.',
    readoutVisitorSpeaker: 'Unrecognized Voice (Visitor / Non-member)',
    readoutVisitorScore: 'Not in roster · 0 bytes kept',
    readoutVisitorText: 'Unenrolled speaker detected: the top indicator light stays still/unlit, audio is discarded immediately—never transcribed or saved.',
    readoutMuteSpeaker: 'Hardware Physical Mute Engaged',
    readoutMuteScore: 'Orange mechanical mark exposed',
    readoutMuteText: 'Side slide switch physically cuts mic capture. The top light turns completely off and keeps its position across reconnects.',
    readoutPausedSpeaker: 'Member Voiceprint Paused',
    readoutPausedScore: 'Paused · Treated as visitor',
    readoutPausedText: 'This teammate paused their voiceprint. Their speech is ignored until they re-enable it below.',
    readoutMatchScore: 'Voiceprint match',

    rosterTitle: 'Team Voiceprint Roster',
    rosterSub: 'Enroll once in seconds. Any teammate can pause or permanently delete their voiceprint anytime.',
    searchPlaceholder: 'Search teammate or role…',
    filterAll: 'All',
    filterActive: 'Active',
    filterPaused: 'Paused',
    btnTestVoice: 'Test',
    btnReenroll: 'Re-enroll',
    btnDelete: 'Delete',
    statusActive: 'Active',
    statusPaused: 'Paused',
    emptyRoster: 'No matching teammates found. Click "Add Voiceprint" to enroll someone.',

    finishSilver: 'Silver',
    finishSky: 'Sky Blue',
    finishStarlight: 'Starlight',
    finishMidnight: 'Midnight',

    enrollTitle: 'Enroll Teammate Voiceprint',
    enrollTitleReenroll: 'Re-enroll Voiceprint',
    enrollSub: 'Read one short phrase to create a voiceprint signature. Designed to recognize opted-in teammates only.',
    fieldName: 'Member Name',
    fieldRole: 'Role',
    fieldFinish: 'Paired Rutta Bar Finish',
    vcPromptLabel: 'Read this calibration line (or run a 3-second simulated sample)',
    vcIdle: 'Ready for voice sampling…',
    vcSampling: 'Extracting unique voiceprint embedding…',
    vcDone: 'Voiceprint ready · 98.6% separation score',
    vcStartBtn: 'Run 3s Simulated Sample',
    vcRealMicBtn: 'Try Real Microphone',
    vcResampleBtn: 'Sample Again',
    cancel: 'Cancel',
    enrollConfirmBtn: 'Save & Add to Whitelist',

    deleteTitle: 'Remove teammate voiceprint?',
    deleteImpact1: '• Voiceprint vector is permanently deleted from this workspace',
    deleteImpact2: '• Future speech is treated as an unenrolled visitor—LED stays dark and audio is discarded',
    deleteImpact3: '• Already-confirmed team notes stay intact unless deleted individually',
    deleteConfirmBtn: 'Delete Voiceprint',

    decFilterAll: 'All',
    decFilterPending: 'Needs Confirmation',
    decFilterSynced: 'Synced to Workspace',
    decFilterMonday: 'Monday Digest',
    decHint: 'Captured notes are private to participants by default until confirmed into team tools.',
    badgePending: 'Participants only · Pending',
    badgeSynced: 'Confirmed · Synced to team',
    badgeMonday: 'Monday Digest · Unowned',
    ownerLabel: 'Owner',
    dueLabel: 'Due',
    sourceLabel: 'Context',
    unassigned: 'Unassigned',
    assignOwnerPlaceholder: 'Assign owner…',
    confirmPrompt: 'Both confirm to share with team:',
    confirmedTag: 'Confirmed',
    clickToConfirm: 'Confirm',
    btnQuote: 'Source Quote',
    btnHideQuote: 'Hide Quote',
    btnHandoff: 'Send to Agent',
    btnDeleteRec: 'Delete',
    quoteLockNote: '🔒 Source clip accessible only to participants present — never to admins',
    quoteHeader: 'Timestamped Source Clip · Settle "Who Remembered Wrong?"',
    syncedToPrefix: 'Synced to:',

    fcHeaderDecision: 'Spoken decision captured',
    fcHeaderVisitor: 'Privacy Gate · Visitor Ignored',
    fcVisitorTitle: '1 unenrolled speaker not recorded',
    fcVisitorBody: 'Voice did not match any enrolled teammate. Top LED stayed still and the audio segment was discarded.',
    fcOpenDetail: 'View in Console',

    agentTitle: 'Hand Off to Agent in One Sentence',
    agentSub: 'Sit back down and ask your Agent to act—it automatically cites the confirmed spoken decision.',
    agentPlaceholder: 'Try a voice command: e.g. "Draft the Dec 10 launch update for the client"…',
    agentRunBtn: 'Run Handoff',
    agentRunning: 'Querying confirmed team decisions via MCP…',
    agentDraftLabel: 'Agent drafted action citing verified spoken decision',
    agentApproveBtn: 'Approve & Send',
    agentApprovedDone: '✓ Sent & Logged',
    toolsTitle: 'Connected Tools & Open MCP',
    toolsSub: 'Decisions stay yours—routed automatically to Linear, Notion, Slack, or any MCP-compatible Agent.',
    btnTestSync: 'Test Sync',
    btnCopyMcp: 'Copy MCP URI',
    mcpNote: 'Scope: Confirmed decisions & action items only. Raw audio is never exposed via API or MCP.',

    syncTitle: 'Multi-Bar Team Sync',
    syncSub: 'When teammates huddle around one desk, nearby Rutta Bars pulse in unison and deduplicate into one shared decision.',
    syncBtnStart: 'Simulate 3-Mac Team Sync',
    syncBtnStop: 'Stop Sync Demo',
    syncActiveMsg: '3 Rutta Bars synced on the same desk huddle · Deduplicating live',
    lidTitle: 'Works With Your MacBook Lid Closed',
    lidSub: 'Wrap up a hallway decision as you close your laptop—the side LED keeps breathing and the note waits when you wake.',
    lidStatusClosed: 'Lid closed · Breathing green',
    lidStatusOpen: 'Lid open · Desk ready',
    lidToggleBtn: 'Toggle Lid Open / Closed',
    privacyTitle: 'Four Core Privacy Design Principles',
    privacySub: 'Visible hardware trust paired with strict software boundaries.',
    lockedBadge: 'Hard-locked ON',

    ddTitle: '🎬 Video Demo Shot Director',
    ddSub: '1-click triggers for P0 marketing video scenes',
    shotATitle: 'Desk Date Change + 2-Person Confirm',
    shotADesc: 'Pops top-right card & animates tool sync',
    shotDTitle: 'Visitor Walks In · LED Stays Dark',
    shotDDesc: 'Unenrolled voice discarded, zero recording',
    shotCTitle: 'Who Remembered Wrong? · Source Quote',
    shotCDesc: 'Expands timestamped clip & waveform proof',
    shotETitle: 'Hand Off to Agent',
    shotEDesc: 'Cites spoken decision to draft client update',
    shotL4Title: '3 Macs Multi-Bar Sync',
    shotL4Desc: 'Synchronized team hardware glow',
    shotS1Title: 'Physical Mute · Orange Mark',
    shotS1Desc: 'Clicks switch to hard-cut mic & kill LED',
    ddToggleMenubar: 'Show macOS top menu bar (for screen recording)',
    ddToggleSound: 'Tactile mute switch click sound',
    ddCleanMode: 'Clean Recording Mode (Press H to restore)',
    ddReset: 'Reset Demo State',
    undo: 'Undo'
  }
};

window.createInitialRuttaState = function () {
  return {
    lang: 'zh',
    activeTab: 'voiceprints',
    showMenubar: true,
    soundEnabled: true,
    cleanShot: false,
    multiBarSync: false,
    lidClosed: true,
    blockedVisitorsToday: 3,

    // Hardware simulator state: ready | input | visitor | mute
    hwState: 'ready',
    activeSpeakerId: null, // member id or 'visitor' or null

    // Filters
    vpSearch: '',
    vpFilter: 'all',
    decFilter: 'all',
    expandedQuoteId: null,
    highlightedDecisionId: null,

    // Team Voiceprint Roster
    members: [
      {
        id: 'maya',
        name: 'Maya Lin',
        role: { zh: '产品设计', en: 'Product Designer' },
        avatar: 'assets/persona-designer-720.webp',
        initials: 'ML',
        color: '#2563EB',
        finish: 'silver',
        barName: "Maya's MacBook Air",
        barState: 'online',
        voiceHash: 'VP-9F2A',
        confidence: '98.4%',
        active: true,
        bars: [35, 68, 92, 54, 80, 44, 96, 62, 74, 38, 86, 52],
        sampleUtterance: {
          zh: '“上线日期我们改成 12 月 10 号吧，Leo 你同步更新下 Linear 排期。”',
          en: '"Let’s move the launch to Dec 10—Leo, can you update the Linear milestone?"'
        }
      },
      {
        id: 'leo',
        name: 'Leo Park',
        role: { zh: '工程负责人', en: 'Engineering Lead' },
        avatar: null,
        initials: 'LP',
        color: '#0F766E',
        finish: 'midnight',
        barName: "Leo's MacBook Air",
        barState: 'online',
        voiceHash: 'VP-4C8E',
        confidence: '97.9%',
        active: true,
        bars: [60, 42, 85, 95, 48, 70, 56, 90, 40, 78, 66, 46],
        sampleUtterance: {
          zh: '“没问题，周五用户测试就用银色样机，我周四中午前发新版包。”',
          en: '"Got it. We’ll test the Silver prototype Friday—I’ll ship the build by Thursday noon."'
        }
      },
      {
        id: 'sam',
        name: 'Sam Rivera',
        role: { zh: '用户研究', en: 'User Researcher' },
        avatar: 'assets/persona-researcher-720.webp',
        initials: 'SR',
        color: '#7C3AED',
        finish: 'sky',
        barName: "Sam's MacBook Air",
        barState: 'lid_closed',
        voiceHash: 'VP-7B1D',
        confidence: '96.8%',
        active: true,
        bars: [48, 84, 52, 72, 94, 60, 42, 82, 88, 50, 64, 76],
        sampleUtterance: {
          zh: '“刚才和 Acme 聊完，新版报价周一中午前发过去，访客刚说的那段不用记。”',
          en: '"After the Acme chat, let’s send the revised quote before Monday noon."'
        }
      },
      {
        id: 'chloe',
        name: 'Chloe Wu',
        role: { zh: '内容与增长', en: 'Content & Growth' },
        avatar: 'assets/persona-teacher-720.webp',
        initials: 'CW',
        color: '#EA580C',
        finish: 'starlight',
        barName: "Chloe's MacBook Air",
        barState: 'muted',
        voiceHash: 'VP-2E6B',
        confidence: '98.1%',
        active: true,
        bars: [72, 50, 64, 90, 42, 84, 76, 48, 92, 60, 44, 80],
        sampleUtterance: {
          zh: '“首期 X 和 LinkedIn 视频先把访客灯不亮那个镜头放前 3 秒。”',
          en: '"Let’s open the X launch clip with the visitor speaking while the LED stays dark."'
        }
      },
      {
        id: 'alex',
        name: 'Alex Chen',
        role: { zh: '全栈工程师', en: 'Full-Stack Eng' },
        avatar: null,
        initials: 'AC',
        color: '#475569',
        finish: 'silver',
        barName: "Alex's MacBook Air",
        barState: 'online',
        voiceHash: 'VP-5D0F',
        confidence: '97.2%',
        active: false,
        bars: [40, 62, 78, 46, 86, 54, 68, 92, 52, 40, 74, 58],
        sampleUtterance: {
          zh: '“我这边声纹先暂停一小时，等会私聊完再打开。”',
          en: '"Pausing my voiceprint for an hour while I take a personal call."'
        }
      }
    ],

    // Captured Spoken Decisions (Mapped to Demo Scenes A, D, C, F6)
    decisions: [
      {
        id: 'dec-launch',
        scene: 'A',
        status: 'pending',
        title: {
          zh: '上线日期从 12 月 3 日延后至 12 月 10 日',
          en: 'Move launch date from Dec 3 to Dec 10'
        },
        summary: {
          zh: '因联调测试顺延一周，发布节奏同步推迟 7 天，由 Leo 负责更新里程碑并通知关联任务。',
          en: 'Shift release milestone by one week for QA. Leo owns updating Linear dates and shifting dependent tasks.'
        },
        ownerId: 'leo',
        due: { zh: '12 月 10 日', en: 'Dec 10' },
        context: { zh: '工位旁讨论 · 2 分钟前', en: 'Desk huddle · 2m ago' },
        visitorIgnoredCount: 0,
        participants: [
          { memberId: 'maya', confirmed: true },
          { memberId: 'leo', confirmed: false }
        ],
        syncedTools: [
          { tool: 'Linear', detail: 'RUT-48' },
          { tool: 'Notion', detail: 'Release Plan' },
          { tool: 'Slack', detail: '#product' }
        ],
        quoteDuration: '0:12',
        quotes: [
          {
            ts: '14:19:08',
            speaker: 'Maya',
            key: true,
            zh: '“上线日期别卡 12 月 3 号了，改成 12 月 10 号更稳妥，你觉得呢？”',
            en: '"Let’s not rush Dec 3—moving launch to Dec 10 gives us room for QA."'
          },
          {
            ts: '14:19:15',
            speaker: 'Leo',
            key: true,
            zh: '“同意，我来把 Linear 和发布计划里的日期顺延一周。”',
            en: '"Agreed. I’ll shift the Linear milestone and release plan by a week."'
          }
        ]
      },
      {
        id: 'dec-quote',
        scene: 'D',
        status: 'pending',
        title: {
          zh: '周一中午前向 Acme 团队发送修订版报价',
          en: 'Send revised pricing quote to Acme before Monday noon'
        },
        summary: {
          zh: '会议室散会前口头定下按 8 人团队档位重新报价，由 Sam 整理后发给客户。',
          en: 'Agreed after hallway debrief to re-quote Acme at the 8-seat tier; Sam will send the updated sheet.'
        },
        ownerId: 'sam',
        due: { zh: '周一 12:00', en: 'Mon 12:00' },
        context: { zh: '会议室 B · 24 分钟前', en: 'Room B · 24m ago' },
        visitorIgnoredCount: 1,
        participants: [
          { memberId: 'maya', confirmed: true },
          { memberId: 'sam', confirmed: false }
        ],
        syncedTools: [
          { tool: 'Linear', detail: 'RUT-51' },
          { tool: 'Notion', detail: 'Client Notes' }
        ],
        quoteDuration: '0:16',
        quotes: [
          {
            ts: '13:56:41',
            speaker: 'Sam',
            key: true,
            zh: '“那 Acme 这单我周一中午前把 8 人档位的报价发过去。”',
            en: '"I’ll send Acme the updated 8-seat quote before Monday noon."'
          },
          {
            ts: '13:56:48',
            speaker: 'Maya',
            key: false,
            zh: '“好，发之前在 Slack 同步我一眼就行。”',
            en: '"Sounds good—just ping me in Slack before it goes out."'
          }
        ]
      },
      {
        id: 'dec-silver',
        scene: 'C',
        status: 'synced',
        title: {
          zh: '周五用户测试统一采用银色（Silver）样机',
          en: 'Use the Silver prototype for Friday’s user test'
        },
        summary: {
          zh: '评审对比四款配色后确定首轮测试使用银色机身，Leo 负责周四中午前交付测试固件。',
          en: 'Picked Silver finish after reviewing four anodized samples; Leo delivers Thursday noon test build.'
        },
        ownerId: 'leo',
        due: { zh: '周四 12:00', en: 'Thu 12:00' },
        context: { zh: '设计评审 · 3 天前', en: 'Design review · 3d ago' },
        visitorIgnoredCount: 0,
        participants: [
          { memberId: 'maya', confirmed: true },
          { memberId: 'leo', confirmed: true }
        ],
        syncedTools: [
          { tool: 'Linear', detail: 'RUT-42' },
          { tool: 'Notion', detail: 'Hardware Review' },
          { tool: 'Slack', detail: '#hardware' }
        ],
        quoteDuration: '0:14',
        quotes: [
          {
            ts: '10:42:04',
            speaker: 'Maya',
            key: false,
            zh: '“周五给测试团队带哪一款配色过去？”',
            en: '"Which finish are we testing with participants on Friday?"'
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
        scene: 'F',
        status: 'monday',
        title: {
          zh: '补充验证 Mac 合盖休眠 10 分钟后的连续拾音唤醒',
          en: 'Verify lid-closed wakeup capture after 10-min sleep'
        },
        summary: {
          zh: '上周站会口头提到但尚未指派负责人，已自动归入「周一清单」提醒认领。',
          en: 'Mentioned during last week’s standup with no owner named—surfaced automatically in Monday Digest.'
        },
        ownerId: null,
        due: { zh: '本周内', en: 'This week' },
        context: { zh: '周一清单 · 上周站会', en: 'Monday Digest · Standup' },
        visitorIgnoredCount: 0,
        participants: [
          { memberId: 'maya', confirmed: true },
          { memberId: 'chloe', confirmed: true }
        ],
        syncedTools: [
          { tool: 'Linear', detail: 'RUT-53' }
        ],
        quoteDuration: '0:09',
        quotes: [
          {
            ts: '09:34:12',
            speaker: 'Chloe',
            key: true,
            zh: '“对了，合盖 10 分钟以后能不能接着亮灯拾音，下周得有人补测一下。”',
            en: '"We should verify whether lid-closed capture wakes cleanly after 10 minutes of sleep."'
          }
        ]
      }
    ],

    // Integrations & MCP
    integrations: [
      {
        id: 'linear',
        name: 'Linear',
        color: '#5E6AD2',
        letter: 'L',
        enabled: true,
        desc: { zh: '自动将带负责人的口头待办建为 Issue 并同步截止日期', en: 'Auto-create assigned Issues with due dates from confirmed commitments' },
        target: 'Team: Rutta Core · Cycle 14'
      },
      {
        id: 'notion',
        name: 'Notion',
        color: '#191B1E',
        letter: 'N',
        enabled: true,
        desc: { zh: '将已确认的团队决定沉淀至知识库并附带原话出处时间戳', en: 'Append confirmed decisions with speaker & timestamp citations to Wiki' },
        target: 'Database: Team Decisions'
      },
      {
        id: 'slack',
        name: 'Slack',
        color: '#4A154B',
        letter: '#',
        enabled: true,
        desc: { zh: '仅在当事人确认后，将变更摘要同步到对应项目频道', en: 'Post concise updates to project channels only after confirmation' },
        target: 'Channel: #product-updates'
      },
      {
        id: 'mcp',
        name: 'Open MCP Server',
        color: '#EA580C',
        letter: 'M',
        enabled: true,
        desc: { zh: '向 Claude、Cursor 及团队内部 Agent 开放已确认的上下文记忆', en: 'Expose verified spoken decisions to Claude, Cursor & internal Agents' },
        target: 'mcp://rutta.local/v1/northstar'
      }
    ],

    // Agent Handoff Studio state
    agentResult: null,
    agentApproved: false,

    // Privacy Policies
    policies: [
      {
        id: 'whitelist',
        locked: false,
        enabled: true,
        title: { zh: '声纹白名单门禁（访客实时丢弃）', en: 'Voiceprint Whitelist Gate (Drop Visitors)' },
        desc: { zh: '只对已加入成员的声纹做后续处理；未匹配人声不亮灯、不转写、不落盘。', en: 'Only enrolled voiceprints are processed. Unmatched voices never trigger the LED or storage.' }
      },
      {
        id: 'two-party',
        locked: false,
        enabled: true,
        title: { zh: '双人确认后入库团队空间', en: 'Participant Confirmation Before Sharing' },
        desc: { zh: '新捕捉的决定默认仅当事人在场可见，需确认后才分发到 Linear / Notion / Slack。', en: 'New records remain private to speakers present until confirmed into team tools.' }
      },
      {
        id: 'no-admin-audio',
        locked: true,
        enabled: true,
        title: { zh: '管理者不可查看原始音频', en: 'Zero Admin Access to Raw Audio' },
        desc: { zh: '后台仅可管理声纹名册与工具同步规则，任何管理员都无法监听或导出他人原始录音。', en: 'Workspace admins manage rosters and routing only—raw audio is strictly inaccessible.' }
      },
      {
        id: 'self-delete',
        locked: false,
        enabled: true,
        title: { zh: '随时退出与一键删除参与记录', en: 'Instant Opt-out & Self-Delete' },
        desc: { zh: '任何成员可随时删除自己的声纹或自己参与的任何一条决定记录，无需审批。', en: 'Any member can delete their voiceprint or any record they participated in with zero friction.' }
      }
    ]
  };
};
