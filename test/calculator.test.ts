import { describe, it, expect } from 'vitest';
import { 
  calculateTransportEmissions, 
  calculateEnergyEmissions, 
  calculateFoodEmissions, 
  calculateWasteEmissions,
  calculateCategoryFootprints,
  DEFAULT_INPUTS
} from '../src/core/calculator';
import { CalculatorInputs } from '../src/types';

describe('Carbon Footprint Calculator Engine', () => {

  describe('Transportation Calculations', () => {
    it('should calculate zero vehicle emissions if type is none', () => {
      const inputs: CalculatorInputs = {
        ...DEFAULT_INPUTS,
        vehicleType: 'none',
        distanceKm: 200, // should be ignored
        publicTransportKm: 0,
        flightsShortHours: 0,
        flightsLongHours: 0
      };
      const emissions = calculateTransportEmissions(inputs);
      expect(emissions).toBe(0);
    });

    it('should calculate correct emissions for petrol vehicles', () => {
      const inputs: CalculatorInputs = {
        ...DEFAULT_INPUTS,
        vehicleType: 'petrol',
        distanceKm: 100, // 100 * 52 = 5200 km/year. petrol factor is 0.18. 5200 * 0.18 = 936
        publicTransportKm: 0,
        flightsShortHours: 0,
        flightsLongHours: 0
      };
      const emissions = calculateTransportEmissions(inputs);
      expect(emissions).toBe(936);
    });

    it('should calculate correct emissions for electric vehicles', () => {
      const inputs: CalculatorInputs = {
        ...DEFAULT_INPUTS,
        vehicleType: 'electric',
        distanceKm: 100, // 100 * 52 = 5200 km/year. EV factor is 0.05. 5200 * 0.05 = 260
        publicTransportKm: 0,
        flightsShortHours: 0,
        flightsLongHours: 0
      };
      const emissions = calculateTransportEmissions(inputs);
      expect(emissions).toBe(260);
    });

    it('should include flights and public transport', () => {
      const inputs: CalculatorInputs = {
        ...DEFAULT_INPUTS,
        vehicleType: 'none',
        publicTransportKm: 100, // 100 * 52 * 0.06 = 312
        flightsShortHours: 10, // 10 * 150 = 1500
        flightsLongHours: 5 // 5 * 110 = 550
      };
      const emissions = calculateTransportEmissions(inputs);
      expect(emissions).toBe(312 + 1500 + 550);
    });
  });

  describe('Household Energy Calculations', () => {
    it('should apply electricity and gas factors', () => {
      const inputs: CalculatorInputs = {
        ...DEFAULT_INPUTS,
        electricityKwh: 200, // 200 * 12 * 0.40 = 960
        gasKwh: 100, // 100 * 12 * 0.20 = 240
        heatingOilLiters: 0,
        hasSolar: false
      };
      const emissions = calculateEnergyEmissions(inputs);
      expect(emissions).toBe(960 + 240);
    });

    it('should apply 75% emissions reduction when solar is enabled', () => {
      const inputs: CalculatorInputs = {
        ...DEFAULT_INPUTS,
        electricityKwh: 200, // 200 * 12 * (0.40 * 0.25) = 240
        gasKwh: 0,
        heatingOilLiters: 0,
        hasSolar: true
      };
      const emissions = calculateEnergyEmissions(inputs);
      expect(emissions).toBe(240);
    });
  });

  describe('Food/Diet Calculations', () => {
    it('should return vegan diet factor with waste adjustments', () => {
      const inputs: CalculatorInputs = {
        ...DEFAULT_INPUTS,
        dietType: 'vegan', // base 900
        foodWasteScale: 1 // offset -100
      };
      const emissions = calculateFoodEmissions(inputs);
      expect(emissions).toBe(800);
    });

    it('should return meat-heavy diet factor with high waste scale', () => {
      const inputs: CalculatorInputs = {
        ...DEFAULT_INPUTS,
        dietType: 'heavy-meat', // base 2900
        foodWasteScale: 5 // addition 450
      };
      const emissions = calculateFoodEmissions(inputs);
      expect(emissions).toBe(3350);
    });
  });

  describe('Waste and Recycling Calculations', () => {
    it('should apply landfill factor and subtract recycling credits', () => {
      const inputs: CalculatorInputs = {
        ...DEFAULT_INPUTS,
        wasteKg: 10, // 10 * 52 * 0.50 = 260 kg CO2e
        recyclePaper: true, // -40
        recyclePlastic: true, // -50
        recycleGlass: false,
        recycleMetal: false
      };
      const emissions = calculateWasteEmissions(inputs);
      expect(emissions).toBe(260 - 40 - 50); // 170
    });

    it('should floor waste emissions at zero', () => {
      const inputs: CalculatorInputs = {
        ...DEFAULT_INPUTS,
        wasteKg: 1, // 1 * 52 * 0.50 = 26
        recyclePaper: true, // -40
        recyclePlastic: true // -50
      };
      const emissions = calculateWasteEmissions(inputs);
      expect(emissions).toBe(0); // floored at 0
    });
  });

  describe('Aggregate Footprint Calculation', () => {
    it('should sum all categories correctly and return rounded totals', () => {
      const inputs: CalculatorInputs = {
        vehicleType: 'hybrid', // 150 * 52 * 0.10 = 780
        distanceKm: 150,
        publicTransportKm: 0,
        flightsShortHours: 0,
        flightsLongHours: 0,

        electricityKwh: 100, // 100 * 12 * 0.4 = 480
        gasKwh: 0,
        heatingOilLiters: 0,
        hasSolar: false,

        dietType: 'vegetarian', // 1300
        foodWasteScale: 2, // 0

        wasteKg: 5, // 5 * 52 * 0.5 = 130
        recyclePaper: false,
        recyclePlastic: false,
        recycleGlass: false,
        recycleMetal: false
      };

      const footprint = calculateCategoryFootprints(inputs);
      expect(footprint.transport).toBe(780);
      expect(footprint.energy).toBe(480);
      expect(footprint.food).toBe(1300);
      expect(footprint.waste).toBe(130);
      expect(footprint.total).toBe(780 + 480 + 1300 + 130);
    });
  });
});
