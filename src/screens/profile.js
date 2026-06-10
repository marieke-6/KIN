// ─── Profile & Settings Screens ───
import { state, navigate, INTERESTS } from '../utils/state.js';
import { bottomNav } from '../utils/helpers.js';

export function renderProfile() {
  const user = state.user || { name: 'Marieke', city: 'Vienna', initials: 'M' };
  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('dashboard')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <span class="fw-500" style="font-size:16px;">Your profile</span>
      </div>
      <button class="btn btn-sm" onclick="window.kinNavigate('edit-profile')">
        <i class="ti ti-edit" aria-hidden="true"></i> Edit
      </button>
    </nav>
    <div class="screen-body">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
        <div class="avatar avatar-lg avatar-sage">${user.initials}</div>
        <div>
          <p style="font-size:19px;font-weight:500;">${user.name}</p>
          <p class="text-muted text-small">${user.city} · Member since June 2026</p>
          <p class="text-tiny text-muted mt-sm">No photo · No surname · No bio required</p>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat-card"><div class="stat-val">3</div><div class="stat-lbl">Communities</div></div>
        <div class="stat-card"><div class="stat-val">5</div><div class="stat-lbl">Events attended</div></div>
        <div class="stat-card"><div class="stat-val">12</div><div class="stat-lbl">People met</div></div>
      </div>

      <div class="section-label">Interests</div>
      <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:var(--space-lg);">
        <span class="pill pill-amber"><i class="ti ti-chess" aria-hidden="true"></i> Board games</span>
        <span class="pill pill-sage"><i class="ti ti-run" aria-hidden="true"></i> Running</span>
        <span class="pill pill-lav"><i class="ti ti-palette" aria-hidden="true"></i> Painting</span>
      </div>

      <div class="section-label">Settings</div>
      <div class="card mb-md">
        <div class="setting-row" onclick="window.kinNavigate('privacy')">
          <div style="display:flex;align-items:center;gap:9px;">
            <i class="ti ti-shield" aria-hidden="true" style="font-size:17px;color:var(--accent);"></i>
            <span style="font-size:14px;">Privacy &amp; data</span>
          </div>
          <i class="ti ti-chevron-right" aria-hidden="true" style="font-size:15px;color:var(--muted);"></i>
        </div>
        <div class="setting-row" onclick="window.kinNavigate('notification-settings')">
          <div style="display:flex;align-items:center;gap:9px;">
            <i class="ti ti-bell" aria-hidden="true" style="font-size:17px;color:var(--muted);"></i>
            <span style="font-size:14px;">Notification settings</span>
          </div>
          <i class="ti ti-chevron-right" aria-hidden="true" style="font-size:15px;color:var(--muted);"></i>
        </div>
        <div class="setting-row">
          <div style="display:flex;align-items:center;gap:9px;">
            <i class="ti ti-map-pin" aria-hidden="true" style="font-size:17px;color:var(--muted);"></i>
            <span style="font-size:14px;">Change city</span>
          </div>
          <i class="ti ti-chevron-right" aria-hidden="true" style="font-size:15px;color:var(--muted);"></i>
        </div>
      </div>

      <button class="btn btn-danger btn-full mb-lg" onclick="window.kinNavigate('landing')">
        <i class="ti ti-logout" aria-hidden="true"></i> Log out
      </button>
    </div>
    ${bottomNav('profile')}
  </main>`;
}

export function renderEditProfile() {
  const user = state.user || { name: 'Marieke', city: 'Vienna', initials: 'M' };
  const chips = INTERESTS.map(i => {
    const sel = ['Board games','Running','Painting'].includes(i);
    return `<span class="interest-chip${sel?' selected':''}" onclick="this.classList.toggle('selected')">${i}</span>`;
  }).join('');

  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('profile')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <span class="fw-500" style="font-size:16px;">Edit profile</span>
      </div>
      <button class="btn btn-primary btn-sm" onclick="window.kinNavigate('profile')">Save</button>
    </nav>
    <div class="screen-body">
      <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:22px;">
        <div class="avatar avatar-lg avatar-sage mb-md">${user.initials}</div>
        <p class="text-tiny text-muted">No profile photo on Kin — your name is enough</p>
      </div>
      <div class="field">
        <label class="field-label" for="edit-name">First name only</label>
        <input type="text" id="edit-name" value="${user.name}" />
      </div>
      <div class="field">
        <label class="field-label" for="edit-city">City</label>
        <input type="text" id="edit-city" value="${user.city}" />
      </div>
      <div class="field">
        <label class="field-label" for="edit-bio">Short bio (optional)</label>
        <textarea id="edit-bio" rows="2" placeholder="e.g. Moved here last year, looking to meet people"></textarea>
      </div>
      <div class="field">
        <label class="field-label">Interests</label>
        <div style="display:flex;flex-wrap:wrap;gap:7px;">${chips}</div>
      </div>
    </div>
  </main>`;
}

