'use client'

import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import FullLogo from '@/data/fullLogo.svg'
import FullLogoDark from '@/data/fullLogoDark.svg'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import Link from './Link'
import { Button } from './ui/button'
import { usePathname } from 'next/navigation'

const Header = () => {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header className="flex items-center justify-between py-10">
      <div>
        {isHome ? (
          <Link href="/" aria-label="Visit home page">
            <div className="flex items-center justify-between">
              <div className="mr-3">
                <Logo height={50} width="auto" />
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/" aria-label="Visit home page">
            <div className="flex items-center justify-between">
              <div className="mr-3 hidden dark:block">
                <FullLogo height={80} width="auto" />
              </div>
              <div className="mr-3 block dark:hidden">
                <FullLogoDark height={80} width="auto" />
              </div>
            </div>
          </Link>
        )}
      </div>
      <div className="flex items-center text-base leading-5">
        <div className="mr-1 hidden sm:flex sm:gap-1">
          {headerNavLinks.map((link) => (
            <Link key={link.title} href={link.href}>
              <Button variant="ghost">{link.title}</Button>
            </Link>
          ))}
        </div>
        <div className="flex gap-1">
          <ThemeSwitch />
          <SearchButton />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

export default Header
