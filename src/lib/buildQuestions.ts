// "Build Your Perfect Vehicle" questionnaire definition.
// Field keys map 1:1 to columns on public.buyer_preferences.

export type QuestionKind = 'single' | 'multi' | 'range' | 'number-range';

export interface QuestionOption {
  value: string;
  label: string;
  hint?: string;
  emoji?: string;
}

export interface Question {
  id: string;
  section: string;
  kind: QuestionKind;
  title: string;
  help?: string;
  /** field(s) on the preference record */
  field: string;
  fieldMax?: string;
  options?: QuestionOption[];
  max?: number; // for multi-select
  min?: number; // for ranges
  rangeMax?: number;
  step?: number;
}

export interface PreferenceAnswers {
  profile_name?: string;
  vehicle_type?: string[] | null;
  year_min?: number | null;
  year_max?: number | null;
  price_min?: number | null;
  price_max?: number | null;
  mileage_preference?: string[] | null;
  primary_use_case?: string[] | null;
  commute_distance_km?: number | null;
  vibe?: string[] | null;
  maintenance_budget_range?: string[] | null;
  include_in_transit_vehicles?: boolean;
  transmission_preference?: string[] | null;
  fuel_type_preference?: string[] | null;
  preferred_features?: string[];
  interior_vibe?: string[] | null;
  fuel_efficiency_importance?: string[] | null;
  purchase_timeline?: string | null;
  notification_preference?: string | null;
  trust_priorities?: string[];
}

const CURRENT_YEAR = new Date().getFullYear();

