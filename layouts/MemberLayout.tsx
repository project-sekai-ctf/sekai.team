import SocialBar, { socialKeys } from '@/components/SocialBar'
import { pick } from 'lodash'
import { ReactNode } from 'react'
import { AuthorFrontMatter } from 'types/AuthorFrontMatter'

const specialtyColors = {
  Web: 'sky',
  Crypto: 'purple',
  Pwn: 'red',
  Reverse: 'yellow',
  Forensics: 'pink',
  Misc: 'amber',
  OSINT: 'gray',
}

const keepClasses = (
  <span className="bg-gray-800 bg-red-800 bg-yellow-800 bg-purple-800 bg-pink-800 bg-sky-800 bg-amber-800" />
)

interface Props {
  frontMatter: AuthorFrontMatter
  children: ReactNode
}

export default function MemberLayout({ frontMatter, children }: Props) {
  const { name, avatar, specialties } = frontMatter
  const socialLinks = pick(frontMatter, socialKeys)

  return (
    <div className="w-full p-4 md:w-1/2" style={{ maxWidth: '544px' }}>
      <div className="flex flex-col h-full gap-6 p-6 overflow-hidden border-2 border-gray-200 rounded-md md:flex-row border-opacity-60 dark:border-gray-700">
        <img
          src={avatar}
          className="w-24 rounded h-auto self-start"
          alt={`Profile pic of ${name}`}
        />
        <div>
          <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">{name}</h2>
          <p className="flex flex-row flex-wrap items-start gap-2 mb-3 max-w-none">
            {specialties.map((specialty) => (
              <span
                key={specialty}
                className={`inline-block px-3 py-1 text-white rounded-full bg-${
                  specialtyColors[specialty] ?? 'green'
                }-800`}
              >
                {specialty}
              </span>
            ))}
          </p>
          <p className="mb-3 prose text-gray-500 max-w-none dark:text-gray-400">
            {children || <i>(Placeholder) Member of Project SEKAI.</i>}
          </p>
          <p className="mb-3">
            <SocialBar {...socialLinks} size={5} />
          </p>
        </div>
      </div>
    </div>
  )
}
