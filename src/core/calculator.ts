import type { CalculatorInputs, UserFootprint } from '../types';

// Emission factors (kg CO2e per unit)
export const EMISSION_FACTORS = {
  // Transport: kg CO2e per km
  transport: {
    petrol: 0.18,
    diesel: 0.17,
    hybrid: 0.10,
    electric: 0.05,
    motorcycle: 0.10,
    none: 0,
    public: 0.06 // average bus/train
  },
  // Flight: kg CO2e per hour
  flight: {
    short: 150, // short-haul flight hour (~0.25 kg CO2/km * 600 km/h)
    long: 110   // long-haul flight hour (~0.137 kg CO2/km * 800 km/h)
  },
  // Energy: kg CO2e per unit (electricity in kWh, gas in kWh, oil in liters)
  energy: {
    electricity: 0.40, // grid average
    gas: 0.20,
    oil: 2.68
  },
  // Food: annual base kg CO2e by diet type
  food: {
    'heavy-meat': 2900,
    'average': 2000,
    'vegetarian': 1300,
    'vegan': 900
  },
  // Food Waste: annual offset/addition in kg CO2e
  foodWaste: {
    1: -100, // Minimal waste / home composting
    2: 0,    // Low waste
    3: 100,  // Average waste
    4: 250,  // Moderate waste
    5: 450   // High waste
  },
  // Waste: kg CO2e per kg of waste sent to landfill
  waste: {
    landfill: 0.50
  },
  // Recycling: annual credit in kg CO2e
  recyclingCredit: {
    paper: -40,
    plastic: -50,
    glass: -30,
    metal: -45
  }
};

// Global and target standards (kg CO2e per year)
export const CARBON_STANDARDS = {
  globalAverage: 4800,
  usAverage: 15000,
  euAverage: 6500,
  indiaAverage: 1900,
  netZeroTarget: 2000, // 2 tons CO2e per person per year target
  categoryAverages: {
    transport: 1800,
    energy: 2000,
    food: 1700,
    waste: 500,
    total: 6000
  }
};

/**
 * Calculates emissions for transportation in kg CO2e per year
 */
export function calculateTransportEmissions(inputs: CalculatorInputs): number {
  const vehicleFactor = EMISSION_FACTORS.transport[inputs.vehicleType] || 0;
  const vehicleAnnual = inputs.distanceKm * 52 * vehicleFactor;
  
  const publicAnnual = inputs.publicTransportKm * 52 * EMISSION_FACTORS.transport.public;
  
  const flightShortAnnual = inputs.flightsShortHours * EMISSION_FACTORS.flight.short;
  const flightLongAnnual = inputs.flightsLongHours * EMISSION_FACTORS.flight.long;
  
  return vehicleAnnual + publicAnnual + flightShortAnnual + flightLongAnnual;
}

/**
 * Calculates emissions for home energy in kg CO2e per year
 */
export function calculateEnergyEmissions(inputs: CalculatorInputs): number {
  let electricityFactor = EMISSION_FACTORS.energy.electricity;
  if (inputs.hasSolar) {
    // Solar cuts grid electricity emissions by 75%
    electricityFactor *= 0.25;
  }
  const electricityAnnual = inputs.electricityKwh * 12 * electricityFactor;
  const gasAnnual = inputs.gasKwh * 12 * EMISSION_FACTORS.energy.gas;
  const oilAnnual = inputs.heatingOilLiters * 12 * EMISSION_FACTORS.energy.oil;
  
  return electricityAnnual + gasAnnual + oilAnnual;
}

/**
 * Calculates emissions for food in kg CO2e per year
 */
export function calculateFoodEmissions(inputs: CalculatorInputs): number {
  const dietBase = EMISSION_FACTORS.food[inputs.dietType] || 2000;
  const wasteAdjustment = EMISSION_FACTORS.foodWaste[inputs.foodWasteScale as 1|2|3|4|5] || 0;
  
  return Math.max(200, dietBase + wasteAdjustment);
}

/**
 * Calculates emissions for waste in kg CO2e per year
 */
export function calculateWasteEmissions(inputs: CalculatorInputs): number {
  const baseWaste = inputs.wasteKg * 52 * EMISSION_FACTORS.waste.landfill;
  
  let recyclingCredit = 0;
  if (inputs.recyclePaper) recyclingCredit += EMISSION_FACTORS.recyclingCredit.paper;
  if (inputs.recyclePlastic) recyclingCredit += EMISSION_FACTORS.recyclingCredit.plastic;
  if (inputs.recycleGlass) recyclingCredit += EMISSION_FACTORS.recyclingCredit.glass;
  if (inputs.recycleMetal) recyclingCredit += EMISSION_FACTORS.recyclingCredit.metal;
  
  // Total waste emissions cannot go below 0 (though recycling credits can reduce it)
  return Math.max(0, baseWaste + recyclingCredit);
}

/**
 * Performs full carbon footprint calculation across all components
 */
export function calculateCategoryFootprints(inputs: CalculatorInputs): UserFootprint {
  const transport = Math.round(calculateTransportEmissions(inputs));
  const energy = Math.round(calculateEnergyEmissions(inputs));
  const food = Math.round(calculateFoodEmissions(inputs));
  const waste = Math.round(calculateWasteEmissions(inputs));
  
  return {
    transport,
    energy,
    food,
    waste,
    total: transport + energy + food + waste
  };
}

/**
 * Default starter inputs for a typical user
 */
export const DEFAULT_INPUTS: CalculatorInputs = {
  vehicleType: 'petrol',
  distanceKm: 150,
  publicTransportKm: 30,
  flightsShortHours: 4,
  flightsLongHours: 0,
  
  electricityKwh: 250,
  gasKwh: 400,
  heatingOilLiters: 0,
  hasSolar: false,
  
  dietType: 'average',
  foodWasteScale: 3,
  
  wasteKg: 15,
  recyclePaper: true,
  recyclePlastic: true,
  recycleGlass: false,
  recycleMetal: false
};
