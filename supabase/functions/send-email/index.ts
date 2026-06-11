import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_KEY   = Deno.env.get('RESEND_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// From address — replace with your verified Resend domain once set up.
// While testing, use your own email or Resend's sandbox address.
const FROM = Deno.env.get('EMAIL_FROM') ?? 'Kin <onboarding@resend.dev>';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { action, event_id, actor_id } = await req.json();

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch event + organiser profile
    const { data: ev } = await admin
      .from('events')
      .select('title, event_date, district, created_by, profiles!events_created_by_fkey(name)')
      .eq('id', event_id)
      .single();

    if (!ev) return new Response('event not found', { status: 404, headers: CORS });

    const { data: { user: organiser } } = await admin.auth.admin.getUserById(ev.created_by);

    let to: string, subject: string, html: string;

    if (action === 'rsvp') {
      if (!organiser?.email) return new Response('ok', { headers: CORS });

      const { data: actor } = await admin.from('profiles').select('name').eq('id', actor_id).single();
      const d = new Date(ev.event_date + 'T00:00:00');
      const dateStr = d.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' });

      to      = organiser.email;
      subject = `New RSVP for "${ev.title}"`;
      html    = `
        <p style="font-family:sans-serif;">Hi ${(ev.profiles as any)?.name ?? 'there'},</p>
        <p style="font-family:sans-serif;">
          <strong>${actor?.name ?? 'Someone'}</strong> just RSVP'd to your event
          <strong>${ev.title}</strong> on ${dateStr}.
        </p>
        <p style="font-family:sans-serif;color:#888;font-size:13px;">— Kin</p>`;

    } else if (action === 'waitlist_open') {
      // actor_id = the waitlisted user who should now RSVP
      const { data: { user: waiter } } = await admin.auth.admin.getUserById(actor_id);
      if (!waiter?.email) return new Response('ok', { headers: CORS });

      to      = waiter.email;
      subject = `A spot opened for "${ev.title}"`;
      html    = `
        <p style="font-family:sans-serif;">Good news!</p>
        <p style="font-family:sans-serif;">
          A spot just opened up for <strong>${ev.title}</strong> in ${ev.district}.
          Open Kin to RSVP before it fills up again.
        </p>
        <p style="font-family:sans-serif;color:#888;font-size:13px;">— Kin</p>`;

    } else {
      return new Response('unknown action', { status: 400, headers: CORS });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });

    const body = await res.json();
    return new Response(JSON.stringify(body), {
      status: res.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('send-email error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
