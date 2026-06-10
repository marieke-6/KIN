// ─── Admin Panel ───
import { state, navigateAdmin, MOD_QUEUE, AUDIT_LOG } from '../utils/state.js';
import { avatar } from '../utils/helpers.js';

export function renderAdminPanel() {
  return `
  <div class="admin-wrap" id="admin-panel">
    ${renderAdminSidebar()}
    <div class="admin-content" id="admin-content">
      <div id="admin-queue"       class="admin-screen active">${renderAdminQueue()}</div>
      <div id="admin-review"      class="admin-screen">${renderAdminReview(MOD_QUEUE[0])}</div>
      <div id="admin-suspended"   class="admin-screen">${renderAdminSuspended()}</div>
      <div id="admin-audit"       class="admin-screen">${renderAdminAudit()}</div>
      <div id="admin-users"       class="admin-screen">${renderAdminUsers()}</div>
      <div id="admin-communities" class="admin-screen">${renderAdminCommunities()}</div>
      <div id="admin-resolved"    class="admin-screen">${renderAdminResolved()}</div>
    </div>
  </div>`;
}

function renderAdminSidebar() {
  const items = [
    { id:'queue',       icon:'ti-alert-circle',   label:'Queue',       badge:'3', badgeRed:true, section:'moderation' },
    { id:'suspended',   icon:'ti-lock',            label:'Suspended',   badge:'1', section:null },
    { id:'audit',       icon:'ti-clipboard-list',  label:'Audit log',   section:null },
    { id:'users',       icon:'ti-users',           label:'Users',       section:'platform' },
    { id:'communities', icon:'ti-layout-grid',     label:'Communities', section:null },
  ];

  let html = `
  <div style="display:flex;align-items:center;gap:7px;padding:6px 4px;margin-bottom:16px;">
    <div style="width:28px;height:28px;border-radius:7px;background:#3a3f52;display:flex;align-items:center;justify-content:center;">
      <i class="ti ti-shield" aria-hidden="true" style="font-size:15px;color:#8b9fc8;"></i>
    </div>
    <span style="font-size:14px;font-weight:500;color:var(--admin-text);">Kin Admin</span>
  </div>`;

  let lastSection = null;
  items.forEach(item => {
    if (item.section && item.section !== lastSection) {
      html += `<div class="admin-section-label">${item.section}</div>`;
      lastSection = item.section;
    }
    const badgeHtml = item.badge
      ? `<span style="margin-left:auto;background:${item.badgeRed?'#a32d2d':'#3a3f52'};color:${item.badgeRed?'white':'#8b9fc8'};font-size:10px;font-weight:500;padding:1px 6px;border-radius:8px;">${item.badge}</span>`
      : '';
    html += `
    <button class="admin-sidebar-item${item.id==='queue'?' active':''}" 
            data-screen="${item.id}"
            onclick="window.kinAdminNav('${item.id}')"
            aria-label="${item.label}">
      <i class="ti ${item.icon}" aria-hidden="true"></i>
      <span>${item.label}</span>
      ${badgeHtml}
    </button>`;
  });

  html += `
  <div style="margin-top:auto;padding-top:20px;">
    <div style="display:flex;align-items:center;gap:7px;padding:8px 4px;border-top:0.5px solid var(--admin-border);">
      <div style="width:26px;height:26px;border-radius:50%;background:#3a3f52;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;color:#8b9fc8;">M</div>
      <div>
        <p style="font-size:12px;color:var(--admin-text);">Marieke</p>
        <p style="font-size:10px;color:var(--admin-muted);">Admin</p>
      </div>
    </div>
    <button class="btn btn-sm btn-full mt-sm" onclick="window.kinNavigate('dashboard')" 
            style="font-size:11px;color:var(--admin-muted);border-color:var(--admin-border);">
      <i class="ti ti-arrow-left" aria-hidden="true"></i> Back to Kin
    </button>
  </div>`;

  return `<div class="admin-sidebar">${html}</div>`;
}

