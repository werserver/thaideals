// Admin credentials stored locally (not connected to any DB)
// Change these values to set your admin username and password
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "thaideals2026";

const AUTH_KEY = "aff-shop-admin-auth";

export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function isAdminLoggedIn(): boolean {
  try {
    const session = sessionStorage.getItem(AUTH_KEY);
    return session === "authenticated";
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
