const SUPABASE_URL = 'https://ebjgocpclrhbnhvlbwbb.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViamdvY3BjbHJoYm5odmxid2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjE0MjksImV4cCI6MjA5ODQ5NzQyOX0.41-JqbhQ5Pl3FDjtD_NYMfmlfaOV9VZuEK5aNXPy49Q';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);