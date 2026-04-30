import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { TranslationRow } from '../types/admin'
import { ModalShell } from './ModalShell'

type Props = {
  open: boolean
  row: TranslationRow | null
  onClose: () => void
  onSaved: () => void
}

export function TranslationEditModal({ open, row, onClose, onSaved }: Props) {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !row) return
    setContent(row.content)
    setError(null)
  }, [open, row])

  if (!open || !row) return null

  async function handleSubmit() {
    if (!row) return
    setSaving(true)
    setError(null)
    try {
      await api.patch(`/admin/translations/${row.id}`, { content })
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
      title={`Перевод #${row.id}`}
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
            disabled={saving || !content.trim()}
            onClick={() => void handleSubmit()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      }
    >
      <div className="space-y-3 text-sm text-gray-700">
        <p>
          <span className="font-medium">Модель:</span> {row.modelType} #{row.modelId},{' '}
          <span className="font-medium">поле:</span> {row.field},{' '}
          <span className="font-medium">язык:</span> {row.language.code}
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700">Содержимое</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </ModalShell>
  )
}
