const STORE_KEY = "catTeacherMobileAccounts";

const state = {
  accounts: loadAccounts(),
  currentId: "",
  studyMode: "diagnosis",
  catAction: "idle",
  actionUntil: 0,
  frame: 0,
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  showScreen("authChoiceScreen");
  animateCats();
});

function cacheElements() {
  [
    "authChoiceScreen",
    "showRegisterBtn",
    "showLoginBtn",
    "registerScreen",
    "loginScreen",
    "registerAge",
    "registerGrade",
    "registerId",
    "registerPassword",
    "createAccountBtn",
    "loginId",
    "loginPassword",
    "loginBtn",
    "homeScreen",
    "homeGreeting",
    "homeAvatarBtn",
    "homeAvatarInitial",
    "homeAvatarImage",
    "homeTreeBtn",
    "authCatCanvas",
    "catCanvas",
    "catBubble",
    "chatLog",
    "chatForm",
    "chatInput",
    "sendChatBtn",
    "clearChatBtn",
    "todayActionText",
    "completeTodayBtn",
    "openDiagnosisBtn",
    "openPlanBtn",
    "openSolutionBtn",
    "openTreeCardBtn",
    "studyScreen",
    "studyPageTitle",
    "studyModeTitle",
    "studyModeCopy",
    "studyInputCard",
    "studyGoalInput",
    "studyGradeSelect",
    "studySubjectSelect",
    "studyStateSelect",
    "studyHoursInput",
    "studyExamDaysInput",
    "generateStudyBtn",
    "saveStudyGoalBtn",
    "diagnosisResult",
    "solutionResult",
    "planRangeSelect",
    "planEmptyState",
    "calendarGrid",
    "planResult",
    "profileScreen",
    "profileAvatarBtn",
    "profileIdInput",
    "profileAvatarUpload",
    "profileGoalInput",
    "profileAvatarInitial",
    "profileAvatarImage",
    "saveProfileBtn",
    "treeScreen",
    "treeArtwork",
    "treeStageText",
    "treeHealthText",
    "treeCompleteBtn",
    "treeMissBtn",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  els.showRegisterBtn.addEventListener("click", () => showScreen("registerScreen"));
  els.showLoginBtn.addEventListener("click", () => showScreen("loginScreen"));
  document.querySelectorAll("[data-back-auth]").forEach((button) => {
    button.addEventListener("click", () => showScreen("authChoiceScreen"));
  });
  document.querySelectorAll("[data-go-home]").forEach((button) => {
    button.addEventListener("click", () => showHome());
  });

  els.createAccountBtn.addEventListener("click", createAccount);
  els.loginBtn.addEventListener("click", loginAccount);
  els.homeAvatarBtn.addEventListener("click", showProfile);
  els.homeTreeBtn.addEventListener("click", showTree);
  document.querySelectorAll("[data-study-mode]").forEach((button) => {
    button.addEventListener("click", () => showStudy(button.dataset.studyMode));
  });
  els.openTreeCardBtn.addEventListener("click", showTree);
  els.generateStudyBtn.addEventListener("click", () => generateStudyReport(true));
  els.saveStudyGoalBtn.addEventListener("click", saveStudyGoal);
  els.planRangeSelect.addEventListener("change", () => renderPlanView(activeAccount()));
  els.profileAvatarBtn.addEventListener("click", () => els.profileAvatarUpload.click());
  els.profileAvatarUpload.addEventListener("change", uploadAvatar);
  els.saveProfileBtn.addEventListener("click", saveProfile);

  els.chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendChat();
  });
  els.sendChatBtn.addEventListener("click", sendChat);
  els.chatInput.addEventListener("keydown", (event) => {
    if (event.isComposing) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChat();
    }
  });
  els.clearChatBtn.addEventListener("click", clearChat);
  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      els.chatInput.value = button.dataset.prompt;
      sendChat();
    });
  });

  els.catCanvas.addEventListener("click", () => {
    const action = pick(["wave", "think", "focus", "celebrate"]);
    catDo(action);
    catSay(pick([
      "我在的。点我也可以叫醒陪学模式。",
      "先做一小步就好，我陪你把任务拆开。",
      "今天不用一下子变完美，我们把第一步完成。",
    ]));
  });

  els.completeTodayBtn.addEventListener("click", completeDailyAction);
  els.treeCompleteBtn.addEventListener("click", completeDailyAction);
  els.treeMissBtn.addEventListener("click", missDailyAction);
}

function loadAccounts() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAccounts() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state.accounts));
}

function activeAccount() {
  return state.accounts[state.currentId] || null;
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenId);
    if (screen.id === screenId) screen.scrollTop = 0;
  });
}

function createAccount() {
  const age = els.registerAge.value.trim();
  const grade = els.registerGrade.value.trim();
  const id = els.registerId.value.trim();
  const password = els.registerPassword.value.trim();

  if (!age || !grade || !id || !password) {
    alert("请填写完整信息");
    return;
  }

  if (state.accounts[id]) {
    alert("该账号已存在");
    return;
  }

  state.accounts[id] = {
    id,
    password,
    age,
    grade,
    avatarData: "",
    goal: "把长期学习目标拆成每天可以开始的一小步。",
    treeStage: 0,
    treeHealth: 3,
    lastDoneAt: "",
    lastDecayAt: todayKey(),
    chat: [],
    createdAt: new Date().toISOString(),
  };
  state.currentId = id;
  saveAccounts();
  clearForm("registerAge", "registerId", "registerPassword");
  els.registerGrade.value = "";
  enterApp("账号创建好了。今天先从一个小行动开始。");
}

