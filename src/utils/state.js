// ─── Kin App State ───
export const state = {
  // Current user (set from Supabase session + profiles table)
  // shape: { id, name, city, interests, initials, avatarColor }
  user: null,

  // Currently active screen (user-facing app)
  currentScreen: 'landing',

  // Currently active admin screen
  currentAdminScreen: 'queue',

  // Whether we're in admin mode
  isAdmin: false,

  // Selected city filter (for community/event filtering)
  selectedCity: null,

  // Active community tab
  communityTab: 'chat',
};

// ─── Sample data ───
// Replace with API calls in production

export const INTERESTS = [
  'Running','Hiking','Painting','Cooking','Volleyball',
  'Yoga','Photography','Chess','Cycling','Board games',
  'Book club','Dancing','Climbing','Swimming','Film club',
];

export const COMMUNITIES = {
  'board-games': {
    id: 'board-games',
    name: 'Board games',
    icon: 'ti-chess',
    color: 'amber',
    cities: {
      Vienna:    { members: 41, active: 28, events: 6 },
      Graz:      { members: 18, active: 11, events: 3 },
      Innsbruck: { members: 12, active: 8,  events: 2 },
      Salzburg:  { members: 24, active: 15, events: 4 },
    },
  },
  'running': {
    id: 'running',
    name: 'Running',
    icon: 'ti-run',
    color: 'sage',
    cities: {
      Vienna:    { members: 34, active: 25, events: 4 },
      Graz:      { members: 15, active: 9,  events: 2 },
      Innsbruck: { members: 20, active: 14, events: 3 },
      Salzburg:  { members: 19, active: 12, events: 3 },
    },
  },
  'painting': {
    id: 'painting',
    name: 'Painting',
    icon: 'ti-palette',
    color: 'lav',
    cities: {
      Vienna:    { members: 18, active: 12, events: 2 },
      Graz:      { members: 10, active: 6,  events: 1 },
      Innsbruck: { members: 8,  active: 5,  events: 1 },
      Salzburg:  { members: 14, active: 9,  events: 2 },
    },
  },
};

export const EVENTS_BY_CITY = {
  Vienna: [
    {
      id: 'ev1',
      community: 'board-games',
      title: 'Wingspan night — Oceania expansion',
      day: '14', mon: 'JUN', time: '3:00 PM',
      districtOnly: 'Mariahilf district',
      fullAddress: 'Schleifmühlgasse 14, Top 3, 1040 Wien',
      addressNote: 'Shared by Rudi · Ring the top buzzer',
      going: 5, max: 5,
      rsvpd: true,
      privateChatMessages: [
        { name: 'Rudi',  init: 'R', color: 'amber', text: 'Hey everyone! Ring the top buzzer when you arrive. I\'ll have snacks ready from 2:45' },
        { name: 'Kai',   init: 'K', color: 'lav',   text: 'Perfect, bringing the Wingspan app for scoring too' },
        { name: 'Nina',  init: 'N', color: 'peach',  text: 'See you all there!' },
      ],
    },
    {
      id: 'ev2',
      community: 'board-games',
      title: 'Strategy night — Terraforming Mars',
      day: '20', mon: 'JUN', time: '6:30 PM',
      districtOnly: '1st district',
      fullAddress: 'Rotenturmstraße 7, Top 12, 1010 Wien',
      addressNote: 'Shared by organiser · Buzz apartment 12',
      going: 4, max: 8,
      rsvpd: false,
      privateChatMessages: [
        { name: 'Elena', init: 'E', color: 'amber', text: 'Welcome everyone! It\'s the door on the right side. Buzz apartment 12.' },
      ],
    },
    {
      id: 'ev3',
      community: 'running',
      title: 'Morning run — Prater',
      day: '14', mon: 'JUN', time: '7:00 AM',
      districtOnly: 'Prater area',
      fullAddress: 'Prater Hauptallee, main entrance',
      addressNote: 'Meet at the big fountain',
      going: 12, max: 20,
      rsvpd: true,
      privateChatMessages: [
        { name: 'Thomas', init: 'T', color: 'sage', text: 'Meet at the main fountain at 7am sharp!' },
        { name: 'Sophie', init: 'S', color: 'lav',  text: 'I\'ll be there with my running vest on' },
      ],
    },
  ],
  Graz: [
    {
      id: 'ev4',
      community: 'board-games',
      title: 'Catan tournament',
      day: '16', mon: 'JUN', time: '4:00 PM',
      districtOnly: 'Lendplatz area',
      fullAddress: 'Spielecafé Graz, Lendplatz 11, 8020 Graz',
      addressNote: 'Ring bell for Spielecafé',
      going: 6, max: 8,
      rsvpd: false,
      privateChatMessages: [],
    },
  ],
  Innsbruck: [
    {
      id: 'ev5',
      community: 'board-games',
      title: 'Ticket to Ride Alps edition',
      day: '18', mon: 'JUN', time: '5:00 PM',
      districtOnly: 'Innsbruck centre',
      fullAddress: 'Café Munding, Kiebachgasse 16, 6020 Innsbruck',
      addressNote: 'Ask for the back room',
      going: 3, max: 6,
      rsvpd: false,
      privateChatMessages: [],
    },
  ],
  Salzburg: [
    {
      id: 'ev6',
      community: 'board-games',
      title: 'D&D one-shot',
      day: '13', mon: 'JUN', time: '2:00 PM',
      districtOnly: 'Altstadt',
      fullAddress: 'Spielraum Salzburg, Griesgasse 23, 5020 Salzburg',
      addressNote: 'First floor, door on the left',
      going: 5, max: 6,
      rsvpd: false,
      privateChatMessages: [],
    },
  ],
};

