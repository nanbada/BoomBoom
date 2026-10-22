import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyTimingCorrections, charactersToWords, secondsToFrames } from '../src/timing';

test('character timing becomes clean, trimmed, episode-relative word timing', () => {
  const characters = [...'<laugh> Big! small.'];
  const alignment = {
    characters,
    character_start_times_seconds: characters.map((_, index) => index * 0.1),
    character_end_times_seconds: characters.map((_, index) => (index + 1) * 0.1),
  };
  const words = charactersToWords(alignment, 'L01', 0.5, 2);
  assert.deepEqual(words.map((word) => word.word), ['Big', 'small']);
  assert.deepEqual(words[0], { lineId: 'L01', word: 'Big', start: 2.3, end: 2.6 });
  assert.equal(words[1].start, 2.8);
});

test('manual correction moves one target word and preserves the source', () => {
  const source = [
    { lineId: 'L01', word: 'Too', start: 2.1, end: 2.3 },
    { lineId: 'L01', word: 'big', start: 2.4, end: 2.7 },
  ];
  const corrected = applyTimingCorrections(source, [{ word: 'big', offsetSeconds: 0.05, reason: 'audible onset' }]);
  assert.deepEqual(corrected[0], source[0]);
  assert.deepEqual(corrected[1], { lineId: 'L01', word: 'big', start: 2.4499999999999997, end: 2.75 });
  assert.equal(source[1].start, 2.4);
  assert.throws(() => applyTimingCorrections(source, [{ word: 'small', offsetSeconds: 0.1, reason: 'test' }]), /exactly one occurrence/);
});

test('seconds are rounded to nearest frame in one place', () => {
  assert.equal(secondsToFrames(2, 30), 60);
  assert.equal(secondsToFrames(2.05, 30), 62);
  assert.throws(() => secondsToFrames(Number.NaN, 30), /finite/);
});
