(() => {
  'use strict';

  const SUPABASE_URL = 'https://efifbuqctylsujiauabg.supabase.co';
  const PUBLISHABLE_KEY = 'sb_publishable_135w8CznEPWHYOS2SR0QTw_OPvwIIVO';
  const EDITOR_ENDPOINT = `${SUPABASE_URL}/functions/v1/dokohilf-editor`;
  const SESSION_KEY = 'dokohilf-editor-session';

  const state = {
    session: null,
    profile: null,
    guides: [],
    selected: null,
    saving: false,
  };

  const el = {
    loginCard: document.getElementById('loginCard'),
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    loginMessage: document.getElementById('loginMessage'),
    logout: document.getElementById('logoutButton'),
    roleBadge: document.getElementById('roleBadge'),
    restricted: document.getElementById('restrictedCard'),
    shell: document.getElementById('editorShell'),
    guideList: document.getElementById('guideList'),
    guideSearch: document.getElementById('guideSearch'),
    statusFilter: document.getElementById('statusFilter'),
    newGuide: document.getElementById('newGuideButton'),
    empty: document.getElementById('editorEmpty'),
    content: document.getElementById('editorContent'),
    form: document.getElementById('guideForm'),
    guideId: document.getElementById('guideId'),
    guideTitle: document.getElementById('guideTitle'),
    guideSlug: document.getElementById('guideSlug'),
    guideStatus: document.getElementById('guideStatus'),
    reviewInterval: document.getElementById('reviewInterval'),
    aliases: document.getElementById('guideAliases'),
    steps: document.getElementById('stepList'),
    troubleshooting: document.getElementById('troubleshootingJson'),
    changeNote: document.getElementById('changeNote'),
    editorMessage: document.getElementById('editorMessage'),
    versionBadge: document.getElementById('versionBadge'),
    dueBadge: document.getElementById('dueBadge'),
    addStep: document.getElementById('addStepButton'),
    previewButton: document.getElementById('previewButton'),
    historyButton: document.getElementById('historyButton'),
    previewModal: document.getElementById('previewModal'),
    previewContent: document.getElementById('previewContent'),
    historyModal: document.getElementById('historyModal'),
    historyList: document.getElementById('historyList'),
  };

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[char]));
  }

  function roleLabel(role) {
    return ({ staff: 'Mitarbeitende', editor: 'Redaktion', admin: 'Administration' })[role] || 'Keine Rolle';
  }

  function statusLabel(status) {
    return ({ draft: 'Entwurf', reviewed: 'Geprüft', approved: 'Freigegeben', blocked: 'Gesperrt' })[status] || status;
  }

  function formatDate(value) {
    if (!value) return 'Nicht festgelegt';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Nicht festgelegt' : new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium', timeStyle: 'short',
    }).format(date);
  }

  function setMessage(node, text = '', type = '') {
    if (!node) return;
    node.textContent = text;
    node.className = `message ${type}`.trim();
    node.hidden = !text;
  }

  function saveSession(session) {
    state.session = session;
    try {
      if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch { /* Session remains in memory. */ }
  }

  function restoreSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.access_token || !parsed?.refresh_token) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  async function authRequest(path, body) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
      method: 'POST',
      headers: { apikey: PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error_description || payload.msg || 'Anmeldung fehlgeschlagen.');
    return payload;
  }

  async function refreshSession() {
    if (!state.session?.refresh_token) throw new Error('Sitzung abgelaufen.');
    const payload = await authRequest('token?grant_type=refresh_token', { refresh_token: state.session.refresh_token });
    saveSession(payload);
    return payload;
  }

  async function editorFetch(action, init = {}, retry = true) {
    if (!state.session?.access_token) throw new Error('Anmeldung erforderlich.');
    const separator = action.includes('?') ? '&' : '?';
    const response = await fetch(`${EDITOR_ENDPOINT}${separator}${action}`, {
      ...init,
      headers: {
        apikey: PUBLISHABLE_KEY,
        Authorization: `Bearer ${state.session.access_token}`,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
      cache: 'no-store',
    });

    if (response.status === 401 && retry && state.session?.refresh_token) {
      await refreshSession();
      return editorFetch(action, init, false);
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Die Redaktionsfunktion ist gerade nicht erreichbar.');
    return payload;
  }

  function applyRoleUi() {
    const role = state.profile?.role;
    const canApprove = state.profile?.canApprove === true;
    el.roleBadge.textContent = roleLabel(role);
    el.roleBadge.hidden = !role;
    el.logout.hidden = !state.session;
    document.querySelectorAll('[data-admin-only]').forEach(node => {
      node.hidden = !canApprove;
      if ('disabled' in node) node.disabled = !canApprove;
    });
  }

  function showLogin() {
    state.profile = null;
    state.guides = [];
    state.selected = null;
    el.loginCard.hidden = false;
    el.restricted.hidden = true;
    el.shell.hidden = true;
    el.logout.hidden = true;
    el.roleBadge.hidden = true;
  }

  function showRestricted() {
    el.loginCard.hidden = true;
    el.restricted.hidden = false;
    el.shell.hidden = true;
    applyRoleUi();
  }

  function showEditor() {
    el.loginCard.hidden = true;
    el.restricted.hidden = true;
    el.shell.hidden = false;
    applyRoleUi();
  }

  async function signIn(email, password) {
    const payload = await authRequest('token?grant_type=password', { email, password });
    saveSession(payload);
    await initializeAuthenticated();
  }

  async function signOut() {
    const token = state.session?.access_token;
    if (token) {
      fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    saveSession(null);
    showLogin();
  }

  async function initializeAuthenticated() {
    try {
      state.profile = await editorFetch('action=profile');
      if (!state.profile.canEdit) return showRestricted();
      showEditor();
      await loadGuides();
    } catch (error) {
      saveSession(null);
      showLogin();
      setMessage(el.loginMessage, error.message, 'error');
    }
  }

  async function loadGuides({ keepSelection = true } = {}) {
    const payload = await editorFetch('action=list');
    state.guides = Array.isArray(payload.guides) ? payload.guides : [];
    state.profile = { ...state.profile, role: payload.role, canApprove: payload.canApprove };
    applyRoleUi();
    renderGuideList();
    if (keepSelection && state.selected?.id) {
      const fresh = state.guides.find(guide => guide.id === state.selected.id);
      if (fresh) selectGuide(fresh);
    }
  }

  function filteredGuides() {
    const query = el.guideSearch.value.trim().toLowerCase();
    const filter = el.statusFilter.value;
    return state.guides.filter(guide => {
      const matchesText = !query || [guide.title, guide.slug, ...(guide.aliases || [])]
        .join(' ').toLowerCase().includes(query);
      const matchesStatus = filter === 'all'
        || (filter === 'overdue' ? guide.is_overdue : guide.status === filter);
      return matchesText && matchesStatus;
    });
  }

  function renderGuideList() {
    const guides = filteredGuides();
    if (!guides.length) {
      el.guideList.innerHTML = '<p class="message">Keine passenden Anleitungen gefunden.</p>';
      return;
    }
    el.guideList.innerHTML = guides.map(guide => `
      <button type="button" data-guide-id="${escapeHtml(guide.id)}" aria-current="${state.selected?.id === guide.id}">
        <strong>${escapeHtml(guide.title)}</strong>
        <small><span class="dot ${escapeHtml(guide.status)}"></span>${escapeHtml(statusLabel(guide.status))} · Version ${Number(guide.version) || 1}${guide.is_overdue ? ' · <span class="overdue">Prüfung überfällig</span>' : ''}</small>
      </button>
    `).join('');
  }

  function createStep(step = {}, index = 0) {
    const card = document.createElement('article');
    card.className = 'step-card';
    card.innerHTML = `
      <header><strong>Schritt ${index + 1}</strong><button class="remove-step" type="button" data-remove-step>Entfernen</button></header>
      <div class="field"><label>Bedienungsschritt</label><textarea data-step-text maxlength="500" required>${escapeHtml(step.text || '')}</textarea></div>
      <div class="field"><label>Kontrollfrage</label><input data-step-check maxlength="220" value="${escapeHtml(step.check || '')}" placeholder="Bist du dort?"></div>
      <div class="field"><label>Hilfe, wenn es nicht gefunden wird</label><textarea data-step-stuck maxlength="500">${escapeHtml(step.stuck || '')}</textarea></div>
    `;
    return card;
  }

  function renumberSteps() {
    [...el.steps.children].forEach((card, index) => {
      const title = card.querySelector('header strong');
      if (title) title.textContent = `Schritt ${index + 1}`;
      const remove = card.querySelector('[data-remove-step]');
      if (remove) remove.disabled = el.steps.children.length <= 1;
    });
  }

  function renderSteps(steps = []) {
    el.steps.innerHTML = '';
    const rows = steps.length ? steps : [{ text: '', check: 'Bist du dort?' }];
    rows.forEach((step, index) => el.steps.append(createStep(step, index)));
    renumberSteps();
  }

  function selectGuide(guide) {
    state.selected = guide;
    el.empty.hidden = true;
    el.content.hidden = false;
    el.guideId.value = guide.id || '';
    el.guideTitle.value = guide.title || '';
    el.guideSlug.value = guide.slug || '';
    el.guideSlug.readOnly = Boolean(guide.id);
    el.guideStatus.value = guide.status || 'draft';
    el.reviewInterval.value = guide.review_interval_days || 180;
    el.aliases.value = (guide.aliases || []).join('\n');
    el.troubleshooting.value = JSON.stringify(guide.troubleshooting || {}, null, 2);
    el.changeNote.value = '';
    el.versionBadge.textContent = `Version ${guide.version || 1}`;
    el.dueBadge.textContent = guide.review_due_at
      ? `${guide.is_overdue ? 'Überfällig seit' : 'Prüfung bis'} ${formatDate(guide.review_due_at)}`
      : 'Noch kein Prüfdatum';
    el.dueBadge.classList.toggle('overdue', Boolean(guide.is_overdue));
    el.historyButton.disabled = !guide.id;
    renderSteps(guide.steps || []);
    renderGuideList();
    setMessage(el.editorMessage);
  }

  function newGuide() {
    selectGuide({
      id: '', slug: '', title: '', aliases: [], steps: [{ text: '', check: 'Bist du dort?' }],
      troubleshooting: {}, status: 'draft', version: 1, review_interval_days: 180,
    });
    el.guideTitle.focus();
  }

  function collectSteps() {
    return [...el.steps.querySelectorAll('.step-card')].map(card => ({
      text: card.querySelector('[data-step-text]')?.value.trim() || '',
      check: card.querySelector('[data-step-check]')?.value.trim() || '',
      stuck: card.querySelector('[data-step-stuck]')?.value.trim() || '',
    })).filter(step => step.text);
  }

  function parseTroubleshooting() {
    const raw = el.troubleshooting.value.trim();
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Die Fehlerhilfe muss ein JSON-Objekt sein.');
    return parsed;
  }

  function collectGuide(targetStatus) {
    return {
      id: el.guideId.value || undefined,
      slug: el.guideSlug.value.trim(),
      title: el.guideTitle.value.trim(),
      aliases: el.aliases.value.split(/\n+/).map(value => value.trim()).filter(Boolean),
      steps: collectSteps(),
      troubleshooting: parseTroubleshooting(),
      status: targetStatus || el.guideStatus.value,
      reviewIntervalDays: Number(el.reviewInterval.value) || 180,
      changeNote: el.changeNote.value.trim(),
    };
  }

  async function saveGuide(targetStatus) {
    if (state.saving) return;
    state.saving = true;
    el.form.querySelectorAll('button').forEach(button => button.disabled = true);
    setMessage(el.editorMessage, 'Änderung wird geprüft und gespeichert …');
    try {
      const guide = collectGuide(targetStatus);
      const payload = await editorFetch('action=save', {
        method: 'POST', body: JSON.stringify({ guide }),
      });
      setMessage(el.editorMessage, 'Die Anleitung wurde gespeichert.', 'success');
      state.selected = payload.guide;
      await loadGuides({ keepSelection: true });
    } catch (error) {
      setMessage(el.editorMessage, error.message, 'error');
    } finally {
      state.saving = false;
      el.form.querySelectorAll('button').forEach(button => {
        const adminOnly = button.hasAttribute('data-admin-only');
        button.disabled = adminOnly && !state.profile?.canApprove;
      });
      renumberSteps();
    }
  }

  function showPreview() {
    let guide;
    try { guide = collectGuide(el.guideStatus.value); }
    catch (error) { return setMessage(el.editorMessage, error.message, 'error'); }
    el.previewContent.innerHTML = `
      <div class="preview-head"><strong>${escapeHtml(guide.title || 'Unbenannte Anleitung')}</strong><small>Beispielperson A · reine Fantasie-Vorschau · ${escapeHtml(statusLabel(guide.status))}</small></div>
      ${guide.steps.map((step, index) => `<div class="preview-step"><strong>Schritt ${index + 1}</strong><p>${escapeHtml(step.text)}</p>${step.check ? `<p><em>${escapeHtml(step.check)}</em></p>` : ''}</div>`).join('')}
    `;
    el.previewModal.hidden = false;
  }

  async function showHistory() {
    if (!state.selected?.id) return;
    el.historyModal.hidden = false;
    el.historyList.innerHTML = '<p class="message">Versionsverlauf wird geladen …</p>';
    try {
      const payload = await editorFetch(`action=history&guideId=${encodeURIComponent(state.selected.id)}`);
      const history = Array.isArray(payload.history) ? payload.history : [];
      el.historyList.innerHTML = history.length ? history.map(item => `
        <article class="history-item">
          <header><strong>Version ${Number(item.version) || 1} · ${escapeHtml(statusLabel(item.status))}</strong><span>${escapeHtml(formatDate(item.archived_at))}</span></header>
          <p>${escapeHtml(item.change_note || 'Keine Änderungsbegründung hinterlegt.')}</p>
        </article>
      `).join('') : '<p class="message">Für diese Anleitung gibt es noch keine ältere Version.</p>';
    } catch (error) {
      el.historyList.innerHTML = `<p class="message error">${escapeHtml(error.message)}</p>`;
    }
  }

  el.loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    setMessage(el.loginMessage, 'Anmeldung wird geprüft …');
    const submit = el.loginForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      await signIn(el.loginEmail.value.trim(), el.loginPassword.value);
      el.loginPassword.value = '';
      setMessage(el.loginMessage);
    } catch (error) {
      setMessage(el.loginMessage, error.message, 'error');
    } finally {
      submit.disabled = false;
    }
  });

  el.logout.addEventListener('click', signOut);
  document.addEventListener('click', event => {
    if (event.target.closest('[data-action="logout"]')) signOut();
    const guideButton = event.target.closest('[data-guide-id]');
    if (guideButton) {
      const guide = state.guides.find(item => item.id === guideButton.dataset.guideId);
      if (guide) selectGuide(guide);
    }
    const removeButton = event.target.closest('[data-remove-step]');
    if (removeButton) {
      removeButton.closest('.step-card')?.remove();
      renumberSteps();
    }
    if (event.target.closest('[data-close-modal]')) {
      el.previewModal.hidden = true;
      el.historyModal.hidden = true;
    }
    if (event.target === el.previewModal || event.target === el.historyModal) event.target.hidden = true;
  });

  el.newGuide.addEventListener('click', newGuide);
  el.addStep.addEventListener('click', () => {
    el.steps.append(createStep({ text: '', check: 'Bist du dort?' }, el.steps.children.length));
    renumberSteps();
  });
  el.previewButton.addEventListener('click', showPreview);
  el.historyButton.addEventListener('click', showHistory);
  el.guideSearch.addEventListener('input', renderGuideList);
  el.statusFilter.addEventListener('change', renderGuideList);
  el.form.addEventListener('submit', event => {
    event.preventDefault();
    const targetStatus = event.submitter?.dataset?.saveStatus || el.guideStatus.value;
    saveGuide(targetStatus);
  });

  const restored = restoreSession();
  if (restored) {
    state.session = restored;
    initializeAuthenticated();
  } else {
    showLogin();
  }

  window.DokoHilfEditor = {
    signOut,
    getState: () => ({
      role: state.profile?.role || null,
      guideCount: state.guides.length,
      selectedGuide: state.selected?.slug || null,
      authenticated: Boolean(state.session),
    }),
  };
})();
