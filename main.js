import { countries } from './data.js';
import { sendLeadsRequest, sendNotesRequest } from './api.js';
import { init as uiInit, showSplashScreen, setupReserveButton, openPopup1, hidePopup1, showFinalPopup, setupAccessibility } from './ui.js';

// --- DOM Element Selection ---
const $ = s => document.querySelector(s);
const elements = {
    preForm: $('#preForm'),
    nameInput: $('#name'),
    countrySelect: $('#country'),
    prefixEl: $('#prefix'),
    phoneInput: $('#phone'),
    roleSelect: $('#role'),
    otherRoleWrap: $('#otherRoleWrap'),
    otherRoleInput: $('#otherRole'),
    emailInput: $('#email'),
    reserveBtn: $('#reserveBtn'),
    // UI module elements
    splash: $('#splash'),
    overlay1: $('#overlay1'),
    overlay2: $('#overlay2'),
    skipBtn: $('#skipBtn'),
    solveBtn: $('#solveBtn'),
    notesEl: $('#notes'),
    closeFinal: $('#closeFinal'),
    p2title: $('#p2title'),
    p2lead: $('#p2lead'),
    p2text: $('#p2text'),
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  uiInit(elements);
  populateCountries();
  showSplashScreen();
  setupReserveButton();
  setupEventListeners();
  setupAccessibility();
  watchForTouch(); // Set up touch detection for hover effects
});

// --- Functions ---
function populateCountries(){
    countries.forEach(c => {
        const o = document.createElement('option');
        o.value = c.name; o.dataset.code = c.code; o.textContent = c.name;
        elements.countrySelect.appendChild(o);
    });
}

function setupEventListeners(){
    elements.countrySelect.addEventListener('change', e => {
        const opt = e.target.selectedOptions[0];
        elements.prefixEl.textContent = opt?.dataset?.code || '+--';
    });

    elements.roleSelect.addEventListener('change', e => {
        if(e.target.value === 'Others') {
            elements.otherRoleWrap.classList.remove('hidden');
            elements.otherRoleInput.focus();
        } else {
            elements.otherRoleWrap.classList.add('hidden');
            elements.otherRoleInput.value = '';
        }
    });

    elements.preForm.addEventListener('submit', handleSubmit);
    elements.skipBtn.addEventListener('click', onSkip);
    elements.solveBtn.addEventListener('click', onSolveClicked);

    elements.closeFinal.addEventListener('click', () => {
        elements.overlay2.classList.remove('visible');
        elements.overlay2.setAttribute('aria-hidden', 'true');
        window.location.href = 'https://cortex-ai-animate-hub.lovable.app/';
    });
}

function watchForTouch() {
  // Add a class to the body on the first touch event
  window.addEventListener('touchstart', function onFirstTouch() {
    document.body.classList.add('has-touch');
    // Remove the event listener so it only runs once
    window.removeEventListener('touchstart', onFirstTouch, false);
  }, { once: true, passive: true });
}

function gatherFormData(){
  const name = elements.nameInput.value.trim();
  const country = elements.countrySelect.value;
  const email = elements.emailInput.value.trim();
  let role = elements.roleSelect.value;
  if (role === 'Others') {
    role = `Others - ${elements.otherRoleInput.value.trim()}`;
  }
  const prefix = elements.prefixEl.textContent || '';
  const phone = prefix + (elements.phoneInput.value.trim() ? (' ' + elements.phoneInput.value.trim()) : '');
  
  return { name, country, email, role, phone };
}

// --- Event Handlers ---
async function handleSubmit(ev){
  ev.preventDefault();

  // Validation
  if (!elements.nameInput.value.trim()) return elements.nameInput.focus();
  if (!elements.countrySelect.value) return elements.countrySelect.focus();
  if (!elements.phoneInput.value.trim() || !/^[\d\s\-\(\)\+]{7,}$/.test(elements.phoneInput.value.trim())) return elements.phoneInput.focus();
  if (!elements.roleSelect.value) return elements.roleSelect.focus();
  if (elements.roleSelect.value === 'Others' && !elements.otherRoleInput.value.trim()) return elements.otherRoleInput.focus();
  if (!elements.emailInput.value.trim() || !/^\S+@\S+\.\S+$/.test(elements.emailInput.value.trim())) return elements.emailInput.focus();

  const bodyObj = gatherFormData();
  await sendLeadsRequest(bodyObj);
  openPopup1();
}

function onSkip(e){
  e.preventDefault();
  hidePopup1();
  showFinalPopup(false);
}

async function onSolveClicked(e){
  e.preventDefault();
  if(elements.solveBtn.disabled) return;

  hidePopup1();

  const formData = gatherFormData();
  if(!formData.email){ alert('Email not found, cannot submit notes.'); return; }

  await sendNotesRequest(formData.email, elements.notesEl.value.trim());
  showFinalPopup(true);
}
