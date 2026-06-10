// ─── Auth Screens ───
import { state, navigate, INTERESTS } from '../utils/state.js';
import { calculateAge, escapeHtml } from '../utils/helpers.js';
import { supabase } from '../lib/supabase.js';

// ── Landing ──
export function renderLanding() {
  return `
  <main>
    <div style="padding:40px 24px 0;text-align:center;">
      <div style="font-size:36px;font-weight:500;color:var(--accent);letter-spacing:-1px;margin-bottom:8px;">Kin</div>
      <h1 style="font-size:24px;font-weight:500;margin-bottom:10px;line-height:1.3;">Find your people,<br>nearby.</h1>
      <p class="text-muted" style="font-size:14px;max-width:300px;margin:0 auto 32px;line-height:1.6;">
        Join local communities around things you love. Meet real people, in real life.
      </p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:28px;">
        <span class="pill pill-sage"><i class="ti ti-run" aria-hidden="true"></i> Running</span>
        <span class="pill pill-lav"><i class="ti ti-palette" aria-hidden="true"></i> Painting</span>
        <span class="pill pill-amber"><i class="ti ti-chess" aria-hidden="true"></i> Board games</span>
        <span class="pill pill-sage"><i class="ti ti-mountain" aria-hidden="true"></i> Hiking</span>
        <span class="pill pill-lav"><i class="ti ti-chef-hat" aria-hidden="true"></i> Cooking</span>
      </div>
      <button class="btn btn-primary btn-full btn-lg" onclick="window.kinNavigate('signup')" style="max-width:300px;">
        Get started
      </button>
      <p class="text-muted text-small" style="margin-top:14px;">
        Already have an account?
        <span class="text-accent" style="cursor:pointer;" onclick="window.kinNavigate('login')">Log in</span>
      </p>
    </div>
    <div style="margin-top:36px;padding:0 16px;display:flex;gap:12px;">
      <div class="card" style="flex:1;text-align:center;padding:20px 12px;">
        <i class="ti ti-users" aria-hidden="true" style="font-size:24px;color:var(--accent);display:block;margin-bottom:8px;"></i>
        <p class="fw-500 text-small">Join communities</p>
        <p class="text-tiny text-muted mt-sm">Around your interests</p>
      </div>
      <div class="card" style="flex:1;text-align:center;padding:20px 12px;">
        <i class="ti ti-calendar-event" aria-hidden="true" style="font-size:24px;color:var(--lav-dark);display:block;margin-bottom:8px;"></i>
        <p class="fw-500 text-small">Find events</p>
        <p class="text-tiny text-muted mt-sm">Nearby, this week</p>
      </div>
      <div class="card" style="flex:1;text-align:center;padding:20px 12px;">
        <i class="ti ti-heart" aria-hidden="true" style="font-size:24px;color:var(--peach-dark);display:block;margin-bottom:8px;"></i>
        <p class="fw-500 text-small">Meet people</p>
        <p class="text-tiny text-muted mt-sm">In person, for real</p>
      </div>
    </div>
  </main>`;
}

