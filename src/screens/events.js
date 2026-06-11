// ─── Event Detail & Private Chat Screen ─── v2
import { state, navigate } from '../utils/state.js';
import { avatar, escapeHtml, capacityBar, eventDateBlock, businessBadge } from '../utils/helpers.js';
import { supabase } from '../lib/supabase.js';

const EVENT_ICONS = ['🎲','🏃','🎨','☕','🎵','🍕','🌿','📚','🎯','🎭','🏊','🌍'];
const EVENT_COLORS = [
  { name: 'sage',  bg: 'var(--sage)'  },
  { name: 'lav',   bg: 'var(--lav)'   },
  { name: 'peach', bg: 'var(--peach)' },
  { name: 'amber', bg: 'var(--amber)' },
];
const EV_BG = { sage:'var(--sage)', lav:'var(--lav)', peach:'var(--peach)', amber:'var(--amber)' };

function evIconHtml(ev, size = 'md') {
  const dim = size === 'sm' ? 36 : 44;
  const fs  = size === 'sm' ? 18 : 22;
  if (ev.cover_url) {
    return `<div style="width:${dim}px;height:${dim}px;border-radius:10px;overflow:hidden;flex-shrink:0;">
      <img src="${escapeHtml(ev.cover_url)}" style="width:100%;height:100%;object-fit:cover;" /></div>`;
  }
  if (ev.icon) {
    const bg = EV_BG[ev.icon_color || 'sage'] || 'var(--sage)';
    return `<div style="width:${dim}px;height:${dim}px;border-radius:10px;background:${bg};display:flex;align-items:center;justify-content:center;font-size:${fs}px;flex-shrink:0;">${ev.icon}</div>`;
  }
  return '';
}

