// ============================================================
// NEURORESET — Logique principale de l'app
// ============================================================

const QUOTES = [
  "La neuroplasticité est silencieuse. Elle écoute tes répétitions.",
  "Tu n'attires pas ce que tu veux. Tu attires ce que tu es.",
  "Ton cœur parle, ton cerveau écoute.",
  "Visualiser, c'est déjà commencer à devenir.",
  "85% de toi agit sans demander la permission.",
  "Ce que tu cherches te cherche aussi.",
  "Chaque méditation plante un neurone.",
  "Le présent est le seul endroit où tu peux te recâbler.",
  "La cohérence du cœur précède la clarté de l'esprit.",
  "Tu ne changes pas par la force. Tu changes par la fréquence.",
  "Le corps garde le score. La méditation l'efface.",
  "Tu ne vois pas la réalité. Tu vois ton identité projetée."
];

let currentUser = null;
let activeTimer = null;

// ============================================================
// INITIALISATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  currentUser = getCurrentUser();

  if (currentUser) {
    showApp();
  } else {
    showAuth();
  }

  setupAuthHandlers();
  setupNavigation();
  setupJournalForm();
});

function showAuth() {
  document.getElementById('auth-screen').style.display = 'grid';
  document.getElementById('app').classList.remove('active');
}

function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').classList.add('active');
  document.getElementById('user-tag').textContent = '@' + currentUser.username;

  renderTodayPage();
  renderDashboard();
  renderPrinciplesPage();
  renderJournalPage();
}

// ============================================================
// AUTH HANDLERS
// ============================================================
function setupAuthHandlers() {
  const form = document.getElementById('auth-form');
  const toggle = document.getElementById('auth-toggle-btn');
  const submitBtn = document.getElementById('auth-submit');
  const titleEl = document.getElementById('auth-title');
  const subtitleEl = document.getElementById('auth-subtitle');
  const toggleText = document.getElementById('auth-toggle-text');

  let mode = 'login';

  toggle.addEventListener('click', () => {
    mode = mode === 'login' ? 'signup' : 'login';
    if (mode === 'signup') {
      titleEl.innerHTML = 'neuro<span>·</span>reset';
      subtitleEl.textContent = 'Crée ton compte pour commencer la pratique.';
      submitBtn.textContent = 'Créer le compte';
      toggleText.innerHTML = 'Déjà inscrit ? <button type="button" id="auth-toggle-btn" class="btn-link">Connexion</button>';
    } else {
      titleEl.innerHTML = 'neuro<span>·</span>reset';
      subtitleEl.textContent = 'Reprends ta pratique quotidienne.';
      submitBtn.textContent = 'Se connecter';
      toggleText.innerHTML = 'Pas encore de compte ? <button type="button" id="auth-toggle-btn" class="btn-link">S\'inscrire</button>';
    }
    // Re-attacher au nouveau bouton
    document.getElementById('auth-toggle-btn').addEventListener('click', () => toggle.click());
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errEl = document.getElementById('auth-error');
    errEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = mode === 'login' ? 'Connexion…' : 'Création…';

    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await signup(username, password);
      }
      currentUser = getCurrentUser();
      showApp();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = mode === 'login' ? 'Se connecter' : 'Créer le compte';
    }
  });
}

// ============================================================
// NAVIGATION
// ============================================================
function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('page-' + page).classList.add('active');

      if (page === 'dashboard') renderDashboard();
      if (page === 'today') renderTodayPage();
      if (page === 'journal') renderJournalPage();
    });
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Se déconnecter ?')) logout();
  });
}

