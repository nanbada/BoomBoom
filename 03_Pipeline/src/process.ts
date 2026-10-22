import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execute = promisify(execFile);
export async function run(file: string, args: string[]) {
  return execute(file, args, { maxBuffer: 16 * 1024 * 1024, timeout: 600_000 });
}
export async function duration(file: string): Promise<number> {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]);
  const value = Number(stdout.trim());
  if (!Number.isFinite(value) || value <= 0) throw new Error('Invalid audio duration');
  return value;
}
