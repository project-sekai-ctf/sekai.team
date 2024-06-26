import Link from '@/components/Link'
import Tag from '@/components/Tag'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Tags',
  description: 'All tags used in the blog.',
  robots: {
    index: false,
    follow: false,
  },
})

export default async function Page() {
  const tagCounts = tagData as Record<
    string,
    { slug: string; proper: string; count: number }
  >
  const sortedTags = Object.values(tagCounts).sort((a, b) => b.count - a.count)
  return (
    <>
      <div className="flex flex-col items-start justify-start divide-y divide-border md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0">
        <div className="space-x-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-semibold leading-9 tracking-tight text-foreground sm:text-4xl sm:leading-10 md:border-r-2 md:px-6 md:text-6xl md:leading-14">
            Tags
          </h1>
        </div>
        <div className="flex max-w-lg flex-wrap">
          {sortedTags.length === 0 && 'No tags found.'}
          {sortedTags.map((t) => {
            return (
              <div
                key={t.proper}
                className="mb-2 mr-5 mt-2 flex items-center justify-center gap-2"
              >
                <Tag text={t.proper} />
                <Link
                  href={`/tags/${t.slug}`}
                  className="-ml-1 mb-1 text-sm font-semibold uppercase text-muted-foreground"
                  aria-label={`View posts tagged ${t}`}
                >
                  {` (${t.count})`}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
