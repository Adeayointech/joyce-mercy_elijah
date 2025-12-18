import { createClient } from '@supabase/supabase-js';

// Use environment variables for production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://atkfxowrwpeipjlzqiha.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0a2Z4b3dyd3BlaXBqbHpxaWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTk3OTAsImV4cCI6MjA4MTU3NTc5MH0.-TyNBTNuPAOyH5BhBDcQtxPFK1ktpneujPML9tW7zk0';

export const supabase = createClient(supabaseUrl, supabaseKey);
