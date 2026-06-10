// ─── Create Community Screen ───
import { state, navigate } from '../utils/state.js';
import { escapeHtml } from '../utils/helpers.js';
import { supabase } from '../lib/supabase.js';

const ICONS = [
  { icon: 'ti-run',              label: 'Running'     },
  { icon: 'ti-mountain',         label: 'Hiking'      },
  { icon: 'ti-palette',          label: 'Art'         },
  { icon: 'ti-chef-hat',         label: 'Cooking'     },
  { icon: 'ti-chess',            label: 'Games'       },
  { icon: 'ti-book',             label: 'Reading'     },
  { icon: 'ti-camera',           label: 'Photography' },
  { icon: 'ti-music',            label: 'Music'       },
  { icon: 'ti-ball-volleyball',  label: 'Volleyball'  },
  { icon: 'ti-bike',             label: 'Cycling'     },
  { icon: 'ti-swim',             label: 'Swimming'    },
  { icon: 'ti-yoga',             label: 'Yoga'        },
  { icon: 'ti-plant',            label: 'Gardening'   },
  { icon: 'ti-dog',              label: 'Pets'        },
  { icon: 'ti-needle-thread',    label: 'Knitting'    },
  { icon: 'ti-device-gamepad-2', label: 'Gaming'      },
  { icon: 'ti-heart',            label: 'Other'       },
];

const COLORS = [
  { key: 'sage',  label: 'Green'  },
  { key: 'lav',   label: 'Purple' },
  { key: 'peach', label: 'Pink'   },
  { key: 'amber', label: 'Amber'  },
];