function renderAdminQueue() {
  const priorityColor = { high:'var(--red-dark)', medium:'var(--orange-dark)', low:'var(--muted)' };
  const priorityIcon  = { high:'ti-urgent', medium:'ti-message-report', low:'ti-speakerphone' };
  const priorityBg    = { high:'var(--red-dark)', medium:'var(--orange-bg)', low:'var(--bg)' };
  const priorityIconColor = { high:'white', medium:'var(--orange-dark)', low:'var(--muted)' };
  const pillClass = { high:'pill-red', medium:'pill-orange', low:'pill-gray' };

  const rows = MOD_QUEUE.map(r => `
    <div class="queue-row" onclick="window.kinAdminReview('${r.id}')">
      <div style="width:38px;height:38px;border-radius:9px;background:${priorityBg[r.priority]};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="ti ${priorityIcon[r.priority]}" aria-hidden="true" style="font-size:18px;color:${priorityIconColor[r.priority]};"></i>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:2px;">
          <span class="fw-500" style="font-size:14px;color:${priorityColor[r.priority]};">${r.label}</span>
          <span class="pill ${pillClass[r.priority]} text-tiny">${r.priority === 'high' ? 'High priority' : r.priority === 'medium' ? 'Medium' : 'Low'}</span>
          ${r.autoSuspended ? `<span class="pill pill-red text-tiny"><i class="ti ti-lock" aria-hidden="true"></i> Auto-suspended</span>` : ''}
        </div>
        <p class="text-tiny text-muted">Reported: ${r.reported} · ${r.community} · ${r.time}</p>
        <p class="text-tiny text-muted">Reported by: ${r.reportedBy}</p>
      </div>
      <i class="ti ti-chevron-right" aria-hidden="true" style="font-size:15px;color:var(--muted);flex-shrink:0;margin-top:2px;"></i>
    </div>`).join('');

  const recentResolved = [
    { label:'Permanent ban — Peter · Hiking Vienna', date:'2 Jun', pill:'pill-red', pillLabel:'Banned' },
    { label:'Warning issued — Anna · Cooking Vienna', date:'1 Jun', pill:'pill-orange', pillLabel:'Warning' },
    { label:'Report dismissed — Tom · Running Vienna', date:'31 May', pill:'pill-gray', pillLabel:'Dismissed' },
  ];

  return `
  <div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md);">
      <h2>Moderation queue</h2>
      <span class="pill pill-red">3 open</span>
    </div>
    <div style="display:flex;gap:9px;margin-bottom:var(--space-lg);">
      <div class="admin-stat-card"><div class="admin-stat-val">1</div><div class="admin-stat-lbl">Auto-suspended</div></div>
      <div class="admin-stat-card"><div class="admin-stat-val">2</div><div class="admin-stat-lbl">Pending review</div></div>
      <div class="admin-stat-card"><div class="admin-stat-val">12</div><div class="admin-stat-lbl">Resolved this week</div></div>
    </div>
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:var(--space-lg);">${rows}</div>

    <div class="section-label">Recently resolved</div>
    <div class="card" style="padding:0 var(--space-md);">
      ${recentResolved.map(r => `
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:0.5px solid var(--border);">
          <span class="pill ${r.pill} text-tiny">${r.pillLabel}</span>
          <div style="flex:1;"><p style="font-size:13px;color:var(--muted);">${r.label}</p><p class="text-tiny text-muted">${r.date}</p></div>
        </div>`).join('')}
    </div>
  </div>`;
}

function renderAdminReview(report) {
  if (!report) return '<p class="text-muted">Select a report to review.</p>';

  return `
  <div>
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:var(--space-md);">
      <button class="nav-back-btn" onclick="window.kinAdminNav('queue')" aria-label="Back" style="font-size:19px;color:var(--muted);cursor:pointer;border:none;background:none;">
        <i class="ti ti-arrow-left" aria-hidden="true"></i>
      </button>
      <h2>Review report</h2>
      <span class="pill pill-red text-tiny" style="margin-left:auto;">
        ${report.autoSuspended ? `<i class="ti ti-lock" aria-hidden="true"></i> ${report.reported} suspended` : 'Pending'}
      </span>
    </div>

    <div class="card-danger mb-md">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <i class="ti ti-urgent" aria-hidden="true" style="font-size:15px;color:var(--red-dark);"></i>
        <span class="fw-500 text-small text-danger">${report.label}${report.autoSuspended ? ' — auto-suspended on report' : ''}</span>
      </div>
      <p class="text-tiny text-muted">Reported by ${report.reportedBy} · ${report.community} · ${report.time}</p>
    </div>

    <div class="card mb-md">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        ${avatar(report.reportedInit, report.reportedColor, 'md')}
        <div style="flex:1;">
          <p class="fw-500" style="font-size:15px;">${report.reported}</p>
          <p class="text-tiny text-muted">Vienna · Member ${report.memberHistory.joined}</p>
        </div>
        ${report.autoSuspended ? `<span class="pill pill-red text-tiny">Suspended</span>` : ''}
      </div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;">
        <span class="pill pill-gray text-tiny">${report.memberHistory.reports} prior reports</span>
        <span class="pill pill-gray text-tiny">${report.memberHistory.events} events attended</span>
        ${report.autoSuspended ? `<span class="pill pill-red text-tiny">Suspended today</span>` : ''}
      </div>
    </div>

    <div class="section-label">Reported message</div>
    <div style="background:var(--bg);border-radius:0 var(--radius-md) var(--radius-md) 0;
                border-left:3px solid var(--red-border);padding:11px 13px;margin-bottom:var(--space-md);">
      <p class="text-tiny text-muted mb-sm">${report.messageMeta}</p>
      <p style="font-size:13px;line-height:1.5;">${report.message}</p>
    </div>

    <div class="field mb-md">
      <label class="field-label">Moderator notes (internal only)</label>
      <textarea rows="2" placeholder="Add notes before taking action..."></textarea>
    </div>

    <div class="section-label">Take action</div>
    <div style="display:flex;flex-direction:column;gap:8px;">
      <button class="btn btn-approve btn-full" style="justify-content:flex-start;gap:9px;" 
              onclick="window.kinAdminResolve('Suspension lifted — no violation found. ${report.reported} restored.')">
        <i class="ti ti-lock-open" aria-hidden="true" style="font-size:15px;"></i>
        Lift suspension — no violation found
      </button>
      <button class="btn btn-warn btn-full" style="justify-content:flex-start;gap:9px;" 
              onclick="window.kinAdminResolve('Warning issued to ${report.reported}. Suspension lifted.')">
        <i class="ti ti-alert-triangle" aria-hidden="true" style="font-size:15px;"></i>
        Issue warning + lift suspension
      </button>
      <button class="btn btn-warn btn-full" style="justify-content:flex-start;gap:9px;" 
              onclick="window.kinAdminResolve('${report.reported} removed from ${report.community}. Suspension lifted.')">
        <i class="ti ti-door-exit" aria-hidden="true" style="font-size:15px;"></i>
        Remove from community + lift suspension
      </button>
      <button class="btn btn-danger btn-full" style="justify-content:flex-start;gap:9px;" 
              onclick="window.kinAdminResolve('${report.reported} permanently banned from Kin.')">
        <i class="ti ti-ban" aria-hidden="true" style="font-size:15px;"></i>
        Ban permanently from Kin
      </button>
    </div>
  </div>`;
}

