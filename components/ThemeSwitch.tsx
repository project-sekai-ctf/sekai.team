'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Button } from './ui/button'

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      aria-label="Toggle Dark Mode"
      variant="ghost"
      className="px-2"
      title="Toggle Dark Mode"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {mounted && theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}

export default ThemeSwitch
