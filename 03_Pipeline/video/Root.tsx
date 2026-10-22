import React from 'react';
import {Composition} from 'remotion';
import {secondsToFrames} from '../src/timing';
import {Episode} from './Episode';
import type {RenderData} from './types';

const previewData: RenderData = {
  episode: {
    episodeId: 'EP00', fps: 30, durationSeconds: 15,
    scenes: [{id: 'S01', backgroundId: 'bg_placeholder', props: [{id: 'balloon', color: '#D84039'}],
      cameras: {
        landscape: {toby: {x: 200, y: 300, scale: 1}, balloon: {x: 1100, y: 240, scale: 1}, caption: {x: 760, y: 70, scale: 1, fontSize: 110}},
        portrait: {toby: {x: 120, y: 880, scale: 1.45}, balloon: {x: 560, y: 430, scale: 1}, caption: {x: 180, y: 190, scale: 1, fontSize: 110}},
      }}],
    lines: [],
  },
  words: [], mouthCues: [], lineDurations: {},
  rigSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"/>',
};

const metadata = ({props}: {props: RenderData}) => ({
  fps: props.episode.fps,
  durationInFrames: secondsToFrames(props.episode.durationSeconds, props.episode.fps),
});

const Landscape: React.FC<RenderData> = (props) => <Episode {...props} aspect="landscape"/>;
const Portrait: React.FC<RenderData> = (props) => <Episode {...props} aspect="portrait"/>;

export const Root: React.FC = () => <>
  <Composition id="EP00-landscape" component={Landscape}
    width={1920} height={1080} fps={30} durationInFrames={450}
    defaultProps={previewData} calculateMetadata={metadata}/>
  <Composition id="EP00-portrait" component={Portrait}
    width={1080} height={1920} fps={30} durationInFrames={450}
    defaultProps={previewData} calculateMetadata={metadata}/>
</>;
