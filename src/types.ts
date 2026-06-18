export interface CalculatorInputs {
  // Transport
  vehicleType: 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'motorcycle' | 'none';
  distanceKm: number; // Weekly distance driven
  publicTransportKm: number; // Weekly distance
  flightsShortHours: number; // Annual hours (< 3 hr flights)
  flightsLongHours: number; // Annual hours (>= 3 hr flights)

  // Energy
  electricityKwh: number; // Monthly consumption
  gasKwh: number; // Monthly consumption
  heatingOilLiters: number; // Monthly consumption
  hasSolar: boolean;

  // Food
  dietType: 'heavy-meat' | 'average' | 'vegetarian' | 'vegan';
  foodWasteScale: number; // 1 (none) to 5 (high)

  // Waste
  wasteKg: number; // Weekly trash generated
  recyclePaper: boolean;
  recyclePlastic: boolean;
  recycleGlass: boolean;
  recycleMetal: boolean;
}

export interface UserFootprint {
  transport: number; // kg CO2e per year
  energy: number;    // kg CO2e per year
  food: number;      // kg CO2e per year
  waste: number;     // kg CO2e per year
  total: number;     // kg CO2e per year
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  co2Saving: number; // kg CO2e saved per week
  points: number;    // Eco-points earned per day completed
  category: 'transport' | 'energy' | 'food' | 'waste';
  completedDates: string[]; // List of YYYY-MM-DD strings when logged
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconType: 'leaf' | 'car' | 'bolt' | 'utensils' | 'trash' | 'globe' | 'shield' | 'star';
  requirement: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface OffsetProject {
  id: string;
  title: string;
  description: string;
  co2ReducedPerUnit: number; // kg CO2e reduced per unit
  costPerUnit: number; // USD per unit
  unitName: string; // e.g. "Tree", "MWh", "Stove"
  category: 'forestry' | 'renewables' | 'methane' | 'community';
  imageName: string;
}

export interface OffsetPurchase {
  id: string;
  projectId: string;
  projectTitle: string;
  units: number;
  cost: number;
  co2Offset: number; // kg CO2e
  date: string;
}

export interface AppState {
  inputs: CalculatorInputs;
  footprint: UserFootprint;
  ecoPoints: number;
  level: number;
  habits: Habit[];
  badges: Badge[];
  offsetPurchases: OffsetPurchase[];
  onboardingCompleted: boolean;
  theme: 'dark' | 'light';
  userName: string;
  streakCount: number;
  lastActiveDate: string;
}
