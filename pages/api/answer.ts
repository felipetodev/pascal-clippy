import { OpenAIStream } from '@/utils/OpenAIStream'

import { type PDFchunk } from '@/types'

export const config = {
  runtime: 'edge'
}

export default async function handler (
  req: Request
) {
  try {
    const { chunks, query } = await req.json() as { chunks: PDFchunk[], query: string }

    const stream = await OpenAIStream(chunks, query)

    return new Response(stream, { status: 200 })
  } catch (err) {
    return new Response('error', { status: 500 })
  }
}
