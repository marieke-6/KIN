// ─── Recommendations Screen ───
import { state, navigate } from '../utils/state.js';
import { bottomNav, escapeHtml } from '../utils/helpers.js';
import { supabase } from '../lib/supabase.js';

// ── List screen ──────────────────────────────────────────────────────────────

export function renderRecommendations() {
  const isBusiness = state.user?.isBusiness;

  window.__afterNavigate = () => loadRecommendations();

  return `
  <main>
    <nav class="nav">
      <span class="nav-logo">Kin</span>
      ${isBusiness ? `
        <button class="btn btn-primary btn-sm" onclick="window.kinNavigate('post-recommendation')"
                style="display:flex;align-items:center;gap:5px;">
          <i class="ti ti-plus" aria-hidden="true"></i> Post
        </button>` : ''}
    </nav>

    <div style="padding:14px 16px 10px;">
      <h2 style="font-size:18px;font-weight:600;margin-bottom:4px;">Tips &amp; Recommendations</h2>
      <p class="text-muted text-small">Places, events and things worth knowing — from your community.</p>
    </div>

    <div style="padding:0 16px 16px;">

      <div class="banner banner-privacy" style="margin-bottom:16px;">
        <i class="ti ti-info-circle" style="font-size:16px;color:var(--accent);flex-shrink:0;"></i>
        <p class="text-tiny text-muted">Local businesses can post events and offers here. Community members can share their favourite spots.</p>
      </div>

      <div id="recs-list">
        <!-- Placeholder cards shown while DB loads -->
        <div class="section-label" style="margin-bottom:10px;">Featured</div>
        ${_sampleCard('amber','ti-building-store','#fef3c7','#92400e','Café Hawelka','Business · Café','pill-amber',
          'Every Sunday: live jazz from 7pm. Free entry for Kin members — just mention you\'re from the app. 1st district, Dorotheergasse 6.',
          'Vienna · 2 days ago')}
        ${_sampleCard('sage','ti-map-pin','var(--sage)','var(--sage-dark)','Türkenschanzpark — hidden gem','Community tip','pill-sage',
          'Best spot for outdoor yoga or a slow morning run. Far fewer people than the Prater. Has a small lake and a café inside.',
          'Vienna · Shared by Kai · 5 days ago')}
        <div class="section-label" style="margin:14px 0 10px;">Community picks</div>
        ${_sampleCard('lav','ti-mug','var(--lav)','var(--lav-dark)','Kaffee &amp; Kuchen meetup spot','Community tip','pill-lav',
          "Café Schwarzenberg on the Ring has a quiet back room perfect for a group of 6–8. They don't mind if you stay for 2 hours.",
          'Vienna · Shared by Nina · 1 week ago')}
        <div style="text-align:center;padding:20px 0 8px;">
          <p class="text-muted text-small">More coming soon.</p>
        </div>
      </div>

    </div>
    ${bottomNav('recommendations')}
  </main>`;
}

function _sampleCard(color, icon, bg, fg, title, badge, badgeClass, body, meta) {
  return `<div class="card mb-md" style="display:flex;flex-direction:column;gap:4px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <div style="width:36px;height:36px;border-radius:10px;background:${bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="ti ${icon}" style="font-size:18px;color:${fg};"></i>
      </div>
      <div>
        <p class="fw-500" style="font-size:14px;">${title}</p>
        <span class="pill ${badgeClass}" style="font-size:10px;padding:2px 7px;">${badge}</span>
      </div>
    </div>
    <p style="font-size:13px;line-height:1.5;">${body}</p>
    <p class="text-tiny text-muted" style="margin-top:4px;">${meta}</p>
  </div>`;
}

async function loadRecommendations() {
  if (!state.user) return;
  const city = state.user.city || 'Vienna';

  const { data: posts, error } = await supabase
    .from('recommendations')
    .select('*, profiles(name, is_business, business_name, business_type)')
    .eq('city', city)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error || !posts?.length) return;

  const listEl = document.getElementById('recs-list');
  if (!listEl) return;

  const featured = posts.filter(p => p.is_featured || p.profiles?.is_business);
  const community = posts.filter(p => !p.is_featured && !p.profiles?.is_business);

  let html = '';

  if (featured.length) {
    html += `<div class="section-label" style="margin-bottom:10px;">Featured</div>`;
    html += featured.map(renderRecCard).join('');
  }
  if (community.length) {
    html += `<div class="section-label" style="margin:14px 0 10px;">Community picks</div>`;
    html += community.map(renderRecCard).join('');
  }
  if (!html) return;

  html += `<div style="text-align:center;padding:20px 0 8px;"><p class="text-muted text-small">That's everything for ${escapeHtml(city)} right now.</p></div>`;
  listEl.innerHTML = html;
}

