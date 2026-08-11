let wordList = [];
let currentWord = null;
let currentRange = '';

// UI要素
const selectScreen = document.getElementById('select-screen');
const studyScreen = document.getElementById('study-screen');
const completeScreen = document.getElementById('complete-screen');
const progressText = document.getElementById('progress-text');
const wordText = document.getElementById('word-text');
const meaningText = document.getElementById('meaning-text');

const flipBtn = document.getElementById('flip-btn');
const judgeBtnGroup = document.getElementById('judge-btn-group');
const forgetBtn = document.getElementById('forget-btn');
const rememberBtn = document.getElementById('remember-btn');

const changePartBtn = document.getElementById('change-part-btn');
const saveBtn = document.getElementById('save-btn');
const keepBtn = document.getElementById('keep-btn');
const resetBtn = document.getElementById('reset-btn');
const toast = document.getElementById('toast');

// LocalStorage 取得・保存
function getMasteredIds() {
  const saved = localStorage.getItem('eiken5_mastered_ids');
  return saved ? JSON.parse(saved) : [];
}

function saveMasteredIds(ids) {
  localStorage.setItem('eiken5_mastered_ids', JSON.stringify(ids));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 1500);
}

// 範囲選択
function selectRange(range) {
  currentRange = range;
  
  let filtered = [];
  if (range === 'all') {
    filtered = initialWords;
  } else {
    filtered = initialWords.filter(w => w.part === range);
  }

  const masteredIds = getMasteredIds();

  wordList = filtered.map(w => ({
    ...w,
    isMastered: masteredIds.includes(w.id)
  }));
  
  selectScreen.classList.add('hidden');
  studyScreen.classList.remove('hidden');
  completeScreen.classList.add('hidden');
  
  pickNextWord();
}

// 次の単語を出題
function pickNextWord() {
  const unmastered = wordList.filter(w => !w.isMastered);

  if (unmastered.length === 0) {
    studyScreen.classList.add('hidden');
    completeScreen.classList.remove('hidden');
    return;
  }

  progressText.textContent = `残り: ${unmastered.length} / ${wordList.length}`;

  let available = unmastered;
  if (unmastered.length > 1 && currentWord) {
    available = unmastered.filter(w => w.id !== currentWord.id);
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  currentWord = available[randomIndex];

  wordText.textContent = currentWord.word;
  meaningText.textContent = currentWord.meaning;
  meaningText.classList.add('hidden');

  flipBtn.classList.remove('hidden');
  judgeBtnGroup.classList.add('hidden');
}

// --- イベント登録 ---

flipBtn.addEventListener('click', () => {
  meaningText.classList.remove('hidden');
  flipBtn.classList.add('hidden');
  judgeBtnGroup.classList.remove('hidden');
});

forgetBtn.addEventListener('click', () => {
  pickNextWord();
});

rememberBtn.addEventListener('click', () => {
  currentWord.isMastered = true;

  const masteredIds = getMasteredIds();
  if (!masteredIds.includes(currentWord.id)) {
    masteredIds.push(currentWord.id);
    saveMasteredIds(masteredIds);
  }

  pickNextWord();
});

changePartBtn.addEventListener('click', () => {
  studyScreen.classList.add('hidden');
  selectScreen.classList.remove('hidden');
});

saveBtn.addEventListener('click', () => {
  const masteredIds = getMasteredIds();
  wordList.forEach(w => {
    if (w.isMastered && !masteredIds.includes(w.id)) {
      masteredIds.push(w.id);
    }
  });
  saveMasteredIds(masteredIds);
  showToast("進捗を保存しました！");
});

// 記録を残して範囲選択へ戻るボタン
keepBtn.addEventListener('click', () => {
  completeScreen.classList.add('hidden');
  selectScreen.classList.remove('hidden');
});

// 進捗を初期化して最初からやり直すボタン
resetBtn.addEventListener('click', () => {
  if (confirm("現在の範囲の進捗をリセットして最初からやり直しますか？")) {
    const masteredIds = getMasteredIds();
    const currentPartIds = wordList.map(w => w.id);
    const updatedIds = masteredIds.filter(id => !currentPartIds.includes(id));
    saveMasteredIds(updatedIds);

    completeScreen.classList.add('hidden');
    selectScreen.classList.remove('hidden');
  }
});
