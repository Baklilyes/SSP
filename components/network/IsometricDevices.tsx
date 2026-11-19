/**
 * Moteur de rendu Isométrique 3D authentique (Protocol Explorer)
 * Dessine les périphériques matériels vectoriels projetés en perspective axonométrique :
 * - Laptop (Client)
 * - Routeur avec antenne et panneau d'état
 * - Internet (Nuage avec globe terrestre)
 * - Résolveur DNS (Baie de serveurs 3 étages)
 * - Serveur Web (Tour serveur avec baies et câblages)
 * - Switch réseau L2 (8 ports)
 * - Caméra IP (RTSP)
 * - Décodeur TV (STB)
 */

const Yy = Math.cos(Math.PI / 6);
const jy = 0.5;
const ss = 'var(--k-line-1b3fae, #1b3fae)';
const ee = `stroke="${ss}"`;
const Wt = `${ee} stroke-width="1.3" stroke-linejoin="round"`;
const ns = { top: 'url(#face-top)', left: 'url(#face-left)', right: 'url(#face-right)' };

function Tn(e: number, t: number) {
  return (s: number, n: number, o = 0): [number, number] => [
    e + (s - n) * Yy,
    t + (s + n) * jy - o,
  ];
}

const Iu = ([e, t]: [number, number]) => `${e.toFixed(2)},${t.toFixed(2)}`;
const ht = (e: [number, number][], t = '') => `<polygon points="${e.map(Iu).join(' ')}" ${t}/>`;
const Tt = (e: [number, number][], t = '') => `<polyline points="${e.map(Iu).join(' ')}" fill="none" ${t}/>`;

function Ws(
  e: (s: number, n: number, o?: number) => [number, number],
  t: number,
  s: number,
  n: number,
  o: number,
  a: number,
  r: number
) {
  return {
    top: (i: number, c: number) => e(t + i, s + c, n + r),
    left: (i: number, c: number) => e(t + i, s + a, n + c),
    right: (i: number, c: number) => e(t + o, s + a - i, n + c),
  };
}

const V = (
  e: (i: number, c: number) => [number, number],
  t: number,
  s: number,
  n: number,
  o: number,
  a = ''
) => ht([e(t, s), e(t + n, s), e(t + n, s + o), e(t, s + o)], a);

function mn(
  e: (i: number, c: number) => [number, number],
  t: number,
  s: number,
  n: number,
  o = ''
) {
  const a: [number, number][] = [];
  for (let r = 0; r < 28; r++) {
    const i = (r / 28) * Math.PI * 2;
    a.push(e(t + n * Math.cos(i), s + n * Math.sin(i)));
  }
  return ht(a, o);
}

function pt(
  e: (s: number, n: number, o?: number) => [number, number],
  t: number,
  s: number,
  n: number,
  o: number,
  a: number,
  r: number,
  i: { top?: string; left?: string; right?: string; stroke?: string; sw?: number } = {}
) {
  const {
    top: c = 'var(--k-fill-f4f7fe, #f4f7fe)',
    left: d = 'var(--k-fill-e5edfc, #e5edfc)',
    right: p = 'var(--k-fill-d0def8, #d0def8)',
    stroke: u = ss,
    sw: y = 1.7,
  } = i;
  const T = `stroke="${u}" stroke-width="${y}" stroke-linejoin="round"`;
  return [
    ht([e(t, s, n + r), e(t + o, s, n + r), e(t + o, s + a, n + r), e(t, s + a, n + r)], `fill="${c}" ${T}`),
    ht([e(t, s + a, n), e(t + o, s + a, n), e(t + o, s + a, n + r), e(t, s + a, n + r)], `fill="${d}" ${T}`),
    ht([e(t + o, s + a, n), e(t + o, s, n), e(t + o, s, n + r), e(t + o, s + a, n + r)], `fill="${p}" ${T}`),
  ].join('');
}

function zy(
  e: (i: number, c: number) => [number, number],
  t: number,
  s: number,
  n: number,
  o: number,
  a: number,
  r: string
) {
  let i = '';
  for (let c = a; c < n; c += a) i += Tt([e(t + c, s), e(t + c, s + o)], r);
  for (let c = a; c < o; c += a) i += Tt([e(t, s + c), e(t + n, s + c)], r);
  return i;
}

