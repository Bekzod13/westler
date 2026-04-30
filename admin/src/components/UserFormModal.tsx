import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { AdminUser } from '../types/admin'
import { ModalShell } from './ModalShell'

type Props = {
  open: boolean
  user: AdminUser | null
  onClose: () => void
  onSaved: () => void
}

export function UserFormModal({ open, user, onClose, onSaved }: Props) {
  const [name, setName] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setPassword('')
    if (user) {
      setName(user.name)
      setLogin(user.login)
    } else {
      setName('')
      setLogin('')
    }
  }, [open, user])

  if (!open) return null

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    try {
      if (user) {
        const body: { name?: string; login?: string; password?: string } = { name, login }
        if (password.trim().length > 0) {
          if (password.length < 8) {
            setError('Пароль не короче 8 символов')
            setSaving(false)
            return
          }
          body.password = password
        }
        await api.patch(`/admin/users/${user.id}`, body)
      } else {
        if (password.length < 8) {
          setError('Пароль не короче 8 символов')
          setSaving(false)
          return
        }
        await api.post('/admin/users', { name, login, password })
      }
      onSaved()
      onClose()
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? String((e as { response?: { data?: { message?: unknown } } }).response?.data?.message ?? '')
          : ''
      setError(msg || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell
      title={user ? 'Редактировать пользователя' : 'Новый пользователь'}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSubmit()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Логин</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Пароль {user ? '(оставьте пустым, чтобы не менять)' : ''}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            autoComplete="new-password"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </ModalShell>
  )
}
