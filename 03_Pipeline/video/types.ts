import type {Episode, WordTiming} from '../src/schema';

export type RenderData = {
  episode: Episode;
  words: WordTiming[];
  mouthCues: {lineId: string; start: number; end: number; value: string}[];
  lineDurations: Record<string, number>;
  rigSvg: string;
};

export type Aspect = 'landscape' | 'portrait';