// ── Fetch a single event from Supabase ──
async function fetchEvent(id) {
  const { data, error } = await supabase
    .from('events')
    .select(`*, rsvps(count), event_waitlist(count), profiles!events_created_by_fkey(name, is_business, business_type)`)
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

// ── Check if current user has RSVP'd ──
async function userHasRsvp(eventId) {
  if (!state.user) return false;
  const { data } = await supabase
    .from('rsvps')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', state.user.id)
    .maybeSingle();
  return !!data;
}

// ── Check if current user is on the waitlist ──
async function userOnWaitlist(eventId) {
  if (!state.user) return false;
  const { data } = await supabase
    .from('event_waitlist')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', state.user.id)
    .maybeSingle();
  return !!data;
}

export function renderEventDetail(params = {}) {
  const evId = typeof params === 'string' ? params : params.id;

  // Render a loading shell; async init fills it in
  window.__afterNavigate = () => initEventDetail(evId);

  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('dashboard')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <p class="fw-500" style="font-size:14px;">Event</p>
      </div>
    </nav>
    <div id="event-detail-body" style="padding:20px 16px;">
      <p class="text-muted text-small">Loading…</p>
    </div>
  </main>`;
}

async function initEventDetail(evId) {
  const body = document.getElementById('event-detail-body');
  if (!body) return;

  const [ev, rsvpd, onWaitlist] = await Promise.all([fetchEvent(evId), userHasRsvp(evId), userOnWaitlist(evId)]);
  if (!ev) { body.innerHTML = '<p class="text-muted">Event not found.</p>'; return; }

  const going = ev.rsvps?.[0]?.count ?? 0;
  const isPast = new Date(ev.event_date) < new Date(new Date().toDateString());
  const chatExpired = ev.chat_expires_at && new Date(ev.chat_expires_at) < new Date();

  if (isPast || chatExpired) {
    body.innerHTML = renderPastEventBody(ev);
    return;
  }

  // Cache event data for calendar export
  window.__eventCache = window.__eventCache || {};
  window.__eventCache[ev.id] = ev;

  if (rsvpd) {
    body.innerHTML = await renderPrivateChatBody(ev, going, false);
    const channel = subscribeToChat(ev.id);
    window.__chatCleanup = () => { channel.unsubscribe(); window.__chatCleanup = null; };
    attachChatHandler(ev.id);
  } else {
    body.innerHTML = renderLockedEventBody(ev, going, onWaitlist);
  }
}

// ── Locked view (not yet RSVP'd) ──
function renderLockedEventBody(ev, going, onWaitlist = false) {
  const waitlistCount = parseInt(ev.event_waitlist?.[0]?.count ?? 0, 10);
  const d   = new Date(ev.event_date + 'T00:00:00');
  const day = d.getDate();
  const mon = d.toLocaleString('en', { month: 'short' }).toUpperCase();

  return `
  <div class="banner banner-locked mb-lg">
    <i class="ti ti-lock" aria-hidden="true" style="font-size:17px;color:var(--red-dark);flex-shrink:0;margin-top:1px;"></i>
    <div>
      <p class="fw-500 text-danger text-small">This chat is for attendees only</p>
      <p class="text-tiny text-muted mt-sm">RSVP to get access to the private group chat, the exact meeting address, and details shared by the organiser.</p>
    </div>
  </div>

  <div class="card mb-lg">
    ${evIconHtml(ev) ? `<div style="margin-bottom:10px;">${evIconHtml(ev)}</div>` : ''}
    <p class="fw-500 mb-md" style="font-size:15px;">${escapeHtml(ev.title)}</p>
    <div style="display:flex;flex-direction:column;gap:8px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <i class="ti ti-calendar" aria-hidden="true" style="font-size:15px;color:var(--muted);"></i>
        <span style="font-size:13px;">${day} ${mon} · ${(ev.event_time || '').slice(0,5)}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <i class="ti ti-map-pin" aria-hidden="true" style="font-size:15px;color:var(--muted);"></i>
        <div>
          <span style="font-size:13px;">${escapeHtml(ev.district)}</span>
          <span class="pill pill-gray text-tiny" style="margin-left:6px;">Exact address after RSVP</span>
          <br><a href="https://maps.google.com/?q=${encodeURIComponent((ev.district || '') + (ev.city ? ', ' + ev.city : ''))}" target="_blank" rel="noopener" style="font-size:12px;color:var(--accent);display:inline-flex;align-items:center;gap:3px;margin-top:3px;"><i class="ti ti-map" style="font-size:11px;"></i> View area on map</a>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <i class="ti ti-users" aria-hidden="true" style="font-size:15px;color:var(--muted);"></i>
        <span style="font-size:13px;">${going} of ${ev.max_attendees} spots taken</span>
      </div>
      ${ev.profiles ? `
      <div style="display:flex;align-items:center;gap:8px;">
        <i class="ti ti-user" aria-hidden="true" style="font-size:15px;color:var(--muted);"></i>
        <span style="font-size:13px;">Hosted by ${escapeHtml(ev.profiles.name || 'organiser')}</span>
        ${businessBadge(ev.profiles.is_business, ev.profiles.business_type)}
      </div>` : ''}
    </div>
    <div style="margin-top:14px;padding-top:12px;border-top:0.5px solid var(--border);">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:10px;">
        <i class="ti ti-shield-check" aria-hidden="true" style="font-size:14px;color:var(--accent);"></i>
        <span class="text-tiny text-muted">Chat and address deleted 24h after the event</span>
      </div>
      ${going >= ev.max_attendees
        ? onWaitlist
          ? `<button class="btn btn-full" style="display:flex;align-items:center;justify-content:center;gap:7px;" onclick="window.kinLeaveWaitlist('${ev.id}')">
               <i class="ti ti-clock" aria-hidden="true" style="font-size:15px;color:var(--muted);"></i>
               On waitlist${waitlistCount > 1 ? ` · ${waitlistCount} waiting` : ''} · Leave
             </button>`
          : `<button class="btn btn-primary btn-full" style="display:flex;align-items:center;justify-content:center;gap:7px;" onclick="window.kinJoinWaitlist('${ev.id}')">
               <i class="ti ti-clock" aria-hidden="true" style="font-size:14px;"></i>
               Join waitlist${waitlistCount ? ` · ${waitlistCount} waiting` : ''}
             </button>`
        : `<button class="btn btn-primary btn-full" onclick="window.kinRsvp('${ev.id}')">RSVP — join the group chat</button>`
      }
    </div>
  </div>

  <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px 0;">
    <i class="ti ti-message-circle-off" aria-hidden="true" style="font-size:36px;color:var(--border);"></i>
    <p class="text-muted text-small" style="text-align:center;">Messages are only visible to people who are going.</p>
  </div>`;
}

// ── Private chat view (RSVP'd) ──
async function renderPrivateChatBody(ev, going, justRsvpd) {
  const { data: msgRows } = await supabase
    .from('event_messages')
    .select('id, text, created_at, user_id, profiles(name, avatar_color)')
    .eq('event_id', ev.id)
    .order('created_at', { ascending: true })
    .limit(200);

  const currentUserId = state.user?.id;

  const msgHtml = (msgRows || []).map(m => {
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

  return `
  ${justRsvpd ? `
  <div class="banner banner-success mb-md">
    <i class="ti ti-shield-check" aria-hidden="true" style="font-size:17px;color:var(--green-dark);flex-shrink:0;margin-top:1px;"></i>
    <div>
      <p class="fw-500 text-small" style="color:var(--green-dark);">You're in! Private event chat unlocked.</p>
      <p class="text-tiny text-muted mt-sm">All messages and the full address will be permanently deleted 24 hours after the event ends.</p>
    </div>
  </div>` : `
  <div class="banner banner-privacy mb-md">
    <i class="ti ti-shield-check" aria-hidden="true" style="font-size:17px;color:var(--accent);flex-shrink:0;margin-top:1px;"></i>
    <div>
      <p class="fw-500 text-small">Private event chat</p>
      <p class="text-tiny text-muted mt-sm">Only the ${going} people going can see this. Messages and address deleted 24h after the event.</p>
    </div>
  </div>`}

  <div style="background:var(--bg);border-radius:var(--radius-md);padding:10px 13px;margin-bottom:8px;">
    <div style="display:flex;align-items:flex-start;gap:8px;">
      <i class="ti ti-map-pin" aria-hidden="true" style="font-size:16px;color:var(--accent);flex-shrink:0;margin-top:1px;"></i>
      <div>
        <p class="fw-500 text-small">Full address (attendees only)</p>
        <p style="font-size:13px;margin-top:3px;">${escapeHtml(ev.full_address)}</p>
        ${ev.address_note ? `<p class="text-tiny text-muted mt-sm">${escapeHtml(ev.address_note)}</p>` : ''}
      </div>
    </div>
    ${ev.full_address ? `
    <div style="margin-top:10px;border-radius:8px;overflow:hidden;line-height:0;">
      <iframe
        src="https://maps.google.com/maps?q=${encodeURIComponent(ev.full_address)}&output=embed&z=15"
        width="100%" height="170" frameborder="0" scrolling="no" loading="lazy"
        style="border:none;display:block;"
      ></iframe>
    </div>` : ''}
  </div>

  <div style="display:flex;gap:8px;margin-bottom:var(--space-md);">
    <button class="btn btn-full" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;"
            onclick="window.kinAddToCalendar('${ev.id}')">
      <i class="ti ti-calendar-plus" aria-hidden="true" style="font-size:15px;"></i> Apple Calendar
    </button>
    <button class="btn btn-full" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;"
            onclick="window.kinAddToGoogleCalendar('${ev.id}')">
      <i class="ti ti-brand-google" aria-hidden="true" style="font-size:15px;"></i> Google Calendar
    </button>
  </div>

  <div id="event-chat-messages-${ev.id}" style="margin-bottom:70px;">
    ${msgHtml || '<p class="text-muted text-small">No messages yet. Be the first to say something!</p>'}
  </div>

  <div class="chat-input-row">
    <input type="text" id="event-chat-input" placeholder="Message attendees…"
           onkeydown="if(event.key==='Enter')window.kinSendEventMsg('${ev.id}')" />
    <button class="send-btn" onclick="window.kinSendEventMsg('${ev.id}')" aria-label="Send">
      <i class="ti ti-send" aria-hidden="true"></i>
    </button>
  </div>`;
}

function attachChatHandler(evId) {
  // Handler is set globally in initEventHandlers; nothing extra needed here
}

// ── Subscribe to live incoming messages ──
function subscribeToChat(evId) {
  const channel = supabase
    .channel(`event-chat-${evId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'event_messages',
      filter: `event_id=eq.${evId}`,
    }, async (payload) => {
      const msg = payload.new;
      if (msg.user_id === state.user?.id) return; // already shown optimistically

      const container = document.getElementById(`event-chat-messages-${evId}`);
      if (!container) { channel.unsubscribe(); return; }

      // Remove "no messages" placeholder if present
      const placeholder = container.querySelector('p.text-muted');
      if (placeholder) placeholder.remove();

      // Fetch sender name/colour
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_color')
        .eq('id', msg.user_id)
        .maybeSingle();

      const name  = profile?.name  || 'Member';
      const color = profile?.avatar_color || 'sage';
      const init  = name[0].toUpperCase();

      const div = document.createElement('div');
      div.className = 'msg';
      div.innerHTML = `${avatar(init, color, 'sm')}
        <div>
          <div class="msg-name">${escapeHtml(name)}</div>
          <div class="msg-bubble msg-bubble-in">${escapeHtml(msg.text)}</div>
        </div>`;
      container.appendChild(div);
      div.scrollIntoView({ behavior: 'smooth' });
    })
    .subscribe();

  return channel;
}