// ============================================================
// PAGE : AUJOURD'HUI
// ============================================================
async function renderTodayPage() {
  // Date
  const dateEl = document.getElementById('today-date');
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // Citation du jour (basée sur le jour de l'année)
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  document.getElementById('today-quote').textContent = '« ' + QUOTES[dayOfYear % QUOTES.length] + ' »';

  // Check-in actuel
  let checkin = null;
  try {
    checkin = await getTodayCheckin(currentUser.id);
  } catch (e) {
    console.error('Erreur check-in', e);
  }

  const done = (checkin?.principles_completed || []).length;
  const total = PRINCIPLES.length;
  const pct = Math.round((done / total) * 100);
  document.getElementById('today-progress-count').textContent = `${done} / ${total} pratiqués`;
  document.getElementById('today-progress-fill').style.width = pct + '%';

  // Mood scales
  renderMoodScale('mood-before', checkin?.mood_before, 'mood_before');
  renderMoodScale('mood-after',  checkin?.mood_after,  'mood_after');

  // Grille des principes
  const grid = document.getElementById('principles-grid');
  grid.innerHTML = '';
  const doneSet = new Set(checkin?.principles_completed || []);

  PRINCIPLES.forEach(p => {
    const card = document.createElement('div');
    card.className = 'principle-card' + (doneSet.has(p.id) ? ' done' : '');
    card.innerHTML = `
      <div class="principle-num">PRINCIPE ${String(p.id).padStart(2, '0')}</div>
      <div class="principle-glyph">${p.glyph}</div>
      <div class="principle-name">${p.name}</div>
      <div class="principle-tagline">${p.tagline}</div>
      <div class="principle-meta">
        <span>${p.duration} min</span>
        <span>${p.hasTimer ? '◷ Guidé' : 'Pratique libre'}</span>
      </div>
    `;
    card.addEventListener('click', () => openPrincipleModal(p, doneSet.has(p.id)));
    grid.appendChild(card);
  });
}

function renderMoodScale(elId, selected, field) {
  const el = document.getElementById(elId);
  el.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const dot = document.createElement('button');
    dot.className = 'mood-dot' + (selected === i ? ' selected' : '');
    dot.textContent = i;
    dot.addEventListener('click', async () => {
      try {
        await saveMood(currentUser.id, field, i);
        renderTodayPage();
      } catch (e) {
        alert('Erreur : ' + e.message);
      }
    });
    el.appendChild(dot);
  }
}

