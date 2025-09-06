// Simple localStorage-based feedback store for MVP
const STORAGE_KEY = 'vcc_feedbacks';
const LAST_SUBMISSION_KEY = 'vcc_last_submission';

function loadFeedbacks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.error('Failed to parse feedbacks', e);
    return [];
  }
}

function saveFeedbacks(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function createId() {
  // Simple UUID v4-ish
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function sanitize(text) {
  // Minimal escape for display
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderFeedbackList(containerId, limit = 10) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const items = loadFeedbacks()
    .filter(x => x.visibility === 'public')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

  for (const fb of items) {
    const card = document.createElement('article');
    card.className = 'card';
    const name = sanitize(fb.nickname || '匿名');
    const cohort = fb.cohort ? ` / ${sanitize(fb.cohort)}` : '';
    const stars = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
    const date = new Date(fb.createdAt).toLocaleString();
    const body = sanitize(fb.body).slice(0, 160) + (fb.body.length > 160 ? '…' : '');

    card.innerHTML = `
      <div class="meta">
        <span>${name}${cohort}</span>
        <span class="rating" aria-label="評価">${stars}</span>
        <span>${date}</span>
      </div>
      <p>${body}</p>
    `;
    container.appendChild(card);
  }
}

function setError(field, message) {
  const el = document.querySelector(`.error[data-for="${field}"]`);
  if (el) el.textContent = message || '';
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(el => (el.textContent = ''));
}

function setupFeedbackForm(formId, successId) {
  const form = document.getElementById(formId);
  const success = document.getElementById(successId);
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const fd = new FormData(form);
    const nickname = (fd.get('nickname') || '').toString().trim();
    const cohort = (fd.get('cohort') || '').toString().trim();
    const ratingStr = (fd.get('rating') || '').toString();
    const body = (fd.get('body') || '').toString().trim();
    const visibility = (fd.get('visibility') || '').toString();
    const agree = fd.get('agree') ? true : false;

    let ok = true;
    const rating = Number(ratingStr);
    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError('rating', '1〜5 から選択してください');
      ok = false;
    }
    if (body.length === 0) {
      setError('body', '入力してください');
      ok = false;
    } else if (body.length > 1000) {
      setError('body', '1000文字以内で入力してください');
      ok = false;
    }
    if (!visibility) {
      setError('visibility', '公開可否を選択してください');
      ok = false;
    }
    if (!agree) {
      setError('agree', '同意が必要です');
      ok = false;
    }
    if (!ok) return;

    const item = {
      id: createId(),
      nickname: nickname || null,
      cohort: cohort || null,
      rating,
      body,
      visibility,
      createdAt: new Date().toISOString(),
    };

    const list = loadFeedbacks();
    list.push(item);
    saveFeedbacks(list);

    // Store last submission for immediate viewing on the view page
    try { sessionStorage.setItem(LAST_SUBMISSION_KEY, JSON.stringify(item)); } catch {}

    // Redirect to view page to show the submitted content
    window.location.href = './view.html';
  });
}

// Expose for inline usage
window.renderFeedbackList = renderFeedbackList;
window.setupFeedbackForm = setupFeedbackForm;

function loadLastSubmission() {
  try {
    const raw = sessionStorage.getItem(LAST_SUBMISSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function findById(id) {
  const list = loadFeedbacks();
  return list.find(x => x.id === id) || null;
}

function renderSubmitted(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let item = loadLastSubmission();
  if (!item) {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) item = findById(id);
  }

  container.innerHTML = '';
  if (!item) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = '<p class="muted">表示できる投稿がありません。<a href="./feedback.html">感想を投稿する</a></p>';
    container.appendChild(div);
    return;
  }

  const card = document.createElement('article');
  card.className = 'card';
  const name = sanitize(item.nickname || '匿名');
  const cohort = item.cohort ? ` / ${sanitize(item.cohort)}` : '';
  const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
  const date = new Date(item.createdAt).toLocaleString();
  const vis = item.visibility === 'public' ? '公開' : '非公開';
  const body = sanitize(item.body).replaceAll('\n', '<br/>');

  card.innerHTML = `
    <div class="meta">
      <span>${name}${cohort}</span>
      <span class="rating" aria-label="評価">${stars}</span>
      <span>${date}</span>
      <span>(${vis})</span>
    </div>
    <p>${body}</p>
  `;
  container.appendChild(card);
}

window.renderSubmitted = renderSubmitted;
