import { useLayoutEffect, useMemo, useState } from 'react'
import { api, mediaUrl } from '../lib/api'
import { RichHtmlField } from './RichHtmlField'
import { uploadMedia } from '../lib/upload'
import type { Hero, HeroTranslations, Language } from '../types/hero'

function emptyTranslations(languages: Language[]): HeroTranslations {
  const out: HeroTranslations = {}
  for (const lang of languages) {
    if (!lang.isActive) continue
    out[lang.code] = { title: '', subtitle: '', button: '' }
  }
  return out
}

function mergeHeroTranslations(hero: Hero, languages: Language[]): HeroTranslations {
  const base = emptyTranslations(languages)
  for (const code of Object.keys(base)) {
    const row = hero.translations[code]
    if (row) {
      base[code] = {
        title: row.title ?? '',
        subtitle: row.subtitle ?? '',
        button: row.button ?? '',
      }
    }
  }
  return base
}

type Props = {
  open: boolean
  hero: Hero | null
  languages: Language[]
  onClose: () => void
  onSaved: () => void
}

export function HeroFormModal({ open, hero, languages, onClose, onSaved }: Props) {
  const activeLangs = useMemo(() => languages.filter((l) => l.isActive), [languages])

  const [translations, setTranslations] = useState<HeroTranslations>({})
  const [imagePath, setImagePath] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useLayoutEffect(() => {
    if (!open) return
    setError(null)
    setPendingFile(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    if (hero) {
      setImagePath(hero.image)
      setVideoUrl(hero.video ?? '')
      setTranslations(mergeHeroTranslations(hero, activeLangs))
    } else {
      setImagePath(null)
      setVideoUrl('')
      setTranslations(emptyTranslations(activeLangs))
    }
  }, [open, hero, activeLangs])

  useLayoutEffect(() => {
    if (!open) {
      setPendingFile(null)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    }
  }, [open])

  if (!open) return null

  function updateField(code: string, field: 'title' | 'subtitle' | 'button', value: string) {
    setTranslations((prev) => ({
      ...prev,
      [code]: { ...prev[code], [field]: value },
    }))
  }

  function handleFileChange(file: File | null) {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
    setPendingFile(file)
  }

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    try {
      let image = imagePath
      if (pendingFile) {
        image = await uploadMedia(pendingFile)
      }

      const body = {
        image: image ?? undefined,
        video: videoUrl.trim() === '' ? null : videoUrl.trim(),
        translations,
      }

      if (hero) {
        await api.patch(`/admin/heroes/${hero.id}`, body)
      } else {
        await api.post('/admin/heroes', body)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{hero ? 'Редактировать баннер' : 'Новый баннер'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 px-6 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Изображение</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
            />
            {thumbSrc ? (
              <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img src={thumbSrc} alt="" className="mx-auto max-h-48 w-auto object-contain" />
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-500">Превью появится после выбора файла или сохранённого изображения</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ссылка на видео</label>
            <input
              type="text"
              inputMode="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-gray-500">Необязательно. URL внешнего видео (например MP4 или страницы встраивания).</p>
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
                  <label className="block text-xs font-medium text-gray-600">Подзаголовок (HTML)</label>
                  <div className="mt-1">
                    <RichHtmlField
                      key={`${hero?.id ?? 'new'}-${lang.code}`}
                      value={translations[lang.code]?.subtitle ?? ''}
                      onChange={(v) => updateField(lang.code, 'subtitle', v)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Кнопка</label>
                  <input
                    type="text"
                    value={translations[lang.code]?.button ?? ''}
                    onChange={(e) => updateField(lang.code, 'button', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-6 py-4">
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
      </div>
    </div>
  )
}
