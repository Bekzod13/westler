import { useMemo } from 'react'

export type PageItem = number | 'ellipsis'

/** Page numbers to show with gaps collapsed to an ellipsis (for large page counts). */
export function getVisiblePageItems(current: number, totalPages: number): PageItem[] {
  if (totalPages <= 0) return []
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages = new Set<number>()
  pages.add(1)
  pages.add(totalPages)
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  const out: PageItem[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('ellipsis')
    out.push(sorted[i])
  }
  return out
}

type Props = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}

export function PaginationBar({ page, pageCount, onPageChange, className = '' }: Props) {
  const items = useMemo(() => getVisiblePageItems(page, pageCount), [page, pageCount])

  if (pageCount <= 0) return null

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-1 border-t border-gray-100 px-4 py-3 text-sm text-gray-600 ${className}`}
    >
      <span className="mr-2 tabular-nums text-gray-500">
        Стр. {page} из {pageCount}
      </span>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className="rounded border border-gray-200 px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
      >
        Пред.
      </button>
      <div className="flex flex-wrap items-center justify-center gap-1">
        {items.map((item, i) =>
          item === 'ellipsis' ? (
            <span key={`e-${i}`} className="px-1 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`min-w-[2.25rem] rounded border px-2 py-1 tabular-nums ${
                item === page
                  ? 'border-gray-800 bg-gray-800 text-white'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          ),
        )}
      </div>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        className="rounded border border-gray-200 px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
      >
        След.
      </button>
    </div>
  )
}
