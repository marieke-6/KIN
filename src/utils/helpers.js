// ─── UI Helpers ───

/**
 * Returns avatar HTML for a member
 * @param {string} init - initials
 * @param {string} color - color key (sage, lav, peach, amber)
 * @param {string} size - sm | md | lg
 */
export function avatar(init, color = 'sage', size = 'sm') {
  return `<div class="avatar avatar-${size} avatar-${color}">${init}</div>`;
}

/**
 * Returns a community icon box
 */
export function commIcon(iconClass, color, size = 'md') {
  const bg = { sage:'var(--sage)', lav:'var(--lav)', peach:'var(--peach)', amber:'var(--amber)' }[color] || 'var(--sage)';
  const fg = { sage:'var(--sage-dark)', lav:'var(--lav-dark)', peach:'var(--peach-dark)', amber:'var(--amber-dark)' }[color] || 'var(--sage-dark)';
  return `<div class="comm-icon comm-icon-${size}" style="background:${bg};"><i class="ti ${iconClass}" aria-hidden="true" style="font-size:${size==='md'?22:18}px;color:${fg};"></i></div>`;
}

/**
 * Returns the activity dot + label for a member
 */
export function activityStatus(status, last) {
  const dotClass = { green:'dot-green', amber:'dot-amber', red:'dot-red', gray:'dot-gray' }[status] || 'dot-gray';
  return `<div style="display:flex;align-items:center;gap:5px;">
    <span class="activity-dot ${dotClass}"></span>
    <span class="text-small text-muted">${last}</span>
  </div>`;
}

/**
 * Returns a capacity bar
 */
export function capacityBar(going, max) {
  const pct = Math.round((going / max) * 100);
  const full = going >= max;
  return `<div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
    <div class="capacity-bar"><div class="capacity-fill${full?' capacity-fill-full':''}" style="width:${pct}%"></div></div>
    <span class="text-tiny text-muted">${going}/${max}</span>
  </div>`;
}

/**
 * Returns event date block
 */
export function eventDateBlock(day, mon, colorClass = 'event-date-amber') {
  return `<div class="event-date ${colorClass}"><div class="day">${day}</div><div class="mon">${mon}</div></div>`;
}

/**
 * Returns a top nav bar with optional back button
 */
export function navBar({ logo = false, title = '', subtitle = '', back = null, right = '' } = {}) {
  const left = logo
    ? `<span class="nav-logo">Kin</span>`
    : `<div class="nav-back">
        <button class="nav-back-btn" onclick="${back}" aria-label="Go back"><i class="ti ti-arrow-left" aria-hidden="true"></i></button>
        <div>
          <p class="fw-500" style="font-size:15px;color:var(--text);">${title}</p>
          ${subtitle ? `<p class="text-tiny text-muted">${subtitle}</p>` : ''}
        </div>
      </div>`;
  return `<nav class="nav" role="navigation">${left}${right ? `<div>${right}</div>` : ''}</nav>`;
}

/**
 * Returns bottom navigation bar
 */
export function bottomNav(activeScreen) {
  const items = [
    { screen: 'dashboard', icon: 'ti-home',           label: 'Home' },
    { screen: 'explore',   icon: 'ti-compass',         label: 'Explore' },
    { screen: 'events',    icon: 'ti-calendar-event',  label: 'Events' },
    { screen: 'profile',   icon: 'ti-user',            label: 'Profile' },
  ];
  return `<nav class="bottom-nav" role="navigation" aria-label="Main navigation">
    ${items.map(i => `
      <button class="bnav-item${i.screen === activeScreen ? ' active' : ''}" 
              data-screen="${i.screen}"
              onclick="window.kinNavigate('${i.screen}')"
              aria-label="${i.label}">
        <i class="ti ${i.icon}" aria-hidden="true"></i>
        <span>${i.label}</span>
      </button>`).join('')}
  </nav>`;
}

/**
 * Validates date of birth for 18+ check
 * Returns age as integer
 */
export function calculateAge(dobString) {
  if (!dobString) return null;
  const today = new Date();
  const birth = new Date(dobString);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1;
  }
  return age;
}

/**
 * Toggles a toggle switch element
 */
export function toggleSwitch(btn) {
  const isOn = btn.classList.contains('on');
  btn.classList.toggle('on', !isOn);
  btn.classList.toggle('off', isOn);
}

/**
 * Returns a business badge pill for a profile
 * @param {boolean} isBusiness
 * @param {string}  businessType  e.g. "Café"
 */
export function businessBadge(isBusiness, businessType = '') {
  if (!isBusiness) return '';
  const label = businessType ? businessType : 'Business';
  return `<span class="pill pill-lav text-tiny" style="white-space:nowrap;">
            <i class="ti ti-building-store" aria-hidden="true" style="font-size:10px;"></i> ${escapeHtml(label)}
          </span>`;
}

/**
 * Escapes HTML to prevent XSS
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
