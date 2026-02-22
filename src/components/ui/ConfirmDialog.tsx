'use client'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = '确认',
  cancelText = '取消',
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="
          relative z-10
          w-full max-w-md mx-4
          rounded-2xl border border-white/10
          bg-card
          p-6
          shadow-2xl
          animate-in fade-in zoom-in-95 duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-white mb-2">
          {title}
        </h2>

        <p className="text-text-muted mb-6 leading-relaxed">
          {description}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="
              px-4 py-2
              rounded-lg
              bg-white/5 hover:bg-white/10
              text-text-muted hover:text-white
              font-medium
              transition-all duration-200
            "
          >
            {cancelText}
          </button>

          <button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="
              px-4 py-2
              rounded-lg
              bg-destructive hover:bg-destructive/90
              text-white
              font-medium
              transition-all duration-200
              hover:shadow-lg hover:shadow-destructive/25
            "
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