// ── Signup ──
export function renderSignup() {
  return `
  <main>
    <nav class="nav">
      <span class="nav-logo">Kin</span>
    </nav>
    <div class="screen-body">
      <h2 style="margin-bottom:4px;">Create your account</h2>
      <p class="text-muted text-small mb-lg">Join as an individual or as a business hosting events.</p>

      <div id="auth-error" class="card-danger mb-lg" style="display:none;">
        <div style="display:flex;gap:9px;align-items:flex-start;">
          <i class="ti ti-alert-triangle" aria-hidden="true" style="font-size:16px;color:var(--red-dark);flex-shrink:0;margin-top:1px;"></i>
          <p id="auth-error-msg" style="font-size:13px;color:var(--red-dark);line-height:1.5;"></p>
        </div>
      </div>

      <!-- Account type toggle -->
      <div style="display:flex;gap:8px;margin-bottom:20px;">
        <button id="type-individual" onclick="window.kinSetAccountType('individual')"
          style="flex:1;padding:10px;border-radius:10px;border:2px solid var(--accent);
                 background:var(--accent-bg);font-size:13px;font-weight:500;cursor:pointer;
                 display:flex;align-items:center;justify-content:center;gap:6px;">
          <i class="ti ti-user" aria-hidden="true"></i> Individual
        </button>
        <button id="type-business" onclick="window.kinSetAccountType('business')"
          style="flex:1;padding:10px;border-radius:10px;border:2px solid var(--border);
                 background:var(--bg);font-size:13px;font-weight:500;cursor:pointer;color:var(--muted);
                 display:flex;align-items:center;justify-content:center;gap:6px;">
          <i class="ti ti-building-store" aria-hidden="true"></i> Business
        </button>
      </div>

      <!-- Individual fields -->
      <div id="individual-fields">
        <div class="field">
          <label class="field-label" for="signup-name">First name only</label>
          <input type="text" id="signup-name" placeholder="e.g. Marieke" autocomplete="given-name" />
        </div>
      </div>

      <!-- Business fields (hidden by default) -->
      <div id="business-fields" style="display:none;">
        <div class="field">
          <label class="field-label" for="signup-business-name">Business name</label>
          <input type="text" id="signup-business-name" placeholder="e.g. Café Central, CrossFit Vienna" />
        </div>
        <div class="field">
          <label class="field-label" for="signup-business-type">Type of business</label>
          <select id="signup-business-type">
            <option value="">Select a type…</option>
            <option value="Café">Café</option>
            <option value="Bar">Bar</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Gym">Gym</option>
            <option value="Yoga studio">Yoga studio</option>
            <option value="Art studio">Art studio</option>
            <option value="Bookshop">Bookshop</option>
            <option value="Game café">Game café</option>
            <option value="Community centre">Community centre</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label class="field-label" for="signup-email">Email</label>
        <input type="email" id="signup-email" placeholder="you@email.com" autocomplete="email" />
      </div>
      <div class="field">
        <label class="field-label" for="signup-password">Password</label>
        <input type="password" id="signup-password" placeholder="At least 8 characters" autocomplete="new-password" />
      </div>

      <!-- DOB only for individuals -->
      <div id="dob-field" class="field">
        <label class="field-label" for="signup-dob">Date of birth</label>
        <input type="date" id="signup-dob" onchange="window.kinCheckAge()" />
        <div id="age-error" style="display:none;" class="field-error">
          <i class="ti ti-alert-circle" aria-hidden="true" style="font-size:14px;"></i>
          You must be 18 or older to use Kin.
        </div>
      </div>

      <div class="field">
        <label class="field-label" for="signup-city">City or town</label>
        <input type="text" id="signup-city" placeholder="e.g. Vienna, Innsbruck, Graz…" autocomplete="address-level2" />
      </div>

      <div class="card-flat mb-lg">
        <p class="fw-500 text-small mb-md">Before you join, please confirm:</p>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <label class="checkbox-row" id="check-age-row">
            <input type="checkbox" id="check-age" />
            I confirm I am 18 years of age or older
          </label>
          <label class="checkbox-row">
            <input type="checkbox" id="check-terms" />
            I agree to Kin's <span class="text-accent">community guidelines</span> and <span class="text-accent">terms of use</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" id="check-privacy" />
            I have read and accept the <span class="text-accent">privacy policy</span>
          </label>
        </div>
      </div>

      <div id="underage-block" class="card-danger mb-lg" style="display:none;">
        <div style="display:flex;gap:9px;align-items:flex-start;">
          <i class="ti ti-alert-triangle" aria-hidden="true" style="font-size:16px;color:var(--red-dark);flex-shrink:0;margin-top:1px;"></i>
          <p style="font-size:13px;color:var(--red-dark);line-height:1.5;">
            Kin is only available to people aged 18 and over. We cannot create an account for you at this time.
          </p>
        </div>
      </div>

      <button class="btn btn-primary btn-full btn-lg" id="signup-btn" onclick="window.kinSubmitSignup()">
        Continue
      </button>
      <div class="steps">
        <div class="step-dot active"></div>
        <div class="step-dot"></div>
        <div class="step-dot"></div>
      </div>
      <p class="text-muted text-small mt-lg" style="text-align:center;">
        Already have an account?
        <span class="text-accent" style="cursor:pointer;" onclick="window.kinNavigate('login')">Log in</span>
      </p>
    </div>
  </main>`;
}

