// App State
const appState = {
  currentScreen: 'authChoice',
  user: null,
  chatMessages: [],
  userGoal: null,
  studyData: null,
  treeStage: 0,
  completedDays: 0,
};

// Local Storage Keys
const STORAGE_KEYS = {
  USER: 'timeManagementApp_user',
  MESSAGES: 'timeManagementApp_messages',
  GOAL: 'timeManagementApp_goal',
  TREE: 'timeManagementApp_tree',
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  initializeEventListeners();
  drawAuthCat();
  showScreen('authChoice');
});

// Screen Management
function showScreen(screenName) {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.remove('active');
  });
  const screen = document.getElementById(`${screenName}Screen`);
  if (screen) {
    screen.classList.add('active');
    appState.currentScreen = screenName;
  }
}

// Auth Screens
function initializeEventListeners() {
  // Auth buttons
  document.getElementById('showRegisterBtn').addEventListener('click', () => showScreen('register'));
  document.getElementById('showLoginBtn').addEventListener('click', () => showScreen('login'));
  
  // Back buttons
  document.querySelectorAll('[data-back-auth]').forEach(btn => {
    btn.addEventListener('click', () => showScreen('authChoice'));
  });

  // Register
  document.getElementById('createAccountBtn').addEventListener('click', handleRegister);
  
  // Login
  document.getElementById('loginBtn').addEventListener('click', handleLogin);

  // Home screen
  document.getElementById('homeAvatarBtn').addEventListener('click', () => showScreen('profile'));
  document.getElementById('homeTreeBtn').addEventListener('click', () => showScreen('tree'));
  document.getElementById('completeTodayBtn').addEventListener('click', completeToday);
  
  // Study features
  document.getElementById('openDiagnosisBtn').addEventListener('click', () => openStudyMode('diagnosis'));
  document.getElementById('openPlanBtn').addEventListener('click', () => openStudyMode('plan'));
  document.getElementById('openSolutionBtn').addEventListener('click', () => openStudyMode('solution'));
  document.getElementById('openTreeCardBtn').addEventListener('click', () => showScreen('tree'));

  // Back to home from study/profile/tree
  document.querySelectorAll('[data-go-home]').forEach(btn => {
    btn.addEventListener('click', () => showScreen('home'));
  });

  // Chat
  document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    sendChatMessage();
  });
  document.getElementById('sendChatBtn').addEventListener('click', sendChatMessage);
  document.getElementById('clearChatBtn').addEventListener('click', clearChat);

  // Quick prompts
  document.querySelectorAll('.quick-prompts button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('chatInput').value = btn.getAttribute('data-prompt');
      sendChatMessage();
    });
  });

  // Study screen
  document.getElementById('generateStudyBtn').addEventListener('click', generateStudyAnalysis);
  document.getElementById('saveStudyGoalBtn').addEventListener('click', saveStudyGoal);

  // Profile
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);

  // Tree
  document.getElementById('treeCompleteBtn').addEventListener('click', completeTreeAction);
  document.getElementById('treeMissBtn').addEventListener('click', missTreeAction);
}

function handleRegister() {
  const age = document.getElementById('registerAge').value;
  const grade = document.getElementById('registerGrade').value;
  const id = document.getElementById('registerId').value;
  const password = document.getElementById('registerPassword').value;

  if (!age || !grade || !id || !password) {
    alert('请填写所有信息');
    return;
  }

  appState.user = {
    id,
    password,
    age: parseInt(age),
    grade,
    avatar: '',
    goal: '',
  };

  saveToStorage();
  initializeHome();
  showScreen('home');
}

function handleLogin() {
  const id = document.getElementById('loginId').value;
  const password = document.getElementById('loginPassword').value;

  const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');

  if (!stored.id || stored.id !== id || stored.password !== password) {
    alert('账号或密码错误');
    return;
  }

  appState.user = stored;
  loadFromStorage();
  initializeHome();
  showScreen('home');
}

