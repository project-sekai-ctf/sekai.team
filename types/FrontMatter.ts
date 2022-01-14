import { IReadTimeResults } from 'reading-time'
import { AuthorFrontMatter } from './AuthorFrontMatter'
import { PostFrontMatter } from './PostFrontMatter'
import { Toc } from './Toc'

export type MdxFrontMatter = Omit<Partial<PostFrontMatter>, 'date' | 'slug'> &
  Partial<AuthorFrontMatter> & {
    readingTime: IReadTimeResults
    slug: string | string[] | null
    fileName: string
    date: string | null
  }

export type MdxFile = {
  mdxSource: string
  toc: Toc
  frontMatter: MdxFrontMatter
}
