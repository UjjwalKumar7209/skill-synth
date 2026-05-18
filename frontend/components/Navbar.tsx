'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import { ModeToggle } from './toggle-theme'
import { useAuth } from '@/context/auth-context'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <nav className="flex items-center justify-between py-4 border-b-2 bg-background sticky top-0">
      <Button variant="ghost" className="font-bold text-xl tracking-tight">
        SKILLSYNTH
      </Button>
      <div className="flex items-center lg:gap-2 gap-1 mr-2">
        {!isAuthenticated ? (
          <>
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="default" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="default" onClick={logout}>
              Logout
            </Button>
          </>
        )}
        <ModeToggle />
      </div>
    </nav>
  )
}
