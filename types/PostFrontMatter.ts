export type PostFrontMatter = {
  title: string
  date: string | Date | null
  tags: string[]
  lastmod?: string
  draft?: boolean
  summary?: string
  images?: string[]
  authors?: string[]
  layout?: string
  slug: string
  fileName: string
}
