// Regenerates media/manifest.json by scanning media/photos/.
// Node built-ins only — no npm dependencies.
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { execFileSync } from "node:child_process";

const PHOTOS_DIR = "media/photos";
const MANIFEST_PATH = "media/manifest.json";
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function humanize(name) {
  return name.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function gitDate(path) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%aI", "--", path], { encoding: "utf8" }).trim();
    return out ? out.slice(0, 10) : null;
  } catch {
    return null;
  }
}

function parseFilename(filename) {
  const stem = basename(filename, extname(filename));
  const datePrefixMatch = stem.match(/^(\d{4}-\d{2}-\d{2})--?(.*)$/);

  let date = null;
  let rest = stem;
  if (datePrefixMatch) {
    date = datePrefixMatch[1];
    rest = datePrefixMatch[2];
  }

  const segments = rest.split("--").filter(Boolean);
  const title = humanize(segments[0] || rest || stem);
  const tags = segments.slice(1).map((t) => humanize(t).toLowerCase()).filter(Boolean);

  return { title, date, tags };
}

function buildManifest() {
  let files = [];
  try {
    files = readdirSync(PHOTOS_DIR).filter((f) => IMAGE_EXTS.has(extname(f).toLowerCase()));
  } catch {
    files = [];
  }

  const items = files.map((file) => {
    const path = join(PHOTOS_DIR, file).replace(/\\/g, "/");
    const { title, date, tags } = parseFilename(file);
    const stat = statSync(path);
    return {
      file,
      path,
      title,
      date: date || gitDate(path) || null,
      tags,
      sizeBytes: stat.size,
    };
  });

  items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const manifest = { generatedAt: new Date().toISOString(), items };
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${MANIFEST_PATH} with ${items.length} item(s).`);
}

buildManifest();
