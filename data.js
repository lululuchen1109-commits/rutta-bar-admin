/* Rutta macOS Desktop App · Bilingual Data & Copy (Employee + Admin Dual Role) */

window.RUTTA_I18N = {
  zh: {
    menuFile: '文件',
    menuEdit: '编辑',
    menuView: '视图',
    menuWindow: '窗口',
    menuHelp: '帮助',
    roleEmployee: '员工端',
    roleAdmin: '管理者',
    directorBtn: '分镜',
    disclaimerText: 'Rutta macOS 概念应用 · 页面中人物、声纹与对话均为模拟数据',

    mbpPeerQuick: '允许被同事设备收录',
    mbpMuteBtn: '物理静音',
    mbpPauseBtn: '免收录 30m',

    // Navigation labels
    groupMySpace: '个人工作台',
    groupAdminCore: '团队管理',
    groupAdminSystem: '硬件与合规',
    navMyVoice: '我的声纹与权限',
    navMyDecisions: '我的决定与原话',
    navMyAgent: 'Agent 与同步',
    navVoiceprints: '成员声纹管理',
    navAdminDecisions: '团队已同步决定',
    navDevices: '团队设备与检测',
    navIntegrations: '集成与隐私策略',

    // Topbar titles
    titleMyVoice: '我的声纹与权限',
    subMyVoice: '本机 Rutta Bar 状态、跨设备被收录开关与个人隐私边界',
    titleMyDecisions: '我的决定与原话',
    subMyDecisions: '仅展示你在场参与的讨论；未点确认前对外完全私密，且只有当事人可听原话',
    titleMyAgent: 'Agent 与同步',
    subMyAgent: '基于已确认的口头决定一键起草邮件、任务或追溯原因',
    titleVoiceprints: '成员声纹管理',
    subVoiceprints: '管理团队声纹白名单；员工是否允许被他人设备收录仅由本人独立控制',
    titleAdminDecisions: '团队已同步决定',
    subAdminDecisions: '仅展示当事成员确认后的团队文字结论，未确认私密讨论与原始音频对管理者不可见',
    titleDevices: '团队设备与检测',
    subDevices: '检查 Rutta Bar 指示灯语义、物理静音滑键、多台同频同步与合盖待机',
    titleIntegrations: '集成与隐私策略',
    subIntegrations: '配置 Linear / Notion / Slack / MCP 分发规则、隐私底线与管理审计日志',

    // Employee Home
    empQuickPause: '临时免被收录（30 分钟）',
    empQuickPauseActive: '已暂停被收录（剩余 30m · 点击恢复）',
    empBarCardTitle: '我的 Rutta Bar',
    empBarCardSub: 'USB-C 直连 MacBook Air · 点击滑键可测试物理静音',
    empConsentTitle: '我的声音收录授权',
    empConsentSub: '以下设置仅由你本人控制，管理者与同事均无法替你强制开启。',
    consentMasterTitle: '启用我的团队声纹',
    consentMasterDesc: '关闭后，包括本机在内任何 Rutta Bar 都将不再识别你的声音。',
    consentPeerTitle: '允许被同事的 Rutta Bar 收录',
    consentPeerTag: '小会关键开关',
    consentPeerDesc: '与同事开小会或工位讨论时，允许对方设备识别你的声音并向双方推送待确认记录；关闭后，同事设备遇到你的声音不亮灯、不转写、不留存，仅你本机可识别你。',
    consentConfirmTitle: '仅在我确认后才同步给团队',
    consentConfirmDesc: '无论由哪台设备收录，决定草稿都会先私密推给你；你未确认前绝不发往 Linear / Slack，管理者也不可见。',
    consentLidTitle: '合盖休眠期间保持待机',
    consentLidDesc: 'MacBook Air 合盖后内置麦克风断开，插在侧边的 Rutta Bar 仍继续待机不漏记。',

    // Huddle live check
    huddleTitle: '工位小会实测：员工 A（Maya）与员工 B（Leo）面对面讨论',
    huddleSub: '假设 Maya 带着插有银色 Rutta Bar 的 MacBook Air 与 Leo 开小会，实时验证「允许被同事设备收录」开关如何生效。',
    huddleSwitchPerson: '切换为另一方视角',

    // Admin metrics & table
    btnAddMember: '添加成员声纹',
    metricEnrolled: '团队已启用声纹',
    metricEnrolledFoot: '成员随时可在个人端暂停或销毁退出',
    metricPeerAllowed: '允许跨设备收录',
    metricPeerFoot: '由员工本人独立控制，管理者不可代开',
    metricBlocked: '今日拦截未授权语音',
    metricBlockedFoot: '含外部访客及关闭跨设备收录的同事 · 0 留存',

    filterAll: '全部',
    filterActive: '已启用',
    filterPaused: '已暂停',
    searchPlaceholder: '搜索姓名、邮箱或岗位…',
    colMember: '成员',
    colVoiceprint: '声纹状态',
    colPeerConsent: '跨设备收录',
    colDevice: '绑定设备',
    colLastHeard: '最近识别',
    colEnabled: '启用',
    colActions: '操作',
    peerAllowed: '允许他人收录',
    peerSelfOnly: '仅限本机',
    peerTempPaused: '免收录 30m',
    statusActive: '已启用',
    statusPaused: '已暂停',
    actDetails: '详情',
    actRemove: '移除',
    emptyRoster: '没有找到匹配的成员。',

    // Drawer
    drawerVoiceLabel: '声纹状态',
    drawerPeerLabel: '跨设备收录授权（仅本人可改）',
    drawerDeviceLabel: '配对设备',
    drawerMuteHint: '点击实物滑键可测试物理静音状态',
    drawerReenroll: '重新录入声纹',
    drawerRemove: '彻底移除声纹',
    drawerVerifyBtn: '验证声纹识别',

    // Finishes
    finishSilver: '银色',
    finishSky: '天蓝',
    finishStarlight: '星光',
    finishMidnight: '午夜',

    // Modals
    enrollTitle: '添加成员声纹',
    enrollTitleReenroll: '重新录入声纹',
    enrollSub: '朗读一句示例完成声纹绑定，成员随时可在个人端暂停、关闭他人收录或彻底退出。',
    fieldName: '成员姓名',
    fieldRole: '岗位 / 角色',
    fieldEmail: '团队邮箱',
    fieldFinish: '配对的 Rutta Bar 外观',
    vcPromptLabel: '请照常读出以下校准句',
    vcIdle: '点击下方按钮开始声纹采样',
    vcSampling: '正在采集声纹特征…',
    vcDone: '采样完成，已准备就绪',
    vcStartBtn: '开始采样（3 秒）',
    vcRealMicBtn: '本机麦克风',
    vcResampleBtn: '重新采样',
    cancel: '取消',
    enrollConfirmBtn: '确认添加',
    deleteTitle: '移除成员声纹',
    deleteNote: '移除后，Rutta Bar 将立即销毁该声纹。此后该成员在任何设备旁说话时，状态灯均不会亮起，也不会转写或留存任何音频；历史已确认的团队文字记录不受影响。',
    deleteConfirmBtn: '确认移除',

    // Decisions
    decFilterAll: '全部',
    decFilterPending: '待确认',
    decFilterSynced: '已同步',
    decFilterMonday: '周一清单',
    badgePending: '待当事人确认',
    badgeSynced: '已同步团队空间',
    badgeMonday: '待指派',
    kvOwner: '负责人',
    kvDue: '截止时间',
    kvSource: '收录来源',
    unassigned: '暂未指派',
    assignPlaceholder: '指派负责人…',
    confirmPrompt: '参与成员确认后同步：',
    confirmedTag: '已确认',
    confirmAction: '点击确认',
    syncedToLabel: '已同步至',
    quoteTitle: '原话时间点记录',
    quoteLock: '仅在场成员可听 · 管理员无权访问',
    adminAudioLockedTitle: '原始音频已锁定（管理者无权回放）',
    adminAudioLockedDesc: '根据团队隐私边界，管理者仅可查看当事双方确认后的文字决定，无法调听任何讨论原声或查看未确认草稿。',
    btnHandoffAgent: '交给 Agent 处理',
    btnDeleteRec: '删除并销毁原话',

    // Devices
    diagTitle: '硬件状态与指示灯自检',
    diagDesc: '检查 Rutta Bar 指示灯语义与物理静音滑键响应。',
    diagReady: '待机绿灯',
    diagInput: '成员说话',
    diagVisitor: '访客/拒收',
    diagMute: '物理静音',
    diagReadyHead: '待机中（顶部绿灯约 4 秒缓慢呼吸）',
    diagReadyBody: 'USB-C 供电在线，无需手动点开始，仅匹配已授权成员声纹时亮黄灯拾音。',
    diagInputHead: '已识别授权成员发言（顶部黄灯常亮）',
    diagInputBody: '识别到已授权同事发言，提取的口头决定会先私密推送给在场成员确认。',
    diagVisitorHead: '访客或“仅限本机”同事发言（顶部灯保持熄灭）',
    diagVisitorBody: '发言人未在白名单或已关闭“允许被同事设备收录”，设备顶灯保持熄灭，音频实时丢弃不留存。',
    diagMuteHead: '物理静音已拨下（露出橙色机械标记）',
    diagMuteBody: '侧边机械滑键硬件切断麦克风输入，顶部状态灯彻底熄灭，重插后仍保持静音挡位。',
    fleetTitle: '团队已绑定设备（4 台）',
    syncBtnStart: '演示多台协同亮灯',
    syncBtnStop: '停止同步演示',
    syncBannerText: '3 台邻近设备正同步拾取同一场工位讨论，自动合并去重为 1 条记录',
    lidTitle: '合盖休眠持续待机',
    lidDesc: 'MacBook Air 合盖后内置麦克风会被系统断开，插在侧边的 Rutta Bar 仍可保持待机，散会补一句不漏记，开盖即见记录卡。',
    lidClosedTag: '已合盖 · 呼吸绿灯',
    lidOpenTag: '已开盖 · 正常在线',
    lidToggleBtn: '切换合盖状态',

    // Integrations & Policy
    toolsTitle: '团队工具与开放 MCP',
    toolsDesc: '确认后的决定自动流转到团队已有工具，或通过 MCP 提供给团队 Agent。',
    btnTest: '测试',
    btnCopy: '复制',
    agentTitle: 'Agent 上下文交接',
    agentDesc: '输入或点选工作指令，验证 Agent 如何直接引用已确认的口头决定。',
    agentPlaceholder: '输入指令，例如：把刚改的上线日期写封简短更新发给客户…',
    agentRun: '生成草稿',
    agentApprove: '确认发送',
    agentSent: '已发送',
    privacyTitle: '团队隐私与访问边界',
    privacyDesc: '系统级锁定的底线规则，确保员工对自己的声音拥有最终控制权。',
    lockedBadge: '系统锁定',

    // Floating notice
    fnDecision: '新捕捉的口头决定',
    fnVisitor: '隐私保护 · 语音已忽略',
    fnVisitorTitle: '1 位未授权发言人未被记录',
    fnVisitorDesc: '未匹配白名单或对方已关闭跨设备收录，设备顶灯保持熄灭，音频已实时丢弃。',
    fnPeerTitle: '已按 Leo 的个人设置忽略其发言',
    fnPeerDesc: 'Leo 已关闭「允许被同事的 Rutta Bar 收录」，Maya 的设备顶灯未亮，未转写也未留存。',
    fnOpen: '查看详情',

    // Director
    ddTitle: '内容部拍摄分镜',
    ddSub: '一键切换角色与核心镜头 · 按 H 隐藏辅助入口',
    shotPeerTitle: '员工 B 关闭“可被他人收录”',
    shotPeerDesc: '小会时 A 的设备自动忽略 B 的声音，不亮灯不留存',
    shotAdminTitle: '切到管理者端 · 零原始音频',
    shotAdminDesc: '隐藏未确认私密讨论，原话录音区永久锁定',
    shotATitle: '工位改日期 + 双人确认',
    shotADesc: '右上角弹出记录卡，点击确认同步至工具',
    shotCTitle: '谁记错了 · 在场成员听原话',
    shotCDesc: '员工端定位时间戳并播放原声波形',
    shotDTitle: '外部访客开口 · 灯不亮',
    shotDDesc: '设备检测演示访客拦截与未记录提示',
    shotS1Title: '物理静音 · 露出橙标',
    shotS1Desc: '拨动侧边机械滑键，顶灯熄灭',
    shotETitle: '一句话交给 Agent',
    shotEDesc: '引用刚确认的口头决定起草邮件',
    shotL4Title: '三台 Mac 同步亮灯去重',
    shotL4Desc: '工位多人讨论自动合并为一条记录',
    ddToggleMenubar: '显示 macOS 顶部菜单栏（真机录屏可关）',
    ddToggleSound: '物理滑键拨动微音效',
    ddCleanMode: '纯净录屏（H）',
    ddReset: '重置数据',
    undo: '撤销'
  },

  en: {
    menuFile: 'File',
    menuEdit: 'Edit',
    menuView: 'View',
    menuWindow: 'Window',
    menuHelp: 'Help',
    roleEmployee: 'Employee',
    roleAdmin: 'Admin',
    directorBtn: 'Shots',
    disclaimerText: 'Rutta macOS concept app · Simulated team profiles, voiceprints, and discussions',

    mbpPeerQuick: 'Allow capture by teammates’ Bars',
    mbpMuteBtn: 'Physical mute',
    mbpPauseBtn: 'Pause 30m',

    groupMySpace: 'My Rutta',
    groupAdminCore: 'Workspace',
    groupAdminSystem: 'Hardware & Policy',
    navMyVoice: 'My Voice & Consent',
    navMyDecisions: 'My Decisions & Clips',
    navMyAgent: 'Agent & Sync',
    navVoiceprints: 'Team Voiceprints',
    navAdminDecisions: 'Synced Decisions',
    navDevices: 'Team Devices',
    navIntegrations: 'Tools & Governance',

    titleMyVoice: 'My Voice & Consent',
    subMyVoice: 'Your Mac’s Rutta Bar status, peer-capture consent, and personal privacy controls',
    titleMyDecisions: 'My Decisions & Clips',
    subMyDecisions: 'Only discussions you joined. Private until confirmed, with original clips unlocked for participants only.',
    titleMyAgent: 'Agent & Sync',
    subMyAgent: 'Hand off confirmed spoken decisions to your Agent via MCP without exposing raw audio',
    titleVoiceprints: 'Team Voiceprints',
    subVoiceprints: 'Manage team whitelist. Whether a teammate allows peer capture is controlled solely by them.',
    titleAdminDecisions: 'Synced Decisions',
    subAdminDecisions: 'Only confirmed team notes appear here. Unconfirmed drafts and raw audio are inaccessible to admins.',
    titleDevices: 'Team Devices',
    subDevices: 'Inspect Rutta Bar LEDs, physical mute switch, multi-Bar sync, and lid-closed standby',
    titleIntegrations: 'Tools & Governance',
    subIntegrations: 'Configure Linear, Notion, Slack, and MCP routing alongside locked privacy guardrails',

    empQuickPause: 'Pause peer capture (30m)',
    empQuickPauseActive: 'Peer capture paused (30m left · Resume)',
    empBarCardTitle: 'My Rutta Bar',
    empBarCardSub: 'USB-C connected to MacBook Air · Click side slider to test mute',
    empConsentTitle: 'My Voice Capture Controls',
    empConsentSub: 'Controlled exclusively by you—admins and teammates cannot turn these on for you.',
    consentMasterTitle: 'Recognize my voiceprint',
    consentMasterDesc: 'When off, no Rutta Bar—including your own—will recognize your voice.',
    consentPeerTitle: 'Allow capture by teammates’ Rutta Bars',
    consentPeerTag: 'Huddle consent',
    consentPeerDesc: 'Lets another teammate’s Bar recognize you during desk huddles and send a private draft to both of you. When off, teammates’ Bars treat your voice like a visitor: LED stays dark and audio is dropped.',
    consentConfirmTitle: 'Require my confirmation before sharing',
    consentConfirmDesc: 'Captured decisions stay private to participants until you confirm—never sent to Linear, Slack, or Admin.',
    consentLidTitle: 'Stay ready while Mac lid is closed',
    consentLidDesc: 'macOS disconnects built-in mics when closed; Rutta Bar stays on USB-C standby.',

    huddleTitle: 'Live Huddle Check: Maya (A) & Leo (B) Desk Discussion',
    huddleSub: 'Maya has her Silver Rutta Bar plugged in while chatting with Leo. Toggle Leo’s peer-capture switch above to verify behavior live.',
    huddleSwitchPerson: 'Switch teammate view',

    btnAddMember: 'Add voiceprint',
    metricEnrolled: 'Active voiceprints',
    metricEnrolledFoot: 'Any member can pause or delete anytime',
    metricPeerAllowed: 'Peer capture allowed',
    metricPeerFoot: 'Controlled solely by each employee',
    metricBlocked: 'Unauthorized speech dropped',
    metricBlockedFoot: 'Visitors + self-only teammates · 0 saved',

    filterAll: 'All',
    filterActive: 'Active',
    filterPaused: 'Paused',
    searchPlaceholder: 'Search name, email, or role…',
    colMember: 'Member',
    colVoiceprint: 'Voiceprint',
    colPeerConsent: 'Peer capture',
    colDevice: 'Paired Bar',
    colLastHeard: 'Last heard',
    colEnabled: 'Active',
    colActions: 'Actions',
    peerAllowed: 'Peers allowed',
    peerSelfOnly: 'Own Bar only',
    peerTempPaused: 'Paused 30m',
    statusActive: 'Active',
    statusPaused: 'Paused',
    actDetails: 'Inspect',
    actRemove: 'Remove',
    emptyRoster: 'No matching teammates found.',

    drawerVoiceLabel: 'Voiceprint status',
    drawerPeerLabel: 'Peer-capture consent (employee only)',
    drawerDeviceLabel: 'Paired Rutta Bar',
    drawerMuteHint: 'Click the side slider to test hardware mute',
    drawerReenroll: 'Re-enroll voice',
    drawerRemove: 'Remove voiceprint',
    drawerVerifyBtn: 'Verify match',

    finishSilver: 'Silver',
    finishSky: 'Sky Blue',
    finishStarlight: 'Starlight',
    finishMidnight: 'Midnight',

    enrollTitle: 'Add teammate voiceprint',
    enrollTitleReenroll: 'Re-enroll voiceprint',
    enrollSub: 'Read one calibration line. Members can pause, block peer capture, or leave anytime.',
    fieldName: 'Full name',
    fieldRole: 'Role',
    fieldEmail: 'Work email',
    fieldFinish: 'Paired Rutta Bar finish',
    vcPromptLabel: 'Read this line in a normal voice',
    vcIdle: 'Click below to sample voiceprint',
    vcSampling: 'Capturing voice signature…',
    vcDone: 'Voiceprint ready',
    vcStartBtn: 'Sample (3 sec)',
    vcRealMicBtn: 'Use mic',
    vcResampleBtn: 'Sample again',
    cancel: 'Cancel',
    enrollConfirmBtn: 'Add to whitelist',
    deleteTitle: 'Remove voiceprint',
    deleteNote: 'The voiceprint will be permanently deleted across all devices. Future speech will not trigger any LED or storage. Already-confirmed text notes stay intact.',
    deleteConfirmBtn: 'Remove',

    decFilterAll: 'All',
    decFilterPending: 'Pending',
    decFilterSynced: 'Synced',
    decFilterMonday: 'Monday',
    badgePending: 'Awaiting confirmation',
    badgeSynced: 'Synced to workspace',
    badgeMonday: 'Unassigned',
    kvOwner: 'Owner',
    kvDue: 'Due date',
    kvSource: 'Captured by',
    unassigned: 'Unassigned',
    assignPlaceholder: 'Assign owner…',
    confirmPrompt: 'Participants confirm to share:',
    confirmedTag: 'Confirmed',
    confirmAction: 'Confirm',
    syncedToLabel: 'Synced to',
    quoteTitle: 'Original Spoken Clip',
    quoteLock: 'Participants only · Inaccessible to admins',
    adminAudioLockedTitle: 'Raw audio locked (Admin view)',
    adminAudioLockedDesc: 'By policy, admins only see confirmed text decisions—never unconfirmed drafts or original voice recordings.',
    btnHandoffAgent: 'Hand off to Agent',
    btnDeleteRec: 'Delete & destroy clip',

    diagTitle: 'Hardware & LED Diagnostic',
    diagDesc: 'Inspect Rutta Bar indicator states and the physical mute switch.',
    diagReady: 'Standby',
    diagInput: 'Member',
    diagVisitor: 'Ignored',
    diagMute: 'Muted',
    diagReadyHead: 'Standby (breathing green LED, 4s cycle)',
    diagReadyBody: 'USB-C powered with no record button. Lights amber only for opted-in teammates.',
    diagInputHead: 'Authorized teammate speaking (solid amber LED)',
    diagInputBody: 'Matched an opted-in teammate. Notes stay private to participants until confirmed.',
    diagVisitorHead: 'Visitor or self-only teammate speaking (LED stays dark)',
    diagVisitorBody: 'Speaker is unenrolled or disabled peer capture. Top LED stays dark and audio is discarded immediately.',
    diagMuteHead: 'Physical mute engaged (orange mechanical mark)',
    diagMuteBody: 'Side switch disconnects the microphone at the hardware level and turns the LED completely off.',
    fleetTitle: 'Paired Team Devices (4)',
    syncBtnStart: 'Preview multi-Bar sync',
    syncBtnStop: 'Stop preview',
    syncBannerText: '3 nearby Bars synced on one desk huddle — deduplicated into 1 record',
    lidTitle: 'Lid-closed standby continuity',
    lidDesc: 'macOS shuts off built-in mics when closed. Rutta Bar stays ready on USB-C so post-meeting remarks wait for you when you open your Mac.',
    lidClosedTag: 'Lid closed · Breathing green',
    lidOpenTag: 'Lid open · Ready',
    lidToggleBtn: 'Toggle lid state',

    toolsTitle: 'Team Tools & Open MCP',
    toolsDesc: 'Confirmed decisions sync automatically into team tools and MCP-enabled Agents.',
    btnTest: 'Test',
    btnCopy: 'Copy',
    agentTitle: 'Agent Context Handoff',
    agentDesc: 'Verify how your Agent cites confirmed spoken decisions via MCP.',
    agentPlaceholder: 'e.g. Draft a short client update on moving launch to Dec 10…',
    agentRun: 'Draft',
    agentApprove: 'Approve & send',
    agentSent: 'Sent',
    privacyTitle: 'Privacy & Access Boundaries',
    privacyDesc: 'System-locked guardrails keeping employees in full control of their voice.',
    lockedBadge: 'System locked',

    fnDecision: 'Spoken decision captured',
    fnVisitor: 'Privacy gate · Voice ignored',
    fnVisitorTitle: '1 unauthorized speaker not recorded',
    fnVisitorDesc: 'Unenrolled voice or peer capture disabled. Top LED stayed dark and audio was dropped.',
    fnPeerTitle: 'Leo’s speech ignored per personal setting',
    fnPeerDesc: 'Leo disabled capture by teammates’ Bars. Maya’s LED stayed off with zero storage.',
    fnOpen: 'Inspect',

    ddTitle: 'Demo Shot Director',
    ddSub: '1-click role & scene presets · Press H for clean screen',
    shotPeerTitle: 'Employee B disables peer capture',
    shotPeerDesc: 'A’s Bar ignores B’s voice during desk huddle',
    shotAdminTitle: 'Admin view · Zero raw audio',
    shotAdminDesc: 'Hides unconfirmed drafts and locks source clips',
    shotATitle: 'Desk date shift + 2-person confirm',
    shotADesc: 'Shows notification card and confirms into tools',
    shotCTitle: 'Who remembered wrong? · quote',
    shotCDesc: 'Employee view plays timestamped source waveform',
    shotDTitle: 'Visitor speaks · LED stays off',
    shotDDesc: 'Diagnostic view with ignored visitor notice',
    shotS1Title: 'Physical mute · orange mark',
    shotS1Desc: 'Slides mute switch and turns top LED off',
    shotETitle: 'Hand off to Agent',
    shotEDesc: 'Drafts client update citing confirmed note',
    shotL4Title: '3 Macs light up in sync',
    shotL4Desc: 'Deduplicates multi-Bar desk huddle',
    ddToggleMenubar: 'Show macOS top menu bar',
    ddToggleSound: 'Physical switch click sound',
    ddCleanMode: 'Clean screen (H)',
    ddReset: 'Reset data',
    undo: 'Undo'
  }
};

