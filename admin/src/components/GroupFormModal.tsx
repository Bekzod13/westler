import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import type {
  AdminGroup,
  AdminGroupDetail,
  AdminGroupItem,
  GroupTranslations,
} from '../types/admin'
import type { Language } from '../types/hero'
import { GroupItemFormModal } from './GroupItemFormModal'
import { ModalShell } from './ModalShell'

const KEY_PATTERN = /^[a-zA-Z0-9_.-]{1,128}$/

type KeysState = {
  order: string[]
  values: Record<string, Record<string, string>>
}

function activeCodes(languages: Language[]): string[] {
  return languages.filter((l) => l.isActive).map((l) => l.code)
}

function emptyKeysState(codes: string[]): KeysState {
  const values: Record<string, Record<string, string>> = {}
  for (const code of codes) {
    values[code] = {}
  }
  return { order: [], values }
}

function mergeKeysFromApi(t: GroupTranslations | undefined, codes: string[]): KeysState {
  const keySet = new Set<string>()
  for (const code of codes) {
    const row = t?.[code]
    if (row && typeof row === 'object') {
      Object.keys(row).forEach((k) => keySet.add(k))
    }
  }
  const order = [...keySet].sort()
  const values: Record<string, Record<string, string>> = {}
  for (const code of codes) {
    values[code] = {}
    for (const k of order) {
      values[code][k] = t?.[code]?.[k] ?? ''
    }
  }
  return { order, values }
}

function toPayload(state: KeysState, codes: string[]): GroupTranslations {
  const out: GroupTranslations = {}
  for (const code of codes) {
    out[code] = {}
    for (const k of state.order) {
      out[code][k] = state.values[code]?.[k] ?? ''
    }
  }
  return out
}

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'group'
}

function itemPreview(item: AdminGroupItem): string {
  const t = item.translations
  const row = t.ru ?? t.en ?? Object.values(t)[0]
  const title = row?.title?.trim()
  const sub = row?.subtitle?.trim()
  if (title) return title.length > 80 ? `${title.slice(0, 80)}…` : title
  if (sub) return sub.length > 80 ? `${sub.slice(0, 80)}…` : sub
  return '—'
}

type Props = {
  open: boolean
  group: AdminGroup | null
  languages: Language[]
  onClose: () => void
  onSaved: () => void
}

