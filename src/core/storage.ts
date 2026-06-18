import type { AppState, CalculatorInputs, Habit, Badge, OffsetPurchase, OffsetProject } from '../types';
import { calculateCategoryFootprints, DEFAULT_INPUTS } from './calculator';

const STORAGE_KEY = 'ecosphere_app_state';

// Predefined Habits
const DEFAULT_HABITS: Habit[] = [
  {
    id: 'bike_commute',
    title: 'Pedal Power Commute',
    description: 'Bicycle or walk for local trips instead of driving a car.',
    impact: 'high',
    co2Saving: 12, // kg CO2e per week
    points: 50,
    category: 'transport',
    completedDates: []
  },
  {
    id: 'public_transit',
    title: 'Transit Rider',
    description: 'Use bus, train, or subway instead of a private vehicle.',
    impact: 'high',
    co2Saving: 15,
    points: 40,
    category: 'transport',
    completedDates: []
  },
  {
    id: 'carpool',
    title: 'Rideshare Alliance',
    description: 'Carpool with colleagues or friends to split travel emissions.',
    impact: 'medium',
    co2Saving: 8,
    points: 30,
    category: 'transport',
    completedDates: []
  },
  {
    id: 'eco_driving',
    title: 'Eco-Driver',
    description: 'Drive smoothly, avoid excessive idling, and maintain tire pressure.',
    impact: 'low',
    co2Saving: 3,
    points: 15,
    category: 'transport',
    completedDates: []
  },
  {
    id: 'thermostat_down',
    title: 'Cozy Thermostat',
    description: 'Lower heating by 1°C in winter (or raise AC by 1°C in summer).',
    impact: 'high',
    co2Saving: 10,
    points: 35,
    category: 'energy',
    completedDates: []
  },
  {
    id: 'cold_wash',
    title: 'Cold Cycle Wash',
    description: 'Wash laundry in cold water instead of hot or warm settings.',
    impact: 'low',
    co2Saving: 2.5,
    points: 15,
    category: 'energy',
    completedDates: []
  },
  {
    id: 'unplug_appliances',
    title: 'Phantom Slayer',
    description: 'Unplug chargers, TVs, and standby devices when not in use.',
    impact: 'low',
    co2Saving: 1.5,
    points: 10,
    category: 'energy',
    completedDates: []
  },
  {
    id: 'air_dry',
    title: 'Breeze Dried',
    description: 'Air dry laundry on a rack or clothesline instead of using a dryer.',
    impact: 'medium',
    co2Saving: 4.5,
    points: 25,
    category: 'energy',
    completedDates: []
  },
  {
    id: 'meat_free_day',
    title: 'Green Plate Day',
    description: 'Eat entirely plant-based/meat-free for a full day.',
    impact: 'high',
    co2Saving: 8.5,
    points: 40,
    category: 'food',
    completedDates: []
  },
  {
    id: 'zero_waste_meal',
    title: 'Zero Waste Chef',
    description: 'Prepare meals using leftover ingredients, avoiding food waste.',
    impact: 'medium',
    co2Saving: 3.5,
    points: 25,
    category: 'food',
    completedDates: []
  },
  {
    id: 'local_produce',
    title: 'Locavore Choice',
    description: 'Select local and seasonal produce to minimize food miles.',
    impact: 'medium',
    co2Saving: 4,
    points: 20,
    category: 'food',
    completedDates: []
  },
  {
    id: 'plant_milk',
    title: 'Dairy Alternative',
    description: 'Choose oat, soy, or almond milk instead of cow dairy milk.',
    impact: 'low',
    co2Saving: 2,
    points: 15,
    category: 'food',
    completedDates: []
  },
  {
    id: 'no_single_plastic',
    title: 'Plastic Purge',
    description: 'Avoid all single-use packaging, straws, and bottles for a day.',
    impact: 'medium',
    co2Saving: 2.5,
    points: 25,
    category: 'waste',
    completedDates: []
  },
  {
    id: 'composting',
    title: 'Soil Restorer',
    description: 'Compost fruit scraps, vegetable peelings, and coffee grounds.',
    impact: 'medium',
    co2Saving: 3,
    points: 25,
    category: 'waste',
    completedDates: []
  },
  {
    id: 'reusable_bags',
    title: 'Tote Carrier',
    description: 'Carry reusable bags for shopping and groceries.',
    impact: 'low',
    co2Saving: 1.2,
    points: 10,
    category: 'waste',
    completedDates: []
  },
  {
    id: 'mend_repair',
    title: 'Mender Spirit',
    description: 'Repair clothing, electronics, or gear instead of purchasing new.',
    impact: 'high',
    co2Saving: 11,
    points: 50,
    category: 'waste',
    completedDates: []
  }
];