window.createInitialRuttaState = function () {
  return {
    lang: 'zh',
    roleMode: 'employee', // 'employee' | 'admin'
    currentEmployeeId: 'leo', // 'leo' (B) | 'maya' (A)
    activeTab: 'my-voice', // employee: my-voice | my-decisions | my-agent ; admin: voiceprints | decisions | devices | integrations
    showMenubar: true,
    soundEnabled: true,
    cleanShot: false,
    multiBarSync: false,
    lidClosed: true,
    blockedVisitorsToday: 3,

    hwState: 'ready', // ready | input | visitor | mute
    vpSearch: '',
    vpFilter: 'all',
    decFilter: 'all',
    selectedDecisionId: 'dec-launch',
    inspectedMemberId: null,
    agentPreset: null,
    agentResult: null,
    agentApproved: false,

    members: [
      {
        id: 'maya',
        name: 'Maya Lin',
        email: 'maya@northstar.co',
        role: { zh: '产品设计', en: 'Product Design' },
        avatar: 'assets/persona-designer-720.webp',
        initials: 'ML',
        finish: 'silver',
        barState: 'online',
        lastHeard: { zh: '今天 14:19', en: 'Today, 14:19' },
        active: true,
        allowPeerCapture: true,
        tempPauseMinutes: 0,
        requireMyConfirm: true,
        lidStandby: true,
        bars: [35, 68, 92, 54, 80, 44, 96, 62, 74, 38]
      },
      {
        id: 'leo',
        name: 'Leo Park',
        email: 'leo@northstar.co',
        role: { zh: '工程负责人', en: 'Engineering' },
        avatar: null,
        initials: 'LP',
        finish: 'midnight',
        barState: 'online',
        lastHeard: { zh: '今天 14:19', en: 'Today, 14:19' },
        active: true,
        allowPeerCapture: true,
        tempPauseMinutes: 0,
        requireMyConfirm: true,
        lidStandby: true,
        bars: [58, 42, 84, 94, 48, 70, 56, 88, 42, 76]
      },
      {
        id: 'sam',
        name: 'Sam Rivera',
        email: 'sam@northstar.co',
        role: { zh: '用户研究', en: 'Research' },
        avatar: 'assets/persona-researcher-720.webp',
        initials: 'SR',
        finish: 'sky',
        barState: 'lid_closed',
        lastHeard: { zh: '24 分钟前', en: '24m ago' },
        active: true,
        allowPeerCapture: true,
        tempPauseMinutes: 0,
        requireMyConfirm: true,
        lidStandby: true,
        bars: [46, 82, 50, 72, 92, 58, 44, 80, 86, 48]
      },
      {
        id: 'chloe',
        name: 'Chloe Wu',
        email: 'chloe@northstar.co',
        role: { zh: '内容与增长', en: 'Content' },
        avatar: 'assets/persona-teacher-720.webp',
        initials: 'CW',
        finish: 'starlight',
        barState: 'muted',
        lastHeard: { zh: '昨天 18:05', en: 'Yesterday' },
        active: true,
        allowPeerCapture: false,
        tempPauseMinutes: 0,
        requireMyConfirm: true,
        lidStandby: false,
        bars: [70, 48, 62, 88, 42, 82, 74, 46, 90, 58]
      },
      {
        id: 'alex',
        name: 'Alex Chen',
        email: 'alex@northstar.co',
        role: { zh: '前端开发', en: 'Frontend' },
        avatar: null,
        initials: 'AC',
        finish: 'silver',
        barState: 'online',
        lastHeard: { zh: '2 天前', en: '2d ago' },
        active: false,
        allowPeerCapture: false,
        tempPauseMinutes: 0,
        requireMyConfirm: true,
        lidStandby: true,
        bars: [38, 60, 74, 44, 84, 52, 66, 88, 50, 40]
      }
    ],

    decisions: [
      {
        id: 'dec-launch',
        status: 'pending',
        capturedById: 'maya',
        title: {
          zh: '上线日期从 12 月 3 日推迟至 12 月 10 日',
          en: 'Move launch date from Dec 3 to Dec 10'
        },
        summary: {
          zh: '给联调与回归测试留出额外一周缓冲，由 Leo 负责顺延 Linear 排期与关联任务。',
          en: 'Reserve one extra week for QA and regression testing. Leo updates the Linear milestone and linked tasks.'
        },
        ownerId: 'leo',
        due: { zh: '12 月 10 日', en: 'Dec 10' },
        context: { zh: '工位旁讨论 · 2 分钟前', en: 'Desk huddle · 2m ago' },
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
        capturedById: 'sam',
        title: {
          zh: '周一中午前向 Acme 发送 8 人档位修订报价',
          en: 'Send revised 8-seat quote to Acme before Monday noon'
        },
        summary: {
          zh: '会议结束前口头确定按 8 人团队方案重新报价，由 Sam 整理并在发出前同步 Maya。',
          en: 'Agreed to re-quote Acme at the 8-seat tier before wrapping up; Sam sends it and pings Maya.'
        },
        ownerId: 'sam',
        due: { zh: '周一 12:00', en: 'Mon noon' },
        context: { zh: '会议室 B · 24 分钟前', en: 'Room B · 24m ago' },
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
        capturedById: 'maya',
        title: {
          zh: '周五用户测试统一采用银色（Silver）样机',
          en: 'Use the Silver prototype for Friday’s user test'
        },
        summary: {
          zh: '对比四款阳极氧化外观后确定首轮测试带银色机身，Leo 于周四中午前交付测试固件。',
          en: 'Selected Silver after comparing finishes side by side; Leo delivers the test build Thursday noon.'
        },
        ownerId: 'leo',
        due: { zh: '周四 12:00', en: 'Thu noon' },
        context: { zh: '设计评审 · 3 天前', en: 'Design review · 3d ago' },
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
        capturedById: 'chloe',
        title: {
          zh: '补测 Mac 合盖休眠 10 分钟后的连续拾音唤醒',
          en: 'Verify lid-closed wakeup capture after 10 min sleep'
        },
        summary: {
          zh: '上周站会口头提到但当时未明确负责人，系统自动归入周一未跟进清单。',
          en: 'Mentioned during standup without an owner; surfaced automatically in Monday follow-ups.'
        },
        ownerId: null,
        due: { zh: '本周内', en: 'This week' },
        context: { zh: '上周站会 · 周一清单', en: 'Last standup · Monday' },
        visitorIgnoredCount: 0,
        participants: [
          { memberId: 'maya', confirmed: true },
          { memberId: 'leo', confirmed: true },
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
        desc: { zh: '确认后的口头待办自动建任务并同步截止时间', en: 'Auto-create assigned issues from confirmed commitments' },
        target: 'Rutta Core'
      },
      {
        id: 'notion',
        name: 'Notion',
        letter: 'N',
        enabled: true,
        desc: { zh: '将已确认决定写入团队文档并附带原话时间戳', en: 'Append confirmed decisions with speaker timestamps' },
        target: 'Team Decisions'
      },
      {
        id: 'slack',
        name: 'Slack',
        letter: '#',
        enabled: true,
        desc: { zh: '确认变更后自动向对应项目频道推送简短摘要', en: 'Post concise updates to project channels on confirm' },
        target: '#product'
      },
      {
        id: 'mcp',
        name: 'Open MCP',
        letter: 'M',
        enabled: true,
        desc: { zh: '向 Claude、Cursor 及团队 Agent 开放已确认上下文', en: 'Expose confirmed decisions to Claude, Cursor & Agents' },
        target: 'mcp://rutta.local/v1/northstar'
      }
    ],

    policies: [
      {
        id: 'no-admin-audio',
        locked: true,
        enabled: true,
        title: { zh: '管理员不可访问原始音频与私密草稿', en: 'Admins cannot access raw audio or private drafts' },
        desc: { zh: '管理者仅维护成员名录、设备与工具路由，无法听原声或查看未确认讨论。', en: 'Admins manage rosters and routing only—raw clips and unconfirmed drafts stay locked.' }
      },
      {
        id: 'peer-consent',
        locked: true,
        enabled: true,
        title: { zh: '跨设备被收录授权仅由员工本人控制', en: 'Peer-capture consent owned solely by each member' },
        desc: { zh: '员工可随时关闭“允许被同事设备收录”，管理者后台仅可查看，不可代开。', en: 'Employees control whether teammates’ Bars may capture them; admins cannot override.' }
      },
      {
        id: 'two-party',
        locked: true,
        enabled: true,
        title: { zh: '在场当事成员确认后才进入团队空间', en: 'Participant confirmation before workspace sharing' },
        desc: { zh: '被他人设备收录的决定会同步推送给在场本人，拥有同等知情、确认与销毁权。', en: 'Captured teammates always receive the draft and can confirm or destroy it.' }
      },
      {
        id: 'whitelist',
        locked: false,
        enabled: true,
        title: { zh: '外部访客语音不亮灯、实时丢弃', en: 'Drop unenrolled visitor audio without lighting LED' },
        desc: { zh: '未匹配团队白名单的发言不触发黄灯，也不转写落盘。', en: 'Unenrolled voices never light the amber LED or write to storage.' }
      },
      {
        id: 'auto-expire',
        locked: false,
        enabled: true,
        title: { zh: '原声片段在确认 7 天后自动销毁', en: 'Auto-destroy original voice clips after 7 days' },
        desc: { zh: '团队空间长期仅留存可检索的文字决定，降低长期留底心理负担。', en: 'Only confirmed text notes persist long-term; raw clips auto-expire.' }
      }
    ],

    auditLogs: [
      { time: { zh: '今天 14:05', en: 'Today 14:05' }, text: { zh: '管理员更新 Linear 默认项目路由为 Rutta Core', en: 'Admin updated Linear routing target to Rutta Core' } },
      { time: { zh: '昨天 16:40', en: 'Yesterday' }, text: { zh: '管理员暂停 Alex Chen 的团队声纹（不涉及历史文字决定）', en: 'Admin paused Alex Chen’s voiceprint (confirmed notes kept)' } },
      { time: { zh: '3 天前', en: '3d ago' }, text: { zh: '系统按 7 天留存策略自动清理 4 段已过期原声片段', en: 'System auto-expired 4 source clips past 7-day retention' } },
      { time: { zh: '5 天前', en: '5d ago' }, text: { zh: '硬件门禁拦截未授权语音 3 次（0 秒留存 · 无内容日志）', en: 'Hardware gate dropped 3 unauthorized clips (0 saved)' } }
    ]
  };
};