function loginAccount() {
  const id = els.loginId.value.trim();
  const password = els.loginPassword.value.trim();
  const account = state.accounts[id];

  if (!account || account.password !== password) {
    alert("该账号不存在");
    return;
  }

  state.currentId = id;
  clearForm("loginId", "loginPassword");
  enterApp("欢迎回来，我已经准备好陪你学习了。");
}

function clearForm(...ids) {
  ids.forEach((id) => {
    if (els[id]) els[id].value = "";
  });
}

function enterApp(line) {
  const account = activeAccount();
  applyInactivity(account);
  seedChatIfNeeded(account);
  renderHome();
  renderProfile();
  renderTree();
  renderStudy();
  showHome();
  catSay(line);
}

function showHome() {
  renderHome();
  showScreen("homeScreen");
}

function showProfile() {
  renderProfile();
  showScreen("profileScreen");
}

function showTree() {
  renderTree();
  showScreen("treeScreen");
}

function showStudy(mode = "diagnosis") {
  renderStudy(mode);
  showScreen("studyScreen");
}

function renderHome() {
  const account = activeAccount();
  if (!account) return;
  const shownName = account.displayName || account.id;
  els.homeGreeting.textContent = `你好，${account.grade || ""}${shownName}`;
  els.todayActionText.textContent = buildTodayAction(account);
  renderAvatar(account);
  renderChat();
}

function renderProfile() {
  const account = activeAccount();
  if (!account) return;
  els.profileIdInput.value = account.id;
  els.profileGoalInput.value = account.goal || "";
  renderAvatar(account);
}

function renderStudy(mode = "diagnosis") {
  const account = activeAccount();
  if (!account) return;
  state.studyMode = mode;
  const profile = account.studyProfile || {};
  els.studyGoalInput.value = profile.goal || account.goal || "把长期学习目标拆成每天可以开始的一小步。";
  els.studyGradeSelect.value = profile.grade || account.grade || "初三";
  els.studySubjectSelect.value = profile.subject || detectSubject(els.studyGoalInput.value);
  els.studyStateSelect.value = profile.state || "知道要学，但开始困难";
  els.studyHoursInput.value = profile.hours || 6;
  els.studyExamDaysInput.value = profile.examDays || 90;
  setStudyModeTitle(mode);
  applyStudyMode(account);
}

function setStudyModeTitle(mode) {
  const config = {
    diagnosis: {
      page: "学业诊断",
      title: "输入目标，生成诊断",
      copy: "告诉猫老师你的目标、科目和卡点，AI 会判断问题在哪里。",
    },
    plan: {
      page: "时间规划",
      title: "AI 日历规划",
      copy: "时间规划会根据学业诊断自动生成，没有诊断就不会乱排计划。",
    },
    solution: {
      page: "解决方案",
      title: "把问题拆成行动方案",
      copy: "这里会把诊断结果变成能开始、能执行、能复盘的步骤。",
    },
  };
  const item = config[mode] || config.diagnosis;
  els.studyPageTitle.textContent = item.page;
  els.studyModeTitle.textContent = item.title;
  els.studyModeCopy.textContent = item.copy;
}

function applyStudyMode(account) {
  const hasReport = !!account.studyReport;
  els.studyInputCard.classList.toggle("is-hidden", state.studyMode !== "diagnosis");
  els.diagnosisResult.closest(".result-card").classList.toggle("is-hidden", state.studyMode !== "diagnosis");
  els.solutionResult.closest(".result-card").classList.toggle("is-hidden", state.studyMode !== "solution");
  els.planResult.closest(".result-card").classList.toggle("is-hidden", state.studyMode !== "plan");

  if (!hasReport) {
    renderEmptyStudyState();
    return;
  }

  renderStudyOutput(account.studyReport);
}

function renderEmptyStudyState() {
  els.diagnosisResult.innerHTML = `
    <div class="empty-state">输入目标后点击“生成学业诊断”，猫老师会分析你的学习卡点。</div>
  `;
  els.solutionResult.innerHTML = `
    <div class="empty-state">你还没有诊断内容</div>
  `;
  els.planEmptyState.classList.remove("is-hidden");
  els.planEmptyState.textContent = "你还没有规划内容";
  els.calendarGrid.classList.add("is-hidden");
  els.planResult.innerHTML = "";
}

function getStudyInput() {
  return {
    goal: els.studyGoalInput.value.trim() || "把长期学习目标拆成每天可以开始的一小步。",
    grade: els.studyGradeSelect.value || "初三",
    subject: els.studySubjectSelect.value || "综合复习",
    state: els.studyStateSelect.value || "知道要学，但开始困难",
    hours: Math.max(1, Math.min(12, Number(els.studyHoursInput.value || 6))),
    examDays: Math.max(1, Math.min(365, Number(els.studyExamDaysInput.value || 90))),
  };
}

function generateStudyReport(announce = false) {
  const account = activeAccount();
  if (!account) return;
  const input = getStudyInput();
  const report = buildStudyReport(input);
  account.studyProfile = input;
  account.studyReport = report;
  saveAccounts();
  applyStudyMode(account);
  if (announce) {
    catDo("think");
    catSay("诊断生成好了，我已经把目标拆成解决方案和今日时间表。");
    pushAiMessage(`我已经为你生成了学业诊断。\n\n核心判断：${report.diagnosis[0].body}\n\n现在先做：${report.solution[0].body}`);
  }
}

function saveStudyGoal() {
  const account = activeAccount();
  if (!account) return;
  const input = getStudyInput();
  account.goal = input.goal;
  account.grade = input.grade;
  account.studyProfile = input;
  account.studyReport = buildStudyReport(input);
  saveAccounts();
  renderHome();
  renderProfile();
  applyStudyMode(account);
  catSay("目标保存好了。首页的今日行动也会按这个目标调整。");
  alert("目标已保存");
}

