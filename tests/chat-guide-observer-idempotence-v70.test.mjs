import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/chat-guide-ux-v70.js', import.meta.url), 'utf8');

class FakeHTMLElement {
  constructor(text = '') {
    this._text = text;
    this.textWrites = 0;
    this.dataset = {};
    this.title = '';
    this.disabled = false;
    this.attributes = new Map();
  }
  get textContent() { return this._text; }
  set textContent(value) {
    this.textWrites += 1;
    this._text = String(value);
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
}

function loadApi() {
  const window = {
    fetch: async () => new Response('{}', { status: 200 }),
    DokoHilfGuideProgress: {
      getCurrentGuide: () => ({ guideSlug: 'visite-anlegen', guideStep: 2, guideStepCount: 11 }),
    },
    setTimeout,
    clearTimeout,
  };
  const document = {
    readyState: 'loading',
    addEventListener() {},
    getElementById() { return null; },
    querySelectorAll() { return []; },
  };
  vm.runInContext(source, vm.createContext({
    window,
    document,
    Request,
    Response,
    Event,
    HTMLElement: FakeHTMLElement,
    HTMLTextAreaElement: class extends FakeHTMLElement {},
    MutationObserver: class {},
    console,
    setTimeout,
    clearTimeout,
  }), { filename: 'chat-guide-ux-v70.js' });
  return window.DokoHilfChatGuideUxV70;
}

test('Schritt-zurück-Beschriftung ist idempotent und erzeugt keine MutationObserver-Endlosschleife', () => {
  const api = loadApi();
  const button = new FakeHTMLElement('Hilfe zum Schritt');

  api.applyStepBackButton(button);
  assert.equal(button.textContent, 'Schritt zurück');
  assert.equal(button.textWrites, 1);

  api.applyStepBackButton(button);
  assert.equal(button.textContent, 'Schritt zurück');
  assert.equal(button.textWrites, 1, 'identische Beschriftung darf textContent nicht erneut setzen');
});
