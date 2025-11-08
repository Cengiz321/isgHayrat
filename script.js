let questions = [];
let answers = {};
let currentIndex = 0;
let shuffledIndexes = [];
let correctClicked = false;
let correctShown = false;
let isChallengeMode = false;
let answeredCurrentQuestion = false;
let currentFontSize = 100;
let selectedTerm = null;
let stats = {
  correct: 0,
  wrong: 0,
  empty: 0,
  combo: 0,
  maxCombo: 0
};
let __ = false;

const _ = 817496384; 

function toggleDarkMode() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const icon = document.getElementById('themeIcon');
  
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const icon = document.getElementById('themeIcon');
  
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    document.documentElement.removeAttribute('data-theme');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
}

async function verifyInput(input) {
    const hash = await hashString(input);
    console.log(hash);
    return hash === _;
}

console.log(simpleHash(_));
__1=false;
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; 
    }
    return hash;
}

window._$ = async function() {
    const v = prompt("Enter verification:");
    if (v && simpleHash(v) === _) {
        __1=true;
        $();
    }
};

function $() {
  if(__1){
    __ = true;
    console.log("[Dev tools active]");
    if (questions.length) showQuestion();
  }
}

const TERM1_URL = 'questions/questions1.txt';
const TERM1_ANSWERS_URL = 'questions/answers1.txt';
const TERM2_URL = 'questions/questions2.txt';
const TERM2_ANSWERS_URL = 'questions/answers2.txt';

document.addEventListener("DOMContentLoaded", () => {
  loadTheme(); // Add this line
  if (!document.getElementById('questionText') || !document.getElementById('options')) {
    showError("Sistem hatası: Sayfa düzgün yüklenemedi");
    return;
  }
  
  // Modal event listeners
  document.getElementById('selectTerm1').addEventListener('click', () => selectTerm(1));
  document.getElementById('selectTerm2').addEventListener('click', () => selectTerm(2));
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);

  // Input event listeners
  document.getElementById('shuffleStart').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('shuffleEnd').focus();
    }
  });
  
  document.getElementById('shuffleEnd').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      shuffleQuestions();
    }
  });
  
  document.getElementById('gotoQuestion').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      goToQuestion();
    }
  });
  
  // Initialize UI elements
  const navOptions = document.getElementById('navOptions');
  navOptions.style.maxHeight = navOptions.scrollHeight + 'px';
  
  // Load all settings
  loadAllSettings();

  // Cheat activation listeners
  let ___ = 0, ____ = null;
  const _toggle = toggleNavOptions;
  toggleNavOptions = function() {
      _toggle.apply(this, arguments);
      clearTimeout(____);
      if (++___ >= 7) { ___ = 0; _$(); }
      ____ = setTimeout(()=>___ = 0, 500);
  };

  addEventListener('keydown', e => {
      if (e.shiftKey && e.ctrlKey && e.key === 'V') _$();
  });
});


function updateTermBasedUI() {
  const quickGotoContainer = document.querySelector('.quick-goto-buttons');
  const quickRangeContainer = document.querySelector('.quick-range-buttons');
  
  if (selectedTerm == 1) {
    // Update quick-goto buttons for term 1
    quickGotoContainer.innerHTML = `
      <button onclick="quickGoTo(1)">1</button>
      <button onclick="quickGoTo(250)">250</button>
      <button onclick="quickGoTo(500)">500</button>
    `;
    
    // Update quick-range buttons for term 1
    quickRangeContainer.innerHTML = `
      <button onclick="setRange(1, 500)">1-500</button>
      <button onclick="setRange(500, 800)">500-800</button>
      <button onclick="setRange(1, 800)">1-800</button>
    `;
  } else if (selectedTerm == 2) {
    // Keep the existing values for term 2
    quickGotoContainer.innerHTML = `
      <button onclick="quickGoTo(501)">501</button>
      <button onclick="quickGoTo(750)">750</button>
      <button onclick="quickGoTo(1000)">1000</button>
    `;
    
    quickRangeContainer.innerHTML = `
      <button onclick="setRange(500, 1000)">500-1000</button>
      <button onclick="setRange(1000, 1200)">1000-1200</button>
      <button onclick="setRange(500, 1200)">500-1200</button>
    `;
  }
}

