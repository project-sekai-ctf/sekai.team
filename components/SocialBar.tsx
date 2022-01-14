import SocialIcon from '@/components/social-icons'

export const socialKeys = [
  'email',
  'github',
  'facebook',
  'youtube',
  'linkedin',
  'twitter',
  'ctftime',
  'discord',
  'web',
  'hackerearth',
] as const

export type SocialBarProps = {
  [key in typeof socialKeys[number]]?: string
} & {
  size?: number
}

const SocialBar = ({
  email,
  github,
  facebook,
  youtube,
  linkedin,
  twitter,
  ctftime,
  discord,
  web,
  hackerearth,
  size,
}: SocialBarProps) => {
  return (
    <div className="flex mb-3 space-x-4">
      <SocialIcon kind="web" href={web} size={size ?? 6} />
      <SocialIcon kind="mail" href={`mailto:${email}`} size={size ?? 6} />
      <SocialIcon kind="github" href={github} size={size ?? 6} />
      <SocialIcon kind="facebook" href={facebook} size={size ?? 6} />
      <SocialIcon kind="youtube" href={youtube} size={size ?? 6} />
      <SocialIcon kind="linkedin" href={linkedin} size={size ?? 6} />
      <SocialIcon kind="twitter" href={twitter} size={size ?? 6} />
      <SocialIcon kind="ctftime" href={ctftime} size={size ?? 6} />
      <SocialIcon kind="discord" href={discord} size={size ?? 6} />
      <SocialIcon kind="hackerearth" href={hackerearth} size={size ?? 6} />
    </div>
  )
}

export default SocialBar
