/* ---------- Config ---------- */
const STORAGE_KEY = 'echoShadowingData_v1';

/* ---------- State ---------- */
let state = loadState();
let currentTextId = null;
let sentences = [];
let currentIndex = 0;
let currentUtteranceWords = [];
let loopsRemaining = 0;
let isPlaying = false;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let currentRecordingUrl = null;

/* ---------- Persistence ---------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn('Storage read failed', e); }
  return { texts: {}, lastPracticeDate: null, streak: 0 };
}

let saveFlashTimeout = null;
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    flashSaveIndicator();
  } catch (e) { console.warn('Storage write failed', e); }
}
function flashSaveIndicator() {
  const el = document.getElementById('saveIndicator');
  if (!el) return;
  el.classList.add('just-saved');
  clearTimeout(saveFlashTimeout);
  saveFlashTimeout = setTimeout(() => el.classList.remove('just-saved'), 900);
}

function getTextProgress(id) {
  if (!state.texts[id]) state.texts[id] = { mastered: [] };
  return state.texts[id];
}

/* ---------- Streak logic ---------- */
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function registerPracticeToday() {
  const today = todayStr();
  if (state.lastPracticeDate === today) return; // already counted
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
  if (state.lastPracticeDate === yesterday) {
    state.streak = (state.streak || 0) + 1;
  } else {
    state.streak = 1;
  }
  state.lastPracticeDate = today;
  saveState();
  renderStats();
}

/* ---------- Library setup ---------- */
function populateLibrary() {
  const sel = document.getElementById('textSelect');
  sel.innerHTML = '';
  SAMPLE_TEXTS.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.title;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => loadText(sel.value));
  loadText(SAMPLE_TEXTS[0].id);
}

function loadText(id) {
  const t = SAMPLE_TEXTS.find(s => s.id === id);
  if (!t) return;
  currentTextId = id;
  sentences = splitIntoSentences(t.text);
  currentIndex = 0;
  document.getElementById('textMeta').textContent = `Daraja: ${t.level} · ${sentences.length} ta gap`;
  document.getElementById('textSelect').value = id;
  renderSentence();
  renderProgressTrack();
  renderStats();
}

function loadCustomText(rawText) {
  const text = rawText.trim();
  if (!text) return;
  const id = 'custom-' + Date.now();
  sentences = splitIntoSentences(text);
  if (!sentences.length) return;
  currentTextId = id;
  currentIndex = 0;
  document.getElementById('textMeta').textContent = `Shaxsiy matn · ${sentences.length} ta gap`;
  renderSentence();
  renderProgressTrack();
  renderStats();
}

/* ---------- Voices ---------- */
function populateVoices() {
  const voiceSelect = document.getElementById('voiceSelect');
  const voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
  const list = voices.length ? voices : speechSynthesis.getVoices();
  voiceSelect.innerHTML = '';
  list.forEach((v, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  });
  voiceSelect._voices = list;
}

/* ---------- Sentence rendering ---------- */
function renderSentence() {
  const el = document.getElementById('sentenceText');
  const sentence = sentences[currentIndex] || 'Matn topilmadi.';
  const words = sentence.split(/(\s+)/); // keep spaces as tokens
  el.innerHTML = '';
  let charOffset = 0;
  currentUtteranceWords = [];
  words.forEach(tok => {
    if (tok.trim() === '') {
      el.appendChild(document.createTextNode(tok));
    } else {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = tok;
      el.appendChild(span);
      currentUtteranceWords.push({ start: charOffset, end: charOffset + tok.length, el: span });
    }
    charOffset += tok.length;
  });

  document.getElementById('sentenceIndex').textContent = `${currentIndex + 1} / ${sentences.length}`;
  document.getElementById('prevBtn').disabled = currentIndex === 0;
  document.getElementById('nextBtn').disabled = currentIndex === sentences.length - 1;

  const progress = getTextProgress(currentTextId);
  document.getElementById('masteredCheck').checked = progress.mastered.includes(currentIndex);

  // reset recording state for new sentence
  currentRecordingUrl = null;
  document.getElementById('playMineBtn').disabled = true;
  stopSpeaking();
}

function renderProgressTrack() {
  const track = document.getElementById('progressTrack');
  track.innerHTML = '';
  const progress = getTextProgress(currentTextId);
  sentences.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    if (progress.mastered.includes(i)) dot.classList.add('done');
    if (i === currentIndex) dot.classList.add('current');
    dot.title = `Gap ${i + 1}`;
    dot.style.cursor = 'pointer';
    dot.addEventListener('click', () => { currentIndex = i; renderSentence(); renderProgressTrack(); });
    track.appendChild(dot);
  });
}

function renderStats() {
  document.getElementById('statStreak').textContent = state.streak || 0;
  let totalMastered = 0;
  Object.values(state.texts).forEach(t => { totalMastered += t.mastered.length; });
  document.getElementById('statMastered').textContent = totalMastered;
}

/* ---------- TTS playback ---------- */
function stopSpeaking() {
  speechSynthesis.cancel();
  isPlaying = false;
  loopsRemaining = 0;
  document.getElementById('waveform').classList.remove('active');
  document.getElementById('playNativeBtn').classList.remove('recording');
  currentUtteranceWords.forEach(w => w.el.classList.remove('spoken'));
}

