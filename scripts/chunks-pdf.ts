import pdf from 'pdf-parse'
import fs from 'node:fs'
import { encode } from 'gpt-3-encoder'

import type { PDFchunk, PDFJSON, PDFparse } from '@/types'

const months = {
  enero: '01',
  febrero: '02',
  marzo: '03',
  abril: '04',
  mayo: '05',
  junio: '06',
  julio: '07',
  agosto: '08',
  septiembre: '09',
  octubre: '10',
  noviembre: '11',
  diciembre: '12'
}
const CHUNK_SIZE = 200

const getDataFromPDF = async () => {
  const dataBuffer = fs.readFileSync('./docs/comunicado.pdf')

  const { text } = await new Promise<{ text: string }>((resolve) => {
    pdf(dataBuffer)
      .then(({ text }) => {
        resolve({ text })
      })
      .catch((err: any) => {
        console.log({ err })
        resolve({ text: 'Error ❌' })
      })
  })

  let pdfParse: PDFparse = {
    title: '',
    date: '',
    content: '',
    tokens: 0,
    chunks: []
  }

  const cleanedText = text
    .replace(/\s+/g, ' ')
    .trim()

  const { 8: day, 10: month, 12: year } = cleanedText.split(' ', 13)

  const removeFromPdf = cleanedText.split(' ', 13).slice(0, 13).join(' ')
  const textWithoutDate = cleanedText.replace(removeFromPdf, '')

  pdfParse = {
    title: cleanedText.split(' ', 3).join(' '),
    date: `${day}/${months[month as keyof typeof months]}/${year}`,
    content: textWithoutDate.trim(),
    tokens: encode(textWithoutDate.trim()).length,
    chunks: []
  }

  return pdfParse
}

const getChunks = (pdf: PDFparse) => {
  const { content, title, date } = pdf
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

      if (sentence[sentence.length - 1] && sentence.includes('DIRECTOR INSTITUTO PASCAL')) {
        chunkText += sentence + '. '
      } else {
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

  const chunkedPDF: PDFparse = {
    ...pdf,
    chunks: pdfChunks
  }

  return chunkedPDF
}

(async () => {
  try {
    const pdfPayload = await getDataFromPDF()

    const pdfs: PDFparse[] = []
    const parsed = getChunks(pdfPayload)
    pdfs.push(parsed)
    const json: PDFJSON = {
      tokens: pdfs.reduce((acc, curr) => acc + curr.tokens, 0),
      pdfs
    }

    fs.writeFileSync('docs/pg.json', JSON.stringify(json))
    console.log('Success ✔')
  } catch (e) {
    console.error(e)
  }
})()
