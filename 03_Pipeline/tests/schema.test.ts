import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { extractLines, parseScript, stripSpeechTags } from '../src/schema';

const validSource = readFileSync(new URL('../../04_Episodes/EP00_pipeline_test/script.yaml', import.meta.url), 'utf8');

test('EP00 script parses and produces clean dialogue lines', () => {
  const episode = parseScript(validSource);
  assert.equal(episode.episodeId, 'EP00');
  assert.equal(episode.durationSeconds, 15);
  assert.deepEqual(extractLines(episode).map((line) => line.text), ['Oh no! Too big!', 'Make it small!']);
  assert.equal(stripSpeechTags('<laugh> Oh [whisper] no! </laugh>'), 'Oh no!');
});

test('missing required field reports its location and field', () => {
  assert.throws(() => parseScript(validSource.replace('    emotion: surprised\n', '')), /line \d+, field lines\.0\.emotion:/);
});

test('invalid frame rate reports its field', () => {
  assert.throws(() => parseScript(validSource.replace('fps: 30', 'fps: 0')), /line \d+, field fps:/);
});

test('unknown scene reference reports the line field', () => {
  assert.throws(() => parseScript(validSource.replace('sceneId: S01', 'sceneId: missing')), /line \d+, field lines\.0\.sceneId: unknown scene ID/);
});

test('duplicate line IDs are rejected', () => {
  assert.throws(() => parseScript(validSource.replace('id: L02', 'id: L01')), /field lines\.1\.id: duplicate line ID/);
});

test('scene resolution follows a renamed line and rejects missing or foreign references', () => {
  const renamed = validSource.replaceAll('L02', 'RESOLVE');
  assert.equal(parseScript(renamed).scenes[0].resolutionLineId, 'RESOLVE');
  assert.throws(() => parseScript(validSource.replace('resolutionLineId: L02', 'resolutionLineId: missing')),
    /line \d+, field scenes\.0\.resolutionLineId: must reference a line in this scene/);
  const episode = parseScript(validSource);
  episode.scenes.push({ ...episode.scenes[0], id: 'S02' });
  assert.throws(() => parseScript(JSON.stringify(episode)), /field scenes\.1\.resolutionLineId: must reference a line in this scene/);
  assert.equal(parseScript(validSource.replace('    resolutionLineId: L02\n', '')).scenes[0].resolutionLineId, undefined);
});

test('YAML aliases and custom tags are rejected', () => {
  assert.throws(() => parseScript(validSource.replace('episodeId: EP00', 'episodeId: &ep EP00').replace('    sceneId: S01', '    sceneId: *ep')), /aliases are forbidden/);
  assert.throws(() => parseScript(validSource.replace('episodeId: EP00', 'episodeId: !private EP00')), /YAML tags are forbidden|Unresolved tag/);
});
