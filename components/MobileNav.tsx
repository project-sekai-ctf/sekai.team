'use client'

import headerNavLinks from '@/data/headerNavLinks'
import { Menu } from 'lucide-react'

import Link from './Link'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const MobileNav = () => {
  return (
    <DropdownMenu modal={false}>
      {/* @ts-ignore */}
      <DropdownMenuTrigger asChild>
        <Button
          className="p-2 sm:hidden"
          aria-label="Toggle menu"
          variant="ghost"
        >
          <span className="sr-only">Toggle menu</span>
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      {/* @ts-ignore */}
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {headerNavLinks.map((link) => (
          // @ts-ignore
          <DropdownMenuItem key={link.title} asChild>
            <Link href={link.href} className="flex items-center gap-4">
              {/* {link.icon} */}
              <div>{link.title}</div>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MobileNav
