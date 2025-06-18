let questions = [];
let answers = {};
let currentIndex = 0;
let shuffledIndexes = [];
let correctClicked = false;
let correctShown = false;
let isChallengeMode = false;
let answeredCurrentQuestion = false;
let currentFontSize = 100;
let stats = {
  correct: 0,
  wrong: 0,
  empty: 0,
  combo: 0,
  maxCombo: 0
};

const QUESTIONS_URL = 'questions/questions.txt';
const ANSWERS_URL = 'questions/answers.txt';

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById('questionText') || !document.getElementById('options')) {
    showError("Sistem hatası: Sayfa düzgün yüklenemedi");
    return;
  }
  
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
  
  const navOptions = document.getElementById('navOptions');
  navOptions.style.maxHeight = navOptions.scrollHeight + 'px';
  
  setTimeout(() => {
    document.getElementById('shuffleInputs').style.display = 'none';
  }, 100);
  
  loadData().catch(error => {
    showError("Sorular yüklenirken hata oluştu: " + error.message);
  });
});

function showError(message) {
  const questionBox = document.getElementById('questionBox');
  if (questionBox) {
    questionBox.innerHTML = `<div class="error-message">${message}</div>`;
  }
}

async function loadData() {
  try {
    document.getElementById('questionText').innerText = "Sorular yükleniyor...";
    
    const [questionsResponse, answersResponse] = await Promise.all([
      fetch(QUESTIONS_URL),
      fetch(ANSWERS_URL)
    ]);
    
    if (!questionsResponse.ok) throw new Error("Sorular dosyası bulunamadı (404)");
    if (!answersResponse.ok) throw new Error("Cevaplar dosyası bulunamadı (404)");
    
    const questionsText = await questionsResponse.text();
    const answersText = await answersResponse.text();
    
    questions = parseFullBlocks(questionsText);
    answers = parseAnswers(answersText);
    
    if (questions.length === 0) throw new Error("Dosyada hiç soru bulunamadı");
    
    showQuestion();
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
  if (questions.length > 0) {
    showQuestion();
  }
}

function toggleChallengeMode() {
  isChallengeMode = document.getElementById('challengeMode').checked;
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
  
  const opts = document.getElementById('options');
  opts.innerHTML = '';

  ['A', 'B', 'C', 'D'].forEach((letter, i) => {
    const btn = document.createElement('button');
    btn.innerText = `${letter}) ${q.options[i]}`;
    btn.onclick = () => handleAnswer(q.id, letter, btn);
    btn.dataset.letter = letter;
    opts.appendChild(btn);
  });

  if (document.getElementById('showCorrectAlways').checked && !isChallengeMode) {
    highlightCorrect(q.id);
    correctShown = true;
  }

  updateProgress();
  updateStats();
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
  
  if (!start) start = "500";
  if (!end) end = "1200";
  
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
}

function toggleShuffleInputs() {
  const checked = document.getElementById('shuffleMode').checked;
  document.getElementById('shuffleInputs').style.display = checked ? 'block' : 'none';
  document.getElementById('gotoContainer').style.display = checked ? 'none' : 'inline-block';
  
  if (!checked) {
    shuffledIndexes = [];
    currentIndex = 0;
    showQuestion();
  }
  adjustNavOptionsHeight();
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

function adjustFontSize(change) {
  currentFontSize += change * 5;
  currentFontSize = Math.max(50, Math.min(150, currentFontSize));
  
  document.getElementById('questionText').style.fontSize = `${currentFontSize}%`;
  document.querySelectorAll('.options button').forEach(btn => {
    btn.style.fontSize = `${currentFontSize}%`;
  });
}

function resetFontSize() {
  currentFontSize = 100;
  document.getElementById('questionText').style.fontSize = '';
  document.querySelectorAll('.options button').forEach(btn => {
    btn.style.fontSize = '';
  });
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
}