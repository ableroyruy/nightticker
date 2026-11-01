import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRankingScope, RANKING_CATEGORIES } from '../lib/ranking/navigation.ts';

test('popularity deep links accept every supported category case-insensitively', () => {
  for (const category of RANKING_CATEGORIES) {
    assert.equal(parseRankingScope(`?category=${category}`), category);
    assert.equal(parseRankingScope(`?category=${category.toLowerCase()}`), category);
  }
  assert.equal(parseRankingScope('?category=%20us%20'), 'US');
});
test('overall and invalid popularity scopes safely resolve to overall', () => {
  for (const query of ['', '?category=', '?category=all', '?category=unknown', '?category=__proto__', '?other=US']) assert.equal(parseRankingScope(query), 'ALL');
});