// ── Signup blocked (underage) ──
export function renderSignupBlocked() {
  return `
  <main>
    <nav class="nav"><span class="nav-logo">Kin</span></nav>
    <div class="screen-body" style="text-align:center;padding-top:48px;">
      <div style="width:60px;height:60px;border-radius:50%;background:var(--red-bg);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
        <i class="ti ti-lock" aria-hidden="true" style="font-size:26px;color:var(--red-dark);"></i>
      </div>
      <h2 style="margin-bottom:8px;">You must be 18 or older</h2>
      <p class="text-muted" style="font-size:14px;line-height:1.6;max-width:280px;margin:0 auto 28px;">
        Kin is designed for adults. You need to be at least 18 years old to create an account and join communities.
      </p>
      <button class="btn" onclick="window.kinNavigate('signup')">Go back</button>
    </div>
  </main>`;
}

// ── Pick interests ──
export function renderInterests() {
  // Store pending profile data (set during signup) so we can save on submit
  const chips = INTERESTS.map(i =>
    `<span class="interest-chip" onclick="this.classList.toggle('selected')">${escapeHtml(i)}</span>`
  ).join('');

  return `
  <main>
    <nav class="nav"><span class="nav-logo">Kin</span></nav>
    <div class="screen-body">
      <h2 style="margin-bottom:4px;">What are you into?</h2>
      <p class="text-muted text-small mb-lg">Pick a few things you love. You can always add more later.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px;">
        ${chips}
      </div>
      <div id="interests-error" class="card-danger mb-lg" style="display:none;">
        <p style="font-size:13px;color:var(--red-dark);">Something went wrong saving your profile. Please try again.</p>
      </div>
      <button class="btn btn-primary btn-full btn-lg" id="interests-btn" onclick="window.kinSaveInterests()">
        Join Kin <i class="ti ti-arrow-right" aria-hidden="true"></i>
      </button>
      <div class="steps">
        <div class="step-dot"></div>
        <div class="step-dot active"></div>
        <div class="step-dot"></div>
      </div>
    </div>
  </main>`;
}

// ── Login ──
export function renderLogin() {
  return `
  <main>
    <nav class="nav"><span class="nav-logo">Kin</span></nav>
    <div class="screen-body">
      <h2 style="margin-bottom:4px;">Welcome back</h2>
      <p class="text-muted text-small mb-lg">Good to see you again.</p>

      <div id="login-error" class="card-danger mb-lg" style="display:none;">
        <div style="display:flex;gap:9px;align-items:flex-start;">
          <i class="ti ti-alert-triangle" aria-hidden="true" style="font-size:16px;color:var(--red-dark);flex-shrink:0;margin-top:1px;"></i>
          <p id="login-error-msg" style="font-size:13px;color:var(--red-dark);line-height:1.5;"></p>
        </div>
      </div>

      <div class="field">
        <label class="field-label" for="login-email">Email</label>
        <input type="email" id="login-email" placeholder="you@email.com" autocomplete="email"
               onkeydown="if(event.key==='Enter')window.kinSubmitLogin()" />
      </div>
      <div class="field">
        <label class="field-label" for="login-password">Password</label>
        <input type="password" id="login-password" placeholder="Your password" autocomplete="current-password"
               onkeydown="if(event.key==='Enter')window.kinSubmitLogin()" />
      </div>
      <button class="btn btn-primary btn-full btn-lg mt-md" id="login-btn" onclick="window.kinSubmitLogin()">
        Log in
      </button>
      <p class="text-muted text-small mt-lg" style="text-align:center;">
        No account yet?
        <span class="text-accent" style="cursor:pointer;" onclick="window.kinNavigate('signup')">Sign up</span>
      </p>
    </div>
  </main>`;
}

