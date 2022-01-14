import { IReadTimeResults } from 'reading-time'
import { AuthorFrontMatter } from './AuthorFrontMatter'
import { PostFrontMatter } from './PostFrontMatter'
import { Toc } from './Toc'

export type MdxFrontMatter = PostFrontMatter &
  AuthorFrontMatter & {
    readingTime: IReadTimeResults
    slug: string | string[] | null
    fileName: string
    date: Date | null
  }

export type MdxFile = {
  mdxSource: string
  toc: Toc
  frontMatter: MdxFrontMatter
}
