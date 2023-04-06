import { useState } from 'react'
import { FilePond } from 'react-filepond'
import Link from 'next/link'

import 'filepond/dist/filepond.min.css'

export default function Admin () {
  const [files, setFiles] = useState<any>([])
  return (
    <div className='h-screen flex flex-col justify-center items-center gap-10'>
      <Link href='/' className='text-white text-sm md:text-base flex gap-2 items-center absolute top-10 left-4 md:left-20 font-medium'>
        <h1>Pascal Assistant</h1>
        <span className="text-xs rounded px-1.5 py-0.5 bg-[rgba(0,187,255,.031)] text-[rgba(0,229,254,.824)] border-[rgba(2,200,255,.226)] inline-flex items-center justify-center border font-medium">
          Beta
        </span>
      </Link>
      <h1 className="text-white px-4 text-[55px] leading-[46px] font-bold text-center">
        SUBE TUS ARCHIVOS PDF
      </h1>
      <div className='px-4 w-full md:w-[500px]'>
        <FilePond
          files={files}
          onupdatefiles={setFiles}
          allowMultiple={true}
          allowReorder={true}
          maxFiles={3}
          server="/api/upload"
          name="pdfFile" /* sets the file input name, it's filepond by default */
          labelIdle='Arrastra los archivos o <span class="filepond--label-action">Examina</span>'
        />
      </div>
    </div>
  )
}
