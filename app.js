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

  // カード表示の初期化
  wordText.textContent = currentWord.word;
  meaningText.textContent = currentWord.meaning;
  meaningText.classList.add('hidden');

  // ボタン切り替え: 「裏返す」を表示し、「覚えた/忘れた」グループを隠す
  flipBtn.classList.remove('hidden');
  judgeBtnGroup.classList.add('hidden');
}

// --- イベント登録 ---

// 「裏返す」ボタンを押したとき
flipBtn.addEventListener('click', () => {
  meaningText.classList.remove('hidden');   // 日本語訳を表示
  flipBtn.classList.add('hidden');          // 「裏返す」を消す
  judgeBtnGroup.classList.remove('hidden'); // 半分サイズの「覚えた」「忘れた」ボタンを表示
});

// 「忘れた」ボタンを押したとき（旧「覚えられない」）
forgetBtn.addEventListener('click', () => {
  pickNextWord();
});

// 「覚えた」ボタンを押したとき
rememberBtn.addEventListener('click', () => {
  currentWord.isMastered = true;

  const masteredIds = getMasteredIds();
  if (!masteredIds.includes(currentWord.id)) {
    masteredIds.push(currentWord.id);
    saveMasteredIds(masteredIds);
  }

  pickNextWord();
});

// 範囲変更ボタン
changePartBtn.addEventListener('click', () => {
  studyScreen.classList.add('hidden');
  selectScreen.classList.remove('hidden');
});

// 手動セーブボタン
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

// リセットボタン
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
