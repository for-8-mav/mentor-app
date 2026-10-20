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
      version: 3,
      lastUpdated: "2026-10-20"
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
        { id: "wake", time: "06:50", end: "07:10", title: "起床", category: "routine", modes: ALL },
        { id: "breakfast", time: "07:10", end: "07:40", title: "早餐", category: "routine", modes: ALL },
        { id: "morning", time: "07:40", end: "08:00", title: "去教室 / 晨读", category: "routine", modes: ALL },
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
        { id: "gym", time: "14:00", end: "15:30", title: "健身 · 上肢（推）", category: "gym", modes: ["blue", "red"] },
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
        { id: "gym", time: "14:00", end: "15:30", title: "健身 · 下肢 + 核心 / 弱项", category: "gym", modes: ALL },
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

    learning: {
      goal: "机械设计 / 制造工艺实习",
      weeklyHours: "3–4h",
      method: [
        "20 分钟输入 + 20 分钟动手：看完一个点就立刻在 SolidWorks 或纸上做一遍。",
        "每个模块必须交一个交付物；没有交付物 = 没学。",
        "用铸造赛零件当练习对象，学完直接用在比赛里。",
        "每张图/每份报告找导师或学长改 1 次，记录 3 个改进点。",
        "周末用 10 分钟复述：能不能用 3 句话讲清楚这个知识点。"
      ],
      modules: [
        {
          id: "m1",
          startWeek: 7,
          endWeek: 8,
          title: "工程图 + 公差",
          why: "实习第一周就会让你出图；铸造赛也要交零件图/装配图；面试可能现场考。",
          topics: [
            { id: "t1", text: "视图选择、剖视、局部放大" },
            { id: "t2", text: "尺寸基准与标注完整性" },
            { id: "t3", text: "公差配合（H7/g6 等）与表面粗糙度" },
            { id: "t4", text: "GD&T 基础：平面度、平行度、位置度、轮廓度" },
            { id: "t5", text: "标题栏、技术要求、BOM" }
          ],
          methods: [
            "SolidWorks 官方教程 1h：工程图模块",
            "临摹 2 张标准零件图（教材/网上），对比自己的标注",
            "用铸造赛零件出 1 张完整零件图，找导师/学长改",
            "每张图记录 3 个错误，下一张不再犯"
          ],
          deliverable: "3 张完整零件图（支架 / 轴 / 铸件），含公差、粗糙度、标题栏",
          resources: [
            { label: "SolidWorks 官方教程（工程图）", url: "https://help.solidworks.com/" },
            { label: "B 站搜索：SolidWorks 工程图 / 公差配合", url: "https://search.bilibili.com/all?keyword=SolidWorks%20%E5%B7%A5%E7%A8%8B%E5%9B%BE" },
            { label: "《机械制图》教材：视图 / 剖视 / 标注", url: "" },
            { label: "《GD&T 几何公差》入门资料", url: "https://search.bilibili.com/all?keyword=GD%26T%20%E5%87%A0%E4%BD%95%E5%85%AC%E5%B7%AE" }
          ]
        },
        {
          id: "m2",
          startWeek: 9,
          endWeek: 10,
          title: "铸造工艺 + DFM",
          why: "铸造赛的核心，也是工艺岗面试最常问的：你的设计能不能造出来、怎么造、哪里会出缺陷。",
          topics: [
            { id: "t1", text: "分型面、拔模斜度、壁厚、圆角" },
            { id: "t2", text: "砂芯、浇注系统、冒口/冷铁" },
            { id: "t3", text: "常见铸造缺陷：缩孔、气孔、夹砂、裂纹" },
            { id: "t4", text: "DFM 规则：减少砂芯、避免尖角、均匀壁厚" },
            { id: "t5", text: "成本意识：模具、砂芯、工时、废品率" }
          ],
          methods: [
            "读《铸造工艺学》对应章节 1h，画一张思维导图",
            "拿铸造赛零件，标出分型面、拔模方向、砂芯位置",
            "看 2 个铸造厂视频，记录一个实际缺陷案例",
            "找导师确认你的工艺方案，记录 3 个改进点"
          ],
          deliverable: "铸造赛零件的工艺分析报告（分型面、拔模、砂芯、缺陷、改进）",
          resources: [
            { label: "《铸造工艺学》教材", url: "" },
            { label: "B 站搜索：砂型铸造 / 铸造缺陷", url: "https://search.bilibili.com/all?keyword=%E7%A0%82%E5%9E%8B%E9%93%B8%E9%80%A0" },
            { label: "铸造赛官方资料 / 往届作品", url: "" }
          ]
        },
        {
          id: "m3",
          startWeek: 11,
          endWeek: 12,
          title: "机加工 / 钣金 / 注塑 + 工艺路线",
          why: "实习最常见的任务：把一个零件拆成工序，判断能不能加工、怎么装夹、成本大概多少。",
          topics: [
            { id: "t1", text: "车、铣、钻、磨的基本能力和精度" },
            { id: "t2", text: "钣金折弯、冲压、焊接基础" },
            { id: "t3", text: "注塑基础：拔模、壁厚、浇口、缩水" },
            { id: "t4", text: "工艺路线：毛坯 → 粗加工 → 半精 → 精加工 → 检验" },
            { id: "t5", text: "夹具与定位基准基础" }
          ],
          methods: [
            "读《机械制造工艺学》1 章，整理 10 个术语",
            "选一个简单支架，写 2 条不同工艺路线并对比",
            "去一次实验室/工厂，看真实机床和装夹",
            "估算材料费 + 工时费，做一张成本表"
          ],
          deliverable: "支架的工艺路线（2 个方案对比）+ 成本估算表",
          resources: [
            { label: "《机械制造工艺学》教材", url: "" },
            { label: "B 站搜索：机械加工工艺 / 钣金 / 注塑", url: "https://search.bilibili.com/all?keyword=%E6%9C%BA%E6%A2%B0%E5%8A%A0%E5%B7%A5%E5%B7%A5%E8%89%BA" },
            { label: "本地工厂 / 实验室参观", url: "" }
          ]
        },
        {
          id: "m4",
          startWeek: 13,
          endWeek: 14,
          title: "质量 + 成本 + BOM",
          why: "工艺岗/质量岗实习都会碰到：怎么检、怎么判断合格、出了问题怎么追。",
          topics: [
            { id: "t1", text: "常用量具：卡尺、千分尺、高度规、三坐标" },
            { id: "t2", text: "SPC、Cp/Cpk、控制图基础" },
            { id: "t3", text: "8D、5 Why、鱼骨图" },
            { id: "t4", text: "BOM / ERP / 物料编码基础" },
            { id: "t5", text: "成本构成：材料、工时、模具、废品率" }
          ],
          methods: [
            "用卡尺量 5 个零件，记录数据并算平均值/极差",
            "给铸造赛零件写一份检验计划（检什么、用什么、频次）",
            "用一个实际缺陷做 5 Why 分析",
            "用 Excel 做一张简单 BOM + 成本表"
          ],
          deliverable: "铸造赛零件的质量控制计划 + 成本表",
          resources: [
            { label: "《质量管理》基础章节", url: "" },
            { label: "B 站搜索：SPC / 8D / 三坐标", url: "https://search.bilibili.com/all?keyword=SPC%208D" },
            { label: "Excel / Python 数据整理", url: "" }
          ]
        },
        {
          id: "m5",
          startWeek: 15,
          endWeek: 16,
          title: "简历 + 作品集 + 面试",
          why: "寒假实习 11–12 月投递；没有简历和项目故事，学得再多也展示不出来。",
          topics: [
            { id: "t1", text: "一页简历：教育、技能、项目、竞赛" },
            { id: "t2", text: "3 个项目故事（STAR）" },
            { id: "t3", text: "SolidWorks 现场测试常见题" },
            { id: "t4", text: "工艺/公差/DFM 常见面试题" },
            { id: "t5", text: "作品集 PDF / GitHub README" }
          ],
          methods: [
            "写一页中文简历，找导师/学长改 2 轮",
            "把铸造赛、多孔结构、data-tool 各写成 1 个 STAR 故事",
            "做一次 30 分钟 mock interview",
            "录 2 分钟项目自述，回听并改"
          ],
          deliverable: "一页简历 + 3 个项目故事 + 作品集 PDF",
          resources: [
            { label: "三一/中联/比亚迪等招聘 JD", url: "" },
            { label: "牛客 / 实习僧面经", url: "https://www.nowcoder.com/" },
            { label: "导师/学长 mock interview", url: "" }
          ]
        },
        {
          id: "m6",
          startWeek: 17,
          endWeek: 22,
          title: "寒假实习投递 + 复盘",
          why: "把前 10 周学的东西换成一次真实实习/面试反馈；投递本身就是学习。",
          topics: [
            { id: "t1", text: "投递 ≥10 家（长沙本地优先）" },
            { id: "t2", text: "记录每次面试问题与回答" },
            { id: "t3", text: "复盘：不会的题补进下阶段" },
            { id: "t4", text: "寒假小项目 / 实验室任务" }
          ],
          methods: [
            "每周投 3–5 家，优先老师/学长推荐",
            "每次面试后 30 分钟内写复盘",
            "把不会的问题整理成清单，逐个补",
            "寒假做 1 个能写进简历的小项目"
          ],
          deliverable: "投递记录表 + 面试复盘 + 寒假项目",
          resources: [
            { label: "BOSS 直聘 / 实习僧 / 学校就业网", url: "" },
            { label: "学院老师/辅导员推荐", url: "" }
          ]
        }
      ]
    },

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
