import { Tooltip } from 'react-tooltip'
import Image from 'next/image'

export default function Clippy () {
  return (
    <>
      <div
        data-tooltip-id='my-tooltip'
        data-tooltip-content='Soy Pascal, tu asistente virtual!'
        data-tooltip-variant='info'
        className='overflow-hidden rounded-full border-4 border-blue-400'
      >
        <Image
          className='object-cover aspect-square'
          height={100}
          width={100}
          src='/pascal.jpg'
          alt='clippy'
        />
      </div>
      <Tooltip id='my-tooltip' place='top' />
    </>
  )
}