export function renderPrivacy() {
  const row = (label, sub, id, locked = false) => `
    <div class="toggle-row">
      <div>
        <p style="font-size:14px;">${label}</p>
        ${sub ? `<p class="text-tiny text-muted mt-sm">${sub}</p>` : ''}
      </div>
      <button class="toggle on${locked ? '' : ''}" id="${id}"
              ${locked ? 'disabled style="cursor:default;opacity:0.5;"' : `onclick="window.kinToggle(this)"`}
              aria-label="Toggle ${label}">
        <div class="toggle-knob"></div>
      </button>
    </div>`;

  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('profile')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <span class="fw-500" style="font-size:16px;">Privacy &amp; data</span>
      </div>
    </nav>
    <div class="screen-body">
      <div class="banner banner-privacy mb-lg">
        <i class="ti ti-shield-check" aria-hidden="true" style="font-size:17px;color:var(--accent);flex-shrink:0;margin-top:1px;"></i>
        <p class="text-small text-muted" style="line-height:1.5;">Kin only shows your first name and city. No photo, no surname, no tracking. Event chat data is deleted automatically after each event.</p>
      </div>

      <div class="section-label">What others can see</div>
      <div class="card mb-md">
        ${row('Your first name', 'Always visible to community members', 't-name', true)}
        ${row('Your city', 'Shown as city name only, never exact location', 't-city', true)}
        ${row('Which communities you\'re in', 'Visible to other members in those communities', 't-communities')}
        ${row('Events you\'ve attended', 'Others see your count only, not which events', 't-events')}
      </div>

      <div class="section-label">Event chat privacy</div>
      <div class="card mb-md">
        ${row('Auto-delete event chats', 'Messages & addresses deleted 24h after event', 't-autodelete', true)}
        ${row('Address visible only to attendees', 'Non-RSVP members see district only', 't-address', true)}
      </div>

      <div class="section-label">Your data</div>
      <div class="card mb-lg">
        <div class="setting-row">
          <div style="display:flex;align-items:center;gap:9px;">
            <i class="ti ti-download" aria-hidden="true" style="font-size:16px;color:var(--muted);"></i>
            <div>
              <p style="font-size:14px;">Download your data</p>
              <p class="text-tiny text-muted">Name, city, interests, communities</p>
            </div>
          </div>
          <i class="ti ti-chevron-right" aria-hidden="true" style="font-size:15px;color:var(--muted);"></i>
        </div>
        <div class="setting-row" onclick="window.kinNavigate('delete-account')">
          <div style="display:flex;align-items:center;gap:9px;">
            <i class="ti ti-trash" aria-hidden="true" style="font-size:16px;color:var(--red-dark);"></i>
            <div>
              <p style="font-size:14px;color:var(--red-dark);">Delete account</p>
              <p class="text-tiny text-muted">Permanently removes all your data</p>
            </div>
          </div>
          <i class="ti ti-chevron-right" aria-hidden="true" style="font-size:15px;color:var(--muted);"></i>
        </div>
      </div>
    </div>
  </main>`;
}

export function renderNotificationSettings() {
  const row = (label, sub, id, on = true) => `
    <div class="toggle-row">
      <div>
        <p style="font-size:14px;">${label}</p>
        ${sub ? `<p class="text-tiny text-muted mt-sm">${sub}</p>` : ''}
      </div>
      <button class="toggle ${on?'on':'off'}" id="${id}" onclick="window.kinToggle(this)" aria-label="Toggle ${label}">
        <div class="toggle-knob"></div>
      </button>
    </div>`;

  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('profile')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <span class="fw-500" style="font-size:16px;">Notification settings</span>
      </div>
    </nav>
    <div class="screen-body">
      <div class="section-label">Community activity</div>
      <div class="card mb-md">
        ${row('New events in your communities', '', 'tn-new-events', true)}
        ${row('New messages in community chat', '', 'tn-comm-msgs', false)}
        ${row('Someone joins your community', '', 'tn-new-member', false)}
      </div>
      <div class="section-label">Events</div>
      <div class="card mb-md">
        ${row('Private event chat messages', '', 'tn-event-msgs', true)}
        ${row('Event reminder (day before)', '', 'tn-reminder', true)}
        ${row('Event chat deletion reminder', 'Notified when chat is about to be deleted', 'tn-deletion', true)}
      </div>
    </div>
  </main>`;
}

export function renderDeleteAccount() {
  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('privacy')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <span class="fw-500" style="font-size:16px;">Delete account</span>
      </div>
    </nav>
    <div class="screen-body">
      <div class="card-danger mb-lg">
        <div style="display:flex;gap:9px;align-items:flex-start;">
          <i class="ti ti-alert-triangle" aria-hidden="true" style="font-size:17px;color:var(--red-dark);flex-shrink:0;margin-top:1px;"></i>
          <div>
            <p class="fw-500 text-danger text-small">This cannot be undone</p>
            <p class="text-tiny text-muted mt-sm" style="line-height:1.5;">Deleting your account permanently removes your name, city, interests, and community memberships. You will be removed from all communities instantly.</p>
          </div>
        </div>
      </div>
      <div class="card mb-lg">
        <p class="fw-500 text-small mb-md">What gets deleted immediately</p>
        <div style="display:flex;flex-direction:column;gap:7px;">
          ${['Your name and city','Your interests and community memberships','Any active RSVP and event chat access','Your login credentials'].map(item =>
            `<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted);">
              <i class="ti ti-check" aria-hidden="true" style="color:var(--red-dark);font-size:14px;"></i> ${item}
             </div>`).join('')}
        </div>
        <div style="margin-top:10px;padding-top:10px;border-top:0.5px solid var(--border);">
          <p class="text-tiny text-muted">Messages you sent in community chats will remain but show as "deleted member". Private event chat messages are deleted immediately.</p>
        </div>
      </div>
      <div class="field mb-lg">
        <label class="field-label">Type DELETE to confirm</label>
        <input type="text" id="delete-confirm" placeholder="DELETE" />
      </div>
      <button class="btn btn-danger btn-full" style="padding:12px;" onclick="window.kinNavigate('landing')">
        Delete my account permanently
      </button>
    </div>
  </main>`;
}

export function initProfileHandlers() {
  window.kinToggle = (btn) => {
    const isOn = btn.classList.contains('on');
    btn.classList.toggle('on', !isOn);
    btn.classList.toggle('off', isOn);
  };
}
