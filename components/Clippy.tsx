import { useState } from 'react'
import { Tooltip } from 'react-tooltip'
import Image from 'next/image'

export default function Clippy () {
  const [clippyGif, setClippyGif] = useState('/clippy.gif')
  return (
    <>
      <div
        data-tooltip-id='my-tooltip'
        data-tooltip-content='Soy Clippy, tu asistente virtual!'
        data-tooltip-variant='info'
        className='overflow-hidden rounded-full border-4 border-blue-400'
        onMouseOver={() => {
          const isHover = clippyGif.includes('/clippy-hover.gif')
          if (isHover) return
          setClippyGif('/clippy-hover.gif')
          const interval = setTimeout(() => setClippyGif('/clippy.gif'), 7500)
          return () => clearTimeout(interval)
        }}
      >
        <Image
          className='object-cover aspect-square'
          height={100}
          width={100}
          src={clippyGif}
          alt='clippy'
        />
      </div>
      <Tooltip id='my-tooltip' place='top' />
    </>
  )
}
