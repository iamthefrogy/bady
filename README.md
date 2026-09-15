# badminton-site

Source repo for badminton.chintangurjar.com — GitHub Pages, plain HTML/CSS/JS, no build tool.

## Structure

```
index.html                    landing page — card grid to each section
tools/
  flow-manager.html           session/drill flow manager (standalone app)
  string-guide.html           restringing reference guide (standalone app)
training/
  shuttle-stars/              12-week junior training planner (plain-JS rebuild)
    index.html, app.js, style.css
    data-weeks.js, data-acts.js, data-warmups.js   plain data, edit directly to change content
    diagram.js                 <ex-diagram> custom element (renders SVG from a `spec` JSON attr)
media/
  photos/                     drop jpg/png/webp/gif here
  manifest.json               AUTO-GENERATED — do not hand-edit, the Action rewrites it
  gallery.html                reads manifest.json, renders + tag-filters
data/
  videos.json                 hand-maintained YouTube list: [{title, url, date, tags}]
videos/
  index.html                  reads ../data/videos.json, click-to-play cards
assets/
  css/site.css                shared site-wide styles
  js/site.js                  shared tag-filter + fetch helper
.github/
  workflows/media-manifest.yml   scans media/photos/ on push, regenerates + commits manifest.json
  scripts/build-manifest.mjs     the scan/generate script (Node built-ins only)
```

## Local workflow

This folder is the source of truth. Edit here, then push — the live site follows.

**Add a photo**: drop the image file into `media/photos/`. Optional filename convention for
automatic date/tags: `YYYY-MM-DD--tag1--tag2--title.jpg` (e.g.
`2026-09-14--practice--smash-drill.jpg` → date 2026-09-14, tags `practice`, `smash-drill`, title
"smash drill"). No date prefix → the Action falls back to the git commit date. Commit and push;
a GitHub Action regenerates `media/manifest.json` and commits it back automatically — the gallery
picks it up with zero manual editing.

**Add a video**: add one object to `data/videos.json` — `{"title": "...", "url":
"https://www.youtube.com/watch?v=...", "date": "YYYY-MM-DD", "tags": ["..."]}`. Commit and push.

**Add a training week/game/warm-up**: edit `training/shuttle-stars/data-weeks.js`,
`data-acts.js`, or `data-warmups.js` directly — plain JS arrays, no build step.

**Add a whole new tool**: drop a self-contained HTML file into `tools/` and link it from
`tools/index.html`.

**Add a whole new section** (e.g. "Gear Notes"): create the folder, add its own `index.html`
reusing `assets/css/site.css`, and add one card to the root `index.html`.

```
git add -A
git commit -m "..."
git push
```

GitHub Pages serves the `main` branch root directly — no build step, no deploy delay beyond
GitHub's own.

## Domain setup (one-time)

1. Public GitHub repo: `github.com/iamthefrogy/badminton-site`.
2. `CNAME` file at repo root contains `badminton.chintangurjar.com`.
3. Repo Settings → Pages: Source = Deploy from branch, Branch = `main`, Folder = `/ (root)`.
4. DNS at the registrar: CNAME record, host `badminton`, value `iamthefrogy.github.io`.
5. Enable "Enforce HTTPS" in Pages settings once the cert is issued.

## Notes

- `exercise/` (the original Shuttle Stars source folder, including the Claude Design Canvas file
  and raw xlsx exports) is gitignored — kept locally, never published. The four files the site
  actually needs were copied into `training/shuttle-stars/`.
- Videos are YouTube links only — no raw video files are committed (keeps the repo small, well
  under GitHub Pages' soft size limits).