function initializeHome() {
  if (appState.user) {
    const greeting = document.getElementById('homeGreeting');
    const initial = appState.user.id.charAt(0);
    document.getElementById('homeAvatarInitial').textContent = initial;
    document.getElementById('profileAvatarInitial').textContent = initial;
    greeting.textContent = `你好，${appState.user.id}`;
    drawCat();
  }
}

// Canvas Drawing - Auth Cat
function drawAuthCat() {
  const canvas = document.getElementById('authCatCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw simple cat face
  ctx.fillStyle = '#FF9A9E';
  ctx.beginPath();
  ctx.arc(130, 100, 60, 0, Math.PI * 2);
  ctx.fill();
  
  // Ears
  ctx.fillStyle = '#FF7E7E';
  ctx.beginPath();
  ctx.arc(100, 50, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(160, 50, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(115, 85, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(145, 85, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Smile
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(130, 110, 15, 0, Math.PI);
  ctx.stroke();
}

// Canvas Drawing - Main Cat
function drawCat() {
  const canvas = document.getElementById('catCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw animated cat based on tree stage
  const colors = ['#FFB6C1', '#FF9A9E', '#FF7E7E', '#FF6B6B'];
  const bodyColor = colors[Math.min(appState.treeStage, 3)];
  
  // Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(180, 150, 50, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(180, 80, 40, 0, Math.PI * 2);
  ctx.fill();
  
  // Ears
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(155, 40, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(205, 40, 15, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(170, 75, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(190, 75, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Happy expression
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(180, 90, 10, 0, Math.PI);
  ctx.stroke();
}

// Chat Functions
function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message
  addChatMessage(message, 'user');
  input.value = '';
  
  // Simulate AI response
  setTimeout(() => {
    const responses = [
      '好的！我理解了。让我帮你分析一下。',
      '这是个好问题！建议你先从基础开始。',
      '我建议把这个目标拆成更小的步骤。',
      '加油！相信你一定可以做到的！',
      '今天已经很努力了，继续保持！',
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    addChatMessage(response, 'ai');
  }, 800);
}

function addChatMessage(text, sender) {
  appState.chatMessages.push({ text, sender });
  const chatLog = document.getElementById('chatLog');
  
  const message = document.createElement('div');
  message.className = `message ${sender}`;
  message.textContent = text;
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
  
  saveToStorage();
}

function clearChat() {
  appState.chatMessages = [];
  document.getElementById('chatLog').innerHTML = '';
  saveToStorage();
}

// Study Functions
function openStudyMode(mode) {
  const modes = {
    diagnosis: '学业诊断',
    plan: '时间规划',
    solution: '解决方案',
  };
  document.getElementById('studyPageTitle').textContent = modes[mode] || '学业中心';
  document.getElementById('studyModeTitle').textContent = modes[mode];
  showScreen('study');
}

function generateStudyAnalysis() {
  const goal = document.getElementById('studyGoalInput').value;
  const grade = document.getElementById('studyGradeSelect').value;
  const subject = document.getElementById('studySubjectSelect').value;
  const state = document.getElementById('studyStateSelect').value;
  const hours = document.getElementById('studyHoursInput').value;
  const days = document.getElementById('studyExamDaysInput').value;

  if (!goal) {
    alert('请输入你的学习目标');
    return;
  }

  appState.userGoal = { goal, grade, subject, state, hours, days };
  saveToStorage();

  // Show diagnosis
  const diagnosisPanel = document.getElementById('diagnosisPanel');
  const diagnosisResult = document.getElementById('diagnosisResult');
  diagnosisResult.innerHTML = `
    <div class="result-item">
      <strong>主要卡点分析</strong>
      <p>你在 ${subject} 的 ${state}，这是常见的学习困境。建议从最小步骤开始。</p>
    </div>
    <div class="result-item">
      <strong>优化建议</strong>
      <p>利用你每天 ${hours} 小时的学习时间，制定详细的日计划。在 ${days} 天内逐步提升。</p>
    </div>
  `;
  diagnosisPanel.classList.remove('is-hidden');

  // Show solution
  const solutionPanel = document.getElementById('solutionPanel');
  const solutionResult = document.getElementById('solutionResult');
  solutionResult.innerHTML = `
    <div class="result-item">
      <strong>第一步：诊断你的知识漏洞</strong>
      <p>用 30 分钟做一份高考题，找出最容易出错的 3 个知识点。</p>
    </div>
    <div class="result-item">
      <strong>第二步：制定针对性计划</strong>
      <p>每天花 1 小时集中学习一个知识点，配合练习题。</p>
    </div>
    <div class="result-item">
      <strong>第三步：定期复盘</strong>
      <p>每周总结学习效果，调整计划。</p>
    </div>
  `;
  solutionPanel.classList.remove('is-hidden');

  // Show plan
  const planPanel = document.getElementById('planPanel');
  const planEmptyState = document.getElementById('planEmptyState');
  const planResult = document.getElementById('planResult');
  planEmptyState.classList.add('is-hidden');
  
  const timeSlots = [
    { time: '08:00-09:00', task: '晨读 + 背诵单词' },
    { time: '14:00-15:30', task: '做数学练习题' },
    { time: '19:00-20:00', task: '整理笔记' },
    { time: '20:00-21:00', task: '复习今天内容' },
  ];
  
  planResult.innerHTML = timeSlots.map(slot => `
    <div class="timeline-item">
      <div class="timeline-time">${slot.time}</div>
      <div>
        <strong>${slot.task}</strong>
        <p>按照计划执行，完成后打个勾。</p>
      </div>
    </div>
  `).join('');
  
  planPanel.classList.remove('is-hidden');
}

function saveStudyGoal() {
  const goal = document.getElementById('studyGoalInput').value;
  if (goal) {
    appState.user.goal = goal;
    saveToStorage();
    alert('目标已保存！');
  }
}

// Profile Functions
function saveProfile() {
  const newId = document.getElementById('profileIdInput').value;
  const goalText = document.getElementById('profileGoalInput').value;
  
  if (newId) {
    appState.user.id = newId;
    document.getElementById('homeGreeting').textContent = `你好，${newId}`;
    document.getElementById('homeAvatarInitial').textContent = newId.charAt(0);
  }
  
  if (goalText) {
    appState.user.goal = goalText;
  }
  
  saveToStorage();
  alert('主页已保存！');
}

// Tree Functions
function completeToday() {
  appState.completedDays++;
  appState.treeStage = Math.min(Math.floor(appState.completedDays / 5), 3);
  drawCat();
  updateTreeInfo();
  saveToStorage();
  alert('太棒了！继续加油！🎉');
}

function completeTreeAction() {
  completeToday();
  showScreen('tree');
}

function missTreeAction() {
  appState.completedDays = Math.max(0, appState.completedDays - 1);
  appState.treeStage = Math.max(0, Math.floor(appState.completedDays / 5));
  drawCat();
  updateTreeInfo();
  saveToStorage();
  alert('没关系，明天继续努力！');
}

function updateTreeInfo() {
  const stages = ['小树苗', '幼苗', '小树', '大树', '参天大树'];
  const stage = Math.min(appState.treeStage, 4);
  document.getElementById('treeStageText').textContent = stages[stage];
  document.getElementById('treeHealthText').textContent = `已完成 ${appState.completedDays} 天。再坚持 ${Math.max(0, 5 - (appState.completedDays % 5))} 天，小树就会长大！`;
}

// Storage Functions
function saveToStorage() {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(appState.user));
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(appState.chatMessages));
  localStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(appState.userGoal));
  localStorage.setItem(STORAGE_KEYS.TREE, JSON.stringify({
    treeStage: appState.treeStage,
    completedDays: appState.completedDays,
  }));
}

function loadFromStorage() {
  const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
  if (user) {
    appState.user = user;
  }

  const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
  appState.chatMessages = messages;

  const goal = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOAL) || 'null');
  if (goal) {
    appState.userGoal = goal;
  }

  const tree = JSON.parse(localStorage.getItem(STORAGE_KEYS.TREE) || '{}');
  appState.treeStage = tree.treeStage || 0;
  appState.completedDays = tree.completedDays || 0;
}
