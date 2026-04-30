import { useCallback, useEffect, useState } from 'react'
import { api, mediaUrl } from '../lib/api'
import { PaginationBar } from '../components/PaginationBar'
import { ServiceFormModal } from '../components/ServiceFormModal'
import { useLanguages } from '../hooks/useLanguages'
import type { Paginated, Service } from '../types/admin'

const PAGE_SIZE = 10

function previewLabel(s: Service): string {
  const t = s.translations
  const row = t.ru ?? t.en ?? Object.values(t)[0]
  return row?.title?.trim() || row?.subtitle?.trim()?.slice(0, 80) || '—'
}

export function ServicesPage() {
  const { languages, reload: reloadLangs } = useLanguages()
  const [rows, setRows] = useState<Service[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = {
        page,
        perPage: PAGE_SIZE,
      }
      const q = searchQ.trim()
      if (q) params.q = q
      const { data } = await api.get<Paginated<Service>>('/admin/services', { params })
      setRows(data.data)
      setTotal(data.total)
    } catch {
      setError('Не удалось загрузить услуги')
    } finally {
      setLoading(false)
    }
  }, [page, searchQ])

  useEffect(() => {
    void load()
  }, [load])

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)

  useEffect(() => {
    setPage(1)
  }, [searchQ])

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  async function handleDelete(id: number) {
    if (!window.confirm('Удалить услугу?')) return
    try {
      await api.delete(`/admin/services/${id}`)
      await load()
    } catch {
      alert('Не удалось удалить')
    }
  }

  const activeLangs = languages.filter((l) => l.isActive).length

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Услуги</h1>
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-gray-600">Главное</span>
            <span className="mx-2 text-gray-300">/</span>
            <span>Услуги</span>
          </p>
        </div>
        <button
          type="button"
          disabled={activeLangs === 0}
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50"
        >
          Добавить
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearchQ(search)}
            placeholder="Поиск…"
            className="min-w-[200px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => setSearchQ(search)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Искать
          </button>
        </div>

        {error ? (
          <p className="p-6 text-sm text-red-600">{error}</p>
        ) : loading ? (
          <p className="p-6 text-sm text-gray-500">Загрузка…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Изображение</th>
                  <th className="px-4 py-3 font-medium">Текст</th>
                  <th className="w-px px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                    <td className="px-4 py-3 text-gray-500">{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3">
                      <img
                        src={mediaUrl(r.image)}
                        alt=""
                        className="h-14 w-24 rounded-md object-cover"
                      />
                    </td>
                    <td className="max-w-md px-4 py-3 text-gray-800">{previewLabel(r)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(r)
                          setModalOpen(true)
                        }}
                        className="mr-1 inline-flex rounded-md bg-cyan-500 p-2 text-white hover:bg-cyan-600"
                        aria-label="Редактировать"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(r.id)}
                        className="inline-flex rounded-md bg-red-500 p-2 text-white hover:bg-red-600"
                        aria-label="Удалить"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">Нет записей</p>
            ) : null}
          </div>
        )}

        {!loading && !error && total > 0 ? (
          <PaginationBar page={safePage} pageCount={pageCount} onPageChange={setPage} />
        ) : null}
      </div>

      <ServiceFormModal
        open={modalOpen}
        service={editing}
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