const bn = (
  e: (s: number, n: number, o?: number) => [number, number],
  t: number,
  s: number,
  n: number,
  o: number,
  a: number
) => ht([e(t + n, s), e(t + n + a, s), e(t + n + a, s + o), e(t + n, s + o)], 'class="iso-shadow" fill="url(#shadow-fade)"');

/** Routeur 3D avec antenne optionnelle */
export function renderRouter(e: number, t: number, antenna = true): string {
  const n = Tn(e, t),
    o = 70,
    a = 70,
    r = 33,
    i = Ws(n, 0, 0, 0, o, a, r);
  let c = bn(n, 0, 0, o, a, 34);
  c += pt(n, 0, 0, 0, o, a, r, { ...ns, sw: 2.2 });
  const d: [number, number][] = [
    [9, 7],
    [19.5, 5],
    [28, 7],
    [39, 5],
  ];
  for (const [m, w] of d)
    c += V(i.top, m, 30.5, w, 5, `fill="var(--k-fill-a9c0ee, #a9c0ee)" ${ee} stroke-width="1.5"`);
  c += V(i.top, 30, 32, 3, 2, `fill="${ss}" stroke="none"`);
  const p = i.left;
  c += mn(p, 9.5, 17, 5, `fill="none" ${ee} stroke-width="2.6"`);
  c += V(p, 17, 13, 3.6, 8, `fill="${ss}" stroke="none"`);
  c += V(p, 15.5, 20, 6.6, 2, `fill="${ss}" stroke="none"`);
  c += V(p, 15.5, 11.5, 6.6, 2, `fill="${ss}" stroke="none"`);
  c += V(p, 30, 8, 13, 11, `fill="var(--k-fill-f4f7fe, #f4f7fe)" ${ee} stroke-width="2"`);
  const u = i.right;
  c += V(u, 9, 9, 52, 15, `fill="var(--k-fill-e8effd, #e8effd)" ${ee} stroke-width="2"`);
  c += V(u, 13, 12, 44, 9, `fill="var(--k-fill-c4d5f6, #c4d5f6)" ${Wt}`);
  for (let m = 0; m < 3; m++)
    c += Tt([u(16, 14 + m * 2.6), u(54, 14 + m * 2.6)], 'stroke="var(--k-line-8ea9e2, #8ea9e2)" stroke-width="0.9"');
  if (!antenna) return `<g class="device router">${c}</g>`;
  const [y, T] = i.top(16, 8);
  c += `<ellipse cx="${y}" cy="${T}" rx="5.2" ry="2.8" fill="var(--k-fill-c9d8f6, #c9d8f6)" ${ee} stroke-width="1.5"/>`;
  c += `<path d="M${y - 3.2},${T} L${y - 1.4},${T - 40} L${y + 1.4},${T - 40} L${y + 3.2},${T} Z" fill="var(--k-fill-c9d8f6, #c9d8f6)" ${ee} stroke-width="1.6" stroke-linejoin="round"/>`;
  c += `<circle cx="${y}" cy="${T - 43.5}" r="4" fill="var(--k-fill-f4f7fe, #f4f7fe)" ${ee} stroke-width="1.8"/>`;
  return `<g class="device router">${c}</g>`;
}

/** Switch réseau L2 3D (8 ports) */
export function renderSwitch(e: number, t: number): string {
  const s = Tn(e, t),
    n = 84,
    o = 38,
    a = 13,
    r = Ws(s, 0, 0, 0, n, o, a);
  let i = bn(s, 0, 0, n, o, 24);
  i += pt(s, 0, 0, 0, n, o, a, { ...ns, sw: 2.1 });
  const c = r.left;
  i += mn(c, 6, 6.5, 2.6, `fill="none" ${ee} stroke-width="1.6"`);
  for (let p = 0; p < 8; p++) {
    const u = 12.5 + p * 8.7;
    i += V(c, u, 2.6, 6.8, 7, `fill="var(--k-fill-f4f7fe, #f4f7fe)" ${ee} stroke-width="1.3"`);
    i += V(c, u + 1.7, 4, 3.4, 2.9, 'fill="var(--k-fill-c4d5f6, #c4d5f6)" stroke="none"');
    i += V(r.top, u + 1.6, o - 5.4, 3.6, 2.4, `fill="var(--k-fill-a9c0ee, #a9c0ee)" ${ee} stroke-width="1"`);
  }
  i += V(r.top, 9, 7, n - 18, o - 17, 'fill="none" stroke="var(--k-line-8ea9e2, #8ea9e2)" stroke-width="1"');
  const d = r.right;
  for (let p = 0; p < 3; p++)
    i += V(d, 7 + p * 8, 4, 4.2, 5.4, `fill="var(--k-fill-c4d5f6, #c4d5f6)" ${Wt}`);
  return `<g class="device switch">${i}</g>`;
}

