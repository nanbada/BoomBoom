import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {secondsToFrames} from '../src/timing';
import type {Aspect, RenderData} from './types';

type EpisodeProps = RenderData & {aspect: Aspect};
const RIG_WIDTH = 400;
const RIG_HEIGHT = 600;
const BALLOON_WIDTH = 300;
const BALLOON_HEIGHT = 410;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

function poseRig(svg: string, frame: number, mouth: string, satisfied: boolean): string {
  const blink = frame % 113 < 4;
  const headAngle = Math.sin(frame / 22) * 1.8;
  const armAngle = Math.sin(frame / 18) * 3;

  return svg
    .replace(/<g id="(head|arm_l|arm_r)" data-pivot-x="(\d+)" data-pivot-y="(\d+)">/g,
      (_full, id: string, x: string, y: string) => {
        const angle = id === 'head' ? headAngle : id === 'arm_l' ? armAngle : -armAngle;
        return `<g id="${id}" data-pivot-x="${x}" data-pivot-y="${y}" transform="rotate(${angle.toFixed(2)} ${x} ${y})">`;
      })
    .replace(/<g id="eyes_open"(?: opacity="0")?>/, `<g id="eyes_open" opacity="${blink ? 0 : 1}">`)
    .replace(/<g id="eyes_closed"(?: opacity="0")?>/, `<g id="eyes_closed" opacity="${blink ? 1 : 0}">`)
    .replace(/<g id="mouth_([A-F])"(?: opacity="0")?>/g,
      (_full, shape: string) => `<g id="mouth_${shape}" opacity="${shape === mouth ? 1 : 0}">`)
    .replace('M182 267 Q200 278 218 267', satisfied ? 'M176 264 Q200 291 224 264' : 'M182 267 Q200 278 218 267');
}

function Balloon({color, x, y, scale}: {color: string; x: number; y: number; scale: number}) {
  return <div style={{position: 'absolute', left: x, top: y, width: BALLOON_WIDTH, height: BALLOON_HEIGHT,
    transform: `scale(${scale})`, transformOrigin: 'top left'}}>
    <svg width={BALLOON_WIDTH} height={BALLOON_HEIGHT} viewBox="0 0 300 410" aria-label="red balloon">
      <path d="M150 280 C45 280 23 207 27 132 C31 54 81 20 150 20 C219 20 269 54 273 132 C277 207 255 280 150 280 Z"
        fill={color} stroke="#703128" strokeWidth="8"/>
      <path d="M131 276 L150 300 L169 276 Z" fill={color} stroke="#703128" strokeWidth="7" strokeLinejoin="round"/>
      <path d="M150 300 C170 333 123 340 154 372 C171 388 151 396 146 404" fill="none" stroke="#703128" strokeWidth="6" strokeLinecap="round"/>
      <path d="M75 96 C89 64 110 55 129 49" fill="none" stroke="white" strokeOpacity="0.65" strokeWidth="15" strokeLinecap="round"/>
    </svg>
  </div>;
}

export const Episode: React.FC<EpisodeProps> = ({episode, words, mouthCues, lineDurations, rigSvg, aspect}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const time = frame / fps;
  const currentLine = [...episode.lines].reverse().find((line) => line.startOffset <= time);
  const scene = episode.scenes.find((item) => item.id === currentLine?.sceneId) ?? episode.scenes[0];
  const camera = scene.cameras[aspect];
  const shrinkLine = episode.lines.find((line) => line.id === 'L02');
  const shrinkStart = shrinkLine
    ? secondsToFrames(shrinkLine.startOffset + (lineDurations[shrinkLine.id] ?? 0), fps)
    : Number.POSITIVE_INFINITY;
  const shrink = frame < shrinkStart ? 1 : interpolate(frame, [shrinkStart, shrinkStart + 8], [1, 0.4], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const satisfied = frame >= shrinkStart + 8;
  const activeCue = mouthCues.find((cue) =>
    frame >= secondsToFrames(cue.start, fps) && frame < secondsToFrames(cue.end, fps));
  const mouth = /^[A-F]$/.test(activeCue?.value ?? '') ? activeCue!.value : 'A';
  const posedRig = useMemo(() => poseRig(rigSvg, frame, mouth, satisfied), [rigSvg, frame, mouth, satisfied]);

  const rigScale = Math.min(camera.toby.scale, (width - 48) / RIG_WIDTH, (height - 48) / RIG_HEIGHT);
  const balloonScale = Math.min(camera.balloon.scale, (width - 48) / BALLOON_WIDTH, (height - 48) / BALLOON_HEIGHT) * shrink;
  const rigX = clamp(camera.toby.x, 24, width - RIG_WIDTH * rigScale - 24);
  const rigY = clamp(camera.toby.y, 24, height - RIG_HEIGHT * rigScale - 24);
  const balloonX = clamp(camera.balloon.x + BALLOON_WIDTH * camera.balloon.scale * (1 - shrink) / 2,
    24, width - BALLOON_WIDTH * balloonScale - 24);
  const balloonY = clamp(camera.balloon.y + BALLOON_HEIGHT * camera.balloon.scale * (1 - shrink) / 2,
    24, height - BALLOON_HEIGHT * balloonScale - 24);

  const targetWord = words.find((word) => {
    const line = episode.lines.find((item) => item.id === word.lineId);
    if (!line?.targetWords.some((target) => target.toLocaleLowerCase() === word.word.toLocaleLowerCase())) return false;
    const start = secondsToFrames(word.start, fps);
    return frame >= start && frame < start + fps;
  });
  const captionStart = targetWord ? secondsToFrames(targetWord.start, fps) : 0;
  const captionScale = targetWord ? interpolate(frame, [captionStart, captionStart + 7, captionStart + 12],
    [0.75, 1.08, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const fontSize = Math.min(camera.caption.fontSize, aspect === 'portrait' ? 130 : 160);
  const captionWidth = targetWord ? Math.min(width - 48, Math.max(220, targetWord.word.length * fontSize * 0.72 + 80)) : 0;
  const captionX = clamp(camera.caption.x, 24 + captionWidth * 1.08 / 2,
    width - 24 - captionWidth * 1.08 / 2) - captionWidth / 2;
  const captionHeight = fontSize * 1.1 + 42;
  const captionY = clamp(camera.caption.y, 24 + captionHeight * 0.04,
    height - 24 - captionHeight * 1.04);

  return <AbsoluteFill style={{backgroundColor: '#DDECF3', overflow: 'hidden'}}>
    <Balloon color={scene.props.find((prop) => prop.id === 'balloon')?.color ?? '#D84039'}
      x={balloonX} y={balloonY} scale={balloonScale}/>
    <div style={{position: 'absolute', left: rigX, top: rigY, width: RIG_WIDTH, height: RIG_HEIGHT,
      transform: `scale(${rigScale})`, transformOrigin: 'top left'}}
      dangerouslySetInnerHTML={{__html: posedRig}}/>
    {targetWord ? <div style={{position: 'absolute', left: captionX, top: captionY, width: captionWidth,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '14px 20px',
      borderRadius: 28, background: '#FFFDF6', border: '7px solid #382A25',
      boxShadow: '0 13px 0 rgba(56,42,37,0.15)', boxSizing: 'border-box',
      color: '#382A25', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize,
      lineHeight: 1.1, textTransform: 'uppercase', transform: `scale(${captionScale})`,
      transformOrigin: 'center center'}}>{targetWord.word}</div> : null}
  </AbsoluteFill>;
};
