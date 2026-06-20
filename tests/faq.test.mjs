import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchFaq, totalEntries } from '../lib/faq.js';

test('FAQ index is non-empty', () => {
  assert.ok(totalEntries() > 0, 'expected at least one bundled FAQ entry');
});

test('searchFaq returns at least one hit for a known keyword', () => {
  const hits = searchFaq('claude');
  assert.ok(hits.length >= 1, 'expected hits for "claude"');
  assert.ok(hits[0].score > 0, 'top hit should have positive score');
});

test('searchFaq returns hits for "doctor"', () => {
  const hits = searchFaq('doctor');
  assert.ok(hits.length >= 1);
});

test('searchFaq is case-insensitive', () => {
  const a = searchFaq('CLAUDE');
  const b = searchFaq('claude');
  assert.equal(a.length, b.length);
});

test('searchFaq returns [] for empty query', () => {
  assert.deepEqual(searchFaq(''), []);
});

test('searchFaq respects limit', () => {
  const hits = searchFaq('the', { limit: 2 });
  assert.ok(hits.length <= 2);
});

test('searchFaq orders by score desc', () => {
  const hits = searchFaq('claude code');
  for (let i = 1; i < hits.length; i++) {
    assert.ok(hits[i - 1].score >= hits[i].score, 'hits should be sorted desc');
  }
});
