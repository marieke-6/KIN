// ─── Stammtisch Screen ───
import { bottomNav } from '../utils/helpers.js';

export function renderStammtisch() {
  return `
  <main>
    <nav class="nav">
      <span class="nav-logo">Kin</span>
    </nav>

    <div style="padding:14px 16px 10px;">
      <h2 style="font-size:18px;font-weight:600;margin-bottom:4px;">Stammtisch</h2>
      <p class="text-muted text-small">A regular table. Show up, meet people.</p>
    </div>

    <div style="padding:0 16px 40px;display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:60px;">
      <div style="width:64px;height:64px;border-radius:18px;background:var(--amber-light,#fef3c7);display:flex;align-items:center;justify-content:center;margin-bottom:18px;">
        <i class="ti ti-beer" style="font-size:30px;color:var(--amber-dark,#92400e);"></i>
      </div>
      <p class="fw-500" style="font-size:17px;margin-bottom:8px;">Coming soon</p>
      <p class="text-muted text-small" style="max-width:260px;line-height:1.6;">The Stammtisch feature is in the works. It'll be a way to join a regular casual meetup in your city — no agenda, just good people and good conversation.</p>
    </div>

    ${bottomNav('stammtisch')}
  </main>`;
}
