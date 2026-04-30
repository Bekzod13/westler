import { useEffect, useMemo, useState } from 'react'
import { api, mediaUrl } from '../lib/api'
import { uploadMedia } from '../lib/upload'
import type {
  Company,
  CompanyElementSection,
  CompanyTranslations,
} from '../types/admin'
import type { Language } from '../types/hero'
import { ModalShell } from './ModalShell'

function emptyT(languages: Language[]): CompanyTranslations {
  const out: CompanyTranslations = {}
  for (const lang of languages) {
    if (!lang.isActive) continue
    out[lang.code] = { title: '', subtitle: '' }
  }
  return out
}

function mergeT(company: Company, languages: Language[]): CompanyTranslations {
  const base = emptyT(languages)
  for (const code of Object.keys(base)) {
    const row = company.translations[code]
    if (row) {
      base[code] = { title: row.title ?? '', subtitle: row.subtitle ?? '' }
    }
  }
  return base
}

function parseSectionsFromElements(raw: unknown): CompanyElementSection[] {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return []
  const o = raw as Record<string, unknown>
  const arr = o.sections
  if (!Array.isArray(arr)) return []
  return arr.map((item) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const row = item as Record<string, unknown>
      return {
        label: typeof row.label === 'string' ? row.label : '',
        value: typeof row.value === 'string' ? row.value : '',
      }
    }
    return { label: '', value: '' }
  })
}

function buildElementsPayload(sections: CompanyElementSection[]): Record<string, unknown> | null {
  const cleaned = sections
    .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
    .filter((s) => s.label !== '' || s.value !== '')
  if (cleaned.length === 0) return null
  return { sections: cleaned }
}

type Props = {
  open: boolean
  /** Singleton company only; edit via PATCH /admin/companies */
  company: Company | null
  languages: Language[]
  onClose: () => void
  onSaved: () => void
}

export function CompanyFormModal({ open, company, languages, onClose, onSaved }: Props) {
  const activeLangs = useMemo(() => languages.filter((l) => l.isActive), [languages])

  const [translations, setTranslations] = useState<CompanyTranslations>({})
  const [imagePath, setImagePath] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [openedYear, setOpenedYear] = useState<string>('')
  const [chatId, setChatId] = useState('')
  const [botToken, setBotToken] = useState('')
  const [sections, setSections] = useState<CompanyElementSection[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setPendingFile(null)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      return
    }
    setError(null)
    setPendingFile(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    if (company) {
      setImagePath(company.image)
      setTranslations(mergeT(company, activeLangs))
      setOpenedYear(company.openedYear != null ? String(company.openedYear) : '')
      setChatId(company.chatId ?? '')
      setBotToken(company.botToken ?? '')
      const parsed = parseSectionsFromElements(company.elements)
      setSections(parsed.length > 0 ? parsed : [{ label: '', value: '' }])
    } else {
      setImagePath(null)
      setTranslations(emptyT(activeLangs))
      setOpenedYear('')
      setChatId('')
      setBotToken('')
      setSections([{ label: '', value: '' }])
    }
  }, [open, company, activeLangs])

  if (!open) return null

  function updateField(code: string, field: 'title' | 'subtitle', value: string) {
    setTranslations((prev) => ({
      ...prev,
      [code]: { ...prev[code], [field]: value },
    }))
  }

  function handleFileChange(file: File | null) {
    setPendingFile(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
  }

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    try {
      let image = imagePath
      if (pendingFile) {
        image = await uploadMedia(pendingFile)
      }
      if (!image) {
        setError('Нужно изображение')
        setSaving(false)
        return
      }

      const elements = buildElementsPayload(sections)

      const opened =
        openedYear.trim() === '' ? undefined : Number.parseInt(openedYear, 10)
      if (openedYear.trim() !== '' && Number.isNaN(opened)) {
        setError('Год открытия — целое число')
        setSaving(false)
        return
      }

      if (!company) {
        setError('Компания не загружена')
        setSaving(false)
        return
      }
      const patch: Record<string, unknown> = {
        image,
        translations,
      }
      if (openedYear.trim() === '') {
        patch.openedYear = null
      } else if (opened !== undefined && !Number.isNaN(opened)) {
        patch.openedYear = opened
      }
      patch.elements = elements
      patch.chatId = chatId.trim() === '' ? null : chatId.trim()
      patch.botToken = botToken.trim() === '' ? null : botToken.trim()
      await api.patch('/admin/companies', patch)
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

  const thumbSrc = previewUrl ?? mediaUrl(imagePath)

  return (
    <ModalShell
      title="Редактировать компанию"
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
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Изображение</label>
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          {thumbSrc ? (
            <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <img src={thumbSrc} alt="" className="mx-auto max-h-40 w-auto object-contain" />
            </div>
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Год открытия</label>
          <input
            type="number"
            value={openedYear}
            onChange={(e) => setOpenedYear(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
          <p className="text-sm font-medium text-gray-800">Интеграции (не показываются на сайте)</p>
          <p className="mt-1 text-xs text-gray-500">
            Например, для уведомлений в Telegram: chat id и токен бота.
          </p>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">Chat ID</label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="-1001234567890"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Bot token</label>
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-sm font-medium text-gray-700">Элементы (секции)</label>
            <button
              type="button"
              onClick={() => setSections((prev) => [...prev, { label: '', value: '' }])}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              + Добавить строку
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Каждая строка: подпись и значение. Пустые строки при сохранении не учитываются.
          </p>
          {sections.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-3 py-6 text-center text-sm text-gray-500">
              Нет строк. Нажмите «Добавить строку».
            </p>
          ) : (
          <ul className="mt-3 space-y-3">
            {sections.map((row, idx) => (
              <li
                key={idx}
                className="rounded-lg border border-gray-200 bg-gray-50/80 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-500">Строка {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSections((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Удалить
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Подпись</label>
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) =>
                        setSections((prev) =>
                          prev.map((s, i) =>
                            i === idx ? { ...s, label: e.target.value } : s,
                          ),
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Значение</label>
                    <input
                      type="text"
                      value={row.value}
                      onChange={(e) =>
                        setSections((prev) =>
                          prev.map((s, i) =>
                            i === idx ? { ...s, value: e.target.value } : s,
                          ),
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          )}
        </div>

        {activeLangs.map((lang) => (
          <div key={lang.code} className="rounded-lg border border-gray-200 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-800">
              {lang.name} <span className="text-gray-500">({lang.code})</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">Заголовок</label>
                <input
                  type="text"
                  value={translations[lang.code]?.title ?? ''}
                  onChange={(e) => updateField(lang.code, 'title', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Подзаголовок</label>
                <textarea
                  value={translations[lang.code]?.subtitle ?? ''}
                  onChange={(e) => updateField(lang.code, 'subtitle', e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </ModalShell>
  )
}
