/**
 * Panther Studio — AI Font Pairing Engine (Fontjoy-style).
 *
 * Uses real visual font vectors (Fontjoy open-source dataset, PCA-200) to
 * pick typeface combinations with balanced contrast — fonts that agree on
 * some visual axes and disagree on others, like fontjoy.com does:
 *   - cosine similarity for how alike two fonts look
 *   - "contrast balance" = positive × negative cosine components, which
 *     rewards pairs that are similar in some respects and different in
 *     others (Fontjoy's core metric)
 *   - a user contrast target (0 = similar, 1 = highly contrasting)
 *   - body-slot legibility preference (sans-serif / serif first)
 */
import { FONT_VECTORS } from './fontVectors';

export interface PairedFontSlot {
  role: 'heading' | 'subheading' | 'body';
  family: string;
  category: string;
}

export interface PairingScore {
  family: string;
  cosineAvg: number;
  balance: number;
  score: number;
}

const dot = (a: number[], b: number[]) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
};

const norm = (a: number[]) => Math.sqrt(dot(a, a)) || 1;

export function getFontVector(family: string): number[] | null {
  return FONT_VECTORS[family]?.v ?? null;
}

export function getFontCategory(family: string): string {
  return FONT_VECTORS[family]?.category ?? 'sans-serif';
}

export function allPairingFonts(): { family: string; category: string }[] {
  return Object.values(FONT_VECTORS).map((e) => ({ family: e.family, category: e.category }));
}

/** Cosine similarity between two font vectors (-1..1). */
export function fontSimilarity(a: string, b: string): number {
  const va = getFontVector(a);
  const vb = getFontVector(b);
  if (!va || !vb) return 0;
  return dot(va, vb) / (norm(va) * norm(vb));
}

/**
 * Fontjoy's "contrast distance": split the cosine into its positive and
 * negative halves. The product is maximized when agreement and disagreement
 * are in equal measure — fonts that are similar on some visual axes and
 * different on others. Normalized 0..1 (1 = perfectly balanced).
 */
export function contrastBalance(a: string, b: string): number {
  const va = getFontVector(a);
  const vb = getFontVector(b);
  if (!va || !vb) return 0;
  const na = norm(va);
  const nb = norm(vb);
  let pos = 0;
  let neg = 0;
  for (let i = 0; i < va.length; i++) {
    const x = (va[i] / na) * (vb[i] / nb);
    if (x > 0) pos += x;
    else neg -= x;
  }
  const total = pos + neg;
  if (total <= 0) return 0;
  // max when pos == neg == total/2
  return (4 * pos * neg) / (total * total);
}

const mulberry = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const BODY_FRIENDLY: Record<string, number> = {
  'sans-serif': 1.0,
  serif: 0.9,
  monospace: 0.55,
  handwriting: 0.35,
  display: 0.35,
};

const DISPLAY_FRIENDLY: Record<string, number> = {
  display: 1.0,
  serif: 0.95,
  'sans-serif': 0.9,
  handwriting: 0.7,
  monospace: 0.55,
};

/**
 * Score candidate `c` against an existing set of chosen fonts.
 * - target cosine derived from the contrast slider (0 similar → 1 contrast)
 * - balance bonus from Fontjoy's pos×neg contrast metric
 * - role-specific legibility weighting
 */
function scoreCandidate(
  c: string,
  chosen: string[],
  contrast: number,
  role: 'heading' | 'subheading' | 'body',
  rng: () => number
): PairingScore {
  const cat = getFontCategory(c);
  let cosineSum = 0;
  let balanceSum = 0;
  for (const s of chosen) {
    cosineSum += fontSimilarity(c, s);
    balanceSum += contrastBalance(c, s);
  }
  const n = Math.max(1, chosen.length);
  const cosineAvg = cosineSum / n;
  const balance = balanceSum / n;

  const targetCos = 1 - 2 * contrast; // 1 (similar) → -1 (contrast)
  const similarityFit = 1 - Math.min(1, Math.abs(cosineAvg - targetCos) / 2);

  const legibility = role === 'body' ? BODY_FRIENDLY[cat] ?? 0.5 : DISPLAY_FRIENDLY[cat] ?? 0.6;

  // Small deterministic jitter so repeated Generates explore the space
  const jitter = 0.85 + rng() * 0.3;

  const score = (0.45 * similarityFit + 0.4 * balance + 0.15 * legibility) * jitter;
  return { family: c, cosineAvg, balance, score };
}

const unique = <T,>(arr: T[]) => [...new Set(arr)];

