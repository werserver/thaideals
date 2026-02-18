// Admin credentials — default generated on first use, overridable via localStorage
const DEFAULT_USERNAME = "admin";

function generateRandomPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
  const arr = new Uint8Array(20);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
}

// Generate a unique default password per browser instance (not hardcoded in source)
function getDefaultPassword(): string {
  const key = "aff-shop-default-pw-init";
  try {
    const stored = localStorage.getItem(key);
    if (stored) return stored;
  } catch {}
  const pw = generateRandomPassword();
  try { localStorage.setItem(key, pw); } catch {}
  return pw;
}

const AUTH_KEY = "aff-shop-admin-auth";
const CRED_KEY = "aff-shop-admin-cred";

interface Credentials {
  username: string;
  password: string;
}

function getCredentials(): Credentials {
  try {
    const raw = localStorage.getItem(CRED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { username: DEFAULT_USERNAME, password: getDefaultPassword() };
}

export function verifyCredentials(username: string, password: string): boolean {
  const cred = getCredentials();
  return username === cred.username && password === cred.password;
}

export function changePassword(currentPassword: string, newPassword: string): boolean {
  const cred = getCredentials();
  if (currentPassword !== cred.password) return false;
  localStorage.setItem(CRED_KEY, JSON.stringify({ ...cred, password: newPassword }));
  return true;
}

export function changeUsername(currentPassword: string, newUsername: string): boolean {
  const cred = getCredentials();
  if (currentPassword !== cred.password) return false;
  localStorage.setItem(CRED_KEY, JSON.stringify({ ...cred, username: newUsername }));
  return true;
}

export function getUsername(): string {
  return getCredentials().username;
}

export function isAdminLoggedIn(): boolean {
  try {
    return sessionStorage.getItem(AUTH_KEY) === "authenticated";
  } catch {
    return false;
  }
}

export function loginAdmin(): void {
  sessionStorage.setItem(AUTH_KEY, "authenticated");
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(AUTH_KEY);
}