/** Caméra IP 3D (RTSP) */
export function renderCamera(e: number, t: number): string {
  const s = Tn(e, t);
  let n = bn(s, 4, 4, 34, 34, 22);
  n += pt(s, 4, 4, 0, 34, 34, 5, { ...ns, sw: 1.9 });
  n += pt(s, 17, 17, 5, 8, 8, 20, { ...ns, sw: 1.7 });
  const o = 62,
    a = 30,
    r = 26,
    i = 25,
    c = Ws(s, -6, 6, i, o, a, r);
  n += pt(s, -6, 6, i, o, a, r, { ...ns, sw: 2.1 });
  const d = c.left;
  n += mn(d, 13, 13, 9.5, `fill="var(--k-fill-f4f7fe, #f4f7fe)" ${ee} stroke-width="2"`);
  n += mn(d, 13, 13, 6, `fill="var(--k-fill-c4d5f6, #c4d5f6)" ${ee} stroke-width="1.5"`);
  n += mn(d, 13, 13, 2.4, `fill="${ss}" stroke="none"`);
  n += mn(d, 28, 19, 1.8, `fill="var(--k-fill-a9c0ee, #a9c0ee)" ${ee} stroke-width="1"`);
  for (let p = 0; p < 3; p++)
    n += V(d, 36 + p * 7, 6, 3.5, 13, `fill="var(--k-fill-c4d5f6, #c4d5f6)" ${Wt}`);
  n += pt(s, -12, 4, i + r, o + 8, a + 4, 3, {
    top: 'var(--k-fill-f4f7fe, #f4f7fe)',
    left: 'var(--k-fill-e5edfc, #e5edfc)',
    right: 'var(--k-fill-d0def8, #d0def8)',
    sw: 1.6,
  });
  return `<g class="device camera">${n}</g>`;
}

/** Décodeur TV 3D (STB / IGMP) */
export function renderTvBox(e: number, t: number): string {
  const s = Tn(e, t);
  let n = bn(s, 0, 0, 80, 60, 26);
  n += pt(s, 30, 18, 0, 22, 14, 3, { ...ns, sw: 1.6 });
  n += pt(s, 38, 22, 3, 6, 5, 9, { ...ns, sw: 1.5 });
  const o = 82,
    a = 6,
    r = 52,
    i = 12,
    c = Ws(s, 0, 20, i, o, a, r);
  n += pt(s, 0, 20, i, o, a, r, { ...ns, sw: 2.1 });
  const d = c.left;
  n += V(d, 4, 4, o - 8, r - 8, `fill="var(--k-fill-dce6fb, #dce6fb)" ${ee} stroke-width="1.5"`);
  n += V(d, 10, 30, 20, 12, 'fill="var(--k-fill-a9c0ec, #a9c0ec)" stroke="none"');
  for (let u = 0; u < 3; u++)
    n += Tt([d(36, 38 - u * 6), d(70, 38 - u * 6)], 'stroke="var(--k-line-a9c0ec, #a9c0ec)" stroke-width="2.6" stroke-linecap="round"');
  const p = Ws(s, 18, 40, 0, 46, 26, 9);
  n += pt(s, 18, 40, 0, 46, 26, 9, { ...ns, sw: 1.9 });
  n += V(p.left, 5, 3, 14, 3.4, `fill="var(--k-fill-c4d5f6, #c4d5f6)" ${Wt}`);
  n += mn(p.left, 38, 4.6, 1.6, `fill="var(--k-fill-a9c0ee, #a9c0ee)" ${ee} stroke-width="1"`);
  return `<g class="device tv">${n}</g>`;
}