export function renderCreateCommunity() {
  if (!state.user) { navigate('login'); return ''; }

  const iconGrid = ICONS.map((item, i) => `
    <button type="button"
         class="icon-option${i === 0 ? ' selected' : ''}"
         data-icon="${item.icon}"
         onclick="window.kinSelectCommIcon(this)"
         title="${item.label}"
         style="width:48px;height:48px;border-radius:10px;
                border:2px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'};
                display:flex;flex-direction:column;align-items:center;justify-content:center;
                gap:2px;cursor:pointer;background:var(--bg);padding:0;">
      <i class="ti ${item.icon}" style="font-size:18px;color:${i === 0 ? 'var(--accent)' : 'var(--muted)'};"></i>
      <span style="font-size:8px;color:${i === 0 ? 'var(--accent)' : 'var(--muted)'};">${item.label}</span>
    </button>`).join('');

  const colorDots = COLORS.map((c, i) => `
    <button type="button"
         class="color-option${i === 0 ? ' selected' : ''}"
         data-color="${c.key}"
         onclick="window.kinSelectCommColor(this)"
         style="width:36px;height:36px;border-radius:50%;background:var(--${c.key});
                border:3px solid ${i === 0 ? 'var(--accent)' : 'transparent'};
                cursor:pointer;"
         title="${c.label}">
    </button>`).join('');

  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('explore')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <span class="fw-500" style="font-size:16px;">New community</span>
      </div>
    </nav>
    <div class="screen-body">

      <div id="create-comm-error" class="card-danger mb-lg" style="display:none;">
        <div style="display:flex;gap:9px;align-items:flex-start;">
          <i class="ti ti-alert-triangle" aria-hidden="true" style="font-size:16px;color:var(--red-dark);flex-shrink:0;margin-top:1px;"></i>
          <p id="create-comm-error-msg" style="font-size:13px;color:var(--red-dark);line-height:1.5;"></p>
        </div>
      </div>

      <div class="field">
        <label class="field-label" for="comm-name">Community name</label>
        <input type="text" id="comm-name" placeholder="e.g. Sunday Knitters Vienna" maxlength="60" />
      </div>

      <div class="field">
        <label class="field-label" for="comm-type">Type of community</label>
        <input type="text" id="comm-type"
               placeholder="e.g. Knitting, Running, Book club, Birdwatching…"
               maxlength="40" />
        <p class="text-tiny text-muted" style="margin-top:4px;">Write it in your own words — any activity goes.</p>
      </div>

      <div class="field">
        <label class="field-label" for="comm-city">City</label>
        <input type="text" id="comm-city"
               value="${escapeHtml(state.user.city || '')}"
               placeholder="e.g. Vienna" />
      </div>

      <div class="field">
        <label class="field-label" for="comm-notes">Notes (optional)</label>
        <textarea id="comm-notes" rows="3"
          placeholder="Anything people should know before joining — who it's for, how often you meet, what to bring…"></textarea>
      </div>

      <div class="field">
        <label class="field-label">Pick an icon</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;">
          ${iconGrid}
        </div>
      </div>

      <div class="field">
        <label class="field-label">Pick a colour</label>
        <div style="display:flex;gap:10px;margin-top:6px;">
          ${colorDots}
        </div>
      </div>

      <div class="card-flat mb-lg" style="margin-top:4px;">
        <p class="fw-500 text-small mb-md">Before you create this community:</p>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <label class="checkbox-row">
            <input type="checkbox" id="check-legal" />
            This community does not promote illegal activities, violence, or discrimination
          </label>
          <label class="checkbox-row">
            <input type="checkbox" id="check-guidelines" />
            I will moderate it in line with Kin's <span class="text-accent">community guidelines</span>
          </label>
        </div>
      </div>

      <div class="banner banner-privacy mb-lg">
        <i class="ti ti-shield-check" aria-hidden="true" style="font-size:16px;color:var(--accent);flex-shrink:0;"></i>
        <p class="text-tiny text-muted">As creator you become the moderator. Kin can remove any community that breaks our guidelines.</p>
      </div>

      <button class="btn btn-primary btn-full btn-lg" id="create-comm-btn"
              onclick="window.kinSubmitCreateCommunity()">
        Create community
      </button>
    </div>
  </main>`;
}

export function initCreateCommunityHandlers() {
  window.kinSelectCommIcon = (el) => {
    document.querySelectorAll('.icon-option').forEach(o => {
      o.style.borderColor = 'var(--border)';
      o.querySelector('i').style.color = 'var(--muted)';
      o.querySelector('span').style.color = 'var(--muted)';
      o.classList.remove('selected');
    });
    el.style.borderColor = 'var(--accent)';
    el.querySelector('i').style.color = 'var(--accent)';
    el.querySelector('span').style.color = 'var(--accent)';
    el.classList.add('selected');
  };

  window.kinSelectCommColor = (el) => {
    document.querySelectorAll('.color-option').forEach(o => {
      o.style.borderColor = 'transparent';
      o.classList.remove('selected');
    });
    el.style.borderColor = 'var(--accent)';
    el.classList.add('selected');
  };

  window.kinSubmitCreateCommunity = async () => {
    const name  = document.getElementById('comm-name')?.value.trim();
    const type  = document.getElementById('comm-type')?.value.trim();
    const city  = document.getElementById('comm-city')?.value.trim();
    const notes = document.getElementById('comm-notes')?.value.trim() || '';
    const icon  = document.querySelector('.icon-option.selected')?.dataset.icon || 'ti-heart';
    const color = document.querySelector('.color-option.selected')?.dataset.color || 'sage';

    const checkLegal      = document.getElementById('check-legal')?.checked;
    const checkGuidelines = document.getElementById('check-guidelines')?.checked;

    const errEl  = document.getElementById('create-comm-error');
    const errMsg = document.getElementById('create-comm-error-msg');
    const showError = (msg) => {
      if (errEl && errMsg) { errMsg.textContent = msg; errEl.style.display = 'flex'; }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!name)  { showError('Please give your community a name.'); return; }
    if (!type)  { showError('Please describe the type of community.'); return; }
    if (!city)  { showError('Please enter a city.'); return; }
    if (!checkLegal || !checkGuidelines) {
      showError('Please tick both boxes to confirm you agree to the community rules.');
      return;
    }

    if (!state.user) { navigate('login'); return; }

    const btn = document.getElementById('create-comm-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }

    // Build a URL-safe ID from name + timestamp
    const id = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40)
      + '-' + Date.now().toString(36);

    // Store type in description prefixed for easy display
    const description = type + (notes ? ' · ' + notes : '');

    const { error } = await supabase.from('communities').insert({
      id,
      name,
      city,
      description,
      icon,
      color,
      created_by: state.user.id,
      is_seeded:  false,
    });

    if (error) {
      showError(error.message);
      if (btn) { btn.disabled = false; btn.textContent = 'Create community'; }
      return;
    }

    // Auto-join as first member
    await supabase.from('community_members').insert({
      community_id: id,
      user_id: state.user.id,
    });

    navigate('community', { id });
  };
}
