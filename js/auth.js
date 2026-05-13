// ============================================================
// AUTHENTIFICATION
// ============================================================

// Hash SHA-256 avec sel (côté client)
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateSalt() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------- Inscription ----------
async function signup(username, password) {
  username = username.trim().toLowerCase();
  if (username.length < 3) throw new Error('Username trop court (min 3 caractères)');
  if (password.length < 6) throw new Error('Mot de passe trop court (min 6 caractères)');

  // Vérifier que le username n'existe pas
  const { data: existing } = await db
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existing) throw new Error('Ce username est déjà pris');

  const salt = generateSalt();
  const password_hash = await hashPassword(password, salt);

  const { data, error } = await db
    .from('users')
    .insert({ username, password_hash, salt })
    .select()
    .single();

  if (error) throw new Error(error.message);

  setCurrentUser(data);
  return data;
}

// ---------- Connexion ----------
async function login(username, password) {
  username = username.trim().toLowerCase();

  const { data: user, error } = await db
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!user) throw new Error('Username ou mot de passe incorrect');

  const computed = await hashPassword(password, user.salt);
  if (computed !== user.password_hash) {
    throw new Error('Username ou mot de passe incorrect');
  }

  setCurrentUser(user);
  return user;
}

// ---------- Session ----------
function setCurrentUser(user) {
  // Ne stocke pas le hash en session
  const safe = { id: user.id, username: user.username, created_at: user.created_at };
  sessionStorage.setItem('neuroreset_user', JSON.stringify(safe));
}

function getCurrentUser() {
  const raw = sessionStorage.getItem('neuroreset_user');
  return raw ? JSON.parse(raw) : null;
}

function logout() {
  sessionStorage.removeItem('neuroreset_user');
  window.location.reload();
}