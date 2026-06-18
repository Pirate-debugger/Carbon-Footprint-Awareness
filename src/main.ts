import './style.css';
import { getAppState } from './core/storage';
import { renderNavigation } from './components/Navigation';
import { renderDashboard } from './components/Dashboard';
import { renderCalculator } from './components/Calculator';
import { renderHabitTracker } from './components/HabitTracker';
import { renderSimulator } from './components/Simulator';
import { renderOffsetter } from './components/Offsetter';
import { renderLearnHub } from './components/LearnHub';

// Application state routing
let activeTab = 'dashboard';

function navigateTo(tabId: string): void {
  activeTab = tabId;
  
  // Re-render Navigation header
  renderNavigation(activeTab, navigateTo);
  
  // Mount the matching component view
  switch (tabId) {
    case 'dashboard':
      renderDashboard(navigateTo);
      break;
    case 'calculator':
      renderCalculator(() => {
        navigateTo('dashboard');
      });
      break;
    case 'habits':
      renderHabitTracker(() => {
        // Callback to refresh nav bar XP values
        renderNavigation(activeTab, navigateTo);
      });
      break;
    case 'simulator':
      renderSimulator();
      break;
    case 'offsets':
      renderOffsetter(() => {
        // Callback to refresh nav bar XP values
        renderNavigation(activeTab, navigateTo);
      });
      break;
    case 'learn':
      renderLearnHub();
      break;
    default:
      renderDashboard(navigateTo);
  }
}

// Initial application bootstrap
function initApp(): void {
  const state = getAppState();
  
  // If onboarding hasn't been completed, show Dashboard which prompts onboarding
  navigateTo(state.onboardingCompleted ? 'dashboard' : 'dashboard');
}

// Kickstart when DOM content is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
// Direct call for immediate Vite HMR compatibility
initApp();
