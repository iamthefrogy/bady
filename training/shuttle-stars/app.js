(function () {
  "use strict";

  const STAGE_COLOR = {
    1: "#0b7285", 2: "#e8590c", 3: "#5f3dc4",
    4: "#2b8a3e", 5: "#f0a202", 6: "#c2255c",
  };
  const CAT_COLOR = {
    Movement: "#0b7285",
    Racket: "#e8590c",
    Rally: "#5f3dc4",
    Matchplay: "#2b8a3e",
    "Full session": "#495057",
  };
  const WCAT_COLOR = {
    "Pulse raiser": "#e8590c",
    "Head-Shoulders": "#0b7285",
    "Arms-Wrists": "#e8590c",
    Trunk: "#5f3dc4",
    Legs: "#2b8a3e",
    Footwork: "#0b7285",
    "Fun finisher": "#e8590c",
  };
  const EN_COLOR = { High: "#e8590c", Med: "#f0a202", Low: "#2b8a3e" };

  const WEEKS = window.SS_WEEKS || [];
  const ACTS = window.SS_ACTS || [];
  const WARMUPS = window.SS_WARMUPS || [];

  const state = {
    tab: "plan",
    week: WEEKS[0] ? WEEKS[0].n : null,
    astage: "All",
    acat: "All",
    aq: "",
    wcat: "All",
    wq: "",
    sel: null, // { kind: 'act'|'warmup', id }
  };

  const root = document.getElementById("app");

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function diagramTag(spec, heightClass) {
    if (!spec) return "";
    return `<div class="diagram-wrap"><ex-diagram spec='${esc(JSON.stringify(spec))}'></ex-diagram></div>`;
  }

  function chip(label, active, color, attrs) {
    const style = active && color ? ` style="--chip-color:${color}"` : "";
    return `<button type="button" class="chip${active ? " active" : ""}"${style} ${attrs}>${esc(label)}</button>`;
  }

  function renderTabs() {
    const tabs = [["plan", "Weeks"], ["warm", "Warm-ups"], ["acts", "Activities"]];
    return `<div class="ss-tabs">${tabs
      .map(([id, label]) => chip(label, state.tab === id, "#33291f", `data-tab="${id}"`))
      .join("")}</div>`;
  }

  // ---------- Weeks tab ----------

  function renderPlan() {
    const picker = WEEKS.map((w) =>
      `<button type="button" class="week-chip${state.week === w.n ? " active" : ""}" style="--stage-color:${STAGE_COLOR[w.stage] || "#e8590c"}" data-week="${w.n}">${w.n}</button>`
    ).join("");

    const week = WEEKS.find((w) => w.n === state.week);
    if (!week) return `<div class="week-picker">${picker}</div><p class="empty-state">No weeks yet.</p>`;

    const warmupRows = (week.warmup || []).map((r) => `
      <div class="warmup-row${r.br ? " break" : ""}">
        <div class="t">${esc(r.t)}</div>
        <div>
          <div>${esc(r.x)}</div>
          ${r.f ? `<div class="sub">${esc(r.f)}</div>` : ""}
        </div>
      </div>`).join("");

    const gameCards = (week.games || []).map((g) => `
      <div class="game-card">
        <div class="slot">${esc(g.slot)}</div>
        <div class="name">${esc(g.n)}</div>
        <dl>
          <dt>Group</dt><dd>${esc(g.grp || "")}</dd>
          <dt>Kit</dt><dd>${esc(g.kit || "")}</dd>
          ${g.easier ? `<dt>Easier</dt><dd>${esc(g.easier)}</dd>` : ""}
          ${g.harder ? `<dt>Harder</dt><dd>${esc(g.harder)}</dd>` : ""}
          ${g.sk ? `<dt>Skill focus</dt><dd>${esc(g.sk)}</dd>` : ""}
        </dl>
      </div>`).join("");

    const backup = week.backup ? `
      <div class="section-title">Backup game</div>
      <div class="game-card">
        <div class="name">${esc(week.backup.n)}</div>
        <dl>
          <dt>Group</dt><dd>${esc(week.backup.grp || "")}</dd>
          <dt>Kit</dt><dd>${esc(week.backup.kit || "")}</dd>
          ${week.backup.sk ? `<dt>Skill focus</dt><dd>${esc(week.backup.sk)}</dd>` : ""}
        </dl>
      </div>` : "";

    return `
      <div class="week-picker">${picker}</div>
      <div class="week-detail">
        <h2>Week ${week.n} — ${esc(week.title)}</h2>
        <div class="sub">${esc(week.sub || "")} · Kit: ${esc(week.kit || "")}</div>

        <div class="section-title">Warm-up — 15 min</div>
        <div class="warmup-table">${warmupRows}</div>

        <div class="section-title">Games — 15 min</div>
        <div class="card-grid">${gameCards}</div>

        ${backup}

        ${week.notes ? `<div class="section-title">Coach notes</div><p>${esc(week.notes)}</p>` : ""}
      </div>`;
  }

  // ---------- Activities tab ----------

  function filteredActs() {
    const q = state.aq.trim().toLowerCase();
    return ACTS.filter((a) => {
      if (state.astage !== "All" && String(a.st) !== String(state.astage)) return false;
      if (state.acat !== "All" && a.c !== state.acat) return false;
      if (q && !(`${a.n} ${a.e}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }

  function renderActs() {
    const stages = ["All", ...new Set(ACTS.map((a) => a.st))].sort((a, b) => (a === "All" ? -1 : b === "All" ? 1 : a - b));
    const cats = ["All", ...new Set(ACTS.map((a) => a.c))].sort((a, b) => (a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b)));

    const stageChips = stages.map((s) =>
      chip(s === "All" ? "All stages" : `Stage ${s}`, String(state.astage) === String(s), s === "All" ? "#33291f" : STAGE_COLOR[s], `data-astage="${s}"`)
    ).join("");

    const catChips = cats.map((c) =>
      chip(c, state.acat === c, c === "All" ? "#33291f" : CAT_COLOR[c], `data-acat="${c}"`)
    ).join("");

    const items = filteredActs();
    const cards = items.map((a) => `
      <button type="button" class="ss-card" data-sel="act" data-id="${esc(a.id)}">
        ${diagramTag(a.d)}
        <div class="body">
          <div class="title">${esc(a.n)}</div>
          <div class="sub">
            <span class="badge" style="background:${CAT_COLOR[a.c] || "#33291f"}">${esc(a.c)}</span>
            ${a.en ? ` <span class="badge" style="background:${EN_COLOR[a.en] || "#33291f"}">${esc(a.en)} energy</span>` : ""}
          </div>
        </div>
      </button>`).join("");

    return `
      <div class="filter-row">${stageChips}</div>
      <div class="filter-row">${catChips}<input class="ss-search" type="search" name="aq" placeholder="Search activities…" value="${esc(state.aq)}" data-aq>
      </div>
      <div class="card-grid">${cards || '<p class="empty-state">No activities match.</p>'}</div>`;
  }

  // ---------- Warm-ups tab ----------

  function filteredWarmups() {
    const q = state.wq.trim().toLowerCase();
    return WARMUPS.filter((w) => {
      if (state.wcat !== "All" && w.c !== state.wcat) return false;
      if (q && !(`${w.n} ${w.e}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }

  function renderWarm() {
    const cats = ["All", ...new Set(WARMUPS.map((w) => w.c))];
    const catChips = cats.map((c) =>
      chip(c, state.wcat === c, c === "All" ? "#33291f" : WCAT_COLOR[c], `data-wcat="${esc(c)}"`)
    ).join("");

    const items = filteredWarmups();
    const cards = items.map((w) => `
      <button type="button" class="ss-card" data-sel="warmup" data-id="${esc(w.n)}">
        ${diagramTag(w.d)}
        <div class="body">
          <div class="title">${esc(w.n)}</div>
          <div class="sub">
            <span class="badge" style="background:${WCAT_COLOR[w.c] || "#33291f"}">${esc(w.c)}</span>
            ${w.t ? ` <span class="badge" style="background:#33291f">${esc(w.t)}</span>` : ""}
          </div>
        </div>
      </button>`).join("");

    return `
      <div class="filter-row">${catChips}<input class="ss-search" type="search" name="wq" placeholder="Search warm-ups…" value="${esc(state.wq)}" data-wq>
      </div>
      <div class="card-grid">${cards || '<p class="empty-state">No warm-ups match.</p>'}</div>`;
  }

  // ---------- detail overlay ----------

  function renderOverlay() {
    if (!state.sel) return "";
    const { kind, id } = state.sel;
    const item = kind === "act" ? ACTS.find((a) => a.id === id) : WARMUPS.find((w) => w.n === id);
    if (!item) return "";

    if (kind === "act") {
      return `
        <div class="overlay" data-overlay>
          <div class="overlay-panel">
            <button type="button" class="overlay-close" data-close>✕</button>
            ${diagramTag(item.d)}
            <h2>${esc(item.n)}</h2>
            <div class="sub">
              <span class="badge" style="background:${CAT_COLOR[item.c] || "#33291f"}">${esc(item.c)}</span>
              ${item.st ? ` <span class="badge" style="background:${STAGE_COLOR[item.st] || "#33291f"}">Stage ${esc(item.st)}</span>` : ""}
              ${item.en ? ` <span class="badge" style="background:${EN_COLOR[item.en] || "#33291f"}">${esc(item.en)} energy</span>` : ""}
            </div>
            <p>${esc(item.e)}</p>
            <dl style="display:grid;grid-template-columns:max-content 1fr;gap:4px 10px;font-size:14px">
              <dt style="font-weight:800;opacity:.7">Group</dt><dd style="margin:0">${esc(item.g || "")}</dd>
              <dt style="font-weight:800;opacity:.7">Kit</dt><dd style="margin:0">${esc(item.k || "")}</dd>
              ${item.sk ? `<dt style="font-weight:800;opacity:.7">Skill focus</dt><dd style="margin:0">${esc(item.sk)}</dd>` : ""}
            </dl>
          </div>
        </div>`;
    }

    return `
      <div class="overlay" data-overlay>
        <div class="overlay-panel">
          <button type="button" class="overlay-close" data-close>✕</button>
          ${diagramTag(item.d)}
          <h2>${esc(item.n)}</h2>
          <div class="sub">
            <span class="badge" style="background:${WCAT_COLOR[item.c] || "#33291f"}">${esc(item.c)}</span>
            ${item.t ? ` <span class="badge" style="background:#33291f">${esc(item.t)}</span>` : ""}
          </div>
          <p>${esc(item.e)}</p>
          ${item.b ? `<p><strong>Trains:</strong> ${esc(item.b)}</p>` : ""}
          ${item.p && item.p !== "-" ? `<p><strong>Progression:</strong> ${esc(item.p)}</p>` : ""}
        </div>
      </div>`;
  }

  function render() {
    root.innerHTML = `
      ${renderTabs()}
      ${state.tab === "plan" ? renderPlan() : state.tab === "acts" ? renderActs() : renderWarm()}
      ${renderOverlay()}
    `;
    const search = state.tab === "acts" ? root.querySelector("[data-aq]") : root.querySelector("[data-wq]");
    if (search) {
      search.focus();
      const pos = search.value.length;
      search.setSelectionRange(pos, pos);
    }
  }

  root.addEventListener("click", (e) => {
    const tabBtn = e.target.closest("[data-tab]");
    if (tabBtn) { state.tab = tabBtn.dataset.tab; state.sel = null; return render(); }

    const weekBtn = e.target.closest("[data-week]");
    if (weekBtn) { state.week = Number(weekBtn.dataset.week); return render(); }

    const astageBtn = e.target.closest("[data-astage]");
    if (astageBtn) { state.astage = astageBtn.dataset.astage; return render(); }

    const acatBtn = e.target.closest("[data-acat]");
    if (acatBtn) { state.acat = acatBtn.dataset.acat; return render(); }

    const wcatBtn = e.target.closest("[data-wcat]");
    if (wcatBtn) { state.wcat = wcatBtn.dataset.wcat; return render(); }

    const selBtn = e.target.closest("[data-sel]");
    if (selBtn) { state.sel = { kind: selBtn.dataset.sel, id: selBtn.dataset.id }; return render(); }

    const closeBtn = e.target.closest("[data-close]");
    if (closeBtn) { state.sel = null; return render(); }

    if (e.target.closest("[data-overlay]") === e.target) { state.sel = null; return render(); }
  });

  root.addEventListener("input", (e) => {
    if (e.target.matches("[data-aq]")) { state.aq = e.target.value; return render(); }
    if (e.target.matches("[data-wq]")) { state.wq = e.target.value; return render(); }
  });

  render();
})();
