let questions = [];
let answers = {};
let currentIndex = 0;
let shuffledIndexes = [];
let correctClicked = false;
let correctShown = false;

const QUESTIONS_URL = 'https://raw.githubusercontent.com/Cengiz321/isgHayrat/refs/heads/main/questions/questions.txt';
const ANSWERS_URL = 'https://raw.githubusercontent.com/Cengiz321/isgHayrat/refs/heads/main/questions/answers.txt';

document.addEventListener("DOMContentLoaded", () => {
  toggleShuffleInputs();
  loadData();
});

async function loadData() {
  try {
    document.getElementById('questionBox').innerHTML = '<div class="loading">Sorular yükleniyor...</div>';
    
    // Soru ve cevapları aynı anda yükle
    const [questionsResponse, answersResponse] = await Promise.all([
      fetch(QUESTIONS_URL),
      fetch(ANSWERS_URL)
    ]);
    
    if (!questionsResponse.ok || !answersResponse.ok) {
      throw new Error('Dosyalar yüklenirken hata oluştu');
    }
    
    const questionsText = await questionsResponse.text();
    const answersText = await answersResponse.text();
    
    questions = parseFullBlocks(questionsText);
    answers = parseAnswers(answersText);
    
    showQuestion();
  } catch (error) {
    document.getElementById('questionBox').innerHTML = `<div class="loading">Hata: ${error.message}</div>`;
    console.error('Yükleme hatası:', error);
  }
}

function parseAnswers(text) {
  const parts = text.match(/\d+(-\d+)?\s+[A-D](-[A-D])?/g);
  const answers = {};
  if (!parts) return answers;
  
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

function showQuestion() {
  correctClicked = false;
  correctShown = false;
  const q = (shuffledIndexes.length > 0 ? questions[shuffledIndexes[currentIndex]] : questions[currentIndex]);
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

  if (document.getElementById('showCorrectAlways').checked) {
    highlightCorrect(q.id);
    correctShown = true;
  }

  updateProgress();
}

function handleAnswer(id, chosen, btn) {
  const correctArray = answers[id];
  const all = document.querySelectorAll('#options button');
  if (!correctArray) return;

  if (correctArray.includes(chosen)) {
    if (correctShown || correctClicked) {
      nextQuestion();
      return;
    }
    correctClicked = true;
    all.forEach(b => b.classList.remove('wrong'));
    btn.classList.add('correct');
  } else {
    correctClicked = false;
    all.forEach(b => b.classList.remove('wrong'));
    btn.classList.remove('correct');
    btn.classList.add('wrong');
  }
}

function highlightCorrect(id) {
  const correctArray = answers[id];
  const all = document.querySelectorAll('#options button');
  all.forEach(btn => {
    if (correctArray.includes(btn.dataset.letter)) {
      btn.classList.add('correct');
    }
  });
}

function nextQuestion() {
  if (currentIndex < (shuffledIndexes.length > 0 ? shuffledIndexes.length : questions.length) - 1) {
    currentIndex++;
    showQuestion();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion();
  }
}

function goToQuestion() {
  const num = document.getElementById('gotoQuestion').value.trim();
  const idx = questions.findIndex(q => q.num === num);
  if (idx >= 0) {
    currentIndex = idx;
    showQuestion();
  }
}

function shuffleQuestions() {
  const start = parseFloat(document.getElementById('shuffleStart').value);
  const end = parseFloat(document.getElementById('shuffleEnd').value);
  const filtered = questions.filter(q => parseFloat(q.num.split('-')[0]) >= start && parseFloat(q.num.split('-')[0]) <= end);
  shuffledIndexes = filtered.map(q => questions.indexOf(q));
  shuffledIndexes.sort(() => Math.random() - 0.5);
  currentIndex = 0;
  showQuestion();
}

function toggleShuffleInputs() {
  const checked = document.getElementById('shuffleMode').checked;
  document.getElementById('shuffleInputs').style.display = checked ? 'inline' : 'none';
  document.getElementById('gotoContainer').style.display = checked ? 'none' : 'inline-block';
  if (!checked) shuffledIndexes = [];
  updateProgress();
}

function updateProgress() {
  const total = shuffledIndexes.length || questions.length;
  const index = currentIndex + 1;
  const inShuffle = shuffledIndexes.length > 0;
  document.getElementById('progress').innerText = inShuffle ? `Soru: ${index} / ${total}` : '';
}