import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qqdddixslbzgzweieqab.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZGRkaXhzbGJ6Z3p3ZWllcWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg0NDQsImV4cCI6MjA5MjM0NDQ0NH0.cJeZ8wo_V7Dmv_tX4JX0J3h5wx6SY8e1Q3-i1ywBIMo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
