import assert from 'node:assert/strict';
import { parseLoudness } from '../src/audio';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test } from 'node:test';

const execute = promisify(execFile);

test('mixAudio ends a two-line episode at 15 seconds without runaway padding', { timeout: 20_000 }, async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'boomboom-audio-test-'));
  try {
    const inputs = [path.join(directory, 'line-1.wav'), path.join(directory, 'line-2.wav')];
    for (const [index, input] of inputs.entries()) {
      await execute('ffmpeg', [
        '-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi',
        '-i', `sine=frequency=${index === 0 ? 440 : 550}:duration=0.25:sample_rate=48000`,
        '-ac', '1', '-c:a', 'pcm_s16le', input,
      ], { timeout: 5_000 });
    }

    const output = path.join(directory, 'mix.wav');
    const audioModule = pathToFileURL(fileURLToPath(new URL('../src/audio.ts', import.meta.url))).href;
    const childScript = path.join(directory, 'mix.ts');
    await writeFile(childScript, `import { mixAudio } from ${JSON.stringify(audioModule)};\n`
      + 'mixAudio([{startOffset: 2}, {startOffset: 5}], '
      + '[{wavPath: process.argv[2]}, {wavPath: process.argv[3]}], 15, process.argv[4])'
      + '.catch(error => { console.error(error); process.exitCode = 1; });\n');
    const tsx = fileURLToPath(new URL('../node_modules/.bin/tsx', import.meta.url));
    // The file-size limit also bounds the output if padding regresses into an endless stream.
    await execute('/bin/sh', ['-c', 'ulimit -f 12288; exec "$@"', 'sh', tsx, childScript, ...inputs, output], {
      timeout: 12_000,
      maxBuffer: 1024 * 1024,
      killSignal: 'SIGKILL',
    });

    const { stdout } = await execute('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', output,
    ], { timeout: 5_000 });
    assert.ok(Math.abs(Number(stdout.trim()) - 15) < 0.01, `unexpected duration: ${stdout.trim()}`);
    assert.ok((await stat(output)).size < 5_000_000, 'mix grew beyond the expected 15-second PCM size');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});


test('loudnorm requires every measurement used by the second pass', () => {
  const valid = {input_i: '-20', input_tp: '-5', input_lra: '1', input_thresh: '-30', target_offset: '0.1'};
  assert.deepEqual(parseLoudness(JSON.stringify(valid)), valid);
  for (const key of Object.keys(valid)) {
    const missing: Record<string, string> = {...valid};
    delete missing[key];
    assert.throws(() => parseLoudness(JSON.stringify(missing)));
    assert.throws(() => parseLoudness(JSON.stringify({...valid, [key]: '-inf'})));
    assert.throws(() => parseLoudness(JSON.stringify({...valid, [key]: ''})));
  }
});
