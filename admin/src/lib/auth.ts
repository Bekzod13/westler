const STORAGE_KEY = 'admin_token'

export function getAdminToken(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setAdminToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token)
}

export function clearAdminToken(): void {
  localStorage.removeItem(STORAGE_KEY)
}
