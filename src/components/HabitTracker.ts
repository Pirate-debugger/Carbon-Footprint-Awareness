import { getAppState, toggleHabitCompletion } from '../core/storage';
import { triggerConfetti } from '../utils/confetti';
import { showToast } from '../utils/toast';

export function renderHabitTracker(onUpdateNav: () => void): void {
  const viewport = document.getElementById('app-viewport');
  if (!viewport) return;
  const vp = viewport;

  let activeFilter = 'all';

  function getBadgeIcon(type: string): string {
    switch (type) {
      case 'leaf':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z"/><path d="M9 22v-4h4"/></svg>`;
      case 'bolt':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
      case 'star':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      case 'shield':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
      case 'globe':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
      default:
        return '⭐';
    }
  }

  function renderView(): void {
    const state = getAppState();
    const todayStr = new Date().toISOString().split('T')[0];

    // Filter habits
    const filteredHabits = state.habits.filter(h => {
      if (activeFilter === 'all') return true;
      return h.category === activeFilter;
    });

    const totalCompletions = state.habits.reduce((acc, h) => acc + h.completedDates.length, 0);

    vp.innerHTML = `
      <div class="section-title-wrapper">
        <h2>Sustainable Actions & Badges</h2>
        <p class="section-subtitle">Earn Eco-points, level up, and unlock achievements by logging daily green actions.</p>
      </div>

      <div class="habits-layout">
        
        <!-- Left Side: Habit Logger -->
        <div>
          <div class="glass-card mb-4">
            <h3 class="mb-4">Log Daily Habits</h3>
            
            <div class="habits-filter-bar" role="tablist" aria-label="Habit Categories" id="habits-filter-bar">
              <button class="filter-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all" role="tab" aria-selected="${activeFilter === 'all' ? 'true' : 'false'}" aria-controls="habits-feed">All Categories</button>
              <button class="filter-btn ${activeFilter === 'transport' ? 'active' : ''}" data-filter="transport" role="tab" aria-selected="${activeFilter === 'transport' ? 'true' : 'false'}" aria-controls="habits-feed">Transport</button>
              <button class="filter-btn ${activeFilter === 'energy' ? 'active' : ''}" data-filter="energy" role="tab" aria-selected="${activeFilter === 'energy' ? 'true' : 'false'}" aria-controls="habits-feed">Home Energy</button>
              <button class="filter-btn ${activeFilter === 'food' ? 'active' : ''}" data-filter="food" role="tab" aria-selected="${activeFilter === 'food' ? 'true' : 'false'}" aria-controls="habits-feed">Diet & Food</button>
              <button class="filter-btn ${activeFilter === 'waste' ? 'active' : ''}" data-filter="waste" role="tab" aria-selected="${activeFilter === 'waste' ? 'true' : 'false'}" aria-controls="habits-feed">Waste & Recycling</button>
            </div>

            <div class="habits-list" id="habits-feed" role="tabpanel" aria-labelledby="habits-filter-bar">
              ${filteredHabits.map(habit => {
                const isCompletedToday = habit.completedDates.includes(todayStr);
                const count = habit.completedDates.length;
                return `
                  <div class="habit-row ${isCompletedToday ? 'completed' : ''}" data-id="${habit.id}">
                    <div class="habit-info">
                      <div class="habit-header-inline">
                        <span class="habit-title">${habit.title}</span>
                        <span class="habit-tag tag-${habit.impact}">${habit.impact} Impact</span>
                      </div>
                      <p class="habit-desc">${habit.description}</p>
                      <div class="habit-stats-row">
                        <span>Carbon Saving: <span class="habit-stat-val">${habit.co2Saving} kg/week</span></span>
                        <span>Value: <span style="color: var(--primary-light); font-weight: 600;">+${habit.points} XP</span></span>
                        <span>Logged: <strong style="color: var(--text-primary);">${count} ${count === 1 ? 'time' : 'times'}</strong></span>
                      </div>
                    </div>
                    <button class="habit-action-btn" aria-label="Toggle completion for ${habit.title}" aria-pressed="${isCompletedToday ? 'true' : 'false'}" title="Toggle Daily Completion">
                      ${isCompletedToday ? '✓' : '+'}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Right Side: Gamification & Badges -->
        <div>
          <!-- Score summary -->
          <div class="glass-card mb-4 text-center">
            <h3>Climate Scorecard</h3>
            <div style="margin: 20px 0;">
              <div style="font-size: 14px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Total Eco-Points</div>
              <div style="font-size: 54px; font-weight: 800; font-family: var(--font-display); background: linear-gradient(135deg, var(--primary-light), var(--accent-teal)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                ${state.ecoPoints}
              </div>
              <div style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-top: 4px;">
                Rank Level: ${state.level}
              </div>
              
              <!-- Streak counter display -->
              <div style="display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; padding: 6px 14px; background: rgba(245, 158, 11, 0.12); border-radius: 20px; font-size: 13px; font-weight: 700; color: hsl(35, 100%, 55%); border: 1px solid rgba(245, 158, 11, 0.2);" title="Conescutives days active logging green habits. Keep it up!">
                <span>🔥</span>
                <span>${state.streakCount} Day Streak</span>
              </div>
            </div>
            
            <div style="font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border-glass); padding-top: 14px;">
              Total Habits Logged: <strong>${totalCompletions}</strong>
            </div>
          </div>

          <!-- Badges achievement grid -->
          <div class="glass-card" aria-label="Badges Achievement Grid">
            <h3 class="mb-4">Unlocked Badges</h3>
            <div class="badge-grid" role="group" aria-label="Achievements">
              ${state.badges.map(badge => {
                return `
                  <div class="badge-card ${badge.unlocked ? 'unlocked' : ''}" title="${badge.requirement}" tabindex="0" role="img" aria-label="Badge: ${badge.title}. ${badge.unlocked ? `Unlocked on ${badge.unlockedAt}` : `Locked. Requirement: ${badge.requirement}`}">
                    <div class="badge-icon-wrapper">
                      ${getBadgeIcon(badge.iconType)}
                    </div>
                    <div class="badge-title">${badge.title}</div>
                    <div class="badge-requirement">${badge.unlocked ? `Unlocked ${badge.unlockedAt}` : badge.requirement}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>
      </div>
    `;

    bindTrackerListeners();
  }

  function bindTrackerListeners(): void {
    // Category filters
    const filterBtns = vp.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterVal = btn.getAttribute('data-filter');
        if (filterVal) {
          activeFilter = filterVal;
          renderView();
        }
      });
    });

    // Habit completes
    const habitRows = vp.querySelectorAll('.habit-row');
    habitRows.forEach(row => {
      const actionBtn = row.querySelector('.habit-action-btn');
      const habitId = row.getAttribute('data-id');
      
      if (actionBtn && habitId) {
        actionBtn.addEventListener('click', () => {
          const todayStr = new Date().toISOString().split('T')[0];
          const result = toggleHabitCompletion(habitId, todayStr);
          
          onUpdateNav(); // Redraw header XP bar

          // Award details
          if (result.pointsAwarded > 0) {
            showToast(`Logged action! +${result.pointsAwarded} Eco-Points`, 'success');
            
            // Check if level-up
            if (result.leveledUp) {
              triggerConfetti();
              showLevelUpModal(result.state.level, actionBtn as HTMLElement);
            }
          } else {
            showToast('Action log removed.', 'info');
          }

          // Check for newly unlocked badges
          const oldState = getAppState();
          const oldUnlockedCount = oldState.badges.filter(b => b.unlocked).length;
          const newUnlockedCount = result.state.badges.filter(b => b.unlocked).length;
          
          if (newUnlockedCount > oldUnlockedCount) {
            triggerConfetti();
            const justUnlocked = result.state.badges
              .filter((b, idx) => b.unlocked && !oldState.badges[idx].unlocked)
              .map(b => b.title);
            
            if (justUnlocked.length > 0) {
              showToast(`Achievement Unlocked: ${justUnlocked.join(', ')}!`, 'info');
            }
          }

          renderView(); // Refresh list
        });
      }
    });

    // Badge cards keyboard accessibility
    const badgeCards = vp.querySelectorAll('.badge-card');
    badgeCards.forEach(card => {
      card.addEventListener('keydown', (e: any) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const req = card.getAttribute('title');
          if (req) showToast(`Requirement: ${req}`, 'info');
        }
      });
    });
  }

  function showLevelUpModal(level: number, triggerEl: HTMLElement): void {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="lvl-up-title">
        <button class="modal-close" id="btn-close-modal" aria-label="Close Modal">&times;</button>
        <div style="font-size: 72px; margin-bottom: 15px; animation: float-leaf 2s infinite;">🎉</div>
        <h2 id="lvl-up-title" style="font-size: 28px; background: linear-gradient(135deg, var(--primary-light), var(--accent-teal)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Level Up!
        </h2>
        <h3 style="font-size: 22px; margin: 10px 0;">You have reached Level ${level}</h3>
        <p style="font-size: 14.5px; color: var(--text-secondary); margin-bottom: 24px;">
          Your dedication to sustainable living is paving the path to a cleaner, green biosphere. Keep logging daily actions!
        </p>
        <button class="btn btn-primary" id="btn-modal-ok">Awesome!</button>
      </div>
    `;

    modalContainer.classList.remove('hidden');
    // Shift focus to the close button for accessibility
    setTimeout(() => {
      document.getElementById('btn-close-modal')?.focus();
    }, 50);

    const closeModal = () => {
      modalContainer.classList.add('hidden');
      triggerEl.focus(); // Return focus to opening button
    };

    document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-modal-ok')?.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) closeModal();
    });
  }

  renderView();
}
