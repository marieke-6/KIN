// ─── Reporting Screens (User-facing) ───
import { state, navigate } from '../utils/state.js';
import { escapeHtml } from '../utils/helpers.js';

export function renderReportMember(params = {}) {
  const name = params.name || 'Kai';
  const init = params.init || 'K';
  const community = params.community || 'Board games — Vienna';

  const reasons = [
    { icon: 'ti-message-report', label: 'Inappropriate or offensive messages',  sub: 'Harassment, hate speech, or abusive language' },
    { icon: 'ti-user-x',         label: 'Suspicious or predatory behaviour',    sub: 'Targeting others, making people uncomfortable', danger: true },
    { icon: 'ti-ghost',          label: 'Fake identity or impersonation',       sub: 'Pretending to be someone else' },
    { icon: 'ti-speakerphone',   label: 'Spam or self-promotion',               sub: 'Advertising, links, or unsolicited content' },
    { icon: 'ti-shield-off',     label: 'Safety concern — feels unsafe',        sub: 'This person makes you feel threatened', danger: true, safety: true },
  ];

  const reasonHtml = reasons.map((r, i) => `
    <div class="report-option" onclick="window.kinSelectReason(this, ${i})" data-idx="${i}"
         style="${r.danger ? 'border-color:var(--red-border);' : ''}">
      <i class="ti ${r.icon}" aria-hidden="true" style="font-size:18px;color:${r.danger?'var(--red-dark)':'var(--muted)'};flex-shrink:0;"></i>
      <div>
        <p style="font-size:14px;color:${r.danger?'var(--red-dark)':'var(--text)'};font-weight:${r.danger?'500':'400'};">${r.label}</p>
        <p class="text-tiny text-muted mt-sm">${r.sub}</p>
      </div>
    </div>`).join('');

  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('dashboard')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <span class="fw-500" style="font-size:15px;">Report a member</span>
      </div>
    </nav>
    <div class="screen-body">
      <div style="display:flex;align-items:center;gap:10px;background:var(--bg);border-radius:var(--radius-md);padding:10px 12px;margin-bottom:var(--space-lg);">
        <div class="avatar avatar-sm avatar-lav">${init}</div>
        <div>
          <p class="fw-500" style="font-size:14px;">Reporting: ${escapeHtml(name)}</p>
          <p class="text-tiny text-muted">${community}</p>
        </div>
      </div>

      <p class="fw-500 mb-md">What's the issue?</p>
      ${reasonHtml}

      <button class="btn btn-danger btn-full mt-md" id="submit-report-btn" 
              disabled style="opacity:0.4;"
              onclick="window.kinSubmitReport()">
        Submit report
      </button>
    </div>
  </main>`;
}

export function renderReportMessage(params = {}) {
  const reasons = [
    { icon: 'ti-message-x',    label: 'Inappropriate or offensive' },
    { icon: 'ti-alert-triangle',label: 'Feels predatory or suspicious', danger: true },
    { icon: 'ti-speakerphone',  label: 'Spam or advertising' },
    { icon: 'ti-dots',          label: 'Other' },
  ];

  return `
  <main>
    <nav class="nav">
      <div class="nav-back">
        <button class="nav-back-btn" onclick="window.kinNavigate('dashboard')" aria-label="Back">
          <i class="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <span class="fw-500" style="font-size:15px;">Report a message</span>
      </div>
    </nav>
    <div class="screen-body">
      <p class="text-muted text-small mb-md">Reporting this message from the Board games community chat:</p>

      <div style="background:var(--bg);border-radius:0 var(--radius-md) var(--radius-md) 0;
                  border-left:3px solid var(--red-border);padding:11px 13px;margin-bottom:var(--space-lg);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
          <div class="avatar avatar-sm avatar-amber" style="width:22px;height:22px;font-size:10px;">R</div>
          <span class="fw-500 text-small">Rudi</span>
          <span class="text-tiny text-muted">Today 2:14 PM</span>
        </div>
        <p style="font-size:13px;line-height:1.5;">"Hey, want to meet up separately before the event? I know a quiet place..."</p>
      </div>

      <p class="fw-500 mb-md">Why are you reporting this?</p>
      ${reasons.map((r, i) => `
        <div class="report-option" onclick="window.kinSelectMsgReason(this, ${i})">
          <i class="ti ${r.icon}" aria-hidden="true" style="font-size:17px;color:${r.danger?'var(--red-dark)':'var(--muted)'};flex-shrink:0;"></i>
          <span style="font-size:14px;color:${r.danger?'var(--red-dark)':'var(--text)'};">${r.label}</span>
        </div>`).join('')}

      <div class="field mt-md">
        <label class="field-label">Add more context (optional)</label>
        <textarea rows="2" placeholder="Anything else we should know..."></textarea>
      </div>

      <label class="checkbox-row mb-lg mt-md">
        <input type="checkbox" id="block-check" />
        Also block this person — they won't see you or contact you
      </label>

      <button class="btn btn-danger btn-full" id="msg-report-btn" 
              disabled style="opacity:0.4;"
              onclick="window.kinNavigate('report-sent')">
        Submit report
      </button>
    </div>
  </main>`;
}

export function renderReportSent() {
  return `
  <main>
    <nav class="nav"><span class="nav-logo">Kin</span></nav>
    <div class="screen-body" style="text-align:center;padding-top:48px;">
      <div style="width:60px;height:60px;border-radius:50%;background:var(--green-bg);
                  display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
        <i class="ti ti-shield-check" aria-hidden="true" style="font-size:26px;color:var(--green-dark);"></i>
      </div>
      <h2 style="margin-bottom:8px;">Report received</h2>
      <p class="text-muted" style="font-size:14px;line-height:1.6;max-width:280px;margin:0 auto 8px;">
        Our moderation team will review this within 24 hours. The reported person won't know you reported them.
      </p>
      <p class="text-muted text-small" style="max-width:280px;margin:0 auto 28px;">
        If you feel unsafe, you can block this person immediately from their member profile.
      </p>

      <div class="banner banner-success mb-lg" style="text-align:left;">
        <i class="ti ti-lock" aria-hidden="true" style="font-size:16px;color:var(--green-dark);flex-shrink:0;margin-top:1px;"></i>
        <p class="text-small" style="color:var(--green-dark);line-height:1.5;">
          Because you flagged a safety concern, this member's account has been temporarily suspended while our team reviews the report. You are protected.
        </p>
      </div>

      <button class="btn btn-primary" onclick="window.kinNavigate('dashboard')">Back to Kin</button>
    </div>
  </main>`;
}

export function initReportHandlers() {
  window.kinSelectReason = (el, idx) => {
    document.querySelectorAll('.report-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    const btn = document.getElementById('submit-report-btn');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  };

  window.kinSelectMsgReason = (el, idx) => {
    document.querySelectorAll('.report-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    const btn = document.getElementById('msg-report-btn');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  };

  window.kinSubmitReport = () => {
    navigate('report-sent');
  };
}
