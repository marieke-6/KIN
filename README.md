# Kin — Find your people, nearby.

A community hub app for meeting like-minded people in your city. Built as a prototype — ready to wire up to a real backend.

## Quick start

```bash
# Install a simple dev server (no build step needed — it's vanilla JS with ES modules)
npm install -g serve

# Run locally
cd kin
serve .

# Or with any static server, e.g.:
npx http-server . -p 3000
```

Open `http://localhost:3000` in your browser.

For the **admin panel**, visit `http://localhost:3000?admin` or navigate from the landing screen.

---

## Project structure

```
kin/
├── index.html                  # Entry point
├── src/
│   ├── main.js                 # App bootstrap + router registration
│   ├── styles/
│   │   ├── tokens.css          # Design tokens (colors, spacing, radii)
│   │   ├── base.css            # Reset, typography, utilities
│   │   └── components.css      # All reusable UI components
│   ├── utils/
│   │   ├── state.js            # App state, sample data, router
│   │   └── helpers.js          # UI helper functions (avatar, navBar, etc.)
│   ├── screens/
│   │   ├── auth.js             # Landing, signup (with 18+ check), login, interests
│   │   ├── dashboard.js        # Dashboard, explore, notifications
│   │   ├── community.js        # Community hub (chat, events, members tabs)
│   │   ├── events.js           # Event detail, private chat, create event
│   │   ├── profile.js          # Profile, edit, privacy, notification settings
│   │   └── reporting.js        # Report member, report message, confirmation
│   └── admin/
│       └── admin.js            # Full admin panel (queue, suspended, audit, users)
```

---

## Key features built

### User app
- **Landing page** with community interest pills
- **Signup** with date of birth validation (18+ enforced), three consent checkboxes, city selection
- **Interest picker** on signup
- **Dashboard** with upcoming events, communities, and suggestions
- **Community hub** with city filter, chat tab, events tab (with capacity bars), members tab (with activity status dots and filter)
- **Event detail** — district only for non-RSVP, full address only after RSVP
- **Private event chat** — RSVP-gated, with address pinned at top, auto-deletion notice
- **Profile** with interests, communities, stats
- **Privacy settings** — toggles for visibility, locked auto-delete settings, data download, account deletion
- **Notification settings**
- **Report a member** — reason picker, safety reports auto-suspend
- **Report a message** — with block option
- **Report confirmation** — shows suspension status

### Admin panel (`?admin`)
- **Moderation queue** — sorted by priority, auto-suspended reports highlighted in red
- **Report review** — member history, reported message, graduated actions (lift / warn / remove / ban)
- **Suspended accounts** — view all auto-suspensions, one-click to review
- **Audit log** — every moderation action with actor, timestamp, exportable
- **Users** — searchable list with status (active / suspended / banned)
- **Communities** — overview with open report counts

---

## Connecting to a real backend

Everything in `src/utils/state.js` under `// Sample data` should be replaced with API calls.

Key endpoints you'll need:

| Action | Endpoint suggestion |
|--------|-------------------|
| Signup | `POST /auth/signup` |
| Login  | `POST /auth/login` |
| Get communities by city | `GET /communities?city=Vienna` |
| Get events by city | `GET /events?city=Vienna` |
| RSVP to event | `POST /events/:id/rsvp` |
| Send community message | `POST /communities/:id/messages` |
| Send event chat message | `POST /events/:id/chat` |
| Submit report | `POST /reports` |
| Admin: get queue | `GET /admin/reports?status=open` |
| Admin: take action | `PATCH /admin/reports/:id` |
| Auto-delete event chats | Scheduled job: run nightly, delete chats where `event.date < now - 24h` |

---

## Privacy & data notes

- **No photos** stored anywhere — avatars are initials only
- **First name only** — no surnames collected
- **City only** — no GPS, no precise location
- **Event addresses** — stored encrypted, only decrypted for RSVP'd attendees
- **Auto-deletion** — event chat data (messages + address) must be deleted by a scheduled backend job 24h after `event.endTime`
- **Age gate** — DOB validated on frontend AND must be re-validated server-side on signup
- **GDPR** — users can download their data and delete their account (endpoints needed)
- **Moderation audit log** — every action must be logged server-side with `moderatorId`, `action`, `timestamp`, `reportId`

---

## Tech stack

This prototype is **vanilla JS with ES modules** — no framework, no build step, intentionally simple.

When you're ready to scale up, recommended next steps:
- **Framework**: Svelte or Vue 3 (lightweight, good for mobile-first apps)
- **Backend**: Node.js + Express, or a BaaS like Supabase
- **Database**: PostgreSQL (for users, communities, events) + Redis (for ephemeral chat)
- **Auth**: Supabase Auth or Auth.js
- **Real-time chat**: Supabase Realtime or Socket.io
- **Scheduled jobs**: node-cron or a Supabase edge function for auto-deletion

---

Built with Claude. Ready for Claude Code. 🌿
