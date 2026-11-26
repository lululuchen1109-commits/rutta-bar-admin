/* Rutta Bar Admin Console · Bilingual Data & Copy (Crisp, Authentic Product Language) */

window.RUTTA_I18N = {
  zh: {
    menuFile: '文件',
    menuEdit: '编辑',
    menuView: '视图',
    railGroupCore: '团队管理',
    railGroupSystem: '硬件与系统',
    navVoiceprints: '声纹管理',
    navDecisions: '决定与记录',
    navDevices: '设备管理',
    navIntegrations: '集成与隐私',
    sidebarSub: '声纹门禁已开启',
    directorBtn: '分镜',
    disclaimerText: 'Rutta Bar 概念管理后台 · 页面中人物、声纹与对话均为模拟数据',

    mbpMuteBtn: '物理静音',
    mbpCardBtn: '最近记录',

    // Topbar titles
    titleVoiceprints: '声纹管理',
    subVoiceprints: '管理已加入团队成员的声纹白名单，未加入者发言不亮灯、不留存',
    titleDecisions: '决定与记录',
    subDecisions: '口头决定默认仅在场成员可见，双方确认后自动同步至团队工具',
    titleDevices: '设备管理',
    subDevices: '查看团队已绑定的 Rutta Bar 状态、指示灯自检与合盖待机设置',
    titleIntegrations: '集成与隐私',
    subIntegrations: '配置 Linear / Notion / Slack / MCP 分发规则与团队隐私边界',

    // Voiceprints view
    btnAddMember: '添加成员声纹',
    metricEnrolled: '已启用声纹',
    metricEnrolledFoot: '团队白名单成员可随时暂停或退出',
    metricDevices: '团队 Rutta Bar',
    metricDevicesFoot: 'USB-C 直连 MacBook Air，无电池免充电',
    metricBlocked: '今日已忽略访客',
    metricBlockedFoot: '未匹配团队声纹的语音已实时丢弃',
    btnViewDeviceCheck: '灯光自检 →',

    filterAll: '全部',
    filterActive: '已启用',
    filterPaused: '已暂停',
    searchPlaceholder: '搜索姓名、邮箱或岗位…',
    colMember: '成员',
    colVoiceprint: '声纹状态',
    colDevice: '绑定设备',
    colLastHeard: '最近识别',
    colEnabled: '启用',
    colActions: '操作',
    statusActive: '已启用',
    statusPaused: '已暂停',
    actDetails: '详情',
    actRemove: '移除',
    emptyRoster: '没有找到匹配的成员。',

    // Drawer
    drawerTitle: '成员声纹与设备',
    drawerVoiceLabel: '声纹状态',
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

    // Enroll modal
    enrollTitle: '添加成员声纹',
    enrollTitleReenroll: '重新录入声纹',
    enrollSub: '朗读一句示例完成声纹绑定，成员随时可暂停或删除退出。',
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

    // Delete modal
    deleteTitle: '移除成员声纹',
    deleteNote: '移除后，Rutta Bar 将立即销毁该声纹。此后该成员在设备旁说话时，状态灯不会亮起，也不会转写或留存任何音频；历史已确认的团队文字记录不受影响。',
    deleteConfirmBtn: '确认移除',

    // Decisions view
    decFilterAll: '全部',
    decFilterPending: '待确认',
    decFilterSynced: '已同步',
    decFilterMonday: '周一清单',
    badgePending: '待当事人确认',
    badgeSynced: '已同步团队空间',
    badgeMonday: '待指派',
    kvOwner: '负责人',
    kvDue: '截止时间',
    kvContext: '讨论场景',
    unassigned: '暂未指派',
    assignPlaceholder: '指派负责人…',
    confirmPrompt: '参与成员确认后同步：',
    confirmedTag: '已确认',
    confirmAction: '点击确认',
    syncedToLabel: '已同步至',
    quoteTitle: '原话时间点记录',
    quoteLock: '仅在场成员可听 · 管理员无权访问',
    btnHandoffAgent: '交给 Agent 处理',
    btnDeleteRec: '删除记录',

    // Devices view
    diagTitle: '硬件状态与指示灯自检',
    diagDesc: '检查本机连接的银色 Rutta Bar 指示灯语义与物理静音滑键响应。',
    diagReady: '待机绿灯',
    diagInput: '成员说话',
    diagVisitor: '访客不亮',
    diagMute: '物理静音',
    diagReadyHead: '待机中（顶部绿灯约 4 秒缓慢呼吸）',
    diagReadyBody: 'USB-C 供电在线，无需手动开启录音，仅在匹配到团队声纹时点亮黄灯进入拾音。',
    diagInputHead: '已识别成员发言（顶部黄灯常亮）',
    diagInputBody: '识别为团队成员 Maya Lin，正在提取口头决定与待办，结束后先仅对在场成员可见。',
    diagVisitorHead: '未加入访客发言（顶部灯保持熄灭）',
    diagVisitorBody: '当前人声未在团队声纹名单中，状态灯保持不亮，音频片段实时丢弃，不转写也不落盘。',
    diagMuteHead: '物理静音已拨下（露出橙色机械标记）',
    diagMuteBody: '侧边机械滑键已硬件切断麦克风输入，顶部状态灯彻底熄灭，重插后保持静音挡位。',
    fleetTitle: '团队已绑定设备（4 台）',
    syncBtnStart: '演示多台协同亮灯',
    syncBtnStop: '停止同步演示',
    syncBannerText: '3 台邻近设备正同步拾取同一场工位讨论，自动合并为 1 条记录',
    lidTitle: '合盖休眠持续待机',
    lidDesc: 'MacBook Air 合盖后内置麦克风会被系统断开，插在侧边的 Rutta Bar 仍可保持待机，散会补一句不漏记，开盖即见记录卡。',
    lidClosedTag: '已合盖 · 呼吸绿灯',
    lidOpenTag: '已开盖 · 正常在线',
    lidToggleBtn: '切换合盖状态',

    // Integrations & Privacy view
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
    privacyDesc: '默认开启的硬件与权限约束，确保团队成员可放心使用。',
    lockedBadge: '不可关闭',

    // Floating notice
    fnDecision: '新捕捉的口头决定',
    fnVisitor: '隐私保护 · 访客已忽略',
    fnVisitorTitle: '1 位未加入访客的发言未记录',
    fnVisitorDesc: '未匹配到团队声纹，设备顶灯保持熄灭，音频已实时丢弃。',
    fnOpen: '查看详情',

    // Director
    ddTitle: '内容部拍摄分镜',
    ddSub: '一键触发宣发核心镜头 · 按 H 隐藏辅助入口',
    shotDTitle: '访客开口 · 灯不亮',
    shotDDesc: '跳到设备自检并弹出未记录拦截提示',
    shotS1Title: '物理静音 · 露出橙标',
    shotS1Desc: '拨动侧边机械滑键，顶灯熄灭',
    shotATitle: '工位改日期 + 双人确认',
    shotADesc: '右上角弹出记录卡，点击确认同步至工具',
    shotCTitle: '谁记错了 · 听原话',
    shotCDesc: '定位时间戳并播放原声波形',
    shotETitle: '一句话交给 Agent',
    shotEDesc: '引用刚确认的口头决定起草邮件',
    shotL4Title: '三台 Mac 同步亮灯',
    shotL4Desc: '工位多人讨论自动合并去重',
    ddToggleMenubar: '显示模拟 macOS 顶部菜单栏',
    ddToggleSound: '物理滑键拨动微音效',
    ddCleanMode: '纯净录屏（H）',
    ddReset: '重置数据',
    undo: '撤销'
  },

  en: {
    menuFile: 'File',
    menuEdit: 'Edit',
    menuView: 'View',
    railGroupCore: 'Workspace',
    railGroupSystem: 'Hardware & Policy',
    navVoiceprints: 'Voiceprints',
    navDecisions: 'Decisions',
    navDevices: 'Devices',
    navIntegrations: 'Tools & Privacy',
    sidebarSub: 'Voiceprint gate active',
    directorBtn: 'Shots',
    disclaimerText: 'Rutta Bar concept admin console · Simulated team profiles, voiceprints, and notes',

    mbpMuteBtn: 'Physical mute',
    mbpCardBtn: 'Latest note',

    titleVoiceprints: 'Voiceprints',
    subVoiceprints: 'Manage opted-in team voiceprints. Unenrolled voices never trigger the LED or storage.',
    titleDecisions: 'Decisions',
    subDecisions: 'Spoken notes stay private to participants until confirmed into team tools.',
    titleDevices: 'Devices',
    subDevices: 'Monitor paired Rutta Bars, verify LED & mute behavior, and manage lid-closed standby.',
    titleIntegrations: 'Tools & Privacy',
    subIntegrations: 'Configure Linear, Notion, Slack, and MCP routing alongside team privacy boundaries.',

    btnAddMember: 'Add voiceprint',
    metricEnrolled: 'Active voiceprints',
    metricEnrolledFoot: 'Any teammate can pause or leave anytime',
    metricDevices: 'Paired Rutta Bars',
    metricDevicesFoot: 'USB-C powered on MacBook Air, zero battery',
    metricBlocked: 'Visitors ignored today',
    metricBlockedFoot: 'Unmatched speech dropped with zero storage',
    btnViewDeviceCheck: 'LED check →',

    filterAll: 'All',
    filterActive: 'Active',
    filterPaused: 'Paused',
    searchPlaceholder: 'Search name, email, or role…',
    colMember: 'Member',
    colVoiceprint: 'Voiceprint',
    colDevice: 'Paired Bar',
    colLastHeard: 'Last recognized',
    colEnabled: 'Active',
    colActions: 'Actions',
    statusActive: 'Active',
    statusPaused: 'Paused',
    actDetails: 'Inspect',
    actRemove: 'Remove',
    emptyRoster: 'No matching teammates found.',

    drawerTitle: 'Voiceprint & Hardware',
    drawerVoiceLabel: 'Voiceprint status',
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
    enrollSub: 'Read one short calibration line. Members can pause or delete their voiceprint anytime.',
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
    deleteNote: 'The voiceprint will be permanently deleted. Future speech from this person will not light the LED and will be dropped immediately. Already-confirmed team notes stay intact.',
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
    kvContext: 'Context',
    unassigned: 'Unassigned',
    assignPlaceholder: 'Assign owner…',
    confirmPrompt: 'Participants confirm to share:',
    confirmedTag: 'Confirmed',
    confirmAction: 'Confirm',
    syncedToLabel: 'Synced to',
    quoteTitle: 'Original Spoken Clip',
    quoteLock: 'Participants only · Inaccessible to admins',
    btnHandoffAgent: 'Hand off to Agent',
    btnDeleteRec: 'Delete',

    diagTitle: 'Hardware & LED Diagnostic',
    diagDesc: 'Inspect the connected Silver Rutta Bar indicator states and physical mute switch.',
    diagReady: 'Standby',
    diagInput: 'Member',
    diagVisitor: 'Visitor',
    diagMute: 'Muted',
    diagReadyHead: 'Standby (breathing green LED, 4s cycle)',
    diagReadyBody: 'Powered over USB-C with no start button needed. Amber light activates only for enrolled teammates.',
    diagInputHead: 'Enrolled member speaking (solid amber LED)',
    diagInputBody: 'Matched Maya Lin. Extracting spoken decisions—private to people present until confirmed.',
    diagVisitorHead: 'Unenrolled visitor speaking (LED stays dark)',
    diagVisitorBody: 'Voice did not match the team roster. Top LED stayed off and the audio was discarded immediately.',
    diagMuteHead: 'Physical mute engaged (orange mechanical mark)',
    diagMuteBody: 'Side slide switch cuts mic input at the hardware level and turns the top LED completely off.',
    fleetTitle: 'Paired Team Devices (4)',
    syncBtnStart: 'Preview multi-Bar sync',
    syncBtnStop: 'Stop preview',
    syncBannerText: '3 nearby Bars synced on one desk huddle — deduplicated into a single record',
    lidTitle: 'Lid-closed standby continuity',
    lidDesc: 'macOS disconnects built-in mics when the lid shuts. Rutta Bar stays ready on the USB-C edge so hallway wrap-ups are waiting when you open your Mac.',
    lidClosedTag: 'Lid closed · Breathing green',
    lidOpenTag: 'Lid open · Ready',
    lidToggleBtn: 'Toggle lid state',

    toolsTitle: 'Team Tools & Open MCP',
    toolsDesc: 'Confirmed decisions sync automatically into your tools and MCP-enabled Agents.',
    btnTest: 'Test',
    btnCopy: 'Copy',
    agentTitle: 'Agent Context Handoff',
    agentDesc: 'Run a prompt to verify how your Agent cites confirmed spoken decisions via MCP.',
    agentPlaceholder: 'e.g. Draft a short client update on moving launch to Dec 10…',
    agentRun: 'Draft',
    agentApprove: 'Approve & send',
    agentSent: 'Sent',
    privacyTitle: 'Privacy & Access Boundaries',
    privacyDesc: 'Hardware and workspace guardrails enforced across the team.',
    lockedBadge: 'Locked ON',

    fnDecision: 'Spoken decision captured',
    fnVisitor: 'Privacy gate · Visitor ignored',
    fnVisitorTitle: '1 unenrolled speaker not recorded',
    fnVisitorDesc: 'Voice not in team roster. Top LED stayed dark and audio was discarded.',
    fnOpen: 'Inspect',

    ddTitle: 'Demo Shot Director',
    ddSub: '1-click P0 video scenes · Press H for clean screen',
    shotDTitle: 'Visitor speaks · LED stays off',
    shotDDesc: 'Opens diagnostic check with ignored notice',
    shotS1Title: 'Physical mute · orange mark',
    shotS1Desc: 'Slides mute switch and turns top LED off',
    shotATitle: 'Desk date shift + 2-person confirm',
    shotADesc: 'Shows notification card and confirms into tools',
    shotCTitle: 'Who remembered wrong? · quote',
    shotCDesc: 'Opens timestamped clip & waveform player',
    shotETitle: 'Hand off to Agent',
    shotEDesc: 'Drafts client update citing confirmed note',
    shotL4Title: '3 Macs light up in sync',
    shotL4Desc: 'Deduplicates multi-Bar desk huddle',
    ddToggleMenubar: 'Show simulated macOS top bar',
    ddToggleSound: 'Physical switch click sound',
    ddCleanMode: 'Clean screen (H)',
    ddReset: 'Reset data',
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
    vpSearch: '',
    vpFilter: 'all',
    decFilter: 'all',
    selectedDecisionId: 'dec-launch',
    inspectedMemberId: null,

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
        bars: [38, 60, 74, 44, 84, 52, 66, 88, 50, 40]
      }
    ],

    decisions: [
      {
        id: 'dec-launch',
        status: 'pending',
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

    agentResult: null,
    agentApproved: false,

    policies: [
      {
        id: 'whitelist',
        locked: false,
        enabled: true,
        title: { zh: '仅识别已加入团队声纹', en: 'Enrolled voiceprints only' },
        desc: { zh: '非白名单访客说话时不亮灯、不转写、不保存。', en: 'Unenrolled visitors never trigger the LED or storage.' }
      },
      {
        id: 'two-party',
        locked: false,
        enabled: true,
        title: { zh: '参与成员确认后才进入团队空间', en: 'Participant confirmation before sharing' },
        desc: { zh: '新记录默认仅在场成员可见，点确认后再同步给工具与团队。', en: 'Records stay private to participants until confirmed.' }
      },
      {
        id: 'no-admin-audio',
        locked: true,
        enabled: true,
        title: { zh: '管理员不可访问原始音频', en: 'Admins cannot access raw audio' },
        desc: { zh: '后台仅提供成员名单与工具路由管理，无法调听他人原始录音。', en: 'Admin role manages rosters & routing only—raw audio is strictly locked.' }
      },
      {
        id: 'self-delete',
        locked: false,
        enabled: true,
        title: { zh: '成员可随时退出与删除记录', en: 'Self-service opt-out & delete' },
        desc: { zh: '任何成员可随时移除自己的声纹，或删除自己参与过的记录。', en: 'Anyone can remove their voiceprint or delete records they joined.' }
      }
    ]
  };
};