export const QUESTIONS: Question[] = [
  // Section 1 — Vehicle basics
  {
    id: 'vehicle_type',
    section: 'Vehicle basics',
    kind: 'multi',
    field: 'vehicle_type',
    max: 6,
    title: 'What type of vehicle appeals to you?',
    options: [
      { value: 'sedan', label: 'Sedan', hint: 'Daily commute comfort', emoji: '🚗' },
      { value: 'suv', label: 'SUV / Crossover', hint: 'Space & versatility', emoji: '🚙' },
      { value: 'hatchback', label: 'Hatchback', hint: 'Agile & practical', emoji: '🚘' },
      { value: 'van', label: 'Van / MPV', hint: 'Family transport', emoji: '🚐' },
      { value: 'pickup', label: 'Truck / Pickup', hint: 'Work & adventure', emoji: '🛻' },
      { value: 'sports', label: 'Sports / Luxury', hint: 'Performance & status', emoji: '🏎️' },
    ],
  },
  {
    id: 'year_range',
    section: 'Vehicle basics',
    kind: 'range',
    field: 'year_min',
    fieldMax: 'year_max',
    title: "What's your ideal year range?",
    min: 2005,
    rangeMax: CURRENT_YEAR,
    step: 1,
  },
  {
    id: 'price_range',
    section: 'Vehicle basics',
    kind: 'number-range',
    field: 'price_min',
    fieldMax: 'price_max',
    title: 'What is your total budget?',
    help: 'This is your total budget — monthly financing is available.',
    min: 250_000,
    rangeMax: 200_000_000,
    step: 250_000,
  },
  {
    id: 'mileage_preference',
    section: 'Vehicle basics',
    kind: 'multi',
    field: 'mileage_preference',
    max: 4,
    title: 'Mileage preference?',
    options: [
      { value: 'under_50k', label: 'Under 50,000 km', hint: 'Nearly new' },
      { value: '50_150k', label: '50K – 150K km', hint: 'Low mileage' },
      { value: '150_300k', label: '150K – 300K km', hint: 'Moderate' },
      { value: 'over_300k', label: '300K+ km', hint: 'Budget-friendly, still reliable' },
    ],
  },

  // Section 2 — Lifestyle & use case
  {
    id: 'primary_use_case',
    section: 'Lifestyle',
    kind: 'multi',
    field: 'primary_use_case',
    max: 5,
    title: "What's your primary use case?",
    options: [
      { value: 'commute', label: 'Daily commute to work or school', emoji: '🏙️' },
      { value: 'adventure', label: 'Weekend adventures & fun', emoji: '⛰️' },
      { value: 'business', label: 'Business / professional transport', emoji: '💼' },
      { value: 'family', label: 'Family daily transportation', emoji: '👨‍👩‍👧' },
      { value: 'occasional', label: 'Occasional / special trips', emoji: '🧭' },
    ],
  },
  {
    id: 'commute_distance_km',
    section: 'Lifestyle',
    kind: 'single',
    field: 'commute_distance_km',
    title: 'How far do you travel on a typical day?',
    help: 'Fuel efficiency matters a lot more above 30 km a day.',
    options: [
      { value: '5', label: 'Up to 5 km', hint: 'Short hops' },
      { value: '15', label: '5 – 15 km', hint: 'Moderate commute' },
      { value: '30', label: '15 – 30 km', hint: 'Longer commute' },
      { value: '50', label: '30+ km', hint: 'Regular highway driving' },
    ],
  },
  {
    id: 'vibe',
    section: 'Lifestyle',
    kind: 'multi',
    field: 'vibe',
    max: 5,
    title: 'Which vibe resonates most?',
    options: [
      { value: 'luxury', label: 'Luxury & status', hint: 'Premium brands, leather, tech', emoji: '🏢' },
      { value: 'practical', label: 'Practical & reliable', hint: 'Low maintenance, trustworthy', emoji: '🎯' },
      { value: 'sporty', label: 'Sporty & fun', hint: 'Performance, handling, distinctive', emoji: '⚡' },
      { value: 'eco', label: 'Eco-conscious', hint: 'Low consumption, hybrid or electric', emoji: '🌿' },
      { value: 'professional', label: 'Professional', hint: 'Modern, clean, business-appropriate', emoji: '💼' },
    ],
  },
  {
    id: 'maintenance_budget_range',
    section: 'Lifestyle',
    kind: 'multi',
    field: 'maintenance_budget_range',
    max: 3,
    title: 'Monthly maintenance budget you are comfortable with?',
    options: [
      { value: 'low', label: 'Low', hint: 'Under KES 5,000 / month' },
      { value: 'medium', label: 'Medium', hint: 'KES 5,000 – 15,000 / month' },
      { value: 'high', label: 'High', hint: 'KES 15,000+ / month' },
    ],
  },
  {
    id: 'include_in_transit_vehicles',
    section: 'Lifestyle',
    kind: 'single',
    field: 'include_in_transit_vehicles',
    title: 'Do you want to see vehicles currently in transit?',
    help: 'Track the import journey and get told the moment it lands.',
    options: [
      { value: 'true', label: 'Yes — show me vehicles on the way', hint: 'Track progress stage by stage', emoji: '🚢' },
      { value: 'false', label: 'Only show what is available now', emoji: '📍' },
    ],
  },

  // Section 3 — Transmission & fuel
  {
    id: 'transmission_preference',
    section: 'Drivetrain',
    kind: 'multi',
    field: 'transmission_preference',
    max: 3,
    title: 'Transmission preference?',
    options: [
      { value: 'automatic', label: 'Automatic', hint: 'Easier in traffic' },
      { value: 'manual', label: 'Manual', hint: 'Cheaper, more engaging' },
      { value: 'both', label: 'Either', hint: 'I am flexible' },
    ],
  },
  {
    id: 'fuel_type_preference',
    section: 'Drivetrain',
    kind: 'multi',
    field: 'fuel_type_preference',
    max: 4,
    title: 'Fuel type?',
    options: [
      { value: 'petrol', label: 'Petrol', hint: 'Most common, affordable' },
      { value: 'diesel', label: 'Diesel', hint: 'Better for long distances' },
      { value: 'hybrid', label: 'Hybrid or electric', hint: 'Lowest running costs' },
      { value: 'both', label: 'Either', hint: 'I am flexible' },
    ],
  },

  // Section 4 — Features & priorities
  {
    id: 'preferred_features',
    section: 'Features',
    kind: 'multi',
    field: 'preferred_features',
    max: 3,
    title: 'Which features matter most? Pick all that apply.',
    options: [
      { value: 'sunroof', label: 'Sunroof / panoramic roof' },
      { value: 'leather', label: 'Leather interior' },
      { value: 'infotainment', label: 'Touchscreen, CarPlay, Android Auto' },
      { value: 'safety', label: 'Safety tech (ABS, airbags, camera)' },
      { value: 'climate', label: 'Climate control & heated seats' },
      { value: 'sound', label: 'Good sound system' },
      { value: 'none', label: 'None — basic is fine' },
    ],
  },
  {
    id: 'interior_vibe',
    section: 'Features',
    kind: 'multi',
    field: 'interior_vibe',
    max: 5,
    title: 'Interior vibe preference?',
    options: [
      { value: 'spacious', label: 'Spacious', hint: 'Legroom, open cockpit' },
      { value: 'cozy', label: 'Cozy', hint: 'Intimate, snug' },
      { value: 'minimalist', label: 'Minimalist', hint: 'Clean, uncluttered' },
      { value: 'tech', label: 'Tech-forward', hint: 'Screens and gadgets' },
      { value: 'luxury', label: 'Luxury', hint: 'Premium materials, high comfort' },
    ],
  },
  {
    id: 'fuel_efficiency_importance',
    section: 'Features',
    kind: 'multi',
    field: 'fuel_efficiency_importance',
    max: 3,
    title: 'How important is fuel efficiency?',
    options: [
      { value: 'critical', label: 'Critical', hint: 'Eco-conscious, budget-aware' },
      { value: 'important', label: 'Important', hint: 'Lower ongoing costs' },
      { value: 'not_important', label: 'Not important', hint: 'Comfort and performance first' },
    ],
  },

  // Section 5 — Intent
  {
    id: 'purchase_timeline',
    section: 'Your plans',
    kind: 'single',
    field: 'purchase_timeline',
    title: 'When are you planning to buy?',
    options: [
      { value: 'active', label: 'Actively looking', hint: 'Next 30 days', emoji: '🔥' },
      { value: 'serious', label: 'Seriously considering', hint: 'Next 3 months', emoji: '🌤️' },
      { value: 'dreaming', label: 'Planning ahead', hint: '6+ months, just browsing', emoji: '🌙' },
    ],
  },
  {
    id: 'notification_preference',
    section: 'Your plans',
    kind: 'single',
    field: 'notification_preference',
    title: 'Should we let you know when matches appear?',
    help: 'You can change this any time.',
    options: [
      { value: 'realtime', label: 'Yes — as soon as it happens' },
      { value: 'daily', label: 'Yes — one daily summary' },
      { value: 'weekly', label: 'Yes — once a week' },
      { value: 'none', label: 'No thanks, I will browse myself' },
    ],
  },
  {
    id: 'trust_priorities',
    section: 'Your plans',
    kind: 'multi',
    field: 'trust_priorities',
    max: 5,
    title: 'What matters most to you when buying?',
    options: [
      { value: 'verified_seller', label: 'Verified seller or importer' },
      { value: 'tracking', label: 'Complete vehicle tracking' },
      { value: 'price_transparency', label: 'Price transparency' },
      { value: 'history', label: 'Vehicle history & inspection reports' },
      { value: 'fast', label: 'Fast transaction' },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

export const GUEST_STORAGE_KEY = 'flux.build.v1';

export const labelFor = (
  questionId: string,
  value?: string | string[] | null,
): string | null => {
  if (value === null || value === undefined || value === '') return null;
  const q = QUESTIONS.find((x) => x.id === questionId);
  const one = (v: string) => q?.options?.find((o) => o.value === v)?.label ?? v;
  if (Array.isArray(value)) {
    const list = value.filter(Boolean).map(one);
    return list.length ? list.join(', ') : null;
  }
  return one(String(value));
};

/** Normalises a stored answer (legacy single value or array) into a list. */
export const asList = (value?: string | string[] | null): string[] => {
  if (value === null || value === undefined || value === '') return [];
  return Array.isArray(value) ? value.filter(Boolean) : [String(value)];
};

export const formatKes = (n?: number | null) => {
  if (n === null || n === undefined) return '—';
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  return `KES ${Math.round(n / 1000)}K`;
};
