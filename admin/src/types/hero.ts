export type HeroTranslations = Record<
  string,
  { title: string; subtitle: string; button: string }
>

export type Hero = {
  id: number
  video: string | null
  image: string | null
  translations: HeroTranslations
}

export type Language = {
  id: number
  code: string
  name: string
  isDefault: boolean
  isActive: boolean
}