// ── Past event (chat closed / expired) ──
function renderPastEventBody(ev) {
  const d   = new Date(ev.event_date + 'T00:00:00');
  const day = d.getDate();
  const mon = d.toLocaleString('en', { month: 'short' }).toUpperCase();

  return `
  <div class="banner" style="background:var(--bg);border:0.5px solid var(--border);">
    <i class="ti ti-trash" aria-hidden="true" style="font-size:17px;color:var(--red-dark);flex-shrink:0;margin-top:1px;"></i>
    <div>
      <p class="fw-500 text-small">This chat has been permanently closed</p>
      <p class="text-tiny text-muted mt-sm">All messages, the shared address, and attendee details were automatically deleted 24 hours after the event ended.</p>
    </div>
  </div>
  <div class="card mt-md">
    <p class="fw-500 mb-md">${escapeHtml(ev.title)} — summary</p>
    <div style="display:flex;flex-direction:column;gap:7px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <i class="ti ti-calendar" aria-hidden="true" style="font-size:15px;color:var(--muted);"></i>
        <span class="text-muted" style="font-size:13px;">${day} ${mon} · ${(ev.event_time || '').slice(0,5)}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <i class="ti ti-map-pin" aria-hidden="true" style="font-size:15px;color:var(--muted);"></i>
        <span class="text-muted" style="font-size:13px;">${escapeHtml(ev.district)} · Address deleted</span>
      </div>
    </div>
    <div style="margin-top:12px;padding-top:12px;border-top:0.5px solid var(--border);">
      <p class="text-tiny text-muted" style="display:flex;align-items:center;gap:6px;">
        <i class="ti ti-shield-check" aria-hidden="true" style="font-size:14px;color:var(--accent);"></i>
        Data deleted automatically 24h after the event ended
      </p>
    </div>
  </div>`;
}

