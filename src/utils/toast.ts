export function showToast(message: string, type: 'success' | 'info' | 'error' = 'success'): void {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'info' ? 'toast-info' : ''}`;
  
  // Set icon based on type
  let icon = '🌱';
  if (type === 'error') icon = '⚠️';
  if (type === 'info') icon = 'ℹ️';
  
  toast.innerHTML = `
    <span style="font-size: 18px; margin-right: 4px;">${icon}</span>
    <div>${message}</div>
  `;

  container.appendChild(toast);

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    toast.style.animation = 'slide-in 0.3s forwards reverse cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}