function loadAllSettings() {
  // Load mode settings first
  const savedShuffleMode = localStorage.getItem('shuffleMode') === 'true';
  const savedChallengeMode = localStorage.getItem('challengeMode') === 'true';
  
  if (savedShuffleMode) {
    document.getElementById('shuffleMode').checked = true;
    document.getElementById('shuffleInputs').style.display = 'block';
    document.getElementById('gotoContainer').style.display = 'none';
  }
  
  if (savedChallengeMode) {
    document.getElementById('challengeMode').checked = true;
    isChallengeMode = true;
    document.getElementById('stats').style.display = 'flex';
    document.getElementById('showCorrectContainer').style.display = 'none';
  }
  
  // Load other preferences
  if (localStorage.getItem('showCorrectAlways') === 'true') {
    document.getElementById('showCorrectAlways').checked = true;
  }
  
  const savedFontSize = localStorage.getItem('fontSize');
  if (savedFontSize) {
    currentFontSize = parseInt(savedFontSize);
    applyFontSize();
  }
  
  // Load selected term and questions
  const savedTerm = localStorage.getItem('selectedTerm');
  if (savedTerm) {
    selectedTerm = savedTerm;
    updateTermBasedUI();
    loadData().catch(error => {
      showError("Sorular yüklenirken hata oluştu: " + error.message);
    });
  } else {
    showModal();
  }
}

function resetQuestionPositions() {
  currentIndex = 0;
  shuffledIndexes = [];
  localStorage.removeItem('currentQuestion');
  localStorage.removeItem('shuffleList');
  localStorage.removeItem('shuffleIndex');
}

function loadQuestionPosition() {
  if (document.getElementById('shuffleMode').checked) {
    const savedShuffleList = localStorage.getItem('shuffleList');
    const savedShuffleIndex = localStorage.getItem('shuffleIndex');
    
    if (savedShuffleList) {
      shuffledIndexes = JSON.parse(savedShuffleList);
    }
    if (savedShuffleIndex) {
      currentIndex = parseInt(savedShuffleIndex);
    }
  } else {
    const savedQuestion = localStorage.getItem('currentQuestion');
    if (savedQuestion) {
      currentIndex = parseInt(savedQuestion);
    }
  }
  
  if (questions.length > 0) {
    showQuestion();
  }
}

function saveAllSettings() {
  // Save current position based on mode
  if (document.getElementById('shuffleMode').checked) {
    localStorage.setItem('shuffleList', JSON.stringify(shuffledIndexes));
    localStorage.setItem('shuffleIndex', currentIndex.toString());
  } else {
    localStorage.setItem('currentQuestion', currentIndex.toString());
  }
  
  // Save other preferences
  localStorage.setItem('showCorrectAlways', document.getElementById('showCorrectAlways').checked.toString());
  localStorage.setItem('challengeMode', isChallengeMode.toString());
  localStorage.setItem('shuffleMode', document.getElementById('shuffleMode').checked.toString());
  localStorage.setItem('fontSize', currentFontSize.toString());
  
  // Save stats
  localStorage.setItem('stats', JSON.stringify(stats));
}

function showModal() {
  const modal = document.getElementById('selectionModal');
  modal.style.display = 'flex';
  
  const closeBtn = document.getElementById('closeModalBtn');
  closeBtn.style.display = localStorage.getItem('selectedTerm') ? 'block' : 'none';
  
  // Highlight the selected term if one exists
  if (selectedTerm) {
    document.getElementById(`selectTerm${selectedTerm}`).style.fontWeight = 'bold';
    document.getElementById(`selectTerm${selectedTerm}`).style.backgroundColor = '#e0e0e0';
  }
}

function closeModal() {
  // Reset term button styles
  document.getElementById('selectTerm1').style.fontWeight = '';
  document.getElementById('selectTerm1').style.backgroundColor = '';
  document.getElementById('selectTerm2').style.fontWeight = '';
  document.getElementById('selectTerm2').style.backgroundColor = '';
  
  document.getElementById('selectionModal').style.display = 'none';
}