// Predefined Badges
const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first_calc',
    title: 'Climate Aware',
    description: 'Complete your first carbon footprint calculation.',
    iconType: 'leaf',
    requirement: 'Submit the carbon calculator wizard.',
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 'eco_champion',
    title: 'Eco Champion',
    description: 'Keep your gross annual carbon footprint under 4,000 kg CO2e.',
    iconType: 'shield',
    requirement: 'Have a calculated annual footprint < 4,000 kg CO2e.',
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 'habit_logger',
    title: 'Habit Hero',
    description: 'Complete and log a sustainable habit.',
    iconType: 'star',
    requirement: 'Check off at least one daily habit.',
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 'habit_pro',
    title: 'Green Devotee',
    description: 'Log habits 5 times across any combination of dates.',
    iconType: 'bolt',
    requirement: 'Log habits 5 times total.',
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 'offset_first',
    title: 'Balance Restorer',
    description: 'Fund your first carbon offset project.',
    iconType: 'globe',
    requirement: 'Fund any amount of offset projects.',
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 'carbon_neutral',
    title: 'Net Zero Hero',
    description: 'Achieve net-zero carbon footprint after offsets.',
    iconType: 'shield',
    requirement: 'Reduce net carbon footprint to 0 or below.',
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 'level_5',
    title: 'Earth Guardian',
    description: 'Reach Level 5 by logging habits and carbon offsets.',
    iconType: 'star',
    requirement: 'Earn 400 Eco-points.',
    unlocked: false,
    unlockedAt: null
  }
];

// Predefined Offset Projects
export const OFFSET_PROJECTS: OffsetProject[] = [
  {
    id: 'amazon_reforestation',
    title: 'Amazon Rainforest Restoration',
    description: 'Plant native trees in degraded corridors of the Amazon to absorb carbon and rebuild local wildlife habitats.',
    co2ReducedPerUnit: 150, // 150 kg CO2e absorbed per tree over its growth
    costPerUnit: 12.00, // $12 per tree
    unitName: 'Tree',
    category: 'forestry',
    imageName: 'amazon'
  },
  {
    id: 'solar_microgrids',
    title: 'Solar Microgrids in India',
    description: 'Replace kerosene lamps and coal-powered electricity with sustainable, off-grid community solar power setups.',
    co2ReducedPerUnit: 400, // 400 kg CO2e per household year sponsored
    costPerUnit: 25.00, // $25 per solar unit sponsored
    unitName: 'Panel Sponsored',
    category: 'renewables',
    imageName: 'solar'
  },
  {
    id: 'clean_cookstoves',
    title: 'Clean Cookstoves in Uganda',
    description: 'Provide fuel-efficient cookstoves that cut wood usage by 50%, saving local woodlands and improving indoor air quality.',
    co2ReducedPerUnit: 300, // 300 kg CO2e per stove
    costPerUnit: 15.00, // $15 per cookstove
    unitName: 'Stove Sponsored',
    category: 'community',
    imageName: 'cookstove'
  },
  {
    id: 'landfill_methane',
    title: 'Landfill Gas Capture',
    description: 'Capture highly warming methane gases escaping from municipal landfills and convert them to clean energy.',
    co2ReducedPerUnit: 1000, // 1000 kg (1 Ton) CO2e captured
    costPerUnit: 40.00, // $40 per tonne
    unitName: 'Tonne CO2e',
    category: 'methane',
    imageName: 'methane'
  }
];

/**
 * Initializes the default AppState if no state exists
 */
