import { access, cp, mkdir, rm } from 'fs/promises';
import { join } from 'path';

const root = process.cwd();
const dest = join(root, 'public', 'kuromoji');
const vendorDest = join(root, 'public', 'vendor');
const kuroshiroBundleSrc = join(root, 'node_modules', 'kuroshiro', 'dist', 'kuroshiro.min.js');
const kuromojiAnalyzerBundleSrc = join(
  root,
  'node_modules',
  'kuroshiro-analyzer-kuromoji',
  'dist',
  'kuroshiro-analyzer-kuromoji.min.js'
);
const candidateSources = [
  join(root, 'node_modules', 'kuroshiro-analyzer-kuromoji', 'dist', 'dict'),
  join(root, 'node_modules', 'kuromoji', 'dict'),
];

const findSource = async () => {
  for (const candidate of candidateSources) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next candidate
    }
  }
  return null;
};

try {
  const source = await findSource();
  if (!source) {
    throw new Error(
      `No kuromoji dictionary found. Tried: ${candidateSources.join(', ')}`
    );
  }
  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });
  await cp(source, dest, { recursive: true });
  await mkdir(vendorDest, { recursive: true });
  await cp(kuroshiroBundleSrc, join(vendorDest, 'kuroshiro.min.js'));
  await cp(
    kuromojiAnalyzerBundleSrc,
    join(vendorDest, 'kuroshiro-analyzer-kuromoji.min.js')
  );
  console.log(`Copied kuromoji dict from ${source} to public/kuromoji`);
} catch (err) {
  console.error('Failed to copy kuromoji dict:', err);
  process.exitCode = 1;
}