function selectTerm(term) {
  resetQuestionPositions();
  selectedTerm = term;
  localStorage.setItem('selectedTerm', term);
  closeModal();
  updateTermBasedUI();
  loadData().catch(error => {
    showError("Sorular yüklenirken hata oluştu: " + error.message);
  });
}

function showTermSelection() {
  showModal();
}

function showError(message) {
  const questionBox = document.getElementById('questionBox');
  if (questionBox) {
    questionBox.innerHTML = `<div class="error-message">${message}</div>`;
  }
}

async function loadData() {
  try {
    document.getElementById('questionText').innerText = "Sorular yükleniyor...";
    
    let questionsUrl, answersUrl;
    
    if (selectedTerm == 1) {
      questionsUrl = TERM1_URL;
      answersUrl = TERM1_ANSWERS_URL;
    } else if (selectedTerm == 2) {
      questionsUrl = TERM2_URL;
      answersUrl = TERM2_ANSWERS_URL;
    } else {
      showModal();
      return;
    }
    
    const [questionsResponse, answersResponse] = await Promise.all([
      fetch(questionsUrl),
      fetch(answersUrl)
    ]);
    
    if (!questionsResponse.ok) throw new Error("Sorular dosyası bulunamadı (404)");
    if (!answersResponse.ok) throw new Error("Cevaplar dosyası bulunamadı (404)");
    
    const questionsText = await questionsResponse.text();
    const answersText = await answersResponse.text();
    
    questions = parseFullBlocks(questionsText);
    answers = parseAnswers(answersText);
    
    if (questions.length === 0) throw new Error("Dosyada hiç soru bulunamadı");
    
    // Load saved stats
    const savedStats = localStorage.getItem('stats');
    if (savedStats) {
      stats = JSON.parse(savedStats);
      updateStats();
    }
    
    // Now load the question position
    loadQuestionPosition();
  } catch(error) {
    showError(`Yükleme hatası: ${error.message}`);
    throw error;
  }
}

function parseAnswers(text) {
  const parts = text.match(/\d+(-\d+)?\s+[A-D](-[A-D])?/g) || [];
  const answers = {};
  
  parts.forEach(part => {
    const [rawNum, val] = part.split(/\s+/);
    if (val.includes('-')) {
      const subAnswers = val.split('-');
      subAnswers.forEach((ans, i) => {
        answers[`${rawNum.split('-')[0]}-${i + 1}`] = [ans];
      });
    } else {
      answers[rawNum] = [val];
    }
  });
  return answers;
}

function parseFullBlocks(text) {
  const lines = text.split(/\r?\n/);
  let blocks = [];
  let buffer = [];
  
  for (let line of lines) {
    buffer.push(line);
    if (/^d\./i.test(line.trim())) {
      blocks.push([...buffer]);
      buffer = [];
    }
  }
  
  return blocks.map(block => {
    const fullText = block.join('\n');
    const numMatch = fullText.match(/(\d+(-\d+)?)/);
    if (!numMatch) return null;
    
    const num = numMatch[1];
    const opts = block.filter(l => /^[a-d]\./i.test(l.trim())).map(l => l.replace(/^[a-d]\./i, '').trim());
    const text = block.filter(l => !/^[a-d]\./i.test(l.trim())).join('\n').replace(/^(\d+(-\d+)?\.)/, '').trim();
    
    return { id: num, num, text, options: opts };
  }).filter(q => q && q.options.length === 4);
}

function toggleCorrectImmediately() {
  const isChecked = document.getElementById('showCorrectAlways').checked;
  localStorage.setItem('showCorrectAlways', isChecked.toString());
  if (questions.length > 0) {
    showQuestion();
  }
}

