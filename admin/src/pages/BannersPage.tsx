import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, mediaUrl } from '../lib/api'
import { HeroFormModal } from '../components/HeroFormModal'
import { PaginationBar } from '../components/PaginationBar'
import type { Paginated } from '../types/admin'
import type { Hero, Language } from '../types/hero'

const PAGE_SIZE = 10

function textFromHtml(html: string): string {
  const d = document.createElement('div')
  d.innerHTML = html
  return (d.textContent || d.innerText || '').trim()
}

function previewLabel(hero: Hero): string {
  const t = hero.translations
  const row = t.ru ?? t.en ?? Object.values(t)[0]
  if (!row) return '—'
  const title = row.title?.trim()
  if (title) return title
  const sub = textFromHtml(row.subtitle || '')
  if (sub) return sub.length > 80 ? `${sub.slice(0, 80)}…` : sub
  const btn = row.button?.trim()
  return btn || '—'
}

const LANGS_PER_PAGE = 100

export function BannersPage() {
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [heroesTotal, setHeroesTotal] = useState(0)
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Hero | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const heroParams: Record<string, string | number> = {
        page,
        perPage: PAGE_SIZE,
      }
      const q = searchQ.trim()
      if (q) heroParams.q = q
      const [hRes, lRes] = await Promise.all([
        api.get<Paginated<Hero>>('/admin/heroes', { params: heroParams }),
        api.get<Paginated<Language>>('/admin/languages', {
          params: { page: 1, perPage: LANGS_PER_PAGE },
        }),
      ])
      setHeroes(hRes.data.data)
      setHeroesTotal(hRes.data.total)
      setLanguages(lRes.data.data)
    } catch {
      setListError('Не удалось загрузить данные. Проверьте токен и URL API.')
    } finally {
      setLoading(false)
    }
  }, [page, searchQ])

  useEffect(() => {
    void load()
  }, [load])

  const pageCount = Math.max(1, Math.ceil(heroesTotal / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)

  useEffect(() => {
    setPage(1)
  }, [searchQ])

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  async function handleDelete(id: number) {
    if (!window.confirm('Удалить баннер?')) return
    try {
      await api.delete(`/admin/heroes/${id}`)
      await load()
    } catch {
      alert('Не удалось удалить')
    }
  }

  const activeLangCodes = useMemo(() => languages.filter((l) => l.isActive).length, [languages])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(hero: Hero) {
    setEditing(hero)
    setModalOpen(true)
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Баннеры</h1>
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-gray-600">Главное</span>
            <span className="mx-2 text-gray-300">/</span>
            <span>Баннеры</span>
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={activeLangCodes === 0}
          title={activeLangCodes === 0 ? 'Сначала настройте активные языки в API' : undefined}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Добавить
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-4">
          <div className="relative min-w-[200px] flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchQ(search)}
              placeholder="Поиск…"
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
                {heroes.map((hero, i) => (
                  <tr key={hero.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                    <td className="px-4 py-3 text-gray-500">{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3">
                      {hero.image ? (
                        <img
                          src={mediaUrl(hero.image)}
                          alt=""
                          className="h-14 w-24 rounded-md object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="max-w-md px-4 py-3 text-gray-800">{previewLabel(hero)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(hero)}
                        className="mr-1 inline-flex rounded-md bg-cyan-500 p-2 text-white hover:bg-cyan-600"
                        aria-label="Редактировать"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(hero.id)}
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
            {heroes.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">Нет записей</p>
            ) : null}
          </div>
        )}

        {!loading && !listError && heroesTotal > 0 ? (
          <PaginationBar page={safePage} pageCount={pageCount} onPageChange={setPage} />
        ) : null}
      </div>

      <HeroFormModal
        open={modalOpen}
        hero={editing}
        languages={languages}
        onClose={() => setModalOpen(false)}
        onSaved={() => void load()}
      />
    </div>
  )
}
