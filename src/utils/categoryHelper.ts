import { BikeModel } from '../types';

export const CATEGORIES = [
  'All Categories',
  'Commuter (100-125 CC)',
  'Standard / Street (126-160 CC)',
  'Sport & Performance (161-250 CC)',
  'Cruiser & Superbike (250+ CC)',
  'Scooter / Automatic',
] as const;

export type BikeCategory = typeof CATEGORIES[number];

export function getBikeCategory(bike: BikeModel): string {
  if (bike.category && bike.category !== 'All Categories') {
    return bike.category;
  }

  const modelUpper = bike.model.toUpperCase();
  if (
    modelUpper.includes('SCOOTER') ||
    modelUpper.includes('DIO') ||
    modelUpper.includes('ACTIVA') ||
    modelUpper.includes('NTORQ') ||
    modelUpper.includes('RAY') ||
    modelUpper.includes('BURGM') ||
    modelUpper.includes('FASCINO')
  ) {
    return 'Scooter / Automatic';
  }

  const cc = bike.engineCc || 150;
  if (cc <= 125) {
    return 'Commuter (100-125 CC)';
  } else if (cc <= 160) {
    return 'Standard / Street (126-160 CC)';
  } else if (cc <= 250) {
    return 'Sport & Performance (161-250 CC)';
  } else {
    return 'Cruiser & Superbike (250+ CC)';
  }
}
