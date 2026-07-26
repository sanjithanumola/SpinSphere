import { Wheel, SpinRecord } from '../types';
import { PRESET_WHEELS } from '../data/presets';

const WHEELS_KEY = 'spinsphere_saved_wheels';
const ACTIVE_WHEEL_KEY = 'spinsphere_active_wheel_id';
const HISTORY_KEY = 'spinsphere_spin_history';

export function loadSavedWheels(): Wheel[] {
  try {
    const raw = localStorage.getItem(WHEELS_KEY);
    if (!raw) {
      localStorage.setItem(WHEELS_KEY, JSON.stringify(PRESET_WHEELS));
      return PRESET_WHEELS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : PRESET_WHEELS;
  } catch {
    return PRESET_WHEELS;
  }
}

export function saveWheels(wheels: Wheel[]) {
  try {
    localStorage.setItem(WHEELS_KEY, JSON.stringify(wheels));
  } catch (err) {
    console.error('Failed to save wheels:', err);
  }
}

export function loadActiveWheelId(): string {
  try {
    const raw = localStorage.getItem(ACTIVE_WHEEL_KEY);
    return raw || PRESET_WHEELS[0].id;
  } catch {
    return PRESET_WHEELS[0].id;
  }
}

export function saveActiveWheelId(id: string) {
  try {
    localStorage.setItem(ACTIVE_WHEEL_KEY, id);
  } catch (err) {
    console.error('Failed to save active wheel id:', err);
  }
}

export function loadSpinHistory(): SpinRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSpinHistory(history: SpinRecord[]) {
  try {
    // Keep last 200 records
    const trimmed = history.slice(0, 200);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save spin history:', err);
  }
}

export function addSpinRecord(record: SpinRecord): SpinRecord[] {
  const current = loadSpinHistory();
  const updated = [record, ...current];
  saveSpinHistory(updated);
  return updated;
}
