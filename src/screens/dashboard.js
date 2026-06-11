// ─── Dashboard & Explore Screens ───
import { state, navigate, COMMUNITIES } from '../utils/state.js';
import { commIcon, bottomNav, escapeHtml } from '../utils/helpers.js';
import { supabase } from '../lib/supabase.js';

export function renderDashboard() {
  const user = state.user || { name: 'Friend', city: 'Vienna', initials: 'M', avatarColor: 'sage' };
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  window.__afterNavigate = () => loadDashboardData();

  return `
  <main>
    <nav class="nav">
      <span class="nav-logo">Kin</span>
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="position:relative;cursor:pointer;" onclick="window.kinNavigate('notifications')">
          <i class="ti ti-bell" aria-hidden="true" style="font-size:22px;color:var(--muted);"></i>
        </div>
        <div class="avatar avatar-sm avatar-${user.avatarColor || 'sage'}" style="cursor:pointer;"
             onclick="window.kinNavigate('profile')">${user.initials}</div>
      </div>
    </nav>

    <div class="screen-body">
      <p style="font-size:20px;font-weight:500;margin-bottom:2px;">${greeting}, ${escapeHtml(user.name)}</p>
      <p class="text-muted text-small mb-lg" id="dash-subtitle">${escapeHtml(user.city || 'your city')}</p>

      <div class="section-label">Your next events</div>
      <div id="dash-events">
        <p class="text-muted text-small mb-lg">Loading…</p>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <span class="section-label" style="margin-bottom:0;">Your communities</span>
      </div>
      <div id="dash-communities">
        <p class="text-muted text-small mb-lg">Loading…</p>
      </div>

      <button class="btn btn-full mb-lg" onclick="window.kinNavigate('explore')"
              style="display:flex;align-items:center;justify-content:center;gap:6px;">
        <i class="ti ti-compass" aria-hidden="true"></i> Explore &amp; create communities
      </button>
    </div>

    ${bottomNav('dashboard')}
  </main>`;
}

async function loadDashboardData() {
  if (!state.user) { window.kinNavigate('landing'); return; }
  const city = state.user.city || 'Vienna';
  const today = new Date().toISOString().split('T')[0];

  // Load upcoming events the user has RSVP'd to
  const { data: rsvpRows } = await supabase
    .from('rsvps')
    .select(`event_id, events(id, title, event_date, event_time, district, community_id, icon, icon_color, cover_url, chat_expires_at)`)
    .eq('user_id', state.user.id)
    .limit(10);

  const now = new Date();
  const eventsEl = document.getElementById('dash-events');
  if (eventsEl) {
    const upcomingEvents = (rsvpRows || [])
      .map(r => r.events)
      .filter(e => {
        if (!e) return false;
        if (e.event_date >= today) return true;
        // Past but chat still live (within 24 h deletion window)
        return e.chat_expires_at && new Date(e.chat_expires_at) > now;
      })
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, 3);

    if (!upcomingEvents.length) {
      eventsEl.innerHTML = `<p class="text-muted text-small mb-lg">No upcoming events. Browse communities to find one!</p>`;
    } else {
      eventsEl.innerHTML = upcomingEvents.map(ev => {
        const d   = new Date(ev.event_date + 'T00:00:00');
        const day = d.getDate();
        const mon = d.toLocaleString('en', { month: 'short' }).toUpperCase();
        const comm = COMMUNITIES[ev.community_id];
        const evBg = { sage:'var(--sage)', lav:'var(--lav)', peach:'var(--peach)', amber:'var(--amber)' };
        const iconEl = ev.cover_url
          ? `<div class="comm-icon comm-icon-md" style="overflow:hidden;"><img src="${escapeHtml(ev.cover_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-md);" /></div>`
          : ev.icon
            ? `<div class="comm-icon comm-icon-md" style="background:${evBg[ev.icon_color||'sage']||'var(--sage)'};display:flex;align-items:center;justify-content:center;font-size:22px;">${ev.icon}</div>`
            : comm ? commIcon(comm.icon, comm.color, 'md') : `<div class="comm-icon comm-icon-md" style="background:var(--sage);"></div>`;
        return `
        <div class="card card-clickable mb-md" onclick="window.kinNavigate('event-detail',{id:'${ev.id}'})"
             style="display:flex;align-items:center;gap:12px;">
          ${iconEl}
          <div style="flex:1;min-width:0;">
            <p class="fw-500" style="font-size:14px;">${escapeHtml(ev.title)}</p>
            <p class="text-muted text-small">${day} ${mon} · ${(ev.event_time || '').slice(0,5)} · ${escapeHtml(ev.district)}</p>
          </div>
          ${ev.event_date < today
            ? `<span style="font-size:11px;font-weight:500;color:var(--red-dark);background:var(--red-bg);padding:3px 8px;border-radius:20px;white-space:nowrap;">Past event</span>`
            : `<span class="new-badge">chat open</span>`
          }
        </div>`;
      }).join('');
    }
  }

  // Load communities the user has joined
  const { data: memberRows } = await supabase
    .from('community_members')
    .select(`community_id, communities(id, name, icon, color, city)`)
    .eq('user_id', state.user.id)
    .limit(20);

  const memberComms = (memberRows || []).map(r => r.communities).filter(Boolean);
  const allJoined = [
    ...memberComms,
  ];

  const commEl = document.getElementById('dash-communities');
  if (commEl) {
    if (!allJoined.length) {
      commEl.innerHTML = `<p class="text-muted text-small mb-lg">You haven't joined any communities yet.</p>`;
    } else {
      commEl.innerHTML = allJoined.map(c => `
        <div class="card card-clickable mb-md" onclick="window.kinNavigate('community',{id:'${c.id}'})"
             style="display:flex;align-items:center;gap:12px;padding:11px 14px;">
          ${commIcon(c.icon, c.color, 'sm')}
          <div style="flex:1;">
            <p class="fw-500" style="font-size:14px;">${escapeHtml(c.name)}</p>
            <p class="text-muted text-small">${escapeHtml(c.city || city)}</p>
          </div>
          <i class="ti ti-chevron-right" aria-hidden="true" style="font-size:16px;color:var(--muted);"></i>
        </div>`).join('');
    }
  }

  const subtitleEl = document.getElementById('dash-subtitle');
  if (subtitleEl) subtitleEl.textContent = `${city} · ${allJoined.length} communities joined`;
}

