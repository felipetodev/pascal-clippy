export type PDFparse = {
  title: string
  date: string
  content: string
  tokens: number
  chunks: PDFchunk[]
}

export type PDFchunk = {
  pdf_title: string
  pdf_date: string
  content: string
  content_tokens: number
  embedding: number[]
}

export type PDFJSON = {
  tokens: number
  pdfs: PDFparse[]
}

export type LangType = 'Español' | 'Inglés' | 'Chino' | 'Ruso' | 'Italiano'
