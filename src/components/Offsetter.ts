import { getAppState, purchaseOffset, OFFSET_PROJECTS } from '../core/storage';
import { triggerConfetti } from '../utils/confetti';
import { showToast } from '../utils/toast';

export function renderOffsetter(onUpdateNav: () => void): void {
  const viewport = document.getElementById('app-viewport');
  if (!viewport) return;
  const vp = viewport;

  function getProjectEmoji(cat: string): string {
    switch (cat) {
      case 'forestry': return '🌳';
      case 'renewables': return '☀️';
      case 'community': return '🔥';
      case 'methane': return '🏭';
      default: return '🌍';
    }
  }

  function renderView(): void {
    const state = getAppState();
    
    // Sort transactions in reverse-chronological order
    const sortedPurchases = [...state.offsetPurchases].reverse();

    vp.innerHTML = `
      <div class="section-title-wrapper">
        <h2>Sponsor Carbon Offset Projects</h2>
        <p class="section-subtitle">Fund certified environmental projects to offset your gross greenhouse gas emissions.</p>
      </div>

      <!-- Projects Grid -->
      <div class="offset-grid mb-4">
        ${OFFSET_PROJECTS.map(project => {
          return `
            <div class="glass-card offset-card" data-project-id="${project.id}">
              <div class="offset-top">
                <div style="font-size: 32px; margin-bottom: 8px;">${getProjectEmoji(project.category)}</div>
                <h3 class="offset-card-title">${project.title}</h3>
                <span class="offset-cat-badge">${project.category}</span>
                <p class="offset-desc">${project.description}</p>
              </div>

              <div class="offset-buy-section">
                <div class="offset-details-row">
                  <span>Carbon Offset:</span>
                  <strong>${project.co2ReducedPerUnit} kg CO2e / ${project.unitName}</strong>
                </div>
                <div class="offset-details-row">
                  <span>Cost:</span>
                  <strong>$${project.costPerUnit.toFixed(2)} USD</strong>
                </div>
                
                <div class="offset-input-row">
                  <label class="form-label" style="margin-bottom: 0;" for="units-${project.id}">Quantity:</label>
                  <input type="number" class="form-control offset-number-input" id="units-${project.id}" min="1" max="100" value="1">
                  
                  <button class="btn btn-primary btn-sponsor" style="flex: 1; padding: 10px;">
                    Sponsor
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Offset ledger history -->
      <div class="glass-card">
        <h3 class="mb-4">Offset Contribution History</h3>
        ${sortedPurchases.length === 0 ? `
          <div class="text-center text-muted-color" style="padding: 30px 0;">
            <div style="font-size: 36px; margin-bottom: 10px;">📄</div>
            <p>No offset projects sponsored yet. Invest in projects above to balance your ledger.</p>
          </div>
        ` : `
          <div class="history-table-wrapper">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Sponsorship Project</th>
                  <th>Date</th>
                  <th>Quantity Funded</th>
                  <th>Cost (USD)</th>
                  <th>Net Offset (kg CO2e)</th>
                </tr>
              </thead>
              <tbody>
                ${sortedPurchases.map(p => `
                  <tr>
                    <td><strong>${p.projectTitle}</strong></td>
                    <td>${p.date}</td>
                    <td>${p.units}</td>
                    <td style="color: var(--primary-light); font-weight: 600;">$${p.cost.toFixed(2)}</td>
                    <td style="color: var(--primary-light); font-weight: 600;">-${p.co2Offset.toLocaleString()} kg</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    bindOffsetListeners();
  }

  function bindOffsetListeners(): void {
    const cards = vp.querySelectorAll('.offset-card');
    cards.forEach(card => {
      const projectId = card.getAttribute('data-project-id');
      const sponsorBtn = card.querySelector('.btn-sponsor');
      const unitsInput = card.querySelector('.offset-number-input') as HTMLInputElement;

      if (sponsorBtn && projectId && unitsInput) {
        sponsorBtn.addEventListener('click', () => {
          const units = Number(unitsInput.value);
          if (units <= 0 || isNaN(units)) {
            showToast('Please enter a valid quantity of units.', 'error');
            return;
          }
          
          showCheckoutModal(projectId, units);
        });
      }
    });
  }

  function showCheckoutModal(projectId: string, units: number): void {
    const project = OFFSET_PROJECTS.find(p => p.id === projectId);
    if (!project) return;

    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const totalCost = project.costPerUnit * units;
    const totalOffset = project.co2ReducedPerUnit * units;

    modalContainer.innerHTML = `
      <div class="modal-content" style="max-width: 550px; text-align: left;">
        <button class="modal-close" id="btn-close-checkout">&times;</button>
        
        <h2 class="mb-4 text-center" style="font-size: 24px; color: var(--primary-light);">
          Sponsorship Checkout
        </h2>

        <!-- Order Summary -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); padding: 18px; border-radius: 16px; margin-bottom: 20px;">
          <h4 style="font-size: 14px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 10px;">Order Summary</h4>
          <div style="display: flex; justify-content: space-between; font-size: 15px; margin-bottom: 6px;">
            <span>Project:</span>
            <strong>${project.title}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 15px; margin-bottom: 6px;">
            <span>Quantity:</span>
            <strong>${units} ${project.unitName}${units > 1 ? 's' : ''}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 15px; margin-bottom: 6px; border-top: 1px dashed var(--border-glass); padding-top: 6px; margin-top: 6px;">
            <span style="color: var(--primary-light); font-weight: 600;">Carbon Reduction:</span>
            <strong style="color: var(--primary-light); font-weight: 700;">-${totalOffset.toLocaleString()} kg CO2e</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 15px;">
            <span>Total Cost:</span>
            <strong style="font-size: 18px; color: var(--text-primary); font-family: var(--font-display);">$${totalCost.toFixed(2)} USD</strong>
          </div>
        </div>

        <!-- Secure Simulator Alert -->
        <div style="background: rgba(200, 95, 48, 0.05); border: 1px solid var(--border-glass-focus); padding: 12px; border-radius: 12px; margin-bottom: 20px; font-size: 12px; color: var(--text-secondary);">
          🛡️ <strong>Secure Sandbox Simulation Mode:</strong> No actual financial transactions or payment details are collected or processed. Your data remains secure on your device.
        </div>

        <!-- Mock Payment Fields -->
        <form id="checkout-form">
          <div class="form-group">
            <label class="form-label" for="card-holder">Sponsor / Cardholder Name</label>
            <input type="text" class="form-control" id="card-holder" placeholder="Enter Full Name" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="card-num">Card Details (Simulated)</label>
            <input type="text" class="form-control" id="card-num" placeholder="XXXX - XXXX - XXXX - XXXX" required>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 24px;">
            <div>
              <label class="form-label" for="card-expiry">Expiry Date</label>
              <input type="text" class="form-control" id="card-expiry" placeholder="MM/YY" required>
            </div>
            <div>
              <label class="form-label" for="card-cvv">CVV</label>
              <input type="password" class="form-control" id="card-cvv" placeholder="•••" maxlength="3" required>
            </div>
          </div>

          <button class="btn btn-primary" type="submit" style="width: 100%; font-size: 16px; padding: 14px;">
            Authorize Carbon Sponsorship ($${totalCost.toFixed(2)} USD)
          </button>
        </form>
      </div>
    `;

    modalContainer.classList.remove('hidden');

    const closeModal = () => {
      modalContainer.classList.add('hidden');
    };

    document.getElementById('btn-close-checkout')?.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) closeModal();
    });

    const form = document.getElementById('checkout-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const purchaseResult = purchaseOffset(projectId, units);
      onUpdateNav();

      triggerConfetti();
      closeModal();
      
      showToast(`Successfully sponsored! -${totalOffset.toLocaleString()} kg CO2e offset.`, 'success');
      
      if (purchaseResult.newlyUnlocked.length > 0) {
        showToast(`Achievement Unlocked: ${purchaseResult.newlyUnlocked.join(', ')}!`, 'info');
      }

      renderView(); // Refresh dashboard list
    });
  }

  renderView();
}
