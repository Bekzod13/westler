import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import type { AdminGroupItem, GroupItemTranslations } from '../types/admin'
import type { Language } from '../types/hero'
import { ModalShell } from './ModalShell'

function emptyT(languages: Language[]): GroupItemTranslations {
  const out: GroupItemTranslations = {}
  for (const lang of languages) {
    if (!lang.isActive) continue
    out[lang.code] = { title: '', subtitle: '' }
  }
  return out
}

function mergeT(item: AdminGroupItem, languages: Language[]): GroupItemTranslations {
  const base = emptyT(languages)
  for (const code of Object.keys(base)) {
    const row = item.translations[code]
    if (row) {
      base[code] = { title: row.title ?? '', subtitle: row.subtitle ?? '' }
    }
  }
  return base
}

type Props = {
  open: boolean
  groupId: number
  item: AdminGroupItem | null
  languages: Language[]
  onClose: () => void
  onSaved: () => void
}

export function GroupItemFormModal({
  open,
  groupId,
  item,
  languages,
  onClose,
  onSaved,
}: Props) {
  const activeLangs = useMemo(() => languages.filter((l) => l.isActive), [languages])

  const [sortOrder, setSortOrder] = useState(0)
  const [translations, setTranslations] = useState<GroupItemTranslations>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (item) {
      setSortOrder(item.sortOrder)
      setTranslations(mergeT(item, activeLangs))
    } else {
      setSortOrder(0)
      setTranslations(emptyT(activeLangs))
    }
  }, [open, item, activeLangs])

  if (!open) return null

  function updateField(code: string, field: 'title' | 'subtitle', value: string) {
    setTranslations((prev) => ({
      ...prev,
      [code]: { ...prev[code], [field]: value },
    }))
  }

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    try {
      if (item) {
        await api.patch(`/admin/groups/${groupId}/items/${item.id}`, {
          sortOrder,
          translations,
        })
      } else {
        await api.post(`/admin/groups/${groupId}/items`, {
          sortOrder: sortOrder || 0,
          translations,
        })
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
      title={item ? 'Элемент группы' : 'Новый элемент группы'}
      onClose={onClose}
      overlayClassName="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
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
            <label className="block text-sm font-medium text-gray-700">Порядок сортировки</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number.parseInt(e.target.value, 10) || 0)}
              className="mt-1 w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <p className="text-sm font-medium text-gray-800">Переводы (title / subtitle)</p>
            {activeLangs.map((lang) => (
              <div key={lang.code} className="rounded-lg border border-gray-100 p-3">
                <p className="mb-2 text-xs font-medium text-gray-600">
                  {lang.name} ({lang.code})
                </p>
                <label className="block text-xs text-gray-500">Заголовок</label>
                <input
                  type="text"
                  value={translations[lang.code]?.title ?? ''}
                  onChange={(e) => updateField(lang.code, 'title', e.target.value)}
                  className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <label className="block text-xs text-gray-500">Подзаголовок</label>
                <textarea
                  value={translations[lang.code]?.subtitle ?? ''}
                  onChange={(e) => updateField(lang.code, 'subtitle', e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
    </ModalShell>
  )
}
