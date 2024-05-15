import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { allBlogs } from 'contentlayer/generated'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { tag: string }
}): Promise<Metadata> {
  const tagCounts = tagData as Record<
    string,
    { slug: string; proper: string; count: number }
  >
  const tag = decodeURI(params.tag)
  return genPageMetadata({
    title: tagCounts[tag].proper,
    description: `${siteMetadata.title} ${tag} tagged content`,
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/tags/${tag}/feed.xml`,
      },
    },
    robots: {
      index: false,
      follow: false,
    },
  })
}

export const generateStaticParams = async () => {
  const tagCounts = tagData as Record<
    string,
    { slug: string; proper: string; count: number }
  >
  const tagKeys = Object.keys(tagCounts)
  const paths = tagKeys.map((tag) => ({
    tag: tag,
  }))
  return paths
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const tagCounts = tagData as Record<
    string,
    { slug: string; proper: string; count: number }
  >
  const tag = decodeURI(params.tag)
  const title = tagCounts[tag].proper
  const filteredPosts = allCoreContent(
    sortPosts(
      allBlogs.filter(
        (post) => post.tags && post.tags.map((t) => slug(t)).includes(tag)
      )
    )
  )
  return <ListLayout posts={filteredPosts} title={title} />
}
