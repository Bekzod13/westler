import { useEffect, useMemo, useState } from 'react'
import { api, mediaUrl } from '../lib/api'
import { uploadMedia } from '../lib/upload'
import type { Service, ServiceTranslations } from '../types/admin'
import type { Language } from '../types/hero'
import { ModalShell } from './ModalShell'

function emptyT(languages: Language[]): ServiceTranslations {
  const out: ServiceTranslations = {}
  for (const lang of languages) {
    if (!lang.isActive) continue
    out[lang.code] = { title: '', subtitle: '' }
  }
  return out
}

function mergeT(service: Service, languages: Language[]): ServiceTranslations {
  const base = emptyT(languages)
  for (const code of Object.keys(base)) {
    const row = service.translations[code]
    if (row) {
      base[code] = { title: row.title ?? '', subtitle: row.subtitle ?? '' }
    }
  }
  return base
}

type Props = {
  open: boolean
  service: Service | null
  languages: Language[]
  onClose: () => void
  onSaved: () => void
}

export function ServiceFormModal({ open, service, languages, onClose, onSaved }: Props) {
  const activeLangs = useMemo(() => languages.filter((l) => l.isActive), [languages])

  const [translations, setTranslations] = useState<ServiceTranslations>({})
  const [imagePath, setImagePath] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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
    if (service) {
      setImagePath(service.image)
      setTranslations(mergeT(service, activeLangs))
    } else {
      setImagePath(null)
      setTranslations(emptyT(activeLangs))
    }
  }, [open, service, activeLangs])

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

      if (service) {
        await api.patch(`/admin/services/${service.id}`, { image, translations })
      } else {
        await api.post('/admin/services', { image, translations })
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

  const thumbSrc = previewUrl ?? mediaUrl(imagePath)

  return (
    <ModalShell
      title={service ? 'Редактировать услугу' : 'Новая услуга'}
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
