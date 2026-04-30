import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { PaginationBar } from '../components/PaginationBar'
import type { AdminOrder, Paginated } from '../types/admin'

const PAGE_SIZE = 10

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function truncateMessage(text: string | null | undefined, max = 120): string {
  const t = (text ?? '').trim()
  if (t.length <= max) return t || '—'
  return `${t.slice(0, max)}…`
}

export function DashboardPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const params: Record<string, string | number> = {
        page,
        perPage: PAGE_SIZE,
      }
      const q = searchQ.trim()
      if (q) params.q = q
      const res = await api.get<Paginated<AdminOrder>>('/admin/orders', { params })
      setOrders(res.data.data)
      setTotal(res.data.total)
    } catch {
      setListError('Не удалось загрузить заявки. Проверьте токен и URL API.')
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
    if (!window.confirm('Удалить эту заявку?')) return
    try {
      await api.delete(`/admin/orders/${id}`)
      await load()
    } catch {
      alert('Не удалось удалить')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Заявки с сайта (форма «Обсудить проект»)
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-4">
          <div className="relative min-w-[200px] flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchQ(search)}
              placeholder="Поиск по имени, компании, телефону, email, тексту…"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setSearchQ(search)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Искать
          </button>
        </div>

        {listError ? (
          <p className="p-6 text-sm text-red-600">{listError}</p>
        ) : loading ? (
          <p className="p-6 text-sm text-gray-500">Загрузка…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Имя</th>
                  <th className="px-4 py-3 font-medium">Компания</th>
                  <th className="px-4 py-3 font-medium">Телефон</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="min-w-[200px] px-4 py-3 font-medium">Сообщение</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Дата</th>
                  <th className="w-px px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {orders.map((row, i) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                    <td className="px-4 py-3 text-gray-500">
                      {(safePage - 1) * PAGE_SIZE + i + 1}
                    </td>
                    <td className="max-w-[160px] px-4 py-3 text-gray-900">{row.fullName || '—'}</td>
                    <td className="max-w-[140px] px-4 py-3 text-gray-700">
                      {row.companyName?.trim() ? row.companyName : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">{row.phone}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-gray-700" title={row.email}>
                      {row.email}
                    </td>
                    <td className="max-w-[280px] px-4 py-3 text-gray-600" title={row.message}>
                      {truncateMessage(row.message)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void handleDelete(row.id)}
                        className="inline-flex rounded-md bg-red-500 p-2 text-white hover:bg-red-600"
                        aria-label="Удалить"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">Нет заявок</p>
            ) : null}
          </div>
        )}

        {!loading && !listError && total > 0 ? (
          <PaginationBar page={safePage} pageCount={pageCount} onPageChange={setPage} />
        ) : null}
      </div>
    </div>
  )
}
