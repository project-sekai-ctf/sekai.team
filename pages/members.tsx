import siteMetadata from '@/data/siteMetadata'
import { getMembersFiles } from '@/data/membersData'
import { PageSEO } from '@/components/SEO'
import { GetStaticProps } from 'next'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { MdxFile } from 'types/FrontMatter'

export const getStaticProps: GetStaticProps<{
  members: MdxFile[]
}> = async () => {
  return { props: { members: await getMembersFiles() } }
}

export default function Projects({ members }: { members: MdxFile[] }) {
  return (
    <>
      <PageSEO title={`Members - ${siteMetadata.title}`} description={siteMetadata.description} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Members
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Members of Project SEKAI
          </p>
        </div>
        <div className="container py-12">
          <div className="flex flex-wrap -m-4 place-items-stretch">
            {members
              .filter((d) => !d.frontMatter.retired)
              .map((d) => (
                <MDXLayoutRenderer
                  layout="MemberLayout"
                  mdxSource={d.mdxSource}
                  frontMatter={d.frontMatter}
                  {...d}
                  key={d.frontMatter.name}
                />
              ))}
          </div>
        </div>
      </div>
      <details className="">
        <summary className="pt-2 pb-2 space-y-2">
          <h2 className="inline-block ml-2 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-1xl md:text-3xl">
            Former members
          </h2>
        </summary>
        <div className="container py-6">
          <div className="flex flex-wrap -m-4 place-items-stretch">
            {members
              .filter((d) => d.frontMatter.retired)
              .map((d) => (
                <MDXLayoutRenderer
                  layout="MemberLayout"
                  mdxSource={d.mdxSource}
                  frontMatter={d.frontMatter}
                  {...d}
                  key={d.frontMatter.name}
                />
              ))}
          </div>
        </div>
      </details>
    </>
  )
}