function renderStudyOutput(report) {
  els.diagnosisResult.innerHTML = report.diagnosis.map(renderResultItem).join("");
  els.solutionResult.innerHTML = report.solution.map(renderResultItem).join("");
  renderPlanView(activeAccount());
}

function renderPlanView(account) {
  if (!account || !account.studyReport) {
    els.planEmptyState.classList.remove("is-hidden");
    els.planEmptyState.textContent = "你还没有规划内容";
    els.calendarGrid.classList.add("is-hidden");
    els.planResult.innerHTML = "";
    return;
  }

  const range = els.planRangeSelect.value || "daily";
  const report = account.studyReport;
  els.planEmptyState.classList.add("is-hidden");
  els.calendarGrid.classList.remove("is-hidden");
  els.calendarGrid.classList.toggle("yearly", range === "yearly");
  els.calendarGrid.innerHTML = buildCalendarHtml(report, range);
  els.planResult.innerHTML = buildPlanSummary(report, range)
    .map(
      (item) => `
        <div class="timeline-item">
          <span class="timeline-time">${escapeHtml(item.time)}</span>
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.body)}</p>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderResultItem(item) {
  return `
    <div class="result-item">
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.body)}</p>
    </div>
  `;
}

function buildStudyReport(input) {
  const risk = input.examDays <= 30 || input.hours <= 3 ? "高" : input.examDays <= 90 ? "中" : "可控";
  const core = getStudyCore(input);
  return {
    input,
    diagnosis: [
      {
        title: `当前风险：${risk}`,
        body: `${input.grade}，目标是“${input.goal}”。主要矛盾不是没有目标，而是“${core.problem}”。`,
      },
      {
        title: "最先解决的卡点",
        body: core.reason,
      },
      {
        title: "今天不要做太大",
        body: `先用 ${Math.min(25, Math.max(10, input.hours * 4))} 分钟完成一个可复盘动作，而不是一上来要求自己学完整块内容。`,
      },
    ],
    solution: [
      {
        title: "第一步：最小行动",
        body: makeFirstAction(input),
      },
      {
        title: "第二步：同类练习",
        body: `围绕${input.subject}选择 1 个最常丢分的题型，只做 1 道例题 + 1 道同类题，做完写一句“我卡在哪里”。`,
      },
      {
        title: "第三步：复盘闭环",
        body: "每天结束前只复盘三件事：完成了什么、哪里卡住、明天第一步是什么。复盘越短，越容易坚持。",
      },
    ],
    plan: buildDailyPlan(input),
  };
}

function getStudyCore(input) {
  if (input.state.includes("任务太多")) {
    return {
      problem: "优先级混乱",
      reason: "任务一多，大脑会把所有事都当成压力。先按分数影响排序，只保留今天最关键的一科和一个题型。",
    };
  }
  if (input.state.includes("时间混乱")) {
    return {
      problem: "计划没有进入真实时间",
      reason: "计划失败通常不是人不自律，而是任务没有被放进具体时间段。今天要先排学习块，再排任务。",
    };
  }
  if (input.state.includes("基础薄弱")) {
    return {
      problem: "基础概念没有形成可调用结构",
      reason: "直接刷难题会消耗信心。先回到例题、公式、定义和错因，把会做的链条接起来。",
    };
  }
  if (input.state.includes("焦虑")) {
    return {
      problem: "复盘不稳定，情绪干扰开始",
      reason: "焦虑时不要加任务量，要降低开始门槛。用短行动拿回控制感，再做正式学习。",
    };
  }
  return {
    problem: "开始成本太高",
    reason: "你不是完全不知道要做什么，而是任务看起来太大。先把目标压成 5 到 25 分钟能开始的动作。",
  };
}

function makeFirstAction(input) {
  if (input.subject === "数学") return "打开错题本，只圈出一道题的已知条件、要求和卡住位置。先不追求做完。";
  if (input.subject === "英语") return "选 5 个单词和 1 个句型，用 8 分钟完成“看、遮、说、写”一轮。";
  if (input.subject === "语文") return "找一道阅读题，先圈题干动词，再写出答题结构，不急着写完整答案。";
  if (input.subject === "物理") return "先画关系图，标出已知量和单位，再决定用哪个公式。";
  if (input.subject === "化学") return "把题里的物质分成反应物和生成物两列，再写方程式。";
  return "从最影响分数的一科里选一个小题型，完成 1 道例题和 1 句复盘。";
}

function buildDailyPlan(input) {
  const hours = input.hours;
  const hardBlock = input.subject === "综合复习" ? "高难科目专题" : `${input.subject}高难任务`;
  const base = [
    { time: "09:00", title: hardBlock, body: "状态最好时做最费脑的任务，只做一个题型，不混着做。" },
    { time: "10:15", title: "错题订正", body: "订正 2 到 3 道错题，写清楚错因，不追求数量。" },
    { time: "14:30", title: "同类练习", body: "做 1 道例题和 1 道同类题，训练迁移。" },
    { time: "19:30", title: "背诵记忆", body: "安排英语、语文或文科记忆内容，用主动回忆代替反复看。" },
    { time: "21:20", title: "复盘收尾", body: "写下今天完成、卡点、明天第一步，控制在 3 分钟内。" },
  ];
  if (hours <= 3) return [base[0], base[4]];
  if (hours <= 5) return [base[0], base[2], base[4]];
  if (hours <= 7) return [base[0], base[1], base[2], base[4]];
  return base;
}

function buildCalendarHtml(report, range) {
  const input = report.input || {};
  const subject = input.subject || "综合复习";
  const state = input.state || "知道要学，但开始困难";

  if (range === "yearly") {
    const months = [
      "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月",
    ];
    const phases = [
      "基础补洞", "例题重建", "同类练习", "错题复盘", "专题突破", "小测校准",
      "综合训练", "薄弱回补", "限时训练", "模拟复盘", "冲刺整理", "稳定作息",
    ];
    return months
      .map(
        (month, index) => `
          <div class="calendar-day ${index === 0 ? "featured" : ""}">
            <strong>${month}</strong>
            <span>${subject}${phases[index]}</span>
          </div>
        `,
      )
      .join("");
  }

  const dailyActions = [
    makeFirstAction(input),
    `${subject}例题 1 道 + 同类题 1 道`,
    "整理错因，只写一句复盘",
    state.includes("时间") ? "重排学习块" : "补一个薄弱知识点",
    "做一次 25 分钟专注",
    "主动回忆背诵内容",
    "周复盘：保留有效方法",
  ];

  const count = range === "monthly" ? 30 : 7;
  return Array.from({ length: count }, (_, index) => {
    const dayLabel = range === "monthly" ? `${index + 1}` : index === 0 ? "今天" : index === 1 ? "明天" : `D${index + 1}`;
    const action = dailyActions[index % dailyActions.length];
    const featured = index === 0 || (range === "monthly" && [6, 13, 20, 27].includes(index));
    return `
      <div class="calendar-day ${featured ? "featured" : ""}">
        <strong>${dayLabel}</strong>
        <span>${escapeHtml(action)}</span>
      </div>
    `;
  }).join("");
}

function buildPlanSummary(report, range) {
  const input = report.input || {};
  if (range === "monthly") {
    return [
      { time: "第1周", title: "诊断和基础补洞", body: `围绕${input.subject || "主要科目"}找到最常丢分题型，每天只突破一个小点。` },
      { time: "第2周", title: "同类题训练", body: "每天 1 道例题 + 1 道同类题，建立题型迁移能力。" },
      { time: "第3周", title: "限时小测", body: "每两天一次短测，把错题归因到读题、概念、方法或计算。" },
      { time: "第4周", title: "复盘稳定", body: "减少新任务，集中整理错题和下个月第一步。" },
    ];
  }
  if (range === "yearly") {
    return [
      { time: "1-3月", title: "基础重建", body: "把概念、公式、例题重新接起来，先求稳定正确率。" },
      { time: "4-6月", title: "专题突破", body: "按题型拆解训练，形成每类题的开始方法。" },
      { time: "7-9月", title: "综合训练", body: "加入限时、套卷和跨章节题，训练考试节奏。" },
      { time: "10-12月", title: "冲刺复盘", body: "减少盲目刷题，集中整理错因、模板和高频题。" },
    ];
  }
  return report.plan;
}

function detectSubject(text) {
  if (/英语|单词|阅读|听力|语法|作文/.test(text)) return "英语";
  if (/语文|作文|文言文|阅读理解|古诗/.test(text)) return "语文";
  if (/物理|电学|力学|浮力|压强/.test(text)) return "物理";
  if (/化学|方程式|实验|酸碱盐/.test(text)) return "化学";
  if (/数学|函数|几何|方程|代数/.test(text)) return "数学";
  return "综合复习";
}

function renderAvatar(account) {
  const initial = (account.displayName || account.id || "猫").slice(0, 1).toUpperCase();
  [
    [els.homeAvatarInitial, els.homeAvatarImage],
    [els.profileAvatarInitial, els.profileAvatarImage],
  ].forEach(([initialEl, imageEl]) => {
    initialEl.textContent = initial;
    if (account.avatarData) {
      imageEl.src = account.avatarData;
      imageEl.hidden = false;
      initialEl.hidden = true;
    } else {
      imageEl.hidden = true;
      initialEl.hidden = false;
    }
  });
}

function uploadAvatar(event) {
  const account = activeAccount();
  const file = event.target.files?.[0];
  if (!account || !file) return;
  const reader = new FileReader();
  reader.onload = () => {
    account.avatarData = String(reader.result || "");
    saveAccounts();
    renderAvatar(account);
    catSay("头像换好啦，我记住你的新样子了。");
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  const account = activeAccount();
  if (!account) return;

  const newId = els.profileIdInput.value.trim();
  const newGoal = els.profileGoalInput.value.trim();

  if (!newId) {
    alert("ID 不能为空");
    return;
  }

  if (newId !== account.id && state.accounts[newId]) {
    alert("该账号已存在");
    return;
  }

  if (newId !== account.id) {
    delete state.accounts[account.id];
    account.id = newId;
    state.accounts[newId] = account;
    state.currentId = newId;
  }

  account.goal = newGoal || "把长期学习目标拆成每天可以开始的一小步。";
  saveAccounts();
  renderHome();
  renderProfile();
  renderStudy();
  catSay("主页保存好了。你的目标我会放进每天的最小行动里。");
  alert("保存成功");
}

function seedChatIfNeeded(account) {
  if (!account.chat || !Array.isArray(account.chat) || account.chat.length === 0) {
    account.chat = [
      {
        role: "ai",
        text: "在的～有什么能帮助你的吗？你可以问我题目、计划、背诵、作文，或者只是说今天不想学。",
      },
    ];
    saveAccounts();
  }
}

function renderChat() {
  const account = activeAccount();
  if (!account) return;
  seedChatIfNeeded(account);
  els.chatLog.innerHTML = account.chat
    .map((message) => `<div class="message ${message.role}">${escapeHtml(message.text)}</div>`)
    .join("");
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function sendChat() {
  const account = activeAccount();
  if (!account) return;
  const text = els.chatInput.value.trim();
  if (!text) return;

  seedChatIfNeeded(account);
  account.chat.push({ role: "user", text });
  els.chatInput.value = "";
  renderChat();

  catDo("think");
  window.setTimeout(() => {
    const reply = createReply(text, account);
    account.chat.push({ role: "ai", text: reply });
    saveAccounts();
    renderHome();
    renderChat();
    catSay(reply.split("\n")[0].replace(/^猫老师：/, ""));
    catDo(text.includes("完成") ? "celebrate" : "wave");
  }, 360);
}

function clearChat() {
  const account = activeAccount();
  if (!account) return;
  account.chat = [
    {
      role: "ai",
      text: "对话清空了。你可以重新问我任何事：学习、计划、情绪、考试、生活节奏都可以。",
    },
  ];
  saveAccounts();
  renderChat();
  catSay("我在的，重新开始聊也可以。");
}

function createReply(message, account) {
  const text = message.toLowerCase().replace(/\s+/g, "");
  const goal = account.goal || "当前学习目标";
  const grade = account.grade || "当前年级";
  const nameMatch = message.match(/(?:我叫|我是|我的名字是|叫我)\s*([A-Za-z0-9_\-\u4e00-\u9fa5]{1,18})/);

  if (nameMatch) {
    const name = nameMatch[1].trim();
    account.displayName = name;
    return `记住啦，${name}。以后我就这样称呼你。你可以直接跟我说学习目标、今天状态，或者只说一句“我不想学”，我会按你的情况接住你。`;
  }

  if (/(你好|在吗|在不在|哈喽|嗨|hi|hello|早上好|晚上好)/i.test(text)) {
    return pick([
      "在的～有什么能帮助你的吗？你可以直接告诉我：你卡在哪一科、哪道题、或者今天最不想开始的任务。",
      "在的～我听着呢。你可以把问题发给我，我会帮你拆成“从哪开始”和“下一步怎么做”。",
      "在的～今天我们不用一下子解决全部，先说一个最卡的点就行。",
    ]);
  }

  if (/(谢谢|感谢|thank)/i.test(text)) {
    return "不用客气～你愿意把问题说出来，就已经完成了开始前最难的一步。下一步只要继续做一个 5 分钟小行动。";
  }

  if (/(你叫|叫什么|名字|怎么称呼|称呼你)/i.test(text)) {
    return "我叫猫老师，也可以叫我小白老师。我是你的 AI 学业陪伴老师：可以聊天、讲题、帮你规划时间，也可以在你不想学的时候陪你先开始 5 分钟。";
  }

  if (/(你是谁|猫老师|ai|人工智能)/i.test(text)) {
    return "我是猫老师，你的 AI 学业陪伴老师。我会帮你做三件事：把大目标拆小、把任务放进时间里、把“开始不了”变成一个很小的第一步。";
  }

  if (/(你会什么|能做什么|有什么功能|怎么用)/i.test(text)) {
    return `我可以做这些事：
