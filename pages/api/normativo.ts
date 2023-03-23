// import fs from 'node:fs'
import { extractText } from 'office-text-extractor'
import { encode } from 'gpt-3-encoder'

import type { NextApiRequest, NextApiResponse } from 'next'
import type { PDFchunk, PDFparse } from '@/types'

const CHUNK_SIZE = 200

const getDataFromWord = async () => {
  const text = await extractText('./pdf/normativo-1.docx')

  return text
    .replace(/\s+/g, ' ')
    .trim()
}

const getChunks = (word: PDFparse) => {
  const { content, title, date } = word
  const pdfTextChuncks: string[] = []

  if (encode(content).length > CHUNK_SIZE) {
    const split = content.split('. ')
    let chunkText = ''

    for (let i = 0; i < split.length; i++) {
      const sentence = split[i]
      const sentenceTokensLength = encode(sentence).length
      const chunkTextTokenLength = encode(chunkText).length

      if (sentenceTokensLength + chunkTextTokenLength > CHUNK_SIZE) {
        pdfTextChuncks.push(chunkText.trim())
        chunkText = ''
      }

      if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
        console.log('matched')
        chunkText += sentence + '. '
      } else {
        console.log('not matched')
        chunkText += sentence + ' '
      }
    }

    pdfTextChuncks.push(chunkText.trim())
  } else {
    pdfTextChuncks.push(content.trim())
  }

  const pdfChunks: PDFchunk[] = pdfTextChuncks.map((chunk) => {
    return {
      content_tokens: encode(chunk).length,
      content: chunk,
      embedding: [],
      pdf_title: title,
      pdf_date: date
    }
  })

  if (pdfChunks.length > 1) {
    for (let i = 0; i < pdfChunks.length; i++) {
      const chunk = pdfChunks[i]
      const prevChunk = pdfChunks[i - 1]

      if (chunk.content_tokens < 100 && prevChunk) {
        prevChunk.content += ' ' + chunk.content
        prevChunk.content_tokens = encode(prevChunk.content).length
        pdfChunks.splice(i, 1)
      }
    }
  }

  const chunkedWord: PDFparse = {
    ...word,
    chunks: pdfChunks
  }

  return chunkedWord
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  let wordContent = await getDataFromWord()
  let title = 'No title'
  // Remove document index
  const normativo1Pattern = '1 PRESENTACIÓN'
  const normativo2Pattern = '1 INTRODUCCIÓN. En el Normativo Primero'

  let index = 0
  if (wordContent.includes(normativo1Pattern)) {
    title = 'Normativo 1'
    index = wordContent.indexOf(normativo1Pattern)
  } else if (wordContent.includes(normativo2Pattern)) {
    title = 'Normativo 2'
    index = wordContent.indexOf(normativo2Pattern)
  }

  if (index !== -1) {
    wordContent = wordContent.substring(index)
  }

  // const words: PDFparse[] = []
  // const parsed = getChunks({
  //   content: wordContent,
  //   title,
  //   date: '2020',
  //   tokens: encode(wordContent.trim()).length,
  //   chunks: []
  // })
  // words.push(parsed)
  // const json = {
  //   tokens: words.reduce((acc, curr) => acc + curr.tokens, 0),
  //   words
  // }

  // fs.writeFileSync('pdf/normativo2-pg.json', JSON.stringify(json))

  res.status(200).json({ wordContent, title })
}
