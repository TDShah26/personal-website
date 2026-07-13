import Hero from './components/Hero'
import Bio from './components/Bio'
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  return (
    <>
      <Hero />
      <Bio />
      <Analytics />
    </>
  )
}