export const MEMBERS_BY_CITY = {
  Vienna: [
    { init:'K', name:'Kai',     color:'lav',   status:'green', last:'3 days ago',    joined:'8 months ago' },
    { init:'N', name:'Nina',    color:'peach',  status:'green', last:'1 week ago',    joined:'5 months ago' },
    { init:'R', name:'Rudi',    color:'amber',  status:'green', last:'2 weeks ago',   joined:'1 year ago', suspended: true },
    { init:'M', name:'Marieke', color:'sage',   status:'green', last:'Joined today',  joined:'Today', you: true },
    { init:'T', name:'Thomas',  color:'sage',   status:'amber', last:'6 weeks ago',   joined:'7 months ago' },
    { init:'E', name:'Elena',   color:'lav',    status:'amber', last:'2 months ago',  joined:'10 months ago' },
    { init:'S', name:'Sophie',  color:'peach',  status:'red',   last:'4 months ago',  joined:'1 year ago' },
    { init:'J', name:'Jonas',   color:'amber',  status:'gray',  last:'Never attended',joined:'3 months ago' },
  ],
  Graz: [
    { init:'A', name:'Anna',  color:'sage',  status:'green', last:'4 days ago',   joined:'6 months ago' },
    { init:'B', name:'Bernd', color:'lav',   status:'green', last:'1 week ago',   joined:'3 months ago' },
    { init:'C', name:'Clara', color:'amber', status:'amber', last:'5 weeks ago',  joined:'8 months ago' },
    { init:'D', name:'David', color:'peach', status:'red',   last:'5 months ago', joined:'1 year ago' },
  ],
  Innsbruck: [
    { init:'L', name:'Lukas',  color:'sage',  status:'green', last:'2 days ago',  joined:'4 months ago' },
    { init:'H', name:'Hannah', color:'lav',   status:'green', last:'3 weeks ago', joined:'2 months ago' },
    { init:'F', name:'Franz',  color:'amber', status:'gray',  last:'Never attended', joined:'1 month ago' },
  ],
  Salzburg: [
    { init:'P', name:'Paul',  color:'sage',  status:'green', last:'1 week ago',   joined:'9 months ago' },
    { init:'I', name:'Irma',  color:'lav',   status:'amber', last:'7 weeks ago',  joined:'11 months ago' },
    { init:'G', name:'Georg', color:'peach', status:'red',   last:'4 months ago', joined:'1 year ago' },
    { init:'V', name:'Vera',  color:'amber', status:'gray',  last:'Never attended', joined:'2 months ago' },
  ],
};

