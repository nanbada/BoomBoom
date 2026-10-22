import { mkdir, readFile, writeFile, appendFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { parseScript, extractLines, type WordTiming } from '../src/schema';
import { charactersToWords, applyTimingCorrections, secondsToFrames } from '../src/timing';
import { generateTake, type Take, type VoiceConfig } from '../src/voice';
import { lipSync, mixAudio, masterAudio, measureLoudness } from '../src/audio';
import { run } from '../src/process';
import type { RenderData } from '../video/types';
const pipeline = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(pipeline, '..');
const json = (file: string, data: unknown) => writeFile(file, JSON.stringify(data, null, 2) + '\n');
async function main() {
  const began = performance.now();
  if (!process.argv[2] || process.argv.length > 3) throw new Error('Usage: npm run build:episode -- <episode-directory>');
  const episodeDir = path.resolve(process.argv[2]);
  const episode = parseScript(await readFile(path.join(episodeDir, 'script.yaml'), 'utf8'));
  const lines = extractLines(episode);
  // EP00 deliberately supports a single scene; reject unsupported input explicitly.
  if (episode.scenes.length !== 1) throw new Error('The EP00 renderer supports exactly one scene');
  const out = path.join(pipeline, 'out', episode.episodeId);
  await mkdir(out, { recursive: true });
  await json(path.join(episodeDir, 'lines.json'), lines);
  await run('ffmpeg', ['-version']);
  const installed = path.join(pipeline, '.tools', 'rhubarb', 'rhubarb');
  let rhubarb = 'rhubarb';
  try { await access(installed); rhubarb = installed; } catch { /* Use an existing PATH installation. */ }
  // Fail before consuming credits when a required local tool is missing.
  try { await run(rhubarb, ['--version']); } catch { throw new Error('Rhubarb is unavailable; see README installation instructions before building'); }
  const voice: VoiceConfig = JSON.parse(await readFile(path.join(pipeline, 'voice-config.json'), 'utf8'));
  const takes: Take[] = [], words: WordTiming[] = [], mouthCues: RenderData['mouthCues'] = [];
  for (const line of lines) {
    const take = await generateTake(episode.lines.find(source => source.id === line.id)!, voice, episodeDir, root);
    console.log(`${line.id}: ${take.cacheHit ? 'cache hit' : 'prepared new take'}`);
    if (line.startOffset + take.durationSeconds > episode.durationSeconds) throw new Error(`${line.id} extends past the episode end`);
    for (let i = 0; i < takes.length; i++) {
      if (line.startOffset < lines[i].startOffset + takes[i].durationSeconds && lines[i].startOffset < line.startOffset + take.durationSeconds) throw new Error(`${line.id} overlaps another dialogue line`);
    }
    takes.push(take);
    const lineWords = applyTimingCorrections(charactersToWords(take.alignment, line.id, take.trimStartSeconds, line.startOffset), line.timingCorrections);
    for (const target of line.targetWords) {
      if (!lineWords.some(w => w.word.toLowerCase() === target.toLowerCase())) throw new Error(`${line.id}: target ${target} missing from alignment`);
    }
    if (lineWords.some(w => w.end > episode.durationSeconds)) throw new Error(`${line.id} has word timing beyond the episode end`);
    words.push(...lineWords);
    mouthCues.push(...await lipSync(line, take, rhubarb));
    const assetId = `${episode.episodeId}_${line.id}_${take.cacheKey.slice(0, 12)}`;
    const log = path.join(root, '05_Ops', 'assets_log.csv');
    if (!(await readFile(log, 'utf8')).split('\n').some(row => row.startsWith(`"${assetId}",`))) {
      const fields = [assetId, '1', path.relative(root, take.wavPath), path.relative(root, path.join(episodeDir, 'script.yaml')), 'ElevenLabs', voice.modelId, 'Free', take.generatedOn, 'yes', 'leading/trailing silence trimmed', 'https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform', '2026-10-23', '테스트 전용, 공개 영상 사용 금지'];
      await appendFile(log, fields.map(value => '"' + value.replaceAll('"', '""') + '"').join(',') + '\n');
    }
  }
  await json(path.join(episodeDir, 'timing.json'), words);
  await json(path.join(episodeDir, 'mouth.json'), mouthCues);
  await json(path.join(episodeDir, 'takes.json'), takes.map(({ alignment, wavPath, ...take }) => ({ ...take, wavPath: path.relative(episodeDir, wavPath), timingFile: 'timing.json' })));
  const data: RenderData = { episode, words, mouthCues, lineDurations: Object.fromEntries(takes.map(t => [t.lineId, t.durationSeconds])), rigSvg: await readFile(path.join(root, '02_Assets/characters/toby/toby_temp_rig.svg'), 'utf8') };
  await json(path.join(out, 'render-data.json'), data);
  const mix = path.join(out, 'mix.wav'), master = path.join(out, 'master.wav');
  await mixAudio(lines, takes, episode.durationSeconds, mix);
  const audioMeasurements = await masterAudio(mix, master);
  const serveUrl = await bundle({ entryPoint: path.join(pipeline, 'video/index.ts'), outDir: path.join(pipeline, 'build'), publicDir: null });
  const renders = [];
  for (const [aspect, suffix] of [['landscape', '16x9'], ['portrait', '9x16']] as const) {
    const inputProps = { ...data };
    const composition = await selectComposition({ serveUrl, id: `EP00-${aspect}`, inputProps });
    const silent = path.join(out, `silent_${suffix}.mp4`), final = path.join(out, `${episode.episodeId}_${suffix}.mp4`);
    console.log(`Rendering ${suffix}`);
    await renderMedia({ composition, serveUrl, codec: 'h264', outputLocation: silent, inputProps, concurrency: 2, crf: 18 });
    await run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', silent, '-i', master, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-t', String(episode.durationSeconds), '-movflags', '+faststart', final]);
    const measured = await measureLoudness(final);
    if (Math.abs(Number(measured.input_i) + 14) > 1 || Number(measured.input_tp) > -1) throw new Error(`${suffix} failed loudness acceptance: ${measured.input_i} LUFS / ${measured.input_tp} dBTP`);
    const targetWords = words.filter(w => lines.find(l => l.id === w.lineId)!.targetWords.some(t => t.toLowerCase() === w.word.toLowerCase()));
    for (const word of targetWords) {
      await renderStill({ composition, serveUrl, output: path.join(out, `${suffix}_${word.word}.png`), inputProps, frame: secondsToFrames(word.start, episode.fps), imageFormat: 'png' });
    }
    await renderStill({ composition, serveUrl, output: path.join(out, `${suffix}_end.png`), inputProps, frame: secondsToFrames(12, episode.fps), imageFormat: 'png' });
    renders.push({ file: final, integratedLufs: Number(measured.input_i), truePeakDbtp: Number(measured.input_tp), width: composition.width, height: composition.height, frames: composition.durationInFrames });
  }
  const result = { completedAt: new Date().toISOString(), elapsedSeconds: (performance.now() - began) / 1000,
    takes: takes.map(t => ({lineId: t.lineId, cacheKey: t.cacheKey, cacheHit: t.cacheHit, trimStartSeconds: t.trimStartSeconds, durationSeconds: t.durationSeconds})),
    targetPopups: words.filter(w => lines.find(l => l.id === w.lineId)!.targetWords.some(t => t.toLowerCase() === w.word.toLowerCase())).map(w => ({...w, popupFrame: secondsToFrames(w.start, episode.fps), listeningCheck: 'pending'})), audioMeasurements, renders };
  await json(path.join(out, 'build-report.json'), result);
  console.log(JSON.stringify(result, null, 2));
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Build failed'); process.exitCode = 1; });
