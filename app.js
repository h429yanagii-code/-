let wordList = [];
let currentWord = null;

const selectScreen = document.getElementById('select-screen');
const studyScreen = document.getElementById('study-screen');
const completeScreen = document.getElementById('complete-screen');
const progressText = document.getElementById('progress-text');
const wordText = document.getElementById('word-text');
const meaningText = document.getElementById('meaning-text');
const flipBtn = document.getElementById('flip-btn');
const forgetBtn = document.getElementById('forget-btn');
const rememberBtn = document.getElementById('remember-btn');
const resetBtn = document.getElementById('reset-btn');

// 範囲選択
function selectRange(range) {
  let filtered = [];
  if (range === 'all') {
    filtered = initialWords;
  } else {
    filtered = initialWords.filter(w => w.part === range);
  }

  wordList = filtered.map(w => ({ ...w, isMastered: false }));
  
  selectScreen.classList.add('hidden');
  studyScreen.classList.remove('hidden');
  completeScreen.classList.add('hidden');
  
  pickNextWord();
}

function pickNextWord() {
  const unmastered = wordList.filter(w => !w.isMastered);

  if (unmastered.length === 0) {
    studyScreen.classList.add('hidden');
    completeScreen.classList.remove('hidden');
    return;
  }

  progressText.textContent = `残り: ${unmastered.length} / ${wordList.length} 単語`;

  let available = unmastered;
  if (unmastered.length > 1 && currentWord) {
    available = unmastered.filter(w => w.id !== currentWord.id);
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  currentWord = available[randomIndex];

  wordText.textContent = currentWord.word;
  meaningText.textContent = currentWord.meaning;
  meaningText.classList.add('hidden');
  forgetBtn.disabled = true;
  rememberBtn.disabled = true;
}

flipBtn.addEventListener('click', () => {
  meaningText.classList.remove('hidden');
  forgetBtn.disabled = false;
  rememberBtn.disabled = false;
});

forgetBtn.addEventListener('click', () => {
  pickNextWord();
});

rememberBtn.addEventListener('click', () => {
  currentWord.isMastered = true;
  pickNextWord();
});

resetBtn.addEventListener('click', () => {
  completeScreen.classList.add('hidden');
  selectScreen.classList.remove('hidden');
});