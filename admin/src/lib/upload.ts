import { api } from './api'

export async function uploadMedia(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post<{ url: string }>('/admin/media/upload', fd)
  return data.url
}