function toggleChallengeMode() {
  isChallengeMode = document.getElementById('challengeMode').checked;
  localStorage.setItem('challengeMode', isChallengeMode.toString());
  document.getElementById('stats').style.display = isChallengeMode ? 'flex' : 'none';
  document.getElementById('showCorrectContainer').style.display = isChallengeMode ? 'none' : 'block';
  
  if (questions.length > 0) {
    showQuestion();
  }
}

function showQuestion() {
  answeredCurrentQuestion = false;
  correctClicked = false;
  correctShown = false;
  
  const q = shuffledIndexes.length > 0 
    ? questions[shuffledIndexes[currentIndex]] 
    : questions[currentIndex];
    
  document.getElementById('questionText').innerText = `${q.num}. ${q.text}`;
  document.getElementById('questionText').style.fontSize = `${currentFontSize}%`;
  
  const opts = document.getElementById('options');
  opts.innerHTML = '';

  ['A', 'B', 'C', 'D'].forEach((letter, i) => {
    const btn = document.createElement('button');
    btn.innerText = `${letter}) ${q.options[i]}`;
    btn.onclick = () => handleAnswer(q.id, letter, btn);
    btn.dataset.letter = letter;
    btn.style.fontSize = `${currentFontSize}%`;
    opts.appendChild(btn);
  });

  if ((document.getElementById('showCorrectAlways').checked && !isChallengeMode) || 
      (isChallengeMode && __)) {
    highlightCorrect(q.id);
    correctShown = true;
  }

  updateProgress();
  updateStats();
  saveAllSettings();
}

function handleAnswer(id, chosen, btn) {
  answeredCurrentQuestion = true;
  const correctArray = answers[id];
  const allButtons = document.querySelectorAll('#options button');
  
  if (!correctArray) return;

  if (isChallengeMode && btn.classList.contains('locked')) {
    if (correctArray.includes(chosen)) {
      nextQuestion();
    }
    return;
  }

  if (correctArray.includes(chosen)) {
    if (isChallengeMode) {
      stats.correct++;
      stats.combo++;
      if (stats.combo > stats.maxCombo) {
        stats.maxCombo = stats.combo;
      }
      
      allButtons.forEach(b => {
        b.classList.add('locked');
        if (correctArray.includes(b.dataset.letter)) {
          b.classList.add('correct');
        }
      });
    } else {
      if (correctShown || correctClicked) {
        nextQuestion();
        return;
      }
      correctClicked = true;
      allButtons.forEach(b => b.classList.remove('wrong'));
      btn.classList.add('correct');
    }
  } else {
    if (isChallengeMode) {
      stats.wrong++;
      stats.combo = 0;
      
      allButtons.forEach(b => {
        b.classList.add('locked');
        if (correctArray.includes(b.dataset.letter)) {
          b.classList.add('correct');
        }
      });
      btn.classList.add('wrong');
    } else {
      allButtons.forEach(b => b.classList.remove('wrong'));
      btn.classList.add('wrong');
    }
  }
  
  updateStats();
  saveAllSettings();
}

function highlightCorrect(id) {
  const correctArray = answers[id];
  const allButtons = document.querySelectorAll('#options button');
  
  allButtons.forEach(btn => {
    if (correctArray.includes(btn.dataset.letter)) {
      btn.classList.add('correct');
    }
  });
}

function nextQuestion() {
  if (currentIndex < (shuffledIndexes.length > 0 ? shuffledIndexes.length : questions.length) - 1) {
    if (!answeredCurrentQuestion && isChallengeMode) {
      stats.empty++;
      updateStats();
    }
    currentIndex++;
    showQuestion();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    stats.combo = 0;
    currentIndex--;
    showQuestion();
    updateStats();
  }
}

function goToQuestion() {
  const num = document.getElementById('gotoQuestion').value.trim();
  const idx = questions.findIndex(q => q.num === num);
  
  if (idx >= 0) {
    if (!answeredCurrentQuestion && isChallengeMode) {
      stats.empty++;
    }
    currentIndex = idx;
    showQuestion();
    updateStats();
  }
}

function quickGoTo(questionNum) {
  document.getElementById('gotoQuestion').value = questionNum;
  goToQuestion();
}