function speakSentence() {
  if (!('speechSynthesis' in window)) {
    alert("Kechirasiz, brauzeringiz ovozli o'qishni (Speech Synthesis) qo'llab-quvvatlamaydi.");
    return;
  }
  stopSpeaking();
  const sentence = sentences[currentIndex];
  if (!sentence) return;

  const loopCount = parseInt(document.getElementById('loopRange').value, 10);
  loopsRemaining = loopCount;
  isPlaying = true;
  document.getElementById('waveform').classList.add('active');
  registerPracticeToday();
  playOneLoop(sentence);
}

function playOneLoop(sentence) {
  if (loopsRemaining <= 0) {
    stopSpeaking();
    return;
  }
  const utter = new SpeechSynthesisUtterance(sentence);
  const rate = parseFloat(document.getElementById('speedRange').value);
  utter.rate = rate;
  const voiceSelect = document.getElementById('voiceSelect');
  const voices = voiceSelect._voices || [];
  const chosen = voices[parseInt(voiceSelect.value, 10)];
  if (chosen) utter.voice = chosen;
  utter.lang = chosen ? chosen.lang : 'en-US';

  utter.onboundary = (e) => {
    if (e.name !== 'word' && e.charIndex === undefined) return;
    currentUtteranceWords.forEach(w => w.el.classList.remove('spoken'));
    const match = currentUtteranceWords.find(w => e.charIndex >= w.start && e.charIndex < w.end);
    if (match) match.el.classList.add('spoken');
  };

  utter.onend = () => {
    loopsRemaining -= 1;
    currentUtteranceWords.forEach(w => w.el.classList.remove('spoken'));
    if (loopsRemaining > 0) {
      setTimeout(() => playOneLoop(sentence), 350);
    } else {
      stopSpeaking();
    }
  };

  utter.onerror = () => stopSpeaking();

  speechSynthesis.speak(utter);
}

/* ---------- Recording ---------- */
async function toggleRecording() {
  const btn = document.getElementById('recordBtn');
  const waveform = document.getElementById('waveform');

  if (isRecording) {
    mediaRecorder.stop();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      currentRecordingUrl = URL.createObjectURL(blob);
      document.getElementById('playMineBtn').disabled = false;
      stream.getTracks().forEach(t => t.stop());
      isRecording = false;
      btn.classList.remove('recording');
      btn.innerHTML = '<span class="ic">●</span> O\'zim aytaman';
      waveform.classList.remove('active', 'recording');
      registerPracticeToday();
    };
    mediaRecorder.start();
    isRecording = true;
    btn.classList.add('recording');
    btn.innerHTML = '<span class="ic">■</span> To\'xtatish';
    waveform.classList.add('active', 'recording');
  } catch (err) {
    alert("Mikrofonga ruxsat berilmadi yoki topilmadi. Iltimos, brauzer sozlamalarida ruxsat bering.");
  }
}

function playMyRecording() {
  if (!currentRecordingUrl) return;
  const player = document.getElementById('myRecordingPlayer');
  player.src = currentRecordingUrl;
  player.play();
}

/* ---------- Navigation & mastery ---------- */
function goPrev() { if (currentIndex > 0) { currentIndex--; renderSentence(); renderProgressTrack(); } }
function goNext() { if (currentIndex < sentences.length - 1) { currentIndex++; renderSentence(); renderProgressTrack(); } }

function toggleMastered(checked) {
  const progress = getTextProgress(currentTextId);
  const idx = progress.mastered.indexOf(currentIndex);
  if (checked && idx === -1) progress.mastered.push(currentIndex);
  if (!checked && idx !== -1) progress.mastered.splice(idx, 1);
  saveState();
  renderProgressTrack();
  renderStats();
}

/* ---------- UI wiring ---------- */
function setupControls() {
  document.getElementById('playNativeBtn').addEventListener('click', speakSentence);
  document.getElementById('recordBtn').addEventListener('click', toggleRecording);
  document.getElementById('playMineBtn').addEventListener('click', playMyRecording);
  document.getElementById('prevBtn').addEventListener('click', goPrev);
  document.getElementById('nextBtn').addEventListener('click', goNext);
  document.getElementById('masteredCheck').addEventListener('change', (e) => toggleMastered(e.target.checked));

  const speedRange = document.getElementById('speedRange');
  speedRange.addEventListener('input', () => {
    document.getElementById('speedValue').textContent = `${parseFloat(speedRange.value).toFixed(1)}x`;
  });
  const loopRange = document.getElementById('loopRange');
  loopRange.addEventListener('input', () => {
    document.getElementById('loopValue').textContent = loopRange.value;
  });

  document.getElementById('loadCustomBtn').addEventListener('click', () => {
    const val = document.getElementById('customText').value;
    loadCustomText(val);
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  populateLibrary();
  setupControls();
  populateVoices();
  if ('onvoiceschanged' in speechSynthesis) {
    speechSynthesis.onvoiceschanged = populateVoices;
  }
});

/* ---------- Offline support ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
