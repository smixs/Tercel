import { Tektur } from 'next/font/google'
import { Warnes } from 'next/font/google'

export const tektur = Tektur({
  weight: '400',  // Tektur имеет только вес 400
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-Tektur',
}) 

export const warnes = Warnes({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-warnes',
}) 