1. 陪你聊天，回答普通问题。
2. 帮你讲题、拆知识点、整理作文和背诵方法。
3. 把升学目标拆成阶段目标和今日任务。
4. 按你的时间生成学习安排。
5. 你拖延或焦虑时，把任务降成能开始的第一步。

你直接问就行，不用按照固定格式。`;
  }

  if (/(笑话|讲个故事|无聊|陪我聊|聊天)/i.test(text)) {
    return "可以呀。我先陪你缓一缓：今天不用每一分钟都很厉害，能回来找我说一句话，也算重新启动。你想轻松聊两句，还是让我帮你把今天最烦的一件事拆小？";
  }

  if (/(天气|新闻|现在几点|今天几号)/i.test(text)) {
    return "这个版本的猫老师还没有联网读取实时信息，所以天气、新闻、准确时间这类问题我不能保证实时正确。但我可以帮你根据今天的学习状态安排计划，或者帮你把当前任务拆小。";
  }

  if (/(不想学|拖延|没动力|焦虑|烦|崩溃|累|学不下去|害怕|压力)/i.test(text)) {
    return `我先不逼你冲刺。现在的问题不是能力差，而是启动成本太高。

从哪开始：
先把任务降到不会害怕的程度，只做 5 分钟。

怎么去做：
1. 把书或题本打开，停在第一题。
2. 只写“题目问什么”和“已知条件”。
3. 5 分钟后再决定要不要继续，不需要提前承诺学很久。

