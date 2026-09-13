// Rule-based match scoring between a saved buyer preference and a vehicle listing.
import { asList, type PreferenceAnswers } from '@/lib/buildQuestions';

export interface MatchableVehicle {
  make: string;
  model: string;
  year: number;
  price: number | null;
  fuel_type?: string | null;
  transmission?: string | null;
  body_type?: string | null;
  description?: string | null;
  price_on_request?: boolean | null;
}

export interface MatchResult {
  score: number;
  label: 'Perfect match' | 'Great match' | 'Good match' | 'Not your style';
  reasons: string[];
}

const WEIGHTS = {
  type: 20,
  year: 15,
  price: 15,
  vibe: 15,
  useCase: 15,
  fuel: 10,
  transmission: 10,
};

// Which body types plausibly satisfy each questionnaire vehicle type
const TYPE_MAP: Record<string, string[]> = {
  sedan: ['sedan', 'saloon'],
  suv: ['suv', 'crossover', 'wagon'],
  hatchback: ['hatchback', 'hatch'],
  van: ['van', 'mpv', 'minivan', 'bus'],
  pickup: ['pickup', 'truck', 'double cab'],
  sports: ['coupe', 'convertible', 'sports', 'sedan'],
};

const VIBE_HINTS: Record<string, string[]> = {
  luxury: ['mercedes', 'bmw', 'audi', 'lexus', 'land rover', 'range rover', 'porsche', 'jaguar', 'volvo'],
  practical: ['toyota', 'nissan', 'honda', 'mazda', 'suzuki', 'isuzu'],
  sporty: ['subaru', 'bmw', 'mazda', 'porsche', 'audi'],
  eco: ['toyota', 'honda', 'nissan', 'tesla', 'byd'],
  professional: ['toyota', 'mercedes', 'volkswagen', 'bmw', 'lexus'],
};

const USE_CASE_TYPES: Record<string, string[]> = {
  commute: ['sedan', 'hatchback', 'saloon'],
  adventure: ['suv', 'pickup', 'truck', 'crossover'],
  business: ['sedan', 'suv', 'saloon'],
  family: ['suv', 'van', 'mpv', 'wagon'],
  occasional: [],
};

const norm = (v?: string | null) => (v || '').toLowerCase().trim();

export function scoreVehicle(pref: PreferenceAnswers, v: MatchableVehicle): MatchResult {
  let score = 0;
  const reasons: string[] = [];
  const body = norm(v.body_type);
  const make = norm(v.make);

  // Vehicle type — any selected type counts as a match
  const wantTypes = asList(pref.vehicle_type);
  if (wantTypes.length === 0) {
    score += WEIGHTS.type * 0.5;
  } else {
    const hit = wantTypes.find((t) => body && (TYPE_MAP[t] || [t]).includes(body));
    if (hit) {
      score += WEIGHTS.type;
      reasons.push(`Matches your ${hit} preference`);
    } else if (!body) {
      score += WEIGHTS.type * 0.5;
    }
  }

  // Year
  const yMin = pref.year_min ?? null;
  const yMax = pref.year_max ?? null;
  if (yMin === null && yMax === null) {
    score += WEIGHTS.year * 0.5;
  } else if ((yMin === null || v.year >= yMin) && (yMax === null || v.year <= yMax)) {
    score += WEIGHTS.year;
    reasons.push('Within your year range');
  } else {
    const distance = yMin !== null && v.year < yMin ? yMin - v.year : yMax !== null ? v.year - yMax : 99;
    if (distance <= 2) score += WEIGHTS.year * 0.5;
  }

  // Price
  const price = v.price_on_request ? null : v.price;
  const pMin = pref.price_min ?? null;
  const pMax = pref.price_max ?? null;
  if (price === null || (pMin === null && pMax === null)) {
    score += WEIGHTS.price * 0.5;
  } else if ((pMin === null || price >= pMin) && (pMax === null || price <= pMax)) {
    score += WEIGHTS.price;
    reasons.push('Inside your budget');
  } else if (pMax !== null && price <= pMax * 1.15) {
    score += WEIGHTS.price * 0.5;
    reasons.push('Slightly above your budget');
  }

  // Vibe — any selected vibe counts
  const wantVibes = asList(pref.vibe);
  if (wantVibes.length === 0) {
    score += WEIGHTS.vibe * 0.5;
  } else {
    const hitVibe = wantVibes.find((vb) => (VIBE_HINTS[vb] || []).some((h) => make.includes(h)));
    if (hitVibe) {
      score += WEIGHTS.vibe;
      reasons.push(`Fits your ${hitVibe} vibe`);
    } else {
      score += WEIGHTS.vibe * 0.5;
    }
  }

  // Use case — any selected use case counts
  const wantUses = asList(pref.primary_use_case);
  const useTypes = wantUses.flatMap((u) => USE_CASE_TYPES[u] || []);
  if (wantUses.length === 0 || useTypes.length === 0) {
    score += WEIGHTS.useCase * 0.5;
  } else if (body && useTypes.includes(body)) {
    score += WEIGHTS.useCase;
    reasons.push('Suits how you plan to use it');
  } else if (!body) {
    score += WEIGHTS.useCase * 0.5;
  }

  // Fuel
  const fuel = norm(v.fuel_type);
  const wantFuels = asList(pref.fuel_type_preference);
  const fuelHit = wantFuels.find((f) =>
    f === 'hybrid' ? fuel.includes('hybrid') || fuel.includes('electric') : fuel === f,
  );
  if (wantFuels.length === 0 || wantFuels.includes('both')) {
    score += WEIGHTS.fuel * 0.5;
  } else if (fuelHit) {
    score += WEIGHTS.fuel;
    reasons.push(fuelHit === 'hybrid' ? 'Hybrid or electric, as you asked' : `${fuelHit} engine`);
  }

  // Transmission
  const trans = norm(v.transmission);
  const wantTransList = asList(pref.transmission_preference);
  const transHit = wantTransList.find((t) => trans.includes(t));
  if (wantTransList.length === 0 || wantTransList.includes('both') || !trans) {
    score += WEIGHTS.transmission * 0.5;
  } else if (transHit) {
    score += WEIGHTS.transmission;
    reasons.push(`${transHit} transmission`);
  }

  const rounded = Math.round(score);
  const label: MatchResult['label'] =
    rounded >= 85 ? 'Perfect match' : rounded >= 70 ? 'Great match' : rounded >= 50 ? 'Good match' : 'Not your style';

  return { score: rounded, label, reasons: reasons.slice(0, 3) };
}

export function rankVehicles<T extends MatchableVehicle>(
  pref: PreferenceAnswers,
  vehicles: T[],
  minScore = 50,
): Array<T & { match: MatchResult }> {
  return vehicles
    .map((v) => ({ ...v, match: scoreVehicle(pref, v) }))
    .filter((v) => v.match.score >= minScore)
    .sort((a, b) => b.match.score - a.match.score);
}
