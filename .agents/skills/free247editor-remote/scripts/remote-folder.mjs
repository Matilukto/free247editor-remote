#!/usr/bin/env node
// Finds the synced cloud folder used for remote editing and lists its videos, newest first.
// The folder is any folder your cloud app syncs to this computer (Google Drive for desktop,
// Dropbox, OneDrive, iCloud Drive). Its path is saved as REMOTE_FOLDER in .env.
//
// Usage:
//   node <skill>/scripts/remote-folder.mjs                 list videos (finds the folder if REMOTE_FOLDER is unset)
//   node <skill>/scripts/remote-folder.mjs --apps          show which cloud sync apps have a folder on this computer
//   node <skill>/scripts/remote-folder.mjs --find "Name"   search the usual sync locations for a folder called Name
//   node <skill>/scripts/remote-folder.mjs --set "<path>"  save the folder path to .env
//   node <skill>/scripts/remote-folder.mjs --test          write a small test file, to check uploads reach the cloud
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// The free247editor folder (where .env lives): the nearest folder above this script, or above
// the current folder, that has setup.mjs. The skill may sit in .agents/ or .claude/ inside it.
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const findRoot = start => { for (let d = path.resolve(start); ; d = path.dirname(d)) {
  if (fs.existsSync(path.join(d, 'setup.mjs'))) return d;
  if (path.dirname(d) === d) return null; } };
const ROOT = findRoot(HERE) || findRoot(process.cwd());
if (!ROOT) { console.error('Run this from the free247editor folder (the one with setup.mjs). Get it at https://github.com/riecodes/free247editor'); process.exit(6); }
const ENV = path.join(ROOT, '.env');
const VIDEO = /\.(mov|mp4|m4v|mkv|webm|avi|3gp)$/i;
const args = process.argv.slice(2);
const flag = n => { const i = args.indexOf(n); return i < 0 ? null : (args[i + 1] ?? ''); };

function readEnv() {
  if (!fs.existsSync(ENV)) return {};
  return Object.fromEntries(fs.readFileSync(ENV, 'utf8').split(/\r?\n/)
    .map(l => l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map(m => [m[1], m[2].replace(/^"|"$/g, '')]));
}
function writeEnv(key, value) {
  let text = fs.existsSync(ENV) ? fs.readFileSync(ENV, 'utf8') : '';
  const line = `${key}="${value}"`;
  text = new RegExp(`^${key}=.*$`, 'm').test(text) ? text.replace(new RegExp(`^${key}=.*$`, 'm'), line) : text.replace(/\n?$/, '\n') + line + '\n';
  fs.writeFileSync(ENV, text);
}

// Where cloud apps mount their files on each OS.
function syncRoots() {
  const home = os.homedir(), roots = [];
  const add = p => { try { if (fs.statSync(p).isDirectory()) roots.push(p); } catch {} };
  if (process.platform === 'win32') {
    for (const l of 'DEFGHIJKLMNOPQRSTUVWXYZ') { add(`${l}:\\My Drive`); add(`${l}:\\Shared drives`); }
    for (const d of fs.readdirSync(home)) if (/^(Google Drive|Dropbox|OneDrive|iCloudDrive)/i.test(d)) add(path.join(home, d));
  } else {
    const cs = path.join(home, 'Library', 'CloudStorage');
    try { for (const d of fs.readdirSync(cs)) { add(path.join(cs, d, 'My Drive')); add(path.join(cs, d)); } } catch {}
    add(path.join(home, 'Library', 'Mobile Documents', 'com~apple~CloudDocs'));
    for (const d of ['Google Drive', 'GoogleDrive', 'Dropbox', 'OneDrive', 'gdrive']) add(path.join(home, d));
  }
  return [...new Set(roots)];
}
function find(name) {
  const hits = [];
  const walk = (dir, depth) => {
    let items; try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const it of items) {
      if (!it.isDirectory() || it.name.startsWith('.') || it.name.startsWith('$')) continue;
      const p = path.join(dir, it.name);
      if (it.name.toLowerCase() === name.toLowerCase()) hits.push(p);
      if (depth < 2) walk(p, depth + 1);
    }
  };
  for (const r of syncRoots()) walk(r, 0);
  return hits;
}

if (args.includes('--apps')) {
  const app = p => /dropbox/i.test(p) ? 'Dropbox' : /onedrive/i.test(p) ? 'OneDrive'
    : /icloud|CloudDocs/i.test(p) ? 'iCloud Drive' : /google|My Drive|Shared drives|gdrive/i.test(p) ? 'Google Drive' : 'Unknown';
  const roots = syncRoots();
  if (!roots.length) { console.log('No cloud sync app folder found on this computer.'); process.exit(2); }
  for (const r of roots) console.log(`${app(r).padEnd(13)} ${r}`);
  process.exit(0);
}
if (flag('--set') !== null) {
  const p = path.resolve(flag('--set'));
  if (!fs.existsSync(p)) { console.error(`Not found: ${p}`); process.exit(1); }
  writeEnv('REMOTE_FOLDER', p);
  console.log(`Saved REMOTE_FOLDER=${p}`);
  process.exit(0);
}
if (flag('--find') !== null) {
  const roots = syncRoots();
  if (!roots.length) { console.log('No cloud sync folder found on this computer. Install Google Drive for desktop (or Dropbox/OneDrive) and sign in.'); process.exit(2); }
  const hits = find(flag('--find'));
  console.log(hits.length ? hits.join('\n') : `No folder named "${flag('--find')}". Sync roots checked:\n${roots.join('\n')}`);
  process.exit(hits.length ? 0 : 3);
}

const dir = readEnv().REMOTE_FOLDER;
if (!dir) { console.log('REMOTE_FOLDER is not set. Run with --find "<folder name>", then --set "<path>".'); process.exit(4); }
if (!fs.existsSync(dir)) { console.log(`REMOTE_FOLDER does not exist right now: ${dir}\nIs the cloud app running and signed in?`); process.exit(5); }

if (args.includes('--test')) {
  const f = path.join(dir, 'free247editor-upload-test.txt');
  fs.writeFileSync(f, `Upload test from free247editor - ${new Date().toISOString()}\n`);
  console.log(`Wrote ${f}\nCheck that it shows up in the cloud app on your phone (or through a Drive connector).`);
  process.exit(0);
}

const files = fs.readdirSync(dir, { withFileTypes: true }).filter(f => f.isFile() && VIDEO.test(f.name))
  .map(f => { const s = fs.statSync(path.join(dir, f.name)); return { name: f.name, mb: s.size / 1e6, t: s.mtime }; })
  .sort((a, b) => b.t - a.t);
console.log(`Folder: ${dir}`);
if (!files.length) console.log('(no videos)');
for (const f of files) {
  const mine = /-(v\d+|final)\.mp4$/i.test(f.name);
  console.log(`${f.t.toISOString().slice(0, 16).replace('T', ' ')}  ${f.mb.toFixed(0).padStart(5)} MB  ${f.name}${mine ? '   (edited output)' : ''}`);
}