function renderAdminSuspended() {
  return `
  <div>
    <h2 style="margin-bottom:var(--space-md);">Suspended accounts</h2>
    <div class="admin-table mb-md">
      <div class="admin-table-header">
        <span style="flex:2;">Member</span>
        <span style="flex:2;">Reason</span>
        <span style="flex:1;">Suspended</span>
        <span style="flex:1;text-align:right;">Action</span>
      </div>
      <div class="admin-table-row">
        <div style="flex:2;display:flex;align-items:center;gap:8px;">
          ${avatar('R','amber','sm')}
          <span style="font-size:13px;">Rudi</span>
          <span class="pill pill-red text-tiny">Auto</span>
        </div>
        <span style="flex:2;font-size:12px;color:var(--muted);">Safety concern</span>
        <span style="flex:1;font-size:12px;color:var(--muted);">1h ago</span>
        <div style="flex:1;text-align:right;">
          <button class="btn btn-sm btn-lift" onclick="window.kinAdminNav('review')">Review</button>
        </div>
      </div>
    </div>
    <div class="banner banner-info">
      <i class="ti ti-info-circle" aria-hidden="true" style="font-size:15px;color:var(--blue-dark);flex-shrink:0;margin-top:1px;"></i>
      <p class="text-small text-muted" style="line-height:1.5;">
        Auto-suspensions are triggered instantly when a safety concern is reported. Only a moderator can lift or escalate them.
        The suspended user sees a generic notice and cannot identify who reported them.
      </p>
    </div>
  </div>`;
}

function renderAdminAudit() {
  const dotColor = { auto:'var(--red-dark)', warning:'var(--orange-dark)', dismiss:'var(--green-dark)', ban:'var(--red-dark)', remove:'var(--orange-dark)' };

  return `
  <div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md);">
      <h2>Audit log</h2>
      <button class="btn btn-sm" style="display:flex;align-items:center;gap:5px;">
        <i class="ti ti-download" aria-hidden="true" style="font-size:13px;"></i> Export
      </button>
    </div>
    <div class="card" style="padding:var(--space-md);">
      ${AUDIT_LOG.map(entry => `
        <div class="audit-row">
          <div class="audit-dot" style="background:${dotColor[entry.type]||'var(--muted)'};"></div>
          <div style="flex:1;">
            <p style="font-size:13px;">${entry.action}</p>
            <p class="text-tiny text-muted mt-sm">Reviewed by ${entry.actor} · ${entry.date}</p>
          </div>
          <span class="pill ${entry.pill} text-tiny">${entry.label}</span>
        </div>`).join('')}
    </div>
  </div>`;
}