/** Résolveur DNS 3D (Baie de serveurs 3 étages) */
export function renderDnsServer(e: number, t: number): string {
  const s = Tn(e, t),
    n = 40.5,
    o = 40.5,
    a = 13.6,
    r = 2.9;
  let i = bn(s, 0, 0, n, o, 30);
  i += pt(s, 1.5, 1.5, 0, n - 3, o - 3, a * 3 + r * 2, {
    top: 'var(--k-fill-2f55c2, #2f55c2)',
    left: 'var(--k-fill-2f55c2, #2f55c2)',
    right: 'var(--k-fill-24479f, #24479f)',
  });
  for (let c = 0; c < 3; c++) {
    const d = c * (a + r),
      p = Ws(s, 0, 0, d, n, o, a);
    i += pt(s, 0, 0, d, n, o, a, { ...ns, sw: 1.9 });
    if (c === 0) {
      i += V(p.left, 4, 3.8, 7, 5.6, `fill="var(--k-fill-5ed6ea, #5ed6ea)" ${Wt}`);
      i += V(p.left, 13, 3.8, 9, 5.6, `fill="var(--k-fill-d7e3fa, #d7e3fa)" ${Wt}`);
      i += V(p.left, 24, 3.8, 6, 5.6, `fill="var(--k-fill-5ed6ea, #5ed6ea)" ${Wt}`);
    } else {
      i += V(p.left, 4, 3.8, 27, 5.6, `fill="var(--k-fill-5ed6ea, #5ed6ea)" ${Wt}`);
      i += V(p.left, 4, 3.8, 9, 5.6, 'fill="var(--k-fill-a6eef6, #a6eef6)" stroke="none"');
    }
    i += V(p.right, 4, 3.8, 32, 5.6, `fill="var(--k-fill-9fbcf0, #9fbcf0)" ${Wt}`);
    if (c === 2) {
      i += V(p.top, 8.5, 8.5, 23.5, 23.5, `fill="var(--k-fill-dfe8fb, #dfe8fb)" ${ee} stroke-width="1.6"`);
      i += zy(p.top, 8.5, 8.5, 23.5, 23.5, 2.6, 'stroke="var(--k-line-7d9be0, #7d9be0)" stroke-width="0.6"');
    }
  }
  return `<g class="device dns">${i}</g>`;
}

/** Serveur Web 3D (Grande tour armoire serveur) */
export function renderWebServer(e: number, t: number): string {
  const s = Tn(e, t),
    n = 56.6,
    o = 56.6,
    a = 70,
    r = Ws(s, 0, 0, 0, n, o, a);
  let i = bn(s, 0, 0, n, o, 40);
  i += pt(s, 0, 0, 0, n, o, a, {
    top: 'url(#face-top)',
    left: 'var(--k-fill-f4f8ff, #f4f8ff)',
    right: 'url(#face-right)',
    sw: 2.3,
  });
  i += V(r.top, 10, 10, 37, 37, `fill="var(--k-fill-c9d8f4, #c9d8f4)" ${ee} stroke-width="1.2"`);
  for (let u = 2.2; u < 37; u += 2.2)
    i += Tt([r.top(10 + u, 10), r.top(10 + u, 47)], 'stroke="var(--k-line-9db5e6, #9db5e6)" stroke-width="0.7"');
  const c = r.left;
  for (let u = 0; u < 3; u++) {
    const y = 6 + u * 20.5;
    i += V(c, 4.5, y, 47.5, 17, `fill="var(--k-fill-f5f8ff, #f5f8ff)" ${ee} stroke-width="2"`);
    i += V(c, 7.5, y + 3, 41.5, 11, `fill="var(--k-fill-e3ebfc, #e3ebfc)" ${Wt}`);
    const T: [number, number][] = [
      [10, 5],
      [16, 3],
      [21, 3],
      [36, 3.4],
    ];
    for (const [m, w] of T)
      i += V(c, m, y + 5, w, 7, 'fill="var(--k-fill-3d63c9, #3d63c9)" stroke="none"');
    i += V(c, 26, y + 6, 7, 5, 'fill="var(--k-fill-a7bff0, #a7bff0)" stroke="none"');
  }
  const d = r.right,
    p = `fill="none" ${ee} stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"`;
  i += V(d, 8, 34, 40, 27, `fill="var(--k-fill-c7d8f7, #c7d8f7)" ${p}`);
  i += Tt([d(8, 52), d(30, 52), d(30, 46), d(48, 46)], p);
  i += Tt([d(14, 40), d(26, 40), d(26, 34)], p);
  i += Tt([d(36, 61), d(36, 54), d(44, 54)], p);
  i += V(d, 8, 9, 16, 15, `fill="var(--k-fill-c7d8f7, #c7d8f7)" ${p}`);
  i += V(d, 30, 9, 16, 15, `fill="var(--k-fill-c7d8f7, #c7d8f7)" ${p}`);
  i += Tt([d(30, 19), d(36, 19), d(36, 24)], p);
  i += `<circle cx="${d(47, 1)[0]}" cy="${d(47, 1)[1]}" r="2.6" fill="${ss}"/>`;
  return `<g class="device web">${i}</g>`;
}