现在就做：
对自己说一句“我只开始，不要求完成”。开始以后，情绪通常会比站在门口想象时轻一点。`;
  }

  if (/(数学|函数|几何|方程|代数|压轴|计算|证明|题不会|不会做题)/i.test(text)) {
    return `数学题先不要急着找答案，先把题拆开。

从哪开始：
先判断它属于哪一类：概念题、计算题、图形题、应用题，还是综合题。

怎么去做：
1. 圈关键词：已知条件、要求证明或求出的量。
2. 写出可能用到的公式、定理或图形关系。
3. 如果 3 分钟没有思路，先看例题结构，不直接看答案。
4. 做完后写一句：我卡在“读题 / 公式 / 计算 / 思路”的哪一环。

给你一个最小行动：
现在只做第一步，把这道题的已知条件抄成 3 行以内。`;
  }

  if (/(英语|单词|阅读|听力|语法|作文|完形)/i.test(text)) {
    return `英语要把“输入”和“输出”分开练。

从哪开始：
如果你现在很乱，先选一个最小模块：10 个单词、1 篇阅读、或 1 段作文开头。

怎么去做：
1. 单词：先遮中文说英文，再遮英文说中文。
2. 阅读：先看题干，再回文章找定位句。
3. 作文：先写 3 个可复用句型，不追求长。

现在就做：
用 8 分钟完成一个小循环：背 5 个词，再用其中 2 个造句。`;
  }

  if (/(语文|作文|阅读理解|文言文|古诗|现代文|名著)/i.test(text)) {
    return `语文不要只靠“感觉”，要有答题结构。

从哪开始：
先判断题型：内容理解、作用分析、人物形象、语言赏析，还是主旨概括。

怎么去做：
1. 回到原文画出答题区域。
2. 用“内容 + 手法 + 作用 + 情感”组织答案。
3. 作文先列 3 个素材，不直接硬写全文。

