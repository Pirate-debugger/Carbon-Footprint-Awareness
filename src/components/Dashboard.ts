import Chart from 'chart.js/auto';
import { getAppState, getNetFootprint } from '../core/storage';
import { CARBON_STANDARDS } from '../core/calculator';

export function renderDashboard(onNavigate: (tabId: string) => void): void {
  const viewport = document.getElementById('app-viewport');
  if (!viewport) return;
  const vp = viewport;

  const state = getAppState();
  
  if (!state.onboardingCompleted) {
    vp.innerHTML = `
      <div class="welcome-screen glass-card">
        <div style="font-size: 64px; margin-bottom: 20px;">🌱</div>
        <h1 class="welcome-title">Welcome to EcoSphere</h1>
        <p class="welcome-desc">
          Begin your sustainability journey. Assess your current carbon footprint, 
          track sustainable daily habits, and sponsor impact projects to restore balance.
        </p>
        <button class="btn btn-primary" id="btn-start-onboarding">
          Complete Initial Assessment &rarr;
        </button>
      </div>
    `;

    document.getElementById('btn-start-onboarding')?.addEventListener('click', () => {
      onNavigate('calculator');
    });
    return;
  }

  // Calculate stats
  const grossFootprint = state.footprint.total;
  const totalOffsets = state.offsetPurchases.reduce((acc, p) => acc + p.co2Offset, 0);
  const netFootprint = getNetFootprint(state);

  // Status designation
  let statusText = 'Climate Conscious';
  let statusClass = 'status-warn';
  if (netFootprint <= 0) {
    statusText = 'Carbon Neutral';
    statusClass = 'status-good';
  } else if (netFootprint < 3000) {
    statusText = 'Eco Champion';
    statusClass = 'status-good';
  } else if (netFootprint > 8000) {
    statusText = 'Carbon Intensive';
    statusClass = 'status-bad';
  }

  // Percent comparison to target
  const targetPercent = Math.min(250, Math.round((netFootprint / CARBON_STANDARDS.netZeroTarget) * 100));
  
  // Highest emission category identification
  const categories = [
    { name: 'Transport', val: state.footprint.transport, tip: 'Switching to public transit, cycling, or an EV will dramatically lower this.' },
    { name: 'Home Energy', val: state.footprint.energy, tip: 'Installing solar panels, insulating your home, or lowering the thermostat by 1°C are your best actions.' },
    { name: 'Food & Diet', val: state.footprint.food, tip: 'Adopting meat-free days (vegetarian/vegan) and reduction of food waste yields high carbon savings.' },
    { name: 'Waste', val: state.footprint.waste, tip: 'Recycling more plastics/metals and composting food waste cuts methane landfill emissions.' }
  ];
  categories.sort((a, b) => b.val - a.val);
  const highestCategory = categories[0];

  vp.innerHTML = `
    <!-- Top Stats Row -->
    <div class="stat-bar-grid">
      <div class="glass-card stat-item">
        <div class="stat-title">Annual Gross Footprint</div>
        <div class="stat-value text-danger-color">${grossFootprint.toLocaleString()} <span style="font-size: 14px;">kg CO2e</span></div>
      </div>
      <div class="glass-card stat-item">
        <div class="stat-title">Total Offset Credits</div>
        <div class="stat-value text-primary-color">-${totalOffsets.toLocaleString()} <span style="font-size: 14px;">kg CO2e</span></div>
      </div>
      <div class="glass-card stat-item">
        <div class="stat-title">Net Footprint</div>
        <div class="stat-value">${netFootprint.toLocaleString()} <span style="font-size: 14px;">kg CO2e</span></div>
      </div>
      <div class="glass-card stat-item" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 8px;">
        <div class="stat-title">Rating Status</div>
        <div class="status-indicator ${statusClass}" style="padding: 4px 12px; border-radius: 12px; font-size: 12px;">${statusText}</div>
        ${netFootprint <= 0 ? `<button class="btn btn-secondary" id="btn-view-cert" style="padding: 6px 12px; font-size: 11px; font-weight: 700; margin-top: 4px; border-color: var(--primary-light);">📜 View Certificate</button>` : ''}
      </div>
    </div>

    <!-- Charts and Budget Grid -->
    <div class="dashboard-grid">
      
      <!-- Chart Breakdown -->
      <div class="glass-card widget-span-6">
        <h3 class="mb-4">Emissions by Source</h3>
        <div class="chart-container">
          <canvas id="categoryChart"></canvas>
        </div>
      </div>

      <!-- Comparison Chart -->
      <div class="glass-card widget-span-6">
        <h3 class="mb-4">National & Global Benchmarks</h3>
        <div class="chart-container">
          <canvas id="comparisonChart"></canvas>
        </div>
      </div>

      <!-- Carbon Budget Meter -->
      <div class="glass-card widget-span-8">
        <h3 class="mb-4">Personal Carbon Budget Alignment</h3>
        <p style="font-size: 14px; color: var(--text-secondary);">
          To limit global warming to 1.5°C, the global target is to reduce individual carbon footprints to under 
          <strong>2,000 kg CO2e</strong> per year (Net Zero Target).
        </p>
        
        <div class="budget-widget">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700;">
            <span>Current Net: ${netFootprint.toLocaleString()} kg</span>
            <span>Net-Zero Limit: ${CARBON_STANDARDS.netZeroTarget.toLocaleString()} kg</span>
          </div>
          
          <div class="budget-bar-wrapper">
            <div class="budget-bar-fill" id="budget-fill" style="width: ${Math.min(100, targetPercent)}%; background: ${netFootprint > CARBON_STANDARDS.netZeroTarget ? 'var(--danger)' : 'var(--primary)'}; box-shadow: 0 0 10px ${netFootprint > CARBON_STANDARDS.netZeroTarget ? 'var(--danger-glow)' : 'var(--primary-glow)'};"></div>
          </div>
          
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted);">
            <span>0 kg</span>
            <span>${targetPercent}% of recommended limit</span>
            <span>Over Limit</span>
          </div>
        </div>

        <div style="margin-top: 20px; font-size: 14px; border-left: 3px solid ${netFootprint > CARBON_STANDARDS.netZeroTarget ? 'var(--danger)' : 'var(--primary)'}; padding-left: 10px;">
          ${netFootprint > CARBON_STANDARDS.netZeroTarget ? 
            `Your emissions exceed the global 1.5°C target limit by <strong>${(netFootprint - CARBON_STANDARDS.netZeroTarget).toLocaleString()} kg CO2e</strong>. Consider adopting habits or funding offsets.` :
            `Outstanding! Your net carbon footprint is aligned with the global Net Zero Target.`
          }
        </div>
      </div>

      <!-- Quick Action Center -->
      <div class="glass-card widget-span-4" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3 class="mb-4">Quick Climate Actions</h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 20px;">
            Log habits or fund clean energy initiatives to reduce your carbon ledger.
          </p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button class="btn btn-secondary" style="justify-content: flex-start; text-align: left;" id="btn-quick-calc">
              ⚙️ Adjust Calculator Inputs
            </button>
            <button class="btn btn-secondary" style="justify-content: flex-start; text-align: left;" id="btn-quick-habits">
              ✅ Log Daily Habits
            </button>
            <button class="btn btn-secondary" style="justify-content: flex-start; text-align: left;" id="btn-quick-offsets">
              🌍 Purchase Carbon Offsets
            </button>
          </div>
        </div>
      </div>

      <!-- Personalized Insights Panel -->
      <div class="glass-card widget-span-12">
        <h3 class="mb-4" style="display: flex; align-items: center; gap: 8px;">
          <span>💡</span> Tailored Carbon Reduction Insights
        </h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          <div style="background: rgba(255,255,255,0.01); border: 1px dashed var(--border-glass-focus); padding: 18px; border-radius: 16px;">
            <strong style="color: var(--primary-light); font-size: 15px; display: block; margin-bottom: 8px;">
              Highest Contributor: ${highestCategory.name}
            </strong>
            <p style="font-size: 13.5px; color: var(--text-secondary);">
              Your annual emissions from ${highestCategory.name} are <strong>${highestCategory.val.toLocaleString()} kg CO2e</strong> (${Math.round((highestCategory.val / grossFootprint) * 100)}% of your total footprint).
              <br><br>
              <em>Recommendation:</em> ${highestCategory.tip}
            </p>
          </div>

          <div style="background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.1); padding: 18px; border-radius: 16px;">
            <strong style="color: var(--info-blue); font-size: 15px; display: block; margin-bottom: 8px;">
              Potential Actions Insight
            </strong>
            <p style="font-size: 13.5px; color: var(--text-secondary);">
              ${state.inputs.vehicleType === 'petrol' || state.inputs.vehicleType === 'diesel' ? 
                `Switching from a fossil fuel vehicle to an electric vehicle (EV) could reduce your transport emissions by up to <strong>70%</strong>. This would save approximately <strong>${Math.round(grossFootprint * 0.25).toLocaleString()} kg CO2e</strong> annually.` :
                `Your transport profile is efficient. To optimize further, consider supporting green mass transit options or bicycling.`
              }
              <br><br>
              ${!state.inputs.hasSolar ? 
                `You have not enabled micro-solar panels. Switching to local solar panel support would save around <strong>${Math.round(state.footprint.energy * 0.75).toLocaleString()} kg CO2e</strong> of electricity emissions per year.` : 
                `Your solar energy setup reduces grid electricity emissions by 75%!`
              }
            </p>
          </div>

          <div style="background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.1); padding: 18px; border-radius: 16px;">
            <strong style="color: var(--primary-light); font-size: 15px; display: block; margin-bottom: 8px;">
              Diet Impact
            </strong>
            <p style="font-size: 13.5px; color: var(--text-secondary);">
              Your diet type is set to <strong>${state.inputs.dietType.toUpperCase()}</strong>.
              <br><br>
              ${state.inputs.dietType === 'heavy-meat' || state.inputs.dietType === 'average' ? 
                `Cutting out beef and pork just 2 days a week (adopting Vegetarian habits) would reduce your diet emissions by <strong>${Math.round((state.footprint.food - 1300) * 0.5).toLocaleString()} kg CO2e</strong> annually. Logging habits will automatically build points.` : 
                `Thank you for maintaining a low-emission diet! Your food footprint is excellent.`
              }
            </p>
          </div>
        </div>
      </div>

    </div>
  `;

  // Attach event listeners
  document.getElementById('btn-quick-calc')?.addEventListener('click', () => onNavigate('calculator'));
  document.getElementById('btn-quick-habits')?.addEventListener('click', () => onNavigate('habits'));
  document.getElementById('btn-quick-offsets')?.addEventListener('click', () => onNavigate('offsets'));

  // View Certificate
  if (netFootprint <= 0) {
    document.getElementById('btn-view-cert')?.addEventListener('click', () => {
      showCertificateModal();
    });
  }

  function showCertificateModal(): void {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const verifyId = `ES-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const todayStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    modalContainer.innerHTML = `
      <div class="modal-content" style="max-width: 600px; padding: 24px; border: none; background: transparent; box-shadow: none;">
        <button class="modal-close" id="btn-close-cert" style="color: white; font-size: 32px; right: -10px; top: -10px;" aria-label="Close Certificate">&times;</button>
        
        <div class="certificate-box">
          <div class="certificate-title">Certificate of Carbon Neutrality</div>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em;">This is proudly presented to</p>
          
          <div class="certificate-name">${state.userName}</div>
          
          <p style="font-size: 13.5px; line-height: 1.5; color: #475569; max-width: 460px; margin: 0 auto 20px auto;">
            for successfully neutralizing their calculated annual greenhouse gas emissions through green habits and clean energy sponsorships, achieving a net-zero carbon ledger.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; border-top: 1px dashed #cbd5e1; border-bottom: 1px dashed #cbd5e1; padding: 12px 0; max-width: 440px; margin: 0 auto; font-size: 12px; color: #475569;">
            <div>
              <span style="display: block; font-weight: 500;">Annual Gross</span>
              <strong style="color: #ef4444; font-size: 14px;">${grossFootprint.toLocaleString()} kg</strong>
            </div>
            <div>
              <span style="display: block; font-weight: 500;">Offsets Applied</span>
              <strong style="color: #10b981; font-size: 14px;">-${totalOffsets.toLocaleString()} kg</strong>
            </div>
            <div>
              <span style="display: block; font-weight: 500;">Net Balance</span>
              <strong style="color: #047857; font-size: 14px;">0 kg CO2e</strong>
            </div>
          </div>

          <div class="certificate-seal">
            NET-ZERO<br>APPROVED<br>🌿
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-top: 25px; padding: 0 10px;">
            <span>Date: ${todayStr}</span>
            <span>ID: ${verifyId}</span>
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
          <button class="btn btn-primary" id="btn-print-cert" style="padding: 10px 20px; font-size: 14px;">🖨️ Print Certificate</button>
          <button class="btn btn-secondary" id="btn-cert-close" style="padding: 10px 20px; font-size: 14px; color: white;">Done</button>
        </div>
      </div>
    `;

    modalContainer.classList.remove('hidden');

    const closeModal = () => {
      modalContainer.classList.add('hidden');
    };

    document.getElementById('btn-close-cert')?.addEventListener('click', closeModal);
    document.getElementById('btn-cert-close')?.addEventListener('click', closeModal);
    
    const printBtn = document.getElementById('btn-print-cert');
    printBtn?.addEventListener('click', () => {
      window.print();
    });

    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) closeModal();
    });
  }

  // Initialize charts after rendering elements
  setTimeout(() => {
    initCharts(state.footprint, netFootprint);
  }, 50);
}

function initCharts(footprint: any, netFootprint: number) {
  // 1. Doughnut Chart: Emissions Breakdown
  const catCanvas = document.getElementById('categoryChart') as HTMLCanvasElement;
  if (catCanvas) {
    const ctx = catCanvas.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Transport', 'Home Energy', 'Food & Diet', 'Waste'],
          datasets: [{
            data: [footprint.transport, footprint.energy, footprint.food, footprint.waste],
            backgroundColor: [
              '#3b82f6', // blue (transport)
              '#eab308', // yellow (energy)
              '#10b981', // green (food)
              '#ef4444'  // red (waste)
            ],
            borderColor: 'rgba(15, 23, 42, 0.9)',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#e2e8f0',
                font: {
                  family: 'Inter',
                  size: 12
                }
              }
            }
          }
        }
      });
    }
  }

  // 2. Bar Chart: Comparisons
  const compCanvas = document.getElementById('comparisonChart') as HTMLCanvasElement;
  if (compCanvas) {
    const ctx = compCanvas.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Your Net', 'Global Avg', 'EU Avg', 'US Avg', 'Net-Zero Target'],
          datasets: [{
            label: 'Emissions (kg CO2e / Year)',
            data: [
              netFootprint,
              CARBON_STANDARDS.globalAverage,
              CARBON_STANDARDS.euAverage,
              CARBON_STANDARDS.usAverage,
              CARBON_STANDARDS.netZeroTarget
            ],
            backgroundColor: [
              netFootprint > CARBON_STANDARDS.netZeroTarget ? '#ef4444' : '#10b981', // green if meets target
              '#94a3b8',
              '#64748b',
              '#475569',
              '#06b6d4'
            ],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#cbd5e1',
                font: {
                  family: 'Inter'
                }
              }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: '#cbd5e1',
                font: {
                  family: 'Inter'
                }
              }
            }
          }
        }
      });
    }
  }
}