/** Laptop 3D (Client - écran ouvert, clavier, pavé tactile) */
export function renderLaptop(e: number, t: number): string {
  const s = Tn(e, t),
    n = 56,
    o = 86,
    a = 5,
    r = Ws(s, 0, 0, 0, n, o, a);
  let i = bn(s, -4, 0, n + 4, o, 30);
  i += ht([s(-4, o), s(n, o), s(n + 10, o + 8), s(-4, o + 8)], 'class="iso-shadow" fill="url(#shadow-fade)"');
  const c = 64,
    d = 3,
    p = 3,
    u = 82,
    y = (A: number) => (N: number, L: number): [number, number] =>
      s(A - (d * L) / c, p + u - N, a + L),
    T = y(-7),
    m = y(0),
    w = (
      A: (N: number, L: number) => [number, number],
      N: number,
      L: number,
      Q: number,
      ne: number
    ) => [A(N, L), A(N + Q, L), A(N + Q, L + ne), A(N, L + ne)];
  i += ht(w(T, 0, 0, u, c), `fill="var(--k-fill-e2ebfc, #e2ebfc)" ${ee} stroke-width="2" stroke-linejoin="round"`);
  i += ht([T(0, 0), m(0, 0), m(0, c), T(0, c)], `fill="var(--k-fill-cddcf8, #cddcf8)" ${ee} stroke-width="1.6" stroke-linejoin="round"`);
  i += ht([T(0, c), m(0, c), m(u, c), T(u, c)], `fill="var(--k-fill-cddcf8, #cddcf8)" ${ee} stroke-width="1.6" stroke-linejoin="round"`);
  i += ht(w(m, 0, 0, u, c), `fill="var(--k-fill-f4f7fe, #f4f7fe)" ${ee} stroke-width="2" stroke-linejoin="round"`);
  i += ht(w(m, 4.5, 5, u - 9, c - 9.5), `fill="var(--k-fill-dce6fb, #dce6fb)" ${ee} stroke-width="1.5" stroke-linejoin="round"`);
  i += ht(w(m, 4.5, c - 14, u - 9, 9.5), `fill="var(--k-fill-f2f6fe, #f2f6fe)" ${ee} stroke-width="1.2" stroke-linejoin="round"`);
  i += Tt([m(9, c - 9.3), m(24, c - 9.3)], 'stroke="var(--k-line-9db5e8, #9db5e8)" stroke-width="2.2" stroke-linecap="round"');
  i += '<g class="screen-content">';
  i += ht(w(m, 10, 13, 22, 24), 'fill="var(--k-fill-a9c0ec, #a9c0ec)" stroke="none"');
  for (let A = 0; A < 4; A++)
    i += Tt([m(38, 33 - A * 6), m(68, 33 - A * 6)], 'stroke="var(--k-line-a9c0ec, #a9c0ec)" stroke-width="3.2" stroke-linecap="round" pathLength="1"');
  i += '</g>';
  i += pt(s, 0, 0, 0, n, o, a, {
    top: 'var(--k-fill-f5f8ff, #f5f8ff)',
    left: 'var(--k-fill-dfe8fc, #dfe8fc)',
    right: 'var(--k-fill-cddcf8, #cddcf8)',
    sw: 2.1,
  });
  const k = r.top;
  i += V(k, 6, 9, 27, 68, `fill="var(--k-fill-dce7fb, #dce7fb)" ${ee} stroke-width="1.6"`);
  for (let A = 6 + 5.4; A < 33; A += 5.4)
    i += Tt([k(A, 9), k(A, 77)], `stroke="${ss}" stroke-width="0.9"`);
  for (let A = 9 + 4.85; A < 77; A += 4.85)
    i += Tt([k(6, A), k(33, A)], `stroke="${ss}" stroke-width="0.9"`);
  i += V(k, 38, 28, 13, 30, `fill="var(--k-fill-c3d4f5, #c3d4f5)" ${Wt}`);
  return `<g class="device laptop">${i}</g>`;
}

