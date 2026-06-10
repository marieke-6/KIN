// ─── Recommendations Screen ───
import { state, navigate } from '../utils/state.js';
import { bottomNav, escapeHtml } from '../utils/helpers.js';

export function renderRecommendations() {
  return `
  <main>
    <nav class="nav">
      <span class="nav-logo">Kin</span>
    </nav>

    <div style="padding:14px 16px 10px;">
      <h2 style="font-size:18px;font-weight:600;margin-bottom:4px;">Tips &amp; Recommendations</h2>
      <p class="text-muted text-small">Places, events and things worth knowing — from your community.</p>
    </div>

    <div style="padding:0 16px 16px;">

      <div class="banner banner-privacy mb-lg" style="margin-top:8px;">
        <i class="ti ti-info-circle" aria-hidden="true" style="font-size:16px;color:var(--accent);flex-shrink:0;"></i>
        <p class="text-tiny text-muted">Local businesses can post events and offers here. Community members can share their favourite spots.</p>
      </div>

      <div class="section-label" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span>Featured</span>
        ${state.user?.isBusiness ? `<button class="btn btn-primary btn-sm" onclick="window.kinNavigate('post-recommendation')"><i class="ti ti-plus" aria-hidden="true"></i> Post</button>` : ''}
      </div>

      <div class="card mb-md" style="display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <div style="width:36px;height:36px;border-radius:10px;background:var(--amber-light, #fef3c7);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="ti ti-building-store" style="font-size:18px;color:var(--amber-dark, #92400e);"></i>
          </div>
          <div>
            <p class="fw-500" style="font-size:14px;">Café Hawelka</p>
            <span class="pill pill-amber" style="font-size:10px;padding:2px 7px;">Business · Café</span>
          </div>
        </div>
        <p style="font-size:13px;line-height:1.5;">Every Sunday: live jazz from 7pm. Free entry for Kin members — just mention you're from the app. 1st district, Dorotheergasse 6.</p>
        <p class="text-tiny text-muted" style="margin-top:4px;">Vienna · Posted 2 days ago</p>
      </div>

      <div class="card mb-md" style="display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <div style="width:36px;height:36px;border-radius:10px;background:var(--sage-light, #d1fae5);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="ti ti-map-pin" style="font-size:18px;color:var(--accent);"></i>
          </div>
          <div>
            <p class="fw-500" style="font-size:14px;">Türkenschanzpark — hidden gem</p>
            <span class="pill pill-sage" style="font-size:10px;padding:2px 7px;">Community tip</span>
          </div>
        </div>
        <p style="font-size:13px;line-height:1.5;">Best spot for outdoor yoga or a slow morning run. Far fewer people than the Prater. Has a small lake and a café inside.</p>
        <p class="text-tiny text-muted" style="margin-top:4px;">Vienna · Shared by Kai · 5 days ago</p>
      </div>

      <div class="section-label" style="margin-bottom:10px;">Community picks</div>

      <div class="card mb-md" style="display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <div style="width:36px;height:36px;border-radius:10px;background:var(--lav-light, #ede9fe);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="ti ti-mug" style="font-size:18px;color:#7c3aed;"></i>
          </div>
          <div>
            <p class="fw-500" style="font-size:14px;">Kaffee &amp; Kuchen meetup spot</p>
            <span class="pill pill-lav" style="font-size:10px;padding:2px 7px;">Community tip</span>
          </div>
        </div>
        <p style="font-size:13px;line-height:1.5;">Café Schwarzenberg on the Ring has a quiet back room perfect for a group of 6–8. They don't mind if you stay for 2 hours.</p>
        <p class="text-tiny text-muted" style="margin-top:4px;">Vienna · Shared by Nina · 1 week ago</p>
      </div>

      <div style="text-align:center;padding:20px 0 8px;">
        <p class="text-muted text-small">More coming soon.</p>
        ${state.user && !state.user.isBusiness ? `<p class="text-tiny text-muted mt-sm">Have a tip to share? <span class="text-accent" style="cursor:pointer;">Coming soon →</span></p>` : ''}
      </div>

    </div>
    ${bottomNav('recommendations')}
  </main>`;
}