export function renderPastEvent(params = {}) {
  const evId = typeof params === 'string' ? params : params.id;
  window.__afterNavigate = async () => {
    const ev = await fetchEvent(evId);
    const body = document.getElementById('past-event-body');
    if (body && ev) body.innerHTML = renderPastEventBody(ev);
  };
  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('dashboard')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <div style="width:28px;height:28px;border-radius:7px;background:var(--red-bg);display:flex;align-items:center;justify-content:center;">
          <i class="ti ti-trash" aria-hidden="true" style="font-size:14px;color:var(--red-dark);"></i>
        </div>
        <p class="fw-500 text-muted" style="font-size:14px;">Past event — chat closed</p>
      </div>
    </nav>
    <div id="past-event-body" class="screen-body">
      <p class="text-muted text-small">Loading…</p>
    </div>
  </main>`;
}

export function renderCreateEvent(params = {}) {
  const commId = typeof params === 'string' ? params : (params.id || 'board-games');
  console.log('[renderCreateEvent] commId:', commId, 'user logged in:', !!state.user);
  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('community',{id:'${commId}'})" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <span class="fw-500" style="font-size:16px;">New event</span>
      </div>
    </nav>
    <div class="screen-body">
      <div id="create-event-error" class="card-danger mb-lg" style="display:none;">
        <p id="create-event-error-msg" style="font-size:13px;color:var(--red-dark);"></p>
      </div>

      <div class="field">
        <label class="field-label">Event icon</label>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:8px;">
          <div id="ev-icon-preview" style="width:56px;height:56px;border-radius:12px;background:var(--sage);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;overflow:hidden;">🎲</div>
          <div style="flex:1;">
            <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-bottom:8px;">
              ${EVENT_ICONS.map((e, i) => `<button type="button" data-ev-icon="${e}" onclick="window.kinPickEventIcon('${e}')" style="font-size:20px;padding:5px 0;border:2px solid ${i===0?'var(--accent)':'transparent'};border-radius:6px;background:${i===0?'var(--sage-bg)':'none'};cursor:pointer;line-height:1;">${e}</button>`).join('')}
            </div>
            <div style="display:flex;gap:6px;">
              ${EVENT_COLORS.map((c, i) => `<button type="button" data-ev-color="${c.name}" onclick="window.kinPickEventColor('${c.name}')" style="width:24px;height:24px;border-radius:50%;background:${c.bg};border:2px solid ${i===0?'var(--text)':'transparent'};cursor:pointer;flex-shrink:0;" title="${c.name}"></button>`).join('')}
            </div>
          </div>
        </div>
        <input type="hidden" id="ev-icon-val" value="🎲" />
        <input type="hidden" id="ev-icon-color-val" value="sage" />
        <div style="display:flex;align-items:center;gap:8px;">
          <input type="file" id="ev-cover-input" accept="image/*" style="display:none;" onchange="window.kinPreviewEventCover(this)" />
          <button type="button" class="btn" style="font-size:12px;padding:6px 10px;display:flex;align-items:center;gap:5px;" onclick="document.getElementById('ev-cover-input').click()">
            <i class="ti ti-photo" aria-hidden="true" style="font-size:13px;"></i> Upload photo instead
          </button>
          <button type="button" id="ev-cover-clear" style="display:none;font-size:12px;color:var(--muted);background:none;border:none;cursor:pointer;padding:0;" onclick="window.kinClearEventCover()">Remove</button>
        </div>
      </div>

      <div class="field">
        <label class="field-label" for="ev-title">Event name</label>
        <input type="text" id="ev-title" placeholder="e.g. Saturday board game night" />
      </div>
      <div class="field">
        <label class="field-label" for="ev-date">Date</label>
        <input type="date" id="ev-date" />
      </div>
      <div class="field">
        <label class="field-label" for="ev-time">Time</label>
        <input type="time" id="ev-time" />
      </div>
      <div class="field">
        <label class="field-label" for="ev-max">Max attendees</label>
        <input type="number" id="ev-max" placeholder="e.g. 8" min="2" max="50" />
      </div>
      <div class="field">
        <label class="field-label" for="ev-district">District / area (shown publicly)</label>
        <input type="text" id="ev-district" placeholder="e.g. Mariahilf district" />
      </div>
      <div class="field">
        <label class="field-label" for="ev-address">Full address (shown only to RSVP'd attendees)</label>
        <input type="text" id="ev-address" placeholder="Street, number, apartment, postcode" />
      </div>
      <div class="field">
        <label class="field-label" for="ev-note">Additional details for attendees (optional)</label>
        <textarea rows="3" id="ev-note" placeholder="e.g. Ring the top buzzer, bring a snack to share…"></textarea>
      </div>
      <div class="banner banner-privacy mb-lg">
        <i class="ti ti-shield-check" aria-hidden="true" style="font-size:16px;color:var(--accent);flex-shrink:0;"></i>
        <p class="text-tiny text-muted">The full address will only be visible to people who RSVP. All chat and address data is deleted 24h after the event.</p>
      </div>
      <button class="btn btn-primary btn-full" id="create-event-btn"
              onclick="window.kinCreateEvent('${commId}')">
        Create event
      </button>
    </div>
  </main>`;
}