/** Internet 3D (Nuage doux avec globe et lignes de longitude/latitude) */
export function renderCloud(e: number, t: number): string {
  const s: [number, number, number][] = [
    [-60, 10, 21],
    [-32, -16, 20],
    [-6, -36, 17],
    [22, -36, 26],
    [46, -16, 20],
    [58, 3, 22],
    [40, 22, 24],
    [-24, 24, 24],
    [8, 2, 32],
    [-20, 6, 26],
  ];
  const n = (i: string, c = 0, d = 0) =>
    s.map(([p, u, y]) => `<circle cx="${e + p + c}" cy="${t + u + d}" r="${y}" ${i}/>`).join('');
  const o = e + 20,
    a = t,
    r = 19.5;
  return `<g class="device cloud">
    <clipPath id="cloud-clip">${n('')}</clipPath>
    <ellipse cx="${e + 12}" cy="${t + 44}" rx="80" ry="10" class="iso-shadow round" fill="url(#shadow-round)"/>
    ${n(`fill="var(--k-fill-fdfdff, #fdfdff)" ${ee} stroke-width="4.6"`)}
    <g clip-path="url(#cloud-clip)">
      ${n('fill="var(--k-fill-e3eaf8, #e3eaf8)"')}
      ${n('fill="var(--k-fill-fdfdff, #fdfdff)"', 3, -4)}
    </g>
    <g fill="none" ${ee} stroke-width="2.4" stroke-linecap="round">
      <circle cx="${o}" cy="${a}" r="${r}" fill="var(--k-fill-fdfdff, #fdfdff)"/>
      <ellipse cx="${o}" cy="${a}" rx="8.5" ry="${r}"/>
      <line x1="${o}" y1="${a - r}" x2="${o}" y2="${a + r}"/>
      <path d="M${o - r},${a} H${o + r}"/>
      <path d="M${o - 16},${a - 10} Q${o},${a - 5} ${o + 16},${a - 10} M${o - 16},${a + 10} Q${o},${a + 15} ${o + 16},${a + 10}"/>
    </g>
  </g>`;
}

/** Dictionnaire des coordonnées de lanes parallèles authentiques */
function qe(e: string, t: string, [s, n]: [number, number], [o, a]: [number, number], r = 5.5) {
  const i = Math.hypot(o - s, a - n);
  const c = (-(a - n) / i) * r;
  const d = ((o - s) / i) * r;
  return {
    [`${e}>${t}`]: [s + c, n + d, o + c, a + d] as [number, number, number, number],
    [`${t}>${e}`]: [o - c, a - d, s - c, n - d] as [number, number, number, number],
  };
}

export const LANES_MAP: Record<string, [number, number, number, number]> = {
  'client>router': [262, 430, 371, 383],
  'router>client': [376, 355, 268, 403],
  'router>internet': [508.4, 357.1, 668.4, 434.8],
  'internet>router': [663.6, 444.6, 503.6, 366.9],
  'internet>dns': [690, 418, 690, 231],
  'dns>internet': [712, 229, 712, 404],
  'internet>web': [776, 418, 776, 254],
  'web>internet': [797, 264, 797, 438],
  ...qe('internet', 'root', [799, 432], [928, 316]),
  ...qe('internet', 'tld', [812, 457], [968, 440]),
  ...qe('internet', 'auth', [796, 492], [925, 580]),
  ...qe('internet', 'mx', [812, 455], [956, 395]),
  'internet>relay': [690, 418, 690, 231],
  'relay>internet': [712, 229, 712, 404],
  ...qe('web', 'app', [868, 240], [936, 292]),
  ...qe('router', 'lan', [398, 318], [356, 262]),
  ...qe('router', 'isp', [492, 392], [548, 428]),
  ...qe('isp', 'transit', [640, 418], [706, 374]),
  ...qe('transit', 'hosting', [802, 374], [836, 410]),
  ...qe('hosting', 'app', [924, 414], [950, 364]),
  ...qe('client', 'switch', [247, 402], [271, 370]),
  ...qe('switch', 'lan', [304, 314], [324, 266]),
  ...qe('switch', 'router', [337, 366], [386, 389]),
  ...qe('router', 'cam', [398, 318], [356, 262]),
  ...qe('switch', 'stb', [304, 314], [324, 266]),
  ...qe('router', 'bng', [492, 392], [653, 460]),
  ...qe('internet', 'remote', [800, 440], [930, 394]),
  ...qe('remote', 'peer', [1035, 388], [1095, 420]),
  ...qe('client', 'ap', [240, 446], [380, 240]),
  ...qe('ap', 'router', [380, 240], [440, 339]),
  ...qe('router', 'stb', [440, 339], [324, 191]),
};