function renderAdminUsers() {
  const users = [
    { init:'M', color:'sage',  name:'Marieke', city:'Vienna', joined:'Today',    status:'Active',    pill:'pill-green' },
    { init:'R', color:'amber', name:'Rudi',    city:'Vienna', joined:'1 yr ago', status:'Suspended', pill:'pill-red' },
    { init:'K', color:'lav',   name:'Kai',     city:'Vienna', joined:'8 mo ago', status:'Active',    pill:'pill-green' },
    { init:'P', color:'gray',  name:'Peter',   city:'Vienna', joined:'8 mo ago', status:'Banned',    pill:'pill-red' },
    { init:'S', color:'peach', name:'Sophie',  city:'Vienna', joined:'1 yr ago', status:'Active',    pill:'pill-green' },
  ];

  return `
  <div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md);">
      <h2>All users</h2>
      <span class="text-muted text-small">247 total</span>
    </div>
    <input type="text" placeholder="Search by name or city..." style="margin-bottom:var(--space-md);" />
    <div class="admin-table">
      <div class="admin-table-header">
        <span style="flex:2;">Name</span>
        <span style="flex:1;">City</span>
        <span style="flex:1;">Joined</span>
        <span style="flex:1;text-align:right;">Status</span>
      </div>
      ${users.map(u => `
        <div class="admin-table-row">
          <div style="flex:2;display:flex;align-items:center;gap:7px;">
            ${avatar(u.init, u.color, 'sm')}
            <span style="font-size:13px;">${u.name}</span>
          </div>
          <span style="flex:1;font-size:12px;color:var(--muted);">${u.city}</span>
          <span style="flex:1;font-size:12px;color:var(--muted);">${u.joined}</span>
          <div style="flex:1;text-align:right;"><span class="pill ${u.pill} text-tiny">${u.status}</span></div>
        </div>`).join('')}
    </div>
  </div>`;
}

function renderAdminCommunities() {
  const comms = [
    { icon:'ti-chess',   color:'var(--amber)',    name:'Board games — Vienna', members:41, reports:1, pillClass:'pill-orange', pillLabel:'1 report' },
    { icon:'ti-run',     color:'var(--sage)',     name:'Running — Vienna',     members:34, reports:1, pillClass:'pill-orange', pillLabel:'1 report' },
    { icon:'ti-palette', color:'var(--lav)',      name:'Painting — Vienna',    members:18, reports:0, pillClass:'pill-green',  pillLabel:'Clean' },
    { icon:'ti-mountain',color:'#e8f4e8',         name:'Hiking — Vienna',      members:21, reports:0, pillClass:'pill-green',  pillLabel:'Clean' },
  ];

  return `
  <div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md);">
      <h2>Communities</h2>
      <span class="text-muted text-small">18 total</span>
    </div>
    ${comms.map(c => `
      <div class="card card-clickable mb-md" style="display:flex;align-items:center;gap:11px;padding:11px 13px;">
        <div style="width:36px;height:36px;border-radius:9px;background:${c.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="ti ${c.icon}" aria-hidden="true" style="font-size:18px;color:rgba(0,0,0,0.5);"></i>
        </div>
        <div style="flex:1;">
          <p class="fw-500" style="font-size:14px;">${c.name}</p>
          <p class="text-tiny text-muted">${c.members} members · ${c.reports} open report${c.reports!==1?'s':''}</p>
        </div>
        <span class="pill ${c.pillClass} text-tiny">${c.pillLabel}</span>
      </div>`).join('')}
  </div>`;
}

function renderAdminResolved() {
  return `
  <div style="text-align:center;padding:48px 24px;">
    <div style="width:56px;height:56px;border-radius:50%;background:var(--green-bg);
                display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
      <i class="ti ti-check" aria-hidden="true" style="font-size:24px;color:var(--green-dark);"></i>
    </div>
    <h2 style="margin-bottom:6px;">Report resolved</h2>
    <p id="admin-resolve-msg" class="text-muted" style="font-size:13px;line-height:1.6;max-width:260px;margin:0 auto 6px;"></p>
    <p class="text-tiny text-muted mb-lg">Action logged. Reporter notified. Audit trail updated.</p>
    <button class="btn btn-primary btn-sm" onclick="window.kinAdminNav('queue')">Back to queue</button>
  </div>`;
}

export function initAdminHandlers() {
  window.kinAdminNav = (screen) => {
    navigateAdmin(screen);
  };

  window.kinAdminReview = (reportId) => {
    const report = MOD_QUEUE.find(r => r.id === reportId);
    if (!report) return;
    // Re-render the review panel with this specific report
    const el = document.getElementById('admin-review');
    if (el) el.innerHTML = renderAdminReview(report);
    navigateAdmin('review');
  };

  window.kinAdminResolve = (msg) => {
    const el = document.getElementById('admin-resolve-msg');
    if (el) el.textContent = msg;
    navigateAdmin('resolved');
  };
}
