import { isAlias, isMap, isSeq, LineCounter, parseDocument } from 'yaml';
import { z } from 'zod';

const identifier = z.string().regex(/^[A-Za-z][A-Za-z0-9_-]*$/, 'must be a safe identifier');
const finite = z.number().finite();
const position = z.strictObject({
  x: finite.nonnegative(),
  y: finite.nonnegative(),
  scale: finite.positive().max(10),
});
const caption = position.extend({ fontSize: finite.positive().max(300) });
const camera = z.strictObject({ toby: position, balloon: position, caption });
const scene = z.strictObject({
  id: identifier,
  backgroundId: z.literal('bg_placeholder'),
  props: z.array(z.strictObject({
    id: z.literal('balloon'),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'must be a six-digit hex color'),
  })).min(1),
  cameras: z.strictObject({ landscape: camera, portrait: camera }),
});
const line = z.strictObject({
  id: identifier,
  characterId: z.literal('toby'),
  text: z.string().trim().min(1),
  emotion: z.enum(['surprised', 'confident']),
  sceneId: identifier,
  startOffset: finite.nonnegative(),
  targetWords: z.array(z.string().regex(/^[\p{L}\p{N}]+$/u)).min(1),
  timingCorrections: z.array(z.strictObject({
    word: z.string().regex(/^[\p{L}\p{N}]+$/u),
    offsetSeconds: finite.min(-2).max(2),
    reason: z.string().trim().min(1),
  })),
});

const episodeSchema = z.strictObject({
  episodeId: identifier,
  fps: z.number().int().min(1).max(120),
  durationSeconds: finite.positive().max(3600),
  scenes: z.array(scene).min(1),
  lines: z.array(line).min(1),
}).superRefine((episode, ctx) => {
  const sceneIds = new Set<string>();
  episode.scenes.forEach((item, index) => {
    if (sceneIds.has(item.id)) ctx.addIssue({ code: 'custom', path: ['scenes', index, 'id'], message: 'duplicate scene ID' });
    sceneIds.add(item.id);
    for (const [aspect, width, height] of [['landscape', 1920, 1080], ['portrait', 1080, 1920]] as const) {
      const layout = item.cameras[aspect];
      for (const key of ['toby', 'balloon', 'caption'] as const) {
        if (layout[key].x > width || layout[key].y > height) {
          ctx.addIssue({ code: 'custom', path: ['scenes', index, 'cameras', aspect, key], message: `position must fit ${width}×${height}` });
        }
      }
    }
  });
  const lineIds = new Set<string>();
  episode.lines.forEach((item, index) => {
    if (lineIds.has(item.id)) ctx.addIssue({ code: 'custom', path: ['lines', index, 'id'], message: 'duplicate line ID' });
    lineIds.add(item.id);
    if (!sceneIds.has(item.sceneId)) ctx.addIssue({ code: 'custom', path: ['lines', index, 'sceneId'], message: 'unknown scene ID' });
    if (item.startOffset >= episode.durationSeconds) ctx.addIssue({ code: 'custom', path: ['lines', index, 'startOffset'], message: 'must be before episode end' });
    const words = stripSpeechTags(item.text).match(/[\p{L}\p{N}]+/gu)?.map((word) => word.toLocaleLowerCase()) ?? [];
    if (words.length === 0) ctx.addIssue({ code: 'custom', path: ['lines', index, 'text'], message: 'must contain spoken words' });
    item.targetWords.forEach((word, wordIndex) => {
      if (!words.includes(word.toLocaleLowerCase())) ctx.addIssue({ code: 'custom', path: ['lines', index, 'targetWords', wordIndex], message: 'word is absent from spoken text' });
    });
    item.timingCorrections.forEach((correction, correctionIndex) => {
      if (!item.targetWords.some((word) => word.toLocaleLowerCase() === correction.word.toLocaleLowerCase())) {
        ctx.addIssue({ code: 'custom', path: ['lines', index, 'timingCorrections', correctionIndex, 'word'], message: 'correction must name a target word' });
      }
    });
  });
});

export type Episode = z.infer<typeof episodeSchema>;
export type Line = Episode['lines'][number];
export type WordTiming = { lineId: string; word: string; start: number; end: number };
export type MouthCue = { start: number; end: number; value: string };

export function stripSpeechTags(text: string): string {
  return text.replace(/<\/?[A-Za-z][^>]*>|\[[^\]]+\]/g, '').replace(/\s+/g, ' ').trim();
}

export function extractLines(episode: Episode): Line[] {
  return episode.lines.map((item) => ({ ...item, text: stripSpeechTags(item.text) }));
}

export function parseScript(source: string): Episode {
  const lineCounter = new LineCounter();
  const document = parseDocument(source, { lineCounter, uniqueKeys: true, schema: 'core', customTags: [] });
  if (document.errors.length) {
    const error = document.errors[0];
    const lineNumber = error.linePos?.[0]?.line ?? 1;
    throw new Error(`script.yaml line ${lineNumber}: ${error.message}`);
  }
  const lineOf = (node: unknown): number => {
    const range = (node as { range?: [number, number, number] } | null)?.range;
    return range ? lineCounter.linePos(range[0]).line : 1;
  };
  const rejectUnsafe = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    if (isAlias(node)) throw new Error(`script.yaml line ${lineOf(node)}: YAML aliases are forbidden`);
    if ((node as { tag?: string }).tag) throw new Error(`script.yaml line ${lineOf(node)}: explicit YAML tags are forbidden`);
    if (isMap(node)) node.items.forEach((item) => { rejectUnsafe(item.key); rejectUnsafe(item.value); });
    if (isSeq(node)) node.items.forEach(rejectUnsafe);
  };
  rejectUnsafe(document.contents);
  const result = episodeSchema.safeParse(document.toJS({ maxAliasCount: 0 }));
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue.path.map(String).join('.') || '<root>';
    const target = document.getIn(issue.path as Array<string | number>, true)
      ?? document.getIn(issue.path.slice(0, -1) as Array<string | number>, true);
    throw new Error(`script.yaml line ${lineOf(target)}, field ${path}: ${issue.message}`);
  }
  return result.data;
}
