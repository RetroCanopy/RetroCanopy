// Supabase Client Configuration
const SUPABASE_URL = 'https://axavvrqyzpwsczpiwmua.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4YXZ2cnF5enB3c2N6cGl3bXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMTA4MDksImV4cCI6MjEwNzU4NjgwOX0.XvOWwBlOBjGYxkQrD8eZvnaWaKb0qMW9HVtWhlnI6Yo';

function createRetroSupabaseClient() {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'rc_supabase_auth_token_v1'
    }
  });
}

window.db = (window.supabase) ? createRetroSupabaseClient() : null;
var db = window.db;

window.ensureSupabaseClient = function () {
  if (window.db) return Promise.resolve(window.db);
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.db = createRetroSupabaseClient();
    db = window.db;
    return Promise.resolve(window.db);
  }
  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-rc-supabase-sdk]');
    if (existing) {
      existing.addEventListener('load', () => {
        window.db = createRetroSupabaseClient();
        db = window.db;
        resolve(window.db);
      });
      existing.addEventListener('error', () => resolve(null));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.async = true;
    s.setAttribute('data-rc-supabase-sdk', '1');
    s.onload = () => {
      window.db = createRetroSupabaseClient();
      db = window.db;
      resolve(window.db);
    };
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
};
