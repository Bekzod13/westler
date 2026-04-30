import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getAdminToken } from '../lib/auth'

type Props = {
  children: ReactNode
}

export function RequireAuth({ children }: Props) {
  const location = useLocation()
  const token = getAdminToken()
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}
