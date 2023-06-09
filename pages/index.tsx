import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import DropDown from '@/components/DropDown'
import Clippy from '@/components/Clippy'
import { Toaster, toast } from 'sonner'
import ReactMarkdown from 'react-markdown'

import type { LangType, PDFchunk } from '@/types'

const AudioButton = dynamic(async () => await import('@/components/AudioButton'), { ssr: false })

export default function Home () {
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<LangType>('Español')
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [whisper, setWhisper] = useState(false)
  // const [chunk, setChunk] = useState<PDFchunk[]>([])

  const bioRef = useRef<null | HTMLDivElement>(null)

  const scrollToBios = () => {
    if (bioRef.current !== null) {
      bioRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleAnswer = async () => {
    if (!query) {
      return toast.error('Debes escribir una pregunta')
    }
    setLoading(true)
    setAnswer('')
    const searchReponse = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    })

    if (!searchReponse.ok) {
      setLoading(false)
      console.error('Error searching')
    }

    const results: PDFchunk[] = await searchReponse.json()
    // setChunk(results)

    const answerResponse = await fetch('/api/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chunks: results,
        query
      })
    })

    if (!answerResponse.ok) {
      setLoading(false)
      console.error('Error answering')
    }

    const data = answerResponse.body

    if (!data) {
      setLoading(false)
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)
      setAnswer((prev) => prev + chunkValue)
    }
    scrollToBios()
    setLoading(false)
  }

  const getWhisperResponse = async (recording: Blob) => {
    setLoading(true)
    setWhisper(false)
    const formData = new FormData()
    formData.append('file', recording, 'audio.wav')

    try {
      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData
      })
      if (response.ok) {
        const { text } = await response.json()
        setQuery(text)
        setWhisper(true)
      }
    } catch (e) {
      setLoading(false)
      return toast.error('Ocurrió un error al procesar tu audio, intenta escribiendo tu pregunta')
    }
  }

  // refact this pls :(
  useEffect(() => {
    if (!whisper) return
    handleAnswer()
  }, [whisper])

  return (
    <>
      <Head>
        <title>Pascal Assistant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <div className='flex flex-col lg:flex-row gap-5 items-center'>
          <h1 className="sm:text-6xl text-4xl max-w-[750px] font-bold text-blue-400">
            Instituto Pascal Assistant
          </h1>
          <Clippy />
        </div>
        <p className="text-blue-300 m-2 font-medium">Powered by ChatGPT.</p>
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <p className="text-left font-medium text-blue-200">
              Selecciona si deseas tu respuesta en algún idioma en específico:
            </p>
          </div>
          <div className="block mt-5">
            <DropDown language={language} setLanguage={(lang) => setLanguage(lang)} />
          </div>
          <div className="flex mt-5 items-center space-x-3">
            <p className="text-left font-medium text-blue-200">
              ¿Como puedo ayudarte?{' '}
              <span className="text-blue-300">
                (escribe la duda que tengas acerca nuestro proyecto educativo)
              </span>
              .
            </p>
          </div>
          <div className='relative my-5'>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              className="py-4 px-4 font-medium text-gray-700 w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder={
                'Ej: ¿Cuáles son los requisitos para inscribirme en un taller?'
              }
            />
            <AudioButton getWhisperResponse={getWhisperResponse} />
          </div>

          {!loading && (
            <button
              className="bg-blue-500 rounded-xl text-white font-bold px-4 py-2 sm:mt-10 mt-8 hover:bg-blue-400/80 w-full"
              onClick={handleAnswer}
            >
              Preguntar a Pascal &rarr;
            </button>
          )}
          {loading && (
            <button
              className="flex items-center justify-center bg-blue-400 rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-blue-400/80 w-full"
              disabled
            >
              {answer.length > 1 ? 'Respondiendo' : 'Pensando'}{' '}
              <div className="ml-4 dot-pulse w-full">
                <div className="dot-pulse__dot" />
              </div>
            </button>
          )}
        </div>
        <hr className="h-px mb-10 bg-gray-700 border-1 dark:bg-gray-700" />
        {answer.length > 0 && (
          <div className="space-y-10 mb-10 max-w-2xl w-full bg-blue-600 rounded-lg p-4 pb-6">
            <>
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-white mx-auto"
                  ref={bioRef}
                >
                  Pascal respuesta:
                </h2>
              </div>
              <ReactMarkdown
                className='text-lg text-white text-left'
                components={{
                  p: ({ node, ...props }) => <p className='my-2 inline' {...props} />,
                  ul: ({ node, ...props }) => <ul className='list-disc list-inside' {...props} />,
                  li: ({ node, ...props }) => <li className='my-2' {...props} />
                }}
              >
                {answer.replaceAll('. ', '.\n\n')}
              </ReactMarkdown>
            </>
          </div>
        )}
        <Toaster />
      </div>
    </>
  )
}