export function initEventHandlers() {
  window.kinAddToCalendar = (evId) => {
    const ev = window.__eventCache?.[evId];
    if (!ev) { console.warn('[calendar] event not in cache:', evId); return; }

    const pad = n => String(n).padStart(2, '0');
    // event_time may be "HH:MM" or "HH:MM:SS" — normalise to HH:MM
    const timeParts = (ev.event_time || '00:00').split(':');
    const hh = pad(parseInt(timeParts[0] || 0, 10));
    const mm = pad(parseInt(timeParts[1] || 0, 10));

    const dateParts = ev.event_date.split('-');
    const yr = dateParts[0], mo = dateParts[1], dy = dateParts[2];

    const dtStart = `${yr}${mo}${dy}T${hh}${mm}00`;
    // end = start + 2h
    const startMs = new Date(`${yr}-${mo}-${dy}T${hh}:${mm}:00`).getTime();
    const endD    = new Date(startMs + 2 * 60 * 60 * 1000);
    const dtEnd   = `${endD.getFullYear()}${pad(endD.getMonth()+1)}${pad(endD.getDate())}T${pad(endD.getHours())}${pad(endD.getMinutes())}00`;

    const now = new Date();
    const dtStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth()+1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

    // Escape ICS text fields
    const esc = s => (s || '').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'PRODID:-//Kin//Kin App//EN',
      'BEGIN:VEVENT',
      `UID:${ev.id}@kin-app`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${esc(ev.title)}`,
      `LOCATION:${esc(ev.full_address || ev.district || '')}`,
      ev.address_note ? `DESCRIPTION:${esc(ev.address_note)}` : null,
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean);

    console.log('[calendar] ICS preview:', lines.slice(0,8).join(' | '));

    const ics  = lines.join('\r\n') + '\r\n';
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${(ev.title || 'event').replace(/[^a-z0-9]/gi, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  window.kinAddToGoogleCalendar = (evId) => {
    const ev = window.__eventCache?.[evId];
    if (!ev) { console.warn('[calendar] event not in cache:', evId); return; }

    const pad = n => String(n).padStart(2, '0');
    const timeParts = (ev.event_time || '00:00').split(':');
    const hh = pad(parseInt(timeParts[0] || 0, 10));
    const mm = pad(parseInt(timeParts[1] || 0, 10));
    const dateParts = ev.event_date.split('-');
    const yr = dateParts[0], mo = dateParts[1], dy = dateParts[2];
    const dtStart = `${yr}${mo}${dy}T${hh}${mm}00`;
    const startMs = new Date(`${yr}-${mo}-${dy}T${hh}:${mm}:00`).getTime();
    const endD = new Date(startMs + 2 * 60 * 60 * 1000);
    const dtEnd = `${endD.getFullYear()}${pad(endD.getMonth()+1)}${pad(endD.getDate())}T${pad(endD.getHours())}${pad(endD.getMinutes())}00`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: ev.title || '',
      dates: `${dtStart}/${dtEnd}`,
      details: ev.address_note || '',
      location: ev.full_address || ev.district || '',
    });
    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  };

  window.kinJoinWaitlist = async (evId) => {
    if (!state.user) { navigate('login'); return; }
    const btn = document.querySelector(`button[onclick="window.kinJoinWaitlist('${evId}')"]`);
    if (btn) { btn.disabled = true; btn.textContent = 'Joining waitlist…'; }
    const { error } = await supabase.from('event_waitlist').insert({
      event_id: evId,
      user_id: state.user.id,
    });
    if (error) {
      if (btn) { btn.disabled = false; }
      return;
    }
    navigate('event-detail', { id: evId });
  };

  window.kinLeaveWaitlist = async (evId) => {
    if (!state.user) return;
    await supabase.from('event_waitlist')
      .delete()
      .eq('event_id', evId)
      .eq('user_id', state.user.id);
    navigate('event-detail', { id: evId });
  };

  window.kinRsvp = async (evId) => {
    if (!state.user) { navigate('login'); return; }

    const btn = document.querySelector(`button[onclick="window.kinRsvp('${evId}')"]`);
    if (btn) { btn.disabled = true; btn.textContent = 'Joining…'; }

    const { error } = await supabase.from('rsvps').insert({
      event_id: evId,
      user_id:  state.user.id,
    });

    if (error) {
      if (btn) { btn.disabled = false; btn.textContent = 'RSVP — join the group chat'; }
      return;
    }

    // Notify organiser (fire-and-forget — email failure must never block the UX)
    supabase.functions.invoke('send-email', {
      body: { action: 'rsvp', event_id: evId, actor_id: state.user.id },
    }).catch(() => {});

    // Reload the event detail to show private chat
    navigate('event-detail', { id: evId });
  };

  window.kinSendEventMsg = async (evId) => {
    const input = document.getElementById('event-chat-input');
    if (!input || !state.user) return;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';

    // Optimistically append
    const container = document.getElementById(`event-chat-messages-${evId}`);
    if (container) {
      const div = document.createElement('div');
      div.className = 'msg msg-out';
      div.innerHTML = `<div><div class="msg-bubble msg-bubble-out">${escapeHtml(text)}</div></div>
                       <div class="avatar avatar-sm avatar-${state.user.avatarColor || 'sage'}">${state.user.initials || 'M'}</div>`;
      container.appendChild(div);
      div.scrollIntoView({ behavior: 'smooth' });
    }

    await supabase.from('event_messages').insert({
      event_id: evId,
      user_id:  state.user.id,
      text,
    });
  };

  // ── Icon picker handlers ──
  window.kinPickEventIcon = (emoji) => {
    const iconVal = document.getElementById('ev-icon-val');
    if (iconVal) iconVal.value = emoji;
    window.__evCoverFile = null;
    document.getElementById('ev-cover-clear')?.style.setProperty('display', 'none');
    const color = document.getElementById('ev-icon-color-val')?.value || 'sage';
    const preview = document.getElementById('ev-icon-preview');
    if (preview) { preview.style.background = EV_BG[color] || 'var(--sage)'; preview.innerHTML = emoji; }
    document.querySelectorAll('[data-ev-icon]').forEach(b => {
      b.style.borderColor = b.dataset.evIcon === emoji ? 'var(--accent)' : 'transparent';
      b.style.background  = b.dataset.evIcon === emoji ? 'var(--sage-bg)' : 'none';
    });
  };

  window.kinPickEventColor = (colorName) => {
    const colorVal = document.getElementById('ev-icon-color-val');
    if (colorVal) colorVal.value = colorName;
    const bg = EV_BG[colorName] || 'var(--sage)';
    const preview = document.getElementById('ev-icon-preview');
    if (preview && !window.__evCoverFile) preview.style.background = bg;
    document.querySelectorAll('[data-ev-color]').forEach(b => {
      b.style.borderColor = b.dataset.evColor === colorName ? 'var(--text)' : 'transparent';
    });
  };

  window.kinPreviewEventCover = (input) => {
    const file = input.files?.[0];
    if (!file) return;
    window.__evCoverFile = file;
    const preview = document.getElementById('ev-icon-preview');
    if (preview) {
      const url = URL.createObjectURL(file);
      preview.style.background = 'transparent';
      preview.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;" />`;
    }
    const clearBtn = document.getElementById('ev-cover-clear');
    if (clearBtn) clearBtn.style.display = '';
  };

  window.kinClearEventCover = () => {
    window.__evCoverFile = null;
    const inp = document.getElementById('ev-cover-input');
    if (inp) inp.value = '';
    const clearBtn = document.getElementById('ev-cover-clear');
    if (clearBtn) clearBtn.style.display = 'none';
    const emoji = document.getElementById('ev-icon-val')?.value || '🎲';
    const color = document.getElementById('ev-icon-color-val')?.value || 'sage';
    const preview = document.getElementById('ev-icon-preview');
    if (preview) { preview.style.background = EV_BG[color] || 'var(--sage)'; preview.innerHTML = emoji; }
  };

  window.kinCreateEvent = async (commId) => {
    const title    = document.getElementById('ev-title')?.value.trim();
    const date     = document.getElementById('ev-date')?.value;
    const time     = document.getElementById('ev-time')?.value;
    const max      = parseInt(document.getElementById('ev-max')?.value || '8', 10);
    const district = document.getElementById('ev-district')?.value.trim();
    const address  = document.getElementById('ev-address')?.value.trim();
    const note     = document.getElementById('ev-note')?.value.trim() || '';
    const icon       = document.getElementById('ev-icon-val')?.value || '🎲';
    const icon_color = document.getElementById('ev-icon-color-val')?.value || 'sage';

    const errEl  = document.getElementById('create-event-error');
    const errMsg = document.getElementById('create-event-error-msg');

    if (!title || !date || !time || !district || !address) {
      if (errEl && errMsg) {
        errMsg.textContent = 'Please fill in all required fields.';
        errEl.style.display = 'flex';
      }
      return;
    }

    if (!state.user) { navigate('login'); return; }

    const btn = document.getElementById('create-event-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }

    // Upload cover photo if provided
    let cover_url = null;
    if (window.__evCoverFile) {
      const file = window.__evCoverFile;
      const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `events/${state.user.id}/${Date.now()}.${ext}`;
      const { data: up } = await supabase.storage.from('recommendations').upload(path, file, { upsert: true });
      if (up) {
        const { data: urlData } = supabase.storage.from('recommendations').getPublicUrl(path);
        cover_url = urlData?.publicUrl || null;
      }
    }

    // chat_expires_at = event date + event time + 24h
    const eventDatetime = new Date(`${date}T${time}:00`);
    const chatExpiresAt = new Date(eventDatetime.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from('events').insert({
      community_id:   commId,
      city:           state.user.city || 'Vienna',
      title,
      event_date:     date,
      event_time:     time,
      max_attendees:  max,
      district,
      full_address:   address,
      address_note:   note,
      created_by:     state.user.id,
      chat_expires_at: chatExpiresAt,
      icon,
      icon_color,
      cover_url,
    });

    if (error) {
      if (errEl && errMsg) { errMsg.textContent = error.message; errEl.style.display = 'flex'; }
      if (btn) { btn.disabled = false; btn.textContent = 'Create event'; }
      return;
    }

    window.__evCoverFile = null;
    navigate('community', { id: commId });
  };
}
