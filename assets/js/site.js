// Shared helpers reused across gallery.html, videos/index.html, and any future listing page.

/**
 * Renders "All" + one chip per unique tag found in `items`, and wires click
 * handlers to show/hide elements matching `cardSelector` by their data-tags
 * attribute. No predefined tag list — tags are whatever strings appear in
 * the data, so new content categories need zero code changes here.
 */
function initTagFilter({ items, tagField = "tags", filterBarSelector, cardSelector }) {
  const bar = document.querySelector(filterBarSelector);
  if (!bar) return;

  const allTags = [...new Set(items.flatMap((item) => item[tagField] || []))].sort();
  if (allTags.length === 0) {
    bar.hidden = true;
    return;
  }

  const makeChip = (label, tag) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "tag-chip";
    chip.textContent = label;
    chip.dataset.tag = tag;
    return chip;
  };

  const allChip = makeChip("All", "");
  allChip.classList.add("active");
  bar.appendChild(allChip);
  allTags.forEach((tag) => bar.appendChild(makeChip(tag, tag)));

  bar.addEventListener("click", (event) => {
    const chip = event.target.closest(".tag-chip");
    if (!chip) return;

    bar.querySelectorAll(".tag-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");

    const selectedTag = chip.dataset.tag;
    document.querySelectorAll(cardSelector).forEach((card) => {
      const cardTags = (card.dataset.tags || "").split(",").filter(Boolean);
      const show = !selectedTag || cardTags.includes(selectedTag);
      card.hidden = !show;
    });
  });
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}