现在就做：
把题目中的动词圈出来，比如“赏析、概括、分析”，它会告诉你答案该怎么写。`;
  }

  if (/(物理|力学|电学|光学|压强|浮力|电路)/i.test(text)) {
    return `物理题先画图，再代公式。

从哪开始：
把题目里的物体、力、电路或运动过程画出来，哪怕很简陋也可以。

怎么去做：
1. 标出已知量和单位。
2. 写出对应公式，不急着算。
3. 检查单位能不能对上。
4. 最后再代入数字。

现在就做：
先画一张关系图，图画出来以后，题通常会清楚一半。`;
  }

  if (/(化学|方程式|实验|元素|酸碱盐|反应|配平)/i.test(text)) {
    return `化学要抓住“物质变化”和“证据”。

从哪开始：
先列出反应前有什么、反应后可能生成什么。

怎么去做：
1. 写物质名称，再写化学式。
2. 标出沉淀、气体、变色、放热等实验现象。
3. 方程式先写对物质，再配平。

现在就做：
把你这道题出现的物质分成“反应物”和“生成物”两列。`;
  }

  if (/(计划|时间|安排|日程|作息|什么时候|多久|复习)/i.test(text)) {
    return `我建议你用“高能量做难题，低能量做记忆”的节奏。

从哪开始：
先写出今天真实可用时间，不要写理想时间。

怎么去做：
1. 上午或最清醒时放数学、物理这类高难任务。
2. 下午放错题订正和专题练习。
3. 晚上放英语单词、语文背诵、复盘。
4. 每 45 分钟学习后休息 8 分钟。

今天的最小行动：
先排一个 25 分钟学习块，只放一件事。`;
  }

  if (/(目标|升学|中考|高考|提高成绩|提分|考上|分数)/i.test(text)) {
    return `你的目标可以拆成三层：长期结果、阶段指标、今天行动。

当前目标：
${goal}

从哪开始：
先不要问“我要怎么一下子变强”，先问“今天哪一步能证明我在靠近它”。

怎么去做：
1. 选一科最影响分数的科目。
2. 找一个最常丢分的题型。
3. 今天只完成 1 道例题 + 1 道同类题 + 1 句复盘。

如果你告诉我具体科目和考试日期，我可以继续帮你拆到一周计划。`;
  }

  if (/(背|记不住|遗忘|默写|历史|政治|生物|地理)/i.test(text)) {
    return `记忆任务不要重复看，要主动回忆。

从哪开始：
先把内容分成 3 到 5 个小块，每块只背一个关键词。

怎么去做：
1. 看 2 分钟。
2. 合上书说出来。
3. 说不出来再看，不要一直盯着读。
4. 睡前只复盘错的那几条。

现在就做：
选一小段内容，给它起一个 5 个字以内的小标题。`;
  }

  if (/(是什么|为什么|怎么|如何|可以吗|能不能|怎么办|区别|原因|建议)/i.test(text)) {
    return `可以，我先直接回答。

这个问题可以先分三步看：
1. 先确定你真正想知道的是“概念、原因、方法、还是选择”。
2. 再把问题缩小到一个具体场景，这样答案会更准。
3. 最后给出一个能马上执行的小动作。

