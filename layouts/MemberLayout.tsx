import SocialBar, { socialKeys } from '@/components/SocialBar'
import { pick } from 'lodash'
import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import Image from 'next/image'
import { allBlogs } from 'contentlayer/generated'
import clsx from 'clsx'
import { specialtyColors } from '@/scripts/utils'

interface Props {
  member: Authors
  children: ReactNode
}

export default function MemberLayout({ member, children }: Props) {
  const { name, avatar, specialties, slug } = member
  const socialLinks = pick(member, socialKeys)
  const hasWriteups =
    allBlogs.filter((blog) => blog.authors?.includes(slug)).length > 0

  return (
    <div className="w-full p-4 md:w-1/2" style={{ maxWidth: '544px' }}>
      <div className="flex h-full flex-col gap-6 overflow-hidden rounded-md border-2 border-border p-6 md:flex-row">
        <Image
          src={avatar}
          className="h-auto w-24 self-start rounded"
          alt={`Profile pic of ${name}`}
          width={96}
          height={96}
          unoptimized
        />
        <div className="w-full">
          <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">
            {name}
          </h2>
          <span className="mb-3 flex max-w-none flex-row flex-wrap items-start gap-2">
            {specialties &&
              specialties.map((specialty) => (
                <span
                  key={specialty}
                  className={clsx(
                    'inline-block rounded-full px-3 py-1 text-foreground',
                    specialtyColors[specialty.toLowerCase()]
                      ? `bg-${
                          specialtyColors[specialty.toLowerCase()]
                        }-300 dark:bg-${
                          specialtyColors[specialty.toLowerCase()]
                        }-700`
                      : 'bg-secondary'
                  )}
                >
                  {specialty}
                </span>
              ))}
          </span>
          <p className="prose mb-3 max-w-none text-muted-foreground">
            {children || <i>(Placeholder) Member of Project SEKAI.</i>}
          </p>
          <span className="flex flex-col justify-between gap-3 xl:flex-row">
            <SocialBar {...socialLinks} size={5} />
            {hasWriteups && (
              <a href={`/members/${slug}`} className="text-primary">
                View writeups &rarr;
              </a>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
