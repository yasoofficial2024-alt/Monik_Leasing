import { BikeModel, AppSettings } from '../types';
import { INITIAL_BIKES, INITIAL_SETTINGS } from '../data/initialData';

const BIKES_KEY = 'vehicle_financing_bikes_v1';
const SETTINGS_KEY = 'vehicle_financing_settings_v1';
const ADMIN_AUTH_KEY = 'vehicle_financing_admin_auth_v1';

export function loadStoredBikes(): BikeModel[] {
  try {
    const raw = localStorage.getItem(BIKES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading bikes from localStorage', e);
  }
  // If not found, initialize with factory bikes
  saveStoredBikes(INITIAL_BIKES);
  return INITIAL_BIKES;
}

export function saveStoredBikes(bikes: BikeModel[]): void {
  try {
    localStorage.setItem(BIKES_KEY, JSON.stringify(bikes));
  } catch (e) {
    console.error('Error saving bikes to localStorage', e);
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.defaultInterestRate) {
        return { ...INITIAL_SETTINGS, ...parsed };
      }
    }
  } catch (e) {
    console.error('Error loading settings from localStorage', e);
  }
  saveStoredSettings(INITIAL_SETTINGS);
  return INITIAL_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to localStorage', e);
  }
}

/**
 * Reset completely to Monik Group factory catalog
 */
export function resetToFactoryDefaults(): { bikes: BikeModel[]; settings: AppSettings } {
  localStorage.removeItem(BIKES_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(ADMIN_AUTH_KEY);
  saveStoredBikes(INITIAL_BIKES);
  saveStoredSettings(INITIAL_SETTINGS);
  return { bikes: INITIAL_BIKES, settings: INITIAL_SETTINGS };
}

/**
 * Wipe all saved inventory records (0 vehicles)
 */
export function wipeAllStoredData(): { bikes: BikeModel[]; settings: AppSettings } {
  localStorage.removeItem(BIKES_KEY);
  saveStoredBikes([]);
  return { bikes: [], settings: loadStoredSettings() };
}

export function checkIsAdminAuthenticated(): boolean {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

export function setAdminAuthenticated(isAuth: boolean): void {
  if (isAuth) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
  } else {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  }
}
