import axios from 'axios'
import { type FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { adminLogin } from '../lib/api'
import { setAdminToken } from '../lib/auth'

function formatLoginError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const msg = e.response?.data
    if (msg && typeof msg === 'object' && 'message' in msg) {
      const m = (msg as { message: unknown }).message
      if (typeof m === 'string') return m
      if (Array.isArray(m)) return m.join(', ')
    }
    if (e.response?.status === 401) return 'Неверный логин или пароль'
  }
  return 'Не удалось войти. Проверьте API и сеть.'
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard'

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const l = login.trim()
    if (!l || !password) {
      setError('Введите логин и пароль')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const { access_token } = await adminLogin(l, password)
      setAdminToken(access_token)
      navigate(from, { replace: true })
    } catch (err) {
      setError(formatLoginError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Вход в админку</h1>
        <p className="mt-1 text-sm text-gray-500">
          Используйте учётную запись из таблицы пользователей. Первого пользователя создаёт сидер:{' '}
          <code className="rounded bg-gray-100 px-1">npm run db:seed</code> в каталоге backend.
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login" className="block text-sm font-medium text-gray-700">
              Логин
            </label>
            <input
              id="login"
              type="text"
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Вход…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
