import { type ClassValue, clsx } from 'clsx'
import {
  Gavel,
  Puzzle,
  Terminal,
  Lock,
  Fingerprint,
  Coins,
  Globe,
  HelpCircle,
  View,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const specialtyColors = {
  pwn: 'rose',
  fullpwn: 'red',
  reverse: 'orange',
  crypto: 'yellow',
  forensics: 'emerald',
  blockchain: 'cyan',
  web: 'sky',
  misc: 'fuchsia',
  osint: 'gray',
}

export const specialtyIcons = {
  pwn: Gavel,
  fullpwn: Terminal,
  reverse: Puzzle,
  crypto: Lock,
  forensics: Fingerprint,
  blockchain: Coins,
  web: Globe,
  misc: HelpCircle,
  osint: View,
}
