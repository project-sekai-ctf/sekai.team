import { SocialBarProps } from '@/components/SocialBar'
import { formatSlug, getFileBySlug, getFiles } from '@/lib/mdx'

export interface MemberData {
  name: string
  description: string
  gravatarHash: string
  specialties: string[]
  socialLinks: Partial<SocialBarProps>
}

export async function getMembersFiles() {
  const filenames = getFiles('authors')
  const filesPromise = filenames.map((filename) => getFileBySlug('authors', formatSlug(filename)))
  const files = (await Promise.all(filesPromise)).sort(
    (a, b) =>
      (a.frontMatter.order == undefined ? Infinity : a.frontMatter.order) -
      (b.frontMatter.order == undefined ? Infinity : b.frontMatter.order)
  )
  return files.filter((file) => file.frontMatter.member)
}