function createInitialState(): AppState {
  const footprint = calculateCategoryFootprints(DEFAULT_INPUTS);
  return {
    inputs: DEFAULT_INPUTS,
    footprint,
    ecoPoints: 0,
    level: 1,
    habits: JSON.parse(JSON.stringify(DEFAULT_HABITS)),
    badges: JSON.parse(JSON.stringify(DEFAULT_BADGES)),
    offsetPurchases: [],
    onboardingCompleted: false,
    theme: 'dark',
    userName: 'Eco Citizen',
    streakCount: 0,
    lastActiveDate: ''
  };
}

/**
 * Retrieves state from LocalStorage, with fallback and standard validation
 */
export function getAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialState();
      saveAppState(initial);
      return initial;
    }
    const state = JSON.parse(raw) as AppState;
    
    // Fallbacks to ensure backwards compatibility if keys are missing
    if (!state.habits || state.habits.length === 0) state.habits = DEFAULT_HABITS;
    if (!state.badges || state.badges.length === 0) state.badges = DEFAULT_BADGES;
    if (!state.offsetPurchases) state.offsetPurchases = [];
    if (state.ecoPoints === undefined) state.ecoPoints = 0;
    if (state.level === undefined) state.level = 1;
    if (!state.theme) state.theme = 'dark';
    if (state.userName === undefined) state.userName = 'Eco Citizen';
    if (state.streakCount === undefined) state.streakCount = 0;
    if (state.lastActiveDate === undefined) state.lastActiveDate = '';
    
    return state;
  } catch (e) {
    console.error('Failed to load storage, resetting to default', e);
    const initial = createInitialState();
    saveAppState(initial);
    return initial;
  }
}

/**
 * Persists app state to LocalStorage
 */
export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to write storage', e);
  }
}

/**
 * Resets storage back to initial defaults
 */
export function resetAppState(): AppState {
  const initial = createInitialState();
  saveAppState(initial);
  return initial;
}

/**
 * Updates the user's carbon inputs and recalculates the gross footprint
 */
export function updateCalculatorInputs(inputs: CalculatorInputs): AppState {
  const state = getAppState();
  state.inputs = inputs;
  state.footprint = calculateCategoryFootprints(inputs);
  state.onboardingCompleted = true;
  
  // Award 50 points for completing the calculation onboarding
  if (!state.badges.find(b => b.id === 'first_calc')?.unlocked) {
    state.ecoPoints += 50;
  }
  
  const result = checkAndUnlockBadges(state);
  saveAppState(result.state);
  return result.state;
}

/**
 * Computes level based on ecoPoints: Level = 1 + floor(points / 100)
 */
export function calculateLevel(points: number): number {
  return 1 + Math.floor(points / 100);
}

/**
 * Computes net carbon footprint by subtracting total offset kilograms from total annual emissions
 */
export function getNetFootprint(state: AppState): number {
  const totalOffsets = state.offsetPurchases.reduce((acc, p) => acc + p.co2Offset, 0);
  return Math.max(0, state.footprint.total - totalOffsets);
}

/**
 * Calculates current active streak of daily green actions backwards from today or yesterday
 */