/**
 * Generate a 3-slot pairing (heading / subheading / body), honoring locked
 * slots, with the given contrast target (0..1). This mirrors Fontjoy's
 * Generate behavior: each free slot samples the font space and keeps the
 * candidate that best balances the overall composition.
 */
export function generateFontPairing(
  locked: { family: string | null; role: 'heading' | 'subheading' | 'body' }[],
  contrast: number,
  seed: number = Math.floor(Math.random() * 1e9)
): PairedFontSlot[] {
  const rng = mulberry(seed);
  const pool = allPairingFonts();
  const c = Math.max(0, Math.min(1, contrast));

  const chosen: string[] = [];
  const byRole: Record<'heading' | 'subheading' | 'body', string> = {
    heading: '',
    subheading: '',
    body: '',
  };

  // Seed from locked fonts
  for (const slot of locked) {
    if (slot.family && slot.family !== '') {
      byRole[slot.role] = slot.family;
      chosen.push(slot.family);
    }
  }

  // Greedy fill: body first (so heading/subheading get picked around it),
  // then subheading, then heading — this makes the body legibility weight
  // influence the whole composition.
  const order: Array<'body' | 'subheading' | 'heading'> = ['body', 'subheading', 'heading'];

  const pickFor = (role: 'heading' | 'subheading' | 'body', exclude: string[]): string => {
    // Sample candidates (avoid excluded + already chosen)
    const candidates: string[] = [];
    let guard = 0;
    while (candidates.length < 60 && guard < 300) {
      guard++;
      const cand = pool[Math.floor(rng() * pool.length)];
      if (!exclude.includes(cand.family)) candidates.push(cand.family);
    }
    const scored = candidates.map((fam) => scoreCandidate(fam, chosen, c, role, rng));
    scored.sort((a, b) => b.score - a.score);
    // pick among top 4 for variety
    const top = scored.slice(0, 4);
    return top[Math.floor(rng() * top.length)].family;
  };

  for (const role of order) {
    if (byRole[role]) continue; // locked
    const family = pickFor(role, chosen);
    byRole[role] = family;
    chosen.push(family);
  }

  // Anti-collision pass: re-pick near-identical pairs (cos > 0.95) so the
  // trio never contains two virtually identical fonts (locked ones win).
  const rePick = (role: 'heading' | 'subheading' | 'body') => {
    const lockedSlot = locked.find((s) => s.role === role);
    if (lockedSlot?.family) return; // never touch locked slots
    const others = (['heading', 'subheading', 'body'] as const).filter((r) => r !== role);
    const tooClose = others.some((r) => fontSimilarity(byRole[role], byRole[r]) > 0.95);
    if (!tooClose) return;
    const family = pickFor(role, chosen.filter((f) => f !== byRole[role]));
    chosen[chosen.indexOf(byRole[role])] = family;
    byRole[role] = family;
  };

  for (let pass = 0; pass < 3; pass++) {
    rePick('subheading');
    rePick('heading');
    rePick('body');
  }

  return [
    { role: 'heading', family: byRole.heading, category: getFontCategory(byRole.heading) },
    { role: 'subheading', family: byRole.subheading, category: getFontCategory(byRole.subheading) },
    { role: 'body', family: byRole.body, category: getFontCategory(byRole.body) },
  ];
}

/**
 * Rank the whole font pool as recommended companions for a given font —
 * like Fontjoy's "recommended pairings" list behind each font name.
 */
export function recommendedCompanions(family: string, contrast: number, limit: number = 12): PairingScore[] {
  const pool = allPairingFonts();
  const rng = mulberry(0x5eed + family.length);
  const c = Math.max(0, Math.min(1, contrast));
  const scored = pool
    .filter((p) => p.family !== family)
    .map((p) => scoreCandidate(p.family, [family], c, 'subheading', rng));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export function pairingQuality(pair: PairedFontSlot[]): {
  cosineHeadingSub: number;
  cosineHeadingBody: number;
  cosineSubBody: number;
  balanceAvg: number;
} {
  const [h, s, b] = pair;
  return {
    cosineHeadingSub: fontSimilarity(h.family, s.family),
    cosineHeadingBody: fontSimilarity(h.family, b.family),
    cosineSubBody: fontSimilarity(s.family, b.family),
    balanceAvg:
      (contrastBalance(h.family, s.family) +
        contrastBalance(h.family, b.family) +
        contrastBalance(s.family, b.family)) /
      3,
  };
}

/** All distinct families currently in the pool (for pickers). */
export function pairingFontPool(): string[] {
  return unique(Object.values(FONT_VECTORS).map((e) => e.family));
}
