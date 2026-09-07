import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BikeModel, AppSettings } from '../types';

let cachedClient: SupabaseClient | null = null;
let lastUrl: string | null = null;
let lastKey: string | null = null;

export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  const targetUrl = url || (import.meta as any).env?.VITE_SUPABASE_URL;
  const targetKey = key || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (!targetUrl || !targetKey) {
    return null;
  }

  if (cachedClient && lastUrl === targetUrl && lastKey === targetKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(targetUrl, targetKey);
    lastUrl = targetUrl;
    lastKey = targetKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function signInAdmin(
  email: string,
  password: string,
  settings: AppSettings
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
  if (!client) {
    return { success: false, error: 'Supabase URL or Key not configured.' };
  }

  const { error } = await client.auth.signInWithPassword({ email, password });
  return error ? { success: false, error: error.message } : { success: true };
}

export async function signOutAdmin(settings: AppSettings): Promise<void> {
  const client = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
  if (client) await client.auth.signOut();
}

/**
 * Fetch bikes from Supabase if configured and online.
 * Returns null if offline or not configured.
 */
export async function syncFromSupabase(
  settings: AppSettings
): Promise<{ success: boolean; data?: BikeModel[]; error?: string }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, error: 'Device is offline. Using local device storage.' };
  }

  const client = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
  if (!client) {
    return { success: false, error: 'Supabase URL or Key not configured.' };
  }

  const tableName = settings.supabaseTableName || 'bikes';

  try {
    const { data, error } = await client.from(tableName).select('*');

    if (error) {
      return { success: false, error: error.message };
    }

    if (data && Array.isArray(data)) {
      const mappedBikes: BikeModel[] = data.map((item: any, idx: number) => ({
        id: item.id || `supa-${idx}-${Date.now()}`,
        brand: (item.brand || item.Brand || 'UNKNOWN').toUpperCase(),
        model: (item.model || item.Model || 'MODEL').toUpperCase(),
        year: parseInt(item.year || item.Year || '2026') || 2026,
        engineCc: parseInt(item.engineCc || item.cc || item.CC || '150') || 150,
        sellingPrice: parseFloat(item.sellingPrice || item.selling_price || item.price || 0),
        discount: parseFloat(item.discount || 0),
        afterDiscount: parseFloat(item.afterDiscount || item.after_discount || item.sellingPrice || 0),
        downpayment: parseFloat(item.downpayment || 0),
        afterDownpayment: parseFloat(item.afterDownpayment || item.after_downpayment || 0),
        documentChargePercent: parseFloat(item.documentChargePercent || item.doc_charge_pct || 5.0),
        documentCharge: parseFloat(item.documentCharge || item.doc_charge || 0),
        insuranceCharge: parseFloat(item.insuranceCharge || item.insurance || 0),
        rmvCharge: parseFloat(item.rmvCharge || item.rmv || 8500),
        totalCharges: parseFloat(item.totalCharges || item.total_charges || 8500),
        facilityAmount: parseFloat(item.facilityAmount || item.facility_amount || 0),
        facilityPeriod: parseInt(item.facilityPeriod || item.period || '36') || 36,
        facilityInterestRate: parseFloat(item.facilityInterestRate || item.interest_rate || 14.5),
        status: item.status || 'Available',
      }));

      return { success: true, data: mappedBikes };
    }

    return { success: true, data: [] };
  } catch (err: any) {
    return { success: false, error: err.message || 'Supabase sync failed.' };
  }
}

/**
 * Push bikes to Supabase table
 */
export async function syncToSupabase(
  bikes: BikeModel[],
  settings: AppSettings
): Promise<{ success: boolean; error?: string }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, error: 'Device is offline. Saved locally.' };
  }

  const client = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
  if (!client) {
    return { success: false, error: 'Supabase URL or Key not configured.' };
  }

  const tableName = settings.supabaseTableName || 'bikes';

  try {
    const payload = bikes.map((b) => ({
      id: b.id,
      brand: b.brand,
      model: b.model,
      year: b.year,
      engineCc: b.engineCc,
      selling_price: b.sellingPrice,
      discount: b.discount,
      downpayment: b.downpayment,
      doc_charge_pct: b.documentChargePercent,
      insurance: b.insuranceCharge,
      rmv: b.rmvCharge,
      period: b.facilityPeriod,
      interest_rate: b.facilityInterestRate,
    }));

    if (payload.length === 0) {
      const { error } = await client.from(tableName).delete().not('id', 'is', null);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    const { error } = await client.from(tableName).upsert(payload);
    if (error) {
      return { success: false, error: error.message };
    }

    const ids = payload.map((bike) => bike.id);
    const { error: staleRowsError } = await client
      .from(tableName)
      .delete()
      .not('id', 'in', `(${ids.map((id) => JSON.stringify(id)).join(',')})`);
    if (staleRowsError) {
      return { success: false, error: staleRowsError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Push to Supabase failed.' };
  }
}
