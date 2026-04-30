import { useCallback, useEffect, useState } from 'react'
import { api, mediaUrl } from '../lib/api'
import { CompanyFormModal } from '../components/CompanyFormModal'
import { useLanguages } from '../hooks/useLanguages'
import type { Company } from '../types/admin'

function previewLabel(c: Company): string {
  const t = c.translations
  const row = t.ru ?? t.en ?? Object.values(t)[0]
  return row?.title?.trim() || row?.subtitle?.trim()?.slice(0, 80) || '—'
}

function sectionsCount(c: Company): number | null {
  const e = c.elements
  if (e == null || typeof e !== 'object' || Array.isArray(e)) return null
  const raw = (e as Record<string, unknown>).sections
  if (!Array.isArray(raw)) return null
  return raw.length
}

function CompanySummaryRow({ company }: { company: Company }) {
  const n = sectionsCount(company)
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[400px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-gray-600">
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">Изображение</th>
            <th className="px-4 py-3 font-medium">Текст</th>
            <th className="px-4 py-3 font-medium">Секции</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-50">
            <td className="px-4 py-3 font-mono text-gray-500">{company.id}</td>
            <td className="px-4 py-3">
              <img
                src={mediaUrl(company.image)}
                alt=""
                className="h-14 w-24 rounded-md object-cover"
              />
            </td>
            <td className="max-w-md px-4 py-3 text-gray-800">{previewLabel(company)}</td>
            <td className="px-4 py-3 tabular-nums text-gray-600">
              {n != null ? n : '—'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function CompaniesPage() {
  const { languages, reload: reloadLangs } = useLanguages()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<Company>('/admin/companies')
      setCompany(data)
    } catch {
      setError('Не удалось загрузить компанию')
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const activeLangs = languages.filter((l) => l.isActive).length

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Компания</h1>
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-gray-600">Главное</span>
            <span className="mx-2 text-gray-300">/</span>
            <span>Компания</span>
          </p>
          <p className="mt-2 max-w-xl text-sm text-gray-600">
            В системе одна компания (id=1). Добавить ещё нельзя — только редактирование.
          </p>
        </div>
        <button
          type="button"
          disabled={activeLangs === 0 || company == null}
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50"
        >
          Редактировать
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {error ? (
          <p className="p-6 text-sm text-red-600">{error}</p>
        ) : loading ? (
          <p className="p-6 text-sm text-gray-500">Загрузка…</p>
        ) : company == null ? (
          <p className="p-6 text-sm text-gray-600">
            Компания не найдена. Выполните сидирование базы (Company #1).
          </p>
        ) : (
          <CompanySummaryRow company={company} />
        )}
      </div>

      <CompanyFormModal
        open={modalOpen}
        company={company}
        languages={languages}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          void load()
          void reloadLangs()
        }}
      />
    </div>
  )
}
