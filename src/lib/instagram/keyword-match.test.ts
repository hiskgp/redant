import { describe, expect, it } from 'vitest';
import { matchesInstagramKeyword } from './keyword-match';

describe('matchesInstagramKeyword', () => {
  it('matches case-insensitive contains rules', () => {
    expect(matchesInstagramKeyword('What is the PRICE?', ['price'])).toBe(true);
  });

  it('requires exact text for exact rules', () => {
    expect(matchesInstagramKeyword('price please', ['price'], 'exact')).toBe(false);
    expect(matchesInstagramKeyword('PRICE', ['price'], 'exact')).toBe(true);
  });

  it('matches Unicode word boundaries without matching inside another word', () => {
    expect(matchesInstagramKeyword('Please send LINK!', ['link'], 'word')).toBe(true);
    expect(matchesInstagramKeyword('blink', ['link'], 'word')).toBe(false);
  });

  it('ignores blank comments and blank keywords', () => {
    expect(matchesInstagramKeyword('   ', ['price'])).toBe(false);
    expect(matchesInstagramKeyword('price', ['   '])).toBe(false);
  });
});
