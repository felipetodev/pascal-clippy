// import fs from 'node:fs'
import { withFileUpload } from 'next-multiparty'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { PDFLoader } from 'langchain/document_loaders'
import { OpenAIEmbeddings } from 'langchain/embeddings'
import { SupabaseVectorStore } from 'langchain/vectorstores'
import { supabase } from '@/utils/supabase'

export const config = {
  api: {
    bodyParser: false
  }
}

export default withFileUpload(async (req, res) => {
  const pdfFile = req.file
  if (!pdfFile) {
    return res.status(400).send('No file uploaded')
  }

  const loader = new PDFLoader(pdfFile.filepath)
  const rawDocs = await loader.load()
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  })
  const docs = await textSplitter.splitDocuments(rawDocs)

  // fs.writeFileSync('docs/pg.json', JSON.stringify(docs))

  console.log('creating embeddings...')
  const resp = await SupabaseVectorStore.fromDocuments(docs, new OpenAIEmbeddings(), {
    client: supabase,
    tableName: 'documents',
    queryName: 'match_documents'
  })
  console.log('embeddings successfully stored in supabase')
  console.log(resp)

  res.status(200).json({ success: true })
})
