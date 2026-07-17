export const featuredProductSlugs = [
  'triple-wall-mounted-rig',
  'the-monster-lite-rig-2-0',
  'portable-gym-workout-timer',
  'adjustable-bench-heavy-duty',
  'olympic-lifting-platform',
  '511-tactical-plate-carrier-weight-vest',
  'adjustable-boxing-mitts',
  'curved-manual-treadmill',
  'free-standing-rig-2',
  '15kg-womens-cerakote-olympic-barbell',
  'skierg-indoor-skiing-machine',
  'oem-private-label-exercise-air-bike',
  'dumbbell-rack-round-two-layer-10-pairs',
  'captain-america-shield-urethane-barbell-plates',
  'vertical-barbell-storage-rack-9-barbell-holder',
  'commercial-half-power-rack',
  'abram-ghd-2-0glute-ham-developer-2-0',
  'crossfit-rig-upright-bar',
  'steel-swedish-bars',
  '30crossfit-monkey-bar-rig-jungle-rig',
];

export const latestProductSlugs = [
  'free-standing-rig-2',
  'the-monster-lite-rig-2-0',
  'portable-gym-workout-timer',
  'dumbbell',
  'curved-manual-treadmill-2',
  'training-mask-2-0-black',
];

export const footerProductSlugs = [
  'free-standing-rig-2',
  'the-monster-lite-rig-2-0',
  'portable-gym-workout-timer',
  'dumbbell',
  'curved-manual-treadmill-2',
  'training-mask-2-0-black',
  'adjustable-bench-heavy-duty',
  'strongman-sandbag',
  'olympic-lifting-platform',
  '511-tactical-plate-carrier-weight-vest',
];

export const newsPostSlugs = [
  'portable-wod-timer',
  'installing-a-batch-of-new-vacuum-vulcanizing-machines',
  'important-covid-19-status-information',
  'gym-closures-result-in-dumbbell-and-kettlebell-shortages',
];

export function selectContentEntries<T extends { id: string }>(entries: T[], slugs: string[], label: string) {
  const bySlug = new Map(entries.map((entry) => [entry.id, entry]));
  return slugs.map((slug) => {
    const entry = bySlug.get(slug);
    if (!entry) throw new Error(`${label} references missing content entry: ${slug}`);
    return entry;
  });
}
