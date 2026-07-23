import type { ReactNode } from 'react'

type WindowFooterProps = {
  footer?: ReactNode
}

export default function WindowFooter({ footer }: WindowFooterProps) {
  return <div className="flex items-center justify-between gap-2 px-2 py-1.5">{footer}</div>
}
