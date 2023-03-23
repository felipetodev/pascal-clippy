import fs from 'node:fs'
import { Configuration, OpenAIApi } from 'openai'
import { createClient } from '@supabase/supabase-js'
import { loadEnvConfig } from '@next/env'

import type { PDFparse, PDFJSON } from '@/types'

loadEnvConfig('')

const {
  OPENAI_API_KEY = '',
  SUPABASE_URL = '',
  SUPABASE_SERVICE_ROLE_KEY = ''
} = process.env

const generateEmbeddings = async (pdfs: PDFparse[]) => {
  const config = new Configuration({ apiKey: OPENAI_API_KEY })
  const openai = new OpenAIApi(config)

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  for (let i = 0; i < pdfs.length; i++) {
    const pdf = pdfs[i]
    for (let j = 0; j < pdf.chunks.length; j++) {
      const chunk = pdf.chunks[j]
      console.log(chunk)

      const embeddingRequest = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: chunk.content
      })

      const [{ embedding }] = embeddingRequest.data.data

      const { error } = await supabase
        .from('united_pdfs')
        .insert({
          pdf_title: chunk.pdf_title,
          pdf_date: chunk.pdf_date,
          content: chunk.content,
          content_tokens: chunk.content_tokens,
          embedding
        })
        .select('*')

      if (error) {
        console.log(error)
      } else {
        console.log('Saved ✔', i, j)
      }

      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }
}

(async () => {
  const json: PDFJSON = JSON.parse(fs.readFileSync('pdf/normativo1-pg.json', 'utf-8'))
  await generateEmbeddings(json.pdfs)
  console.log('DB ✔')
})()
