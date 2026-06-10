// ─── Supabase Client ───
// Paste your credentials from the Supabase dashboard → Project Settings → API
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL      = 'https://pnwoglgfcietigysferv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBud29nbGdmY2lldGlneXNmZXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDE5MDcsImV4cCI6MjA5NjU3NzkwN30.RNY3jIu22phiNSDEl0hwpH62ZTUgLF925Qa71Ytyei8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
