import { SocialBarProps } from '@/components/SocialBar'

export interface MemberData {
  name: string
  description: string
  gravatarHash: string
  specialties: string[]
  socialLinks: Partial<SocialBarProps>
}

const membersData: MemberData[] = [
  {
    name: 'sahuang',
    description: 'Rhythm Gamer',
    specialties: ['Crypto', 'OSINT'],
    gravatarHash: '740255f8ddc8f903d3addafb219ea077',
    socialLinks: {
      github: 'https://github.com/sahuang',
      linkedin: 'https://www.linkedin.com/in/xiaohai-xu-1a8884138/',
      hackerearth: 'https://www.hackerearth.com/@sahuang',
    },
  },
  {
    name: 'Eana',
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
    name: 'Michael Zhang',
    description: 'Associate Researcher at SIFT',
    specialties: ['Crypto', 'Pwn'],
    gravatarHash: '00000000000000000000000000000001',
    socialLinks: {
      twitter: 'https://twitter.com/_mzhang',
    },
  },
  {
    name: 'msimonelli',
    description:
      'hi! im marco. im a c++ dev and reverse engineer in my spare time, with the occasional sprinkling of pwn on the side',
    specialties: ['Reverse', 'Pwn'],
    gravatarHash: '00000000000000000000000000000002',
    socialLinks: {
      github: 'https://github.com/m-simonelli',
    },
  },
  {
    name: 'FLUX',
    description: 'Full Stack MERN + LAMP Developer | Geek | Web3 & Security Enthusiast',
    specialties: ['Web', 'Forensics'],
    gravatarHash: '00000000000000000000000000000003',
    socialLinks: {
      github: 'https://github.com/pjflux2001',
    },
  },
  {
    name: 'wlaasmi',
    description: '3+ years of experience in cybersecurity working in France',
    specialties: ['Web', 'Misc'],
    gravatarHash: '00000000000000000000000000000004',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/walid-laasmi-374abb13a/',
      github: 'https://github.com/jedai47/',
    },
  },
]

export default membersData
