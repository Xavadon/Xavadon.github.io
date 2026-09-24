import { readFile, mkdir, rm } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { execFileSync } from "node:child_process";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = Number(process.env.SHOTS ?? 2);
const WIDTH = 960;

const html = await readFile(path.join(root, "index.html"), "utf8");
const ids = [...new Set([...html.matchAll(/data-steam="(\d+)"/g)].map(m => m[1]))];

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(file));
}

function shrink(src, dst) {
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-vf", `scale='min(${WIDTH},iw)':-2`, "-q:v", "4", dst]);
}

for (const id of ids) {
  const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}`);
  const entry = Object.values(await res.json())[0];
  if (!entry?.success) {
    console.error(`${id}: Steam не отдал данные`);
    continue;
  }
  const app = entry.data;
  const dir = path.join(root, "assets", "steam", id);
  await mkdir(dir, { recursive: true });

  await download(app.header_image, path.join(dir, "header.jpg"));

  const shots = (app.screenshots ?? []).slice(0, SHOTS);
  for (const [i, shot] of shots.entries()) {
    const raw = path.join(dir, `raw-${i + 1}.jpg`);
    await download(shot.path_full, raw);
    shrink(raw, path.join(dir, `shot-${i + 1}.jpg`));
    await rm(raw);
  }

  console.log(`${id} ${app.name}: header + ${shots.length} скриншотов`);
}
