import { test } from 'node:test';
import assert from 'node:assert/strict';
import { __test__, t, setLang, listLangs, hasNative } from '../lib/i18n.js';

const IMPORTANT_KEYS = [
  'banner.tagline',
  'banner.menu',
  'cohort.unset',
  'cohort.set',
  'lang.switched',
];

test('all 3 langs are listed', () => {
  const langs = listLangs();
  for (const want of ['en', 'my', 'kar']) {
    assert.ok(langs.includes(want), `${want} should be listed`);
  }
});

test('every important key resolves in every lang', () => {
  for (const lang of ['en', 'my', 'kar']) {
    setLang(lang);
    for (const key of IMPORTANT_KEYS) {
      const out = t(key, { n: 1, lang });
      assert.ok(out && out !== key, `lang ${lang} missing fallback for ${key} — got ${JSON.stringify(out)}`);
    }
  }
  setLang('en');
});

test('en table has every key any other lang has', () => {
  const en = __test__.STRINGS.en;
  for (const lang of ['my', 'kar']) {
    for (const k of Object.keys(__test__.STRINGS[lang])) {
      assert.ok(Object.prototype.hasOwnProperty.call(en, k), `en is missing key "${k}" that ${lang} defines`);
    }
  }
});

test('kar reports scaffolded coverage via hasNative', () => {
  // banner.menu.doctor should NOT be natively translated in kar (scaffold).
  assert.equal(hasNative('banner.menu.doctor', 'kar'), false);
  // But it IS native in en.
  assert.equal(hasNative('banner.menu.doctor', 'en'), true);
});

test('t() falls back to en when current key missing', () => {
  setLang('kar');
  // kar does not define banner.menu.doctor → falls back to en string.
  const out = t('banner.menu.doctor');
  assert.equal(out, __test__.STRINGS.en['banner.menu.doctor']);
  setLang('en');
});

test('t() interpolates {vars}', () => {
  setLang('en');
  const out = t('cohort.set', { n: 7 });
  assert.equal(out, 'Cohort: 7');
});
