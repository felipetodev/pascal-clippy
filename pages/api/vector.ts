import { makeChain } from '@/utils/makechain'
import { supabase } from '@/utils/supabase'
import { OpenAIEmbeddings } from 'langchain/embeddings'
import { SupabaseVectorStore } from 'langchain/vectorstores'
import { type NextApiRequest, type NextApiResponse } from 'next'

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, history } = await req.body as { query: string, history: string[] }

  const vectorStore = await SupabaseVectorStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    {
      client: supabase,
      tableName: 'documents',
      queryName: 'match_documents'
    }
  )

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive'
  })

  const sendData = (data: string) => {
    res.write(`data: ${data}\n\n`)
  }

  sendData(JSON.stringify({ data: '' }))

  const chain = makeChain(vectorStore, (token: string) => {
    sendData(JSON.stringify({ data: token }))
  })

  try {
    const { text } = await chain.call({
      question: query,
      chat_history: history || []
    })

    console.log('🐢', text)
    sendData(JSON.stringify({ text }))
  } catch (error) {
    console.log('error', error)
  } finally {
    sendData('[DONE]')
    res.end()
  }
}
