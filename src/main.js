// ─── Kin — Main Entry Point ───
import { state, navigate, register, loadSession, MEMBERS_BY_CITY } from './utils/state.js';
import { supabase } from './lib/supabase.js';

// Screens
import { renderLanding, renderSignup, renderSignupBlocked, renderInterests, renderLogin, renderCompleteProfile, initAuthHandlers } from './screens/auth.js';
import { renderDashboard, renderExplore, renderNotifications, initDashboardHandlers } from './screens/dashboard.js';
import { renderCreateCommunity, initCreateCommunityHandlers } from './screens/create-community.js';
import { renderCommunity, initCommunityHandlers } from './screens/community.js';
import { renderEventDetail, renderCreateEvent, renderPastEvent, initEventHandlers } from './screens/events.js';
import { renderProfile, renderEditProfile, renderPrivacy, renderNotificationSettings, renderDeleteAccount, initProfileHandlers } from './screens/profile.js';
import { renderReportMember, renderReportMessage, renderReportSent, initReportHandlers } from './screens/reporting.js';
import { renderRecommendations, renderPostRecommendation, initRecommendationHandlers } from './screens/recommendations.js';
import { renderStammtisch } from './screens/stammtisch.js';
import { renderAdminPanel, initAdminHandlers } from './admin/admin.js';

// ── Register all routes ──
register('landing',               renderLanding);
register('signup',                renderSignup);
register('signup-blocked',        renderSignupBlocked);
register('interests',             renderInterests);
register('login',                 renderLogin);
register('complete-profile',      renderCompleteProfile);
register('recommendations',       renderRecommendations);
register('post-recommendation',   renderPostRecommendation);
register('stammtisch',            renderStammtisch);
register('dashboard',             renderDashboard);
register('explore',               renderExplore);
register('create-community',      renderCreateCommunity);
register('notifications',         renderNotifications);
register('community',             (p) => renderCommunity(p));
register('event-detail',          (p) => renderEventDetail(p));
register('create-event',          (p) => renderCreateEvent(p));
register('past-event',            (p) => renderPastEvent(p));
register('profile',               renderProfile);
register('edit-profile',          renderEditProfile);
register('privacy',               renderPrivacy);
register('notification-settings', renderNotificationSettings);
register('delete-account',        renderDeleteAccount);
register('report-member',         (p) => renderReportMember(p));
register('report-message',        (p) => renderReportMessage(p));
register('report-sent',           renderReportSent);
register('admin',                 () => renderAdminPanel());

// ── Sidebar helpers ──
const SCREEN_TO_NAV = {
  dashboard: 'dashboard', notifications: 'dashboard',
  'event-detail': 'dashboard', 'create-event': 'dashboard', 'past-event': 'dashboard',
  'report-member': 'dashboard', 'report-message': 'dashboard', 'report-sent': 'dashboard',
  explore: 'explore', community: 'explore', 'create-community': 'explore',
  recommendations: 'recommendations', 'post-recommendation': 'recommendations',
  stammtisch: 'stammtisch',
  profile: 'profile', 'edit-profile': 'profile', privacy: 'profile',
  'notification-settings': 'profile', 'delete-account': 'profile', 'complete-profile': 'profile',
};

function syncSideNav(screen) {
  const group = SCREEN_TO_NAV[screen] || screen;
  document.querySelectorAll('#side-nav .snav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === group);
  });
}

function updateSideNavUser() {
  const el = document.getElementById('snav-user-area');
  if (!el) return;
  const u = state.user;
  document.body.classList.toggle('biz', !!u?.isBusiness);
  if (!u) { el.innerHTML = ''; return; }
  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
  el.innerHTML = `<div class="snav-user" onclick="window.kinNavigate('profile')">
    <div class="avatar avatar-sm avatar-${u.avatarColor||'sage'}">${esc(u.initials||'?')}</div>
    <div>
      <div class="snav-user-name">${esc(u.name)}</div>
      <div class="snav-user-city">${esc(u.city)}</div>
    </div>
  </div>`;
}

// ── Global navigation ──
window.kinNavigate = (screen, params) => {
  window.__chatCleanup?.(); // unsubscribe any active chat realtime channel
  navigate(screen, params ? (typeof params === 'string' ? { id: params } : params) : {});
  syncSideNav(screen);
  updateSideNavUser();
  if (screen === 'admin') {
    initAdminHandlers();
    window.kinAdminNav('queue');
  }
};

// ── Expose data for filter handlers ──
window._kinData = { MEMBERS_BY_CITY };

// ── Init all event handlers ──
initAuthHandlers();
initRecommendationHandlers();
initCommunityHandlers();
initEventHandlers();
initProfileHandlers();
initReportHandlers();
initAdminHandlers();
initDashboardHandlers();
initCreateCommunityHandlers();

// ── Listen for auth state changes (e.g. email confirmation, token refresh) ──
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    state.user = null;
    updateSideNavUser();
    window.kinNavigate('landing');
  }
});

// ── Bootstrap ──
const isAdmin = window.location.search.includes('admin') || window.location.pathname.includes('admin');
if (isAdmin) {
  navigate('admin');
} else {
  loadSession(supabase).then(user => {
    updateSideNavUser();
    if (user === 'needs-profile') {
      window.kinNavigate('complete-profile');
    } else if (user) {
      window.kinNavigate('dashboard');
    } else {
      window.kinNavigate('landing');
    }
  });
}
