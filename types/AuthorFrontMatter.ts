import { SocialBarProps } from '@/components/SocialBar'

export type AuthorFrontMatter = {
  layout?: string
  name: string
  avatar: string
  description: string
  gravatarHash: string
  specialties: string[]
  occupation: string
  company: string
  member?: boolean
  order?: number
} & Partial<SocialBarProps>
