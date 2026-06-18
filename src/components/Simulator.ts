import { getAppState } from '../core/storage';
import { EMISSION_FACTORS } from '../core/calculator';

export function renderSimulator(): void {
  const viewport = document.getElementById('app-viewport');
  if (!viewport) return;
  const vp = viewport;

  const state = getAppState();
  if (!state.onboardingCompleted) {
    vp.innerHTML = `
      <div class="welcome-screen glass-card">
        <h2 class="mb-4">Assessment Required</h2>
        <p class="welcome-desc">You need to run the initial calculator before using the Simulator.</p>
        <button class="btn btn-primary" id="btn-goto-calc">Go to Calculator</button>
      </div>
    `;
    document.getElementById('btn-goto-calc')?.addEventListener('click', () => {
      // Dispatch custom navigate event or reload view
      const navBtn = document.querySelector('.nav-link[data-tab="calculator"]') as HTMLButtonElement;
      navBtn?.click();
    });
    return;
  }

  // Simulation State Variables (Draft Modifiers)
  let simCarReducePercent = 0; // 0 to 100% reduction
  let simTransitIncreaseKm = 0; // 0 to 200 km
  let simThermostatDegrees = 0; // 0 to 4 degrees lower
  let simVegDays = 0; // 0 to 7 days vegetarian
  let simRecyclingActive = false; // toggles recycling all items

  function calculateSimulatedSavings(): {
    transportSaved: number;
    energySaved: number;
    foodSaved: number;
    wasteSaved: number;
    totalSaved: number;
    simulatedTotal: number;
  } {
    // 1. Transport savings
    const vehicleFactor = EMISSION_FACTORS.transport[state.inputs.vehicleType] || 0;
    const carSavingsWeekly = state.inputs.distanceKm * (simCarReducePercent / 100) * vehicleFactor;
    const transitCostWeekly = simTransitIncreaseKm * EMISSION_FACTORS.transport.public;
    const netTransportSaved = Math.max(0, (carSavingsWeekly * 52) - (transitCostWeekly * 52));

    // 2. Energy savings
    // 1 degree lower on thermostat saves ~8% of gas heating emissions
    const heatingSavedAnnual = state.footprint.energy * 0.08 * simThermostatDegrees;
    const energySaved = Math.min(state.footprint.energy, heatingSavedAnnual);

    // 3. Food savings
    // Difference between average diet and vegetarian diet is 700 kg/year.
    // If they are vegetarian, diff to vegan is 400 kg/year.
    // Let's compute average daily difference
    let dietDiffPerVegDay = 0;
    if (state.inputs.dietType === 'heavy-meat') {
      dietDiffPerVegDay = (2900 - 1300) / 7; // meat-heavy to vegetarian diff per day
    } else if (state.inputs.dietType === 'average') {
      dietDiffPerVegDay = (2000 - 1300) / 7; // average to vegetarian diff per day
    } else if (state.inputs.dietType === 'vegetarian') {
      dietDiffPerVegDay = (1300 - 900) / 7; // vegetarian to vegan diff per day
    }
    const foodSaved = simVegDays * dietDiffPerVegDay;

    // 4. Waste savings
    let wasteSaved = 0;
    if (simRecyclingActive) {
      // Add all missing recycling credits
      if (!state.inputs.recyclePaper) wasteSaved += Math.abs(EMISSION_FACTORS.recyclingCredit.paper);
      if (!state.inputs.recyclePlastic) wasteSaved += Math.abs(EMISSION_FACTORS.recyclingCredit.paper);
      if (!state.inputs.recycleGlass) wasteSaved += Math.abs(EMISSION_FACTORS.recyclingCredit.paper);
      if (!state.inputs.recycleMetal) wasteSaved += Math.abs(EMISSION_FACTORS.recyclingCredit.paper);
    }

    const totalSaved = Math.round(netTransportSaved + energySaved + foodSaved + wasteSaved);
    const simulatedTotal = Math.max(200, state.footprint.total - totalSaved);

    return {
      transportSaved: Math.round(netTransportSaved),
      energySaved: Math.round(energySaved),
      foodSaved: Math.round(foodSaved),
      wasteSaved: Math.round(wasteSaved),
      totalSaved,
      simulatedTotal
    };
  }

  function renderView(): void {
    const savings = calculateSimulatedSavings();
    const percentDrop = Math.round((savings.totalSaved / state.footprint.total) * 100);
    const treesEquiv = Math.round(savings.totalSaved / 22); // 1 mature tree absorbs ~22kg CO2/year

    vp.innerHTML = `
      <div class="section-title-wrapper">
        <h2>What-If Carbon Simulator</h2>
        <p class="section-subtitle">Slide parameters to test how adjustments in daily choices lower your annual footprint.</p>
      </div>

      <div class="simulator-grid">
        
        <!-- Left: Sliders -->
        <div class="glass-card simulator-controls">
          <h3 class="mb-4" style="border-left: 4px solid var(--info-blue); padding-left: 10px;">Simulation Parameters</h3>
          
          <!-- Car Reduction -->
          <div class="form-group">
            <div class="slider-container">
              <div class="slider-header">
                <label class="form-label">Reduce Weekly Driving (Car)</label>
                <span class="slider-val">${simCarReducePercent}% Reduction</span>
              </div>
              <input type="range" class="slider-input" id="sim-car-slider" min="0" max="100" value="${simCarReducePercent}">
              <div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between;">
                <span>Current: ${state.inputs.distanceKm} km/week</span>
                <span>Simulated: ${Math.round(state.inputs.distanceKm * (1 - simCarReducePercent/100))} km/week</span>
              </div>
            </div>
          </div>

          <!-- Public Transit Substitute -->
          <div class="form-group">
            <div class="slider-container">
              <div class="slider-header">
                <label class="form-label">Increase Weekly Transit (Bus/Train)</label>
                <span class="slider-val">+${simTransitIncreaseKm} km/week</span>
              </div>
              <input type="range" class="slider-input" id="sim-transit-slider" min="0" max="150" value="${simTransitIncreaseKm}">
              <div style="font-size: 11px; color: var(--text-muted);">
                Adding public transit distance slightly increases emissions, but offsets large car savings.
              </div>
            </div>
          </div>

          <!-- Thermostat slider -->
          <div class="form-group">
            <div class="slider-container">
              <div class="slider-header">
                <label class="form-label">Lower Thermostat / AC adjustments</label>
                <span class="slider-val">${simThermostatDegrees}°C Lower</span>
              </div>
              <input type="range" class="slider-input" id="sim-thermo-slider" min="0" max="4" step="1" value="${simThermostatDegrees}">
              <div style="font-size: 11px; color: var(--text-muted);">
                Saves up to 8% of household energy consumption per degree Celsius.
              </div>
            </div>
          </div>

          <!-- Plant days slider -->
          <div class="form-group">
            <div class="slider-container">
              <div class="slider-header">
                <label class="form-label">Add Green Plate (Vegetarian/Vegan) Days</label>
                <span class="slider-val">${simVegDays} days/week</span>
              </div>
              <input type="range" class="slider-input" id="sim-veg-slider" min="0" max="7" step="1" value="${simVegDays}">
              <div style="font-size: 11px; color: var(--text-muted);">
                ${state.inputs.dietType === 'vegan' ? 
                  'You are already Vegan! (Maximum diet savings unlocked)' : 
                  `Shifting diet to plant-based days saves significant agricultural emissions.`
                }
              </div>
            </div>
          </div>

          <!-- Recycling streams check -->
          <div class="form-group">
            <label class="checkbox-card ${simRecyclingActive ? 'selected' : ''}" id="sim-recycle-toggle">
              <div class="checkbox-custom"></div>
              <div>
                <strong style="display: block; font-size: 14px;">Enable All Recycling Streams</strong>
                <span style="font-size: 11px; color: var(--text-secondary);">Simulate recycling 100% of household paper, plastics, glass, and metals.</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Right: Results display -->
        <div class="glass-card simulator-outputs" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.25);">
          <h3 class="mb-4">Simulated Forecast</h3>
          
          <div style="width: 180px; height: 180px; border-radius: 50%; border: 6px solid ${percentDrop > 0 ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 30px ${percentDrop > 0 ? 'var(--primary-glow)' : 'transparent'}; margin-bottom: 24px; transition: var(--transition-smooth);">
            <span style="font-size: 12px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Simulated Net</span>
            <span style="font-size: 32px; font-weight: 800; font-family: var(--font-display);">${savings.simulatedTotal.toLocaleString()}</span>
            <span style="font-size: 11px; color: var(--text-muted);">kg CO2e / Year</span>
          </div>

          <div style="width: 100%; display: flex; flex-direction: column; gap: 15px; margin-bottom: 24px; text-align: left;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px;">
              <span style="color: var(--text-secondary);">Current Footprint:</span>
              <span style="font-weight: 700;">${state.footprint.total.toLocaleString()} kg</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px;">
              <span style="color: var(--primary-light); font-weight: 600;">Simulated Savings:</span>
              <span style="font-weight: 700; color: var(--primary-light);">-${savings.totalSaved.toLocaleString()} kg/yr</span>
            </div>

            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px;">
              <span style="color: var(--text-secondary);">Carbon Reduction:</span>
              <span style="font-weight: 700; color: ${percentDrop > 0 ? 'var(--primary-light)' : 'var(--text-primary)'};">${percentDrop}% Drop</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px;">
              <span style="color: var(--info-blue); font-weight: 600;">Ecological Equivalence:</span>
              <span style="font-weight: 700; color: var(--info-blue);">${treesEquiv} Trees / Year</span>
            </div>
          </div>

          <div style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; background: rgba(255,255,255,0.02); padding: 14px; border-radius: 12px; border: 1px solid var(--border-glass);">
            🌲 Planting <strong>${treesEquiv} trees</strong> would absorb equivalent carbon emissions saved by this simulation over 12 months.
          </div>
        </div>

      </div>
    `;

    bindSimListeners();
  }

  function bindSimListeners(): void {
    // Car Slider
    const carSlider = document.getElementById('sim-car-slider') as HTMLInputElement;
    carSlider?.addEventListener('input', () => {
      simCarReducePercent = Number(carSlider.value);
      renderView();
    });

    // Transit Slider
    const transitSlider = document.getElementById('sim-transit-slider') as HTMLInputElement;
    transitSlider?.addEventListener('input', () => {
      simTransitIncreaseKm = Number(transitSlider.value);
      renderView();
    });

    // Thermostat Slider
    const thermoSlider = document.getElementById('sim-thermo-slider') as HTMLInputElement;
    thermoSlider?.addEventListener('input', () => {
      simThermostatDegrees = Number(thermoSlider.value);
      renderView();
    });

    // Veg Days Slider
    const vegSlider = document.getElementById('sim-veg-slider') as HTMLInputElement;
    vegSlider?.addEventListener('input', () => {
      simVegDays = Number(vegSlider.value);
      renderView();
    });

    // Recycling Toggle Checkbox
    const recycleCard = document.getElementById('sim-recycle-toggle');
    recycleCard?.addEventListener('click', (e) => {
      e.preventDefault();
      simRecyclingActive = !simRecyclingActive;
      renderView();
    });
  }

  renderView();
}
