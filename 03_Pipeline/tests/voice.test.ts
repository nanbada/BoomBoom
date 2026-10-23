import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { run } from '../src/process';
import { parseScript, extractLines } from '../src/schema';
import { cacheKey, generateTake, hash, requireFreeCredits, type Take, type VoiceConfig } from '../src/voice';
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

test('generateTake returns an intact cached WAV without reading credentials or calling fetch', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'boomboom-cache-hit-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const line = episode.lines[0], key = cacheKey(line, voice);
  const cache = path.join(directory, 'audio', line.id, key);
  const wavPath = path.join(cache, 'final.wav');
  const wav = Buffer.from('cached WAV fixture');
  await mkdir(cache, { recursive: true });
  await writeFile(wavPath, wav);
  const saved: Take = { lineId: line.id, cacheKey: key, text: line.text, emotion: line.emotion, voice,
    generatedOn: '2026-10-23T00:00:00Z', trimStartSeconds: 0.25, durationSeconds: 1,
    alignment: { characters: ['b'], character_start_times_seconds: [0.6], character_end_times_seconds: [0.8] },
    wavSha256: hash(wav), wavPath: '/old/location/final.wav', cacheHit: false };
  await writeFile(path.join(cache, 'take.json'), JSON.stringify(saved));
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Network is forbidden'); });
  const take = await generateTake(line, voice, directory, path.join(directory, 'no-credentials'));
  assert.deepEqual(take, { ...saved, wavPath, cacheHit: true });
  assert.equal(fetch.mock.callCount(), 0);
});

test('generateTake makes exactly one mocked TTS request on a miss, then reuses its WAV', { timeout: 20_000 }, async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'boomboom-cache-miss-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(path.join(directory, '.env'), 'ELEVENLABS_API_KEY=offline-test-placeholder\n');
  const mp3 = path.join(directory, 'fixture.mp3');
  await run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi',
    '-i', 'sine=frequency=440:duration=0.3:sample_rate=48000', mp3]);
  const line = episode.lines[1];
  const alignment = { characters: [...line.text],
    character_start_times_seconds: [...line.text].map((_, index) => index * 0.01),
    character_end_times_seconds: [...line.text].map((_, index) => (index + 1) * 0.01) };
  const audio_base64 = (await readFile(mp3)).toString('base64');
  let generations = 0;
  const fetch = t.mock.method(globalThis, 'fetch', async (input: Parameters<typeof globalThis.fetch>[0], options?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/user/subscription')) return Response.json({ tier: 'free', character_limit: 10000, character_count: 0 });
    if (url.endsWith('/voices/premade')) return Response.json({ category: 'premade', labels: { age: 'middle_aged' } });
    assert.equal(url, 'https://api.elevenlabs.io/v1/text-to-speech/premade/with-timestamps?output_format=mp3_44100_128');
    assert.equal(options?.method, 'POST');
    assert.equal(JSON.parse(String(options?.body)).text, line.text);
    generations++;
    return Response.json({ audio_base64, alignment });
  });
  const first = await generateTake(line, voice, directory, directory);
  assert.equal(first.cacheHit, false);
  assert.ok(first.durationSeconds > 0 && first.durationSeconds < 1);
  assert.equal(first.wavSha256, hash(await readFile(first.wavPath)));
  assert.equal(generations, 1);
  assert.equal(fetch.mock.callCount(), 3); // Two preflight GETs and one TTS POST, all mocked.
  const second = await generateTake(line, voice, directory, directory);
  assert.equal(second.cacheHit, true);
  assert.equal(second.wavSha256, first.wavSha256);
  assert.equal(fetch.mock.callCount(), 3);
  assert.equal(generations, 1);
});
