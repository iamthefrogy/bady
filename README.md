# badminton-site

Source repo for badminton.chintangurjar.com (GitHub Pages, plain HTML/CSS/JS, no build tool).

## Status

Scaffolding phase (1/9). Folder structure created, not yet fully populated. See plan:
`/Users/frogy/.claude/plans/i-am-planning-to-curried-finch.md`

## Structure

```
index.html              landing page (not yet built)
tools/                   standalone single-file apps (flow manager, string guide)
training/shuttle-stars/  12-week training planner (plain JS rebuild in progress)
media/photos/            drop photos here — GitHub Action auto-builds media/manifest.json
data/videos.json         hand-maintained YouTube link list
videos/                  renders data/videos.json as cards
assets/                  shared css/js
.github/workflows/       media-manifest.yml — auto-regenerates media/manifest.json on push
```

## Local workflow

1. Add/edit files locally in this folder (this IS the source of truth).
2. For a new photo: drop image file into `media/photos/` (optionally name it
   `YYYY-MM-DD--tag1--tag2--title.jpg` for auto date/tags).
3. For a new video: add an entry to `data/videos.json`.
4. `git add`, `git commit`, `git push` — GitHub Pages serves `main` branch root directly.
   Pushing a photo triggers a GitHub Action that regenerates `media/manifest.json`
   automatically — no manual gallery editing needed.

## Domain

Custom domain `badminton.chintangurjar.com` via `CNAME` file + a DNS CNAME record
(`badminton` -> `iamthefrogy.github.io`) set at the registrar.