function setRange(start, end) {
  document.getElementById('shuffleStart').value = start;
  document.getElementById('shuffleEnd').value = end;
  shuffleQuestions();
}

function shuffleQuestions() {
  let start = document.getElementById('shuffleStart').value.trim();
  let end = document.getElementById('shuffleEnd').value.trim();
  
  if (!start) start = selectedTerm == 1 ? "1" : "500";
  if (!end) end = selectedTerm == 1 ? "800" : "1200";
  
  const startNum = parseFloat(start);
  const endNum = parseFloat(end);
  
  const filtered = questions.filter(q => {
    const qNum = parseFloat(q.num.split('-')[0]);
    return qNum >= startNum && qNum <= endNum;
  });
  
  shuffledIndexes = filtered.map(q => questions.indexOf(q));
  shuffledIndexes.sort(() => Math.random() - 0.5);
  currentIndex = 0;
  showQuestion();
  saveAllSettings();
}

function toggleShuffleInputs() {
  const checked = document.getElementById('shuffleMode').checked;
  document.getElementById('shuffleInputs').style.display = checked ? 'block' : 'none';
  document.getElementById('gotoContainer').style.display = checked ? 'none' : 'inline-block';
  
  if (checked) {
    // If enabling shuffle mode, reset position
    currentIndex = 0;
    if (shuffledIndexes.length === 0 && questions.length > 0) {
      // Create default shuffle range based on term
      document.getElementById('shuffleStart').value = selectedTerm == 1 ? "1" : "500";
      document.getElementById('shuffleEnd').value = selectedTerm == 1 ? "800" : "1200";
      shuffleQuestions();
    }
  } else {
    // If disabling shuffle mode, reset to normal mode position
    shuffledIndexes = [];
    currentIndex = parseInt(localStorage.getItem('currentQuestion')) || 0;
  }
  
  showQuestion();
  adjustNavOptionsHeight();
  saveAllSettings();
}

function adjustNavOptionsHeight() {
  const navOptions = document.getElementById('navOptions');
  if (navOptions.classList.contains('collapsed')) return;
  
  navOptions.style.maxHeight = navOptions.scrollHeight + 'px';
}

function updateProgress() {
  const total = shuffledIndexes.length || questions.length;
  const index = currentIndex + 1;
  const inShuffle = shuffledIndexes.length > 0;
  
  document.getElementById('progress').innerText = inShuffle 
    ? `Soru: ${index} / ${total}` 
    : '';
}

function updateStats() {
  document.getElementById('correctCount').textContent = stats.correct;
  document.getElementById('wrongCount').textContent = stats.wrong;
  document.getElementById('emptyCount').textContent = stats.empty;
  document.getElementById('comboCount').textContent = `${stats.combo}x`;
  document.getElementById('maxCombo').textContent = `${stats.maxCombo}x`;
}

function applyFontSize() {
  document.getElementById('questionText').style.fontSize = `${currentFontSize}%`;
  document.querySelectorAll('.options button').forEach(btn => {
    btn.style.fontSize = `${currentFontSize}%`;
  });
}

function adjustFontSize(change) {
  currentFontSize += change * 5;
  currentFontSize = Math.max(50, Math.min(150, currentFontSize));
  applyFontSize();
  saveAllSettings();
}

function resetFontSize() {
  currentFontSize = 100;
  applyFontSize();
  saveAllSettings();
}

function toggleNavOptions() {
  const navOptions = document.getElementById('navOptions');
  const icon = document.getElementById('navToggleIcon');
  
  navOptions.classList.toggle('collapsed');
  
  if (navOptions.classList.contains('collapsed')) {
    navOptions.style.maxHeight = '0';
    icon.classList.remove('fa-chevron-up');
    icon.classList.add('fa-chevron-down');
  } else {
    adjustNavOptionsHeight();
    icon.classList.remove('fa-chevron-down');
    icon.classList.add('fa-chevron-up');
  }
}

function resetStats() {
  stats = {
    correct: 0,
    wrong: 0,
    empty: 0,
    combo: 0,
    maxCombo: 0
  };
  updateStats();
  saveAllSettings();
}