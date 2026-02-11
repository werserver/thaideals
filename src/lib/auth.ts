// Admin credentials — default values, overridable via localStorage
const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "Th@iD3als!2026#Sec";

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
  return { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
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
