
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mpvxwtkaranzckzogjgv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdnh3dGthcmFuemNrem9namd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTM2ODQsImV4cCI6MjA2Mjc4OTY4NH0.ZvXK5kkPWkHYTS4BxyRi-_-ws1xVg8hB-2RyJdpVaWA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
