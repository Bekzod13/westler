import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Language } from '../types/hero'
import { ModalShell } from './ModalShell'

type Props = {
  open: boolean
  language: Language | null
  onClose: () => void
  onSaved: () => void
}

export function LanguageFormModal({ open, language, onClose, onSaved }: Props) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (language) {
      setName(language.name)
      setCode(language.code)
      setIsDefault(language.isDefault)
      setIsActive(language.isActive)
    } else {
      setName('')
      setCode('')
      setIsDefault(false)
      setIsActive(true)
    }
  }, [open, language])

  if (!open) return null

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    try {
      const body = { name, code, isDefault, isActive }
      if (language) {
        await api.patch(`/admin/languages/${language.id}`, body)
      } else {
        await api.post('/admin/languages', body)
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
      title={language ? 'Редактировать язык' : 'Новый язык'}
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
            disabled={saving || (!language && !code.trim())}
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
          <label className="block text-sm font-medium text-gray-700">Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Код (en, ru, …)</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={!!language}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
          Язык по умолчанию
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Активен
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </ModalShell>
  )
}