如果你愿意，我可以继续把“${message}”拆成更具体的解释、步骤或例子。`;
  }

  return pick([
    "收到。我先把你的话记下来。你想让我继续陪你聊，还是把它变成一个可以执行的小计划？",
    "我明白你的意思。你可以继续说，我会顺着你的话接；如果这是学习上的事，我也可以直接帮你拆步骤。",
    "嗯，我在。你这句话更像是在告诉我一个状态。要不要我帮你把现在最需要做的一件事找出来？",
    "我听到了。你可以再补一句背景，比如发生了什么、你想解决什么，我会给你更准确的回答。",
  ]);
}

function buildTodayAction(account) {
  const goal = account.goal || "";
  if (/数学|函数|几何|方程/.test(goal)) return "打开数学错题本，只圈出第一道题的扣分原因。";
  if (/英语|单词|阅读/.test(goal)) return "背 5 个单词，再用其中 2 个各造一句话。";
  if (/语文|作文|文言文/.test(goal)) return "找一道阅读题，只写出题目问的关键词。";
  if (/高考|中考|升学|成绩/.test(goal)) return "选最影响分数的一科，完成 1 道例题和 1 句复盘。";
  return "打开今天最重要的学习材料，只做第一步 5 分钟。";
}

function completeDailyAction() {
  const account = activeAccount();
  if (!account) return;
  account.treeStage = Math.min(4, Number(account.treeStage || 0) + 1);
  account.treeHealth = 3;
  account.lastDoneAt = todayKey();
  account.lastDecayAt = todayKey();
  saveAccounts();
  renderTree();
  renderHome();
  catDo("celebrate");
  catSay("今天的小行动完成了，目标树长大一点。");
  pushAiMessage("收到，今天的小行动已经完成。目标树长大了一点，这种稳定的小胜利最值得保存。");
}

function missDailyAction() {
  const account = activeAccount();
  if (!account) return;
  account.treeHealth = Math.max(0, Number(account.treeHealth ?? 3) - 1);
  saveAccounts();
  renderTree();
  catDo("focus");
  catSay("没完成也不是结束，我们把明天的行动再降小一点。");
}

function pushAiMessage(text) {
  const account = activeAccount();
  if (!account) return;
  seedChatIfNeeded(account);
  account.chat.push({ role: "ai", text });
  saveAccounts();
  renderChat();
}

function renderTree() {
  const account = activeAccount();
  if (!account) return;
  const stage = Number(account.treeStage || 0);
  const health = Number(account.treeHealth ?? 3);
  const withered = health <= 0;
  const labels = ["种子阶段", "小树苗", "成长中的小树", "稳定的大树", "结果的大树"];
  const healthLine = withered
    ? "它有点枯萎了。今天完成一个 5 分钟行动，就能慢慢恢复。"
    : health === 1
      ? "它有点没精神，今天完成一个小行动会恢复。"
      : "今天完成一个小行动，它就会继续长大。";

  els.treeStageText.textContent = labels[stage] || labels[0];
  els.treeHealthText.textContent = healthLine;
  els.treeArtwork.innerHTML = buildTreeSvg(stage, withered);
}

function buildTreeSvg(stage, withered) {
  const leaf = withered ? "#9ea7a0" : stage >= 3 ? "#55b96f" : "#71cf8d";
  const leafDark = withered ? "#7e847c" : "#2c9b62";
  const trunk = withered ? "#9b7a62" : "#9a6a3a";
  const fruit = stage >= 4 && !withered
    ? `<circle cx="104" cy="86" r="8" fill="#f57f88"/><circle cx="146" cy="74" r="7" fill="#f7b84b"/><circle cx="164" cy="116" r="7" fill="#f57f88"/>`
    : "";

  if (stage <= 0) {
    return `
      <svg viewBox="0 0 220 220" role="img" aria-label="目标树种子">
        <ellipse cx="110" cy="176" rx="70" ry="18" fill="rgba(78, 139, 91, .22)"/>
        <path d="M98 160c18-18 36-18 52 0-12 19-36 19-52 0Z" fill="${withered ? "#a99b85" : "#d99a54"}"/>
        <path d="M112 149c3-24 23-36 43-33-8 22-23 35-43 33Z" fill="${leaf}"/>
        <path d="M109 150c-3-19-16-29-34-29 5 18 17 29 34 29Z" fill="${leafDark}"/>
      </svg>`;
  }

  if (stage === 1) {
    return `
      <svg viewBox="0 0 220 220" role="img" aria-label="目标树小树苗">
        <ellipse cx="110" cy="184" rx="76" ry="18" fill="rgba(78, 139, 91, .22)"/>
        <path d="M110 178c5-35 3-60-1-88" stroke="${trunk}" stroke-width="11" stroke-linecap="round"/>
        <path d="M110 120c-26-19-40-39-43-61 28 0 48 18 43 61Z" fill="${leafDark}"/>
        <path d="M111 116c16-29 38-44 66-44-8 30-29 47-66 44Z" fill="${leaf}"/>
      </svg>`;
  }

  if (stage === 2) {
    return `
      <svg viewBox="0 0 220 220" role="img" aria-label="成长中的目标树">
        <ellipse cx="110" cy="188" rx="82" ry="18" fill="rgba(78, 139, 91, .22)"/>
        <path d="M110 184c7-44 7-81-1-114" stroke="${trunk}" stroke-width="16" stroke-linecap="round"/>
        <path d="M106 128c-34-16-51-42-51-76 34 5 56 30 51 76Z" fill="${leafDark}"/>
        <path d="M113 119c18-38 47-59 86-58-10 39-39 62-86 58Z" fill="${leaf}"/>
        <circle cx="110" cy="78" r="42" fill="${leaf}"/>
        <circle cx="80" cy="100" r="32" fill="${leafDark}"/>
        <circle cx="140" cy="102" r="34" fill="${leafDark}"/>
      </svg>`;
  }

  return `
    <svg viewBox="0 0 240 240" role="img" aria-label="成熟的目标树">
      <ellipse cx="120" cy="206" rx="92" ry="20" fill="rgba(78, 139, 91, .22)"/>
      <path d="M120 204c13-58 12-103-2-145" stroke="${trunk}" stroke-width="22" stroke-linecap="round"/>
      <path d="M119 139c-38-22-61-55-67-98 45 2 76 36 67 98Z" fill="${leafDark}"/>
      <path d="M125 130c24-45 61-70 108-68-12 48-50 76-108 68Z" fill="${leaf}"/>
      <circle cx="120" cy="78" r="52" fill="${leaf}"/>
      <circle cx="80" cy="106" r="42" fill="${leafDark}"/>
      <circle cx="158" cy="110" r="46" fill="${leafDark}"/>
      <circle cx="120" cy="119" r="48" fill="${leaf}"/>
      ${fruit}
    </svg>`;
}

function applyInactivity(account) {
  if (!account) return;
  const lastDone = account.lastDoneAt;
  if (!lastDone) return;
  const passed = daysBetween(lastDone, todayKey());
  const alreadyChecked = account.lastDecayAt === todayKey();
  if (passed >= 3 && !alreadyChecked) {
    account.treeHealth = Math.max(0, Number(account.treeHealth ?? 3) - Math.floor(passed / 3));
    account.lastDecayAt = todayKey();
    saveAccounts();
  }
}

function daysBetween(from, to) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  return Math.floor((end - start) / 86400000);
}

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function catSay(text) {
  els.catBubble.textContent = text.length > 54 ? `${text.slice(0, 54)}...` : text;
}

function catDo(action) {
  state.catAction = action;
  state.actionUntil = performance.now() + 1600;
}

function animateCats() {
  state.frame += 1;
  if (performance.now() > state.actionUntil) state.catAction = "idle";
  drawCat(els.authCatCanvas, "wave", state.frame);
  drawCat(els.catCanvas, state.catAction, state.frame);
  requestAnimationFrame(animateCats);
}

function drawCat(canvas, action, frame) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.width;
  const height = rect.height || canvas.height;
  if (!width || !height) return;

  const dpr = window.devicePixelRatio || 1;
  const targetWidth = Math.round(width * dpr);
  const targetHeight = Math.round(height * dpr);
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const bob = Math.sin(frame / 28) * 3;
  const blink = frame % 160 > 148;
  const wave = action === "wave" ? Math.sin(frame / 8) * 16 - 22 : 0;
  const focus = action === "focus";
  const celebrate = action === "celebrate";
  const think = action === "think";
  const scale = Math.min(width / 280, height / 238) * 1.08;
  const outline = "#7fb2e5";
  const outlineDark = "#4d8fd5";
  const fur = "#ffffff";
  const furShade = "#eef7ff";

  ctx.save();
  ctx.translate(width / 2, height / 2 + bob + 18);
  ctx.scale(scale, scale);

  const floorGradient = ctx.createRadialGradient(0, 82, 20, 0, 82, 128);
  floorGradient.addColorStop(0, "rgba(72, 137, 203, .28)");
  floorGradient.addColorStop(1, "rgba(99, 157, 216, 0)");
  ctx.fillStyle = floorGradient;
  ctx.beginPath();
  ctx.ellipse(0, 84, 125, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "rgba(40, 96, 150, .18)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 10;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 17;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(62, 42);
  ctx.bezierCurveTo(116, 28, 102, -34, 56, -24);
  ctx.stroke();
  ctx.shadowColor = "transparent";

  ctx.shadowColor = "rgba(40, 96, 150, .16)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = fur;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 43, 61, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowColor = "transparent";

  ctx.fillStyle = furShade;
  ctx.beginPath();
  ctx.ellipse(0, 58, 36, 43, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = fur;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -28, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  drawEar(ctx, -36, -69, -60, -126, -6, -82);
  drawEar(ctx, 36, -69, 60, -126, 6, -82);

  ctx.fillStyle = "#ffdce8";
  ctx.beginPath();
  ctx.moveTo(-35, -82);
  ctx.lineTo(-50, -112);
  ctx.lineTo(-17, -88);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(35, -82);
  ctx.lineTo(50, -112);
  ctx.lineTo(17, -88);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#24364d";
  if (blink) {
    ctx.fillRect(-27, -35, 18, 4);
    ctx.fillRect(9, -35, 18, 4);
  } else {
    ctx.beginPath();
    ctx.ellipse(-19, -34, 6, 9, 0, 0, Math.PI * 2);
    ctx.ellipse(19, -34, 6, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-21, -37, 2, 0, Math.PI * 2);
    ctx.arc(17, -37, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#f2a5bc";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(-7, -12);
  ctx.lineTo(7, -12);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#24364d";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.quadraticCurveTo(-7, -2, -17, -6);
  ctx.moveTo(0, -11);
  ctx.quadraticCurveTo(7, -2, 17, -6);
  ctx.stroke();

  drawWhiskers(ctx, -12, -13, -1);
  drawWhiskers(ctx, 12, -13, 1);

  ctx.strokeStyle = outline;
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-42, 16);
  ctx.quadraticCurveTo(-78, 22 + wave, -66, 64 + wave);
  ctx.moveTo(42, 16);
  ctx.quadraticCurveTo(74, 38, 54, 76);
  ctx.stroke();

  ctx.fillStyle = "#5ea0df";
  ctx.strokeStyle = outlineDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, 26);
  ctx.lineTo(0, 42);
  ctx.lineTo(18, 26);
  ctx.lineTo(8, 65);
  ctx.lineTo(-8, 65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fff7d6";
  ctx.strokeStyle = "#e4b64b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  roundedRectPath(ctx, -68, 68, 54, 36, 7);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#d2a744";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-41, 70);
  ctx.lineTo(-41, 102);
  ctx.moveTo(-62, 82);
  ctx.lineTo(-48, 82);
  ctx.moveTo(-34, 82);
  ctx.lineTo(-20, 82);
  ctx.stroke();

  ctx.fillStyle = fur;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(-38, 102, 24, 14, -0.2, 0, Math.PI * 2);
  ctx.ellipse(38, 102, 24, 14, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (focus) drawGlasses(ctx);
  if (think) drawThought(ctx, frame);
  if (celebrate) drawStars(ctx, frame);

  ctx.restore();
}

function drawEar(ctx, x1, y1, x2, y2, x3, y3) {
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#7fb2e5";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawWhiskers(ctx, x, y, dir) {
  ctx.strokeStyle = "#8ea0b6";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dir * 42, y - 10);
  ctx.moveTo(x, y + 7);
  ctx.lineTo(x + dir * 44, y + 6);
  ctx.moveTo(x, y + 14);
  ctx.lineTo(x + dir * 38, y + 22);
  ctx.stroke();
}

function drawGlasses(ctx) {
  ctx.strokeStyle = "#4d8fd5";
  ctx.lineWidth = 3;
  ctx.beginPath();
  roundedRectPath(ctx, -33, -42, 25, 20, 7);
  roundedRectPath(ctx, 8, -42, 25, 20, 7);
  ctx.moveTo(-8, -32);
  ctx.lineTo(8, -32);
  ctx.stroke();
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function drawThought(ctx, frame) {
  ctx.fillStyle = "rgba(255, 255, 255, .92)";
  [0, 1, 2].forEach((i) => {
    ctx.beginPath();
    ctx.arc(62 + i * 18, -82 - Math.sin(frame / 18 + i) * 3, 6 + i * 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawStars(ctx, frame) {
  const points = [
    [-76, -88],
    [74, -104],
    [84, -42],
  ];
  points.forEach(([x, y], index) => {
    const size = 8 + Math.sin(frame / 8 + index) * 2;
    ctx.fillStyle = index === 1 ? "#f5b956" : "#75aee8";
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.34, y - size * 0.34);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size * 0.34, y + size * 0.34);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.34, y + size * 0.34);
    ctx.lineTo(x - size, y);
    ctx.lineTo(x - size * 0.34, y - size * 0.34);
    ctx.closePath();
    ctx.fill();
  });
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
