import React from 'react'
import { genPageMetadata } from 'app/seo'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allAuthors, allBlogs } from 'contentlayer/generated'
import ListLayout from '@/layouts/ListLayout'
import AuthorLayout from '@/layouts/AuthorLayout'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: { member: string }
}): Promise<Metadata> {
  return genPageMetadata({
    title: `${params.member}`,
    description: `${params.member}'s posts and profiles.`,
    alternates: {
      canonical: './',
    },
  })
}

export default function Member({ params }: { params: { member: string } }) {
  const member = decodeURI(params.member)
  const authorData = allAuthors.find((author) => author.slug === member)

  if (!authorData) {
    return notFound()
  }

  const filteredPosts = allCoreContent(
    sortPosts(
      allBlogs.filter(
        (post) => post.authors && post.authors.includes(authorData.slug)
      )
    )
  )

  return (
    <>
      <AuthorLayout content={authorData}>{authorData.body.raw}</AuthorLayout>
      <ListLayout posts={filteredPosts} />
    </>
  )
}
