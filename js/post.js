// post.js - extracted from post.html
const limit = 280; // X/Twitter character limit
const extra = 20;   // threshold buffer

// Shortforms list (from provided JSON)
const shortforms = [
  { "Shortform/Slang": "w", "Meaning": "with" },
  { "Shortform/Slang": "w/", "Meaning": "with" },
  { "Shortform/Slang": "w/o", "Meaning": "without" },
  { "Shortform/Slang": "b/c", "Meaning": "because" },
  { "Shortform/Slang": "u", "Meaning": "you" },
  { "Shortform/Slang": "r", "Meaning": "are" },
  { "Shortform/Slang": "y", "Meaning": "why" },
  { "Shortform/Slang": "b", "Meaning": "be / boy" },
  { "Shortform/Slang": "d", "Meaning": "the / do" },
  { "Shortform/Slang": "c", "Meaning": "see" },
  { "Shortform/Slang": "2", "Meaning": "to / too / two" },
  { "Shortform/Slang": "4", "Meaning": "for" },
  { "Shortform/Slang": "n", "Meaning": "and" },
  { "Shortform/Slang": "j", "Meaning": "just" },
  { "Shortform/Slang": "js", "Meaning": "just saying" },
  { "Shortform/Slang": "tbh", "Meaning": "to be honest" },
  { "Shortform/Slang": "idk", "Meaning": "I don’t know" },
  { "Shortform/Slang": "rn", "Meaning": "right now" },
  { "Shortform/Slang": "lmk", "Meaning": "let me know" },
  { "Shortform/Slang": "omg", "Meaning": "oh my god" },
  { "Shortform/Slang": "omw", "Meaning": "on my way" },
  { "Shortform/Slang": "btw", "Meaning": "by the way" },
  { "Shortform/Slang": "brb", "Meaning": "be right back" },
  { "Shortform/Slang": "imo / imho", "Meaning": "in my (honest) opinion" },
  { "Shortform/Slang": "ikr", "Meaning": "I know, right?" },
  { "Shortform/Slang": "cap", "Meaning": "lie / not true" },
  { "Shortform/Slang": "no cap", "Meaning": "seriously / not lying" },
  { "Shortform/Slang": "bet", "Meaning": "okay / for sure / I agree" },
  { "Shortform/Slang": "sus", "Meaning": "suspicious / shady" },
  { "Shortform/Slang": "slay", "Meaning": "doing amazing / killing it" },
  { "Shortform/Slang": "ate", "Meaning": "performed exceptionally well" },
  { "Shortform/Slang": "fam", "Meaning": "close friends / chosen family" },
  { "Shortform/Slang": "deadass", "Meaning": "seriously / I mean it" },
  { "Shortform/Slang": "vibe", "Meaning": "atmosphere / feeling" },
  { "Shortform/Slang": "extra", "Meaning": "over the top / dramatic" },
  { "Shortform/Slang": "flex", "Meaning": "showing off" },
  { "Shortform/Slang": "ghost", "Meaning": "suddenly ignore / disappear from convo" },
  { "Shortform/Slang": "mood", "Meaning": "relatable feeling" },
  { "Shortform/Slang": "ratio", "Meaning": "more replies/likes than the original post" },
  { "Shortform/Slang": "stan", "Meaning": "super fan / strongly support" },
  { "Shortform/Slang": "simp", "Meaning": "excessively affectionate or submissive" },
  { "Shortform/Slang": "lowkey", "Meaning": "secretly / not openly" },
  { "Shortform/Slang": "highkey", "Meaning": "openly / very much so" }
];

// Live character count logic
const textarea = document.getElementById('input');
const charCount = document.getElementById('charCount');

function updateCharCount() {
  const count = textarea.value.length;
  charCount.textContent = `${count} / ${limit} chars`;
  charCount.style.color = '';
  if (count >= limit) {
    charCount.style.color = 'red';
  } else if (count >= Math.floor(limit * 0.9)) {
    charCount.style.color = 'orange';
  } else {
    charCount.style.color = '';
  }
}

textarea.addEventListener('input', updateCharCount);
// Initialize on page load
updateCharCount();

