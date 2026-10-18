// Supabase Client Configuration
const SUPABASE_URL = 'https://axavvrqyzpwsczpiwmua.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4YXZ2cnF5enB3c2N6cGl3bXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMTA4MDksImV4cCI6MjEwNzU4NjgwOX0.XvOWwBlOBjGYxkQrD8eZvnaWaKb0qMW9HVtWhlnI6Yo';

window.db = (window.supabase) ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
var db = window.db;
