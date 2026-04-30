import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Paginated } from '../types/admin'
import type { Language } from '../types/hero'

const LANGUAGES_PER_REQUEST = 100

export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<Paginated<Language>>('/admin/languages', {
        params: { page: 1, perPage: LANGUAGES_PER_REQUEST },
      })
      setLanguages(data.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { languages, loading, reload: load }
}
