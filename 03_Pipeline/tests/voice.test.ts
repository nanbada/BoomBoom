import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseScript, extractLines } from '../src/schema';
import { cacheKey, requireFreeCredits, type VoiceConfig } from '../src/voice';
const episode = parseScript(readFileSync(new URL('../../04_Episodes/EP00_pipeline_test/script.yaml', import.meta.url), 'utf8'));
const voice: VoiceConfig = {voiceId: 'premade', name: 'Adult', modelId: 'eleven_multilingual_v2', outputFormat: 'mp3_44100_128'};
test('changing L02 invalidates only its speech cache, not L01 or timing-only edits', () => {
  const [l1, l2] = extractLines(episode);
  const keys = [cacheKey(l1, voice), cacheKey(l2, voice)];
  assert.equal(cacheKey({...l1, startOffset: 4, timingCorrections: [{word:'big',offsetSeconds:0.03,reason:'Listening check'}]}, voice), keys[0]);
  assert.notEqual(cacheKey({...l2, text: 'Make it small, please!'}, voice), keys[1]);
  assert.notEqual(cacheKey({...l1, emotion: 'confident'}, voice), keys[0]);
  assert.notEqual(cacheKey(l1, {...voice, voiceId: 'other'}), keys[0]);
});
test('paid plans and exhausted or unknown quotas fail closed', () => {
  assert.equal(requireFreeCredits({tier:'free',character_count:0,character_limit:10000}, 15),10000);
  assert.throws(()=>requireFreeCredits({tier:'starter',character_count:0,character_limit:10000},15), /free plan/);
  assert.throws(()=>requireFreeCredits({tier:'free',character_count:9999,character_limit:10000},15), /Insufficient/);
  assert.throws(()=>requireFreeCredits({tier:'free',character_count:NaN,character_limit:10000},15), /Insufficient/);
});
