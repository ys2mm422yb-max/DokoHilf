(() => {
  'use strict';

  if (window.__DOKOHILF_FEEDBACK_V49__) return;
  window.__DOKOHILF_FEEDBACK_V49__ = true;

  const ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-feedback';
  const REVISION = '20260813-feedback-v49-1';
  const CATEGORIES = Object.freeze([
    ['fehler', 'Fehler'],
    ['fehlende-information', 'Fehlende Information'],
    ['falsche-information', 'Falsche Information'],
    ['bedienung-darstellung', 'Bedienung oder Darstellung'],
    ['sonstiger-hinweis', 'Sonstiger Hinweis'],
  ]);

  function buildId() {
    return document.querySelector('meta[name="dokohilf-build"]')?.getAttribute('content')
      || document.getElementById('appShell')?.dataset.buildId
      || '';
  }

  function currentGuideContext() {
    const guide = window.DokoHilfGuideProgress?.getCurrentGuide?.();
    return {
      buildId: buildId(),
      guideSlug: guide?.guideSlug || null,
      guideStep: Number.isInteger(Number(guide?.guideStep)) ? Number(guide.guideStep) : null,
    };
  }

  function payloadFromForm(form) {
    const data = new FormData(form);
    const includeContext = data.get('includeContext') === 'on';
    return {
      category: String(data.get('category') || ''),
      description: String(data.get('description') || '').trim(),
      includeContext,
      context: includeContext ? currentGuideContext() : null,
      website: String(data.get('website') || ''),
    };
  }

  function installStyles() {
    if (document.getElementById('dokohilfFeedbackV49Styles')) return;
    const style = document.createElement('style');
    style.id = 'dokohilfFeedbackV49Styles';
    style.textContent = `
      .feedback-v49-entry{margin:24px auto 8px;max-width:760px;padding:15px 17px;border:1px solid rgba(17,82,67,.12);border-radius:18px;background:rgba(255,255,255,.52);text-align:center;color:#49665e}
      .feedback-v49-entry p{margin:0 0 10px;font-size:12px;line-height:1.45}
      .feedback-v49-entry button{min-height:38px;padding:0 14px;border:1px solid rgba(13,109,82,.18);border-radius:12px;background:#fff;color:#0d6d52;font:800 12px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 5px 16px rgba(7,78,59,.08)}
      .feedback-v49-backdrop[hidden]{display:none!important}
      .feedback-v49-backdrop{position:fixed;inset:0;z-index:1200;display:grid;place-items:center;padding:18px;background:rgba(3,18,14,.58);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}
      .feedback-v49-dialog{width:min(560px,100%);max-height:min(760px,calc(100dvh - 36px));overflow:auto;border-radius:24px;background:#fff;box-shadow:0 30px 90px rgba(0,0,0,.28);padding:22px;color:#163c32}
      .feedback-v49-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}
      .feedback-v49-head h2{margin:0;font-size:22px;line-height:1.15}.feedback-v49-head p{margin:5px 0 0;color:#61776f;font-size:13px;line-height:1.4}
      .feedback-v49-close{width:38px;height:38px;flex:0 0 38px;border:0;border-radius:12px;background:#eef5f2;color:#23594a;font-size:22px}
      .feedback-v49-form{display:grid;gap:14px}.feedback-v49-field{display:grid;gap:7px}.feedback-v49-field>span{font-size:13px;font-weight:850;color:#234d42}
      .feedback-v49-field select,.feedback-v49-field textarea{width:100%;box-sizing:border-box;border:1px solid rgba(23,83,67,.22);border-radius:14px;background:#fff;color:#183d33;font:500 15px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;outline:none}
      .feedback-v49-field select{height:46px;padding:0 12px}.feedback-v49-field textarea{min-height:118px;resize:vertical;padding:12px}
      .feedback-v49-field select:focus,.feedback-v49-field textarea:focus{border-color:#138b6c;box-shadow:0 0 0 3px rgba(19,139,108,.11)}
      .feedback-v49-switch{display:flex;gap:10px;align-items:flex-start;padding:12px 13px;border-radius:14px;background:#f3f8f6}.feedback-v49-switch input{margin-top:3px;accent-color:#0d7b5f}.feedback-v49-switch strong{display:block;font-size:13px}.feedback-v49-switch small{display:block;margin-top:2px;color:#667d75;font-size:11px;line-height:1.35}
      .feedback-v49-warning{padding:11px 12px;border-radius:13px;background:#fff5e8;color:#75420d;font-size:12px;line-height:1.45}.feedback-v49-warning strong{font-weight:900}
      .feedback-v49-actions{display:flex;gap:9px;justify-content:flex-end}.feedback-v49-actions button{min-height:44px;padding:0 15px;border-radius:13px;font-weight:850}.feedback-v49-cancel{border:1px solid rgba(20,77,62,.16);background:#fff;color:#375f54}.feedback-v49-submit{border:0;background:#0d7b5f;color:#fff;box-shadow:0 8px 22px rgba(13,123,95,.22)}.feedback-v49-submit:disabled{opacity:.55}
      .feedback-v49-status{min-height:18px;margin:0;color:#5c746c;font-size:12px;line-height:1.4}.feedback-v49-success{padding:16px;border-radius:16px;background:#eef8f4;text-align:center}.feedback-v49-success strong{display:block;font-size:16px;color:#17654f}.feedback-v49-number{display:inline-block;margin-top:9px;padding:8px 11px;border-radius:10px;background:#fff;border:1px solid rgba(17,95,73,.15);font:900 14px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#135d49;user-select:all}
      .feedback-v49-honeypot{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}
      @media(max-width:600px){.feedback-v49-backdrop{align-items:end;padding:0}.feedback-v49-dialog{width:100%;max-height:88dvh;border-radius:24px 24px 0 0;padding:20px 17px calc(20px + env(safe-area-inset-bottom))}.feedback-v49-actions{display:grid;grid-template-columns:1fr 1fr}.feedback-v49-actions button{width:100%}}
    `;
    document.head.append(style);
  }

  function makeEntry() {
    const entry = document.createElement('section');
    entry.className = 'feedback-v49-entry';
    entry.dataset.feedbackRevision = REVISION;
    entry.innerHTML = `
      <p>DokoHilf befindet sich noch in der Testphase. Fehler oder fehlende Information gefunden?</p>
      <button type="button" data-feedback-open>Fehler oder Hinweis melden</button>
    `;
    return entry;
  }

  function makeDialog() {
    const backdrop = document.createElement('div');
    backdrop.className = 'feedback-v49-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <section class="feedback-v49-dialog" role="dialog" aria-modal="true" aria-labelledby="feedbackV49Title">
        <div class="feedback-v49-head">
          <div><h2 id="feedbackV49Title">Fehler oder Hinweis melden</h2><p>Hilf dabei, DokoHilf während der Testphase zu verbessern.</p></div>
          <button class="feedback-v49-close" type="button" data-feedback-close aria-label="Meldung schließen">×</button>
        </div>
        <form class="feedback-v49-form" id="feedbackV49Form">
          <label class="feedback-v49-field"><span>Kategorie</span><select name="category" required>${CATEGORIES.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label>
          <label class="feedback-v49-field"><span>Kurze Beschreibung</span><textarea name="description" minlength="5" maxlength="700" required placeholder="Was ist falsch, unklar oder fehlt?"></textarea></label>
          <label class="feedback-v49-switch"><input type="checkbox" name="includeContext"><span><strong>Aktuelle Stelle mitsenden</strong><small>Es werden nur Build, aktueller Guide und Schritt mitgesendet. Keine Chatnachrichten.</small></span></label>
          <div class="feedback-v49-warning" role="note"><strong>Bitte keine Namen, Bewohner-/Klienten- oder Gesundheitsdaten eingeben.</strong> Die Meldung ist nur für technische und inhaltliche Hinweise zu DokoHilf gedacht.</div>
          <label class="feedback-v49-honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
          <p class="feedback-v49-status" data-feedback-status aria-live="polite"></p>
          <div class="feedback-v49-actions"><button class="feedback-v49-cancel" type="button" data-feedback-close>Abbrechen</button><button class="feedback-v49-submit" type="submit">Meldung senden</button></div>
        </form>
        <div class="feedback-v49-success" data-feedback-success hidden aria-live="polite"><strong>Danke, die Meldung wurde gespeichert.</strong><span>Technische Meldungsnummer</span><div class="feedback-v49-number" data-feedback-number></div></div>
      </section>
    `;
    return backdrop;
  }

  function install() {
    installStyles();
    if (document.querySelector('[data-feedback-revision]')) return;
    const legal = document.querySelector('.legal-note');
    const main = document.querySelector('.main-content');
    if (!legal || !main) return;

    const entry = makeEntry();
    main.insertBefore(entry, legal);
    const backdrop = makeDialog();
    document.body.append(backdrop);

    const form = backdrop.querySelector('#feedbackV49Form');
    const status = backdrop.querySelector('[data-feedback-status]');
    const success = backdrop.querySelector('[data-feedback-success]');
    const number = backdrop.querySelector('[data-feedback-number]');
    const submit = backdrop.querySelector('.feedback-v49-submit');
    let opener = null;

    function open() {
      opener = document.activeElement;
      form.hidden = false;
      success.hidden = true;
      status.textContent = '';
      backdrop.hidden = false;
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => form.querySelector('select')?.focus(), 0);
    }

    function close() {
      backdrop.hidden = true;
      document.body.style.overflow = '';
      form.reset();
      status.textContent = '';
      if (opener instanceof HTMLElement) opener.focus();
    }

    document.addEventListener('click', event => {
      if (event.target.closest?.('[data-feedback-open]')) open();
    });
    backdrop.addEventListener('click', event => {
      if (event.target === backdrop || event.target.closest?.('[data-feedback-close]')) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !backdrop.hidden) close();
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const payload = payloadFromForm(form);
      submit.disabled = true;
      status.textContent = 'Meldung wird gespeichert …';
      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          cache: 'no-store',
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result?.reportNumber) throw new Error(result?.error || 'STORE_FAILED');
        form.hidden = true;
        number.textContent = String(result.reportNumber);
        success.hidden = false;
        status.textContent = '';
      } catch {
        status.textContent = 'Die Meldung konnte gerade nicht gespeichert werden. Bitte versuche es später noch einmal.';
      } finally {
        submit.disabled = false;
      }
    });
  }

  window.DokoHilfFeedbackV49 = Object.freeze({
    endpoint: ENDPOINT,
    revision: REVISION,
    categories: CATEGORIES.map(([value, label]) => ({ value, label })),
    currentGuideContext,
    payloadFromForm,
    install,
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
