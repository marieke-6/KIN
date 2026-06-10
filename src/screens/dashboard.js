// ─── Dashboard & Explore Screens ───
import { state, navigate, COMMUNITIES, EVENTS_BY_CITY } from '../utils/state.js';
import { commIcon, eventDateBlock, capacityBar, bottomNav } from '../utils/helpers.js';

export function renderDashboard() {
  const user = state.user || { name: 'Marieke', city: 'Vienna', initials: 'M' };
  const city = user.city || 'Vienna';
  const events = (EVENTS_BY_CITY[city] || []).slice(0, 2);

  const eventCards = events.map(ev => {
    const comm = Object.values(COMMUNITIES).find(c => c.id === ev.community);
    const hasChatNotif = ev.rsvpd && ev.privateChatMessages.length > 0;
    return `
    <div class="card card-clickable mb-md" onclick="window.kinNavigate('event-detail','${ev.id}')" 
         style="display:flex;align-items:center;gap:12px;">
      ${commIcon(comm.icon, comm.color, 'md')}
      <div style="flex:1;min-width:0;">
        <p class="fw-500" style="font-size:14px;">${ev.title}</p>
        <p class="text-muted text-small">${ev.day} ${ev.mon} · ${ev.time} · ${ev.districtOnly}</p>
      </div>
      ${hasChatNotif ? `<span class="new-badge">chat open</span>` : ''}
    </div>`;
  }).join('');

  const communityCards = Object.values(COMMUNITIES).map(c => `
    <div class="card card-clickable mb-md" onclick="window.kinNavigate('community','${c.id}')"
         style="display:flex;align-items:center;gap:12px;padding:11px 14px;">
      ${commIcon(c.icon, c.color, 'sm')}
      <div style="flex:1;">
        <p class="fw-500" style="font-size:14px;">${c.name}</p>
        <p class="text-muted text-small">${c.cities[city]?.members || 0} members</p>
      </div>
      <i class="ti ti-chevron-right" aria-hidden="true" style="font-size:16px;color:var(--muted);"></i>
    </div>`).join('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return `
  <main>
    <nav class="nav">
      <span class="nav-logo">Kin</span>
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="position:relative;cursor:pointer;" onclick="window.kinNavigate('notifications')">
          <i class="ti ti-bell" aria-hidden="true" style="font-size:22px;color:var(--muted);"></i>
          <span class="notif-badge"></span>
        </div>
        <div class="avatar avatar-sm avatar-sage" style="cursor:pointer;" 
             onclick="window.kinNavigate('profile')">${user.initials}</div>
      </div>
    </nav>

    <div class="screen-body">
      <p style="font-size:20px;font-weight:500;margin-bottom:2px;">${greeting}, ${user.name}</p>
      <p class="text-muted text-small mb-lg">${city} · ${Object.keys(COMMUNITIES).length} active communities</p>

      <div class="stat-row">
        <div class="stat-card"><div class="stat-val">3</div><div class="stat-lbl">Communities</div></div>
        <div class="stat-card"><div class="stat-val">5</div><div class="stat-lbl">Events attended</div></div>
        <div class="stat-card"><div class="stat-val">2</div><div class="stat-lbl">Coming up</div></div>
      </div>

      <div class="section-label">Your next events</div>
      ${eventCards || '<p class="text-muted text-small mb-lg">No upcoming events in ' + city + '.</p>'}

      <div class="section-label">Your communities</div>
      ${communityCards}

      <button class="btn btn-full mb-lg" onclick="window.kinNavigate('explore')" 
              style="display:flex;align-items:center;justify-content:center;gap:6px;">
        <i class="ti ti-compass" aria-hidden="true"></i> Explore more communities
      </button>
    </div>

    ${bottomNav('dashboard')}
  </main>`;
}

export function renderExplore() {
  const user = state.user || { city: 'Vienna' };
  const city = user.city || 'Vienna';

  const allComms = [
    ...Object.values(COMMUNITIES),
    { id:'hiking',     name:'Hiking',    icon:'ti-mountain',       color:'sage' },
    { id:'volleyball', name:'Volleyball',icon:'ti-ball-volleyball', color:'lav' },
    { id:'cooking',    name:'Cooking',   icon:'ti-chef-hat',        color:'peach' },
    { id:'book-club',  name:'Book club', icon:'ti-book',            color:'amber' },
  ];

  const joined = new Set(Object.keys(COMMUNITIES));

  const rows = allComms.map(c => {
    const isJoined = joined.has(c.id);
    const members = COMMUNITIES[c.id]?.cities?.[city]?.members || Math.floor(Math.random() * 30 + 8);
    return `
    <div class="card card-clickable mb-md" style="display:flex;align-items:center;gap:12px;padding:11px 14px;">
      ${commIcon(c.icon, c.color, 'sm')}
      <div style="flex:1;">
        <p class="fw-500" style="font-size:14px;">${c.name}</p>
        <p class="text-muted text-small">${members} members in ${city}</p>
      </div>
      ${isJoined
        ? `<span class="pill pill-sage text-tiny"><i class="ti ti-check" aria-hidden="true"></i> Joined</span>`
        : `<button class="btn btn-primary btn-sm">Join</button>`
      }
    </div>`;
  }).join('');

  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('dashboard')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <span style="font-size:16px;font-weight:500;">Explore in ${city}</span>
      </div>
    </nav>
    <div class="screen-body">
      <input type="text" placeholder="Search communities..." style="margin-bottom:var(--space-lg);" />
      <div class="section-label">Popular near you</div>
      ${rows}
    </div>
    ${bottomNav('explore')}
  </main>`;
}

export function renderNotifications() {
  const notifs = [
    { unread: true,  text: 'New event in <strong>Board games</strong> — Wingspan night on 14 Jun', time: '2 hours ago' },
    { unread: true,  text: '<strong>Rudi</strong> posted in the Wingspan night private chat', time: '3 hours ago' },
    { unread: true,  text: '<strong>Thomas</strong> asked about a Sunday run in <strong>Running</strong>', time: 'Yesterday' },
    { unread: false, text: 'Your Catan evening chat was permanently deleted', time: '3 Jun' },
    { unread: false, text: 'Welcome to Kin! You joined Board games, Running and Painting in Vienna', time: '7 Jun' },
  ];

  const rows = notifs.map(n => `
    <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:0.5px solid var(--border);">
      <div class="activity-dot ${n.unread ? 'dot-green' : 'dot-gray'}" style="margin-top:5px;"></div>
      <div style="flex:1;">
        <p style="font-size:14px;color:var(--text);line-height:1.5;">${n.text}</p>
        <p class="text-tiny text-muted mt-sm">${n.time}</p>
      </div>
    </div>`).join('');

  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('dashboard')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <span style="font-size:16px;font-weight:500;">Notifications</span>
      </div>
      <span class="text-accent text-small" style="cursor:pointer;">Mark all read</span>
    </nav>
    <div class="screen-body">${rows}</div>
  </main>`;
}
