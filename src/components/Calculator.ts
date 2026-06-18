import { getAppState, updateCalculatorInputs } from '../core/storage';
import type { CalculatorInputs } from '../types';
import { showToast } from '../utils/toast';

export function renderCalculator(onComplete: () => void): void {
  const viewport = document.getElementById('app-viewport');
  if (!viewport) return;
  const vp = viewport;

  const state = getAppState();
  let currentStep = 1;
  const totalSteps = 4;

  // Clone active state inputs so edits are draft until submitted
  const draftInputs: CalculatorInputs = JSON.parse(JSON.stringify(state.inputs));

  function getStepTitle(step: number): string {
    switch(step) {
      case 1: return 'Transportation';
      case 2: return 'Home Energy';
      case 3: return 'Food & Diet';
      case 4: return 'Waste & Recycling';
      default: return '';
    }
  }

  function renderStepContent(step: number): string {
    switch(step) {
      case 1:
        return `
          <div class="form-group">
            <label class="form-label">Primary Personal Vehicle Type</label>
            <div class="option-grid">
              <div class="select-card ${draftInputs.vehicleType === 'petrol' ? 'selected' : ''}" data-val="petrol">
                <div style="font-size: 24px; margin-bottom: 8px;">🚗</div>
                <div style="font-weight: 700; font-size: 14px;">Petrol Car</div>
              </div>
              <div class="select-card ${draftInputs.vehicleType === 'diesel' ? 'selected' : ''}" data-val="diesel">
                <div style="font-size: 24px; margin-bottom: 8px;">🚙</div>
                <div style="font-weight: 700; font-size: 14px;">Diesel Car</div>
              </div>
              <div class="select-card ${draftInputs.vehicleType === 'hybrid' ? 'selected' : ''}" data-val="hybrid">
                <div style="font-size: 24px; margin-bottom: 8px;">🔌</div>
                <div style="font-weight: 700; font-size: 14px;">Hybrid</div>
              </div>
              <div class="select-card ${draftInputs.vehicleType === 'electric' ? 'selected' : ''}" data-val="electric">
                <div style="font-size: 24px; margin-bottom: 8px;">⚡</div>
                <div style="font-weight: 700; font-size: 14px;">Electric</div>
              </div>
              <div class="select-card ${draftInputs.vehicleType === 'motorcycle' ? 'selected' : ''}" data-val="motorcycle">
                <div style="font-size: 24px; margin-bottom: 8px;">🏍️</div>
                <div style="font-weight: 700; font-size: 14px;">Motorcycle</div>
              </div>
              <div class="select-card ${draftInputs.vehicleType === 'none' ? 'selected' : ''}" data-val="none">
                <div style="font-size: 24px; margin-bottom: 8px;">🚶</div>
                <div style="font-weight: 700; font-size: 14px;">No Vehicle</div>
              </div>
            </div>
          </div>

          <div class="form-group mt-4 ${draftInputs.vehicleType === 'none' ? 'hidden' : ''}" id="car-dist-group">
            <div class="slider-container">
              <div class="slider-header">
                <label class="form-label" for="dist-car-slider">Weekly Distance Driven (Car/Motorcycle)</label>
                <span class="slider-val" id="dist-car-val">${draftInputs.distanceKm} km/week</span>
              </div>
              <input type="range" class="slider-input" id="dist-car-slider" min="0" max="800" value="${draftInputs.distanceKm}">
            </div>
          </div>

          <div class="form-group mt-4">
            <div class="slider-container">
              <div class="slider-header">
                <label class="form-label" for="dist-public-slider">Weekly Public Transport Travel (Bus/Train)</label>
                <span class="slider-val" id="dist-public-val">${draftInputs.publicTransportKm} km/week</span>
              </div>
              <input type="range" class="slider-input" id="dist-public-slider" min="0" max="500" value="${draftInputs.publicTransportKm}">
            </div>
          </div>

          <div class="form-group mt-4" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <label class="form-label" for="flights-short">Annual Short-Haul Flights (&lt; 3 hours)</label>
              <input type="number" class="form-control" id="flights-short" min="0" value="${draftInputs.flightsShortHours}">
            </div>
            <div>
              <label class="form-label" for="flights-long">Annual Long-Haul Flights (&gt;= 3 hours)</label>
              <input type="number" class="form-control" id="flights-long" min="0" value="${draftInputs.flightsLongHours}">
            </div>
          </div>
        `;
      case 2:
        return `
          <div class="form-group">
            <div class="slider-container">
              <div class="slider-header">
                <label class="form-label" for="energy-elec-slider">Monthly Household Electricity</label>
                <span class="slider-val" id="energy-elec-val">${draftInputs.electricityKwh} kWh/month</span>
              </div>
              <input type="range" class="slider-input" id="energy-elec-slider" min="0" max="1200" value="${draftInputs.electricityKwh}">
            </div>
          </div>

          <div class="form-group mt-4">
            <div class="slider-container">
              <div class="slider-header">
                <label class="form-label" for="energy-gas-slider">Monthly Household Natural Gas</label>
                <span class="slider-val" id="energy-gas-val">${draftInputs.gasKwh} kWh/month</span>
              </div>
              <input type="range" class="slider-input" id="energy-gas-slider" min="0" max="1500" value="${draftInputs.gasKwh}">
            </div>
          </div>

          <div class="form-group mt-4">
            <div class="slider-container">
              <div class="slider-header">
                <label class="form-label" for="energy-oil-slider">Monthly Household Heating Oil</label>
                <span class="slider-val" id="energy-oil-val">${draftInputs.heatingOilLiters} Liters/month</span>
              </div>
              <input type="range" class="slider-input" id="energy-oil-slider" min="0" max="400" value="${draftInputs.heatingOilLiters}">
            </div>
          </div>

          <div class="form-group mt-4">
            <label class="checkbox-card ${draftInputs.hasSolar ? 'selected' : ''}" id="solar-checkbox">
              <div class="checkbox-custom"></div>
              <div>
                <strong style="display: block; font-size: 15px;">Micro-generation Solar Setup</strong>
                <span style="font-size: 12px; color: var(--text-secondary);">We generate local clean power (reduces grid footprint by 75%)</span>
              </div>
            </label>
          </div>
        `;
      case 3:
        return `
          <div class="form-group">
            <label class="form-label">Primary Diet Profile</label>
            <div class="option-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
              <div class="select-card ${draftInputs.dietType === 'heavy-meat' ? 'selected' : ''}" data-diet="heavy-meat">
                <div style="font-size: 26px; margin-bottom: 8px;">🥩</div>
                <strong style="display: block; font-size: 15px;">Meat-Heavy</strong>
                <span style="font-size: 11px; color: var(--text-secondary); display: block; margin-top: 4px;">Frequent consumption of red meats (beef, pork, lamb).</span>
              </div>
              <div class="select-card ${draftInputs.dietType === 'average' ? 'selected' : ''}" data-diet="average">
                <div style="font-size: 26px; margin-bottom: 8px;">🍗</div>
                <strong style="display: block; font-size: 15px;">Balanced Average</strong>
                <span style="font-size: 11px; color: var(--text-secondary); display: block; margin-top: 4px;">Standard intake of chicken, fish, dairy, and occasional red meat.</span>
              </div>
              <div class="select-card ${draftInputs.dietType === 'vegetarian' ? 'selected' : ''}" data-diet="vegetarian">
                <div style="font-size: 26px; margin-bottom: 8px;">🧀</div>
                <strong style="display: block; font-size: 15px;">Vegetarian</strong>
                <span style="font-size: 11px; color: var(--text-secondary); display: block; margin-top: 4px;">No meat or fish; includes cheese, milk, eggs, and plants.</span>
              </div>
              <div class="select-card ${draftInputs.dietType === 'vegan' ? 'selected' : ''}" data-diet="vegan">
                <div style="font-size: 26px; margin-bottom: 8px;">🥗</div>
                <strong style="display: block; font-size: 15px;">Vegan / Plant-Based</strong>
                <span style="font-size: 11px; color: var(--text-secondary); display: block; margin-top: 4px;">100% plant-sourced nutrition. Lowest footprint index.</span>
              </div>
            </div>
          </div>

          <div class="form-group mt-4">
            <div class="slider-container">
              <div class="slider-header">
                <label class="form-label" for="food-waste-slider">Food Waste Factor</label>
                <span class="slider-val" id="food-waste-val">
                  ${draftInputs.foodWasteScale === 1 ? 'Zero Waste / Composting' : 
                    draftInputs.foodWasteScale === 2 ? 'Low Waste' : 
                    draftInputs.foodWasteScale === 3 ? 'Average Waste' : 
                    draftInputs.foodWasteScale === 4 ? 'Moderate Leftovers' : 'High Waste'}
                </span>
              </div>
              <input type="range" class="slider-input" id="food-waste-slider" min="1" max="5" step="1" value="${draftInputs.foodWasteScale}">
            </div>
          </div>
        `;
      case 4:
        return `
          <div class="form-group">
            <div class="slider-container">
              <div class="slider-header">
                <label class="form-label" for="waste-bag-slider">Weekly General Landfill Trash</label>
                <span class="slider-val" id="waste-bag-val">${draftInputs.wasteKg} kg/week</span>
              </div>
              <input type="range" class="slider-input" id="waste-bag-slider" min="0" max="80" value="${draftInputs.wasteKg}">
            </div>
          </div>

          <div class="form-group mt-4">
            <label class="form-label">Active Recycling Habit Streams (Saves Carbon Credits)</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <label class="checkbox-card ${draftInputs.recyclePaper ? 'selected' : ''}" id="recycle-paper-box">
                <div class="checkbox-custom"></div>
                <div>Paper & Cardboard</div>
              </label>
              
              <label class="checkbox-card ${draftInputs.recyclePlastic ? 'selected' : ''}" id="recycle-plastic-box">
                <div class="checkbox-custom"></div>
                <div>Plastics (PET/HDPE)</div>
              </label>

              <label class="checkbox-card ${draftInputs.recycleGlass ? 'selected' : ''}" id="recycle-glass-box">
                <div class="checkbox-custom"></div>
                <div>Glass Jars & Bottles</div>
              </label>

              <label class="checkbox-card ${draftInputs.recycleMetal ? 'selected' : ''}" id="recycle-metal-box">
                <div class="checkbox-custom"></div>
                <div>Metal Cans & Foil</div>
              </label>
            </div>
          </div>
        `;
      default:
        return '';
    }
  }

  function renderWizard(): void {
    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    
    vp.innerHTML = `
      <div class="calc-wizard-card glass-card">
        <div class="section-title-wrapper text-center">
          <h2>Carbon Footprint Assessment</h2>
          <p class="section-subtitle">Provide details to calculate your annual emission footprint.</p>
        </div>

        <!-- Progress Nodes -->
        <div class="wizard-progress-bar">
          <div class="wizard-progress-fill" style="width: ${progressPercent}%;"></div>
          <div class="step-node ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}" title="Transportation">1</div>
          <div class="step-node ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}" title="Home Energy">2</div>
          <div class="step-node ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}" title="Food & Diet">3</div>
          <div class="step-node ${currentStep >= 4 ? 'active' : ''}" title="Waste & Recycling">4</div>
        </div>

        <h3 class="mb-4 text-primary-color" style="font-size: 20px; border-left: 4px solid var(--primary); padding-left: 10px;">
          Step ${currentStep} of ${totalSteps}: ${getStepTitle(currentStep)}
        </h3>

        <!-- Form Step Fields -->
        <form id="wizard-form" class="wizard-step-content">
          ${renderStepContent(currentStep)}
        </form>

        <!-- Navigation Buttons -->
        <div class="wizard-navigation">
          <button class="btn btn-secondary" id="btn-back" ${currentStep === 1 ? 'disabled' : ''}>
            &larr; Back
          </button>
          
          <button class="btn btn-primary" id="btn-next">
            ${currentStep === totalSteps ? 'Calculate Footprint &rarr;' : 'Continue &rarr;'}
          </button>
        </div>
      </div>
    `;

    bindStepListeners();
  }

  function bindStepListeners(): void {
    const nextBtn = document.getElementById('btn-next');
    const backBtn = document.getElementById('btn-back');
    const form = document.getElementById('wizard-form');

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (currentStep > 1) {
          saveCurrentStepData();
          currentStep--;
          renderWizard();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        saveCurrentStepData();
        
        if (currentStep < totalSteps) {
          currentStep++;
          renderWizard();
        } else {
          // Final Submit
          const updatedState = updateCalculatorInputs(draftInputs);
          showToast('Calculator updated! Gross footprint calculated.', 'success');
          
          // Trigger first calculation unlock badge if appropriate
          const justCalcBadge = updatedState.badges.find(b => b.id === 'first_calc');
          if (justCalcBadge?.unlocked && justCalcBadge.unlockedAt === new Date().toISOString().split('T')[0]) {
            // Check if user was rewarded
            showToast('Achievement Unlocked: Climate Aware!', 'info');
          }

          onComplete();
        }
      });
    }

    // Bind specific inputs based on current step
    if (currentStep === 1) {
      // Vehicle selector
      const cards = form?.querySelectorAll('.select-card');
      cards?.forEach(card => {
        card.addEventListener('click', () => {
          cards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          
          const val = card.getAttribute('data-val') as any;
          draftInputs.vehicleType = val;

          // Toggle car distance slider visibility
          const carGroup = document.getElementById('car-dist-group');
          if (carGroup) {
            if (val === 'none') {
              carGroup.classList.add('hidden');
            } else {
              carGroup.classList.remove('hidden');
            }
          }
        });
      });

      // Car Distance Slider
      const carSlider = document.getElementById('dist-car-slider') as HTMLInputElement;
      const carVal = document.getElementById('dist-car-val');
      if (carSlider && carVal) {
        carSlider.addEventListener('input', () => {
          carVal.textContent = `${carSlider.value} km/week`;
          draftInputs.distanceKm = Number(carSlider.value);
        });
      }

      // Transit Distance Slider
      const publicSlider = document.getElementById('dist-public-slider') as HTMLInputElement;
      const publicVal = document.getElementById('dist-public-val');
      if (publicSlider && publicVal) {
        publicSlider.addEventListener('input', () => {
          publicVal.textContent = `${publicSlider.value} km/week`;
          draftInputs.publicTransportKm = Number(publicSlider.value);
        });
      }
    }

    if (currentStep === 2) {
      // Electricity Slider
      const elecSlider = document.getElementById('energy-elec-slider') as HTMLInputElement;
      const elecVal = document.getElementById('energy-elec-val');
      if (elecSlider && elecVal) {
        elecSlider.addEventListener('input', () => {
          elecVal.textContent = `${elecSlider.value} kWh/month`;
          draftInputs.electricityKwh = Number(elecSlider.value);
        });
      }

      // Gas Slider
      const gasSlider = document.getElementById('energy-gas-slider') as HTMLInputElement;
      const gasVal = document.getElementById('energy-gas-val');
      if (gasSlider && gasVal) {
        gasSlider.addEventListener('input', () => {
          gasVal.textContent = `${gasSlider.value} kWh/month`;
          draftInputs.gasKwh = Number(gasSlider.value);
        });
      }

      // Oil Slider
      const oilSlider = document.getElementById('energy-oil-slider') as HTMLInputElement;
      const oilVal = document.getElementById('energy-oil-val');
      if (oilSlider && oilVal) {
        oilSlider.addEventListener('input', () => {
          oilVal.textContent = `${oilSlider.value} Liters/month`;
          draftInputs.heatingOilLiters = Number(oilSlider.value);
        });
      }

      // Solar Checkbox
      const solarCard = document.getElementById('solar-checkbox');
      if (solarCard) {
        solarCard.addEventListener('click', (e) => {
          e.preventDefault();
          draftInputs.hasSolar = !draftInputs.hasSolar;
          if (draftInputs.hasSolar) {
            solarCard.classList.add('selected');
          } else {
            solarCard.classList.remove('selected');
          }
        });
      }
    }

    if (currentStep === 3) {
      // Diet Cards
      const dietCards = form?.querySelectorAll('.select-card[data-diet]');
      dietCards?.forEach(card => {
        card.addEventListener('click', () => {
          dietCards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          draftInputs.dietType = card.getAttribute('data-diet') as any;
        });
      });

      // Food Waste Slider
      const foodWasteSlider = document.getElementById('food-waste-slider') as HTMLInputElement;
      const foodWasteVal = document.getElementById('food-waste-val');
      if (foodWasteSlider && foodWasteVal) {
        foodWasteSlider.addEventListener('input', () => {
          const val = Number(foodWasteSlider.value);
          draftInputs.foodWasteScale = val;
          foodWasteVal.textContent = 
            val === 1 ? 'Zero Waste / Composting' : 
            val === 2 ? 'Low Waste' : 
            val === 3 ? 'Average Waste' : 
            val === 4 ? 'Moderate Leftovers' : 'High Waste';
        });
      }
    }

    if (currentStep === 4) {
      // Waste Slider
      const wasteSlider = document.getElementById('waste-bag-slider') as HTMLInputElement;
      const wasteVal = document.getElementById('waste-bag-val');
      if (wasteSlider && wasteVal) {
        wasteSlider.addEventListener('input', () => {
          wasteVal.textContent = `${wasteSlider.value} kg/week`;
          draftInputs.wasteKg = Number(wasteSlider.value);
        });
      }

      // Recycling Checkboxes
      const paperBox = document.getElementById('recycle-paper-box');
      const plasticBox = document.getElementById('recycle-plastic-box');
      const glassBox = document.getElementById('recycle-glass-box');
      const metalBox = document.getElementById('recycle-metal-box');

      paperBox?.addEventListener('click', (e) => {
        e.preventDefault();
        draftInputs.recyclePaper = !draftInputs.recyclePaper;
        paperBox.classList.toggle('selected', draftInputs.recyclePaper);
      });

      plasticBox?.addEventListener('click', (e) => {
        e.preventDefault();
        draftInputs.recyclePlastic = !draftInputs.recyclePlastic;
        plasticBox.classList.toggle('selected', draftInputs.recyclePlastic);
      });

      glassBox?.addEventListener('click', (e) => {
        e.preventDefault();
        draftInputs.recycleGlass = !draftInputs.recycleGlass;
        glassBox.classList.toggle('selected', draftInputs.recycleGlass);
      });

      metalBox?.addEventListener('click', (e) => {
        e.preventDefault();
        draftInputs.recycleMetal = !draftInputs.recycleMetal;
        metalBox.classList.toggle('selected', draftInputs.recycleMetal);
      });
    }
  }

  function saveCurrentStepData(): void {
    // Collect flight hours from step 1 fields if they exist
    const flightsShortInput = document.getElementById('flights-short') as HTMLInputElement;
    const flightsLongInput = document.getElementById('flights-long') as HTMLInputElement;

    if (flightsShortInput) {
      draftInputs.flightsShortHours = Math.max(0, Number(flightsShortInput.value));
    }
    if (flightsLongInput) {
      draftInputs.flightsLongHours = Math.max(0, Number(flightsLongInput.value));
    }
  }

  // Initial render
  renderWizard();
}
