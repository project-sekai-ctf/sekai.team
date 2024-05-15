// import Splashscreen from '@/components/Splashscreen'
import FullLogo from '@/data/fullLogo.svg'
import FullLogoDark from '@/data/fullLogoDark.svg'
import contestsData from '@/data/contestsData'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { formatDate } from 'pliny/utils/formatDate'
import { allAuthors } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import Image from 'next/image'

const MAX_DISPLAY = 5

export default function Home({ posts }) {
  const currentMembers = allAuthors.filter((d) => !d.retired).length
  return (
    <>
      {/* <Splashscreen /> */}
      <div className="divide-y divide-border">
        <div className="pb-8 pt-8 text-center">
          <FullLogoDark
            className="mx-auto mb-8 dark:hidden"
            aria-hidden="true"
            style={{
              width: 'clamp(35%, 400px, calc(100% - 20px))',
            }}
            alt="Project SEKAI"
          />
          <FullLogo
            className="mx-auto mb-8 hidden dark:block"
            aria-hidden="true"
            style={{
              width: 'clamp(35%, 400px, calc(100% - 20px))',
            }}
            alt="Project SEKAI"
          />
        </div>
        <div className="space-y-2 pb-8 pt-8 md:space-y-5">
          <p className="text-center text-lg leading-7 text-muted-foreground">
            <code
              aria-label={`Project SEKAI is a CTF team with over ${currentMembers} members and has participated in over ${contestsData.length} contests.`}
              className="font-mono"
            >
              {`SEKAI{I5_\u200BA_\u200BCTF_\u200Bt3Am_\u200Bw/_\u200B${currentMembers}+_\u200BmbRs\u200B,_\u200Bp4r71CiP4t1ng_\u200Bin_\u200B${contestsData.length}+_\u200Bc0nt3Stz}`}
            </code>
          </p>
        </div>
        <ul className="">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, MAX_DISPLAY).map((frontMatter) => {
            const { slug, date, title, tags, authors } = frontMatter

            const authorDetails = authors?.map((authorSlug) =>
              allAuthors.find((author) => author.slug === authorSlug)
            )

            const finalAuthorDetails = authorDetails?.length
              ? authorDetails
              : [
                  {
                    name: siteMetadata.author,
                    avatar: siteMetadata.image,
                    slug: siteMetadata.author,
                  },
                ]

            return (
              <li key={slug} className="py-6">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-sm leading-6 text-muted-foreground">
                        <time dateTime={date as string}>
                          {formatDate(date as string)}
                        </time>
                        <div className="flex items-center gap-1">
                          {' by '}
                          {finalAuthorDetails.map((author) => (
                            <div
                              key={author.slug}
                              className="flex items-center gap-1"
                            >
                              <Image
                                src={author.avatar}
                                alt={author.name}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                              <Link
                                href={`/members/${author.slug}`}
                                className="text-foreground hover:underline"
                              >
                                {author.name}
                              </Link>
                            </div>
                          ))}
                        </div>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-semibold leading-8 tracking-tight">
                            <Link
                              href={`/blog/${slug}`}
                              className="text-foreground"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap items-center">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link href="/blog" className="text-primary" aria-label="all posts">
            All Posts &rarr;
          </Link>
        </div>
      )}
    </>
  )
}
