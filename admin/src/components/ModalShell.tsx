import type { ReactNode } from 'react'

type Props = {
  title: string
  children: ReactNode
  footer: ReactNode
  onClose: () => void
  /** Wider modal for complex forms (e.g. translation matrices). */
  wide?: boolean
  /** Override overlay (e.g. z-[60] for nested modals). */
  overlayClassName?: string
}

export function ModalShell({
  title,
  children,
  footer,
  onClose,
  wide,
  overlayClassName,
}: Props) {
  const maxW = wide ? 'max-w-4xl' : 'max-w-2xl'
  return (
    <div
      className={
        overlayClassName ??
        'fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
      }
    >
      <div
        className={`flex max-h-[90vh] w-full ${maxW} flex-col overflow-hidden rounded-xl bg-white shadow-xl`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
        <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">{footer}</div>
      </div>
    </div>
  )
}
