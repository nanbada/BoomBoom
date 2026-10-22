import type { WordTiming } from './schema';

export type CharacterAlignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

export function secondsToFrames(seconds: number, fps: number): number {
  if (!Number.isFinite(seconds) || !Number.isFinite(fps) || seconds < 0 || fps <= 0) {
    throw new Error('seconds and fps must be finite, with nonnegative seconds and positive fps');
  }
  const exactFrame = seconds * fps;
  return Math.round(exactFrame + Number.EPSILON * Math.abs(exactFrame));
}

export function charactersToWords(
  alignment: CharacterAlignment,
  lineId: string,
  trimStartSeconds = 0,
  offsetSeconds = 0,
): WordTiming[] {
  const { characters, character_start_times_seconds: starts, character_end_times_seconds: ends } = alignment;
  if (!Array.isArray(characters) || !Array.isArray(starts) || !Array.isArray(ends)
      || characters.length !== starts.length || characters.length !== ends.length) {
    throw new Error('alignment character and timestamp arrays must have equal lengths');
  }
  if (!Number.isFinite(trimStartSeconds) || trimStartSeconds < 0 || !Number.isFinite(offsetSeconds) || offsetSeconds < 0) {
    throw new Error('trim and offset must be finite nonnegative seconds');
  }
  const indexed: { character: string; start: number; end: number }[] = [];
  characters.forEach((character, index) => {
    const start = starts[index];
    const end = ends[index];
    if (typeof character !== 'string' || [...character].length !== 1 || !Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start) {
      throw new Error(`invalid alignment character or timestamp at index ${index}`);
    }
    indexed.push({ character, start, end });
  });
  const fullText = characters.join('');
  const ignored = new Set<number>();
  for (const tag of fullText.matchAll(/<\/?[A-Za-z][^>]*>|\[[^\]]+\]/g)) {
    for (let index = tag.index; index < tag.index + tag[0].length; index++) ignored.add(index);
  }
  const visible = indexed.filter((_, index) => !ignored.has(index));
  const visibleText = visible.map((part) => part.character).join('');
  const words: WordTiming[] = [];
  for (const match of visibleText.matchAll(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)) {
    const first = visible[match.index];
    const last = visible[match.index + match[0].length - 1];
    if (last.end <= trimStartSeconds) continue;
    words.push({
      lineId,
      word: match[0],
      start: Math.max(0, first.start - trimStartSeconds) + offsetSeconds,
      end: Math.max(0, last.end - trimStartSeconds) + offsetSeconds,
    });
  }
  return words;
}

export function applyTimingCorrections(
  words: WordTiming[],
  corrections: { word: string; offsetSeconds: number; reason: string }[],
): WordTiming[] {
  const revised = words.map((word) => ({ ...word }));
  for (const correction of corrections) {
    if (!Number.isFinite(correction.offsetSeconds) || !correction.reason.trim()) {
      throw new Error(`invalid timing correction for ${correction.word}`);
    }
    const matches = revised.filter((word) => word.word.toLocaleLowerCase() === correction.word.toLocaleLowerCase());
    if (matches.length !== 1) throw new Error(`timing correction needs exactly one occurrence of ${correction.word}`);
    const adjustedStart = matches[0].start + correction.offsetSeconds;
    if (adjustedStart < 0) throw new Error(`timing correction moves ${correction.word} before zero`);
    matches[0].start = adjustedStart;
    matches[0].end += correction.offsetSeconds;
  }
  return revised;
}
