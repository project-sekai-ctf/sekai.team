import Mail from './mail.svg'
import Github from './github.svg'
import Facebook from './facebook.svg'
import Youtube from './youtube.svg'
import Linkedin from './linkedin.svg'
import Twitter from './twitter.svg'
import CTFTime from './ctftime.svg'
import Discord from './discord.svg'
import Web from './web.svg'
import HackerEarth from './hackerearth.svg'
import Codeforces from './codeforces.svg'

// Icons taken from: https://simpleicons.org/

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  ctftime: CTFTime,
  discord: Discord,
  hackerearth: HackerEarth,
  codeforces: Codeforces,
  web: Web,
}

const SocialIcon = ({ kind, href, size = 8 }) => {
  if (!href || (kind === 'mail' && !/^mailto:\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/.test(href)))
    return null

  const SocialSvg = components[kind]

  return (
    <a
      className="text-sm text-gray-500 transition hover:text-gray-600"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      <span className="sr-only">
        <span className="w-6">{kind}</span>
      </span>
      <SocialSvg
        className={`fill-current text-gray-700 w-${size} h-${size} dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400`}
      />
    </a>
  )
}

export default SocialIcon
