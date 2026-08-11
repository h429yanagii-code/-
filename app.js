let wordList = [];
let currentWord = null;
let currentRange = ''; // 現在選択中のパート（'part1', 'part2', 'part3', 'all'）

// UI要素の取得
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

// --- LocalStorage 関連の処理 ---

// 保存されている「覚えた単語のID一覧」を取得する
function getMasteredIds() {
  const saved = localStorage.getItem('eiken5_mastered_ids');
  return saved ? JSON.parse(saved) : [];
}

// 「覚えた単語のID一覧」をLocalStorageに保存する
function saveMasteredIds(ids) {
  localStorage.setItem('eiken5_mastered_ids', JSON.stringify(ids));
}

// 範囲選択
function selectRange(range) {
  currentRange = range;
  
  // 選択範囲の単語を抽出
  let filtered = [];
  if (range === 'all') {
    filtered = initialWords;
  } else {
    filtered = initialWords.filter(w => w.part === range);
  }

  // LocalStorageから過去に「覚えた」IDリストを読み込み
  const masteredIds = getMasteredIds();

  // 単語リストの初期化（過去に覚えたIDが含まれていれば isMastered: true に設定）
  wordList = filtered.map(w => ({
    ...w,
    isMastered: masteredIds.includes(w.id)
  }));
  
  selectScreen.classList.add('hidden');
  studyScreen.classList.remove('hidden');
  completeScreen.classList.add('hidden');
  
  pickNextWord();
}

// 次の単語をランダム出題
function pickNextWord() {
  const unmastered = wordList.filter(w => !w.isMastered);

  // すべて覚えた場合
  if (unmastered.length === 0) {
    studyScreen.classList.add('hidden');
    completeScreen.classList.remove('hidden');
    return;
  }

  progressText.textContent = `残り: ${unmastered.length} / ${wordList.length} 単語`;

  // 直前と同じ単語が連続しないよう配慮（未習得が2件以上ある場合）
  let available = unmastered;
  if (unmastered.length > 1 && currentWord) {
    available = unmastered.filter(w => w.id !== currentWord.id);
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  currentWord = available[randomIndex];

  // UI初期表示
  wordText.textContent = currentWord.word;
  meaningText.textContent = currentWord.meaning;
  meaningText.classList.add('hidden');
  forgetBtn.disabled = true;
  rememberBtn.disabled = true;
}

// ボタンのイベントリスナー設定
flipBtn.addEventListener('click', () => {
  meaningText.classList.remove('hidden');
  forgetBtn.disabled = false;
  rememberBtn.disabled = false;
});

forgetBtn.addEventListener('click', () => {
  pickNextWord();
});

rememberBtn.addEventListener('click', () => {
  // 該当単語を「覚えた」状態に設定
  currentWord.isMastered = true;

  // LocalStorageのデータを更新
  const masteredIds = getMasteredIds();
  if (!masteredIds.includes(currentWord.id)) {
    masteredIds.push(currentWord.id);
    saveMasteredIds(masteredIds);
  }

  pickNextWord();
});

// 全データをリセットして最初からやり直すボタン（完了画面）
resetBtn.addEventListener('click', () => {
  if (confirm("これまでの進捗をリセットして、最初からやり直しますか？")) {
    // 選択中のパートの進捗のみ消去（または全消去）
    const masteredIds = getMasteredIds();
    const currentPartIds = wordList.map(w => w.id);
    const updatedIds = masteredIds.filter(id => !currentPartIds.includes(id));
    saveMasteredIds(updatedIds);

    completeScreen.classList.add('hidden');
    selectScreen.classList.remove('hidden');
  }
});