export function renderExplore() {
  window.__afterNavigate = () => loadExploreCommunities();

  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('dashboard')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <span style="font-size:16px;font-weight:500;">Explore communities</span>
      </div>
    </nav>
    <div class="screen-body">
      <button class="btn btn-primary btn-full mb-lg"
              onclick="window.kinNavigate('create-community')"
              style="display:flex;align-items:center;justify-content:center;gap:8px;">
        <i class="ti ti-plus" aria-hidden="true"></i> Start a new community
      </button>

      <input type="text" id="explore-search" placeholder="Search communities…"
             oninput="window.kinSearchCommunities()"
             style="margin-bottom:var(--space-lg);" />

      <div id="explore-suggested-wrap" style="display:none;">
        <div class="section-label">Suggested for you</div>
        <div id="explore-suggested"></div>
      </div>

      <div class="section-label">Communities near you</div>
      <div id="explore-list">
        <p class="text-muted text-small">Loading…</p>
      </div>
    </div>
    ${bottomNav('explore')}
  </main>`;
}

async function loadExploreCommunities(filter = '') {
  const user = state.user || { city: 'Vienna' };
  const city = user.city || 'Vienna';

  let query = supabase
    .from('communities')
    .select(`id, name, icon, color, city, description, is_seeded, community_members(count)`)
    .or(`city.eq.${city},is_seeded.eq.true`)
    .order('is_seeded', { ascending: false })
    .limit(50);

  if (filter) query = query.ilike('name', `%${filter}%`);

  const { data: comms } = await query;

  let joinedIds = new Set(Object.keys(COMMUNITIES));
  if (state.user) {
    const { data: joined } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', state.user.id);
    (joined || []).forEach(r => joinedIds.add(r.community_id));
  }

  const el = document.getElementById('explore-list');
  if (!el) return;

  if (!comms?.length) {
    el.innerHTML = `<p class="text-muted text-small">No communities found.</p>`;
    return;
  }

  const renderCommCard = (c) => {
    const isJoined = joinedIds.has(c.id);
    const members  = c.community_members?.[0]?.count ?? 0;
    const cityLabel = c.is_seeded ? city : (c.city || city);
    return `
    <div class="card card-clickable mb-md" style="display:flex;align-items:center;gap:12px;padding:11px 14px;"
         onclick="window.kinNavigate('community',{id:'${c.id}'})">
      ${commIcon(c.icon, c.color, 'sm')}
      <div style="flex:1;min-width:0;">
        <p class="fw-500" style="font-size:14px;">${escapeHtml(c.name)}</p>
        <p class="text-muted text-small">${members} members · ${escapeHtml(cityLabel)}</p>
        ${c.description ? `<p class="text-tiny text-muted" style="margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(c.description)}</p>` : ''}
      </div>
      ${isJoined
        ? `<span class="pill pill-sage text-tiny"><i class="ti ti-check" aria-hidden="true"></i> Joined</span>`
        : `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();window.kinJoinCommunity('${c.id}',this)">Join</button>`
      }
    </div>`;
  };

  // Interest-based suggestions
  const interests = (state.user?.interests || []).map(i => i.toLowerCase());
  if (interests.length > 0 && !filter) {
    const suggested = comms.filter(c => {
      if (joinedIds.has(c.id)) return false;
      const haystack = `${c.name} ${c.description || ''}`.toLowerCase();
      return interests.some(i => haystack.includes(i));
    });
    const wrap = document.getElementById('explore-suggested-wrap');
    const sugEl = document.getElementById('explore-suggested');
    if (wrap && sugEl && suggested.length > 0) {
      wrap.style.display = '';
      sugEl.innerHTML = suggested.map(renderCommCard).join('');
    }
  }

  el.innerHTML = comms.map(renderCommCard).join('');
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

export function initDashboardHandlers() {
  window.kinJoinCommunity = async (commId, btn) => {
    if (!state.user) { navigate('login'); return; }
    if (btn) { btn.disabled = true; btn.textContent = 'Joining…'; }
    await supabase.from('community_members').insert({
      community_id: commId,
      user_id: state.user.id,
    });
    navigate('community', { id: commId });
  };

  window.kinSearchCommunities = () => {
    const filter = document.getElementById('explore-search')?.value.trim() || '';
    loadExploreCommunities(filter);
  };
}
