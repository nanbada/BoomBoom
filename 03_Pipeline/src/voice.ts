import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseEnv } from 'node:util';
import type { Line } from './schema';
import type { CharacterAlignment } from './timing';
import { duration, run } from './process';

export type VoiceConfig = { voiceId: string; name: string; modelId: string; outputFormat: string };
export type Take = { lineId: string; cacheKey: string; text: string; emotion: string; voice: VoiceConfig;
  generatedOn: string; trimStartSeconds: number; durationSeconds: number; alignment: CharacterAlignment;
  wavSha256: string; wavPath: string; cacheHit: boolean };
export const hash = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
export function requestFor(line: Line, config: VoiceConfig) {
  return { text: line.text, model_id: config.modelId, language_code: 'en',
    voice_settings: { stability: 0.5, similarity_boost: 0.75, style: line.emotion === 'surprised' ? 0.4 : 0.2, use_speaker_boost: true, speed: 0.9 } };
}
export function cacheKey(line: Line, config: VoiceConfig) {
  return hash(JSON.stringify({ version: 1, voice: config, request: requestFor(line, config) }));
}
export async function readApiKey(root: string) {
  const env = parseEnv(await readFile(path.join(root, '.env'), 'utf8'));
  if (!env.ELEVENLABS_API_KEY?.trim()) throw new Error('ELEVENLABS_API_KEY is missing from the project .env');
  return env.ELEVENLABS_API_KEY.trim();
}
async function api(key: string, route: string, body?: unknown) {
  const response = await fetch(`https://api.elevenlabs.io/v1/${route}`, {
    method: body ? 'POST' : 'GET', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(90_000),
  });
  // Never echo credentials or unrestricted service response bodies.
  if (!response.ok) throw new Error(`ElevenLabs ${body ? 'generation' : 'preflight'} failed (HTTP ${response.status}); no automatic retry`);
  return response.json();
}
export function requireFreeCredits(subscription: { tier: string; character_limit: number; character_count: number }, characters: number) {
  if (subscription.tier !== 'free') throw new Error('Only the ElevenLabs free plan is authorized for EP00');
  const remaining = subscription.character_limit - subscription.character_count;
  if (!Number.isFinite(remaining) || remaining < characters) throw new Error('Insufficient free credits; no paid fallback is allowed');
  return remaining;
}
export async function generateTake(line: Line, config: VoiceConfig, episodeDir: string, root: string): Promise<Take> {
  const key = cacheKey(line, config);
  const dir = path.join(episodeDir, 'audio', line.id, key);
  const wavPath = path.join(dir, 'final.wav');
  const metaPath = path.join(dir, 'take.json');
  try {
    const saved: Take = JSON.parse(await readFile(metaPath, 'utf8'));
    if (saved.cacheKey === key && saved.wavSha256 === hash(await readFile(wavPath))) return { ...saved, wavPath, cacheHit: true };
  } catch (error) {
    if (!(error instanceof Error)) throw error;
  }
  await mkdir(dir, { recursive: true });
  const responsePath = path.join(dir, 'response.json');
  let response: { audio_base64: string; alignment: CharacterAlignment | null; normalized_alignment?: CharacterAlignment | null };
  let generatedOn: string;
  try {
    const saved = JSON.parse(await readFile(responsePath, 'utf8'));
    if (saved.cacheKey !== key) throw new Error('Cached response identity mismatch');
    response = saved.response; generatedOn = saved.generatedOn;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw new Error('Invalid cached TTS response; inspect it before regenerating');
    const apiKey = await readApiKey(root);
    const request = requestFor(line, config);
    requireFreeCredits(await api(apiKey, 'user/subscription'), request.text.length);
    const voice = await api(apiKey, `voices/${encodeURIComponent(config.voiceId)}`);
    if (voice.category !== 'premade' || !['middle_aged', 'old', 'young'].includes(voice.labels?.age)) throw new Error('The configured voice must be a premade adult voice');
    response = await api(apiKey, `text-to-speech/${encodeURIComponent(config.voiceId)}/with-timestamps?output_format=${encodeURIComponent(config.outputFormat)}`, request);
    generatedOn = new Date().toISOString();
    await writeFile(responsePath, JSON.stringify({ cacheKey: key, generatedOn, response }));
  }
  const alignment = response.alignment ?? response.normalized_alignment;
  if (!alignment || !response.audio_base64) throw new Error('TTS response has no audio or character alignment');
  const rawPath = path.join(dir, 'raw.mp3');
  await writeFile(rawPath, Buffer.from(response.audio_base64, 'base64'));
  const rawDuration = await duration(rawPath);
  const { stderr } = await run('ffmpeg', ['-hide_banner', '-i', rawPath, '-af', 'silencedetect=noise=-45dB:d=0.06', '-f', 'null', '-']);
  const events = [...stderr.matchAll(/silence_(start|end): ([0-9.]+)/g)].map(m => ({ kind: m[1], time: Number(m[2]) }));
  let trimStartSeconds = 0, trimEndSeconds = rawDuration;
  if (events[0]?.kind === 'start' && events[0].time < 0.01 && events[1]?.kind === 'end') trimStartSeconds = Math.max(0, events[1].time - 0.02);
  const last = events.at(-1), previous = events.at(-2);
  if (last?.kind === 'end' && Math.abs(last.time - rawDuration) < 0.06 && previous?.kind === 'start') trimEndSeconds = Math.min(rawDuration, previous.time + 0.02);
  if (trimEndSeconds <= trimStartSeconds) throw new Error('Generated audio contains no usable speech');
  await run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', rawPath, '-af', `atrim=start=${trimStartSeconds}:end=${trimEndSeconds},asetpts=PTS-STARTPTS`, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', wavPath]);
  const take: Take = { lineId: line.id, cacheKey: key, text: line.text, emotion: line.emotion, voice: config, generatedOn,
    trimStartSeconds, durationSeconds: await duration(wavPath), alignment, wavSha256: hash(await readFile(wavPath)), wavPath, cacheHit: false };
  await writeFile(metaPath, JSON.stringify(take, null, 2));
  return take;
}
