import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import { Twitter, Mail, Github, Linkedin } from 'lucide-react'
import Image from '@/components/Image'
import SocialIcon from '@/components/social-icons'
import clsx from 'clsx'
import { specialtyColors } from '@/scripts/utils'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
}

export default function AuthorLayout({ children, content }: Props) {
  const {
    name,
    avatar,
    specialties,
    occupation,
    company,
    email,
    twitter,
    linkedin,
    github,
    web,
  } = content

  return (
    <>
      <div className="divide-y divide-accent-foreground dark:divide-accent">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-semibold leading-9 tracking-tight text-foreground sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {name}
          </h1>
        </div>
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <div className="flex flex-col items-center pt-8">
            {avatar && (
              <Image
                src={avatar}
                alt="avatar"
                width={192}
                height={192}
                className="h-48 w-48 rounded-full"
              />
            )}
            <h3 className="pb-2 pt-4 text-2xl font-bold leading-8 tracking-tight">
              {name}
            </h3>
            <div className="text-muted-foreground">{occupation}</div>
            <div className="text-muted-foreground">{company}</div>
            <div className="flex space-x-3">
              <SocialIcon kind="mail" href={`mailto:${email}`} />
              <SocialIcon kind="github" href={github} />
              <SocialIcon kind="linkedin" href={linkedin} />
              <SocialIcon kind="twitter" href={twitter} />
              <SocialIcon kind="web" href={web} />
            </div>
          </div>
          <div className="flex flex-col gap-6 pb-8 pt-8">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Specialties
              </span>
              <div className="flex flex-wrap items-center space-x-2">
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
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Description
              </span>
              <div className="prose max-w-none dark:prose-invert xl:col-span-2">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
