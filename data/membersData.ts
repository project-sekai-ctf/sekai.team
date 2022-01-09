import { SocialBarProps } from '@/components/SocialBar'

export interface MemberData {
  name: string
  description: string
  gravatarHash: string,
  specialties: string[]
  socialLinks: Partial<SocialBarProps>
}

const membersData: MemberData[] = [
  {
    name: 'sahuang',
    description: '',
    specialties: ['Crypto', 'OSINT'],
    gravatarHash: '00000000000000000000000000000000',
    socialLinks: {
      github: 'https://github.com/sahuang',
      linkedin: 'https://www.linkedin.com/in/xiaohai-xu-1a8884138/',
      hackerearth: 'https://www.hackerearth.com/@sahuang',
    },
  },
  {
    name: 'Eana Hufwe',
    description: 'Maintainer of the website.',
    specialties: ['Misc', 'Web'],
    gravatarHash: 'bee48ae645948fe70368ae0fb73ee2b2',
    socialLinks: {
      web: 'https://1a23.com/',
      twitter: 'https://twitter.com/blueset',
      github: 'https://github.com/blueset',
    },
  },
  {
    name: 'michael',
    description: '',
    specialties: ['Crypto', 'Pwn'],
    gravatarHash: '00000000000000000000000000000001',
    socialLinks: {},
  },
]

export default membersData