// ============================================================
// MODAL PRINCIPE
// ============================================================
function openPrincipleModal(principle, isDone) {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal');

  modal.innerHTML = `
    <button class="modal-close" id="modal-close-btn">×</button>
    <div class="modal-header">
      <div class="principle-num">PRINCIPE ${String(principle.id).padStart(2, '0')}</div>
      <div class="principle-glyph">${principle.glyph}</div>
      <h2>${principle.name}</h2>
      <p class="principle-tagline" style="font-size:1.05rem;color:var(--ink-soft);">${principle.tagline}</p>
    </div>
    <div class="modal-body">
      <div class="modal-section">
        <h4>Comprendre</h4>
        <p>${principle.description}</p>
      </div>
      <div class="modal-section">
        <h4>${principle.practice.title}</h4>
        <ol class="practice-list">
          ${principle.practice.steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
      </div>
      ${principle.hasTimer ? `
        <div class="modal-section" id="timer-section">
          <h4>Session guidée — ${principle.duration} min</h4>
          <div class="timer-display">
            ${principle.timerType === 'breathing' || principle.timerType === 'coherence' ? '<div class="breath-orb" id="breath-orb"></div>' : ''}
            <div class="timer-circle">
              <svg class="timer-svg" viewBox="0 0 100 100">
                <circle class="bg-ring" cx="50" cy="50" r="46"></circle>
                <circle class="progress-ring" id="timer-ring" cx="50" cy="50" r="46"
                        stroke-dasharray="289" stroke-dashoffset="0"></circle>
              </svg>
              <div class="timer-text">
                <div class="timer-time" id="timer-time">${String(principle.duration).padStart(2, '0')}:00</div>
                <div class="timer-phase" id="timer-phase">Prêt</div>
              </div>
            </div>
            <button class="btn" id="timer-start-btn">Démarrer la session</button>
          </div>
        </div>
      ` : ''}
    </div>
    <div class="modal-footer">
      <button class="btn ${isDone ? 'btn-ghost' : ''}" id="toggle-done-btn">
        ${isDone ? 'Marquer comme non fait' : '✓ Marquer comme pratiqué'}
      </button>
      <button class="btn btn-ghost" id="open-journal-btn">Écrire dans le journal</button>
    </div>
  `;

  overlay.classList.add('active');

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  document.getElementById('toggle-done-btn').addEventListener('click', async () => {
    try {
      await togglePrincipleDone(currentUser.id, principle.id);
      closeModal();
      renderTodayPage();
      renderDashboard();
    } catch (e) {
      alert('Erreur : ' + e.message);
    }
  });

  document.getElementById('open-journal-btn').addEventListener('click', () => {
    closeModal();
    document.querySelector('[data-page="journal"]').click();
    document.getElementById('journal-principle').value = principle.id;
    document.getElementById('journal-content').focus();
  });

  if (principle.hasTimer) {
    document.getElementById('timer-start-btn').addEventListener('click', () => startTimer(principle));
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  if (activeTimer) {
    clearInterval(activeTimer.interval);
    if (activeTimer.breathInterval) clearInterval(activeTimer.breathInterval);
    activeTimer = null;
  }
}

// ============================================================
// TIMER
// ============================================================
function startTimer(principle) {
  const totalSec = principle.duration * 60;
  let remaining = totalSec;
  const ringEl  = document.getElementById('timer-ring');
  const timeEl  = document.getElementById('timer-time');
  const phaseEl = document.getElementById('timer-phase');
  const orbEl   = document.getElementById('breath-orb');
  const startBtn = document.getElementById('timer-start-btn');
  startBtn.textContent = 'Arrêter';
  startBtn.classList.add('btn-ghost');

  const circumference = 289;
  let breathCycle = 0;

  function updateBreath() {
    if (!orbEl) return;
    if (principle.timerType === 'breathing') {
      // 4-7-8 : inspire 4s, retiens 7s, expire 8s
      const phase = breathCycle % 19;
      if (phase < 4) {
        orbEl.className = 'breath-orb inhale';
        phaseEl.textContent = 'Inspire';
      } else if (phase < 11) {
        orbEl.className = 'breath-orb hold';
        phaseEl.textContent = 'Retiens';
      } else {
        orbEl.className = 'breath-orb exhale';
        phaseEl.textContent = 'Expire';
      }
    } else if (principle.timerType === 'coherence') {
      // 5-5 : inspire 5s, expire 5s
      const phase = breathCycle % 10;
      if (phase < 5) {
        orbEl.className = 'breath-orb inhale';
        phaseEl.textContent = 'Inspire';
      } else {
        orbEl.className = 'breath-orb exhale';
        phaseEl.textContent = 'Expire';
      }
    }
    breathCycle++;
  }

  if (principle.timerType === 'breathing' || principle.timerType === 'coherence') {
    updateBreath();
  } else if (principle.timerType === 'meditation') {
    phaseEl.textContent = 'Observe';
  } else if (principle.timerType === 'visualization') {
    phaseEl.textContent = 'Visualise';
  }

  const interval = setInterval(() => {
    remaining--;
    if (remaining < 0) {
      finishSession();
      return;
    }
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    timeEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    const offset = circumference - (circumference * (totalSec - remaining)) / totalSec;
    ringEl.style.strokeDashoffset = offset;
  }, 1000);

  const breathInterval = (principle.timerType === 'breathing' || principle.timerType === 'coherence')
    ? setInterval(updateBreath, 1000)
    : null;

  activeTimer = { interval, breathInterval, principle, startTime: Date.now() };

  // Cliquer "Arrêter" stoppe la session
  startBtn.onclick = () => {
    const elapsed = Math.round((Date.now() - activeTimer.startTime) / 1000);
    finishSession(elapsed);
  };

  async function finishSession(actualSec) {
    clearInterval(interval);
    if (breathInterval) clearInterval(breathInterval);
    const durationSec = actualSec ?? (totalSec - Math.max(0, remaining));
    if (durationSec > 10) {
      try {
        await logSession(currentUser.id, principle.timerType, durationSec, principle.id);
        // Auto-marquer comme fait si la session dure > 50% du temps prévu
        if (durationSec >= totalSec * 0.5) {
          const checkin = await getTodayCheckin(currentUser.id);
          const completed = checkin?.principles_completed || [];
          if (!completed.includes(principle.id)) {
            await togglePrincipleDone(currentUser.id, principle.id);
          }
        }
      } catch (e) {
        console.error('Erreur log session', e);
      }
    }
    phaseEl.textContent = 'Terminé ◉';
    timeEl.textContent = '✓';
    startBtn.textContent = 'Fermer';
    startBtn.onclick = () => { closeModal(); renderTodayPage(); renderDashboard(); };
    activeTimer = null;
  }
}

// ============================================================
// PAGE : DASHBOARD
// ============================================================
async function renderDashboard() {
  const container = document.getElementById('dashboard-content');
  container.innerHTML = '<div class="loading">Chargement</div>';

  try {
    const [history, sessions] = await Promise.all([
      getCheckinHistory(currentUser.id, 90),
      getAllSessions(currentUser.id, 90)
    ]);

    const streaks = calculateStreak(history);

    // Stats globales
    const totalPractices = history.reduce((sum, h) => sum + (h.principles_completed?.length || 0), 0);
    const totalMeditationMin = history.reduce((sum, h) => sum + (h.meditation_minutes || 0), 0);
    const totalVisualizationMin = history.reduce((sum, h) => sum + (h.visualization_minutes || 0), 0);
    const activeDays = history.filter(h => (h.principles_completed?.length || 0) > 0).length;

    // Mood moyen (différence avant/après)
    const moodDiffs = history
      .filter(h => h.mood_before && h.mood_after)
      .map(h => h.mood_after - h.mood_before);
    const avgMoodDiff = moodDiffs.length
      ? (moodDiffs.reduce((a, b) => a + b, 0) / moodDiffs.length).toFixed(1)
      : '—';

    // Compte par principe
    const principleCounts = Array(8).fill(0);
    history.forEach(h => {
      (h.principles_completed || []).forEach(id => principleCounts[id]++);
    });

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Streak actuel</div>
          <div class="stat-value">${streaks.current}<span class="stat-suffix">jours</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Record</div>
          <div class="stat-value">${streaks.longest}<span class="stat-suffix">jours</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Jours actifs</div>
          <div class="stat-value">${activeDays}<span class="stat-suffix">/ 90</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Pratiques totales</div>
          <div class="stat-value">${totalPractices}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Méditation</div>
          <div class="stat-value">${totalMeditationMin}<span class="stat-suffix">min</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Visualisation</div>
          <div class="stat-value">${totalVisualizationMin}<span class="stat-suffix">min</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Δ Humeur</div>
          <div class="stat-value">${avgMoodDiff !== '—' && avgMoodDiff >= 0 ? '+' : ''}${avgMoodDiff}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Sessions</div>
          <div class="stat-value">${sessions.length}</div>
        </div>
      </div>

      <div class="dashboard-section">
        <h2>Les 90 derniers jours</h2>
        <div class="dashboard-grid">
          <div class="panel">
            <h3>Constellation de pratique</h3>
            <div id="heatmap" class="heatmap"></div>
            <div style="display:flex;justify-content:space-between;margin-top:1rem;font-size:0.75rem;color:var(--ink-mute);font-family:'JetBrains Mono',monospace;">
              <span>il y a 90 jours</span>
              <span>aujourd'hui</span>
            </div>
          </div>
          <div class="panel">
            <h3>Répartition par principe</h3>
            <div class="principle-bars" id="principle-bars"></div>
          </div>
        </div>
      </div>
    `;

    renderHeatmap(history);
    renderPrincipleBars(principleCounts);
  } catch (e) {
    container.innerHTML = `<div class="empty"><div class="glyph">⚠</div>Erreur de chargement : ${e.message}</div>`;
  }
}

function renderHeatmap(history) {
  const container = document.getElementById('heatmap');
  const byDate = {};
  history.forEach(h => { byDate[h.date] = h.principles_completed?.length || 0; });

  const days = 90;
  const today = new Date();
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const count = byDate[ds] || 0;
    let level = 0;
    if (count >= 6) level = 5;
    else if (count >= 4) level = 4;
    else if (count >= 3) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;
    cells.push(`<div class="heatmap-cell" data-level="${level}" title="${ds} — ${count} pratique${count > 1 ? 's' : ''}"></div>`);
  }
  container.innerHTML = cells.join('');
}

function renderPrincipleBars(counts) {
  const container = document.getElementById('principle-bars');
  const max = Math.max(...counts.slice(1), 1);
  container.innerHTML = PRINCIPLES.map(p => {
    const c = counts[p.id];
    const pct = (c / max) * 100;
    return `
      <div class="bar-row">
        <span class="bar-glyph">${p.glyph}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%"></div>
        </div>
        <span class="bar-count">${c}</span>
      </div>
    `;
  }).join('');
}

// ============================================================
// PAGE : LES PRINCIPES (info)
// ============================================================
function renderPrinciplesPage() {
  const container = document.getElementById('principles-detail');
  container.innerHTML = PRINCIPLES.map(p => `
    <div class="principle-detail-card">
      <div style="display:flex;gap:1.25rem;align-items:flex-start;">
        <div class="principle-glyph" style="margin:0;">${p.glyph}</div>
        <div style="flex:1;">
          <div class="principle-num" style="margin-bottom:0.4rem;">PRINCIPE ${String(p.id).padStart(2, '0')}</div>
          <h3 style="font-style:italic;font-size:1.5rem;">${p.name}</h3>
          <p class="principle-tagline" style="margin-top:0.25rem;">${p.tagline}</p>
        </div>
      </div>
      <p class="description">${p.description}</p>
    </div>
  `).join('');
}

// ============================================================
// PAGE : JOURNAL
// ============================================================
function setupJournalForm() {
  // Remplir le dropdown des principes
  const select = document.getElementById('journal-principle');
  select.innerHTML = '<option value="">— Choisis un principe —</option>' +
    PRINCIPLES.map(p => `<option value="${p.id}">${p.glyph} ${p.name}</option>`).join('');

  document.getElementById('journal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const principleId = parseInt(select.value);
    const content = document.getElementById('journal-content').value.trim();
    if (!principleId || !content) { alert('Choisis un principe et écris quelque chose.'); return; }
    try {
      await saveJournalEntry(currentUser.id, principleId, content);
      document.getElementById('journal-content').value = '';
      select.value = '';
      renderJournalPage();
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  });

  document.getElementById('journal-filter').addEventListener('change', renderJournalPage);
}

async function renderJournalPage() {
  const filterEl = document.getElementById('journal-filter');
  // Remplir filter une seule fois
  if (filterEl.options.length <= 1) {
    filterEl.innerHTML = '<option value="">Tous les principes</option>' +
      PRINCIPLES.map(p => `<option value="${p.id}">${p.glyph} ${p.name}</option>`).join('');
  }

  const principleId = filterEl.value ? parseInt(filterEl.value) : null;
  const listEl = document.getElementById('journal-list');
  listEl.innerHTML = '<div class="loading">Chargement</div>';

  try {
    const entries = await getJournalEntries(currentUser.id, principleId, 50);
    if (entries.length === 0) {
      listEl.innerHTML = `<div class="empty"><div class="glyph">∅</div>Aucune note pour l'instant.</div>`;
      return;
    }
    listEl.innerHTML = entries.map(entry => {
      const p = getPrinciple(entry.principle_id);
      const date = new Date(entry.created_at).toLocaleString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      return `
        <div class="journal-entry">
          <div class="journal-entry-meta">
            <span class="journal-entry-principle">${p.glyph} ${p.name}</span>
            <span>${date}</span>
          </div>
          <div class="journal-entry-content">${escapeHtml(entry.content)}</div>
        </div>
      `;
    }).join('');
  } catch (e) {
    listEl.innerHTML = `<div class="empty"><div class="glyph">⚠</div>Erreur : ${e.message}</div>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