export const ROUTES_MAP: Record<string, string[]> = {
  'client>dns': ['client>router', 'router>internet', 'internet>dns'],
  'dns>client': ['dns>internet', 'internet>router', 'router>client'],
  'client>web': ['client>router', 'router>internet', 'internet>web'],
  'web>client': ['web>internet', 'internet>router', 'router>client'],
  'client>mx': ['client>router', 'router>internet', 'internet>mx'],
  'mx>client': ['mx>internet', 'internet>router', 'router>client'],
  'client>ap': ['client>ap'],
  'ap>client': ['ap>client'],
  'ap>auth': ['ap>router', 'router>internet', 'internet>auth'],
  'auth>ap': ['auth>internet', 'internet>router', 'router>ap'],
  'router>stb': ['router>stb'],
  'stb>router': ['stb>router'],
  'relay>app': ['relay>internet', 'internet>web', 'web>app'],
  'app>relay': ['app>web', 'web>internet', 'internet>relay'],
  'dns>root': ['dns>internet', 'internet>root'],
  'root>dns': ['root>internet', 'internet>dns'],
  'dns>tld': ['dns>internet', 'internet>tld'],
  'tld>dns': ['tld>internet', 'internet>dns'],
  'dns>auth': ['dns>internet', 'internet>auth'],
  'auth>dns': ['auth>internet', 'internet>dns'],
  'client>router': ['client>router'],
  'router>client': ['router>client'],
  'client>internet': ['client>router', 'router>internet'],
  'internet>client': ['internet>router', 'router>client'],
  'router>web': ['router>internet', 'internet>web'],
  'web>router': ['web>internet', 'internet>router'],
  'web>dns': ['web>internet', 'internet>dns'],
  'dns>web': ['dns>internet', 'internet>web'],
  'web>mx': ['web>internet', 'internet>mx'],
  'mx>web': ['mx>internet', 'internet>web'],
  'client>relay': ['client>router', 'router>internet', 'internet>relay'],
  'relay>client': ['relay>internet', 'internet>router', 'router>client'],
  'relay>web': ['relay>internet', 'internet>web'],
  'web>relay': ['web>internet', 'internet>relay'],
  'web>app': ['web>app'],
  'app>web': ['app>web'],
  'client>lan': ['client>router', 'router>lan'],
  'lan>client': ['lan>router', 'router>client'],
  'router>lan': ['router>lan'],
  'lan>router': ['lan>router'],
  'client>switch': ['client>switch'],
  'switch>client': ['switch>client'],
  'switch>lan': ['switch>lan'],
  'lan>switch': ['lan>switch'],
  'switch>router': ['switch>router'],
  'router>switch': ['router>switch'],
  'router>isp': ['router>isp'],
  'isp>router': ['isp>router'],
  'router>bng': ['router>bng'],
  'bng>router': ['bng>router'],
  'client>cam': ['client>router', 'router>cam'],
  'cam>client': ['cam>router', 'router>client'],
  'switch>stb': ['switch>stb'],
  'stb>switch': ['stb>switch'],
  'isp>transit': ['isp>transit'],
  'transit>isp': ['transit>isp'],
  'hosting>transit': ['hosting>transit'],
  'transit>hosting': ['transit>hosting'],
  'client>app': ['client>router', 'router>isp', 'isp>transit', 'transit>hosting', 'hosting>app'],
  'app>client': ['app>hosting', 'hosting>transit', 'transit>isp', 'isp>router', 'router>client'],
  'client>peer': ['client>router', 'router>internet', 'internet>remote', 'remote>peer'],
  'peer>client': ['peer>remote', 'remote>internet', 'internet>router', 'router>client'],
  'peer>web': ['peer>remote', 'remote>internet', 'internet>web'],
  'web>peer': ['web>internet', 'internet>remote', 'remote>peer'],
  'peer>relay': ['peer>remote', 'remote>internet', 'internet>relay'],
  'relay>peer': ['relay>internet', 'internet>remote', 'remote>peer'],
};
