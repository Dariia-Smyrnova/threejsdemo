"use client";
import { Suspense, useState } from 'react'

import RubberDucks from '@/app/components/Ducks'
// Comment the above and uncomment the following to import the WebGL BG lazily for faster loading times
// const Bananas = lazy(() => import('./Bananas'))

export default function DucksPage() {
  const [speed, set] = useState(2)
  return (
    <div className='absolute w-full h-full'>
      <Suspense fallback={null}>
        <RubberDucks speed={speed} />
      </Suspense>
    </div>
  )
}
