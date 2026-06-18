import { getAppState } from '../core/storage';

export function renderNavigation(activeTab: string, onTabChange: (tabId: string) => void): void {
  const header = document.getElementById('app-header');
  if (!header) return;

  const state = getAppState();
  
  // Calculate XP progress for the current level (each level requires 100 XP)
  const xpCurrentLevel = state.ecoPoints % 100;
  const xpNeeded = 100;
  const xpPercentage = (xpCurrentLevel / xpNeeded) * 100;

  header.innerHTML = `
    <div class="logo-container" id="nav-logo">
      <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z"/>
        <path d="M9 22v-4h4"/>
      </svg>
      <span class="logo-text">EcoSphere</span>
    </div>
    
    <nav class="nav-links" role="navigation">
      <button class="nav-link ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">Dashboard</button>
      <button class="nav-link ${activeTab === 'calculator' ? 'active' : ''}" data-tab="calculator">Calculator</button>
      <button class="nav-link ${activeTab === 'habits' ? 'active' : ''}" data-tab="habits">Habits & Actions</button>
      <button class="nav-link ${activeTab === 'simulator' ? 'active' : ''}" data-tab="simulator">Simulator</button>
      <button class="nav-link ${activeTab === 'offsets' ? 'active' : ''}" data-tab="offsets">Offset Projects</button>
      <button class="nav-link ${activeTab === 'learn' ? 'active' : ''}" data-tab="learn">Resource Hub</button>
    </nav>
    
    <div class="header-stats">
      <div class="level-badge" title="${state.ecoPoints} total Eco-Points. ${xpNeeded - xpCurrentLevel} XP until Level ${state.level + 1}!">
        <span>LVL</span>
        <span class="level-number">${state.level}</span>
      </div>
      <div style="width: 80px; display: flex; flex-direction: column; gap: 3px;">
        <div style="display: flex; justify-content: space-between; font-size: 9px; color: var(--text-secondary); font-weight: 700;">
          <span>${xpCurrentLevel} XP</span>
          <span>${xpNeeded} XP</span>
        </div>
        <div style="background: rgba(255,255,255,0.08); height: 6px; border-radius: 3px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
          <div style="width: ${xpPercentage}%; background: linear-gradient(90deg, var(--primary), var(--accent-teal)); height: 100%;"></div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  const logo = header.querySelector('#nav-logo');
  if (logo) {
    logo.addEventListener('click', () => onTabChange('dashboard'));
  }

  const buttons = header.querySelectorAll('.nav-link');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId) onTabChange(tabId);
    });
  });
}
