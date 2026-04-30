export type { Language } from './hero'

/** Standard shape for paginated admin list APIs (`page`, `perPage` query params). */
export type Paginated<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
}

export type AdminUser = {
  id: number
  name: string
  login: string
  lastLoginAt: string | null
}

/** Per language: arbitrary field key → string (same keys for every active language). */
export type GroupTranslations = Record<string, Record<string, string>>

export type AdminGroup = {
  id: number
  name: string
  slug: string
  description: string | null
  translationCount: number
  itemCount: number
  translations: GroupTranslations
}

export type GroupItemTranslations = Record<string, { title: string; subtitle: string }>

/** Ordered row inside a group — title/subtitle per language (API: GroupItem). */
export type AdminGroupItem = {
  id: number
  groupId: number
  sortOrder: number
  translations: GroupItemTranslations
}

export type AdminGroupDetail = AdminGroup & {
  items: AdminGroupItem[]
}

export type CompanyTranslations = Record<string, { title: string; subtitle: string }>

/** Stored in Company.elements JSON — list of labeled rows for the public site. */
export type CompanyElementSection = { label: string; value: string }

export type CompanyElementsPayload = { sections: CompanyElementSection[] }

export type Company = {
  id: number
  image: string
  openedYear: number | null
  elements: CompanyElementsPayload | unknown | null
  /** Admin-only (e.g. Telegram); not sent on public site API. */
  chatId: string | null
  botToken: string | null
  translations: CompanyTranslations
}

export type ServiceTranslations = Record<string, { title: string; subtitle: string }>

export type Service = {
  id: number
  image: string
  translations: ServiceTranslations
}

export type PartnerTranslations = Record<string, { title: string }>

export type Partner = {
  id: number
  image: string
  link: string
  translations: PartnerTranslations
}

export type TranslationRow = {
  id: number
  modelType: string
  modelId: number
  field: string
  content: string
  languageId: number
  language: { id: number; code: string; name: string }
}

/** Contact form submission from the public site (`Order` in API). */
export type AdminOrder = {
  id: number
  fullName: string
  companyName: string
  phone: string
  email: string
  message: string
  createdAt: string
}
