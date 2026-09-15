// script.js
// Handles the multi-step flow and playful interactions

document.addEventListener('DOMContentLoaded', () => {
  const screens = Array.from(document.querySelectorAll('.screen'));
  const showScreen = (step) => {
    screens.forEach(s => s.classList.toggle('active', Number(s.dataset.step) === step));
    // reset any transient transforms for no button when going back to step 1
    if (step === 1) {
      resetNoButtonVisual();
    }
  };

  // --- Screen buttons ---
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const continueBtn = document.getElementById('continueBtn');
  const nextToFoodBtn = document.getElementById('nextToFoodBtn');
  const confirmFoodBtn = document.getElementById('confirmFoodBtn');
  const startOverBtn = document.getElementById('startOverBtn');

  yesBtn.addEventListener('click', () => showScreen(2));
  continueBtn.addEventListener('click', () => showScreen(3));

  // --- Playful No button behavior (dodge on hover/touch, never clickable) ---
  const noTexts = [
    'No', 'Are you sure?', 'Really?', 'Think again', 'Please?', "You're breaking my heart", "You can't click me", 'Try Yes instead'
  ];
  const MIN_ESCAPES_BEFORE_TEXT_CHANGE = 2; // keep 'No' visible for the first escapes
  let noEscapes = 0;
  let lastEscape = 0;
  const card = document.querySelector('.card');

  function resetNoButtonVisual(){
    noBtn.style.transform = '';
    noBtn.style.transition = '';
    noBtn.style.left = '';
    noBtn.style.top = '';
    noBtn.style.position = '';
    noBtn.textContent = 'No';
    noEscapes = 0;
  }

  // move the No button to a random position inside the card
  function moveNoButtonRandomly(){
    const now = Date.now();
    if (now - lastEscape < 180) return; // throttle rapid moves
    lastEscape = now;
    noEscapes = Math.min(noEscapes + 1, 100);

    const cardRect = card.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const padding = 12;
    const availableW = Math.max(0, cardRect.width - btnRect.width - padding * 2);
    const availableH = Math.max(0, cardRect.height - btnRect.height - padding * 2);

    const left = Math.round(padding + Math.random() * availableW);
    const top = Math.round(padding + Math.random() * availableH);

    noBtn.style.position = 'absolute';
    noBtn.style.left = left + 'px';
    noBtn.style.top = top + 'px';
    noBtn.style.transition = 'left .28s cubic-bezier(.2,.9,.2,1), top .28s cubic-bezier(.2,.9,.2,1), transform .18s';

    // don't change the text on the very first escapes to avoid abrupt swaps
    const textIndex = Math.max(0, noEscapes - MIN_ESCAPES_BEFORE_TEXT_CHANGE);
    const txt = noTexts[Math.min(textIndex, noTexts.length - 1)];
    noBtn.textContent = txt;
  }

  // Block any successful click on No; instead move it
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveNoButtonRandomly();
  }, {capture: true});

  // Desktop proximity detection (less sensitive to avoid accidental triggers)
  document.addEventListener('mousemove', (e) => {
    const ptrX = e.clientX, ptrY = e.clientY;
    const btnRect = noBtn.getBoundingClientRect();
    const bx = btnRect.left + btnRect.width / 2;
    const by = btnRect.top + btnRect.height / 2;
    const dx = ptrX - bx;
    const dy = ptrY - by;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const threshold = 60; // px — reduced sensitivity
    if (dist < threshold) moveNoButtonRandomly();
  });

  // Mobile/touch: move immediately on touchstart
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveNoButtonRandomly();
  }, {passive: false});

  // removed mouseenter-trigger to avoid immediate text swaps on simple hover

  window.addEventListener('resize', () => {
    setTimeout(() => {
      if (noBtn.style.position === 'absolute') moveNoButtonRandomly();
    }, 120);
  });

  // --- Date & Time validation ---
  const dateInput = document.getElementById('dateInput');
  const timeSelect = document.getElementById('timeSelect');
  const dateWarning = document.getElementById('dateWarning');

  nextToFoodBtn.addEventListener('click', () => {
    dateWarning.textContent = '';
    if (!dateInput.value || !timeSelect.value) {
      dateWarning.textContent = 'Pick a date and time first, silly.';
      return;
    }
    // store selections
    state.date = dateInput.value;
    state.time = timeSelect.value;
    showScreen(4);
  });

  // --- Food selection ---
  const foodGrid = document.getElementById('foodGrid');
  const foodWarning = document.getElementById('foodWarning');
  let selectedFood = null;

  foodGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.food-card');
    if (!card) return;
    // clear other selections
    document.querySelectorAll('.food-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedFood = card.dataset.food;
    foodWarning.textContent = '';
  });

  confirmFoodBtn.addEventListener('click', () => {
    if (!selectedFood) {
      foodWarning.textContent = "You have to choose what we're eating first.";
      return;
    }
    state.food = selectedFood;
    showFinal();
    showScreen(5);
  });

  // --- Final screen content ---
  const finalMsg = document.getElementById('finalMsg');
  const state = { date: '', time: '', food: '' };

  function formatDate(iso){
    try{
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }catch(e){
      return iso;
    }
  }

  function showFinal(){
    const prettyDate = formatDate(state.date);
    finalMsg.innerHTML = `Glad you didn’t say no.<br>Be ready on <strong>${prettyDate}</strong> at <strong>${state.time}</strong>.<br>We’re getting <strong>${state.food}</strong>.`;
  }

  // --- Start over ---
  startOverBtn.addEventListener('click', resetAll);

  function resetAll(){
    // reset form values and state
    dateInput.value = '';
    timeSelect.value = '';
    selectedFood = null;
    document.querySelectorAll('.food-card').forEach(c => c.classList.remove('selected'));
    state.date = '';
    state.time = '';
    state.food = '';
    dateWarning.textContent = '';
    foodWarning.textContent = '';
    finalMsg.textContent = '';
    resetNoButtonVisual();
    showScreen(1);
  }

});
