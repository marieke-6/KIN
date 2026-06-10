// ─── Kin — Main Entry Point ───
import { state, navigate, register, loadSession, MEMBERS_BY_CITY } from './utils/state.js';
import { supabase } from './lib/supabase.js';

// Screens
import { renderLanding, renderSignup, renderSignupBlocked, renderInterests, renderLogin, initAuthHandlers } from './screens/auth.js';
import { renderDashboard, renderExplore, renderNotifications } from './screens/dashboard.js';
import { renderCommunity, initCommunityHandlers } from './screens/community.js';
import { renderEventDetail, renderCreateEvent, renderPastEvent, initEventHandlers } from './screens/events.js';
import { renderProfile, renderEditProfile, renderPrivacy, renderNotificationSettings, renderDeleteAccount, initProfileHandlers } from './screens/profile.js';
import { renderReportMember, renderReportMessage, renderReportSent, initReportHandlers } from './screens/reporting.js';
import { renderAdminPanel, initAdminHandlers } from './admin/admin.js';

// ── Register all routes ──
register('landing',               renderLanding);
register('signup',                renderSignup);
register('signup-blocked',        renderSignupBlocked);
register('interests',             renderInterests);
register('login',                 renderLogin);
register('dashboard',             renderDashboard);
register('explore',               renderExplore);
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

// ── Global navigation ──
window.kinNavigate = (screen, params) => {
  navigate(screen, params ? (typeof params === 'string' ? { id: params } : params) : {});
  if (screen === 'admin') {
    initAdminHandlers();
    window.kinAdminNav('queue');
  }
};

// ── Expose data for filter handlers ──
window._kinData = { MEMBERS_BY_CITY };

// ── Init all event handlers ──
initAuthHandlers();
initCommunityHandlers();
initEventHandlers();
initProfileHandlers();
initReportHandlers();
initAdminHandlers();

// ── Listen for auth state changes (e.g. email confirmation, token refresh) ──
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    state.user = null;
    navigate('landing');
  }
});

// ── Bootstrap ──
const isAdmin = window.location.search.includes('admin') || window.location.pathname.includes('admin');
if (isAdmin) {
  navigate('admin');
} else {
  // Check for existing session before showing landing
  loadSession(supabase).then(user => {
    if (user) {
      navigate('dashboard');
    } else {
      navigate('landing');
    }
  });
}
