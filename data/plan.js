/*
 * Mentor 计划数据
 * ------------------------------------------------------------------
 * 这是整个 App 的"内容层"。改计划时优先改这个文件，不用动 UI。
 * 课表已按 2026-10-19 的截图导入；教学周 1 从 2026-09-07 开始。
 */
(function () {
  const ALL = ["green", "blue", "red"];

  window.PLAN_DATA = {
    meta: {
      title: "Mentor · 大二上学期",
      semester: "2026 秋（大二上）",
      startDate: "2026-10-19",
      endDate: "2027-02-28",
      teachingWeek1Start: "2026-09-07",
      teachingWeeks: 16,
      version: 2,
      lastUpdated: "2026-10-19"
    },

    modes: {
      green: {
        key: "green",
        label: "绿色 / 弹性",
        short: "恢复",
        color: "#2e7d5b",
        description: "身体或情绪需要恢复时用。只保 3 个优先目标，训练 3 次，睡眠 8 小时。",
        weeklyHours: "25–30h",
        gymTarget: 3,
        sleepTarget: 8
      },
      blue: {
        key: "blue",
        label: "蓝色 / 常规",
        short: "常规",
        color: "#1f4e79",
        description: "默认档位。课业 + 铸造赛 + 科研各一块，训练 4–5 次，睡眠 7.5 小时。",
        weeklyHours: "45–50h",
        gymTarget: 4,
        sleepTarget: 7.5
      },
      red: {
        key: "red",
        label: "红色 / 冲刺",
        short: "冲刺",
        color: "#b33a3a",
        description: "期末前 3 周或竞赛截止前 2–4 周用。砍掉实习投递/社交/智能汽车，只保 GPA + 竞赛；训练 3 次维持，睡眠 7 小时。",
        weeklyHours: "55–60h",
        gymTarget: 3,
        sleepTarget: 7
      }
    },

    // 课程已经通过 courses 自动插入；这里只放固定的生活/训练/深度工作锚点。
    weeklyTemplate: {
      mon: [
        { id: "wake", time: "06:20", end: "06:30", title: "起床", category: "routine", modes: ALL },
        { id: "gym", time: "06:30", end: "07:45", title: "健身 · 上肢（推）", category: "gym", modes: ALL },
        { id: "breakfast", time: "07:45", end: "08:00", title: "早餐 / 去教室", category: "routine", modes: ALL },
        { id: "lunch", time: "12:00", end: "13:30", title: "午餐 + 20 分钟午休", category: "routine", modes: ALL },
        { id: "dinner", time: "18:00", end: "19:00", title: "晚餐 + 散步", category: "routine", modes: ALL },
        { id: "deep", time: "19:00", end: "21:30", title: "课业：当天作业 / 复盘", category: "deep", modes: ["blue", "red"] },
        { id: "english", time: "21:30", end: "22:00", title: "英语 30 分钟", category: "study", modes: ["blue", "red"] },
        { id: "review", time: "22:00", end: "22:30", title: "日复盘 + 明日 3 件事", category: "routine", modes: ALL },
        { id: "sleep", time: "23:00", end: "23:00", title: "睡觉", category: "routine", modes: ALL }
      ],
      tue: [
        { id: "wake", time: "06:50", end: "07:10", title: "起床 / 早餐", category: "routine", modes: ALL },
        { id: "deep-am", time: "10:00", end: "12:00", title: "课业 / 作业（上午空档）", category: "deep", modes: ["blue", "red"] },
        { id: "lunch", time: "12:00", end: "13:30", title: "午餐 + 20 分钟午休", category: "routine", modes: ALL },
        { id: "deep", time: "14:00", end: "16:00", title: "科研：文献精读 / ABAQUS", category: "deep", modes: ["blue", "red"] },
        { id: "gym", time: "16:00", end: "17:30", title: "健身 · 下肢", category: "gym", modes: ["blue", "red"] },
        { id: "shower", time: "17:30", end: "18:00", title: "洗澡 / 休息", category: "routine", modes: ALL },
        { id: "dinner", time: "18:00", end: "19:00", title: "晚餐", category: "routine", modes: ALL },
        { id: "study", time: "19:00", end: "21:30", title: "课业 / 英语", category: "study", modes: ["blue", "red"] },
        { id: "review", time: "22:00", end: "22:30", title: "日复盘 + 明日 3 件事", category: "routine", modes: ALL },
        { id: "sleep", time: "23:00", end: "23:00", title: "睡觉", category: "routine", modes: ALL }
      ],
      wed: [
        { id: "wake", time: "06:50", end: "07:10", title: "起床 / 早餐", category: "routine", modes: ALL },
        { id: "lunch", time: "12:00", end: "13:30", title: "午餐 + 20 分钟午休", category: "routine", modes: ALL },
        { id: "dinner", time: "18:00", end: "19:00", title: "晚餐 + 散步", category: "routine", modes: ALL },
        { id: "buffer", time: "19:00", end: "21:00", title: "缓冲 / 课业 / 社团（不排硬任务）", category: "rest", modes: ALL },
        { id: "english", time: "21:00", end: "21:30", title: "英语 30 分钟", category: "study", modes: ["blue", "red"] },
        { id: "review", time: "22:00", end: "22:30", title: "日复盘 + 明日 3 件事", category: "routine", modes: ALL },
        { id: "sleep", time: "23:00", end: "23:00", title: "睡觉", category: "routine", modes: ALL }
      ],
      thu: [
        { id: "wake", time: "06:50", end: "07:10", title: "起床 / 早餐", category: "routine", modes: ALL },
        { id: "lunch", time: "12:00", end: "13:30", title: "午餐 + 20 分钟午休", category: "routine", modes: ALL },
        { id: "gym", time: "16:00", end: "17:30", title: "健身 · 上肢（拉）", category: "gym", modes: ALL },
        { id: "shower", time: "17:30", end: "18:00", title: "洗澡 / 休息", category: "routine", modes: ALL },
        { id: "dinner", time: "18:00", end: "19:00", title: "晚餐", category: "routine", modes: ALL },
        { id: "study", time: "19:00", end: "21:30", title: "课业 / 英语", category: "study", modes: ["blue", "red"] },
        { id: "review", time: "22:00", end: "22:30", title: "日复盘 + 明日 3 件事", category: "routine", modes: ALL },
        { id: "sleep", time: "23:00", end: "23:00", title: "睡觉", category: "routine", modes: ALL }
      ],
      fri: [
        { id: "wake", time: "06:50", end: "07:10", title: "起床 / 早餐", category: "routine", modes: ALL },
        { id: "lunch", time: "12:00", end: "13:30", title: "午餐 + 20 分钟午休", category: "routine", modes: ALL },
        { id: "gym", time: "14:00", end: "15:30", title: "健身 · 下肢 + 核心", category: "gym", modes: ["blue", "red"] },
        { id: "shower", time: "15:30", end: "16:00", title: "洗澡 / 去教室", category: "routine", modes: ALL },
        { id: "dinner", time: "18:00", end: "19:00", title: "晚餐", category: "routine", modes: ALL },
        { id: "deep", time: "19:00", end: "21:30", title: "铸造赛：队伍 / 工艺方案", category: "deep", modes: ["blue", "red"] },
        { id: "english", time: "21:30", end: "22:00", title: "英语 30 分钟", category: "study", modes: ["blue", "red"] },
        { id: "review", time: "22:00", end: "22:30", title: "日复盘 + 明日 3 件事", category: "routine", modes: ALL },
        { id: "sleep", time: "23:00", end: "23:00", title: "睡觉", category: "routine", modes: ALL }
      ],
      sat: [
        { id: "wake", time: "08:00", end: "08:30", title: "起床 / 早餐", category: "routine", modes: ALL },
        { id: "deep", time: "08:30", end: "11:30", title: "竞赛 / 科研（铸造赛优先）", category: "deep", modes: ["blue", "red"] },
        { id: "lunch", time: "12:00", end: "13:30", title: "午餐 + 午休", category: "routine", modes: ALL },
        { id: "gym", time: "14:00", end: "15:30", title: "健身 · 全身 / 弱项", category: "gym", modes: ALL },
        { id: "study", time: "16:30", end: "18:00", title: "课业 / 作业", category: "study", modes: ["blue", "red"] },
        { id: "dinner", time: "18:00", end: "19:00", title: "晚餐", category: "routine", modes: ALL },
        { id: "rest", time: "19:00", end: "21:30", title: "自由 / 社交 / 放松", category: "rest", modes: ALL },
        { id: "review", time: "22:00", end: "22:30", title: "日复盘", category: "routine", modes: ALL },
        { id: "sleep", time: "23:00", end: "23:00", title: "睡觉", category: "routine", modes: ALL }
      ],
      sun: [
        { id: "wake", time: "08:30", end: "09:00", title: "起床 / 早餐", category: "routine", modes: ALL },
        { id: "gym", time: "09:00", end: "10:00", title: "健身或休息", category: "gym", modes: ALL },
        { id: "review-week", time: "10:30", end: "12:00", title: "周复盘 + 下周计划", category: "review", modes: ALL },
        { id: "lunch", time: "12:00", end: "13:30", title: "午餐", category: "routine", modes: ALL },
        { id: "buffer", time: "14:00", end: "17:00", title: "缓冲 / 采购 / 洗衣", category: "rest", modes: ALL },
        { id: "dinner", time: "18:00", end: "19:00", title: "晚餐", category: "routine", modes: ALL },
        { id: "rest", time: "19:00", end: "21:00", title: "轻阅读 / 早睡", category: "rest", modes: ALL },
        { id: "review", time: "22:00", end: "22:30", title: "日复盘", category: "routine", modes: ALL },
        { id: "sleep", time: "23:00", end: "23:00", title: "睡觉", category: "routine", modes: ALL }
      ]
    },

    // 课表（2026-10-19 截图；第 5 周课表，假定每周固定）。
    // endWeek: 12 = 只上到第 12 周；16 = 上到第 16 周。
    courses: [
      { id: "c1", name: "电工电子技术C", day: "mon", start: "08:00", end: "09:40", location: "云综教 C-205", endWeek: 12 },
      { id: "c2", name: "马克思主义基本原理", day: "mon", start: "10:10", end: "11:50", location: "云综教 C-202", endWeek: 16 },
      { id: "c3", name: "C++程序设计", day: "mon", start: "14:00", end: "15:40", location: "云综教 B-206", endWeek: 16 },
      { id: "c4", name: "实用工程英语写作", day: "mon", start: "16:10", end: "17:50", location: "云综实 A-422", endWeek: 12 },
      { id: "c5", name: "5G与人工智能（自然科学）", day: "mon", start: "19:30", end: "21:10", location: "网课", endWeek: 16, online: true },
      { id: "c6", name: "工程伦理学与技术经济", day: "tue", start: "08:00", end: "09:40", location: "云综教 B-304", endWeek: 12 },
      { id: "c7", name: "无人机设计与空天科技导论（自然科学）", day: "tue", start: "19:30", end: "21:10", location: "网课", endWeek: 16, online: true },
      { id: "c8", name: "概率论与数理统计", day: "wed", start: "08:00", end: "09:40", location: "云综教 B-102", endWeek: 16 },
      { id: "c9", name: "大学物理B（下）", day: "wed", start: "10:10", end: "11:50", location: "云综教 C-606", endWeek: 16 },
      { id: "c10", name: "体育（三）", day: "wed", start: "14:00", end: "15:40", location: "云攀岩场", endWeek: 16 },
      { id: "c11", name: "工程力学B", day: "wed", start: "16:10", end: "17:50", location: "云工一 B-206", endWeek: 12 },
      { id: "c12", name: "C++程序设计", day: "thu", start: "08:00", end: "09:40", location: "云综教 B-308", endWeek: 16 },
      { id: "c13", name: "材料科学基础", day: "thu", start: "10:10", end: "11:50", location: "云综教 B-202", endWeek: 16 },
      { id: "c14", name: "电工电子技术C", day: "thu", start: "14:00", end: "15:40", location: "云综教 C-205", endWeek: 12 },
      { id: "c15", name: "无人机设计与空天科技导论（自然科学）", day: "thu", start: "19:30", end: "21:10", location: "网课", endWeek: 16, online: true },
      { id: "c16", name: "写作与沟通", day: "fri", start: "08:00", end: "09:40", location: "云综教 C-603", endWeek: 12 },
      { id: "c17", name: "工程力学B", day: "fri", start: "10:10", end: "11:50", location: "云工一 B-207", endWeek: 12 },
      { id: "c18", name: "概率论与数理统计", day: "fri", start: "16:10", end: "17:50", location: "云综教 B-302", endWeek: 16 }
    ],

    goals: [
      {
        id: "gpa",
        title: "保研 GPA",
        subtitle: "保持专业前 10%；高学分课 85+；4 分制填 3.7，5 分制改 target 后再填",
        target: 4.0,
        unit: "GPA",
        deadline: "2027-01-31",
        category: "学业"
      },
      {
        id: "foundry",
        title: "铸造赛",
        subtitle: "完整作品，2027-03-15 前提交区域赛",
        target: 100,
        unit: "%",
        deadline: "2027-03-15",
        category: "竞赛"
      },
      {
        id: "research",
        title: "科研入门",
        subtitle: "10–15 篇文献笔记 + 1 个可复现 ABAQUS 模型 + 大创申报书初稿",
        target: 12,
        unit: "篇",
        deadline: "2027-02-28",
        category: "科研"
      },
      {
        id: "intern",
        title: "寒假实习",
        subtitle: "投递 ≥10 家，拿到至少 1 个机会",
        target: 10,
        unit: "家",
        deadline: "2026-12-31",
        category: "就业"
      },
      {
        id: "english",
        title: "六级",
        subtitle: "目标 500+（若已报名 2026-12）",
        target: 500,
        unit: "分",
        deadline: "2026-12-19",
        category: "英语"
      },
      {
        id: "gym",
        title: "健身",
        subtitle: "平均每周 4–5 次；冲刺期 3 次维持",
        target: 60,
        unit: "次",
        deadline: "2027-01-15",
        category: "健康",
        auto: "gym"
      }
    ],

    milestones: [
      { id: "m1", date: "2026-10-25", title: "第一次周复盘", category: "系统" },
      { id: "m2", date: "2026-11-30", title: "铸造赛工艺方案初稿", category: "竞赛" },
      { id: "m3", date: "2026-12-19", title: "六级考试（预计）", category: "英语" },
      { id: "m4", date: "2027-01-11", title: "期末周 / 红色档启动（以校历为准）", category: "学业" },
      { id: "m5", date: "2027-01-31", title: "铸造赛说明书初稿", category: "竞赛" },
      { id: "m6", date: "2027-02-28", title: "大创申报书初稿", category: "科研" },
      { id: "m7", date: "2027-03-15", title: "铸造赛区域赛作品提交", category: "竞赛" },
      { id: "m8", date: "2027-07-15", title: "智能汽车分区赛（预计）", category: "竞赛" }
    ],

    competitions: [
      {
        name: "中国大学生铸造工艺设计赛",
        role: "主攻",
        deadline: "2027-03-15",
        status: "准备中",
        note: "导师带队；区域赛 3/15 提交；国赛 5–7 月"
      },
      {
        name: "全国大学生智能汽车竞赛",
        role: "学习型参与",
        deadline: "2027-07-15",
        status: "待报名",
        note: "每周 ≤3h；只跟一个模块；不当队长"
      },
      {
        name: "智能制造赛",
        role: "暂缓",
        deadline: "",
        status: "暂缓",
        note: "本学期不投入；校队边际成本低时再做观察员"
      }
    ],

    papers: [
      {
        id: "p1",
        title: "A TPMS-based method for modeling porous scaffolds for bionic bone tissue engineering",
        meta: "Sci Rep 2018 · 必读",
        link: "https://pubmed.ncbi.nlm.nih.gov/29743648/"
      },
      {
        id: "p2",
        title: "施建平博士论文《面向骨植入体 3D 打印的多孔结构构建研究》",
        meta: "博士论文 · 必读",
        link: ""
      },
      {
        id: "p3",
        title: "PMC7311579（多孔支架综述）",
        meta: "免费 · 必读",
        link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7311579/"
      },
      {
        id: "p4",
        title: "PMC10669447（多孔结构综述）",
        meta: "免费 · 必读",
        link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10669447/"
      },
      {
        id: "p5",
        title: "SLM 成形仿生多孔 Ti-6Al-4V 钛合金植入体的变形和耐腐蚀行为研究",
        meta: "导师提供 · 必读",
        link: ""
      }
    ],

    firstWeekPriorities: [
      "系统：mentor 文档 + PWA 上线，手机能打开；周日做第一次复盘",
      "竞赛：找导师确认铸造赛队伍、题目、寒假安排；查智能汽车校内报名",
      "学业：列出期中考试科目/日期，做 3 周复习表；确认六级报名"
    ]
  };
})();
