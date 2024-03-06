import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sbolwlrqdkhzuaciiwtr.supabase.co'; // INPUT_REQUIRED {Replace with your actual Supabase project URL}
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNib2x3bHJxZGtoenVhY2lpd3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ0NjYwOTMsImV4cCI6MjAyMDA0MjA5M30.-Q1RTCL4lzsPuRxW2lQ5QLmszsNifMGX0rYNX1hZKYE'; // INPUT_REQUIRED {Replace with your actual Supabase anon/public key}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase client initialized');

export default supabase;