export function calculateStreak(state: AppState): number {
  const allDates = new Set<string>();
  state.habits.forEach(h => {
    h.completedDates.forEach(d => allDates.add(d));
  });
  if (allDates.size === 0) return 0;

  const today = new Date();
  const format = (d: Date) => d.toISOString().split('T')[0];
  
  const todayStr = format(today);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = format(yesterday);

  // If neither today nor yesterday has logged habits, the streak is broken
  if (!allDates.has(todayStr) && !allDates.has(yesterdayStr)) {
    return 0;
  }

  // Count backwards from whichever active date is closest (today or yesterday)
  let streak = 0;
  const checkDate = new Date(allDates.has(todayStr) ? todayStr : yesterdayStr);
  
  while (true) {
    const checkStr = format(checkDate);
    if (allDates.has(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Updates the user's name
 */
export function updateUserName(name: string): AppState {
  const state = getAppState();
  state.userName = name.trim() || 'Eco Citizen';
  saveAppState(state);
  return state;
}

export function toggleHabitCompletion(habitId: string, dateStr: string): { state: AppState; pointsAwarded: number; leveledUp: boolean } {
  const state = getAppState();
  const habit = state.habits.find(h => h.id === habitId);
  
  if (!habit) return { state, pointsAwarded: 0, leveledUp: false };
  
  const index = habit.completedDates.indexOf(dateStr);
  let pointsAwarded = 0;
  
  if (index >= 0) {
    // Already completed on this date, so undo/remove it
    habit.completedDates.splice(index, 1);
    pointsAwarded = -habit.points;
  } else {
    // Add completion
    habit.completedDates.push(dateStr);
    pointsAwarded = habit.points;
  }
  
  // Update streak count
  state.streakCount = calculateStreak(state);
  if (state.streakCount > 0) {
    state.lastActiveDate = dateStr;
  } else {
    state.lastActiveDate = '';
  }

  const oldLevel = state.level;
  state.ecoPoints = Math.max(0, state.ecoPoints + pointsAwarded);
  state.level = calculateLevel(state.ecoPoints);
  
  const leveledUp = state.level > oldLevel;
  
  const badgeResult = checkAndUnlockBadges(state);
  const finalState = badgeResult.state;
  saveAppState(finalState);
  
  return {
    state: finalState,
    pointsAwarded,
    leveledUp
  };
}

/**
 * Registers an offset credit purchase
 */
export function purchaseOffset(projectId: string, units: number): { state: AppState; newlyUnlocked: string[] } {
  const state = getAppState();
  const project = OFFSET_PROJECTS.find(p => p.id === projectId);
  
  if (!project || units <= 0) return { state, newlyUnlocked: [] };
  
  const cost = project.costPerUnit * units;
  const co2Offset = project.co2ReducedPerUnit * units;
  
  const purchase: OffsetPurchase = {
    id: 'offset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    projectId,
    projectTitle: project.title,
    units,
    cost,
    co2Offset,
    date: new Date().toISOString().split('T')[0]
  };
  
  state.offsetPurchases.push(purchase);
  
  // Award 1 Eco-point per 5 kg CO2e offset (capped at 500 points per transaction to avoid inflation)
  const earnedPoints = Math.min(500, Math.round(co2Offset / 5));
  state.ecoPoints += earnedPoints;
  state.level = calculateLevel(state.ecoPoints);
  
  const badgeResult = checkAndUnlockBadges(state);
  saveAppState(badgeResult.state);
  
  return {
    state: badgeResult.state,
    newlyUnlocked: badgeResult.newlyUnlocked
  };
}

/**
 * Checks all badge criteria and unlocks qualifying badges. Returns the modified state and list of new badge titles.
 */
export function checkAndUnlockBadges(state: AppState): { state: AppState; newlyUnlocked: string[] } {
  const newlyUnlocked: string[] = [];
  const todayStr = new Date().toISOString().split('T')[0];
  
  state.badges.forEach(badge => {
    if (badge.unlocked) return; // already unlocked
    
    let shouldUnlock = false;
    
    switch (badge.id) {
      case 'first_calc':
        if (state.onboardingCompleted) shouldUnlock = true;
        break;
        
      case 'eco_champion':
        if (state.onboardingCompleted && state.footprint.total < 4000) shouldUnlock = true;
        break;
        
      case 'habit_logger':
        const totalCompletions = state.habits.reduce((acc, h) => acc + h.completedDates.length, 0);
        if (totalCompletions >= 1) shouldUnlock = true;
        break;
        
      case 'habit_pro':
        const count = state.habits.reduce((acc, h) => acc + h.completedDates.length, 0);
        if (count >= 5) shouldUnlock = true;
        break;
        
      case 'offset_first':
        if (state.offsetPurchases.length >= 1) shouldUnlock = true;
        break;
        
      case 'carbon_neutral':
        const net = getNetFootprint(state);
        if (state.onboardingCompleted && net <= 0) shouldUnlock = true;
        break;
        
      case 'level_5':
        if (state.level >= 5) shouldUnlock = true;
        break;
    }
    
    if (shouldUnlock) {
      badge.unlocked = true;
      badge.unlockedAt = todayStr;
      newlyUnlocked.push(badge.title);
      
      // Award bonus points for unlocking badges
      state.ecoPoints += 30;
      state.level = calculateLevel(state.ecoPoints);
    }
  });
  
  return { state, newlyUnlocked };
}