export function GroupFormModal({ open, group, languages, onClose, onSaved }: Props) {
  const activeLangs = useMemo(() => languages.filter((l) => l.isActive), [languages])
  const codes = useMemo(() => activeCodes(activeLangs), [activeLangs])

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [keysState, setKeysState] = useState<KeysState>(() => emptyKeysState([]))
  const [detail, setDetail] = useState<AdminGroupDetail | null>(null)
  const [detailError, setDetailError] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newKeyInput, setNewKeyInput] = useState('')
  const [itemModal, setItemModal] = useState<{
    open: boolean
    item: AdminGroupItem | null
  }>({ open: false, item: null })

  const reloadDetail = useCallback(async () => {
    if (!group) return
    const { data } = await api.get<AdminGroupDetail>(`/admin/groups/${group.id}`)
    setDetail(data)
  }, [group])

  useEffect(() => {
    if (!open) {
      setDetail(null)
      setDetailError(false)
      setNewKeyInput('')
      return
    }
    if (!group) {
      setDetail(null)
      setDetailError(false)
      return
    }
    setDetailError(false)
    setLoadingDetail(true)
    void api
      .get<AdminGroupDetail>(`/admin/groups/${group.id}`)
      .then(({ data }) => setDetail(data))
      .catch(() => {
        setDetail(null)
        setDetailError(true)
      })
      .finally(() => setLoadingDetail(false))
  }, [open, group])

  useEffect(() => {
    if (!open) return
    setError(null)
    if (!group) {
      setName('')
      setSlug('')
      setDescription('')
      setKeysState(emptyKeysState(codes))
      return
    }
    if (loadingDetail) return
    const src = detail
    if (!src || src.id !== group.id) return
    setName(src.name)
    setSlug(src.slug)
    setDescription(src.description ?? '')
    setKeysState(mergeKeysFromApi(src.translations, codes))
  }, [open, group, detail, loadingDetail, codes])

  if (!open) return null

  function renameKey(oldKey: string, newKey: string) {
    const trimmed = newKey.trim()
    if (trimmed === oldKey) return
    if (!KEY_PATTERN.test(trimmed)) {
      setError(`Некорректный ключ: ${trimmed}`)
      return
    }
    setKeysState((prev) => {
      if (prev.order.includes(trimmed) && trimmed !== oldKey) {
        setError('Такой ключ уже есть')
        return prev
      }
      setError(null)
      const order = prev.order.map((k) => (k === oldKey ? trimmed : k))
      const values = { ...prev.values }
      for (const code of codes) {
        const row = { ...values[code] }
        const v = row[oldKey]
        delete row[oldKey]
        row[trimmed] = v ?? ''
        values[code] = row
      }
      return { order, values }
    })
  }

  function removeKey(key: string) {
    setKeysState((prev) => {
      const order = prev.order.filter((k) => k !== key)
      const values = { ...prev.values }
      for (const code of codes) {
        const row = { ...values[code] }
        delete row[key]
        values[code] = row
      }
      return { order, values }
    })
  }

  function addKey() {
    const raw = newKeyInput.trim() || 'field.key'
    let k = raw.replace(/\s+/g, '_')
    if (!KEY_PATTERN.test(k)) {
      setError('Ключ: латиница, цифры, _, -, . (до 128 символов)')
      return
    }
    let candidate = k
    let i = 1
    setKeysState((prev) => {
      while (prev.order.includes(candidate)) {
        candidate = `${k}.${i++}`
      }
      const order = [...prev.order, candidate]
      const values = { ...prev.values }
      for (const code of codes) {
        values[code] = { ...values[code], [candidate]: '' }
      }
      setError(null)
      setNewKeyInput('')
      return { order, values }
    })
  }

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    try {
      const translations = toPayload(keysState, codes)
      if (group) {
        await api.patch(`/admin/groups/${group.id}`, {
          name,
          slug: slug.trim(),
          description: description.trim() || null,
          translations,
        })
      } else {
        const s = slug.trim()
        if (!s || !name.trim()) {
          setError('Укажите название и slug')
          setSaving(false)
          return
        }
        await api.post('/admin/groups', {
          name: name.trim(),
          slug: s,
          description: description.trim() || undefined,
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

  const canSave =
    Boolean(name.trim() && slug.trim()) &&
    !saving &&
    (!group || (!loadingDetail && !detailError && !!detail))

  const items = detail?.items ?? []

  return (
    <>
      <ModalShell
        wide
        title={group ? 'Редактировать группу' : 'Новая группа'}
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
              disabled={!canSave}
              onClick={() => void handleSubmit()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {group && loadingDetail ? (
            <p className="text-sm text-gray-500">Загрузка…</p>
          ) : null}
          {group && detailError ? (
            <p className="text-sm text-red-600">Не удалось загрузить группу. Закройте и откройте снова.</p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Название (внутреннее)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  if (!group && !slug.trim()) setSlug(slugFromName(name))
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="header, footer"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Публичный ключ API и фронта: латиница, цифры, дефисы.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Описание</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-900">Текстовые поля (ключ → переводы)</p>
            <p className="mt-1 text-xs text-gray-500">
              Одинаковые ключи для всех языков. Примеры: <code className="rounded bg-gray-100 px-1">nav.about</code>,{' '}
              <code className="rounded bg-gray-100 px-1">copyright</code>.
            </p>

            <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-3 py-2 font-medium text-gray-700">Ключ поля</th>
                    {activeLangs.map((lang) => (
                      <th key={lang.code} className="min-w-[140px] px-3 py-2 font-medium text-gray-700">
                        {lang.code}
                      </th>
                    ))}
                    <th className="w-px px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {keysState.order.map((key) => (
                    <tr key={key} className="border-b border-gray-50">
                      <td className="px-3 py-2 align-top">
                        <input
                          type="text"
                          defaultValue={key}
                          key={key}
                          onBlur={(e) => renameKey(key, e.target.value)}
                          className="w-full rounded border border-gray-200 px-2 py-1 font-mono text-xs"
                        />
                      </td>
                      {activeLangs.map((lang) => (
                        <td key={lang.code} className="px-3 py-2 align-top">
                          <textarea
                            value={keysState.values[lang.code]?.[key] ?? ''}
                            onChange={(e) =>
                              setKeysState((prev) => ({
                                ...prev,
                                values: {
                                  ...prev.values,
                                  [lang.code]: {
                                    ...prev.values[lang.code],
                                    [key]: e.target.value,
                                  },
                                },
                              }))
                            }
                            rows={2}
                            className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2 align-top">
                        <button
                          type="button"
                          onClick={() => removeKey(key)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div className="min-w-[200px] flex-1">
                <label className="block text-xs font-medium text-gray-600">Новый ключ</label>
                <input
                  type="text"
                  value={newKeyInput}
                  onChange={(e) => setNewKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKey())}
                  placeholder="nav.about"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                />
              </div>
              <button
                type="button"
                onClick={addKey}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Добавить ключ
              </button>
            </div>
          </div>

          {group && detail ? (
            <div className="border-t border-gray-100 pt-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">Элементы группы (строки)</p>
                <button
                  type="button"
                  onClick={() => setItemModal({ open: true, item: null })}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  + Элемент
                </button>
              </div>
              <p className="mb-2 text-xs text-gray-500">
                Для списков с заголовком и подзаголовком (как карточки). Порядок — по полю сортировки.
              </p>
              {items.length === 0 ? (
                <p className="text-sm text-gray-500">Нет элементов</p>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                  {items.map((it) => (
                    <li
                      key={it.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <span className="text-gray-500">#{it.sortOrder}</span>
                      <span className="min-w-0 flex-1 text-gray-900">{itemPreview(it)}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setItemModal({ open: true, item: it })}
                          className="rounded bg-cyan-500 px-2 py-1 text-xs text-white hover:bg-cyan-600"
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!window.confirm('Удалить элемент?')) return
                            void api
                              .delete(`/admin/groups/${group.id}/items/${it.id}`)
                              .then(() => void reloadDetail())
                              .catch(() => alert('Не удалось удалить'))
                          }}
                          className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                        >
                          Удалить
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </ModalShell>

      {group && itemModal.open ? (
        <GroupItemFormModal
          open={itemModal.open}
          groupId={group.id}
          item={itemModal.item}
          languages={languages}
          onClose={() => setItemModal({ open: false, item: null })}
          onSaved={() => {
            void reloadDetail()
            onSaved()
          }}
        />
      ) : null}
    </>
  )
}
