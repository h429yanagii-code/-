let currentGrade = '5'; // '5' または '4'
let wordList = [];
let currentWord = null;
let currentRange = '';

// UI要素
const gradeScreen = document.getElementById('grade-screen');
const selectScreen = document.getElementById('select-screen');
const studyScreen = document.getElementById('study-screen');
const completeScreen = document.getElementById('complete-screen');
const selectTitle = document.getElementById('select-title');
const progressText = document.getElementById('progress-text');
const wordText = document.getElementById('word-text');
const meaningText = document.getElementById('meaning-text');

const flipBtn = document.getElementById('flip-btn');
const judgeBtnGroup = document.getElementById('judge-btn-group');
const forgetBtn = document.getElementById('forget-btn');
const rememberBtn = document.getElementById('remember-btn');

const backToGradeBtn = document.getElementById('back-to-grade-btn');
const changePartBtn = document.getElementById('change-part-btn');
const saveBtn = document.getElementById('save-btn');
const keepBtn = document.getElementById('keep-btn');
const resetBtn = document.getElementById('reset-btn');
const toast = document.getElementById('toast');
const partListContainer = document.getElementById('part-list');

// 音声再生関数
function speakWord(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

// 級に応じたLocalStorageキー
function getStorageKey() {
  return `eiken${currentGrade}_mastered_ids`;
}

// LocalStorage 取得・保存
function getMasteredIds() {
  const saved = localStorage.getItem(getStorageKey());
  return saved ? JSON.parse(saved) : [];
}

function saveMasteredIds(ids) {
  localStorage.setItem(getStorageKey(), JSON.stringify(ids));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 1500);
}

// 級の選択処理
function selectGrade(grade) {
  currentGrade = grade;
  selectTitle.textContent = `英検${currentGrade}級単語帳`;
  
  gradeScreen.classList.add('hidden');
  selectScreen.classList.remove('hidden');
  
  renderPartButtons();
}

// 範囲選択画面のボタン描画（完了チェック）
function renderPartButtons() {
  partListContainer.innerHTML = '';
  const masteredIds = getMasteredIds();
  const allGradeWords = wordsData[currentGrade] || [];

  for (let i = 1; i <= 10; i++) {
    const partKey = `part${i}`;
    const partWords = allGradeWords.filter(w => w.part === partKey);
    
    // パート内の全単語がマスター済みかチェック
    const isCompleted = partWords.length > 0 && partWords.every(w => masteredIds.includes(w.id));

    const wrapper = document.createElement('div');
    wrapper.className = 'btn-part-wrapper';

    const btn = document.createElement('button');
    btn.className = 'btn btn-part';
    btn.textContent = `Part ${i} (${(i-1)*70 + 1}〜${i*70}語)`;
    btn.onclick = () => selectRange(partKey);

    wrapper.appendChild(btn);

    if (isCompleted) {
      const badge = document.createElement('span');
      badge.className = 'badge-done';
      badge.textContent = '完了';
      wrapper.appendChild(badge);
    }

    partListContainer.appendChild(wrapper);
  }
}

// 範囲選択
function selectRange(range) {
  currentRange = range;
  const allGradeWords = wordsData[currentGrade] || [];
  
  let filtered = [];
  if (range === 'all') {
    filtered = allGradeWords;
  } else {
    filtered = allGradeWords.filter(w => w.part === range);
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
  meaningText.classList.add('invisible');

  flipBtn.classList.remove('hidden');
  judgeBtnGroup.classList.add('hidden');

  // 単語が表示されたタイミングで音声を再生
  speakWord(currentWord.word);
}

// --- イベント登録 ---

flipBtn.addEventListener('click', () => {
  meaningText.classList.remove('invisible');
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

backToGradeBtn.addEventListener('click', () => {
  selectScreen.classList.add('hidden');
  gradeScreen.classList.remove('hidden');
});

changePartBtn.addEventListener('click', () => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  studyScreen.classList.add('hidden');
  renderPartButtons();
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

keepBtn.addEventListener('click', () => {
  completeScreen.classList.add('hidden');
  renderPartButtons();
  selectScreen.classList.remove('hidden');
});

resetBtn.addEventListener('click', () => {
  if (confirm("現在の範囲の進捗をリセットして最初からやり直しますか？")) {
    const masteredIds = getMasteredIds();
    const currentPartIds = wordList.map(w => w.id);
    const updatedIds = masteredIds.filter(id => !currentPartIds.includes(id));
    saveMasteredIds(updatedIds);

    completeScreen.classList.add('hidden');
    renderPartButtons();
    selectScreen.classList.remove('hidden');
  }
});
