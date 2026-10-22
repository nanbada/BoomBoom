import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { run } from './process';
import type { Line, MouthCue } from './schema';
import type { Take } from './voice';
export type Loudness = { input_i: string; input_tp: string; input_lra: string; input_thresh: string; target_offset: string };
export function parseLoudness(stderr: string): Loudness {
  const block = stderr.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0];
  if (!block) throw new Error('ffmpeg did not return loudnorm measurements');
  const result: Loudness = JSON.parse(block);
  for (const value of Object.values(result)) if (value !== 'dynamic' && value !== 'linear' && !Number.isFinite(Number(value))) throw new Error('Nonfinite loudness measurement');
  return result;
}
export async function measureLoudness(file: string) {
  const { stderr } = await run('ffmpeg', ['-hide_banner', '-i', file, '-vn', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']);
  return parseLoudness(stderr);
}
export async function lipSync(line: Line, take: Take, executable: string): Promise<(MouthCue & {lineId: string})[]> {
  const directory = path.dirname(take.wavPath), output = path.join(directory, 'mouth.json');
  const dialog = path.join(directory, 'dialog.txt');
  await writeFile(dialog, line.text);
  // Always use the identical trimmed WAV used to shift the timing data.
  await run(executable, ['-f', 'json', '--extendedShapes', '', '--dialogFile', dialog, '-o', output, take.wavPath]);
  const data = JSON.parse(await readFile(output, 'utf8'));
  if (!Array.isArray(data.mouthCues)) throw new Error('Rhubarb produced no mouth cues');
  return data.mouthCues.map((cue: MouthCue) => {
    if (!/^[A-F]$/.test(cue.value) || !Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < 0 || cue.end < cue.start) throw new Error('Invalid Rhubarb mouth cue');
    return { lineId: line.id, value: cue.value, start: cue.start + line.startOffset, end: cue.end + line.startOffset };
  });
}
export async function mixAudio(lines: Line[], takes: Take[], seconds: number, output: string) {
  const args = ['-y', '-hide_banner', '-loglevel', 'error'];
  takes.forEach(take => args.push('-i', take.wavPath));
  const filters = lines.map((line, i) => `[${i}:a]adelay=${Math.round(line.startOffset * 48000)}S:all=1[a${i}]`);
  filters.push(`${lines.map((_, i) => `[a${i}]`).join('')}amix=inputs=${lines.length}:normalize=0,apad,atrim=duration=${seconds},pan=stereo|c0=c0|c1=c0[mix]`);
  args.push('-filter_complex', filters.join(';'), '-map', '[mix]', '-ar', '48000', '-c:a', 'pcm_s24le', output);
  await run('ffmpeg', args);
}
export async function masterAudio(mix: string, output: string) {
  const measured = await measureLoudness(mix);
  // A small ceiling margin protects against AAC reconstruction overshoots.
  const filter = `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true:print_format=json`;
  await run('ffmpeg', ['-y', '-hide_banner', '-i', mix, '-af', filter, '-ar', '48000', '-c:a', 'pcm_s24le', output]);
  return { firstPass: measured, mastered: await measureLoudness(output) };
}
