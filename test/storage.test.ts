import { beforeEach, describe, it, expect, vi } from 'vitest';
import { 
  getAppState, 
  saveAppState, 
  resetAppState, 
  updateCalculatorInputs, 
  toggleHabitCompletion, 
  purchaseOffset, 
  calculateStreak,
  updateUserName,
  getNetFootprint
} from '../src/core/storage';
import { DEFAULT_INPUTS } from '../src/core/calculator';

// Mock browser localStorage for Node test runner
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

describe('Storage & Gamification Manager', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should initialize a default AppState when none exists', () => {
    const state = getAppState();
    expect(state.onboardingCompleted).toBe(false);
    expect(state.ecoPoints).toBe(0);
    expect(state.level).toBe(1);
    expect(state.userName).toBe('Eco Citizen');
    expect(state.streakCount).toBe(0);
  });

  it('should save and retrieve AppState changes', () => {
    const state = getAppState();
    state.userName = 'Suraj Prakash';
    state.ecoPoints = 150;
    state.level = 2;
    saveAppState(state);

    const loaded = getAppState();
    expect(loaded.userName).toBe('Suraj Prakash');
    expect(loaded.ecoPoints).toBe(150);
    expect(loaded.level).toBe(2);
  });

  it('should update user name and trim whitespaces', () => {
    updateUserName('  Suraj Prakash   ');
    const state = getAppState();
    expect(state.userName).toBe('Suraj Prakash');
  });

  it('should fallback to Eco Citizen for empty usernames', () => {
    updateUserName('   ');
    const state = getAppState();
    expect(state.userName).toBe('Eco Citizen');
  });

  it('should calculate correct gross footprints and unlock first_calc badge', () => {
    const state = getAppState();
    expect(state.badges.find(b => b.id === 'first_calc')?.unlocked).toBe(false);

    // Save inputs
    const updated = updateCalculatorInputs(DEFAULT_INPUTS);
    expect(updated.onboardingCompleted).toBe(true);
    
    // completed onboarding awards 50 XP, and first_calc unlocks (awarding 30 XP) = 80 XP
    expect(updated.ecoPoints).toBe(80);
    expect(updated.badges.find(b => b.id === 'first_calc')?.unlocked).toBe(true);
  });

  it('should accrue points and calculate levels when habits are toggled', () => {
    resetAppState();
    const today = new Date().toISOString().split('T')[0];
    
    // Bike Commute is worth 50 points, plus 30 points for unlocking the habit_logger badge
    const { state, pointsAwarded, leveledUp } = toggleHabitCompletion('bike_commute', today);
    expect(pointsAwarded).toBe(50);
    expect(state.ecoPoints).toBe(80);
    expect(leveledUp).toBe(false);

    // Toggle off should subtract points
    const result = toggleHabitCompletion('bike_commute', today);
    expect(result.pointsAwarded).toBe(-50);
    expect(result.state.ecoPoints).toBe(30); // Badge remains unlocked, so 30 points are preserved
  });

  it('should level up when user exceeds XP thresholds', () => {
    resetAppState();
    const state = getAppState();
    state.ecoPoints = 85;
    state.level = 1;
    saveAppState(state);

    // Toggle bike commute (+50 points) -> total 135 points -> Level 2
    const { state: updated, leveledUp } = toggleHabitCompletion('bike_commute', '2026-06-18');
    expect(updated.level).toBe(2);
    expect(leveledUp).toBe(true);
  });

  it('should purchase offsets and reduce net footprint', () => {
    resetAppState();
    // Completing onboarding
    updateCalculatorInputs(DEFAULT_INPUTS); // gross footprint is ~5878 kg

    // Sponsor 5 trees (Amazon Reforestation)
    // 5 * 150 kg = 750 kg CO2 offset
    const result = purchaseOffset('amazon_reforestation', 5);
    expect(result.state.offsetPurchases.length).toBe(1);
    expect(result.state.offsetPurchases[0].co2Offset).toBe(750);

    const net = getNetFootprint(result.state);
    expect(net).toBe(result.state.footprint.total - 750);
    expect(result.state.badges.find(b => b.id === 'offset_first')?.unlocked).toBe(true);
  });

  describe('Habits Streaks Calculation', () => {
    const getPastDateStr = (daysAgo: number): string => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    it('should return 0 streak if no completions exist', () => {
      const state = getAppState();
      expect(calculateStreak(state)).toBe(0);
    });

    it('should return 1 if logged today only', () => {
      const state = getAppState();
      state.habits[0].completedDates.push(getPastDateStr(0));
      expect(calculateStreak(state)).toBe(1);
    });

    it('should return 2 if logged today and yesterday', () => {
      const state = getAppState();
      state.habits[0].completedDates.push(getPastDateStr(0));
      state.habits[1].completedDates.push(getPastDateStr(1));
      expect(calculateStreak(state)).toBe(2);
    });

    it('should keep streak active if logged yesterday but not today yet', () => {
      const state = getAppState();
      state.habits[0].completedDates.push(getPastDateStr(1));
      state.habits[0].completedDates.push(getPastDateStr(2));
      expect(calculateStreak(state)).toBe(2);
    });

    it('should break streak (return 0) if last log was 2 days ago', () => {
      const state = getAppState();
      state.habits[0].completedDates.push(getPastDateStr(2));
      state.habits[0].completedDates.push(getPastDateStr(3));
      expect(calculateStreak(state)).toBe(0);
    });
  });
});
