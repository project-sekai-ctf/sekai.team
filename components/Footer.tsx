import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialBar from '@/components/SocialBar'

export default function Footer() {
  return (
    <footer>
      <div className="flex flex-col items-center mt-16">
        <div className="flex mb-3 space-x-4">
          <SocialBar
            size={6}
            email={siteMetadata.email}
            github={siteMetadata.github}
            facebook={siteMetadata.facebook}
            youtube={siteMetadata.youtube}
            linkedin={siteMetadata.linkedin}
            twitter={siteMetadata.twitter}
            ctftime={siteMetadata.ctftime}
            discord={siteMetadata.discord}
          />
        </div>
        <div className="flex mb-2 space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/">{siteMetadata.title}</Link>
          <div>{` • `}</div>
          <div>{`© ${new Date().getFullYear()}`}</div>
          <div>{` • `}</div>
          <div>
            <a href="https://1a23.com">1A23 Studio</a>
          </div>
        </div>
        <div className="mb-8 text-xs text-center text-gray-200 dark:text-gray-700">
          This website is in no way affiliated with any of the following individuals or
          organizations.
          <Link href="https://github.com/timlrx/tailwind-nextjs-starter-blog">
            Tailwind Nextjs Theme
          </Link>
          {' © Timothy Lim and contributors; '}
          <Link href="https://pjsekai.sega.jp/">
            Project SEKAI: Colorful Stage! feat. Hatsune Miku
          </Link>
          {' © SEGA / © Craft Egg Inc. Developed by Colorful Palette; '}
          <Link href="https://ec.crypton.co.jp/pages/prod/virtualsinger">
            Character Vocal Series
          </Link>
          {' © Crypton Future Media, INC. '}
          <Link href="https://www.piapro.net">www.piapro.net</Link>
          {' All rights reserved.'}
        </div>
      </div>
    </footer>
  )
}
