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
  { icon: 'ti-book',             label: 'Book club'   },
  { icon: 'ti-camera',           label: 'Photography' },
  { icon: 'ti-music',            label: 'Music'       },
  { icon: 'ti-ball-volleyball',  label: 'Volleyball'  },
  { icon: 'ti-bike',             label: 'Cycling'     },
  { icon: 'ti-swim',             label: 'Swimming'    },
  { icon: 'ti-yoga',             label: 'Yoga'        },
  { icon: 'ti-plant',            label: 'Gardening'   },
  { icon: 'ti-dog',              label: 'Pets'        },
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
    <div class="icon-option${i === 0 ? ' selected' : ''}"
         data-icon="${item.icon}"
         onclick="window.kinSelectCommIcon(this)"
         title="${item.label}"
         style="width:44px;height:44px;border-radius:10px;border:2px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'};
                display:flex;align-items:center;justify-content:center;cursor:pointer;background:var(--bg);">
      <i class="ti ${item.icon}" style="font-size:20px;color:${i === 0 ? 'var(--accent)' : 'var(--muted)'};"></i>
    </div>`).join('');

  const colorDots = COLORS.map((c, i) => `
    <div class="color-option${i === 0 ? ' selected' : ''}"
         data-color="${c.key}"
         onclick="window.kinSelectCommColor(this)"
         style="width:32px;height:32px;border-radius:50%;background:var(--${c.key});
                border:3px solid ${i === 0 ? 'var(--accent)' : 'transparent'};cursor:pointer;"
         title="${c.label}">
    </div>`).join('');

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
        <p id="create-comm-error-msg" style="font-size:13px;color:var(--red-dark);"></p>
      </div>

      <div class="field">
        <label class="field-label" for="comm-name">Community name</label>
        <input type="text" id="comm-name" placeholder="e.g. Sunday Hikers Vienna" maxlength="60" />
      </div>

      <div class="field">
        <label class="field-label" for="comm-city">City</label>
        <input type="text" id="comm-city" value="${escapeHtml(state.user.city || '')}" placeholder="e.g. Vienna" />
      </div>

      <div class="field">
        <label class="field-label" for="comm-desc">Short description</label>
        <textarea id="comm-desc" rows="3"
          placeholder="What is this community about? Who is it for?"></textarea>
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

      <div class="card-flat mb-lg" style="margin-top:8px;">
        <p class="fw-500 text-small mb-md">Before you create this community, please confirm:</p>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <label class="checkbox-row">
            <input type="checkbox" id="check-legal" />
            This community does not promote illegal activities, violence, or discrimination of any kind
          </label>
          <label class="checkbox-row">
            <input type="checkbox" id="check-guidelines" />
            I will moderate this community in line with Kin's <span class="text-accent">community guidelines</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" id="check-18plus" />
            This community is open to adults (18+) only
          </label>
        </div>
      </div>

      <div class="banner banner-privacy mb-lg">
        <i class="ti ti-shield-check" aria-hidden="true" style="font-size:16px;color:var(--accent);flex-shrink:0;"></i>
        <p class="text-tiny text-muted">As creator you become the moderator. Kin can remove any community that violates our guidelines.</p>
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
      o.classList.remove('selected');
    });
    el.style.borderColor = 'var(--accent)';
    el.querySelector('i').style.color = 'var(--accent)';
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
    const city  = document.getElementById('comm-city')?.value.trim();
    const desc  = document.getElementById('comm-desc')?.value.trim();
    const icon  = document.querySelector('.icon-option.selected')?.dataset.icon || 'ti-heart';
    const color = document.querySelector('.color-option.selected')?.dataset.color || 'sage';

    const checkLegal     = document.getElementById('check-legal')?.checked;
    const checkGuidelines = document.getElementById('check-guidelines')?.checked;
    const check18plus    = document.getElementById('check-18plus')?.checked;

    const errEl  = document.getElementById('create-comm-error');
    const errMsg = document.getElementById('create-comm-error-msg');

    const showError = (msg) => {
      if (errEl && errMsg) { errMsg.textContent = msg; errEl.style.display = 'flex'; }
    };

    if (!name)  { showError('Please give your community a name.'); return; }
    if (!city)  { showError('Please enter a city.'); return; }
    if (!desc)  { showError('Please add a short description.'); return; }
    if (!checkLegal || !checkGuidelines || !check18plus) {
      showError('Please tick all three boxes to confirm you agree to the community rules.');
      return;
    }

    const btn = document.getElementById('create-comm-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }

    // Generate a URL-safe ID from the name
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
               + '-' + Date.now().toString(36);

    const { error } = await supabase.from('communities').insert({
      id,
      name,
      city,
      description: desc,
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