// ── Event handlers ──
export function initAuthHandlers() {
  // Track selected account type
  window.__accountType = 'individual';

  window.kinSetAccountType = (type) => {
    window.__accountType = type;
    const isBusiness = type === 'business';

    const indBtn  = document.getElementById('type-individual');
    const bizBtn  = document.getElementById('type-business');
    const indFields = document.getElementById('individual-fields');
    const bizFields = document.getElementById('business-fields');
    const dobField  = document.getElementById('dob-field');
    const ageRow    = document.getElementById('check-age-row');

    if (indBtn) {
      indBtn.style.borderColor = isBusiness ? 'var(--border)' : 'var(--accent)';
      indBtn.style.background  = isBusiness ? 'var(--bg)' : 'var(--accent-bg)';
      indBtn.style.color       = isBusiness ? 'var(--muted)' : '';
    }
    if (bizBtn) {
      bizBtn.style.borderColor = isBusiness ? 'var(--accent)' : 'var(--border)';
      bizBtn.style.background  = isBusiness ? 'var(--accent-bg)' : 'var(--bg)';
      bizBtn.style.color       = isBusiness ? '' : 'var(--muted)';
    }
    if (indFields) indFields.style.display = isBusiness ? 'none' : 'block';
    if (bizFields) bizFields.style.display = isBusiness ? 'block' : 'none';
    if (dobField)  dobField.style.display  = isBusiness ? 'none' : 'block';
    if (ageRow)    ageRow.style.display    = isBusiness ? 'none' : 'flex';
  };

  window.kinCheckAge = () => {
    const dob = document.getElementById('signup-dob')?.value;
    const errorEl = document.getElementById('age-error');
    const blockEl = document.getElementById('underage-block');
    if (!dob || !errorEl || !blockEl) return;
    const age = calculateAge(dob);
    const under = age !== null && age < 18;
    errorEl.style.display = under ? 'flex' : 'none';
    blockEl.style.display = under ? 'flex' : 'none';
  };

  window.kinSubmitSignup = async () => {
    const isBusiness = window.__accountType === 'business';
    const errEl  = document.getElementById('auth-error');
    const errMsg = document.getElementById('auth-error-msg');
    const showError = (msg) => {
      if (errEl && errMsg) { errMsg.textContent = msg; errEl.style.display = 'flex'; }
    };

    const email    = document.getElementById('signup-email')?.value.trim();
    const password = document.getElementById('signup-password')?.value;
    const city     = document.getElementById('signup-city')?.value.trim() || 'Vienna';

    let name, businessName, businessType;

    if (isBusiness) {
      businessName = document.getElementById('signup-business-name')?.value.trim();
      businessType = document.getElementById('signup-business-type')?.value;
      name = businessName;
      if (!businessName) { showError('Please enter your business name.'); return; }
      if (!businessType) { showError('Please select your business type.'); return; }
    } else {
      name = document.getElementById('signup-name')?.value.trim();
      const dob = document.getElementById('signup-dob')?.value;
      const age = calculateAge(dob);
      if (age !== null && age < 18) { navigate('signup-blocked'); return; }
      if (!name) { showError('Please enter your first name.'); return; }
    }

    if (!email || !password) { showError('Please fill in your email and password.'); return; }

    const btn = document.getElementById('signup-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating account…'; }

    const colors = ['sage', 'lav', 'peach', 'amber'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      showError(error.message);
      if (btn) { btn.disabled = false; btn.textContent = 'Continue'; }
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      await supabase.from('profiles').insert({
        id:            userId,
        name,
        city,
        avatar_color:  avatarColor,
        interests:     [],
        is_business:   isBusiness,
        business_name: businessName || '',
        business_type: businessType || '',
      });
      state.user = {
        id: userId, name, city, interests: [],
        initials: name[0].toUpperCase(), avatarColor,
        isBusiness, businessName, businessType,
      };
    }

    navigate('interests');
  };

  window.kinSaveInterests = async () => {
    const selected = [...document.querySelectorAll('.interest-chip.selected')]
      .map(el => el.textContent.trim());

    const btn = document.getElementById('interests-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

    if (state.user?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({ interests: selected })
        .eq('id', state.user.id);

      if (error) {
        const el = document.getElementById('interests-error');
        if (el) el.style.display = 'flex';
        if (btn) { btn.disabled = false; btn.textContent = 'Join Kin →'; }
        return;
      }
      if (state.user) state.user.interests = selected;
    }

    navigate('dashboard');
  };

  window.kinSubmitLogin = async () => {
    const email    = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    const errEl    = document.getElementById('login-error');
    const errMsg   = document.getElementById('login-error-msg');
    const btn      = document.getElementById('login-btn');

    if (!email || !password) {
      if (errEl && errMsg) { errMsg.textContent = 'Please enter your email and password.'; errEl.style.display = 'flex'; }
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Logging in…'; }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (errEl && errMsg) { errMsg.textContent = error.message; errEl.style.display = 'flex'; }
      if (btn) { btn.disabled = false; btn.textContent = 'Log in'; }
      return;
    }

    // Load profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile) {
      state.user = {
        id:           data.user.id,
        name:         profile.name,
        city:         profile.city,
        interests:    profile.interests || [],
        initials:     profile.name[0].toUpperCase(),
        avatarColor:  profile.avatar_color  || 'sage',
        isBusiness:   profile.is_business   || false,
        businessName: profile.business_name || '',
        businessType: profile.business_type || '',
      };
    }

    navigate('dashboard');
  };
}
