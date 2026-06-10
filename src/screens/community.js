// ─── Community Hub Screen ───
import { state, navigate, COMMUNITIES, EVENTS_BY_CITY, MEMBERS_BY_CITY } from '../utils/state.js';
import { commIcon, eventDateBlock, capacityBar, activityStatus, avatar, escapeHtml } from '../utils/helpers.js';
import { supabase } from '../lib/supabase.js';

export function renderCommunity(params = {}) {
  const commId = params.id || 'board-games';

  window.__afterNavigate = () => initCommunityScreen(commId);

  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('dashboard')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <div id="comm-nav-info">
          <p class="fw-500" style="font-size:15px;">Loading…</p>
        </div>
      </div>
      <span class="pill pill-sage text-tiny"><i class="ti ti-check" aria-hidden="true"></i> Joined</span>
    </nav>

    <div id="comm-city-bar" style="padding:10px 16px;background:var(--bg);border-bottom:0.5px solid var(--border);display:none;">
      <p class="text-tiny text-muted mb-sm">Showing results for:</p>
      <div id="comm-city-chips" style="display:flex;gap:7px;flex-wrap:wrap;"></div>
    </div>

    <div class="tab-bar" id="comm-tab-bar">
      <button class="tab${(!state.communityTab || state.communityTab==='chat') ? ' active':''}"
              onclick="window.kinCommTab('chat')">
        <i class="ti ti-message-circle" aria-hidden="true"></i> Chat
      </button>
      <button class="tab${state.communityTab==='events' ? ' active':''}"
              onclick="window.kinCommTab('events')">
        <i class="ti ti-calendar-event" aria-hidden="true"></i> Events
      </button>
      <button class="tab${state.communityTab==='members' ? ' active':''}"
              onclick="window.kinCommTab('members')">
        <i class="ti ti-users" aria-hidden="true"></i> Members
      </button>
    </div>

    <div id="tab-chat" style="display:${(!state.communityTab || state.communityTab==='chat')?'block':'none'}">
      ${renderChatTab(commId)}
    </div>
    <div id="tab-events" style="display:${state.communityTab==='events'?'block':'none'}">
      <div style="padding:14px 16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span class="fw-500">Upcoming events</span>
          <button class="btn btn-primary btn-sm" onclick="window.kinNavigate('create-event',{id:'${commId}'})">
            <i class="ti ti-plus" aria-hidden="true"></i> New event
          </button>
        </div>
        <div id="events-list-${commId}"><p class="text-muted text-small">Loading…</p></div>
      </div>
    </div>
    <div id="tab-members" style="display:${state.communityTab==='members'?'block':'none'}">
      <div id="tab-members-content" style="padding:14px 16px;">
        <p class="text-muted text-small">Loading…</p>
      </div>
    </div>
  </main>`;
}

async function initCommunityScreen(commId) {
  const user = state.user || { city: 'Vienna' };

  // Load community from DB (handles both seeded and user-created)
  const { data: comm } = await supabase
    .from('communities')
    .select('*')
    .eq('id', commId)
    .single();

  if (!comm) return;

  // Update nav
  const navInfo = document.getElementById('comm-nav-info');
  if (navInfo) {
    navInfo.innerHTML = `
      ${commIcon(comm.icon, comm.color, 'sm')}
      <div>
        <p class="fw-500" style="font-size:15px;">${escapeHtml(comm.name)}</p>
        <p class="text-tiny text-muted" id="comm-member-count">…</p>
      </div>`;
  }

  // For seeded communities, show city chips
  const staticComm = COMMUNITIES[commId];
  const selectedCity = state.communityCity || user.city || comm.city || 'Vienna';

  if (staticComm) {
    const cityBar = document.getElementById('comm-city-bar');
    const cityChipsEl = document.getElementById('comm-city-chips');
    if (cityBar) cityBar.style.display = 'block';
    if (cityChipsEl) {
      cityChipsEl.innerHTML = Object.keys(staticComm.cities).map(c => `
        <span class="city-chip${c === selectedCity ? ' active' : ''}"
              onclick="window.kinSetCommunityCity('${commId}','${c}')">
          <i class="ti ti-map-pin" aria-hidden="true" style="font-size:13px;"></i> ${c}
        </span>`).join('');
    }
  }

  // Load member count
  const { count } = await supabase
    .from('community_members')
    .select('*', { count: 'exact', head: true })
    .eq('community_id', commId);

  const countEl = document.getElementById('comm-member-count');
  if (countEl) countEl.textContent = `${count ?? 0} members`;

  // Load chat messages
  await loadCommunityMessages(commId, selectedCity);

  // Load events
  await loadCommunityEvents(commId, selectedCity);

  // Load members tab
  await loadCommunityMembers(commId);
}
}

function renderChatTab(commId) {
  return `
  <div style="padding:14px 16px;min-height:120px;" id="chat-messages-${commId}">
    <div style="display:flex;align-items:center;justify-content:center;padding:20px 0;">
      <span class="text-muted text-small">Loading messages…</span>
    </div>
  </div>
  <div class="chat-input-row">
    <input type="text" id="comm-chat-input" placeholder="Say something…"
           onkeydown="if(event.key==='Enter')window.kinSendCommMsg('${commId}')" />
    <button class="send-btn" onclick="window.kinSendCommMsg('${commId}')" aria-label="Send">
      <i class="ti ti-send" aria-hidden="true"></i>
    </button>
  </div>`;
}

async function loadCommunityMembers(commId) {
  const el = document.getElementById('tab-members-content');
  if (!el) return;

  const { data: rows } = await supabase
    .from('community_members')
    .select('user_id, joined_at, profiles(name, avatar_color)')
    .eq('community_id', commId)
    .order('joined_at', { ascending: true })
    .limit(100);

  if (!rows?.length) {
    el.innerHTML = `<p class="text-muted text-small">No members yet.</p>`;
    return;
  }

  el.innerHTML = rows.map(r => {
    const name  = r.profiles?.name || 'Member';
    const color = r.profiles?.avatar_color || 'sage';
    const init  = name[0].toUpperCase();
    const isYou = r.user_id === state.user?.id;
    const joined = new Date(r.joined_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
    return `
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:0.5px solid var(--border);">
      ${avatar(init, color, 'sm')}
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="fw-500" style="font-size:14px;">${escapeHtml(name)}</span>
          ${isYou ? `<span class="new-badge">you</span>` : ''}
        </div>
        <span class="text-tiny text-muted">Joined ${joined}</span>
      </div>
    </div>`;
  }).join('');
}

async function loadCommunityMessages(commId, city) {
  const container = document.getElementById(`chat-messages-${commId}`);
  if (!container) return;

  const { data: rows, error } = await supabase
    .from('community_messages')
    .select('id, text, created_at, user_id, profiles(name, avatar_color)')
    .eq('community_id', commId)
    .eq('city', city)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    container.innerHTML = `<p class="text-muted text-small" style="padding:12px;">Could not load messages.</p>`;
    return;
  }

  const currentUserId = state.user?.id;

  const msgHtml = (rows || []).map(m => {
    const isOwn = m.user_id === currentUserId;
    const name  = m.profiles?.name || 'Member';
    const color = m.profiles?.avatar_color || 'sage';
    const init  = name[0].toUpperCase();

    return isOwn
      ? `<div class="msg msg-out">
          <div><div class="msg-bubble msg-bubble-out">${escapeHtml(m.text)}</div></div>
          <div class="avatar avatar-sm avatar-${state.user?.avatarColor || 'sage'}">${state.user?.initials || 'M'}</div>
         </div>`
      : `<div class="msg">
          ${avatar(init, color, 'sm')}
          <div>
            <div class="msg-name">${escapeHtml(name)}</div>
            <div class="msg-bubble msg-bubble-in">${escapeHtml(m.text)}</div>
          </div>
         </div>`;
  }).join('');

  container.innerHTML = msgHtml || `<p class="text-muted text-small" style="padding:12px 0;">No messages yet. Say hello!</p>`;
}

async function loadCommunityEvents(commId, city) {
  const container = document.getElementById(`events-list-${commId}`);
  if (!container) return;

  const today = new Date().toISOString().split('T')[0];
  const { data: events, error } = await supabase
    .from('events')
    .select(`id, title, event_date, event_time, district, max_attendees,
             rsvps(count)`)
    .eq('community_id', commId)
    .eq('city', city)
    .gte('event_date', today)
    .order('event_date', { ascending: true });

  if (error || !events?.length) {
    container.innerHTML = `<p class="text-muted text-small">No upcoming events in ${city}.</p>`;
    return;
  }

  // Check which events the current user has RSVP'd to
  let rsvpdSet = new Set();
  if (state.user) {
    const { data: myRsvps } = await supabase
      .from('rsvps')
      .select('event_id')
      .eq('user_id', state.user.id)
      .in('event_id', events.map(e => e.id));
    (myRsvps || []).forEach(r => rsvpdSet.add(r.event_id));
  }

  container.innerHTML = events.map(ev => {
    const going   = ev.rsvps?.[0]?.count ?? 0;
    const max     = ev.max_attendees;
    const rsvpd   = rsvpdSet.has(ev.id);
    const full    = going >= max;
    const d       = new Date(ev.event_date + 'T00:00:00');
    const day     = d.getDate();
    const mon     = d.toLocaleString('en', { month: 'short' }).toUpperCase();
    const time    = ev.event_time?.slice(0, 5) || '';

    return `
    <div class="event-card" style="cursor:pointer;" onclick="window.kinNavigate('event-detail',{id:'${ev.id}'})">
      ${eventDateBlock(day, mon, 'event-date-amber')}
      <div style="flex:1;min-width:0;">
        <p class="fw-500" style="font-size:14px;margin-bottom:2px;">${escapeHtml(ev.title)}</p>
        <p class="text-muted text-small">${time} · ${escapeHtml(ev.district)}</p>
        ${capacityBar(going, max)}
        <div style="margin-top:8px;">
          ${full
            ? `<span style="font-size:12px;color:var(--red-dark);font-weight:500;"><i class="ti ti-lock" aria-hidden="true"></i> Full</span>`
            : rsvpd
              ? `<span class="pill pill-sage text-tiny"><i class="ti ti-check" aria-hidden="true"></i> Going · <i class="ti ti-lock" aria-hidden="true"></i> Private chat open</span>`
              : `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();window.kinNavigate('event-detail',{id:'${ev.id}'})">RSVP</button>`
          }
        </div>
      </div>
    </div>`;
  }).join('');
}


export function renderMemberRows(members) {
  return members.map(m => `
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:0.5px solid var(--border);">
      ${avatar(m.init, m.color, 'sm')}
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="fw-500" style="font-size:14px;">${m.name}</span>
          ${m.you ? `<span class="new-badge">you</span>` : ''}
          ${m.suspended ? `<span class="pill pill-red text-tiny">suspended</span>` : ''}
        </div>
        <span class="text-tiny text-muted">Joined ${m.joined}</span>
      </div>
      <div style="text-align:right;">
        ${activityStatus(m.status, m.last)}
      </div>
    </div>`).join('');
}

export function initCommunityHandlers() {
  window.kinSetCommunityCity = (commId, city) => {
    state.communityCity = city;
    state.communityTab = state.communityTab || 'chat';
    navigate('community', { id: commId });
  };

  window.kinCommTab = (tab) => {
    state.communityTab = tab;
    ['chat', 'events', 'members'].forEach(t => {
      const el = document.getElementById(`tab-${t}`);
      if (el) el.style.display = t === tab ? 'block' : 'none';
    });
    document.querySelectorAll('.tab').forEach((btn, i) => {
      const tabs = ['chat', 'events', 'members'];
      btn.classList.toggle('active', tabs[i] === tab);
    });
  };

  window.kinSendCommMsg = async (commId) => {
    const city = state.communityCity || state.user?.city || 'Vienna';
    const input = document.getElementById('comm-chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text || !state.user) return;

    input.value = '';

    // Optimistically append to DOM
    const container = document.getElementById(`chat-messages-${commId}`);
    if (container) {
      const div = document.createElement('div');
      div.className = 'msg msg-out';
      div.innerHTML = `<div><div class="msg-bubble msg-bubble-out">${escapeHtml(text)}</div></div>
                       <div class="avatar avatar-sm avatar-${state.user.avatarColor || 'sage'}">${state.user.initials || 'M'}</div>`;
      container.appendChild(div);
      div.scrollIntoView({ behavior: 'smooth' });
    }

    await supabase.from('community_messages').insert({
      community_id: commId,
      city:         city || state.communityCity || state.user.city || 'Vienna',
      user_id:      state.user.id,
      text,
    });
  };

  window.kinFilterMembers = (city) => {
    const filter = document.getElementById('activity-filter')?.value || 'all';
    const { MEMBERS_BY_CITY } = window._kinData || {};
    const allMembers = MEMBERS_BY_CITY?.[city] || [];
    const filtered = filter === 'active'
      ? allMembers.filter(m => m.status === 'green' || m.status === 'amber')
      : filter === 'inactive'
        ? allMembers.filter(m => m.status === 'red' || m.status === 'gray')
        : allMembers;
    const list = document.getElementById('members-list');
    if (list) list.innerHTML = renderMemberRows(filtered);
  };
}