function renderRecCard(p) {
  const isBusiness = p.profiles?.is_business;
  const author = isBusiness ? (p.business_name || p.profiles?.business_name || p.profiles?.name || 'Business')
                             : (p.profiles?.name || 'Member');
  const badge = isBusiness ? `Business · ${escapeHtml(p.profiles?.business_type || 'Partner')}`
                            : 'Community tip';
  const badgeClass = isBusiness ? 'pill-amber' : 'pill-sage';
  const icon = isBusiness ? 'ti-building-store' : 'ti-map-pin';
  const iconBg = isBusiness ? '#fef3c7' : 'var(--sage)';
  const iconFg = isBusiness ? '#92400e' : 'var(--sage-dark)';

  const dateStr = p.event_date
    ? `<span style="margin-right:8px;"><i class="ti ti-calendar-event" style="font-size:12px;"></i> ${formatDate(p.event_date)}${p.event_time ? ' · ' + p.event_time.slice(0,5) : ''}</span>`
    : '';
  const locStr = p.location
    ? `<span><i class="ti ti-map-pin" style="font-size:12px;"></i> ${escapeHtml(p.location)}</span>`
    : '';

  const typeLabel = { event:'Event', offer:'Offer', tip:'Tip', place:'Place' }[p.type] || 'Tip';

  return `
  <div class="card mb-md" style="display:flex;flex-direction:column;gap:6px;">
    ${p.image_url ? `<img src="${escapeHtml(p.image_url)}" alt="" style="width:100%;height:180px;object-fit:cover;border-radius:8px;margin-bottom:4px;">` : ''}
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:36px;height:36px;border-radius:10px;background:${iconBg};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="ti ${icon}" style="font-size:18px;color:${iconFg};"></i>
      </div>
      <div style="flex:1;min-width:0;">
        <p class="fw-500" style="font-size:14px;">${escapeHtml(p.title)}</p>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span class="pill ${badgeClass}" style="font-size:10px;padding:2px 7px;">${badge}</span>
          <span class="pill pill-gray" style="font-size:10px;padding:2px 7px;">${typeLabel}</span>
        </div>
      </div>
    </div>
    ${p.description ? `<p style="font-size:13px;line-height:1.5;">${escapeHtml(p.description)}</p>` : ''}
    ${(dateStr || locStr) ? `<p class="text-tiny text-muted" style="display:flex;gap:10px;flex-wrap:wrap;">${dateStr}${locStr}</p>` : ''}
    ${p.website ? `<a href="${escapeHtml(p.website)}" target="_blank" rel="noopener" class="text-accent text-tiny" style="text-decoration:none;"><i class="ti ti-external-link" style="font-size:11px;"></i> ${escapeHtml(p.website.replace(/^https?:\/\//, ''))}</a>` : ''}
    <p class="text-tiny text-muted">${escapeHtml(author)} · ${timeAgo(p.created_at)}</p>
  </div>`;
}

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en', { day: 'numeric', month: 'short' });
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'short' });
}

// ── Post creation screen ─────────────────────────────────────────────────────

export function renderPostRecommendation() {
  if (!state.user?.isBusiness) {
    navigate('recommendations');
    return '';
  }

  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('recommendations')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <span style="font-size:16px;font-weight:500;">New post</span>
      </div>
    </nav>

    <div class="screen-body">

      <!-- Type -->
      <div class="field">
        <label class="field-label">Type</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${[
            { key:'event',  icon:'ti-calendar-event', label:'Event' },
            { key:'offer',  icon:'ti-tag',            label:'Offer' },
            { key:'tip',    icon:'ti-bulb',           label:'Tip' },
            { key:'place',  icon:'ti-map-pin',        label:'Place' },
          ].map(t => `
            <button class="rec-type-btn${t.key === 'event' ? ' active' : ''}"
                    data-type="${t.key}"
                    onclick="window.kinRecSetType('${t.key}',this)"
                    style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--radius-full);
                           border:1.5px solid ${t.key==='event'?'var(--accent)':'var(--border)'};
                           background:${t.key==='event'?'var(--sage)':'var(--surface)'};
                           color:${t.key==='event'?'var(--sage-dark)':'var(--muted)'};
                           font-size:13px;font-weight:500;cursor:pointer;font-family:var(--font-sans);">
              <i class="ti ${t.icon}" aria-hidden="true"></i> ${t.label}
            </button>`).join('')}
        </div>
      </div>

      <!-- Photo -->
      <div class="field">
        <label class="field-label">Photo</label>
        <div id="rec-photo-area">
          <label for="rec-photo-input"
                 style="display:flex;align-items:center;justify-content:center;gap:8px;
                        padding:20px;border-radius:var(--radius-md);border:1.5px dashed var(--border);
                        cursor:pointer;color:var(--muted);font-size:13px;background:var(--bg);
                        transition:border-color 0.13s;">
            <i class="ti ti-camera" style="font-size:20px;"></i>
            <span>Add photo</span>
          </label>
          <input type="file" id="rec-photo-input" accept="image/*"
                 style="display:none;" onchange="window.kinRecPreviewPhoto(this)">
        </div>
        <div id="rec-photo-preview" style="display:none;position:relative;margin-top:8px;">
          <img id="rec-photo-img" style="width:100%;max-height:240px;object-fit:cover;border-radius:var(--radius-md);" />
          <button onclick="window.kinRecRemovePhoto()"
                  style="position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:50%;
                         background:rgba(0,0,0,0.55);border:none;cursor:pointer;color:white;
                         display:flex;align-items:center;justify-content:center;font-size:14px;">
            <i class="ti ti-x" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <!-- Title -->
      <div class="field">
        <label class="field-label" for="rec-title">Title *</label>
        <input type="text" id="rec-title"
               placeholder="e.g. Sunday jazz night — free entry for Kin members" />
      </div>

      <!-- Description -->
      <div class="field">
        <label class="field-label" for="rec-desc">Description / Notes</label>
        <textarea id="rec-desc" rows="4"
                  placeholder="Tell people what to expect, any special details, or why they should come…"
                  style="resize:vertical;min-height:90px;"></textarea>
      </div>

      <!-- Date + Time -->
      <div style="display:flex;gap:12px;">
        <div class="field" style="flex:1;">
          <label class="field-label" for="rec-date">Date <span class="text-muted">(optional)</span></label>
          <input type="date" id="rec-date" />
        </div>
        <div class="field" style="flex:1;">
          <label class="field-label" for="rec-time">Time <span class="text-muted">(optional)</span></label>
          <input type="time" id="rec-time" />
        </div>
      </div>

      <!-- Offer detail (shown for Offer type) -->
      <div class="field" id="rec-offer-row" style="display:none;">
        <label class="field-label" for="rec-offer">Offer / Discount details</label>
        <input type="text" id="rec-offer"
               placeholder="e.g. 20% off for Kin members, Free entry, Buy one get one…" />
      </div>

      <!-- Location -->
      <div class="field">
        <label class="field-label" for="rec-location">Address / Location <span class="text-muted">(optional)</span></label>
        <input type="text" id="rec-location"
               placeholder="e.g. Dorotheergasse 6, 1st district" />
      </div>

      <!-- Website -->
      <div class="field">
        <label class="field-label" for="rec-website">Website <span class="text-muted">(optional)</span></label>
        <input type="text" id="rec-website" placeholder="https://…" />
      </div>

      <!-- Error -->
      <div id="rec-error" class="card-danger mb-md" style="display:none;">
        <div style="display:flex;gap:9px;align-items:flex-start;">
          <i class="ti ti-alert-triangle" style="font-size:16px;color:var(--red-dark);flex-shrink:0;margin-top:1px;"></i>
          <p id="rec-error-msg" style="font-size:13px;color:var(--red-dark);line-height:1.5;"></p>
        </div>
      </div>

      <button id="rec-submit-btn" class="btn btn-primary btn-full btn-lg"
              onclick="window.kinSubmitRecommendation()"
              style="margin-top:8px;">
        <i class="ti ti-send" aria-hidden="true"></i> Post to Tips &amp; Recommendations
      </button>

    </div>
  </main>`;
}

// ── Handlers ────────────────────────────────────────────────────────────────

export function initRecommendationHandlers() {

  window.kinRecSetType = (type, btn) => {
    document.querySelectorAll('.rec-type-btn').forEach(b => {
      const active = b === btn;
      b.style.borderColor  = active ? 'var(--accent)'  : 'var(--border)';
      b.style.background   = active ? 'var(--sage)'    : 'var(--surface)';
      b.style.color        = active ? 'var(--sage-dark)': 'var(--muted)';
      if (active) b.classList.add('active'); else b.classList.remove('active');
    });
    const offerRow = document.getElementById('rec-offer-row');
    if (offerRow) offerRow.style.display = type === 'offer' ? 'block' : 'none';
  };

  window.kinRecPreviewPhoto = (input) => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.getElementById('rec-photo-img');
      const preview = document.getElementById('rec-photo-preview');
      const area = document.getElementById('rec-photo-area');
      if (img) img.src = e.target.result;
      if (preview) preview.style.display = 'block';
      if (area) area.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  window.kinRecRemovePhoto = () => {
    const input = document.getElementById('rec-photo-input');
    const preview = document.getElementById('rec-photo-preview');
    const area = document.getElementById('rec-photo-area');
    if (input) input.value = '';
    if (preview) preview.style.display = 'none';
    if (area) area.style.display = 'block';
  };

  window.kinSubmitRecommendation = async () => {
    if (!state.user?.isBusiness) return;

    const title = document.getElementById('rec-title')?.value.trim();
    const errEl  = document.getElementById('rec-error');
    const errMsg = document.getElementById('rec-error-msg');
    const btn    = document.getElementById('rec-submit-btn');

    const showErr = msg => {
      if (errEl)  errEl.style.display = 'block';
      if (errMsg) errMsg.textContent  = msg;
    };

    if (!title) { showErr('Please add a title for your post.'); return; }
    if (errEl) errEl.style.display = 'none';
    if (btn) { btn.disabled = true; btn.textContent = 'Posting…'; }

    const type     = document.querySelector('.rec-type-btn.active')?.dataset.type || 'event';
    const desc     = document.getElementById('rec-desc')?.value.trim() || null;
    const date     = document.getElementById('rec-date')?.value || null;
    const time     = document.getElementById('rec-time')?.value || null;
    const offer    = document.getElementById('rec-offer')?.value.trim() || null;
    const location = document.getElementById('rec-location')?.value.trim() || null;
    const website  = document.getElementById('rec-website')?.value.trim() || null;

    // Combine offer details into description if present
    const fullDesc = offer ? `${desc ? desc + '\n\n' : ''}${offer}` : desc;

    // Upload photo if one was selected
    let imageUrl = null;
    const fileInput = document.getElementById('rec-photo-input');
    if (fileInput?.files?.[0]) {
      const file = fileInput.files[0];
      const ext  = file.name.split('.').pop().toLowerCase() || 'jpg';
      const path = `${state.user.id}/${Date.now()}.${ext}`;
      const { data: upload, error: uploadErr } = await supabase.storage
        .from('recommendations')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (!uploadErr && upload) {
        const { data: { publicUrl } } = supabase.storage
          .from('recommendations')
          .getPublicUrl(upload.path);
        imageUrl = publicUrl;
      }
    }

    const { error } = await supabase.from('recommendations').insert({
      user_id:       state.user.id,
      title,
      description:   fullDesc,
      type,
      location,
      city:          state.user.city || 'Vienna',
      event_date:    date || null,
      event_time:    time || null,
      image_url:     imageUrl,
      business_name: state.user.businessName || '',
      website:       website || null,
    });

    if (error) {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="ti ti-send"></i> Post to Tips & Recommendations'; }
      showErr('Could not save your post. Please try again.');
      console.error('[post-rec]', error);
      return;
    }

    window.kinNavigate('recommendations');
  };
}
