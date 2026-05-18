import { Button } from './ui/button'
import { ModeToggle } from './toggle-theme'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between py-4 border-b-2 bg-background sticky top-0">
      <Button variant="ghost" className="font-bold text-xl tracking-tight">
        SKILLSYNTH
      </Button>
      <div className="flex items-center lg:gap-2 gap-1 mr-2">
        <Button variant="outline"><Link href='/login'>Sign In</Link></Button>
        <Button variant="default"><Link href='/signup'>Get Started</Link></Button>
        <ModeToggle />
      </div>
    </nav>
  )
}
