// ─── Event Detail & Private Chat Screen ───
import { state, navigate } from '../utils/state.js';
import { avatar, escapeHtml, capacityBar, eventDateBlock, businessBadge } from '../utils/helpers.js';
import { supabase } from '../lib/supabase.js';

// ── Fetch a single event from Supabase ──
async function fetchEvent(id) {
  const { data, error } = await supabase
    .from('events')
    .select(`*, rsvps(count), profiles!events_created_by_fkey(name, is_business, business_type)`)
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

  const [ev, rsvpd] = await Promise.all([fetchEvent(evId), userHasRsvp(evId)]);
  if (!ev) { body.innerHTML = '<p class="text-muted">Event not found.</p>'; return; }

  const going = ev.rsvps?.[0]?.count ?? 0;
  const isPast = new Date(ev.event_date) < new Date(new Date().toDateString());
  const chatExpired = ev.chat_expires_at && new Date(ev.chat_expires_at) < new Date();

  if (isPast || chatExpired) {
    body.innerHTML = renderPastEventBody(ev);
    return;
  }

  if (rsvpd) {
    body.innerHTML = await renderPrivateChatBody(ev, going, false);
    attachChatHandler(ev.id);
  } else {
    body.innerHTML = renderLockedEventBody(ev, going);
  }
}

// ── Locked view (not yet RSVP'd) ──
function renderLockedEventBody(ev, going) {
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
        ? `<button class="btn btn-full" disabled>Event full</button>`
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

  <div style="background:var(--bg);border-radius:var(--radius-md);padding:10px 13px;margin-bottom:12px;">
    <div style="display:flex;align-items:flex-start;gap:8px;">
      <i class="ti ti-map-pin" aria-hidden="true" style="font-size:16px;color:var(--accent);flex-shrink:0;margin-top:1px;"></i>
      <div>
        <p class="fw-500 text-small">Full address (attendees only)</p>
        <p style="font-size:13px;margin-top:3px;">${escapeHtml(ev.full_address)}</p>
        ${ev.address_note ? `<p class="text-tiny text-muted mt-sm">${escapeHtml(ev.address_note)}</p>` : ''}
      </div>
    </div>
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
  const commId = typeof params === 'string' ? params : params.id || 'board-games';
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

  window.kinCreateEvent = async (commId) => {
    const title    = document.getElementById('ev-title')?.value.trim();
    const date     = document.getElementById('ev-date')?.value;
    const time     = document.getElementById('ev-time')?.value;
    const max      = parseInt(document.getElementById('ev-max')?.value || '8', 10);
    const district = document.getElementById('ev-district')?.value.trim();
    const address  = document.getElementById('ev-address')?.value.trim();
    const note     = document.getElementById('ev-note')?.value.trim() || '';

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
    });

    if (error) {
      if (errEl && errMsg) { errMsg.textContent = error.message; errEl.style.display = 'flex'; }
      if (btn) { btn.disabled = false; btn.textContent = 'Create event'; }
      return;
    }

    navigate('community', { id: commId });
  };
}
