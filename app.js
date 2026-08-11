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

// --- LocalStorage 関連処理 ---
function getMasteredIds() {
  const saved = localStorage.getItem('eiken5_mastered_ids');
  return saved ? JSON.parse(saved) : [];
}

function saveMasteredIds(ids) {
  localStorage.setItem('eiken5_mastered_ids', JSON.stringify(ids));
}

// 保存通知メッセージ（トースト）を表示
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

// 次の単語をセット
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

  // カード領域の表示初期化
  wordText.textContent = currentWord.word;
  meaningText.textContent = currentWord.meaning;
  meaningText.classList.add('hidden');

  // ボタン表示初期化: 「裏返す」を表示し、「2つの判定ボタン」を隠す
  flipBtn.classList.remove('hidden');
  judgeBtnGroup.classList.add('hidden');
}

// --- イベント処理 ---

// 裏返すボタンを押したとき
flipBtn.addEventListener('click', () => {
  meaningText.classList.remove('hidden'); // 日本語訳を表示
  flipBtn.classList.add('hidden');        // 「裏返す」ボタンを非表示
  judgeBtnGroup.classList.remove('hidden'); // 「覚えられない」「覚えた」ボタンを表示
});

// 覚えられないボタンを押したとき
forgetBtn.addEventListener('click', () => {
  pickNextWord();
});

// 覚えたボタンを押したとき
rememberBtn.addEventListener('click', () => {
  currentWord.isMastered = true;

  const masteredIds = getMasteredIds();
  if (!masteredIds.includes(currentWord.id)) {
    masteredIds.push(currentWord.id);
    saveMasteredIds(masteredIds);
  }

  pickNextWord();
});

// 途中でPARTを変更するボタン
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

// 完了画面からのリセットボタン
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
