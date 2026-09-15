/* Shuttle Stars diagram engine — animated top-down court diagrams.
   <ex-diagram spec='{"a":"pairsNet","arc":"high"}'></ex-diagram> */
(function () {
  const INK = '#33291f', LINE = '#d3c7b2', FLOOR = '#fbf7ef', NET = '#8a7c66';
  const C = { t: '#0b7285', o: '#e8590c', p: '#5f3dc4', g: '#2b8a3e', y: '#f0a202' };

  const svg = (inner) =>
    `<svg viewBox="0 0 320 200" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  function court() {
    let s = `<rect width="320" height="200" fill="${FLOOR}" rx="10"/>`;
    s += `<rect x="36" y="28" width="248" height="144" fill="none" stroke="${LINE}" stroke-width="2"/>`;
    s += `<line x1="36" y1="42" x2="284" y2="42" stroke="${LINE}"/><line x1="36" y1="158" x2="284" y2="158" stroke="${LINE}"/>`;
    s += `<line x1="132" y1="28" x2="132" y2="172" stroke="${LINE}"/><line x1="188" y1="28" x2="188" y2="172" stroke="${LINE}"/>`;
    s += `<line x1="36" y1="100" x2="132" y2="100" stroke="${LINE}"/><line x1="188" y1="100" x2="284" y2="100" stroke="${LINE}"/>`;
    s += `<line x1="48" y1="28" x2="48" y2="172" stroke="${LINE}"/><line x1="272" y1="28" x2="272" y2="172" stroke="${LINE}"/>`;
    s += `<line x1="160" y1="18" x2="160" y2="182" stroke="${NET}" stroke-width="4" stroke-dasharray="5 3"/>`;
    s += `<text x="160" y="14" text-anchor="middle" font-size="9" fill="${NET}" font-family="Nunito,sans-serif" font-weight="700">NET</text>`;
    return s;
  }
  const hall = () =>
    `<rect width="320" height="200" fill="${FLOOR}" rx="10"/><rect x="24" y="22" width="272" height="156" fill="none" stroke="${LINE}" stroke-width="2" rx="6"/>`;

  const P = (color, label, r) => {
    r = r || 8;
    return `<circle r="${r}" fill="${color}" stroke="#fff" stroke-width="1.5"/>` +
      (label ? `<text y="3.5" text-anchor="middle" font-size="8.5" font-weight="800" fill="#fff" font-family="Nunito,sans-serif">${label}</text>` : '');
  };
  const at = (x, y, inner) => `<g transform="translate(${x} ${y})">${inner}</g>`;
  const mov = (path, dur, inner, begin) =>
    `<g>${inner}<animateMotion dur="${dur}s" repeatCount="indefinite"${begin ? ` begin="${begin}s"` : ''} path="${path}" calcMode="linear"/></g>`;
  const shuttleG = () => `<g><circle r="3.2" fill="#fff" stroke="${INK}" stroke-width="1.5"/><circle r="1.5" fill="${C.o}"/></g>`;
  const cone = (x, y) => `<path d="M${x - 5} ${y + 4} L${x} ${y - 6} L${x + 5} ${y + 4} Z" fill="${C.y}" stroke="#c07d00" stroke-width="1"/>`;
  const hoopEl = (x, y, col) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="7" fill="none" stroke="${col || C.t}" stroke-width="2.5"/>`;
  const spot = (x, y, col) => `<circle cx="${x}" cy="${y}" r="5" fill="${col || C.y}" opacity="0.85"/>`;
  const pulse = (x, y, col, begin) =>
    `<circle cx="${x}" cy="${y}" r="4" fill="none" stroke="${col || C.o}" stroke-width="2"><animate attributeName="r" values="3;14" dur="1.6s" begin="${begin || 0}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0" dur="1.6s" begin="${begin || 0}s" repeatCount="indefinite"/></circle>`;
  // shuttle flight there-and-back between two points, arc height h
  const rally = (x1, y1, x2, y2, h, dur) => {
    const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - h;
    const d = `M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2} Q ${mx} ${my} ${x1} ${y1}`;
    return `<path d="M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}" fill="none" stroke="${C.o}" stroke-width="1.5" stroke-dasharray="2 4" opacity="0.55"/>` +
      mov(d, dur || 2.6, shuttleG());
  };
  // one-way repeated shot
  const shot = (x1, y1, x2, y2, h, dur, begin) => {
    const d = `M${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.min(y1, y2) - h} ${x2} ${y2}`;
    return `<path d="${d}" fill="none" stroke="${C.o}" stroke-width="1.5" stroke-dasharray="2 4" opacity="0.55"/>` +
      mov(d, dur || 2, shuttleG(), begin) + pulse(x2, y2, C.o, (begin || 0) + (dur || 2) * 0.9);
  };
  const arrow = (x1, y1, x2, y2, col) => {
    const a = Math.atan2(y2 - y1, x2 - x1), s = 7;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col || C.t}" stroke-width="2" opacity="0.6"/>` +
      `<path d="M${x2} ${y2} L${x2 - s * Math.cos(a - 0.4)} ${y2 - s * Math.sin(a - 0.4)} L${x2 - s * Math.cos(a + 0.4)} ${y2 - s * Math.sin(a + 0.4)} Z" fill="${col || C.t}" opacity="0.7"/>`;
  };

  const ARCH = {
    laps(s) {
      const d = 'M60 50 H260 Q276 50 276 66 V134 Q276 150 260 150 H60 Q44 150 44 134 V66 Q44 50 60 50';
      let g = `<path d="${d}" fill="none" stroke="${LINE}" stroke-width="1.5" stroke-dasharray="4 5"/>`;
      g += mov(d, 7, P(C.t)) + mov(d, 7, P(C.t), 2.3) + mov(d, 4.2, P(C.o, 'GO'), 1);
      return svg(hall() + g + at(160, 100, `<text text-anchor="middle" font-size="10" fill="${INK}" opacity="0.55" font-family="Nunito,sans-serif" font-weight="700">jog — SPRINT on the call</text>`));
    },
    widths(s) {
      const d = 'M50 0 H220 H0';
      let g = '';
      [70, 100, 130].forEach((y, i) => {
        g += `<line x1="44" y1="${y}" x2="276" y2="${y}" stroke="${LINE}" stroke-dasharray="3 5"/>` +
          at(0, y, mov(`M50 0 H270 H50`, 4.5, P(i === 1 ? C.o : C.t, i === 1 ? 'GO' : ''), i * 0.6));
      });
      return svg(hall() + g + at(160, 46, `<text text-anchor="middle" font-size="10" fill="${INK}" opacity="0.55" font-family="Nunito,sans-serif" font-weight="700">side-to-side, line to line</text>`));
    },
    updown(s) {
      const g = arrow(80, 150, 80, 60) + arrow(110, 60, 110, 150, C.o) +
        mov('M95 150 V60 V150', 4, P(C.o, 'GO')) +
        at(160, 40, `<text text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">to the net… backpedal to the line</text>`);
      return svg(hall() + `<line x1="44" y1="60" x2="276" y2="60" stroke="${NET}" stroke-width="3" stroke-dasharray="5 3"/><line x1="44" y1="150" x2="276" y2="150" stroke="${LINE}" stroke-width="2"/>` + g);
    },
    stretch(s) {
      const col = { 'Head-Shoulders': C.t, 'Arms-Wrists': C.o, Trunk: C.p, Legs: C.g }[s.c] || C.t;
      return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:18px;background:${FLOOR};border-radius:10px">
        <div style="position:relative;width:86px;height:86px;flex:none">
          <div style="position:absolute;inset:0;border-radius:50%;border:3px solid ${col};opacity:.35;animation:ssRipple 1.8s ease-out infinite"></div>
          <div style="position:absolute;inset:0;border-radius:50%;border:3px solid ${col};opacity:.35;animation:ssRipple 1.8s .9s ease-out infinite"></div>
          <div style="position:absolute;inset:14px;border-radius:50%;background:${col};display:flex;align-items:center;justify-content:center;color:#fff;font:800 16px Nunito,sans-serif;animation:ssBeat 1.8s ease-in-out infinite">${s.reps || '×8'}</div>
        </div>
        <div style="font-family:Nunito,sans-serif;max-width:150px">
          <div style="font-weight:800;color:${col};font-size:12px;letter-spacing:.06em;text-transform:uppercase">${s.zone || ''}</div>
          <div style="font-weight:700;color:${INK};font-size:13px;line-height:1.35">${s.cue || 'Slow and controlled'}</div>
        </div></div>`;
    },
    split(s) {
      let g = at(160, 105, `<g><animateTransform attributeName="transform" type="translate" values="160 105;160 96;160 105;160 105" keyTimes="0;0.15;0.3;1" dur="2s" repeatCount="indefinite" additive="replace"/>${P(C.o, 'GO', 10)}</g>`);
      g = `<g>${P(C.o, 'GO', 10)}<animateTransform attributeName="transform" type="translate" values="160 108;160 96;160 108;160 108" keyTimes="0;0.12;0.24;1" dur="1.8s" repeatCount="indefinite"/></g>`;
      const arr = arrow(120, 108, 78, 108) + arrow(200, 108, 242, 108) + arrow(160, 84, 160, 56) + `<text x="160" y="140" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">clap → bounce → land ready</text>`;
      return svg(hall() + `<circle cx="160" cy="108" r="16" fill="none" stroke="${LINE}" stroke-width="2" stroke-dasharray="3 4"/>` + arr + g);
    },
    corners(s) {
      const cs = [[70, 50], [250, 50], [250, 150], [70, 150]];
      let g = cs.map((c2) => cone(c2[0], c2[1])).join('') + spot(160, 100, C.t);
      const d = 'M160 100 L70 50 L160 100 L250 50 L160 100 L250 150 L160 100 L70 150 L160 100';
      g += `<path d="${d}" fill="none" stroke="${C.t}" stroke-width="1.5" stroke-dasharray="3 4" opacity="0.5"/>` + mov(d, 6.5, P(C.o, 'GO'));
      return svg(hall() + g + `<text x="160" y="188" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">out to a corner — back to base every time</text>`);
    },
    tag(s) {
      let g = '';
      const runners = [[90, 60, 'M0 0 H60 V40 H-20 Z'], [230, 70, 'M0 0 V50 H-70 V-20 Z'], [120, 140, 'M0 0 H90 V-30 H0 Z'], [200, 120, 'M0 0 H-60 V-40 H30 Z']];
      runners.forEach((r, i) => { g += at(r[0], r[1], mov(r[2], 5 + i, P(C.t))); });
      g += mov('M60 100 H240 V60 H80 V140 H240 Z', 6, P(C.o, 'IT', 9));
      if (s.lines) g += `<line x1="44" y1="70" x2="276" y2="70" stroke="${C.t}" stroke-width="1.5" opacity="0.4"/><line x1="44" y1="130" x2="276" y2="130" stroke="${C.t}" stroke-width="1.5" opacity="0.4"/><line x1="120" y1="24" x2="120" y2="176" stroke="${C.t}" stroke-width="1.5" opacity="0.4"/><line x1="200" y1="24" x2="200" y2="176" stroke="${C.t}" stroke-width="1.5" opacity="0.4"/>`;
      return svg(hall() + g);
    },
    chain(s) {
      const chainG = `<g>${at(-14, 0, P(C.o))}${at(0, 0, P(C.o))}${at(14, 0, P(C.o))}<line x1="-14" y1="0" x2="14" y2="0" stroke="${C.o}" stroke-width="3"/></g>`;
      return svg(hall() + mov('M80 70 H230 V140 H90 Z', 6, chainG) + at(250, 60, mov('M0 0 V80 H-40 V-30 Z', 4.5, P(C.t))) + at(70, 150, mov('M0 0 H120 V-40 H-20 Z', 5, P(C.t))));
    },
    pairsNet(s) {
      const h = { high: 72, low: 16, flat: 6, drop: 40 }[s.arc || 'high'];
      let g = rally(112, 100, 208, 100, h, s.arc === 'flat' ? 1.6 : 2.6);
      g += at(96, 100, P(C.o, 'A', 9)) + at(224, 100, P(C.t, 'B', 9));
      if (s.lunge) g += arrow(96, 116, 130, 116, C.o);
      if (s.pairs) g += at(96, 150, P(C.o, '', 6)) + at(224, 150, P(C.t, '', 6)) + rally(108, 150, 212, 150, h * 0.8, 3.1);
      return svg(court() + g);
    },
    serve(s) {
      // serve from one side into target box / zone
      const deep = s.deep;
      const tx = deep ? 262 : 196, h = s.high ? 78 : 14;
      let g = `<rect x="${deep ? 244 : 188}" y="42" width="${deep ? 34 : 24}" height="58" fill="${C.g}" opacity="0.18" stroke="${C.g}" stroke-dasharray="3 3"/>`;
      g += shot(112, 70, tx, 70, h, 2.4) + at(98, 70, P(C.o, 'A', 9));
      g += `<text x="160" y="190" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">${s.high ? 'high serve — full swing, land it deep' : 'low serve — skim the tape into the box'}</text>`;
      return svg(court() + g);
    },
    keeper(s) {
      let g = `${cone(226, 56)}${cone(226, 144)}<rect x="216" y="56" width="20" height="88" fill="${C.g}" opacity="0.12"/>`;
      g += `<g>${P(C.p, 'GK', 9)}<animateTransform attributeName="transform" type="translate" values="226 66;226 134;226 66" dur="3s" repeatCount="indefinite"/></g>`;
      g += at(96, 70, P(C.o, 'A', 8)) + at(96, 130, P(C.o, 'B', 8));
      g += shot(108, 70, 218, 96, 26, 2.6) + shot(108, 130, 218, 106, 26, 2.6, 1.3);
      return svg(court() + g + `<text x="160" y="190" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">beat the keeper into the goal zone</text>`);
    },
    circle(s) {
      const n = s.n || 6, R = 58, cx = 160, cy = 100;
      let g = s.centerHoop ? hoopEl(cx, cy) : (s.centerP ? at(cx, cy, P(C.p, 'M', 9)) : spot(cx, cy));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        g += at(x, y, P(i ? C.t : C.o, '', 7));
        if (i % 2 === 0) g += shot(x, y, cx, cy, 18, 2.2, i * 0.55);
      }
      return svg(hall() + g);
    },
    relay(s) {
      let g = '';
      [62, 100, 138].forEach((y, r) => {
        g += at(46, y, P(C.t, '', 6)) + at(62, y, P(C.t, '', 6)) + at(78, y, P(C.t, '', 6));
        g += at(0, y, mov('M94 0 H262 H94', 3.6, P(C.o, '', 7), r * 0.5)) + cone(266, y);
      });
      return svg(hall() + g + `<text x="160" y="182" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">go — round the cone — tag the next runner</text>`);
    },
    target(s) {
      let g = hoopEl(230, 60, C.t) + hoopEl(250, 110, C.g) + hoopEl(215, 150, C.p);
      g += at(90, 100, P(C.o, 'A', 9));
      g += shot(102, 100, 230, 60, 44, 2.2) + shot(102, 100, 250, 110, 40, 2.6, 1) + shot(102, 100, 215, 150, 36, 2.4, 2);
      return svg(hall() + g);
    },
    ladder(s) {
      let g = '';
      [60, 120, 180, 240].forEach((x, i) => {
        g += `<line x1="${x}" y1="70" x2="${x}" y2="130" stroke="${NET}" stroke-width="3" stroke-dasharray="4 3"/>`;
        g += at(x - 16, 100, P(i === 3 ? C.o : C.t, '', 7)) + at(x + 16, 100, P(i === 3 ? C.o : C.t, '', 7));
        g += rally(x - 10, 92, x + 10, 92, 12, 1.6 + i * 0.2);
        if (i < 3) g += arrow(x + 20, 60, x + 44, 60, C.g);
        if (i > 0) g += arrow(x - 20, 146, x - 44, 146, C.o);
      });
      return svg(hall() + g + `<text x="160" y="40" text-anchor="middle" font-size="10" fill="${C.g}" font-family="Nunito,sans-serif" font-weight="800">WINNER BUMPS UP →</text><text x="160" y="168" text-anchor="middle" font-size="10" fill="${C.o}" font-family="Nunito,sans-serif" font-weight="800">← LOSER MOVES DOWN</text>`);
    },
    middle(s) {
      const pts = [[90, 55], [230, 55], [230, 145], [90, 145]];
      let g = pts.map((p2, i) => at(p2[0], p2[1], P(C.t, String(i + 1), 8))).join('');
      g += shot(90, 55, 230, 145, 34, 2.4) + shot(230, 55, 90, 145, 34, 2.4, 1.2);
      g += `<g>${P(C.o, 'M', 9)}<animateTransform attributeName="transform" type="translate" values="140 100;180 100;160 80;140 100" dur="2.4s" repeatCount="indefinite"/></g>`;
      return svg(hall() + g + `<text x="160" y="182" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">middle player hunts the interception</text>`);
    },
    solo(s) {
      const d = 'M0 0 V-52 V0';
      let g = at(160, 118, P(C.o, '', 9)) + at(160, 100, mov(d, 1.4, shuttleG()));
      g += `<path d="M160 100 V48" stroke="${C.o}" stroke-width="1.5" stroke-dasharray="2 4" opacity="0.5"/>`;
      g += at(120, 118, P(C.t, '', 7)) + at(120, 106, mov('M0 0 V-38 V0', 1.7, shuttleG(), 0.4));
      g += at(204, 118, P(C.t, '', 7)) + at(204, 106, mov('M0 0 V-44 V0', 1.55, shuttleG(), 0.8));
      return svg(hall() + g + `<text x="160" y="160" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">keep it up — count your streak</text>`);
    },
    mirror(s) {
      const d = 'M0 0 H50 V30 H-50 V-30 H0 Z';
      return svg(court() + at(90, 100, mov(d, 5, P(C.o, 'L', 9))) + at(230, 100, mov(d, 5, P(C.t, 'F', 9))) +
        `<text x="160" y="190" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">leader moves — partner mirrors</text>`);
    },
    course(s) {
      let g = cone(70, 60) + hoopEl(130, 120) + cone(190, 60) + hoopEl(250, 120, C.p) + cone(250, 60);
      const d = 'M48 150 L70 72 L130 112 L190 72 L250 112 L250 72';
      g += `<path d="${d}" fill="none" stroke="${C.t}" stroke-width="1.5" stroke-dasharray="3 4" opacity="0.5"/>` + mov(d, 5.5, P(C.o, 'GO'));
      return svg(hall() + g + `<text x="160" y="182" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">lunge / jump / chasse through the course</text>`);
    },
    teams(s) {
      let g = '';
      [[70, 60], [105, 90], [70, 130], [110, 150]].forEach((p2) => { g += at(p2[0], p2[1], P(C.o, '', 7)); });
      [[250, 60], [215, 90], [250, 130], [215, 150]].forEach((p2) => { g += at(p2[0], p2[1], P(C.t, '', 7)); });
      g += shot(110, 90, 240, 118, 46, 2.4) + shot(215, 150, 84, 70, 46, 2.6, 1.2);
      return svg(court() + g + `<text x="160" y="190" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">hit to space — defenders catch</text>`);
    },
    golf(s) {
      let g = spot(60, 150, C.o) + `<text x="60" y="172" text-anchor="middle" font-size="9" font-weight="800" fill="${C.o}" font-family="Nunito,sans-serif">TEE</text>`;
      g += hoopEl(150, 60) + hoopEl(250, 120, C.g);
      g += `<text x="150" y="44" text-anchor="middle" font-size="9" font-weight="800" fill="${C.t}" font-family="Nunito,sans-serif">HOLE 1</text><text x="250" y="104" text-anchor="middle" font-size="9" font-weight="800" fill="${C.g}" font-family="Nunito,sans-serif">HOLE 2</text>`;
      g += shot(60, 144, 150, 62, 52, 2.4) + shot(150, 62, 250, 118, 42, 2.4, 1.2) + at(60, 136, P(C.o, '', 8));
      return svg(hall() + g);
    },
    square(s) {
      const cs = [[120, 70, '1'], [200, 70, '2'], [200, 130, '3'], [120, 130, '4']];
      let g = cs.map((c2) => spot(c2[0], c2[1]) + `<text x="${c2[0]}" y="${c2[1] - 10}" text-anchor="middle" font-size="10" font-weight="800" fill="${C.t}" font-family="Nunito,sans-serif">${c2[2]}</text>`).join('');
      const d = 'M160 100 L120 70 L160 100 L200 130 L160 100 L200 70 L160 100 L120 130 L160 100';
      g += mov(d, 6, P(C.o, 'GO', 9));
      return svg(hall() + g + `<text x="160" y="176" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">split-step, then hit the called number</text>`);
    },
    dodge(s) {
      let g = at(80, 100, P(C.t, 'T', 9));
      g += shot(94, 100, 235, 92, 8, 1.5) + shot(94, 100, 235, 112, 8, 1.5, 0.75);
      g += `<g>${P(C.o, 'D', 9)}<animateTransform attributeName="transform" type="translate" values="240 70;240 134;240 70" dur="1.5s" repeatCount="indefinite"/></g>`;
      return svg(hall() + g + `<text x="160" y="176" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">chasse sideways to dodge — never turn your back</text>`);
    },
    scoop(s) {
      let g = at(220, 140, shuttleG()) + `<circle cx="220" cy="140" r="8" fill="none" stroke="${LINE}" stroke-width="1.5" stroke-dasharray="2 3"/>`;
      g += mov('M100 100 L204 132 L100 100', 3.2, P(C.o, 'GO', 9)) + arrow(220, 128, 220, 92, C.g);
      g += hoopEl(272, 66, C.g);
      return svg(hall() + g + `<text x="160" y="182" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">lunge, scoop it onto the strings, carry to the hoop</text>`);
    },
    flip(s) {
      let g = '';
      [[80, 60], [140, 90], [200, 55], [250, 100], [110, 140], [230, 150], [170, 125]].forEach((p2, i) => { g += i % 2 ? cone(p2[0], p2[1]) : `<path d="M${p2[0] - 5} ${p2[1] - 4} L${p2[0]} ${p2[1] + 6} L${p2[0] + 5} ${p2[1] - 4} Z" fill="#d9cdb8" stroke="#b5a78e"/>`; });
      g += mov('M70 80 L140 90 L110 140 L70 80', 3.4, P(C.o, 'UP', 9)) + mov('M260 70 L250 100 L230 150 L260 70', 3.4, P(C.t, 'DN', 9));
      return svg(hall() + g + `<text x="160" y="182" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">one team flips up, one flips down — lunge, don't bend!</text>`);
    },
    around(s) {
      const pts = [[160, 46], [242, 100], [160, 154], [78, 100]];
      let g = pts.map((p2, i) => at(p2[0], p2[1], P(C.t, String(i + 1), 8))).join('') + at(160, 100, P(C.o, 'H', 9));
      g += shot(160, 52, 160, 94, 16, 2, 0) + shot(236, 100, 168, 100, 16, 2, 1) + shot(160, 148, 160, 106, 16, 2, 2) + shot(84, 100, 152, 100, 16, 2, 3);
      return svg(hall() + g + `<text x="160" y="188" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">block each feed in turn — keep turning to face</text>`);
    },
    carry(s) {
      const d = 'M60 140 L120 70 L200 130 L262 70';
      let g = `<path d="${d}" fill="none" stroke="${C.t}" stroke-width="1.5" stroke-dasharray="3 4" opacity="0.5"/>` + cone(120, 70) + cone(200, 130);
      g += mov(d, 5, `<g>${P(C.o, '', 9)}${at(0, -14, shuttleG())}</g>`);
      return svg(hall() + g + `<text x="160" y="182" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">balance the shuttle on the strings — don't drop it</text>`);
    },
    hilow(s) {
      let g = at(70, 55, P(C.t, 'HI', 9)) + at(250, 55, P(C.t, 'HI', 9)) + at(70, 145, P(C.t, 'LO', 9)) + at(250, 145, P(C.t, 'LO', 9));
      g += mov('M160 100 L84 60 L160 100 L250 140 L160 100 L244 60 L160 100 L76 140 L160 100', 7, P(C.o, 'GO', 9));
      return svg(hall() + g + `<text x="160" y="184" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">jump-touch the HIGH pads, lunge-touch the LOW</text>`);
    },
    queue(s) {
      let g = '';
      [46, 62, 78].forEach((x) => { g += at(x, 44, P(C.o, '', 6)) + at(320 - x, 160, P(C.t, '', 6)); });
      g += at(112, 100, P(C.o, 'A', 9)) + at(208, 100, P(C.t, 'B', 9)) + rally(124, 100, 196, 100, 40, 2.4);
      g += arrow(112, 116, 70, 58, C.o) + arrow(208, 84, 250, 146, C.t);
      return svg(court() + g + `<text x="160" y="190" text-anchor="middle" font-size="10" fill="${INK}" opacity="0.6" font-family="Nunito,sans-serif" font-weight="700">one rally each, then back of the queue</text>`);
    }
  };

  const KF = '@keyframes ssRipple{from{transform:scale(.6);opacity:.5}to{transform:scale(1.25);opacity:0}}@keyframes ssBeat{0%,100%{transform:scale(1)}12%{transform:scale(1.12)}24%{transform:scale(1)}}';

  class ExDiagram extends HTMLElement {
    static get observedAttributes() { return ['spec']; }
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    attributeChangedCallback() { this.render(); }
    connectedCallback() { this.render(); }
    render() {
      let s = {};
      try { s = JSON.parse(this.getAttribute('spec') || '{}'); } catch (e) { }
      const fn = ARCH[s.a] || ARCH.stretch;
      this.shadowRoot.innerHTML = `<style>:host{display:block;width:100%;height:100%}${KF}</style>` + fn(s);
    }
  }
  if (!customElements.get('ex-diagram')) customElements.define('ex-diagram', ExDiagram);
})();