export const MOD_QUEUE = [
  {
    id: 'r1',
    type: 'safety',
    priority: 'high',
    label: 'Safety concern — feels unsafe',
    reported: 'Rudi',
    reportedInit: 'R',
    reportedColor: 'amber',
    community: 'Board games Vienna',
    time: '1 hour ago',
    reportedBy: 'Marieke',
    autoSuspended: true,
    message: '"Hey, want to meet up separately before the event? I know a quiet place..."',
    messageMeta: 'Board games chat · 09 Jun · 10:38',
    memberHistory: { reports: 0, events: 14, joined: '1 year ago' },
  },
  {
    id: 'r2',
    type: 'inappropriate',
    priority: 'medium',
    label: 'Inappropriate messages',
    reported: 'Jonas',
    reportedInit: 'J',
    reportedColor: 'lav',
    community: 'Running Vienna',
    time: '4 hours ago',
    reportedBy: 'Sophie',
    autoSuspended: false,
    message: '"You\'re way too slow for this group, maybe try walking instead lol"',
    messageMeta: 'Running chat · 09 Jun · 08:15',
    memberHistory: { reports: 1, events: 3, joined: '3 months ago' },
  },
  {
    id: 'r3',
    type: 'spam',
    priority: 'low',
    label: 'Spam / self-promotion',
    reported: 'Alex',
    reportedInit: 'A',
    reportedColor: 'sage',
    community: 'Painting Vienna',
    time: '1 day ago',
    reportedBy: 'Lena',
    autoSuspended: false,
    message: '"Check out my Etsy shop for handmade brushes! 20% off this week 🎨"',
    messageMeta: 'Painting chat · 08 Jun · 14:22',
    memberHistory: { reports: 0, events: 2, joined: '2 months ago' },
  },
];

export const AUDIT_LOG = [
  { action: 'Auto-suspension triggered — Rudi',          actor: 'System',    date: '09 Jun 10:42', type: 'auto',    pill: 'pill-red',    label: 'Auto' },
  { action: 'Warning issued — Jonas',                     actor: 'Marieke',   date: '08 Jun 15:30', type: 'warning', pill: 'pill-orange', label: 'Warning' },
  { action: 'Report dismissed — no violation — Tom',      actor: 'Colleague', date: '07 Jun 11:15', type: 'dismiss', pill: 'pill-gray',   label: 'Dismissed' },
  { action: 'Permanent ban — Peter',                      actor: 'Marieke',   date: '02 Jun 09:05', type: 'ban',     pill: 'pill-red',    label: 'Banned' },
  { action: 'Removed from community — Anna (Cooking)',    actor: 'Colleague', date: '01 Jun 14:22', type: 'remove',  pill: 'pill-orange', label: 'Removed' },
];

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/**
 * Loads the current Supabase session and fetches the profile.
 * Sets state.user and returns the user object, or null if not signed in.
 */
export async function loadSession(supabase) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!profile) {
    // Session exists but no profile — sign out and start fresh
    await supabase.auth.signOut();
    return null;
  }

  state.user = {
    id:           session.user.id,
    name:         profile.name,
    city:         profile.city,
    interests:    profile.interests || [],
    initials:     profile.name[0].toUpperCase(),
    avatarColor:  profile.avatar_color || 'sage',
    isBusiness:   profile.is_business   || false,
    businessName: profile.business_name || '',
    businessType: profile.business_type || '',
  };
  return state.user;
}

// ─── Router ───
const routes = {};

export function register(screenId, renderFn) {
  routes[screenId] = renderFn;
}

export function navigate(screenId, params = {}) {
  window.__afterNavigate = null;
  state.currentScreen = screenId;
  state.routeParams = params;
  const app = document.getElementById('app');
  if (!app) return;
  const fn = routes[screenId];
  if (!fn) { console.warn(`No route for: ${screenId}`); return; }
  try {
    app.innerHTML = fn(params);
  } catch (err) {
    console.error(`[navigate] render error for screen "${screenId}":`, err);
    app.innerHTML = `<main><div style="padding:24px 16px;"><p class="text-muted">Something went wrong loading this screen.</p><button class="btn btn-primary" onclick="window.kinNavigate('dashboard')" style="margin-top:12px;">Back to home</button></div></main>`;
  }
  window.scrollTo(0, 0);
  document.querySelectorAll('.bnav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === screenId);
  });
  // Allow screens to register an async post-render initialiser
  if (typeof window.__afterNavigate === 'function') window.__afterNavigate();
}

export function navigateAdmin(screenId) {
  state.currentAdminScreen = screenId;
  document.querySelectorAll('.admin-screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(`admin-${screenId}`);
  if (el) el.classList.add('active');
  document.querySelectorAll('.admin-sidebar-item').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === screenId);
  });
}
