// ============================================================
// CONFIGURATION SUPABASE
// ============================================================
// Remplacez les deux valeurs ci-dessous par celles de VOTRE projet :
// 1. Allez sur https://supabase.com → votre projet
// 2. Settings → API
// 3. Copiez "Project URL" et "anon public" key
// ============================================================

const SUPABASE_URL  = 'https://kqgaflvzmusgkfzhulas.supabase.co';
const SUPABASE_ANON = 'sb_publishable_bNrqCiVUw1sRyc2uFq3XpA__u8zwfau';

// Client Supabase (chargé via CDN dans index.html)
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