// Helper for live char count for any textarea
function createLiveCharCount(targetTextarea, limit) {
  const span = document.createElement('span');
  span.className = 'charCount';
  span.textContent = `0 / ${limit} chars`;
  function update() {
    const count = targetTextarea.value.length;
    span.textContent = `${count} / ${limit} chars`;
    span.style.color = '';
    if (count >= limit) {
      span.style.color = 'red';
    } else if (count >= Math.floor(limit * 0.9)) {
      span.style.color = 'orange';
    } else {
      span.style.color = '';
    }
  }
  targetTextarea.addEventListener('input', update);
  // Initial update
  update();
  // Insert after textarea
  targetTextarea.parentNode.insertBefore(span, targetTextarea.nextSibling);
  return span;
}

// Mode selection logic
const shortenBtn = document.getElementById('shortenBtn');
const threadBtn = document.getElementById('threadBtn');
const generateBtn = document.getElementById('go');
let selectedMode = null;

function selectMode(mode) {
  if (mode === 'shorten') {
    shortenBtn.classList.add('selected');
    threadBtn.classList.remove('selected');
    selectedMode = 'shorten';
  } else if (mode === 'thread') {
    threadBtn.classList.add('selected');
    shortenBtn.classList.remove('selected');
    selectedMode = 'thread';
  }
}

shortenBtn.addEventListener('click', () => selectMode('shorten'));
threadBtn.addEventListener('click', () => selectMode('thread'));

// Helper: replace all long forms with shortforms
function shortenText(text) {
  let result = text;
  // Sort by longest shortform first to avoid partial replacements
  const sorted = shortforms.slice().sort((a, b) => b["Meaning"].length - a["Meaning"].length);
  for (const entry of sorted) {
    // Each meaning can have multiple options split by /
    const meanings = entry["Meaning"].split("/").map(m => m.trim());
    for (const meaning of meanings) {
      // Replace as whole word, case-insensitive
      const regex = new RegExp(`\\b${meaning.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'gi');
      result = result.replace(regex, entry["Shortform/Slang"]);
    }
  }
  return result;
}

// Remove any previous new tweet field and its char count
function removeNewTweetField() {
  const oldLabel = document.getElementById('new-tweet-label');
  const oldOutput = document.getElementById('new-tweet-output');
  const oldCharCount = document.getElementById('new-tweet-charCount');
  if (oldLabel) oldLabel.remove();
  if (oldOutput) oldOutput.remove();
  if (oldCharCount) oldCharCount.remove();
}

generateBtn.addEventListener('click', function() {
  removeNewTweetField();
  if (selectedMode === 'shorten') {
    const original = textarea.value;
    const shortened = shortenText(original);
    // Create label
    const label = document.createElement('label');
    label.id = 'new-tweet-label';
    label.textContent = 'New Tweet';
    label.setAttribute('for', 'new-tweet-output');
    textarea.parentNode.insertBefore(label, textarea.nextSibling.nextSibling); // after charCount
    // Create output field
    const output = document.createElement('textarea');
    output.id = 'new-tweet-output';
    output.value = shortened;
    output.rows = 3;
    output.style.resize = 'vertical';
    output.className = 'output-textarea';
    output.autofocus = true;
    textarea.parentNode.insertBefore(output, label.nextSibling);
    output.focus();
    // Create and insert live char count for new tweet
    const outputCharCount = document.createElement('span');
    outputCharCount.id = 'new-tweet-charCount';
    outputCharCount.className = 'charCount';
    output.parentNode.insertBefore(outputCharCount, output.nextSibling);
    function updateOutputCharCount() {
      const count = output.value.length;
      outputCharCount.textContent = `${count} / ${limit} chars`;
      outputCharCount.style.color = '';
      if (count >= limit) {
        outputCharCount.style.color = 'red';
      } else if (count >= Math.floor(limit * 0.9)) {
        outputCharCount.style.color = 'orange';
      } else {
        outputCharCount.style.color = '';
      }
    }
    output.addEventListener('input', updateOutputCharCount);
    updateOutputCharCount();
  }
});
// Optionally, select Shorten by default
selectMode('shorten');
// ... (rest of the script logic from post.html) 