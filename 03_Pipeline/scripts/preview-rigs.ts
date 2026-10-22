import {execFile} from 'node:child_process';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

const run = promisify(execFile);
const rigDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../02_Assets/characters/toby');
const temporary = await mkdtemp(join(tmpdir(), 'boomboom-rigs-'));

try {
  const inputs: string[] = [];
  for (let index = 1; index <= 5; index++) {
    const name = `toby_cand${String(index).padStart(2, '0')}`;
    const input = join(rigDir, '_candidates', `${name}.svg`);
    const output = join(temporary, `${name}.png`);
    await run('sips', ['-s', 'format', 'png', input, '--out', output]);
    inputs.push('-i', output);
  }

  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', ...inputs,
    '-filter_complex', 'xstack=inputs=5:layout=0_0|400_0|800_0|1200_0|1600_0:fill=white,format=rgb24',
    '-frames:v', '1', join(rigDir, 'toby_candidates_preview.png'),
  ]);
  console.log(join(rigDir, 'toby_candidates_preview.png'));
} finally {
  await rm(temporary, {recursive: true, force: true});
}
