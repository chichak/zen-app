// ============================================================
// API BASE DE DONNÉES — Accès Supabase
// ============================================================

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

// ---------- Check-in du jour ----------
async function getTodayCheckin(userId) {
  const { data } = await db
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('date', todayStr())
    .maybeSingle();
  return data;
}

async function togglePrincipleDone(userId, principleId) {
  let checkin = await getTodayCheckin(userId);

  if (!checkin) {
    const { data, error } = await db
      .from('daily_checkins')
      .insert({
        user_id: userId,
        date: todayStr(),
        principles_completed: [principleId]
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const current = checkin.principles_completed || [];
  const updated = current.includes(principleId)
    ? current.filter(id => id !== principleId)
    : [...current, principleId];

  const { data, error } = await db
    .from('daily_checkins')
    .update({
      principles_completed: updated,
      updated_at: new Date().toISOString()
    })
    .eq('id', checkin.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function saveMood(userId, field, value) {
  let checkin = await getTodayCheckin(userId);
  if (!checkin) {
    const { data, error } = await db
      .from('daily_checkins')
      .insert({ user_id: userId, date: todayStr(), [field]: value })
      .select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await db
    .from('daily_checkins')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', checkin.id)
    .select().single();
  if (error) throw error;
  return data;
}

// ---------- Journal ----------
async function saveJournalEntry(userId, principleId, content) {
  const { data, error } = await db
    .from('journal_entries')
    .insert({ user_id: userId, principle_id: principleId, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getJournalEntries(userId, principleId = null, limit = 20) {
  let query = db
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (principleId) query = query.eq('principle_id', principleId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ---------- Sessions (timers) ----------
async function logSession(userId, sessionType, durationSec, principleId = null) {
  const { data, error } = await db
    .from('sessions')
    .insert({
      user_id: userId,
      session_type: sessionType,
      duration_sec: durationSec,
      principle_id: principleId
    })
    .select().single();
  if (error) throw error;

  // Mettre à jour le check-in du jour pour les minutes
  if (sessionType === 'meditation' || sessionType === 'visualization') {
    const minutes = Math.round(durationSec / 60);
    const field = sessionType === 'meditation' ? 'meditation_minutes' : 'visualization_minutes';
    const checkin = await getTodayCheckin(userId);
    const current = checkin?.[field] || 0;
    await saveMood(userId, field, current + minutes);
  }

  return data;
}

// ---------- Historique pour dashboard ----------
async function getCheckinHistory(userId, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await db
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .gte('date', since.toISOString().slice(0, 10))
    .order('date', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function getAllSessions(userId, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await db
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ---------- Calcul des streaks ----------
function calculateStreak(history) {
  if (!history || history.length === 0) return { current: 0, longest: 0 };

  // Une journée compte si au moins 1 principe pratiqué
  const validDays = history
    .filter(h => h.principles_completed && h.principles_completed.length > 0)
    .map(h => h.date)
    .sort();

  if (validDays.length === 0) return { current: 0, longest: 0 };

  // Streak actuel
  let current = 0;
  const today = todayStr();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const ystr = yesterday.toISOString().slice(0, 10);

  const lastDay = validDays[validDays.length - 1];
  if (lastDay === today || lastDay === ystr) {
    current = 1;
    for (let i = validDays.length - 2; i >= 0; i--) {
      const d1 = new Date(validDays[i + 1]);
      const d2 = new Date(validDays[i]);
      const diff = (d1 - d2) / (1000 * 60 * 60 * 24);
      if (diff === 1) current++;
      else break;
    }
  }

  // Plus long streak
  let longest = 1, run = 1;
  for (let i = 1; i < validDays.length; i++) {
    const d1 = new Date(validDays[i - 1]);
    const d2 = new Date(validDays[i]);
    const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
    if (diff === 1) { run++; longest = Math.max(longest, run); }
    else run = 1;
  }
  return { current, longest };
}